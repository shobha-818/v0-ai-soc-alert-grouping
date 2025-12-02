"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Zap, AlertCircle } from "lucide-react"

interface AlertUploaderProps {
  onAlertsUpload: (alerts: string[]) => void
  onGroupAlerts: () => void
  loading: boolean
}

export function AlertUploader({ onAlertsUpload, onGroupAlerts, loading }: AlertUploaderProps) {
  const [alerts, setAlerts] = useState<string[]>([])
  const [processingStats, setProcessingStats] = useState<any>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-alerts", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload file")
      const data = await response.json()

      const alertMessages = data.alerts.map((a: any) => a.message)
      setAlerts(alertMessages)
      setProcessingStats(data.statistics)
      onAlertsUpload(alertMessages)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to process file")
    } finally {
      setIsUploadingFile(false)
    }
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    setAlerts(lines)
    onAlertsUpload(lines)
    setProcessingStats(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-cyan-400" />
          Import Alerts
        </h2>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 cursor-pointer hover:border-cyan-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              disabled={isUploadingFile}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-500" />
              <p className="text-sm text-slate-400">
                {isUploadingFile ? "Processing..." : "Click to upload CSV or TXT file"}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or paste alerts</span>
            </div>
          </div>

          <textarea
            value={alerts.join("\n")}
            onChange={handleManualInput}
            placeholder="Paste alert messages here, one per line..."
            className="w-full h-32 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />

          <button
            onClick={onGroupAlerts}
            disabled={alerts.length === 0 || loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            {loading ? "Grouping Alerts..." : "Group Alerts with AI"}
          </button>

          {alerts.length > 0 && (
            <div className="text-sm text-slate-400">
              {alerts.length} alert{alerts.length !== 1 ? "s" : ""} loaded
            </div>
          )}

          {processingStats && (
            <div className="bg-slate-700 rounded p-3 text-sm space-y-1">
              <p className="text-slate-300">Processing Statistics:</p>
              <p className="text-slate-400">
                Average Confidence: {(processingStats.average_confidence * 100).toFixed(1)}%
              </p>
              <p className="text-slate-400">High Confidence Alerts: {processingStats.high_confidence_alerts}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
