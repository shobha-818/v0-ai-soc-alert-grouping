"use client"

import { ChevronDown, AlertTriangle, AlertCircle, Info, CheckCircle, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface AlertGroupProps {
  group: {
    category: string
    alerts: string[]
    severity: "critical" | "high" | "medium" | "low"
  }
}

export function AlertGroup({ group }: AlertGroupProps) {
  const [expanded, setExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const severityConfig = {
    critical: { bg: "bg-red-900/20", border: "border-red-700", text: "text-red-300", icon: AlertTriangle },
    high: { bg: "bg-orange-900/20", border: "border-orange-700", text: "text-orange-300", icon: AlertCircle },
    medium: { bg: "bg-yellow-900/20", border: "border-yellow-700", text: "text-yellow-300", icon: Info },
    low: { bg: "bg-green-900/20", border: "border-green-700", text: "text-green-300", icon: CheckCircle },
  }

  const config = severityConfig[group.severity]
  const IconComponent = config.icon

  const handleCopy = () => {
    const text = group.alerts.join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg overflow-hidden transition-all`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3 flex-1">
          <IconComponent className={`w-5 h-5 ${config.text}`} />
          <div className="text-left">
            <h3 className="font-semibold text-white">{group.category}</h3>
            <p className={`text-sm ${config.text}`}>
              {group.alerts.length} alert{group.alerts.length !== 1 ? "s" : ""} • Severity:{" "}
              {group.severity.toUpperCase()}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-slate-700">
          {group.alerts.slice(0, 5).map((alert, idx) => (
            <div
              key={idx}
              className="text-sm text-slate-300 pl-8 py-1 border-l border-slate-600 hover:bg-slate-700/50 rounded px-2 transition-colors"
            >
              {alert}
            </div>
          ))}
          {group.alerts.length > 5 && (
            <div className="text-sm text-slate-500 pl-8 py-1 italic">
              +{group.alerts.length - 5} more alert{group.alerts.length - 5 !== 1 ? "s" : ""}
            </div>
          )}
          {group.alerts.length > 0 && (
            <button
              onClick={handleCopy}
              className="mt-3 flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors pl-8"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy all alerts"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
