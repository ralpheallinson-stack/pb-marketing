// Shared types for the GEX scanner refresh (Mockup v6).
// Mirrors the /api/scanner/gex-heatmap response
// (web/queries.py::_gex_heatmap_internal). Extracted from the inline type
// that lived in scanner/page.tsx so the gex/ components can share it.

export interface GexCell {
  net_gex: number;
  call_oi: number;
  put_oi: number;
  has_greeks?: boolean;
}

export interface GexWallNode {
  strike: number;
  gex: number;
}

export interface GexTopCell {
  strike: number;
  expiry: string;
  net_gex: number;
}

export interface GexSnapshot {
  symbol: string;
  spot: number;
  spot_fmt: string;
  expirations: string[];
  strikes: number[];
  matrix: Record<string, Record<string, GexCell>>;
  max_abs_gex: number;
  zero_gamma_strike: number | null;
  gamma_flip: number | null;
  total_net_gex: number;
  total_call_gex: number;
  total_put_gex: number;
  near_dte_gex: number;
  far_dte_gex: number;
  gamma_slope: number | null;
  slope_strike: number | null;
  max_plus_gex: GexWallNode | null;
  max_minus_gex: GexWallNode | null;
  prev_close: number | null;
  spot_change: number | null;
  spot_change_pct: number | null;
  top_cells: GexTopCell[];
}
