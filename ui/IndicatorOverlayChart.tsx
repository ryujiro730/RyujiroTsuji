// components/IndicatorOverlayChart.tsx
import { useEffect, useRef } from "react"
import { createChart, LineStyle } from "lightweight-charts"

export default function IndicatorOverlayChart({
  candleData,
  indicatorSeries,
  height = 400,
}: {
  candleData: any[]
  indicatorSeries: {
    name: string
    type: "line" | "area" | "histogram"
    color: string
    data: { time: number; value: number }[]
  }[]
  height?: number
}) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.innerHTML = "" // 再描画のためクリア
    const chart = createChart(chartRef.current, {
      height,
      layout: { backgroundColor: "#ffffff", textColor: "#000" },
      timeScale: { timeVisible: true, secondsVisible: true },
    })
    chartInstanceRef.current = chart

    const candleSeries = chart.addCandlestickSeries()
    candleSeries.setData(candleData)

    indicatorSeries.forEach((series) => {
      const line = chart.addLineSeries({
        color: series.color,
        lineWidth: 2,
        title: series.name,
        lineStyle: LineStyle.Solid,
      })
      line.setData(series.data)
    })

    return () => chart.remove()
  }, [candleData, indicatorSeries])

  return <div ref={chartRef} className="w-full" style={{ height }} />
}
