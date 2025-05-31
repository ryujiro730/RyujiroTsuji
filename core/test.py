import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from ohlc_loader import load_ohlc
from indicators import calculate_sma
from backtest_core import run_backtest
from result_formatter import format_results, summarize_results

# ロード
df = load_ohlc("USDJPY", "H1", base_path="data/timeframes")

# 簡易なエントリー・イグジット条件
df["sma"] = calculate_sma(df, window=5)
entry_signal = df["close"] > df["sma"]
exit_signal = df["close"] < df["sma"]

# バックテスト
result = run_backtest(df, entry_signal, exit_signal)

# 出力
df_trades = format_results(result)
summary = summarize_results(result)

print(df_trades.head())
print(summary)
