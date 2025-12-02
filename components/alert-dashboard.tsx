"use client"

import { AlertGroup } from "./alert-group"
import { AlertStats } from "./alert-stats"
import { BarChart3 } from "lucide-react"

interface AlertDashboardProps {
  groupedAlerts: {
    groups?: Record<string, string[]>
    total_alerts?: number
    group_count?: number
    processing_time_ms?: number
    noise_reduction_percentage?: number
  }
}

export function AlertDashboard({ groupedAlerts }: AlertDashboardProps) {
  // Handle both old and new response formats
  const alertsData = groupedAlerts.groups || groupedAlerts

  const groups = Object.entries(alertsData)
    .filter(([key]) => key !== "raw_response")
    .map(([category, items]) => ({
      category,
      alerts: Array.isArray(items) ? items : [items],
      severity: calculateSeverity(category),
    }))
    .sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity))

  const totalAlerts = groups.reduce((sum, g) => sum + g.alerts.length, 0)

  return (
    <div className="space-y-6">
      <AlertStats totalAlerts={totalAlerts} groupCount={groups.length} />

      {groupedAlerts.processing_time_ms && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">Processing Time</span>
          <span className="text-cyan-400 font-semibold">{groupedAlerts.processing_time_ms}ms</span>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Grouped Alerts ({groups.length} groups)
        </h2>

        {groups.length === 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
            <p className="text-slate-400">No alerts to display</p>
          </div>
        ) : (
          groups.map((group, idx) => <AlertGroup key={idx} group={group} />)
        )}
      </div>
    </div>
  )
}

function calculateSeverity(category: string): "critical" | "high" | "medium" | "low" {
  const lower = category.toLowerCase()
  if (lower.includes("malware") || lower.includes("unauthorized") || lower.includes("injection")) return "critical"
  if (lower.includes("suspicious") || lower.includes("failed") || lower.includes("phish")) return "high"
  if (lower.includes("anomaly") || lower.includes("unusual")) return "medium"
  return "low"
}

function getSeverityScore(severity: string): number {
  const scores: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
  return scores[severity] || 0
}
