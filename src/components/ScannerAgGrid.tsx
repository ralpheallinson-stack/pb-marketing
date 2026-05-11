"use client"

import { useEffect, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
  colorSchemeDarkWarm,
} from "ag-grid-community"

/**
 * ScannerAgGrid — Phase 1 parallel render harness.
 *
 * Empty grid that mounts behind ?ag=1 / pb_scanner_ag_grid localStorage
 * to verify AG Grid v35 boots under React 19.2 + Next 16.2 without
 * disturbing the legacy custom-table render path. No column defs, no
 * data binding, no SSE integration, no styling pass — those land in
 * Phases 2-7 per project_pb_scanner_ag_grid_migration_design.md §D.
 *
 * Theming uses the v35 JS Theming API (theme={} prop on AgGridReact)
 * rather than the legacy CSS-class approach — the CSS theme files
 * (ag-theme-alpine.css etc.) were removed in v33+.
 *
 * colorSchemeDarkWarm picked to match PB's warm body color (#1C1C1E)
 * better than plain colorSchemeDark. Phase 7 will replace this with
 * a custom withParams() override that exactly matches PB's tokens.
 */

// Register Community modules once at module load. Required in v33+;
// without this the grid logs "Module not registered" warnings per cell.
ModuleRegistry.registerModules([AllCommunityModule])

interface HarnessRow {
  placeholder?: string
}

export function ScannerAgGrid() {
  const theme = useMemo(() => themeAlpine.withPart(colorSchemeDarkWarm), [])

  useEffect(() => {
    console.info("[scanner-ag] Phase 1 harness mounted")
  }, [])

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <AgGridReact<HarnessRow>
        theme={theme}
        columnDefs={[
          { headerName: "Phase 1 Harness", field: "placeholder" },
        ]}
        rowData={[]}
      />
    </div>
  )
}
