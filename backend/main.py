from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import talib
from .logic.run_backtest import run_backtest


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# バックテスト用エンドポイント
@app.post("/run-backtest")
async def run(request: Request):
    body = await request.json()
    result = run_backtest(body)
    return result

# インジケータ計算用
class IndicatorRequest(BaseModel):
    symbol: str
    timeframe: str
    indicators: dict

@app.post("/api/indicators")
async def calc_indicators(req: IndicatorRequest):
    parquet_path = f"ui/ui/public/data/{req.symbol}/{req.timeframe}/{req.symbol}-{req.timeframe}.parquet"
    df = pd.read_parquet(parquet_path)

    df["timestamp"] = df["Datetime"].astype("int64") // 10**9
    print("columns:", df.columns)
    print("close dtype:", df["close"].dtype)
    print("first closes:", df["close"].head(10))
    print("first datetimes:", df["Datetime"].head(10))
    print("first timestamps:", df["timestamp"].head(10))

    # 例えばMoving Averageだけテスト
    values = talib.SMA(df["close"], timeperiod=14)
    print("first SMA values:", values.head(20))
    print("number of notna in SMA:", values.notna().sum())
    result = []

    for name, params in req.indicators.items():
        period = params.get("period", 14)
        values = None

        try:
            if name in ["SMA", "Moving Average"]:
                values = talib.SMA(df["close"], timeperiod=period)
            elif name in ["EMA", "Exponential Moving Average"]:
                values = talib.EMA(df["close"], timeperiod=period)
            elif name == "Bollinger Bands":
                upper, middle, lower = talib.BBANDS(df["close"], timeperiod=period)
                values = middle
            elif name == "Parabolic SAR":
                values = talib.SAR(df["high"], df["low"])
            elif name == "Ichimoku Kinko Hyo":
                high_9 = df["high"].rolling(window=9).max()
                low_9 = df["low"].rolling(window=9).min()
                values = (high_9 + low_9) / 2
            elif name in ["Average Directional Index", "ADX"]:
                values = talib.ADX(df["high"], df["low"], df["close"], timeperiod=period)
            elif name == "RSI":
                values = talib.RSI(df["close"], timeperiod=period)
            elif name == "MACD":
                macd, _, _ = talib.MACD(df["close"])
                values = macd
            elif name == "Stochastic Oscillator":
                k, d = talib.STOCH(df["high"], df["low"], df["close"])
                values = k
            elif name == "CCI":
                values = talib.CCI(df["high"], df["low"], df["close"], timeperiod=period)
            elif name == "Ultimate Oscillator":
                values = talib.ULTOSC(df["high"], df["low"], df["close"])
            elif name in ["Williams %R", "WILLR"]:
                values = talib.WILLR(df["high"], df["low"], df["close"], timeperiod=period)
            elif name == "Awesome Oscillator":
                median_price = (df["high"] + df["low"]) / 2
                fast = median_price.rolling(window=5).mean()
                slow = median_price.rolling(window=34).mean()
                values = fast - slow
            elif name == "Chaikin Oscillator":
                values = talib.ADOSC(df["high"], df["low"], df["close"], df["volume"])
            elif name == "DMI":
                values = talib.ADX(df["high"], df["low"], df["close"], timeperiod=period)
            elif name == "TRIX":
                values = talib.TRIX(df["close"], timeperiod=period)
            elif name == "Momentum":
                values = talib.MOM(df["close"], timeperiod=period)
            elif name == "Rate of Change":
                values = talib.ROC(df["close"], timeperiod=period)
            elif name == "Schaff Trend Cycle":
                values = talib.STOCH(df["high"], df["low"], df["close"])[0]
            elif name == "On Balance Volume":
                values = talib.OBV(df["close"], df["volume"])
            elif name == "Volume Oscillator":
                values = df["volume"].pct_change()
            elif name == "Money Flow Index":
                values = talib.MFI(df["high"], df["low"], df["close"], df["volume"], timeperiod=period)
            elif name == "Accumulation/Distribution":
                values = talib.AD(df["high"], df["low"], df["close"], df["volume"])
            elif name == "Chaikin Money Flow":
                mfv = ((df["close"] - df["low"]) - (df["high"] - df["close"])) / (df["high"] - df["low"]) * df["volume"]
                values = mfv.rolling(window=period).sum() / df["volume"].rolling(window=period).sum()
            elif name == "Ease of Movement":
                distance = ((df["high"] + df["low"]) / 2).diff()
                box_ratio = (df["volume"] / (df["high"] - df["low"]))
                values = distance / box_ratio
            elif name == "Negative Volume Index":
                values = talib.NVI(df["close"], df["volume"])
            elif name == "Positive Volume Index":
                values = talib.PVI(df["close"], df["volume"])
            elif name == "Volume Profile":
                values = df["volume"]
            elif name == "Klinger Oscillator":
                values = talib.KAMA(df["close"], timeperiod=period)
            elif name == "Alligator":
                jaw = talib.SMA(df["close"], timeperiod=13)
                teeth = talib.SMA(df["close"], timeperiod=8)
                lips = talib.SMA(df["close"], timeperiod=5)
                values = (jaw + teeth + lips) / 3
            elif name == "Fractals":
                values = df["high"].rolling(window=5).max()
            elif name == "Gator Oscillator":
                values = talib.ADX(df["high"], df["low"], df["close"], timeperiod=period)
            elif name == "Market Facilitation Index":
                values = (df["high"] - df["low"]) / df["volume"]
            elif name == "Standard Deviation":
                values = talib.STDDEV(df["close"], timeperiod=period)
            elif name == "ATR":
                values = talib.ATR(df["high"], df["low"], df["close"], timeperiod=period)
            elif name == "Envelope":
                sma = talib.SMA(df["close"], timeperiod=period)
                values = sma
            elif name == "RVI":
                values = (df["close"] - df["open"]) / (df["high"] - df["low"])
            elif name == "Volatility Index":
                values = talib.STDDEV(df["close"], timeperiod=period)
            elif name == "Beta":
                values = df["close"].pct_change().rolling(window=period).std()
        except Exception as e:
            print(f"Error in {name}:", e)
            continue

        if values is not None:
            result.append({
                "name": name,
                "data": [
                    {"time": int(t), "value": float(v)}
                    for t, v in zip(df["timestamp"], values) if pd.notna(v)
                ]
            })

    return result
