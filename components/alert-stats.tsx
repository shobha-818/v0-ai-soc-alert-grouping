"use client"

import { BarChart3, AlertTriangle, TrendingUp } from "lucide-react"

interface AlertStatsProps {
  totalAlerts: number
  groupCount: number
}

export function AlertStats({ totalAlerts, groupCount }: AlertStatsProps) {
  const reductionPercentage = groupCount > 0 ? Math.round(((totalAlerts - groupCount) / totalAlerts) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Alerts</p>
            <p className="text-3xl font-bold text-white mt-2">{totalAlerts}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-orange-500 opacity-20" />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Alert Groups</p>
            <p className="text-3xl font-bold text-white mt-2">{groupCount}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-cyan-500 opacity-20" />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Noise Reduction</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{reductionPercentage}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
        </div>
      </div>
    </div>
  )
}
