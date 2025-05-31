import pandas as pd

def format_results(results: dict) -> pd.DataFrame:
    """
    トレード履歴辞書をDataFrame化して、損益などの整形を行う。
    """
    df = pd.DataFrame(results["trades"])
    if df.empty:
        return pd.DataFrame(columns=["entry_time", "exit_time", "entry_price", "exit_price", "pnl", "cumulative_pnl"])
    df["cumulative_pnl"] = df["pnl"].cumsum()
    return df

def summarize_results(results: dict) -> dict:
    """
    トレード結果を要約したメトリクスに変換（UI用）
    """
    return {
        "Final Balance": results["final_balance"],
        "Total PnL": results["total_pnl"],
        "Number of Trades": results["num_trades"]
    }
