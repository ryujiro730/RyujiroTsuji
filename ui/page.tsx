'use client'

import { useState } from "react"
import MenuTabs from "@/components/MenuTabs"

import MainChart from "@/components/MainChart"

export default function Page() {
  const [selectedTab, setSelectedTab] = useState("インジケーター")
  const [selectedSymbol, setSelectedSymbol] = useState("usdjpy")
  const [selectedTimeframe, setSelectedTimeframe] = useState("m15")

  return (
    <div className="p-4 space-y-4">
      <MenuTabs
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
        selectedTab={selectedTab}
        onSelect={setSelectedTab}
      />

      {/* 👇 常時表示されるタイムフレームスイッチャー */}

      {/* 👇 チャートも常時表示 */}
      <MainChart
        selectedSymbol={selectedSymbol}
        selectedTimeframe={selectedTimeframe}
      />
    </div>
  )
}
