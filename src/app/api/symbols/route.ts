import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const PARQUET_ROOT = "D:/UserData/Documents/MarketData_parquet"

export async function GET() {
  try {
    const symbols = fs
      .readdirSync(PARQUET_ROOT)
      .filter((name) =>
        fs.statSync(path.join(PARQUET_ROOT, name)).isDirectory()
      )

    return NextResponse.json(symbols)
  } catch (err) {
    console.error("❌ 銘柄フォルダ読み込みエラー", err)
    return NextResponse.json([], { status: 500 })
  }
}
