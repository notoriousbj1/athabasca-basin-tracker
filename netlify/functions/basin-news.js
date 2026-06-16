const COMPANIES = [
  { name:"Cameco",           ticker:"CCO",  feeds:["https://www.cameco.com/feed/","https://www.cameco.com/news/feed/"] },
  { name:"NexGen Energy",    ticker:"NXE",  feeds:["https://nexgenenergy.ca/news/feed/","https://nexgenenergy.ca/feed/"] },
  { name:"Denison Mines",    ticker:"DML",  feeds:["https://denisonmines.com/news/feed/","https://denisonmines.com/feed/"] },
  { name:"Fission Uranium",  ticker:"FCU",  feeds:["https://fissionuranium.com/news/feed/","https://fissionuranium.com/feed/"] },
  { name:"IsoEnergy",        ticker:"ISO",  feeds:["https://isoenergy.ca/news/feed/","https://isoenergy.ca/feed/"] },
  { name:"Skyharbour",       ticker:"SYH",  feeds:["https://skyharbourltd.com/news/feed/","https://skyharbourltd.com/feed/"] },
  { name:"F3 Uranium",       ticker:"FUU",  feeds:["https://f3uranium.ca/news/feed/","https://f3uranium.ca/feed/"] },
  { name:"Uranium Energy",   ticker:"UEC",  feeds:["https://uraniumenergy.com/news/feed/","https://uraniumenergy.com/feed/"] },
  { name:"Baselode Energy",  ticker:"FIND", feeds:["https://baselodeenergy.com/news/feed/","https://baselodeenergy.com/feed/"] },
  { name:"Canadian Uranium", ticker:"CANU", feeds:["https://canadianuranium.ca/news/feed/","https://canadianuranium.ca/news-releases/feed/","https://canadianuranium.ca/feed/"] },
  { name:"Atha Energy",      ticker:"SASK", feeds:["https://athaenergy.ca/news/feed/","https://athaenergy.ca/feed/"] },
  { name:"Purepoint Uranium",ticker:"PTU",  feeds:["https://www.purepoint.ca/news-releases/feed/","https://www.purepoint.ca/news/feed/","https://www.purepoint.ca/feed/"] },
  { name:"Standard Uranium", ticker:"STND", feeds:["https://standarduranium.ca/news-releases/feed/","https://www.standarduranium.ca/news-releases/feed/"] },
  { name:"Forum Energy",     ticker:"FMC",  feeds:["https://forumenergymetals.com/news/feed/","https://forumenergymetals.com/feed/"] },
  { name:"Azincourt Energy", ticker:"AAZ",  feeds:["https://azincourtenergy.com/news/feed/","https://azincourtenergy.com/feed/"] },
  { name:"Fortune Bay",      ticker:"FOR",  feeds:["https://fortunebaycorp.com/news/feed/","https://fortunebaycorp.com/feed/"] },
  { name:"CanAlaska Uranium",ticker:"CVV",  feeds:["https://canalaska.com/feed/","https://canalaska.com/news/feed/"] },
  { name:"ALX Resources",    ticker:"AL",   feeds:["https://alxresources.ca/news/feed/","https://alxresources.ca/feed/"] },
  { name:"Appia",            ticker:"API",  feeds:["https://appiaenergy.ca/news/feed/","https://appiaenergy.ca/feed/"] },
  { name:"Uranium Royalty",  ticker:"URC",  feeds:["https://uraniumroyaltycorp.com/news/feed/","https://uraniumroyaltycorp.com/feed/"] },
  { name:"Fission 3.0",      ticker:"FIS",  feeds:["https://fission3.com/news/feed/","https://fission3.com/feed/"] },
];

// Fallback broad searches on GlobeNewswire if we can't fill 5 slots
const FALLBACK_FEEDS = [
  "https://www.globenewswire.com/RssFeed/keyword/athabasca+uranium",
  "https://www.globenewswire.com/RssFeed/keyword/uranium+Saskatchewan",
];

const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

const BASIN_NAMES = COMPANIES.map(c => c.name.toLowerCase().split(" ")[0]);

function extractUrl(item) {
  const href = item.match(/<link[^>]+href="([^"]+)"/)?.[1];
  if (href?.startsWith("http")) return href.trim();
  const link = item.match(/<link>([^<\s]+)<\/link>/)?.[1];
  if (link?.startsWith("http")) return link.trim();
  const guid = item.match(/<guid[^>]*>([^<\s]+)<\/guid>/)?.[1];
  if (guid?.startsWith("http")) return guid.trim();
  return null;
}

function parseDate(str) {
  if (!str) return null;
  let d = new Date(str.trim());
  if (!isNaN(d.getTime())) return d;
  d = new Date(str.replace(/\s+[A-Z]{2,4}$/, "").trim());
  if (!isNaN(d.getTime())) return d;
  return null;
}

function parseItems(xml) {
  return [
    ...(xml.match(/<item[\s\S]*?<\/item>/g)   || []),
    ...(xml.match(/<entry[\s\S]*?<\/entry>/g) || []),
  ];
}

function parseItem(item, company) {
  const get = (tag) => {
    const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
    const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return (cd?.[1] || pl?.[1] || "").trim();
  };
  const headline = get("title").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
  const url      = extractUrl(item);
  const pubDate  = get("pubDate") || get("published") || get("updated") || get("dc:date");
  const rawDesc  = get("description") || get("summary") || get("content") || "";
  const summary  = rawDesc.replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim().substring(0,220);
  if (!headline || !url) return null;
  const parsedDate = parseDate(pubDate);
  if (!parsedDate || parsedDate < CUTOFF) return null;
  const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
  return { headline, url, date, dateMs:parsedDate.getTime(), summary,
           company:company.name, ticker:company.ticker, source:"Company IR", type:"Press Release" };
}

async function tryFeeds(feeds, company) {
  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, {
        headers:{ "User-Agent":"Mozilla/5.0 (compatible; news aggregator)" },
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const item of parseItems(xml)) {
        const parsed = parseItem(item, company);
        if (parsed) return parsed;
      }
    } catch(e) { continue; }
  }
  return null;
}

exports.handler = async () => {
  try {
    // Try per-company feeds first
    const companyResults = await Promise.all(COMPANIES.map(co => tryFeeds(co.feeds, co)));
    const valid = companyResults.filter(Boolean).sort((a,b) => b.dateMs - a.dateMs);

    // If we have fewer than 5, fill from GlobeNewswire fallbacks
    if (valid.length < 5) {
      const existingUrls = new Set(valid.map(v => v.url));
      for (const feedUrl of FALLBACK_FEEDS) {
        if (valid.length >= 5) break;
        try {
          const res = await fetch(feedUrl, {
            headers:{ "User-Agent":"Mozilla/5.0 (compatible; news aggregator)" },
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok) continue;
          const xml = await res.text();
          for (const item of parseItems(xml)) {
            if (valid.length >= 5) break;
            const get = (tag) => {
              const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
              const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
              return (cd?.[1] || pl?.[1] || "").trim();
            };
            const headline = get("title").replace(/&amp;/g,"&").trim();
            const url = extractUrl(item);
            if (!headline || !url || existingUrls.has(url)) continue;
            const pubDate = get("pubDate") || get("published");
            const parsedDate = parseDate(pubDate);
            if (!parsedDate || parsedDate < CUTOFF) continue;
            const lower = (headline + " " + get("description")).toLowerCase();
            const matchedCo = COMPANIES.find(c => lower.includes(c.name.split(" ")[0].toLowerCase()));
            if (!matchedCo) continue;
            const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
            const rawDesc = get("description") || "";
            const summary = rawDesc.replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim().substring(0,220);
            valid.push({ headline, url, date, dateMs:parsedDate.getTime(), summary,
                         company:matchedCo.name, ticker:matchedCo.ticker, source:"GlobeNewswire", type:"Press Release" });
            existingUrls.add(url);
          }
        } catch(e) {}
      }
    }

    const results = valid
      .sort((a,b) => b.dateMs - a.dateMs)
      .slice(0, 5)
      .map(({ dateMs, ...rest }) => rest);

    return {
      statusCode:200,
      headers:{ "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
