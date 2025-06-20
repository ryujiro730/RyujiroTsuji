import { useState, useEffect } from "react";
import CandleChart from "./MainChart"; // ローソク足用
import IndicatorOverlayChart from "./IndicatorOverlayChart";
import IndicatorsPanel, { INDICATORS } from "./dialogs/IndicatorsPanel";

export default function MainChartContainer({ selectedSymbol, selectedTimeframe, chartHeight }) {
  const [selectedIndicators, setSelectedIndicators] = useState<{name: string, settings: any}[]>([]);

const handleAddIndicator = (name: string, settings: any) => {
  setSelectedIndicators(prev => [...prev, { name, settings }])
}
const handleRemoveIndicator = (idx: number) => {
  setSelectedIndicators(prev => prev.filter((_, i) => i !== idx))
}

// API連携
useEffect(() => {
  if (selectedIndicators.length === 0) {
    setIndicatorSeries([]);
    return;
  }
  // デフォルトパラメータでAPIに渡す例
  const indicators = Object.fromEntries(selectedIndicators.map(name => [
    name, INDICATORS[name].params?.reduce((acc, param) => {
      acc[param.name] = param.default;
      return acc;
    }, {} as any) || {}
  ]));
  fetch("/api/indicators", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol: selectedSymbol,
      timeframe: selectedTimeframe,
      indicators,
    }),
  })
    .then(res => res.json())
    .then(data => setIndicatorSeries(data));
}, [selectedIndicators, selectedSymbol, selectedTimeframe]);


  // ローソク足データも必要ならここでfetch or MainChartからもらう

  return (
    <div className="flex">
      <div className="w-1/4 p-2">
        {/* 単純にボタンで選択してパネル表示（仮実装） */}
        {Object.keys(INDICATORS).map(name => (
          <button key={name} onClick={() => handleIndicatorChange(name, INDICATORS[name].params?.reduce((acc, param) => {
            acc[param.name] = param.default;
            return acc;
          }, {} as any) || {})} className="block mb-2">{name}</button>
        ))}
        {/* 編集フォームを必要ならここに追加 */}
        {/* <IndicatorsPanel ... /> */}
      </div>
      <div className="w-3/4">
        <IndicatorOverlayChart
          candleData={candleData}
          indicatorSeries={indicatorSeries}
          height={chartHeight}
        />
      </div>
    </div>
  );
}
