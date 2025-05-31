from pathlib import Path
import shutil

# 元データの場所
input_dir = Path(r"D:\UserData\Documents\Backtest_tool_Project\data\merged")
output_root = Path(r"D:\UserData\Documents\Backtest_tool_Project\data\timeframes")

# 全 .parquet ファイルを対象に処理
for file in input_dir.glob("*.parquet"):
    # ファイル名 → AUDJPY_H1.parquet など
    name = file.stem  # 拡張子なし
    if "_" not in name:
        print(f"❌ 無視（形式エラー）: {name}")
        continue

    symbol, timeframe = name.split("_")
    out_dir = output_root / symbol / timeframe
    out_dir.mkdir(parents=True, exist_ok=True)

    out_path = out_dir / file.name
    shutil.move(str(file), str(out_path))
    print(f"✅ Moved: {file.name} → {out_path}")
