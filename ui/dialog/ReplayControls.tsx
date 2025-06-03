import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Rewind, Play, Pause, FastForward, Square } from "lucide-react"

type ReplayControlsProps = {
  onSelect: (tab: string) => void
}

export default function ReplayControls({ onSelect }: ReplayControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => onSelect("リプレイ")}
          className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
        >
          リプレイ
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-4 flex justify-between items-center space-x-2">
        <Button size="icon" variant="outline">
          <Rewind className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline">
          <Play className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline">
          <Pause className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline">
          <Square className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline">
          <FastForward className="w-5 h-5" />
        </Button>
      </PopoverContent>
    </Popover>
  )
}
