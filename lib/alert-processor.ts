export interface RawAlert {
  message: string
  timestamp?: string
  source?: string
  severity?: string
}

export interface ProcessedAlert extends RawAlert {
  id: string
  cleaned_message: string
  keywords: string[]
  threat_category: string
  confidence_score: number
}

/**
 * Parse CSV content into alert objects
 */
export function parseCSV(csvContent: string): RawAlert[] {
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Skip header if present
  const startIndex = lines[0].toLowerCase() === "alert" ? 1 : 0

  return lines.slice(startIndex).map((line) => ({
    message: line,
    timestamp: new Date().toISOString(),
    source: "imported",
  }))
}

/**
 * Clean and normalize alert messages
 */
export function cleanAlert(message: string): string {
  return message
    .toLowerCase()
    .replace(/[^\w\s\-.:$$$$]/g, "") // Remove special chars except basic ones
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}

/**
 * Extract keywords from alert message
 */
export function extractKeywords(message: string): string[] {
  const keywords = new Set<string>()
  const commonKeywords = [
    "failed",
    "login",
    "attempt",
    "suspicious",
    "malware",
    "injection",
    "sql",
    "phishing",
    "email",
    "unauthorized",
    "admin",
    "access",
    "ssh",
    "host",
    "pc",
    "link",
    "detected",
    "multiple",
    "attempts",
    "download",
    "endpoint",
    "alert",
    "ip",
    "address",
    "user",
    "password",
    "breach",
    "vulnerability",
    "exploit",
    "attack",
    "threat",
    "incident",
  ]

  const words = message.toLowerCase().split(/\s+/)
  words.forEach((word) => {
    const cleaned = word.replace(/[^\w]/g, "")
    if (commonKeywords.includes(cleaned) && cleaned.length > 2) {
      keywords.add(cleaned)
    }
  })

  return Array.from(keywords)
}

/**
 * Categorize alert based on threat type
 */
export function categorizeThreat(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes("malware") || lower.includes("virus") || lower.includes("trojan")) {
    return "Malware"
  }
  if (lower.includes("sql") || lower.includes("injection") || lower.includes("xss")) {
    return "Injection Attack"
  }
  if (lower.includes("failed") || lower.includes("login") || lower.includes("password") || lower.includes("ssh")) {
    return "Authentication"
  }
  if (lower.includes("phishing") || lower.includes("email") || lower.includes("link")) {
    return "Phishing"
  }
  if (lower.includes("unauthorized") || lower.includes("admin") || lower.includes("access")) {
    return "Unauthorized Access"
  }
  if (lower.includes("network") || lower.includes("firewall") || lower.includes("port")) {
    return "Network"
  }
  if (lower.includes("anomaly") || lower.includes("unusual") || lower.includes("suspicious")) {
    return "Anomaly Detection"
  }

  return "Other"
}

/**
 * Calculate confidence score based on alert characteristics
 */
export function calculateConfidenceScore(message: string): number {
  let score = 0.5 // Base score

  // Increase score for specific threat indicators
  const threatIndicators = ["malware", "attack", "breach", "exploit", "vulnerability"]
  const urgencyKeywords = ["critical", "severe", "high", "immediate"]
  const sourceIndicators = ["firewall", "ids", "edr", "siem", "endpoint"]

  const lower = message.toLowerCase()

  threatIndicators.forEach((indicator) => {
    if (lower.includes(indicator)) score += 0.1
  })

  urgencyKeywords.forEach((keyword) => {
    if (lower.includes(keyword)) score += 0.15
  })

  sourceIndicators.forEach((indicator) => {
    if (lower.includes(indicator)) score += 0.1
  })

  // Cap at 1.0
  return Math.min(score, 1.0)
}

/**
 * Process raw alerts into enriched alert objects
 */
export function processAlerts(rawAlerts: RawAlert[]): ProcessedAlert[] {
  return rawAlerts.map((alert, index) => {
    const cleaned = cleanAlert(alert.message)
    const keywords = extractKeywords(alert.message)
    const threat_category = categorizeThreat(alert.message)
    const confidence_score = calculateConfidenceScore(alert.message)

    return {
      ...alert,
      id: `alert-${Date.now()}-${index}`,
      cleaned_message: cleaned,
      keywords,
      threat_category,
      confidence_score,
    }
  })
}

/**
 * Generate alert statistics
 */
export function generateAlertStats(alerts: ProcessedAlert[]) {
  const categories = new Map<string, number>()
  let totalConfidence = 0

  alerts.forEach((alert) => {
    categories.set(alert.threat_category, (categories.get(alert.threat_category) || 0) + 1)
    totalConfidence += alert.confidence_score
  })

  return {
    total_alerts: alerts.length,
    average_confidence: alerts.length > 0 ? totalConfidence / alerts.length : 0,
    threat_distribution: Object.fromEntries(categories),
    high_confidence_alerts: alerts.filter((a) => a.confidence_score > 0.7).length,
  }
}
