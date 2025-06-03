// components/BacktestResultModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BacktestResultModalProps {
  open: boolean;
  onClose: () => void;
  result?: {
    profit: number;
    winRate: number;
    totalTrades: number;
  };
}

export default function BacktestResultModal({
  open,
  onClose,
  result,
}: BacktestResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>バックテスト結果</DialogTitle>
          <DialogDescription>
            実行した戦略の結果です。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>総利益: {result?.profit ?? "-"} 円</div>
          <div>勝率: {result?.winRate ?? "-"}%</div>
          <div>取引回数: {result?.totalTrades ?? "-"} 回</div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>閉じる</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
