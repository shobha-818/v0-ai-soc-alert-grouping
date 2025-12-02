import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function initDatabase() {
  try {
    const result = await sql`SELECT NOW()`
    console.log("[v0] Database connected:", result)
    return true
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    throw error
  }
}

export async function createAlert(alertData: {
  alert_id: string
  alert_type: string
  severity: string
  source?: string
  destination?: string
  message: string
  raw_data?: Record<string, any>
}) {
  try {
    const result = await sql`
      INSERT INTO alerts (alert_id, alert_type, severity, source, destination, message, raw_data)
      VALUES (${alertData.alert_id}, ${alertData.alert_type}, ${alertData.severity}, ${alertData.source || null}, ${alertData.destination || null}, ${alertData.message}, ${alertData.raw_data ? JSON.stringify(alertData.raw_data) : null})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error creating alert:", error)
    throw error
  }
}

export async function getAlerts(limit = 100, offset = 0) {
  try {
    const result = await sql`SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`
    return result
  } catch (error) {
    console.error("[v0] Error fetching alerts:", error)
    throw error
  }
}

export async function createAlertGroup(groupData: {
  group_id: string
  group_name: string
  description: string
  severity: string
  threat_category: string
  confidence_score: number
}) {
  try {
    const result = await sql`
      INSERT INTO alert_groups (group_id, group_name, description, severity, threat_category, confidence_score)
      VALUES (${groupData.group_id}, ${groupData.group_name}, ${groupData.description}, ${groupData.severity}, ${groupData.threat_category}, ${groupData.confidence_score})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error creating alert group:", error)
    throw error
  }
}

export async function addAlertToGroup(groupId: number, alertId: number, similarityScore: number) {
  try {
    const result = await sql`
      INSERT INTO alert_group_members (group_id, alert_id, similarity_score)
      VALUES (${groupId}, ${alertId}, ${similarityScore})
      ON CONFLICT (group_id, alert_id) DO UPDATE SET similarity_score = ${similarityScore}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error adding alert to group:", error)
    throw error
  }
}

export async function getAlertGroups(limit = 50, offset = 0) {
  try {
    const result = await sql`SELECT * FROM alert_groups ORDER BY last_seen DESC LIMIT ${limit} OFFSET ${offset}`
    return result
  } catch (error) {
    console.error("[v0] Error fetching alert groups:", error)
    throw error
  }
}

export async function getGroupWithMembers(groupId: number) {
  try {
    const groupResult = await sql`SELECT * FROM alert_groups WHERE id = ${groupId}`

    if (groupResult.length === 0) {
      throw new Error("Group not found")
    }

    const membersResult = await sql`
      SELECT a.*, agm.similarity_score FROM alerts a
      JOIN alert_group_members agm ON a.id = agm.alert_id
      WHERE agm.group_id = ${groupId}
      ORDER BY agm.similarity_score DESC
    `

    return {
      group: groupResult[0],
      members: membersResult,
    }
  } catch (error) {
    console.error("[v0] Error fetching group with members:", error)
    throw error
  }
}

export async function updateAlertGroupStatus(groupId: number, status: string) {
  try {
    const result = await sql`
      UPDATE alert_groups SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${groupId} RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error updating group status:", error)
    throw error
  }
}

export async function createSession(sessionData: {
  session_id: string
  total_alerts: number
  grouped_alerts: number
  noise_reduced: number
  processing_time_ms: number
}) {
  try {
    const result = await sql`
      INSERT INTO sessions (session_id, total_alerts, grouped_alerts, noise_reduced, processing_time_ms)
      VALUES (${sessionData.session_id}, ${sessionData.total_alerts}, ${sessionData.grouped_alerts}, ${sessionData.noise_reduced}, ${sessionData.processing_time_ms})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error creating session:", error)
    throw error
  }
}

export async function getAlertStats() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_alerts,
        COUNT(DISTINCT alert_type) as alert_types,
        COUNT(DISTINCT agm.group_id) as total_groups,
        SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high_count,
        SUM(CASE WHEN severity = 'Medium' THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN severity = 'Low' THEN 1 ELSE 0 END) as low_count
      FROM alerts
      LEFT JOIN alert_group_members agm ON alerts.id = agm.alert_id
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error fetching alert stats:", error)
    throw error
  }
}
