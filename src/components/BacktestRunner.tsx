import React, { useState } from "react";
import { runBacktestMock, BacktestResult } from "../utils/runBacktestMock";
import { VictoryChart, VictoryLine } from "victory";



const BacktestRunner = () => {
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRun = () => {
    const params = {
      indicators: { RSI: { long: 30, short: 70 } }, // 仮の値
      capital: 1000000,
    };
    const res = runBacktestMock(params);
    setResult(res);
  };

  return (
    <div>
      <button onClick={handleRun}>検証を実行</button>

      {result && (
      <VictoryChart>
        <VictoryLine
          data={result.equityCurve.map((v, i) => ({ x: i, y: v }))}
        />
      </VictoryChart>
    )}
    </div>
  );
};

export default BacktestRunner;
