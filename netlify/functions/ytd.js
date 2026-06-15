exports.handler = async (event) => {
  try {
    const { symbols } = JSON.parse(event.body);
    const JAN_1_2026 = 1735689600;
    const now = Math.floor(Date.now() / 1000);

    // Get Yahoo Finance cookie + crumb
    const cookieRes = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
    });
    const rawCookies = (cookieRes.headers.get("set-cookie") || "")
      .split(",").map(c => c.split(";")[0].trim()).join("; ");

    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": "Mozilla/5.0", "Cookie": rawCookies }
    });
    const crumb = await crumbRes.text();

    const results = {};

    await Promise.all(symbols.map(async ({ id, ticker }) => {
      try {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${JAN_1_2026}&period2=${now}&interval=1mo&crumb=${encodeURIComponent(crumb)}`,
          { headers: { "User-Agent": "Mozilla/5.0", "Cookie": rawCookies, "Accept": "application/json" } }
        );
        const d = await r.json();
        const closes = d?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(p => p != null) || [];
        if (closes.length < 2) return;
        const ytd = Math.round(((closes[closes.length-1] - closes[0]) / closes[0]) * 10000) / 100;
        results[id] = { ytd };
      } catch(e) {}
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
