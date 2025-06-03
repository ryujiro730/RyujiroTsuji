'use client'

import { useEffect, useRef, useState } from "react"
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
  { label: "15分", value: "m15" },
  { label: "1時間", value: "h1" },
  { label: "日", value: "d1" },
]

export default function MainChart({ selectedSymbol }: { selectedSymbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null)
  const connRef = useRef<duckdb.AsyncConnection | null>(null)
  const loadedTimestampsRef = useRef<Set<number>>(new Set())
  const allCandlesRef = useRef<CandlestickData[]>([])
  const [timeframe, setTimeframe] = useState("m15")

  useEffect(() => {
    if (!selectedSymbol || !chartContainerRef.current) return

    const bundle: duckdb.Bundle = {
      mainModule: "/duckdb/duckdb-mvp.wasm",
      mainWorker: "/duckdb/duckdb-browser-mvp.worker.js",
      pthreadWorker: null,
    }

    const init = async () => {
      const worker = new Worker(bundle.mainWorker, { type: "module" })
      const logger = new duckdb.ConsoleLogger()
      const db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      dbRef.current = db

      const conn = await db.connect()
      connRef.current = conn

      const filePath = `/data/${selectedSymbol}/${timeframe}/${selectedSymbol}-${timeframe}.parquet`
      await conn.query(`
        CREATE OR REPLACE TABLE candles AS 
        SELECT * FROM read_parquet('${window.location.origin}${filePath}')
      `)

      if (chartRef.current) chartRef.current.remove()
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 800,
        layout: { backgroundColor: "#f5f5f5", textColor: "#000" },
        rightPriceScale: { visible: true },
        timeScale: { rightOffset: 10, barSpacing: 8, fixLeftEdge: true },
      })

      candleSeriesRef.current = chartRef.current.addCandlestickSeries()

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
            }
          } catch (err) {
            console.error("データ取得エラー", err)
          }
        }
      )
    }

    init()
  }, [selectedSymbol, timeframe])

  return (
    <div className="w-full">
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
      </div>
      <div className="w-full h-[400px] mt-0 px-4">
        <div
          ref={chartContainerRef}
          className="w-full h-[400px] border rounded bg-gray-100"
          style={{ marginTop: 0, paddingTop: 0 }}
        />
      </div>
    </div>
  )
}