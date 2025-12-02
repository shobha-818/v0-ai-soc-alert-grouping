import { type NextRequest, NextResponse } from "next/server"
import { getGroupWithMembers } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const alertId = Number.parseInt(id)

    if (isNaN(alertId)) {
      return NextResponse.json({ success: false, error: "Invalid alert ID" }, { status: 400 })
    }

    const group = await getGroupWithMembers(alertId)
    return NextResponse.json({
      success: true,
      data: group,
    })
  } catch (error) {
    console.error("[v0] Error fetching alert details:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alert details" }, { status: 500 })
  }
}
