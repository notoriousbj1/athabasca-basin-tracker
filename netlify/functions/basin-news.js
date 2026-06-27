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
  { name:"Geiger Energy",    ticker:"BEEP", feeds:["https://geigerenergy.ca/news/feed/","https://baselode.com/news/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/6412/Baselode-Energy-Corp." },
  { name:"Canadian Uranium", ticker:"CANU", feeds:["https://canadianuranium.ca/news-releases/feed/","https://canadianuranium.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Atha Energy",      ticker:"SASK", feeds:["https://athaenergy.ca/news/feed/","https://athaenergy.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Purepoint Uranium",ticker:"PTU",  feeds:["https://www.purepoint.ca/news-releases/feed/","https://www.purepoint.ca/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/3218/Purepoint-Uranium-Group-Inc." },
  { name:"Standard Uranium", ticker:"STND", feeds:["https://standarduranium.ca/news-releases/feed/","https://standarduranium.ca/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/10633/Standard-Uranium-Ltd." },
  { name:"Cosa Resources",   ticker:"COSA", feeds:["https://cosaresources.ca/news-releases/feed/","https://cosaresources.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Azincourt Energy", ticker:"AAZ",  feeds:["https://azincourtenergy.com/news/feed/","https://azincourtenergy.com/feed/"], newsfile:null, searchFallback:true },
  { name:"Fortune Bay",      ticker:"FOR",  feeds:["https://fortunebaycorp.com/news/feed/","https://fortunebaycorp.com/feed/"], newsfile:null, searchFallback:true },
  { name:"CanAlaska Uranium",ticker:"CVV",  feeds:["https://canalaska.com/feed/","https://canalaska.com/news/feed/"],
    newsfile:"https://www.newsfilecorp.com/company/2864/CanAlaska-Uranium-Ltd." },
  { name:"Manhattan Uranium",ticker:"MANU", feeds:["https://manhattanuranium.com/news/feed/","https://manhattanuranium.com/feed/"], newsfile:null, searchFallback:true },
  { name:"Appia",            ticker:"API",  feeds:["https://appiaenergy.ca/news/feed/","https://appiaenergy.ca/feed/"], newsfile:null, searchFallback:true },
  { name:"Uranium Royalty",  ticker:"URC",  feeds:["https://uraniumroyaltycorp.com/news/feed/","https://uraniumroyaltycorp.com/feed/"], newsfile:null, searchFallback:true },
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

// Phrases that signal generic securities-litigation / promo spam, not real company news.
const SPAM_PATTERNS = /(rosen|law firm|class action|investor alert|investors? (who|that|are|with)|shareholder alert|lawsuit|deadline reminder|encourages? .* investors|pomerantz|levi & korsinsky|bragar|kahn swick|robbins|investigation .* on behalf)/i;

// Build a set of distinctive name tokens for a company (drop generic words).
function nameTokens(co) {
  const generic = new Set(["energy","uranium","resources","mining","corp","corporation","inc","ltd","group","metals","royalty","the","and"]);
  return co.name.toLowerCase().replace(/[.,]/g,"").split(/\s+/).filter(w => w.length>2 && !generic.has(w));
}

// Does this release slug genuinely belong to the company (and isn't spam)?
function slugMatchesCompany(slug, co) {
  const s = slug.toLowerCase().replace(/-/g," ");
  if (SPAM_PATTERNS.test(s)) return false;          // reject litigation/promo spam
  const tokens = nameTokens(co);
  if (tokens.length && tokens.some(t => s.includes(t))) return true;
  // also accept if the ticker root appears
  const tk = (co.ticker||"").toLowerCase();
  if (tk && s.includes(tk)) return true;
  return false;
}

// Collect up to 5 Newsfile releases from listing HTML, pairing each with a nearby date.
function collectNewsfileReleases(html, co, sourceLabel) {
  const seen = new Set();
  const out = [];
  const isSearch = sourceLabel.includes("search");
  const re = /href="(\/release\/(\d+)\/([^"]+))"([\s\S]{0,400}?)(?=href="\/release\/|$)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, path, id, slug, tail] = m;
    if (seen.has(id)) continue;
    const slugText = slug.toLowerCase().replace(/-/g," ");
    // Always reject obvious spam, even on a company's own page
    if (SPAM_PATTERNS.test(slugText)) continue;
    // On the search endpoint, require a genuine company match
    if (isSearch && !slugMatchesCompany(slug, co)) continue;
    seen.add(id);
    const url = `https://www.newsfilecorp.com${path}`;
    const headline = decodeHtml(slug.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()));
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
    const out = collectNewsfileReleases(html, co, "Newsfile Corp (search)");
    // If nothing genuinely matches the company, return nothing — never a wrong article.
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

// ---- Aggregate basin-wide feeds (carry many companies in one feed) ----
const AGGREGATE_FEEDS = [
  "https://www.globenewswire.com/RssFeed/industry/1775-General Mining/feedTitle/GlobeNewswire - General Mining",
  "https://www.globenewswire.com/RssFeed/industry/1-Energy/feedTitle/GlobeNewswire - Energy",
];

// Distinctive name tokens per company for matching headlines (drop generic words).
function companyMatchers() {
  const GENERIC = new Set(["energy","uranium","resources","corp","corporation","inc","ltd","mining","metals","group","the","of","and","royalty","3.0"]);
  return COMPANIES.map(co => {
    const tokens = co.name.toLowerCase().replace(/[.,]/g," ").split(/\s+/).filter(t=>t && !GENERIC.has(t));
    return { co, tokens };
  });
}

function tagToCompany(text, matchers) {
  const t = (text||"").toLowerCase();
  for (const { co, tokens } of matchers) {
    // ticker as a standalone token like "(TSXV: PTU)" or " PTU "
    const tk = co.ticker.toLowerCase();
    if (new RegExp(`[(:\\s]${tk}[)\\s,.]`).test(t)) return co;
    // distinctive name token(s)
    if (tokens.length && tokens.every(tok => t.includes(tok))) return co;
  }
  return null;
}

async function fetchAggregate() {
  const matchers = companyMatchers();
  const out = [];
  for (const url of AGGREGATE_FEEDS) {
    try {
      const res = await fetch(url, {
        headers:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},
        signal:AbortSignal.timeout(9000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];
      for (const item of items) {
        const headline = decodeHtml(getField(item,"title"));
        const summary = decodeHtml(getField(item,"description")).replace(/<[^>]+>/g,"").slice(0,200);
        const url = extractUrl(item);
        const pd = parseDate(getField(item,"pubDate") || getField(item,"published"));
        if (!headline || !url || !pd || pd < CUTOFF) continue;
        const co = tagToCompany(headline + " " + summary, matchers);
        if (!co) continue; // only keep releases we can attribute to a tracked company
        out.push({
          headline, url,
          date: pd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
          dateMs: pd.getTime(), summary,
          company: co.name, ticker: co.ticker,
          source:"GlobeNewswire", type:"Press Release",
        });
      }
    } catch { /* skip feed on error */ }
  }
  return out;
}

exports.handler = async () => {
  try {
    const [perCompany, aggregate] = await Promise.all([
      Promise.all(COMPANIES.map(fetchCompany)),
      fetchAggregate(),
    ]);

    // Merge per-company results + aggregate-feed results
    const all = [...perCompany.filter(Boolean).flat().filter(Boolean), ...aggregate];

    // De-duplicate by URL
    const seen = new Set();
    const deduped = all.filter(r => {
      if (!r?.url || seen.has(r.url)) return false;
      seen.add(r.url); return true;
    });

    // Sort newest-first, then cap per company so no single company dominates the list
    deduped.sort((a,b) => (b.dateMs||0) - (a.dateMs||0));
    const PER_COMPANY_MAX = 3;
    const counts = {};
    const balanced = [];
    for (const r of deduped) {
      const key = r.ticker || r.company;
      counts[key] = (counts[key]||0) + 1;
      if (counts[key] <= PER_COMPANY_MAX) balanced.push(r);
    }

    const results = balanced.slice(0, 80).map(({dateMs,...rest}) => rest);

    return {
      statusCode:200,
      headers:{"Access-Control-Allow-Origin":"*"},
      body:JSON.stringify(results),
    };
  } catch(e) {
    return {statusCode:500,body:JSON.stringify({error:e.message})};
  }
};
