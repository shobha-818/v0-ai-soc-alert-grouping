import { type NextRequest, NextResponse } from "next/server"
import { getAlertGroups, getGroupWithMembers } from "@/lib/db"
import { validatePageParams } from "@/lib/security"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const { limit, offset } = validatePageParams(
      searchParams.get("limit") || undefined,
      searchParams.get("offset") || undefined,
    )
    const groupId = searchParams.get("id")

    if (groupId) {
      const parsedId = Number.parseInt(groupId, 10)
      if (isNaN(parsedId) || parsedId < 1) {
        return NextResponse.json({ success: false, error: "Invalid group ID" }, { status: 400 })
      }
      const group = await getGroupWithMembers(parsedId)
      return NextResponse.json({
        success: true,
        data: group,
      })
    }

    const groups = await getAlertGroups(limit, offset)
    return NextResponse.json({
      success: true,
      data: {
        groups,
        pagination: { limit, offset },
      },
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/groups:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch groups" }, { status: 500 })
  }
}
