exports.handler = async (event) => {
  try {
    const { symbols } = JSON.parse(event.body);
    const results = {};
    await Promise.all(symbols.map(async (sym) => {
      try {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        const d = await r.json();
        const q = d?.chart?.result?.[0];
        if (q) {
          const price = q.meta.regularMarketPrice;
          const prev  = q.meta.previousClose;
          results[sym] = {
            price: Math.round(price * 100) / 100,
            changePct: Math.round(((price - prev) / prev) * 10000) / 100
          };
        }
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
