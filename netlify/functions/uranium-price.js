// uranium-price.js
// Fetches U3O8 spot price from Trading Economics

exports.handler = async () => {
  try {
    // Fetch Trading Economics uranium page
    const res = await fetch("https://tradingeconomics.com/commodity/uranium", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Try multiple extraction patterns Trading Economics uses
    let price = null, change = null, changePct = null;

    // Pattern 1: JSON-LD structured data
    const jsonLd = html.match(/"price"\s*:\s*"?([\d.]+)"?/i);
    if (jsonLd) price = parseFloat(jsonLd[1]);

    // Pattern 2: span id="p" (common TE pattern)
    const spanP = html.match(/<span[^>]+id="p"[^>]*>([\d.]+)<\/span>/i);
    if (!price && spanP) price = parseFloat(spanP[1]);

    // Pattern 3: data-value attribute
    const dataVal = html.match(/data-value="([\d.]+)"[^>]*>\s*Uranium/i)
                 || html.match(/Uranium[^<]*data-value="([\d.]+)"/i);
    if (!price && dataVal) price = parseFloat(dataVal[1]);

    // Pattern 4: og:description with price
    const ogDesc = html.match(/uranium[^\d]*([\d]+\.[\d]+)\s*USD/i);
    if (!price && ogDesc) price = parseFloat(ogDesc[1]);

    // Pattern 5: look for price in title or h1
    const titlePrice = html.match(/uranium[^<\d]*([\d]+\.[\d]{1,2})/i);
    if (!price && titlePrice) price = parseFloat(titlePrice[1]);

    // Extract week change
    const chgMatch = html.match(/class="[^"]*green[^"]*"[^>]*>\s*([+\-][\d.]+)/i)
                  || html.match(/([+-][\d.]+)\s*%?\s*<\/span>/i);
    if (chgMatch) change = parseFloat(chgMatch[1]);

    // Try to extract % change
    const pctMatch = html.match(/([+-][\d.]+)%/);
    if (pctMatch) changePct = parseFloat(pctMatch[1]);

    // Validate we got something sensible (uranium trades 20-200 range)
    if (!price || price < 20 || price > 200) {
      throw new Error(`Invalid price extracted: ${price}`);
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        price:         Math.round(price * 100) / 100,
        weekChange:    change   || 0,
        weekChangePct: changePct || 0,
        source:        "Trading Economics",
        sourceUrl:     "https://tradingeconomics.com/commodity/uranium",
        date:          new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      }),
    };

  } catch (err) {
    // Fallback: use Claude AI to get the price if scraping fails
    try {
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 200,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Search tradingeconomics.com for the current uranium U3O8 spot price in USD per pound. Return ONLY JSON (no markdown): {"price":79.50,"weekChange":-0.50,"weekChangePct":-0.6,"source":"Trading Economics"}`
          }]
        }),
      });
      const aiData = await aiRes.json();
      const text = aiData.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      if (parsed.price && parsed.price > 20) {
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ ...parsed, sourceUrl: "https://tradingeconomics.com/commodity/uranium", date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) }),
        };
      }
    } catch {}

    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
