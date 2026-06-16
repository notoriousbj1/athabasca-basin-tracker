const COMPANIES = [
  { name:"NexGen Energy",    match:["nexgen","nxe","rook i","arrow deposit"] },
  { name:"Denison Mines",    match:["denison","wheeler river","phoenix isr"] },
  { name:"Fission Uranium",  match:["fission uranium","fcu","triple r"] },
  { name:"IsoEnergy",        match:["isoenergy","iso energy","hurricane deposit"] },
  { name:"Skyharbour",       match:["skyharbour","moore lake"] },
  { name:"Cameco",           match:["cameco","cigar lake","mcarthur river"] },
  { name:"Uranium Energy",   match:["uranium energy corp","uec"] },
  { name:"Canadian Uranium", match:["canadian uranium","canu"] },
  { name:"Atha Energy",      match:["atha energy","sask.v"] },
  { name:"Baselode Energy",  match:["baselode"] },
  { name:"Purepoint Uranium",match:["purepoint"] },
  { name:"F3 Uranium",       match:["f3 uranium","fuu","patterson lake south"] },
  { name:"Standard Uranium", match:["standard uranium","stnd","davidson river"] },
  { name:"Forum Energy",     match:["forum energy metals","fmc.v"] },
  { name:"Azincourt Energy", match:["azincourt"] },
  { name:"Fortune Bay",      match:["fortune bay"] },
  { name:"CanAlaska Uranium",match:["canalaska"] },
  { name:"ALX Resources",    match:["alx resources"] },
  { name:"Appia Rare Earths",match:["appia"] },
  { name:"Uranium Royalty",  match:["uranium royalty","urc"] },
];

const FEEDS = [
  // GlobeNewswire — broad uranium keyword searches
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+uranium",   source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/uranium+Saskatchewan", source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/uranium+exploration",  source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+basin",     source:"GlobeNewswire" },
  // Newsfile Corp — primary wire for Canadian junior miners
  { url:"https://www.newsfilecorp.com/rss/releases/mining",                   source:"Newsfile Corp" },
  { url:"https://www.newsfilecorp.com/rss/releases/energy",                   source:"Newsfile Corp" },
  // Accesswire — used by some juniors
  { url:"https://www.accesswire.com/newsroom/rss?tags=uranium",               source:"Accesswire"    },
];

const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

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

function parseRSS(xml, source) {
  const items = [
    ...(xml.match(/<item[\s\S]*?<\/item>/g)   || []),
    ...(xml.match(/<entry[\s\S]*?<\/entry>/g) || []),
  ];
  return items.map(item => {
    const get = (tag) => {
      const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
      const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return (cd?.[1] || pl?.[1] || "").trim();
    };
    const headline = get("title").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    const url      = extractUrl(item);
    const pubDate  = get("pubDate") || get("published") || get("updated");
    const rawDesc  = get("description") || get("summary") || get("content") || "";
    const summary  = rawDesc.replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim().substring(0,250);

    if (!headline || !url) return null;

    const parsedDate = parseDate(pubDate);
    if (!parsedDate || parsedDate < CUTOFF) return null;

    const lower = (headline + " " + summary).toLowerCase();
    const co = COMPANIES.find(c => c.match.some(m => lower.includes(m)));
    if (!co) return null;

    const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
    return { headline, url, date, dateMs:parsedDate.getTime(), summary, company:co.name, source, type:"Press Release" };
  }).filter(Boolean);
}

exports.handler = async () => {
  try {
    const allItems = [];
    await Promise.all(FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers:{ "User-Agent":"Mozilla/5.0 (compatible; news aggregator)" },
          signal: AbortSignal.timeout(9000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        allItems.push(...parseRSS(xml, source));
      } catch(e) { console.error(`Feed failed: ${url}`, e.message); }
    }));

    const seen = new Set();
    const results = allItems
      .filter(i => { if (seen.has(i.headline)) return false; seen.add(i.headline); return true; })
      .sort((a,b) => b.dateMs - a.dateMs)
      .map(({ dateMs, ...rest }) => rest)
      .slice(0, 12);

    return {
      statusCode:200,
      headers:{ "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
