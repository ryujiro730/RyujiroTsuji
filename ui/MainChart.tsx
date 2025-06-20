'use client'

import { useEffect, useRef, useState, forwardRef } from "react"
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LogicalRange,
} from "lightweight-charts"
import * as duckdb from "@duckdb/duckdb-wasm"

const TIMEFRAMES = [
  { label: "1分", value: "m1" },
  { label: "5分", value: "m5" },
  { label: "15分", value: "m15" },
  { label: "1時間", value: "h1" },
  { label: "4時間", value: "h4" },
  { label: "日", value: "d1" },
  { label: "週", value: "w1" },
  { label: "月", value: "mn1" },
]

type Props = {
  selectedSymbol: string
  selectedTimeframe: string
  chartHeight: number
}

const CandleChart = forwardRef<any, Props>(function CandleChart(
  { selectedSymbol, selectedTimeframe, chartHeight },
  ref
) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [timeframe, setTimeframe] = useState(selectedTimeframe || "m15")
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null)
  const connRef = useRef<duckdb.AsyncConnection | null>(null)
  const loadedTimestampsRef = useRef<Set<number>>(new Set())
  const allCandlesRef = useRef<CandlestickData[]>([])
  const [dragHeight, setDragHeight] = useState(chartHeight)



  // === チャート初期化・キャンドル ===
  useEffect(() => {
    if (!selectedSymbol || !chartContainerRef.current) return

    const container = chartContainerRef.current
    const containerHeight = container.clientHeight
    const containerWidth = container.clientWidth

    if (containerHeight === 0 || containerWidth === 0) return

    const bundle: duckdb.Bundle = {
      mainModule: "/duckdb/duckdb-mvp.wasm",
      mainWorker: "/duckdb/duckdb-browser-mvp.worker.js",
      pthreadWorker: null,
    }

    const init = async () => {
      if (!dbRef.current) {
        const worker = new Worker(bundle.mainWorker, { type: "module" })
        const logger = new duckdb.ConsoleLogger()
        const db = new duckdb.AsyncDuckDB(logger, worker)
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
        dbRef.current = db
      }

      const conn = await dbRef.current.connect()
      connRef.current = conn

      const filePath = `/data/${selectedSymbol}/${timeframe}/${selectedSymbol}-${timeframe}.parquet`

      await conn.query("DROP TABLE IF EXISTS candles")
      await conn.query(`
        CREATE TABLE candles AS
        SELECT * FROM read_parquet('${window.location.origin}${filePath}')
      `)

      if (chartRef.current) {
        chartRef.current.remove()
      }

      chartRef.current = createChart(container, {
        width: containerWidth,
        height: containerHeight,
        layout: { backgroundColor: "#f5f5f5", textColor: "#000" },
        rightPriceScale: { visible: true },
        timeScale: { rightOffset: 10, barSpacing: 8, fixLeftEdge: true },
      })

      candleSeriesRef.current = chartRef.current.addCandlestickSeries()
      loadedTimestampsRef.current.clear()
      allCandlesRef.current = []

      const initial = await conn.query(`
        SELECT Datetime, open, high, low, close
        FROM candles
        WHERE Datetime IS NOT NULL
        ORDER BY Datetime DESC
        LIMIT 500
      `)

      const rows: CandlestickData[] = initial.toArray().map((row: any) => {
        const ts = Math.floor(new Date(row.Datetime).getTime() / 1000)
        loadedTimestampsRef.current.add(ts)
        return {
          time: ts,
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
        }
      }).reverse()
    if (!mounted) {
    return <div style={{ height: chartHeight }} />
    }
      allCandlesRef.current = rows
      candleSeriesRef.current.setData(rows)
      chartRef.current.timeScale().fitContent()

      // スクロール時の追加データロード（任意、不要なら削除してもOK）
      chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(
        async (range: LogicalRange | null) => {
          if (!range || !connRef.current || !candleSeriesRef.current) return

          const fromIndex = Math.max(0, Math.floor(range.from ?? 0))
          const toIndex = Math.min(allCandlesRef.current.length - 1, Math.ceil(range.to ?? 0))

          const fromTime = allCandlesRef.current[fromIndex]?.time ?? allCandlesRef.current[0]?.time
          const toTime = allCandlesRef.current[toIndex]?.time ?? allCandlesRef.current.at(-1)?.time ?? fromTime

          const query = `
            SELECT Datetime, open, high, low, close
            FROM candles
            WHERE EPOCH(Datetime) BETWEEN ${fromTime - 30 * 86400} AND ${toTime + 30 * 86400}
            ORDER BY Datetime ASC
          `

          try {
            const result = await connRef.current.query(query)
            const newRows: CandlestickData[] = []

            for (const row of result.toArray()) {
              const ts = Math.floor(new Date(row.Datetime).getTime() / 1000)
              if (!loadedTimestampsRef.current.has(ts)) {
                loadedTimestampsRef.current.add(ts)
                newRows.push({
                  time: ts,
                  open: row.open,
                  high: row.high,
                  low: row.low,
                  close: row.close,
                })
              }
            }

            if (newRows.length > 0) {
              allCandlesRef.current = [...allCandlesRef.current, ...newRows].sort((a, b) => a.time - b.time)
              candleSeriesRef.current.setData(allCandlesRef.current)
            }
          } catch (err) {
            console.error("データ取得エラー", err)
          }
        }
      )
    }

    init()

    return () => {
      chartRef.current?.remove()
      chartRef.current = null
    }
  }, [selectedSymbol, timeframe, chartHeight])

  return (
    <div className="w-full h-full flex flex-col px-4">
      <div className="flex gap-2 pt-2 pb-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded text-sm border ${timeframe === tf.value ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <div className="relative w-full border rounded bg-gray-100" style={{ height: dragHeight }}>
        <div ref={chartContainerRef} className="w-full h-full box-border" />
      </div>
      <div
        className="w-full cursor-row-resize bg-gray-300"
        style={{ height: "6px" }}
      />
    </div>
  )
})

export default CandleChart
