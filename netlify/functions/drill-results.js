// drill-results.js
// Extracts structured drill assay results from recent Athabasca Basin press releases.
// Pulls the basin news feed, sends release text to Claude, returns structured intercepts.
// Env var required: ANTHROPIC_API_KEY (already used by claude.js)

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM = `You are a mining-data extraction assistant. You are given recent press-release headlines and summaries from uranium exploration companies in Saskatchewan's Athabasca Basin.

Extract ONLY genuine drill assay results that are explicitly stated in the text. A valid result has at least an intercept thickness AND a uranium grade (U3O8). 

Return STRICT JSON only — no prose, no markdown fences. Schema:
{
  "results": [
    {
      "company": "string",
      "ticker": "string or null",
      "project": "string or null",
      "hole": "drill hole ID or null",
      "thickness_m": number or null,
      "grade_pct": number or null,
      "interval_text": "the exact intercept phrase, e.g. '12.5 m at 4.8% U3O8'",
      "depth_m": number or null,
      "date": "string or null",
      "url": "the source URL",
      "confidence": "high | medium | low"
    }
  ]
}

Rules:
- Only include results where a grade in % U3O8 and a thickness in metres are BOTH present.
- Do NOT invent or estimate numbers. If a release mentions drilling but gives no assay, skip it.
- confidence: "high" if hole ID + thickness + grade all present; "medium" if thickness + grade but no hole ID; "low" if numbers are approximate or ambiguous.
- If no valid results exist, return {"results": []}.`;

exports.handler = async () => {
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return json(500, { error: "Missing ANTHROPIC_API_KEY", results: [] });

  try {
    // 1. Pull the basin news feed (same source the dashboard uses)
    const base = process.env.URL || "https://athabasca-tracker.netlify.app";
    const newsRes = await fetch(`${base}/.netlify/functions/basin-news`, { signal: AbortSignal.timeout(12000) });
    const news = await newsRes.json();
    if (!Array.isArray(news) || news.length === 0) return json(200, { results: [], note: "no news" });

    // 2. Build a compact corpus for the model
    const corpus = news.slice(0, 14).map((n, i) =>
      `#${i+1} | ${n.company || ""} ${n.ticker ? "("+n.ticker+")" : ""} | ${n.date || ""}\nHeadline: ${n.headline || ""}\nSummary: ${n.summary || ""}\nURL: ${n.url || ""}`
    ).join("\n\n");

    // 3. Ask Claude to extract structured assays
    const aiRes = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: "user", content: `Extract drill assay results from these releases:\n\n${corpus}` }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    const aiData = await aiRes.json();
    if (aiData.error) throw new Error(aiData.error.message || "Claude error");

    const text = (aiData.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(clean); }
    catch { parsed = { results: [] }; }

    const results = (parsed.results || [])
      .filter(r => r.thickness_m != null && r.grade_pct != null)
      .map(r => ({
        ...r,
        // grade-thickness score (standard intercept-ranking metric)
        gt: +(Number(r.thickness_m) * Number(r.grade_pct)).toFixed(1),
      }))
      .sort((a, b) => b.gt - a.gt);

    return json(200, {
      count: results.length,
      generatedAt: new Date().toISOString(),
      source: "AI-extracted from public press releases",
      results,
    });
  } catch (err) {
    return json(500, { error: err.message, results: [] });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=1800" },
    body: JSON.stringify(body),
  };
}
