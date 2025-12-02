// Input validation and sanitization utilities

export function validateAlertInput(alerts: unknown): boolean {
  if (!Array.isArray(alerts)) return false
  if (alerts.length === 0 || alerts.length > 10000) return false

  return alerts.every((alert) => {
    if (typeof alert !== "string") return false
    if (alert.length === 0 || alert.length > 5000) return false
    return true
  })
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters while preserving alert content
  return input
    .slice(0, 5000) // Limit length
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .trim()
}

export function validatePageParams(limit?: string, offset?: string) {
  const parsedLimit = Number.parseInt(limit || "100", 10)
  const parsedOffset = Number.parseInt(offset || "0", 10)

  // Validate bounds
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) return { limit: 100, offset: 0 }
  if (isNaN(parsedOffset) || parsedOffset < 0) return { limit: parsedLimit, offset: 0 }

  return { limit: parsedLimit, offset: parsedOffset }
}

// Rate limiting implementation
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const existing = requestCounts.get(identifier)

  if (!existing || now > existing.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (existing.count >= maxRequests) {
    return false
  }

  existing.count++
  return true
}
