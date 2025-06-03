import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

type SymbolSelectorDialogProps = {
  tab: string
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
  symbols: string[]
  open: boolean
  setOpen: (open: boolean) => void
}

export default function SymbolSelectorDialog({
  tab,
  selectedSymbol,
  onSelectSymbol,
  symbols,
  open,
  setOpen,
}: SymbolSelectorDialogProps){
{
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
        >
          銘柄{selectedSymbol ? `（${selectedSymbol.toUpperCase()}）` : ""}
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
                setOpen(false)
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
}
