"use client"

import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

interface DemoAlertsProps {
  onLoadDemo: (alerts: string[]) => void
  loading: boolean
}

export function DemoAlerts({ onLoadDemo, loading }: DemoAlertsProps) {
  const demoAlerts = [
    "Failed SSH login attempt from 192.168.1.100 to server.example.com",
    "Suspicious SQL injection pattern detected in web form input",
    "Unauthorized administrative access attempt from internal user",
    "Malware signature detected: Trojan.Generic.SMH on endpoint-042",
    "Failed login attempt - multiple attempts within 60 seconds from 10.0.0.50",
    "Phishing email detected containing malicious URL to financial institution",
    "SQL injection pattern in database query parameters",
    "Administrative privilege escalation detected on DC-01",
    "Malware detection: Win32.Ransomware.GenericA on workstation-015",
    "Suspicious network activity: Large data exfiltration from Finance department",
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyan-400" />
        Quick Demo
      </h3>
      <p className="text-xs text-slate-400 mb-3">Load sample alerts to see grouping in action</p>
      <Button
        onClick={() => onLoadDemo(demoAlerts)}
        disabled={loading}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
      >
        Load {demoAlerts.length} Sample Alerts
      </Button>
    </div>
  )
}
