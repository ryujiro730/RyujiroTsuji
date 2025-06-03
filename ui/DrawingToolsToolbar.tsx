import { useState } from "react"
import { Pencil, TrendingUp, Ruler } from "lucide-react"

export type Props = {
  activeTool: string | null
  setActiveTool: (tool: string | null) => void
}

const tools = [
  { id: "水平線", icon: <Ruler size={20} /> },
  { id: "トレンドライン", icon: <TrendingUp size={20} /> },
  { id: "フィボナッチ", icon: <Pencil size={20} /> },
]

export default function DrawingToolsToolbar({ activeTool, setActiveTool }: Props) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-white shadow-md">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`w-10 h-10 flex items-center justify-center rounded ${activeTool === tool.id ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
