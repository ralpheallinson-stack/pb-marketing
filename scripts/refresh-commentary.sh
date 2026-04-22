#!/usr/bin/env bash
# refresh-commentary.sh — export latest ticker_spotlight commentary from
# pb-flow and rebuild pb-marketing only if the content actually changed.
#
# Run from cron on weekdays at windows aligned to pb-flow's content cycle:
#   10:30 ET — after morning_read + big_print have fired
#   13:00 ET — after sector_spotlight + pattern_callback
#   16:30 ET — after daily_tape (end of session)
#   18:30 ET — after educational + receipt (evening content)
#
# Idempotent: if the export produces the same JSON as last time, skip the
# rebuild. That prevents burning build cycles when pb-flow hasn't regenerated
# any new ticker_spotlight content yet.
#
# Concurrency: flock on a lock file so overlapping cron fires can't collide.

set -euo pipefail

MARKETING_DIR="/opt/pb-marketing"
COMMENTARY_JSON="$MARKETING_DIR/data/ticker-commentary.json"
LOCK_FILE="/var/lock/pb-marketing-refresh.lock"
LOG_DIR="/var/log/pb-marketing"
LOG_FILE="$LOG_DIR/commentary-refresh.log"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"
}

(
  # Try to acquire an exclusive lock; fail fast if another run is in progress.
  flock -n 9 || { log "SKIP — another refresh is already running"; exit 0; }

  cd "$MARKETING_DIR"

  # Hash only the `tickers` payload, not the envelope — the envelope contains
  # `generated_at` which changes every run and would defeat idempotency.
  hash_tickers() {
    python3 -c "import json,sys,hashlib; d=json.load(open(sys.argv[1])); print(hashlib.sha256(json.dumps(d.get('tickers',{}),sort_keys=True).encode()).hexdigest())" "$1"
  }

  PREV_HASH=""
  if [ -f "$COMMENTARY_JSON" ]; then
    PREV_HASH="$(hash_tickers "$COMMENTARY_JSON")"
  fi

  # Run the export script.
  if ! node scripts/export-ticker-commentary.mjs >> "$LOG_FILE" 2>&1; then
    log "EXPORT FAILED — see log above"
    exit 1
  fi

  NEW_HASH="$(hash_tickers "$COMMENTARY_JSON")"

  if [ "$PREV_HASH" = "$NEW_HASH" ]; then
    log "NO CHANGE — commentary identical to previous export, skipping rebuild"
    exit 0
  fi

  log "CHANGED — commentary updated (prev ${PREV_HASH:0:8} new ${NEW_HASH:0:8}), rebuilding pb-marketing"

  # Rebuild. Pipe to log so cron doesn't spam stderr.
  if ! npm run build >> "$LOG_FILE" 2>&1; then
    log "BUILD FAILED — see log above"
    exit 2
  fi

  log "OK — rebuild complete"
) 9>"$LOCK_FILE"
