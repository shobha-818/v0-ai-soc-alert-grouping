import { parseCSV, processAlerts, generateAlertStats } from "@/lib/alert-processor"
import { deduplicateAlerts } from "@/lib/alert-deduplication"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const content = await file.text()
    const rawAlerts = parseCSV(content)

    if (rawAlerts.length === 0) {
      return Response.json({ error: "No alerts found in file" }, { status: 400 })
    }

    // Process alerts
    const processedAlerts = processAlerts(rawAlerts)

    // Deduplicate
    const deduplicated = deduplicateAlerts(processedAlerts, 0.7)

    // Generate stats
    const stats = generateAlertStats(deduplicated)

    return Response.json({
      success: true,
      alerts: deduplicated,
      statistics: stats,
      deduplication_rate:
        (((processedAlerts.length - deduplicated.length) / processedAlerts.length) * 100).toFixed(2) + "%",
    })
  } catch (error) {
    console.error("Error processing alerts:", error)
    return Response.json({ error: "Failed to process alerts", details: String(error) }, { status: 500 })
  }
}
