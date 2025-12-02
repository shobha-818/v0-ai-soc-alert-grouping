import { headers } from "next/headers"

// Simple API key validation - in production, use a proper auth system
const VALID_API_KEYS = (process.env.API_KEYS || "").split(",").filter(Boolean)

export interface AuthContext {
  isValid: boolean
  apiKey?: string
  error?: string
}

export async function validateApiKey(): Promise<AuthContext> {
  try {
    const headersList = await headers()
    const apiKey = headersList.get("x-api-key")

    // If no API keys configured, allow access (development mode)
    if (VALID_API_KEYS.length === 0) {
      console.warn("[v0] No API keys configured - running in development mode")
      return { isValid: true }
    }

    // If API keys are configured, require valid key
    if (!apiKey) {
      return {
        isValid: false,
        error: "Missing X-API-Key header",
      }
    }

    if (!VALID_API_KEYS.includes(apiKey)) {
      return {
        isValid: false,
        error: "Invalid API key",
      }
    }

    return { isValid: true, apiKey }
  } catch (error) {
    console.error("[v0] Auth validation error:", error)
    return {
      isValid: false,
      error: "Authentication failed",
    }
  }
}

// Generate a simple API key for testing
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = "sk_"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
