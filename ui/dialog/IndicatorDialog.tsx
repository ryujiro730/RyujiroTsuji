// components/IndicatorDialog.tsx
import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import IndicatorsPanel, { INDICATORS } from "@/components/dalogs/IndicatorsPanel"

const INDICATOR_CATEGORIES = {
  "トレンド": [
    "Moving Average", "Exponential Moving Average", "Bollinger Bands", "Parabolic SAR",
    "Ichimoku Kinko Hyo", "Average Directional Index", "Moving Average Envelope",
    "Fractal Adaptive Moving Average", "Pivot Points", "Donchian Channel",
    "Trendlines", "Linear Regression", "Kijun-Sen", "Supertrend"
  ],
  "オシレーター": [
    "MACD", "RSI", "Stochastic Oscillator", "CCI", "Ultimate Oscillator",
    "Williams %R", "Awesome Oscillator", "Chaikin Oscillator", "DMI", "TRIX",
    "Momentum", "Rate of Change", "Schaff Trend Cycle"
  ],
  "ボリューム": [
    "On Balance Volume", "Volume Oscillator", "Money Flow Index", "Accumulation/Distribution",
    "Chaikin Money Flow", "Ease of Movement", "Negative Volume Index",
    "Positive Volume Index", "Volume Profile", "Klinger Oscillator"
  ],
  "ビル・ウィリアムズ": [
    "Alligator", "Awesome Oscillator", "Fractals", "Gator Oscillator", "Market Facilitation Index"
  ],
  "統計・ボラティリティ": [
    "Standard Deviation", "ATR", "Envelope", "RVI", "Volatility Index", "Beta"
  ]
} as const

export default function IndicatorDialog({
  tab = "インジケータ",
  dialogOpen,
  setDialogOpen,
  onSelect,
}: {
  tab?: string
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSelect: (settings: Record<string, any>) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof INDICATOR_CATEGORIES>("トレンド")
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null)
  const [settings, setSettings] = useState<Record<string, any>>({})

  const handleChange = (data: Record<string, any>) => {
    const updated = { ...settings, ...data }
    setSettings(updated)
    console.log("🎯 updated setting:", updated)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => setDialogOpen(true)}
          className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
        >
          {tab}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[1800px] min-w-[600px]" aria-describedby="indicator-dialog-desc">
        <DialogHeader>
          <DialogTitle>インジケーターを選択</DialogTitle>
        </DialogHeader>
        <p id="indicator-dialog-desc" className="sr-only">インジケータをカテゴリ別に選択し、パラメータを設定できます</p>

        {!selectedIndicator ? (
          <div className="grid grid-cols-5 gap-6 pt-4">
            <div className="col-span-1 flex flex-col gap-2">
              {Object.keys(INDICATOR_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setSelectedCategory(category as keyof typeof INDICATOR_CATEGORIES)}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="col-span-4">
              <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {INDICATOR_CATEGORIES[selectedCategory].map((name) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const found = Object.keys(INDICATORS).find((key) => INDICATORS[key].label === name)
                      if (found) {
                        setSelectedIndicator(found)
                      } else {
                        alert("このインジケーターは未対応です")
                      }
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <IndicatorsPanel
              selectedIndicator={selectedIndicator}
              onChange={handleChange}
            />
            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={() => setSelectedIndicator(null)}>
                戻る
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  console.log("保存されたインジケータ設定:", settings)
                  onSelect(settings)
                  setDialogOpen(false)
                  setSelectedIndicator(null)
                }}
              >
                保存して閉じる
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
