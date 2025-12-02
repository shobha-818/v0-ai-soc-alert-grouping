import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createAlert, createAlertGroup, addAlertToGroup, createSession } from "@/lib/db"
import { generateUUID } from "@/lib/uuid"
import { type NextRequest, NextResponse } from "next/server"
import { validateAlertInput, sanitizeInput } from "@/lib/security"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { alerts } = body

    if (!validateAlertInput(alerts)) {
      return NextResponse.json(
        { error: "Invalid input", details: "Alerts must be an array with 1-10000 string items, each 1-5000 chars" },
        { status: 400 },
      )
    }

    const sanitizedAlerts = alerts.map(sanitizeInput)

    const sessionId = generateUUID()
    const alertsText = sanitizedAlerts.join("\n")

    const prompt = `You are a Security Operations Center (SOC) AI assistant specialized in grouping security alerts by semantic similarity and threat type.

Analyze the following security alerts and group them into logical categories based on:
1. Attack type (e.g., Authentication, Malware, Network, SQL Injection)
2. Semantic similarity
3. Attack pattern

Return ONLY a valid JSON object where keys are group categories and values are arrays of alert indexes (0-based) belonging to that category.

ALERTS:
${sanitizedAlerts.map((a, i) => `${i}: ${a}`).join("\n")}

Return ONLY the JSON object, no other text. Example format:
{"Authentication": [0, 2], "Malware": [1], "Network": [3, 4]}`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    })

    let groupsIndexes: Record<string, number[]> = {}

    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
      groupsIndexes = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text)
      groupsIndexes = {
        Uncategorized: sanitizedAlerts.map((_, i) => i),
      }
    }

    const savedAlerts: any[] = []
    const alertIdMap = new Map<number, number>()

    for (let i = 0; i < sanitizedAlerts.length; i++) {
      try {
        const savedAlert = await createAlert({
          alert_id: `alert-${sessionId}-${i}`,
          alert_type: "Security Alert",
          severity: "Medium",
          message: sanitizedAlerts[i],
          raw_data: { index: i, sessionId },
        })
        savedAlerts.push(savedAlert)
        alertIdMap.set(i, savedAlert.id)
      } catch (error) {
        console.error(`Failed to save alert ${i}:`, error)
      }
    }

    let groupCount = 0
    for (const [groupName, alertIndexes] of Object.entries(groupsIndexes)) {
      try {
        const groupId = `group-${sessionId}-${groupCount}`
        const savedGroup = await createAlertGroup({
          group_id: groupId,
          group_name: groupName,
          description: `Group of ${alertIndexes.length} related alerts`,
          severity: "High",
          threat_category: groupName,
          confidence_score: 0.85,
        })

        for (const alertIndex of alertIndexes) {
          const dbAlertId = alertIdMap.get(alertIndex as number)
          if (dbAlertId) {
            await addAlertToGroup(savedGroup.id, dbAlertId, 0.9)
          }
        }
        groupCount++
      } catch (error) {
        console.error(`Failed to save group ${groupName}:`, error)
      }
    }

    const processingTime = Date.now() - startTime
    try {
      await createSession({
        session_id: sessionId,
        total_alerts: sanitizedAlerts.length,
        grouped_alerts: groupCount,
        noise_reduced: Math.max(0, sanitizedAlerts.length - groupCount),
        processing_time_ms: processingTime,
      })
    } catch (error) {
      console.error("Failed to save session:", error)
    }

    const groups: Record<string, string[]> = {}
    for (const [groupName, alertIndexes] of Object.entries(groupsIndexes)) {
      groups[groupName] = (alertIndexes as number[]).map((i) => sanitizedAlerts[i])
    }

    return NextResponse.json({
      success: true,
      sessionId,
      groups,
      total_alerts: sanitizedAlerts.length,
      group_count: groupCount,
      processing_time_ms: processingTime,
      noise_reduction_percentage: Math.round((groupCount / sanitizedAlerts.length) * 100),
    })
  } catch (error) {
    console.error("Error grouping alerts:", error)
    return NextResponse.json({ error: "Failed to group alerts", details: String(error) }, { status: 500 })
  }
}
