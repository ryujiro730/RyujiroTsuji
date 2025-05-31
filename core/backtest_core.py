# core/backtest_core.py
import pandas as pd

def run_backtest(df: pd.DataFrame, entry_signal: pd.Series, exit_signal: pd.Series, initial_balance: float = 1_000_000):
    balance = initial_balance
    position = 0
    entry_price = 0
    trade_log = []

    for i in range(len(df)):
        if entry_signal.iloc[i] and position == 0:
            position = 1
            entry_price = df["close"].iloc[i]
            entry_time = df["time"].iloc[i]

        elif exit_signal.iloc[i] and position == 1:
            exit_price = df["close"].iloc[i]
            pnl = exit_price - entry_price
            balance += pnl
            trade_log.append({
                "entry_time": entry_time,
                "exit_time": df["time"].iloc[i],
                "entry_price": entry_price,
                "exit_price": exit_price,
                "pnl": pnl,
                "cumulative_balance": balance
            })
            position = 0

    trade_df = pd.DataFrame(trade_log)
    results = {
        "Final Balance": balance,
        "Total PnL": trade_df["pnl"].sum(),
        "Number of Trades": len(trade_df),
    }
    return results, trade_df
