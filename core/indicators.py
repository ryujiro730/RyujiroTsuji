import pandas as pd

def calculate_sma(df: pd.DataFrame, window: int, column: str = "close") -> pd.Series:
    """
    単純移動平均（SMA）
    """
    return df[column].rolling(window=window).mean()

def calculate_rsi(df: pd.DataFrame, window: int, column: str = "close") -> pd.Series:
    """
    相対力指数（RSI）
    """
    delta = df[column].diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=window).mean()
    avg_loss = loss.rolling(window=window).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def calculate_ema(df: pd.DataFrame, window: int) -> pd.Series:
    return df["close"].ewm(span=window, adjust=False).mean()

def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9, column: str = "close"):
    """
    MACD: EMA(fast) - EMA(slow)、Signal = EMA(MACD)、Hist = MACD - Signal
    """
    ema_fast = df[column].ewm(span=fast, adjust=False).mean()
    ema_slow = df[column].ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    macd_hist = macd_line - signal_line
    return macd_line, signal_line, macd_hist

def calculate_bb(df: pd.DataFrame, window: int = 20, column: str = "close"):
    """
    ボリンジャーバンド: 中央 = SMA, 上下 = ±2σ
    """
    middle_band = df[column].rolling(window=window).mean()
    std = df[column].rolling(window=window).std()
    upper_band = middle_band + (2 * std)
    lower_band = middle_band - (2 * std)
    return middle_band, upper_band, lower_band
