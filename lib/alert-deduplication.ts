import type { ProcessedAlert } from "./alert-processor"

/**
 * Calculate Levenshtein distance between two strings (for similarity)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0))

  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let i = 0; i <= len2; i++) matrix[i][0] = i

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      const cost = str1[j - 1] === str2[i - 1] ? 0 : 1
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    }
  }

  return matrix[len2][len1]
}

/**
 * Calculate similarity score (0-1) between two alerts
 */
export function calculateSimilarity(alert1: ProcessedAlert, alert2: ProcessedAlert): number {
  // Message similarity
  const maxLen = Math.max(alert1.cleaned_message.length, alert2.cleaned_message.length)
  const distance = levenshteinDistance(alert1.cleaned_message, alert2.cleaned_message)
  const messageSimilarity = maxLen > 0 ? 1 - distance / maxLen : 0

  // Category match
  const categoryMatch = alert1.threat_category === alert2.threat_category ? 0.3 : 0

  // Keyword overlap
  const keywords1 = new Set(alert1.keywords)
  const keywords2 = new Set(alert2.keywords)
  const intersection = new Set([...keywords1].filter((k) => keywords2.has(k)))
  const union = new Set([...keywords1, ...keywords2])
  const keywordSimilarity = union.size > 0 ? (intersection.size / union.size) * 0.2 : 0

  return messageSimilarity + categoryMatch + keywordSimilarity
}

/**
 * Find duplicate or near-duplicate alerts
 */
export function deduplicateAlerts(alerts: ProcessedAlert[], threshold = 0.75): ProcessedAlert[] {
  if (alerts.length <= 1) return alerts

  const deduplicated: ProcessedAlert[] = []
  const processed = new Set<string>()

  for (let i = 0; i < alerts.length; i++) {
    if (processed.has(alerts[i].id)) continue

    deduplicated.push(alerts[i])
    processed.add(alerts[i].id)

    // Mark similar alerts as processed
    for (let j = i + 1; j < alerts.length; j++) {
      if (!processed.has(alerts[j].id)) {
        const similarity = calculateSimilarity(alerts[i], alerts[j])
        if (similarity >= threshold) {
          processed.add(alerts[j].id)
        }
      }
    }
  }

  return deduplicated
}
