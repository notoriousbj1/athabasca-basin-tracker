const COMPANIES = [
  { name:"Cameco",           ticker:"CCO",  feeds:["https://www.cameco.com/media/news/feed/","https://www.cameco.com/feed/"], newsfile:null, searchFallback:true },
  { name:"NexGen Energy",    ticker:"NXE",  feeds:["https://nexgenenergy.ca/news/feed/","https://nexgenenergy.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Denison Mines",    ticker:"DML",  feeds:["https://denisonmines.com/news/feed/","https://denisonmines.com/feed/"], newsfile:null, searchFallback:true },
  { name:"Fission Uranium",  ticker:"FCU",  feeds:["https://fissionuranium.com/news/feed/","https://fissionuranium.com/feed/"], newsfile:null, searchFallback:true },
  { name:"IsoEnergy",        ticker:"ISO",  feeds:["https://isoenergy.ca/news/feed/","https://isoenergy.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Skyharbour",       ticker:"SYH",  feeds:["https://skyharbourltd.com/news/feed/","https://skyharbourltd.com/feed/"], newsfile:null, searchFallback:true },
  { name:"F3 Uranium",       ticker:"FUU",  feeds:["https://f3uranium.ca/news/feed/","https://f3uranium.ca/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/8110/F3-Uranium-Corp." },
  { name:"Uranium Energy",   ticker:"UEC",  feeds:["https://uraniumenergy.com/news/feed/","https://uraniumenergy.com/feed/"], newsfile:null, searchFallback:true },
  { name:"Baselode Energy",  ticker:"FIND", feeds:["https://baselodeenergy.com/news/feed/","https://baselodeenergy.com/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/6412/Baselode-Energy-Corp." },
  { name:"Canadian Uranium", ticker:"CANU", feeds:["https://canadianuranium.ca/news-releases/feed/","https://canadianuranium.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Atha Energy",      ticker:"SASK", feeds:["https://athaenergy.ca/news/feed/","https://athaenergy.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Purepoint Uranium",ticker:"PTU",  feeds:["https://www.purepoint.ca/news-releases/feed/","https://www.purepoint.ca/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/3218/Purepoint-Uranium-Group-Inc." },
  { name:"Standard Uranium", ticker:"STND", feeds:["https://standarduranium.ca/news-releases/feed/","https://standarduranium.ca/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/10633/Standard-Uranium-Ltd." },
  { name:"Forum Energy",     ticker:"FMC",  feeds:["https://forumenergymetals.com/news/feed/","https://forumenergymetals.com/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/4908/Forum-Energy-Metals-Corp." },
  { name:"Azincourt Energy", ticker:"AAZ",  feeds:["https://azincourtenergy.com/news/feed/","https://azincourtenergy.com/feed/"], newsfile:null, searchFallback:true },
  { name:"Fortune Bay",      ticker:"FOR",  feeds:["https://fortunebaycorp.com/news/feed/","https://fortunebaycorp.com/feed/"], newsfile:null, searchFallback:true },
  { name:"CanAlaska Uranium",ticker:"CVV",  feeds:["https://canalaska.com/feed/","https://canalaska.com/news/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/2864/CanAlaska-Uranium-Ltd." },
  { name:"ALX Resources",    ticker:"AL",   feeds:["https://alxresources.ca/news/feed/","https://alxresources.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Appia",            ticker:"API",  feeds:["https://appiaenergy.ca/news/feed/","https://appiaenergy.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Uranium Royalty",  ticker:"URC",  feeds:["https://uraniumroyaltycorp.com/news/feed/","https://uraniumroyaltycorp.com/feed/"], newsfile:null, searchFallback:true },
  { name:"Fission 3.0",      ticker:"FIS",  feeds:["https://fission3.com/news/feed/","https://fission3.com/feed/"], newsfile:null, searchFallback:true },
];

const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

function decodeHtml(s) {
  return (s||"").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n))
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&rsquo;/g,"'").replace(/&lsquo;/g,"'").replace(/&mdash;/g,"—")
    .replace(/&ndash;/g,"–").replace(/&nbsp;/g," ").trim();
}

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
  let d = new Date((str||"").trim());
  if (!isNaN(d.getTime())) return d;
  d = new Date((str||"").replace(/\s+[A-Z]{2,4}$/,"").trim());
  return isNaN(d.getTime()) ? null : d;
}

function getField(item,tag) {
  const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
  const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return (cd?.[1]||pl?.[1]||"").trim();
}

async function tryRSS(co) {
  for (const feedUrl of co.feeds) {
    try {
      const res = await fetch(feedUrl,{
        headers:{"User-Agent":"Mozilla/5.0 (compatible; news aggregator)"},
        signal:AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [...(xml.match(/<item[\s\S]*?<\/item>/g)||[]),
                     ...(xml.match(/<entry[\s\S]*?<\/entry>/g)||[])];
      const collected = [];
      for (const item of items) {
        const headline = decodeHtml(getField(item,"title"));
        const url = extractUrl(item);
        if (!headline||!url) continue;
        const pd = parseDate(getField(item,"pubDate")||getField(item,"published")||getField(item,"updated"));
        if (!pd||pd<CUTOFF) continue;
        const summary = decodeHtml((getField(item,"description")||getField(item,"summary")||"")
          .replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().substring(0,220));
        collected.push({headline,url,date:pd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
                dateMs:pd.getTime(),summary,company:co.name,ticker:co.ticker,source:"Company IR",type:"Press Release"});
        if (collected.length>=5) break;
      }
      if (collected.length) return collected;
    } catch(e) {continue;}
  }
  return null;
}

// Collect up to 5 Newsfile releases from listing HTML, pairing each with a nearby date.
// Newsfile listings render dates as "Month D, YYYY" near each release link.
function collectNewsfileReleases(html, co, sourceLabel) {
  const seen = new Set();
  const out = [];
  const nameKey = co.name.split(" ")[0].toLowerCase();
  // Match each release link AND capture a window of HTML after it to look for a date
  const re = /href="(\/release\/(\d+)\/([^"]+))"([\s\S]{0,400}?)(?=href="\/release\/|$)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, path, id, slug, tail] = m;
    if (seen.has(id)) continue;
    // For the search endpoint, only keep releases whose slug mentions the company
    if (sourceLabel.includes("search") && nameKey && !slug.toLowerCase().includes(nameKey)) continue;
    seen.add(id);
    const url = `https://www.newsfilecorp.com${path}`;
    const headline = decodeHtml(slug.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()));
    // Look for a date in the slug-adjacent HTML (e.g. "May 27, 2026" or "2026-05-27")
    const dm = tail.match(/([A-Z][a-z]+ \d{1,2},\s*\d{4})/) || tail.match(/(\d{4}-\d{2}-\d{2})/);
    const pd = dm ? parseDate(dm[1]) : null;
    out.push({
      headline, url,
      date: pd ? pd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "Recent",
      dateMs: pd ? pd.getTime() : (Date.now() - out.length*86400000),
      summary:"", company:co.name, ticker:co.ticker, source:sourceLabel, type:"Press Release",
    });
    if (out.length>=5) break;
  }
  return out;
}

async function tryNewsfile(co) {
  if (!co.newsfile) return null;
  try {
    const res = await fetch(co.newsfile,{
      headers:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},
      signal:AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const out = collectNewsfileReleases(html, co, "Newsfile Corp");
    return out.length ? out : null;
  } catch(e) { return null; }
}

async function tryNewsfileSearch(co) {
  // Generic fallback: search Newsfile by company name for any RSS-only company.
  if (!co.searchFallback) return null;
  try {
    const q = encodeURIComponent(co.name);
    const res = await fetch(`https://www.newsfilecorp.com/search?query=${q}`,{
      headers:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},
      signal:AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    let out = collectNewsfileReleases(html, co, "Newsfile Corp (search)");
    // If name-filtering removed everything, fall back to the single most recent listed
    if (!out.length) {
      const first = html.match(/href="(\/release\/(\d+)\/([^"]+))"/);
      if (first) {
        out = [{ headline:decodeHtml(first[3].replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())),
                 url:`https://www.newsfilecorp.com${first[1]}`, date:"Recent", dateMs:Date.now(),
                 summary:"", company:co.name, ticker:co.ticker, source:"Newsfile Corp (search)", type:"Press Release" }];
      }
    }
    return out.length ? out : null;
  } catch(e) { return null; }
}

async function fetchCompany(co) {
  const rss = await tryRSS(co);
  if (rss) return rss;
  const nf = await tryNewsfile(co);
  if (nf) return nf;
  return tryNewsfileSearch(co);
}

exports.handler = async () => {
  try {
    const perCompany = await Promise.all(COMPANIES.map(fetchCompany));
    const results = perCompany
      .filter(Boolean)
      .flat()                                  // each company now returns up to 5 items
      .filter(Boolean)
      .sort((a,b) => b.dateMs - a.dateMs)
      .slice(0, 80)                            // 21 companies × up to 5 ≈ plenty; cap generously
      .map(({dateMs,...rest}) => rest);

    return {
      statusCode:200,
      headers:{"Access-Control-Allow-Origin":"*"},
      body:JSON.stringify(results),
    };
  } catch(e) {
    return {statusCode:500,body:JSON.stringify({error:e.message})};
  }
};
