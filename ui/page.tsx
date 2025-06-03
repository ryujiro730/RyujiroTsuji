'use client'

import { useState } from "react"
import MenuTabs from "@/components/MenuTabs"
import MainChart from "@/components/MainChart"
import DrawingToolsToolbar from "@/components/DrawingToolsToolbar"

export default function Page() {
  const [selectedTab, setSelectedTab] = useState("インジケーター")
  const [selectedSymbol, setSelectedSymbol] = useState("usdjpy")
  const [selectedTimeframe, setSelectedTimeframe] = useState("m15")
  const [activeTool, setActiveTool] = useState<string | null>(null)

  return (
    <div className="flex h-screen">
      {/* 🎯 左側にアクティブツール（ツールバー） */}
      <DrawingToolsToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      {/* 右側にメインUI */}
      <div className="flex-1 flex flex-col">
        <MenuTabs
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
          selectedTab={selectedTab}
          onSelect={setSelectedTab}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
        />

        <MainChart
          selectedSymbol={selectedSymbol}
          selectedTimeframe={selectedTimeframe}
        />
      </div>
    </div>
  )
}
