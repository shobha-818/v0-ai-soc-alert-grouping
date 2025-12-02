"use client"

import { Shield, Activity } from "lucide-react"

export function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-400" />
              <Activity className="w-4 h-4 text-red-500 absolute -bottom-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SOC Alert Grouping</h1>
              <p className="text-sm text-slate-400">AI-powered threat detection & clustering</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-700 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
