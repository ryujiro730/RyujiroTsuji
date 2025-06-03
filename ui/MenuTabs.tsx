import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import SymbolSelectorDialog from "./dalogs/SymbolSelectorDialog"
import IndicatorSelectorDialog from "./dalogs/IndicatorDialog"
import ReplayControls from "./dalogs/ReplayControls"
import PresetSelectorPopover from "./dalogs/PresetSelectorDialog"
import AccountBalanceDialog from "./dalogs/AccountBalanceDialog"
import TradeRulesDialog from "./dalogs/TradeRulesDialog"
import BacktestExecuteButton from "@/components/BacktestExecuteButton"
import { TABS } from "@/components/ui/tabs"

export type MenuTabsProps = {
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
  selectedTab: string
  onSelect: (tab: string) => void
  activeTool: string | null
  setActiveTool: (tool: string | null) => void
}

const TABS = [
  "インジケーター",
  "銘柄",
  "リプレイ",
  "プリセット",
  "口座",
  "トレードルール",
]

export default function MenuTabs({
  selectedSymbol,
  onSelectSymbol,
  selectedTab,
  onSelect,
  activeTool,
  setActiveTool,
}: MenuTabsProps) {
  const [symbolMenuOpen, setSymbolMenuOpen] = useState(false)
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false)
  const [symbols, setSymbols] = useState<string[]>([])
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [balance, setBalance] = useState(0)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)

  useEffect(() => {
    fetch("/api/symbols")
      .then((res) => res.json())
      .then((data) => setSymbols(data))
      .catch((err) => console.error("⚠️ シンボル読み込み失敗", err))
  }, [])

  return (
    <div className="flex flex-col gap-2 px-2 py-1">
      <div className="flex px-2 py-1 gap-2 items-center justify-between w-full">
        <div className="flex gap-2">
          {TABS.map((tab) => {
            if (tab === "銘柄") {
              return (
                <SymbolSelectorDialog
                  key={tab}
                  tab={tab}
                  symbols={symbols}
                  selectedSymbol={selectedSymbol}
                  symbolMenuOpen={symbolMenuOpen}
                  onSelectSymbol={onSelectSymbol}
                  open={symbolMenuOpen}
                  setOpen={setSymbolMenuOpen}
                />
              )
            }

            if (tab === "インジケーター") {
              return (
                <IndicatorSelectorDialog
                  key={tab}
                  tab={tab}
                  dialogOpen={indicatorDialogOpen}
                  setDialogOpen={setIndicatorDialogOpen}
                  onSelect={onSelect}
                />
              )
            }

            if (tab === "リプレイ") {
              return <ReplayControls key={tab} onSelect={onSelect} />
            }

            if (tab === "プリセット") {
              return <PresetSelectorPopover key={tab} onSelect={onSelect} />
            }

            if (tab === "口座") {
              return (
                <AccountBalanceDialog
                  key={tab}
                  tab={tab}
                  dialogOpen={accountDialogOpen}
                  setDialogOpen={setAccountDialogOpen}
                  balance={balance}
                  setBalance={setBalance}
                  onSelect={onSelect}
                />
              )
            }

            if (tab === "トレードルール") {
              return (
                <div key={tab} className="flex gap-2 items-center">
                  <TradeRulesDialog
                    tab={tab}
                    dialogOpen={ruleDialogOpen}
                    setDialogOpen={setRuleDialogOpen}
                    onSelect={onSelect}
                  />
                  <BacktestExecuteButton />
                </div>
              )
            }

            // デフォルト：ボタン
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
      </div>
    </div>
  )
}
