'use client'

import { useState, useRef,useEffect } from "react"
import MenuTabs from "@/components/MenuTabs"
import MainChart, { MainChartHandle } from "@/components/MainChart"
import DrawingToolsToolbar from "@/components/DrawingToolsToolbar"
import { StatusBar, BacktestHistory } from "@/components/StatusBar_BacktestHistory"
import ResizableChartLayout from "@/components/ResizableChartLayout"
import MainChartContainer from "@/components/MainChartContainer";


export default function Page() {
  const [selectedTab, setSelectedTab] = useState("インジケーター")
  const [selectedSymbol, setSelectedSymbol] = useState("usdjpy")
  const [selectedTimeframe, setSelectedTimeframe] = useState("m15")
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [indicators, setIndicators] = useState<Record<string, any>>({})     // ←ここ重要
  const [backtestResult, setBacktestResult] = useState<any>(null)
  const chartRef = useRef<MainChartHandle>(null)

  const handleRunBacktest = async () => {
    if (chartRef.current?.runBacktest) {
      chartRef.current.runBacktest().then((result: any) => {
        setBacktestResult(result)
      })
    }
  }

  useEffect(() => {
  console.log("Pageで保持しているindicators:", indicators)
}, [indicators])


  return (
    <div className="flex h-screen">
      <DrawingToolsToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MenuTabs
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
          selectedTab={selectedTab}
          onSelect={setSelectedTab}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onBacktestClick={handleRunBacktest}
          indicators={indicators}           // ←ここ追加
          setIndicators={setIndicators}     // ←ここ追加
        />

        <ResizableChartLayout
          chart={(chartHeight) => (
            <MainChart
              ref={chartRef}
              selectedSymbol={selectedSymbol}
              selectedTimeframe={selectedTimeframe}
              chartHeight={chartHeight}
              indicators={indicators}          // ←ここ追加
            />
          )}
          statusBar={
            <StatusBar
              balance={backtestResult ? backtestResult.equity_curve?.at(-1)?.value ?? 1000000 : 1000000}
              equity={backtestResult ? backtestResult.equity_curve?.at(-1)?.value ?? 1000000 : 1000000}
              margin={0}
              freeMargin={backtestResult ? backtestResult.equity_curve?.at(-1)?.value ?? 1000000 : 1000000}
              floatingPnl={0}
            />
          }

          history={
            <BacktestHistory
              logs={backtestResult ? backtestResult.trade_log : []}
            />
          }
        />
  <MainChartContainer
  selectedSymbol={selectedSymbol}
  selectedTimeframe={selectedTimeframe}
  chartHeight={400}/>
      </div>
    </div>
  )
}
