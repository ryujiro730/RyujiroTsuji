'use client'

import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LogicalRange,
} from 'lightweight-charts'
import * as duckdb from '@duckdb/duckdb-wasm'

const TIMEFRAMES = [
  { label: '1分', value: 'm1' },
  { label: '15分', value: 'm15' },
  { label: '1時間', value: 'h1' },
  { label: '日', value: 'd1' },
]

type CandleMap = Record<number, CandlestickData>

export default function MainChart({ selectedSymbol }: { selectedSymbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null)
  const connRef = useRef<duckdb.AsyncConnection | null>(null)
  const loadedTimestampsRef = useRef<Set<number>>(new Set())
  const [timeframe, setTimeframe] = useState('m15')

  useEffect(() => {
    const bundle: duckdb.Bundle = {
      mainModule: '/duckdb/duckdb-mvp.wasm',
      mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
      pthreadWorker: null,
    }

    async function init() {
      const worker = new Worker(bundle.mainWorker, { type: 'module' })
      const logger = new duckdb.ConsoleLogger()
      const db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      dbRef.current = db

      const conn = await db.connect()
      connRef.current = conn

      const filePath = `/data/${selectedSymbol}/${timeframe}/${selectedSymbol}-${timeframe}.parquet`
      await conn.query(`CREATE OR REPLACE TABLE candles AS SELECT * FROM read_parquet('${window.location.origin}${filePath}')`)

      if (chartRef.current) chartRef.current.remove()

      const chart = createChart(chartContainerRef.current!, {
        width: chartContainerRef.current!.clientWidth,
        height: 400,
        layout: { backgroundColor: '#f5f5f5', textColor: '#000' },
        timeScale: {
          minBarSpacing: 2,
          rightOffset: 10,
          fixLeftEdge: true,
          fixRightEdge: false,
          barSpacing: 10,
        },
      })
      chartRef.current = chart

      const series = chart.addCandlestickSeries()
      candleSeriesRef.current = series

      // 初期表示（直近3日）
      const now = Math.floor(Date.now() / 1000)
      const from = now - 60 * 60 * 24 * 3
      await loadAndMergeCandles(from, now)

      // 全体期間（2000年〜現在）に拡張
      chart.timeScale().setVisibleRange({ from: 946684800, to: now })

      // スクロール連動で追加描画
      chart.timeScale().subscribeVisibleLogicalRangeChange(async (range: LogicalRange | null) => {
        if (!range || !connRef.current || !candleSeriesRef.current) return
        const barWidth = 60 * 15
        const from = Math.floor(Date.now() / 1000) + Math.floor((range.from as number) * barWidth)
        const to = Math.floor(Date.now() / 1000) + Math.floor((range.to as number) * barWidth)
        await loadAndMergeCandles(from, to)
      })
    }

    async function loadAndMergeCandles(from: number, to: number) {
      const conn = connRef.current
      if (!conn || !candleSeriesRef.current) return

      const query = `
        SELECT Datetime, open, high, low, close 
        FROM candles 
        WHERE EPOCH(Datetime) BETWEEN ${from} AND ${to}
        ORDER BY Datetime ASC
      `
      const result = await conn.query(query)
      const newRows = result.toArray().map((row: any) => {
        const t = Math.floor(new Date(row.Datetime).getTime() / 1000)
        return {
          time: t,
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
        } as CandlestickData
      })

      const existing = candleSeriesRef.current.getData() as CandlestickData[]
      const map: CandleMap = {}
      for (const c of existing) map[c.time] = c
      for (const c of newRows) {
        if (!loadedTimestampsRef.current.has(c.time)) {
          map[c.time] = c
          loadedTimestampsRef.current.add(c.time)
        }
      }
      const merged = Object.values(map).sort((a, b) => a.time - b.time)
      candleSeriesRef.current.setData(merged)
    }

    if (selectedSymbol && chartContainerRef.current) init()
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
