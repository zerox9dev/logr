import { NextResponse } from "next/server";

const SUPPORTED = new Set(["UAH", "USD", "PLN", "EUR"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") || "USD").toUpperCase();
  const symbolsParam = searchParams.get("symbols") || "";
  const symbols = symbolsParam
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  if (!SUPPORTED.has(base)) {
    return NextResponse.json({ error: "Unsupported base currency" }, { status: 400 });
  }

  if (symbols.length === 0 || symbols.some((item) => !SUPPORTED.has(item))) {
    return NextResponse.json({ error: "Unsupported symbols list" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 502 });
    }

    const payload = await upstream.json();
    const rates = payload?.rates || {};

    const mapped = symbols.reduce<Record<string, number>>((acc, symbol) => {
      const value = rates[symbol];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        acc[symbol] = value;
      }
      return acc;
    }, {});

    if (!mapped || Object.keys(mapped).length !== symbols.length) {
      return NextResponse.json({ error: "Missing rates in upstream response" }, { status: 502 });
    }

    return NextResponse.json({ base, rates: mapped });
  } catch {
    return NextResponse.json({ error: "Unexpected exchange-rate error" }, { status: 502 });
  }
}
