import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

export default function PresetSelectorDialog({ tab, onSelect }: { tab: string; onSelect: (tab: string) => void }) {
    console.log("✅ tab:", tab)
    return (
    <Popover key={tab}>
<PopoverTrigger asChild>
  <Button
    variant="ghost"
    onClick={() => onSelect("プリセット")}
    className="text-sm font-medium px-3 py-1 rounded-none border-b-2 transition-all duration-150"
  >
    プリセット
  </Button>
</PopoverTrigger>


      <PopoverContent className="w-60 bg-gray-100 border border-gray-300 p-4 space-y-2">
        {["プリセット1", "プリセット2", "プリセット3", "プリセット4", "プリセット5", "プリセット6", "プリセット7"].map((preset, index) => (
          <Button
            key={`preset-${index}`}
            variant="outline"
            className="w-full justify-start text-base font-bold text-black"
            onClick={() => {
              console.log(`✅ ${preset} clicked`)
            }}
          >
            {preset}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
