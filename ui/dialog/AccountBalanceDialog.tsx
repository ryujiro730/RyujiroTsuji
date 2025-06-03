import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AccountBalanceDialog({ tab, dialogOpen, setDialogOpen, onSelect }: {
  tab: string
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSelect: (tab: string) => void
}) {
  const [balance, setBalance] = useState(0)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => {
            onSelect(tab)
            setDialogOpen(true)
          }}
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
                key={`amount-${amount}`}
                variant="outline"
                onClick={() => setBalance(balance + amount)}
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
