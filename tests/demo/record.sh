#!/usr/bin/env bash
# One-command demo recorder. Forges a session cookie (trading-system venv) and
# runs a scenario, which records a WebM and converts it to MP4 (the deliverable).
#
# Usage:
#   ./record.sh <scenario> [--tier premium|heatmap|pro_bundle] [--customer cus_…] [--rehearse]
# Examples:
#   ./record.sh watchlist-overview
#   ./record.sh watchlist-overview --tier heatmap
#   ./record.sh watchlist-overview --rehearse      # verify selectors, no recording
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VENV=/opt/trading-system/venv/bin/python3

[ $# -ge 1 ] || { echo "usage: ./record.sh <scenario> [--tier T] [--customer C] [--rehearse]"; exit 1; }
SCENARIO="$1"; shift
TIER="premium"; CUSTOMER=""; PASS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --tier) TIER="$2"; shift 2 ;;
    --customer) CUSTOMER="$2"; shift 2 ;;
    *) PASS+=("$1"); shift ;;
  esac
done

SCRIPT="$HERE/scenarios/$SCENARIO.cjs"
[ -f "$SCRIPT" ] || { echo "no scenario: $SCRIPT"; echo "available:"; ls "$HERE/scenarios" 2>/dev/null; exit 1; }

PB_SESSION_COOKIE="$("$VENV" "$HERE/forge-session.py" --tier "$TIER" ${CUSTOMER:+--customer "$CUSTOMER"})"
export PB_SESSION_COOKIE
echo "[record] scenario=$SCENARIO tier=$TIER ${CUSTOMER:+customer=$CUSTOMER} ${PASS[*]:-}"
cd /opt/pb-marketing
node "$SCRIPT" ${PASS[@]+"${PASS[@]}"}
