import pandas as pd
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import os

RESAMPLE_RULES = {
    "M5": "5min",
    "M15": "15min",
    "M30": "30min",
    "H1": "1H",
    "H4": "4H",
    "D1": "1D",
    "W1": "1W",
    "MN": "1M"
}

def resample_and_save(args):
    parquet_file, output_root = args
    try:
        df = pd.read_parquet(parquet_file)
        df["time"] = pd.to_datetime(df["time"])
        df.set_index("time", inplace=True)

        for label, rule in RESAMPLE_RULES.items():
            resampled = df.resample(rule).agg({
                "open": "first",
                "high": "max",
                "low": "min",
                "close": "last",
                "volume": "sum"
            }).dropna().reset_index()

            symbol = parquet_file.parent.name
            output_dir = output_root / symbol / label
            output_dir.mkdir(parents=True, exist_ok=True)

            save_path = output_dir / parquet_file.name
            resampled.to_parquet(save_path, index=False)
            print(f"✅ {symbol} {label} → {save_path}")

    except Exception as e:
        print(f"❌ Error in {parquet_file}: {e}")

def run_parallel_resampling(input_root: str, output_root: str):
    input_root = Path(input_root)
    output_root = Path(output_root)
    parquet_files = list(input_root.glob("*/*.parquet"))

    print(f"📦 Found {len(parquet_files)} files for processing")

    if not parquet_files:
        print("⚠️ No parquet files found. Check input path or file structure.")
        return

    # Windows対応のために引数をタプルにする
    args_list = [(file, output_root) for file in parquet_files]

    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        executor.map(resample_and_save, args_list)

# 🔥 これを最重要ブロックに入れる
if __name__ == "__main__":
    input_directory = r"D:\UserData\Documents\Backtest_tool_Project\data\processed_1min"
    output_directory = r"D:\UserData\Documents\Backtest_tool_Project\data\timeframes"

    run_parallel_resampling(input_directory, output_directory)
