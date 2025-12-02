import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const sessions = await sql`
      SELECT * FROM sessions 
      ORDER BY created_at DESC 
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      sessions,
    })
  } catch (error) {
    console.error("[v0] Error fetching sessions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 })
  }
}
