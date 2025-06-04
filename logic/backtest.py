
import duckdb
import pandas as pd
import talib
from datetime import datetime, timedelta

def run_backtest(params: dict):
    symbol = params["symbol"]
    timeframe = params["timeframe"]
    tp = params["tp"]
    sl = params["sl"]
    risk_ratio = params["risk_ratio"]
    fixed_lot = params["fixed_lot"]
    weekdays = params.get("weekdays", [])
    start_date = pd.to_datetime(params["start_date"])
    end_date = pd.to_datetime(params["end_date"])
    max_entries = params["max_entries_per_day"]
    max_holding = params["max_holding_minutes"]
    logic_mode = params.get("condition_mode", "and")
    indicator_thresholds = params.get("indicators", {})

    file_path = f"./data/{symbol}/{timeframe}/{symbol}-{timeframe}.parquet"
    con = duckdb.connect()
    df = con.execute(f"SELECT * FROM read_parquet('{file_path}')").df()
    df["datetime"] = pd.to_datetime(df["Datetime"])
    df = df.sort_values("datetime")

    # 対応インジケータ全てを事前計算
    if "RSI" in indicator_thresholds:
        df["rsi"] = talib.RSI(df["close"], timeperiod=14)
    if "MACD" in indicator_thresholds:
        macd, macdsignal, _ = talib.MACD(df["close"], fastperiod=12, slowperiod=26, signalperiod=9)
        df["macd"] = macd
        df["macdsignal"] = macdsignal
    if "EMA" in indicator_thresholds:
        df["ema_fast"] = talib.EMA(df["close"], timeperiod=indicator_thresholds["EMA"].get("fast", 12))
        df["ema_slow"] = talib.EMA(df["close"], timeperiod=indicator_thresholds["EMA"].get("slow", 26))

    df = df.dropna()

    capital = 1_000_000
    entry_log = []
    active_trades = []
    daily_entries = {}

    for _, row in df.iterrows():
        dt = row["datetime"]
        if not (start_date <= dt <= end_date):
            continue
        if dt.strftime("%a") not in weekdays:
            continue

        date_str = dt.date().isoformat()
        if daily_entries.get(date_str, 0) >= max_entries:
            continue

        valid_entry = (logic_mode == "and")
        direction = None
        directions = []

        if "RSI" in indicator_thresholds:
            rsi = row.get("rsi")
            cond = False
            if rsi is not None:
                if rsi <= indicator_thresholds["RSI"].get("buy", -1):
                    cond = True
                    directions.append("buy")
                elif rsi >= indicator_thresholds["RSI"].get("sell", 999):
                    cond = True
                    directions.append("sell")
            valid_entry = valid_entry and cond if logic_mode == "and" else valid_entry or cond

        if "MACD" in indicator_thresholds:
            macd = row.get("macd")
            signal = row.get("macdsignal")
            cond = False
            if macd is not None and signal is not None:
                if macd > signal:
                    cond = True
                    directions.append("buy")
                elif macd < signal:
                    cond = True
                    directions.append("sell")
            valid_entry = valid_entry and cond if logic_mode == "and" else valid_entry or cond

        if "EMA" in indicator_thresholds:
            ema_fast = row.get("ema_fast")
            ema_slow = row.get("ema_slow")
            cond = False
            if ema_fast is not None and ema_slow is not None:
                if ema_fast > ema_slow:
                    cond = True
                    directions.append("buy")
                elif ema_fast < ema_slow:
                    cond = True
                    directions.append("sell")
            valid_entry = valid_entry and cond if logic_mode == "and" else valid_entry or cond

        if not valid_entry or not directions:
            continue

        direction = directions[0] if logic_mode == "or" else ("buy" if all(d == "buy" for d in directions) else "sell")
        if direction not in ("buy", "sell"):
            continue

        entry_price = row["close"]
        lot = fixed_lot or calc_lot(capital, entry_price, sl, risk_ratio)

        stop_price = entry_price - sl * 0.0001 if direction == "buy" else entry_price + sl * 0.0001
        take_price = entry_price + tp * 0.0001 if direction == "buy" else entry_price - tp * 0.0001
        exit_time = dt + timedelta(minutes=max_holding)

        active_trades.append({
            "entry_time": dt,
            "entry_price": entry_price,
            "take_price": take_price,
            "stop_price": stop_price,
            "exit_time": exit_time,
            "lot": lot,
            "direction": direction
        })
        daily_entries[date_str] = daily_entries.get(date_str, 0) + 1

        for trade in active_trades[:]:
            if dt >= trade["exit_time"] or \
               (trade["direction"] == "buy" and row["high"] >= trade["take_price"]) or \
               (trade["direction"] == "buy" and row["low"] <= trade["stop_price"]) or \
               (trade["direction"] == "sell" and row["low"] <= trade["take_price"]) or \
               (trade["direction"] == "sell" and row["high"] >= trade["stop_price"]):

                if trade["direction"] == "buy":
                    if row["high"] >= trade["take_price"]:
                        profit = (trade["take_price"] - trade["entry_price"]) * trade["lot"] * 10000
                    elif row["low"] <= trade["stop_price"]:
                        profit = (trade["stop_price"] - trade["entry_price"]) * trade["lot"] * 10000
                    else:
                        profit = (row["close"] - trade["entry_price"]) * trade["lot"] * 10000
                else:
                    if row["low"] <= trade["take_price"]:
                        profit = (trade["entry_price"] - trade["take_price"]) * trade["lot"] * 10000
                    elif row["high"] >= trade["stop_price"]:
                        profit = (trade["entry_price"] - trade["stop_price"]) * trade["lot"] * 10000
                    else:
                        profit = (trade["entry_price"] - row["close"]) * trade["lot"] * 10000

                capital += profit
                trade["exit_price"] = row["close"]
                trade["capital"] = capital
                entry_log.append(trade)
                active_trades.remove(trade)

    chart_data = df[["datetime", "open", "high", "low", "close"]].tail(200)
    chart_json = chart_data.to_dict(orient="records")

    return {
        "final_capital": capital,
        "entries": entry_log,
        "chart": chart_json
    }

def calc_lot(capital, price, sl_pips, risk_ratio):
    risk_amount = capital * risk_ratio
    sl_value = sl_pips * 0.0001
    lot = risk_amount / (sl_value * 10000)
    return lot
