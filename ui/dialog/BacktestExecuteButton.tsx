import { Button } from "@/components/ui/button"

export default function BacktestExecuteButton() {
  const handleExecute = () => {
    console.log("\u25b6 \u30d0\u30c3\u30af\u30c6\u30b9\u30c8\u958b\u59cb (\u30c0\u30df\u30fc)")
    // TODO: API 接続や実行ロジックを付加
  }

  return (
    <Button
      variant="default"
      className="ml-auto"
      onClick={handleExecute}
    >
      実行
    </Button>
  )
}
