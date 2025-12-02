"use client"

import { useState, useEffect } from "react"
import { AlertDashboard } from "@/components/alert-dashboard"
import { AlertUploader } from "@/components/alert-uploader"
import { Header } from "@/components/header"
import { DemoAlerts } from "@/components/demo-alerts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Clock } from "lucide-react"

interface Session {
  id: number
  session_id: string
  total_alerts: number
  grouped_alerts: number
  noise_reduced: number
  processing_time_ms: number
  created_at: string
}

export default function Home() {
  const [alerts, setAlerts] = useState<string[]>([])
  const [groupedAlerts, setGroupedAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setSessionsLoading(true)
    setSessionsError(null)
    try {
      console.log("[v0] Fetching sessions...")
      const response = await fetch("/api/sessions")
      console.log("[v0] Sessions response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Sessions data:", data)
        setSessions(data.sessions || [])
      } else {
        const errorData = await response.json()
        console.error("[v0] Sessions error:", errorData)
        setSessionsError("Failed to load sessions")
      }
    } catch (error) {
      console.error("[v0] Failed to load sessions:", error)
      setSessionsError(error instanceof Error ? error.message : "Failed to load sessions")
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleAlertsUpload = (uploadedAlerts: string[]) => {
    setAlerts(uploadedAlerts)
  }

  const handleGroupAlerts = async () => {
    if (alerts.length === 0) {
      alert("Please upload or paste alerts first")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/group-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alerts }),
      })

      if (!response.ok) throw new Error("Failed to group alerts")
      const data = await response.json()
      setGroupedAlerts(data)
      setTimeout(() => loadSessions(), 500)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to group alerts")
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = (demoAlerts: string[]) => {
    setAlerts(demoAlerts)
    setTimeout(() => handleGroupAlerts(), 100)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upload">Group Alerts</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <AlertUploader
                  onAlertsUpload={handleAlertsUpload}
                  onGroupAlerts={handleGroupAlerts}
                  loading={loading}
                />
                <DemoAlerts onLoadDemo={handleLoadDemo} loading={loading} />
              </div>
              <div className="lg:col-span-2">
                {groupedAlerts ? (
                  <AlertDashboard groupedAlerts={groupedAlerts} />
                ) : (
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
                    <p className="text-slate-400">Upload alerts or try the demo to see AI-powered grouping results</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {sessionsError && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-400 text-sm">{sessionsError}</p>
              </div>
            )}
            {sessionsLoading ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
                <p className="text-slate-400">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No grouping sessions yet</p>
                <p className="text-sm text-slate-500 mt-2">Process some alerts to see them here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-semibold font-mono text-sm">{session.session_id}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-slate-400">Total Alerts</p>
                            <p className="text-cyan-400 font-semibold">{session.total_alerts}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Groups Created</p>
                            <p className="text-cyan-400 font-semibold">{session.grouped_alerts}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Noise Reduced</p>
                            <p className="text-green-400 font-semibold">{session.noise_reduced}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Processing Time</p>
                            <p className="text-orange-400 font-semibold">{session.processing_time_ms}ms</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{new Date(session.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">{new Date(session.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
