'use client'

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LogicalRange,
  LineData,
} from "lightweight-charts"
import * as duckdb from "@duckdb/duckdb-wasm"
import TradeButtons from "@/components/TradeButtons"
import IndicatorDialog from "./dalogs/IndicatorDialog"
import axios from "axios"

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

export default function MainChart({
  selectedSymbol,
  selectedTimeframe,
  chartHeight,
}: {
  selectedSymbol: string
  selectedTimeframe: string
  chartHeight: number
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map())
  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null)
  const connRef = useRef<duckdb.AsyncConnection | null>(null)
  const loadedTimestampsRef = useRef<Set<number>>(new Set())
  const allCandlesRef = useRef<CandlestickData[]>([])
  const [timeframe, setTimeframe] = useState("m15")
  const [latestPrice, setLatestPrice] = useState<{ sell: number; buy: number } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [indicatorSettings, setIndicatorSettings] = useState<Record<string, any>>({})

useEffect(() => {
  console.log("📌 useEffect: indicatorSettings changed", indicatorSettings)

  if (!chartRef.current) return

  const dummy = [
    {
      name: "Test MA",
      data: Array.from({ length: 100 }, (_, i) => ({
        time: Math.floor(Date.now() / 1000) - (100 - i) * 60,
        value: 100 + Math.sin(i / 10) * 5,
      })),
    },
  ]

  dummy.forEach((indicator) => {
    const series = chartRef.current!.addLineSeries({
      color: "blue",
      lineWidth: 2,
      title: indicator.name,
    })
    series.setData(indicator.data)
  })

  console.log("✅ ダミーインジケータ描画完了")
}, [indicatorSettings])



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

      allCandlesRef.current = rows
      candleSeriesRef.current.setData(rows)
      if (rows.length > 0) {
        const lastClose = rows[rows.length - 1].close
        setLatestPrice({ sell: lastClose - 0.0075, buy: lastClose + 0.0075 })
      }

      chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(
        async (range: LogicalRange | null) => {
          if (!range || !connRef.current || !candleSeriesRef.current) return

          const candles = allCandlesRef.current
          const indexFrom = Math.floor(range.from ?? 0)
          const indexTo = Math.ceil(range.to ?? 0)

          const fromTime = (candles[indexFrom]?.time ?? candles[0].time) - 30 * 24 * 60 * 60
          const toTime = (candles[indexTo]?.time ?? candles.at(-1)?.time ?? candles[0].time) + 30 * 24 * 60 * 60

          const query = `
            SELECT Datetime, open, high, low, close
            FROM candles
            WHERE EPOCH(Datetime) BETWEEN ${fromTime} AND ${toTime}
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
              const lastClose = allCandlesRef.current[allCandlesRef.current.length - 1].close
              setLatestPrice({ sell: lastClose - 0.0075, buy: lastClose + 0.0075 })
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
    <div className="w-full h-full overflow-hidden">
      <div className="flex gap-2 px-4 pt-0">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded text-sm border ${timeframe === tf.value ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
          >
            {tf.label}
          </button>
        ))}
        <button
          onClick={() => setDialogOpen(true)}
          className="ml-auto px-3 py-1 rounded text-sm border bg-blue-500 text-white"
        >
          インジケータ設定
        </button>
      </div>
      <div className="w-full h-full mt-0 px-4">
        <div className="relative w-full h-full border rounded bg-gray-100">
          <div
            ref={chartContainerRef}
            className="w-full h-full box-border"
          />
          {latestPrice && (
            <div className="absolute top-0 left-50 z-50">
              <TradeButtons
                sellPrice={latestPrice.sell}
                buyPrice={latestPrice.buy}
                onSellClick={() => console.log("Sell Order at", latestPrice.sell)}
                onBuyClick={() => console.log("Buy Order at", latestPrice.buy)}
              />
            </div>
          )}
        </div>
      </div>
      <IndicatorDialog
        tab="インジケータ"
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onSelect={(newSettings) => {
          const cloned = structuredClone(newSettings)
          console.log("🚀 onSelectで受け取った設定:", cloned)
          setIndicatorSettings(cloned)
        }}
      />
    </div>
  )
}
