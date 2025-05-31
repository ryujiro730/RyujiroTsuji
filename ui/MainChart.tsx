'use client'

import { useEffect, useRef, useState } from "react"
import { createChart, IChartApi } from "lightweight-charts"
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
  const [timeframe, setTimeframe] = useState("m15")

  useEffect(() => {
    if (!selectedSymbol || !chartContainerRef.current) return

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current!, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          backgroundColor: '#f5f5f5',
          textColor: '#000',
        },
      })
    }

    const bundle: duckdb.Bundle = {
      mainModule: "/duckdb/duckdb-mvp.wasm",
      mainWorker: "/duckdb/duckdb-browser-mvp.worker.js",
      pthreadWorker: "/duckdb/duckdb-browser-mvp.pthread.worker.js",
    }

    async function initChart() {
      try {
        const worker = new Worker(bundle.mainWorker, { type: "module" })
        const logger = new duckdb.ConsoleLogger()
        const db = new duckdb.AsyncDuckDB(logger, worker)

        await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
        const conn = await db.connect()
        const filePath = `D:/UserData/Documents/MarketData_parquet/${selectedSymbol}/${timeframe}/${selectedSymbol}-${timeframe}.parquet`
        await conn.query(`CREATE TABLE candles AS SELECT * FROM read_parquet('${filePath.replace(/\\/g, "/")}')`)

        const result = await conn.query(`SELECT Datetime, open, high, low, close FROM candles ORDER BY Datetime ASC LIMIT 500`)
        const rows = result.toArray().map((row: any) => ({
          time: Math.floor(new Date(row.Datetime).getTime() / 1000),
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
        }))

        if (chartRef.current) {
          chartRef.current.remove()
        }

        chartRef.current = createChart(chartContainerRef.current!, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: { backgroundColor: '#f5f5f5', textColor: '#000' },
        })

        chartRef.current.addCandlestickSeries().setData(rows)
      } catch (error) {
        console.error("Error initializing chart:", error)
      }
    }

    initChart()
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
