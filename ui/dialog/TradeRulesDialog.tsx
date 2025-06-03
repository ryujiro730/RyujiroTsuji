import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function TradeRulesDialog({ tab, dialogOpen, setDialogOpen, onSelect }: {
  tab: string,
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  onSelect: (tab: string) => void,
}) {
  return (
    <Dialog key={tab} open={dialogOpen} onOpenChange={setDialogOpen}>
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
