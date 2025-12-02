export async function POST(request: Request) {
  try {
    const { alerts } = (await request.json()) as { alerts: string[] }

    if (!Array.isArray(alerts) || alerts.length === 0) {
      return Response.json({ error: "No alerts provided" }, { status: 400 })
    }

    // Import processing functions
    const { processAlerts } = await import("@/lib/alert-processor")
    const { deduplicateAlerts } = await import("@/lib/alert-deduplication")

    const rawAlerts = alerts.map((message) => ({
      message,
      timestamp: new Date().toISOString(),
      source: "api",
    }))

    const processedAlerts = processAlerts(rawAlerts)
    const deduplicated = deduplicateAlerts(processedAlerts, 0.75)

    // Get high confidence alerts
    const highConfidence = deduplicated.filter((a) => a.confidence_score > 0.7)

    return Response.json({
      success: true,
      processed_count: deduplicated.length,
      duplicates_removed: alerts.length - deduplicated.length,
      high_confidence_count: highConfidence.length,
      alerts: deduplicated.map((a) => ({
        id: a.id,
        message: a.message,
        category: a.threat_category,
        confidence: a.confidence_score,
        keywords: a.keywords,
      })),
    })
  } catch (error) {
    console.error("Error processing alerts:", error)
    return Response.json({ error: "Failed to process alerts", details: String(error) }, { status: 500 })
  }
}
