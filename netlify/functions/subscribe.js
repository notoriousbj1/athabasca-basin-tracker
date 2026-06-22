// subscribe.js
// Adds an email to a Beehiiv publication.
// Env vars required (Netlify → Site settings → Environment variables):
//   BEEHIIV_API_KEY   – from Beehiiv → Settings → API (needs write access)
//   BEEHIIV_PUB_ID    – publication ID, looks like "pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
//
// Beehiiv v2 endpoint: POST https://api.beehiiv.com/v2/publications/{pubId}/subscriptions

exports.handler = async (event) => {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUB_ID = process.env.BEEHIIV_PUB_ID;

  // Surface config problems clearly (these are the most common cause of "nothing flows through")
  if (!API_KEY || !PUB_ID) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        ok: false,
        error: "Server not configured",
        detail: `Missing ${!API_KEY ? "BEEHIIV_API_KEY " : ""}${!PUB_ID ? "BEEHIIV_PUB_ID" : ""}`.trim(),
      }),
    };
  }
  if (!PUB_ID.startsWith("pub_")) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ ok: false, error: "BEEHIIV_PUB_ID looks wrong — it should start with 'pub_'" }),
    };
  }

  // Parse email
  let email;
  try {
    email = (JSON.parse(event.body || "{}").email || "").trim().toLowerCase();
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ ok: false, error: "Invalid JSON body" }) };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ ok: false, error: "Invalid email" }) };
  }

  const url = `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,         // re-activate if they previously unsubscribed
        send_welcome_email: true,
        utm_source: "athabasca-tracker",
        utm_medium: "website",
        referring_site: "athabasca-tracker.netlify.app",
      }),
      signal: AbortSignal.timeout(12000),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok) {
      // Pass Beehiiv's real error back so we can see *why* (bad key, wrong pub, etc.)
      return {
        statusCode: res.status,
        headers: CORS,
        body: JSON.stringify({
          ok: false,
          error: "Beehiiv rejected the request",
          status: res.status,
          beehiiv: data?.errors || data?.message || data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: true, status: data?.data?.status || "subscribed", id: data?.data?.id || null }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ ok: false, error: "Could not reach Beehiiv", detail: err.message }),
    };
  }
};
