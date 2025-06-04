// components/IndicatorsPanel.tsx
import { useEffect, useState } from "react"

export const INDICATORS: Record<string, { label: string; params?: { name: string; default: number }[] }> = {
  "Moving Average": { label: "Moving Average", params: [{ name: "period", default: 14 }] },
  "Exponential Moving Average": { label: "Exponential Moving Average", params: [{ name: "period", default: 14 }] },
  "Bollinger Bands": { label: "Bollinger Bands", params: [{ name: "period", default: 20 }, { name: "stddev", default: 2 }] },
  "Parabolic SAR": { label: "Parabolic SAR", params: [{ name: "acceleration", default: 0.02 }, { name: "max", default: 0.2 }] },
  "Ichimoku Kinko Hyo": { label: "Ichimoku Kinko Hyo" },
  "Average Directional Index": { label: "Average Directional Index", params: [{ name: "period", default: 14 }] },
  "Moving Average Envelope": { label: "Moving Average Envelope", params: [{ name: "period", default: 20 }, { name: "deviation", default: 2 }] },
  "Fractal Adaptive Moving Average": { label: "Fractal Adaptive Moving Average", params: [{ name: "period", default: 14 }] },
  "Pivot Points": { label: "Pivot Points" },
  "Donchian Channel": { label: "Donchian Channel", params: [{ name: "period", default: 20 }] },
  "Trendlines": { label: "Trendlines" },
  "Linear Regression": { label: "Linear Regression" },
  "Kijun-Sen": { label: "Kijun-Sen", params: [{ name: "period", default: 26 }] },
  "Supertrend": { label: "Supertrend", params: [{ name: "period", default: 10 }, { name: "multiplier", default: 3 }] },
  "MACD": { label: "MACD" },
  "RSI": { label: "RSI", params: [{ name: "period", default: 14 }] },
  "Stochastic Oscillator": { label: "Stochastic Oscillator", params: [{ name: "k", default: 14 }, { name: "d", default: 3 }] },
  "CCI": { label: "CCI", params: [{ name: "period", default: 20 }] },
  "Ultimate Oscillator": { label: "Ultimate Oscillator" },
  "Williams %R": { label: "Williams %R", params: [{ name: "period", default: 14 }] },
  "Awesome Oscillator": { label: "Awesome Oscillator" },
  "Chaikin Oscillator": { label: "Chaikin Oscillator" },
  "DMI": { label: "DMI" },
  "TRIX": { label: "TRIX", params: [{ name: "period", default: 15 }] },
  "Momentum": { label: "Momentum", params: [{ name: "period", default: 10 }] },
  "Rate of Change": { label: "Rate of Change", params: [{ name: "period", default: 12 }] },
  "Schaff Trend Cycle": { label: "Schaff Trend Cycle" },
  "On Balance Volume": { label: "On Balance Volume" },
  "Volume Oscillator": { label: "Volume Oscillator" },
  "Money Flow Index": { label: "Money Flow Index", params: [{ name: "period", default: 14 }] },
  "Accumulation/Distribution": { label: "Accumulation/Distribution" },
  "Chaikin Money Flow": { label: "Chaikin Money Flow", params: [{ name: "period", default: 20 }] },
  "Ease of Movement": { label: "Ease of Movement" },
  "Negative Volume Index": { label: "Negative Volume Index" },
  "Positive Volume Index": { label: "Positive Volume Index" },
  "Volume Profile": { label: "Volume Profile" },
  "Klinger Oscillator": { label: "Klinger Oscillator" },
  "Alligator": { label: "Alligator" },
  "Fractals": { label: "Fractals" },
  "Gator Oscillator": { label: "Gator Oscillator" },
  "Market Facilitation Index": { label: "Market Facilitation Index" },
  "Standard Deviation": { label: "Standard Deviation", params: [{ name: "period", default: 20 }] },
  "ATR": { label: "ATR", params: [{ name: "period", default: 14 }] },
  "Envelope": { label: "Envelope", params: [{ name: "period", default: 20 }, { name: "multiplier", default: 2 }] },
  "RVI": { label: "RVI" },
  "Volatility Index": { label: "Volatility Index" },
  "Beta": { label: "Beta" },
}

export default function IndicatorsPanel({ selectedIndicator, onChange }: { selectedIndicator: string, onChange: (settings: any) => void }) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const def = INDICATORS[selectedIndicator]
  if (!def) return <div>未対応のインジケータです</div>

  useEffect(() => {
    if (def.params?.length === 0) return
    const initial: Record<string, any> = {}
    def.params?.forEach((param) => {
      initial[param.name] = param.default
    })
    onChange({ [selectedIndicator]: { ...initial, buy: 0, sell: 0 } })
  }, [selectedIndicator])

  const updateSetting = (key: string, value: number) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      }
      const merged = { ...settings, ...updated }
      onChange({ [selectedIndicator]: merged })
      return merged
    })
  }

  return (
    <div className="space-y-4 p-4 border rounded">
      <h2 className="text-lg font-bold">{def.label} の設定</h2>
      {def.params?.map((param) => (
        <div key={param.name} className="mb-2">
          <label>{param.name}</label>
          <input
            type="number"
            defaultValue={param.default}
            className="border ml-2 px-2"
            onChange={(e) => updateSetting(param.name, Number(e.target.value))}
          />
        </div>
      ))}
      <div className="mb-2">
        <label>buy 閾値</label>
        <input
          type="number"
          className="border ml-2 px-2"
          onChange={(e) => updateSetting("buy", Number(e.target.value))}
        />
      </div>
      <div>
        <label>sell 閾値</label>
        <input
          type="number"
          className="border ml-2 px-2"
          onChange={(e) => updateSetting("sell", Number(e.target.value))}
        />
      </div>
    </div>
  )
}
