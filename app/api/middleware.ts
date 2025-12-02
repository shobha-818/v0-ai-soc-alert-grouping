import { type NextRequest, NextResponse } from "next/server"

export async function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest,
): Promise<NextResponse> {
  try {
    const apiKey = req.headers.get("x-api-key")
    const validKeys = (process.env.API_KEYS || "").split(",").filter(Boolean)

    // Allow requests without auth if no keys configured (development)
    if (validKeys.length > 0 && (!apiKey || !validKeys.includes(apiKey))) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid or missing API key" }, { status: 401 })
    }

    return await handler(req)
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export function withRateLimit(maxRequests = 10, windowMs = 60000) {
  return async (handler: (req: NextRequest) => Promise<NextResponse>, req: NextRequest): Promise<NextResponse> => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const requestCounts = new Map<string, { count: number; resetTime: number }>()
    const now = Date.now()
    const existing = requestCounts.get(ip)

    if (!existing || now > existing.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    } else if (existing.count >= maxRequests) {
      return NextResponse.json({ error: "Rate limit exceeded", details: "Too many requests" }, { status: 429 })
    } else {
      existing.count++
    }

    return await handler(req)
  }
}
