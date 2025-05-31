import pandas as pd
from pathlib import Path

def load_ohlc(symbol: str, timeframe: str, base_path: str = "data/timeframes") -> pd.DataFrame:
    """
    通貨ペアと時間足を指定して単一のParquetファイルを読み込む。
    ファイル名は "{symbol}_{timeframe}.parquet" を想定。
    """
    file_path = Path(base_path) / symbol / timeframe / f"{symbol}_{timeframe}.parquet"
    if not file_path.exists():
        raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")

    df = pd.read_parquet(file_path)
    df["time"] = pd.to_datetime(df["time"])
    df = df.sort_values("time").reset_index(drop=True)
    return df
