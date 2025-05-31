# api.py（抜粋）
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import pandas as pd

from core.ohlc_loader import load_ohlc
from core.indicators import (
    calculate_sma, calculate_ema, calculate_rsi, calculate_macd, calculate_bb
)
from core.backtest_core import run_backtest

app = FastAPI()
DATA_PATH = Path("data/timeframes")

# --- モデル定義 ---
class IndicatorConfig(BaseModel):
    type: str  # "SMA", "EMA", "RSI", "MACD", etc
    period: Optional[int] = None
    params: Optional[dict] = None  # MACD: {"fast":12,"slow":26,"signal":9}
    alias: str
    outputs: Optional[List[str]] = None  # MACD: ["macd","signal","hist"]

class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    indicators: List[IndicatorConfig]
    entry_logic: str
    exit_logic: str

# --- インジケータ適用関数 ---
def apply_indicators(df, indicators: List[IndicatorConfig]) -> pd.DataFrame:
    for ind in indicators:
        if ind.type == "SMA":
            df[ind.alias] = calculate_sma(df, ind.period)

        elif ind.type == "EMA":
            df[ind.alias] = calculate_ema(df, ind.period)

        elif ind.type == "RSI":
            df[ind.alias] = calculate_rsi(df, ind.period)

        elif ind.type == "MACD":
            macd_line, signal_line, hist = calculate_macd(
                df,
                fast=ind.params.get("fast", 12),
                slow=ind.params.get("slow", 26),
                signal=ind.params.get("signal", 9)
            )
            df[ind.outputs[0]] = macd_line
            df[ind.outputs[1]] = signal_line
            df[ind.outputs[2]] = hist

        elif ind.type == "BB":  # ボリンジャーバンド
            middle, upper, lower = calculate_bb(df, ind.period)
            df[ind.outputs[0]] = middle
            df[ind.outputs[1]] = upper
            df[ind.outputs[2]] = lower

        else:
            raise ValueError(f"Unsupported indicator type: {ind.type}")
    return df

# --- APIエンドポイント ---
@app.post("/run-backtest")
def run_backtest_endpoint(request: BacktestRequest):
    df = load_ohlc(symbol=request.symbol, timeframe=request.timeframe, base_path=str(DATA_PATH))

    df = apply_indicators(df, request.indicators)

    entry_signal = df.eval(request.entry_logic)
    exit_signal = df.eval(request.exit_logic)

    results, trade_log = run_backtest(df, entry_signal, exit_signal)

    return {
        "results": results,
        "trades": trade_log.tail(10).to_dict(orient="records")
    }
