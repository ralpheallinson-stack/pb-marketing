import type { Metadata } from "next"
import type { ReactNode } from "react"

// Secondary client-rendered viewer — the indexable entry point is /cheat-sheet.
export const metadata: Metadata = {
  robots: { index: false },
}

export default function CheatSheetViewLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
