const COMPANIES = [
  { name:"NexGen",           tickers:["NXE","NXG"],   match:["nexgen","nxe","rook i","arrow deposit"] },
  { name:"Denison Mines",    tickers:["DML","DNN"],   match:["denison"] },
  { name:"Fission Uranium",  tickers:["FCU"],         match:["fission uranium","fcu","triple r"] },
  { name:"IsoEnergy",        tickers:["ISO"],         match:["isoenergy","iso energy","hurricane"] },
  { name:"Skyharbour",       tickers:["SYH"],         match:["skyharbour","moore lake"] },
  { name:"Cameco",           tickers:["CCO","CCJ"],   match:["cameco","cigar lake","mcarthur"] },
  { name:"Uranium Energy",   tickers:["UEC"],         match:["uranium energy","uec"] },
  { name:"Canadian Uranium", tickers:["CANU"],        match:["canadian uranium","canu"] },
  { name:"Atha Energy",      tickers:["SASK"],        match:["atha energy","sask"] },
  { name:"Baselode",         tickers:["FIND"],        match:["baselode"] },
  { name:"Purepoint",        tickers:["PTU"],         match:["purepoint"] },
  { name:"F3 Uranium",       tickers:["FUU"],         match:["f3 uranium","fuu","patterson lake"] },
  { name:"Standard Uranium", tickers:["STND"],        match:["standard uranium"] },
  { name:"Forum Energy",     tickers:["FMC"],         match:["forum energy"] },
  { name:"Azincourt",        tickers:["AAZ"],         match:["azincourt"] },
  { name:"Fortune Bay",      tickers:["FOR"],         match:["fortune bay"] },
  { name:"CanAlaska",        tickers:["CVV"],         match:["canalaska"] },
  { name:"ALX Resources",    tickers:["AL"],          match:["alx resources"] },
  { name:"Appia",            tickers:["API","APAAF"], match:["appia"] },
  { name:"Uranium Royalty",  tickers:["URC","UROY"],  match:["uranium royalty"] },
];

const FEEDS = [
  { url:"https://www.globenewswire.com/RssFeed/keyword/uranium",        source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca",      source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/uranium+mining", source:"GlobeNewswire" },
  { url:"https://www.newsfilecorp.com/rss/uranium",                     source:"Newsfile Corp" },
];

// Only include items from the last 60 days
const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

function parseRSS(xml, source) {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  return items.map(item => {
    const getText = (tag) => {
      const cd = item.match(new RegExp(`<${tag}>[^<]*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`));
      const pl = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return (cd?.[1] || pl?.[1] || "").trim();
    };
    const title   = getText("title");
    const link    = getText("link") || getText("guid");
    const pubDate = getText("pubDate");
    const desc    = getText("description").replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").trim().substring(0,300);

    // Parse and validate date
    let parsedDate;
    try { parsedDate = new Date(pubDate); } catch { return null; }
    if (!parsedDate || isNaN(parsedDate.getTime())) return null;

    // Skip anything older than 60 days
    if (parsedDate < CUTOFF) return null;

    const lower = (title + " " + desc).toLowerCase();
    const matched = COMPANIES.find(c => c.match.some(m => lower.includes(m)));
    if (!matched || !title || !link) return null;

    const dateStr = parsedDate.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

    return {
      headline: title,
      url:      link.trim(),
      date:     dateStr,
      dateMs:   parsedDate.getTime(),
      company:  matched.name,
      ticker:   matched.tickers[0],
      summary:  desc,
      source,
      type:     "Press Release",
    };
  }).filter(Boolean);
}

exports.handler = async () => {
  try {
    const allItems = [];

    await Promise.all(FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS reader)" },
          signal:  AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        allItems.push(...parseRSS(xml, source));
      } catch(e) { console.error(`Feed error ${url}:`, e.message); }
    }));

    // Deduplicate by headline, sort newest first
    const seen = new Set();
    const results = allItems
      .filter(i => { if (seen.has(i.headline)) return false; seen.add(i.headline); return true; })
      .sort((a, b) => b.dateMs - a.dateMs)
      .map(({ dateMs, ...rest }) => rest) // strip internal dateMs field
      .slice(0, 12);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
