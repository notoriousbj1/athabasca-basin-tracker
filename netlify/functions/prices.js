exports.handler = async (event) => {
  try {
    const { symbols } = JSON.parse(event.body);

    // Step 1 — get a Yahoo Finance session cookie
    const cookieRes = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }
    });
    const rawCookies = (cookieRes.headers.get("set-cookie") || "")
      .split(",").map(c => c.split(";")[0].trim()).join("; ");

    // Step 2 — get a crumb token
    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Cookie": rawCookies
      }
    });
    const crumb = await crumbRes.text();

    // Step 3 — batch quote request
    const quoteRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&crumb=${encodeURIComponent(crumb)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Cookie": rawCookies,
          "Accept": "application/json"
        }
      }
    );

    const data = await quoteRes.json();
    const results = {};

    (data?.quoteResponse?.result || []).forEach(q => {
      results[q.symbol] = {
        price:     Math.round((q.regularMarketPrice        || 0) * 100) / 100,
        changePct: Math.round((q.regularMarketChangePercent || 0) * 100) / 100,
      };
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
