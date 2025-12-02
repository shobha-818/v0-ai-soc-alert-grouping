import { type NextRequest, NextResponse } from "next/server"
import { getAlerts, getAlertStats } from "@/lib/db"
import { validatePageParams } from "@/lib/security"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const { limit, offset } = validatePageParams(
      searchParams.get("limit") || undefined,
      searchParams.get("offset") || undefined,
    )

    const alerts = await getAlerts(limit, offset)
    const stats = await getAlertStats()

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        stats,
        pagination: {
          limit,
          offset,
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/alerts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}
