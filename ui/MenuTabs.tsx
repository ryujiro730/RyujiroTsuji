import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const TABS = ["インジケーター", "銘柄", "リプレイ", "プリセット", "口座", "トレードルール"]

export type MenuTabsProps = {
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
  selectedTab: string
  onSelect: (tab: string) => void
}

export default function MenuTabs({ selectedSymbol, onSelectSymbol, selectedTab, onSelect }: MenuTabsProps) {
  const [symbolMenuOpen, setSymbolMenuOpen] = useState(false)
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [symbols, setSymbols] = useState<string[]>([])
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    fetch("/api/symbols")
      .then((res) => res.json())
      .then((data) => setSymbols(data))
      .catch((err) => console.error("⚠️ シンボル読み込み失敗", err))
  }, [])

  return (
    <div className="flex px-2 py-1 gap-2">
      {TABS.map((tab) => {
        if (tab === "銘柄") {
          return (
            <Popover key={tab} open={symbolMenuOpen} onOpenChange={setSymbolMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
                  onClick={() => onSelect("銘柄")}
                >
                  {tab}{selectedSymbol ? `（${selectedSymbol.toUpperCase()}）` : ""}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 max-h-96 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {symbols.map((symbol) => (
                    <Button
                      key={symbol}
                      variant="ghost"
                      className="justify-start text-left"
                      onClick={() => {
                        onSelectSymbol(symbol)
                        setSymbolMenuOpen(false)
                      }}
                    >
                      {symbol.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )
        }

        if (tab === "インジケーター") {
          return (
            <>
              <Dialog key={tab} open={indicatorDialogOpen} onOpenChange={setIndicatorDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSelect("インジケーター")
                      setIndicatorDialogOpen(true)
                    }}
                    className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
                  >
                    {tab}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>インジケーターを選択</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-sm">カテゴリ</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>トレンド</li>
                        <li>オシレーター</li>
                        <li>ボリューム</li>
                        <li>ビル・ウィリアムズ</li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="font-medium text-sm">インジケーター一覧</div>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        <Button variant="outline" size="sm">Moving Average</Button>
                        <Button variant="outline" size="sm">Bollinger Bands</Button>
                        <Button variant="outline" size="sm">Envelopes</Button>
                        <Button variant="outline" size="sm">Ichimoku Kinko Hyo</Button>
                        <Button variant="outline" size="sm">Parabolic SAR</Button>
                        <Button variant="outline" size="sm">Standard Deviation</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )
        }

        if (tab === "口座") {
          return (
            <Dialog key={tab} open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSelect("口座")}
                  className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
                >
                  {tab}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>残高</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(parseInt(e.target.value) || 0)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => addBalance(amount)}
                      >
                        {amount.toLocaleString()}円
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )
        }

        if (tab === "トレードルール") {
          return (
            <Dialog key={tab} open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSelect("トレードルール")}
                  className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
                >
                  {tab}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>トレードルール</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-4 py-4">
                  <Label>TP/SL</Label>
                  <Input placeholder="TP" className="col-span-1" />
                  <Input placeholder="SL" className="col-span-1" />
                  <div></div>
                  <Label>リスク資金比率</Label>
                  <Input placeholder="%" className="col-span-1" />
                  <Label>固定ロット</Label>
                  <Input placeholder="lot" className="col-span-1" />
                  <div></div>
                  <Label>曜日</Label>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    {["月", "火", "水", "木", "金", "土", "日"].map(day => (
                      <Button key={day} variant="outline" size="sm">{day}</Button>
                    ))}
                  </div>
                  <Label>期間</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input placeholder="YYYY/MM/DD" className="w-40" />
                    <span>〜</span>
                    <Input placeholder="YYYY/MM/DD" className="w-40" />
                  </div>
                  <Label>1日最大エントリー数</Label>
                  <Input className="col-span-1" />
                  <Label>ポジション保有時間</Label>
                  <Input placeholder="分" className="col-span-1" />
                  <Label>条件分岐</Label>
                  <div className="col-span-3 flex gap-2">
                    <Button variant="outline">OR</Button>
                    <Button variant="outline">AND</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )
        }

        return (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => onSelect(tab)}
            className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
          >
            {tab}
          </Button>
        )
      })}
    </div>
  )
}