"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"


export default function PageHeader({ title, description, onReloadData, icon }) {
  return (
    <header className="flex flex-col items-start justify-between gap-4 px-8 py-6 border-b shadow-sm bg-gradient-to-r from-[#0077B6]/90 to-[#0077B6] rounded sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-full">
          <div className="w-16 h-16 rounded-full text-white bg-gradient-to-br from-[#0077B6]/80 to-[#0077B6] flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-white">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={onReloadData}
        className="text-[#0077b6] bg-white border-none rounded cursor-pointer hover:bg-white/80 hover:text-[#0077B6]"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Reload Data
      </Button>
    </header>
  )
}
