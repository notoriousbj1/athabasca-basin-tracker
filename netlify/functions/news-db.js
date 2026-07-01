// ============================================================
// news-db.js — reads press releases from Supabase, tags each to a
// tracked company, and returns them for the dashboard.
//
// Replaces the live RSS scraping in basin-news.js. The heavy lifting
// (watching feeds, writing rows) is done by Zapier → Supabase. This
// function just reads the accumulated rows and attributes them.
//
// Env vars required (set in Netlify → Site settings → Environment):
//   SUPABASE_URL       e.g. https://abcdxyz.supabase.co
//   SUPABASE_ANON_KEY  the public anon key (read-only via RLS)
// ============================================================

// --- Tracked companies (keep in sync with the dashboard COMPANIES) ---
const COMPANIES = [
  { name:"Cameco",              ticker:"CCO"  },
  { name:"NexGen Energy",       ticker:"NXE"  },
  { name:"Denison Mines",       ticker:"DML"  },
  { name:"Fission Uranium",     ticker:"FCU"  },
  { name:"IsoEnergy",           ticker:"ISO"  },
  { name:"Skyharbour Resources",ticker:"SYH"  },
  { name:"F3 Uranium",          ticker:"FUU"  },
  { name:"Uranium Energy",      ticker:"UEC"  },
  { name:"CanAlaska Uranium",   ticker:"CVV"  },
  { name:"Purepoint Uranium",   ticker:"PTU"  },
  { name:"Standard Uranium",    ticker:"STND" },
  { name:"Atha Energy",         ticker:"SASK" },
  { name:"Azincourt Energy",    ticker:"AAZ"  },
  { name:"Fortune Bay",         ticker:"FOR"  },
  { name:"Appia Rare Earths",   ticker:"API"  },
  { name:"Uranium Royalty",     ticker:"URC"  },
  { name:"Canadian Uranium",    ticker:"CANU" },
  { name:"Cosa Resources",      ticker:"COSA" },
  { name:"Manhattan Uranium",   ticker:"MANU" },
  { name:"Geiger Energy",       ticker:"BEEP" },
];

// Words too generic to identify a company on their own.
const GENERIC = new Set(["energy","uranium","resources","corp","corporation","inc","ltd",
  "mining","metals","group","the","of","and","royalty","canadian","american","north",
  "standard","global","bay","fortune","rare","earths"]);

function companyMatchers() {
  return COMPANIES.map(co => {
    const tokens = co.name.toLowerCase().replace(/[.,]/g," ").split(/\s+/)
      .filter(t => t.length > 2 && !GENERIC.has(t));
    return { co, tokens, tk: (co.ticker||"").toLowerCase(), fullName: co.name.toLowerCase() };
  });
}

// Attribute a release to a company by STRONG ticker context, full-name phrase,
// or distinctive name tokens. (Guards: bare "for" won't match Fortune Bay,
// bare "Canadian" won't match Canadian Uranium — but the FULL name will.)
function tagToCompany(text, matchers) {
  const t = (text||"").toLowerCase();
  for (const { co, tokens, tk, fullName } of matchers) {
    // 1) Strong ticker context, e.g. "(TSX:NXE)", "CSE: CANU"
    if (tk.length >= 2) {
      const strong = new RegExp(`(?:tsxv?|tsx-v|tsx|cse|nyse|otcqb|otcqx|nasdaq|frankfurt|\\([a-z.\\s-]*)[:\\s-]\\s*${tk}\\b`, "i");
      if (strong.test(t)) return co;
    }
    // 2) The full company name appears as a phrase (catches all-generic names
    //    like "Canadian Uranium" / "Fortune Bay" that have no distinctive token).
    if (fullName.length >= 6 && t.includes(fullName)) return co;
    // 3) Distinctive (non-generic) name tokens all present.
    if (tokens.length) {
      const ok = tokens.every(tok => new RegExp(`\\b${tok}\\b`).test(t));
      const distinctEnough = tokens.length >= 2 || tokens[0].length >= 4;
      if (ok && distinctEnough) return co;
    }
  }
  return null;
}

exports.handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { statusCode: 500, headers: cors(),
      body: JSON.stringify({ error: "Supabase env vars not configured" }) };
  }

  try {
    // Pull the most recent 200 releases from the last 120 days, newest first.
    const since = new Date(Date.now() - 120*24*3600*1000).toISOString();
    const endpoint = `${SUPABASE_URL}/rest/v1/releases`
      + `?select=title,url,source,raw_company,published_at`
      + `&published_at=gte.${since}`
      + `&order=published_at.desc`
      + `&limit=200`;

    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, headers: cors(),
        body: JSON.stringify({ error: "Supabase read failed", detail }) };
    }

    const rows = await res.json();
    const matchers = companyMatchers();
    const seen = new Set();
    const out = [];

    // Given a Google-News feed title like: "NexGen Energy" uranium - Google News
    // pull out the quoted company name so we can tag it directly.
    const companyFromFeed = (raw) => {
      if (!raw) return null;
      const quoted = raw.match(/"([^"]+)"/);
      const probe = quoted ? quoted[1] : raw;
      // match the extracted name against our tracked companies
      const p = probe.toLowerCase();
      for (const { co, tokens } of matchers) {
        if (co.name.toLowerCase() === p) return co;
        if (tokens.length && tokens.every(t => p.includes(t))) return co;
      }
      return null;
    };

    for (const r of rows) {
      if (!r.title || !r.url || seen.has(r.url)) continue;
      seen.add(r.url);
      // Prefer the feed-title company (reliable, since each feed is company-specific),
      // then fall back to parsing the headline text.
      const co = companyFromFeed(r.raw_company) || tagToCompany(`${r.raw_company||""} ${r.title}`, matchers);
      const d = r.published_at ? new Date(r.published_at) : null;
      out.push({
        headline: cleanTitle(r.title),
        url: r.url,
        company: co ? co.name : null,
        ticker:  co ? co.ticker : null,
        source:  r.source || "Newswire",
        date: d && !isNaN(d) ? d.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }) : null,
        dateMs: d && !isNaN(d) ? d.getTime() : 0,
      });
    }

    // Cap per company so no single issuer floods the list (same 3-max rule as before).
    out.sort((a,b)=> b.dateMs - a.dateMs);
    const counts = {};
    const balanced = [];
    for (const r of out) {
      const key = r.ticker || r.company || r.headline;
      counts[key] = (counts[key]||0) + 1;
      if (counts[key] <= 3) balanced.push(r);
    }

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify(balanced.slice(0, 80).map(({dateMs, ...rest}) => rest)),
    };
  } catch (e) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: e.message }) };
  }
};

function cors() {
  return { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
}

// Google News appends " - Publisher" to headlines. Strip the trailing source
// for a cleaner display (keep the rest of the title intact).
function cleanTitle(t) {
  if (!t) return t;
  // remove a trailing " - Something" only if it looks like a publisher tag (short, no sentence punctuation)
  const m = t.match(/^(.*)\s[-–]\s([^-–]{2,40})$/);
  if (m && !/[.!?]$/.test(m[2])) return m[1].trim();
  return t.trim();
}
