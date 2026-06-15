exports.handler = async (event) => {
  try {
    const { symbols } = JSON.parse(event.body);
    const symbolStr = symbols.join(',');

    const r = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${encodeURIComponent(symbolStr)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://finance.yahoo.com/",
        }
      }
    );

    const data = await r.json();
    const results = {};

    (data?.quoteResponse?.result || []).forEach(q => {
      results[q.symbol] = {
        price:     Math.round((q.regularMarketPrice || 0) * 100) / 100,
        changePct: Math.round((q.regularMarketChangePercent || 0) * 100) / 100,
      };
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
