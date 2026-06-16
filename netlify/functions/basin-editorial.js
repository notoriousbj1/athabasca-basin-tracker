// basin-editorial.js
// Pulls the most recent editorial/publication coverage of the Athabasca Basin
// from Mining.com, World Nuclear News, GlobeNewswire — NOT company press releases

const BASIN_KEYWORDS = ["athabasca","saskatchewan","athabasca basin"];

const FEEDS = [
  { url:"https://www.mining.com/category/uranium/feed/",                      source:"Mining.com"        },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+basin",      source:"GlobeNewswire"     },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+uranium",    source:"GlobeNewswire"     },
  { url:"https://www.world-nuclear-news.org/rss",                             source:"World Nuclear News"},
  { url:"https://www.mining.com/category/uranium-2/feed/",                    source:"Mining.com"        },
];

// Company names to exclude — we want editorial, not company PRs
const COMPANY_NAMES = ["nexgen","denison","fission","skyharbour","isoenergy","cameco",
  "baselode","canadian uranium","atha energy","purepoint","standard uranium","forum energy",
  "azincourt","fortune bay","canalaska","alx resources","appia","uranium royalty","f3 uranium",
  "uranium energy corp","uec"];

const CUTOFF = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

function decodeHtml(s) {
  return (s||"").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n))
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&rsquo;/g,"'").replace(/&mdash;/g,"—").replace(/&nbsp;/g," ").trim();
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

function getField(item, tag) {
  const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
  const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return (cd?.[1]||pl?.[1]||"").trim();
}

function isBasinRelated(text) {
  const lower = text.toLowerCase();
  return BASIN_KEYWORDS.some(k => lower.includes(k));
}

function isCompanyPR(text) {
  const lower = text.toLowerCase();
  return COMPANY_NAMES.some(n => lower.includes(n));
}

exports.handler = async () => {
  try {
    const candidates = [];

    await Promise.all(FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers:{"User-Agent":"Mozilla/5.0 (compatible; news aggregator)"},
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        const items = [...(xml.match(/<item[\s\S]*?<\/item>/g)||[]),
                       ...(xml.match(/<entry[\s\S]*?<\/entry>/g)||[])];

        for (const item of items) {
          const headline = decodeHtml(getField(item,"title"));
          const url      = extractUrl(item);
          const pubDate  = getField(item,"pubDate")||getField(item,"published")||getField(item,"updated");
          const rawDesc  = getField(item,"description")||getField(item,"summary")||getField(item,"content")||"";
          const summary  = decodeHtml(rawDesc.replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().substring(0,300));

          if (!headline || !url) continue;
          const pd = parseDate(pubDate);
          if (!pd || pd < CUTOFF) continue;

          const combined = headline + " " + summary;

          // Must be about the Athabasca Basin / Saskatchewan uranium
          if (!isBasinRelated(combined)) continue;

          // Prefer editorial — skip obvious single-company PRs
          // (allow articles that mention companies alongside editorial context)
          const companyCount = COMPANY_NAMES.filter(n => combined.toLowerCase().includes(n)).length;
          if (companyCount > 1 || !isCompanyPR(headline)) {
            // Multi-company or headline isn't a company name = editorial
            const date = pd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
            candidates.push({
              headline, url, date, dateMs:pd.getTime(), summary, source,
              category:"Athabasca Basin",
            });
          }
        }
      } catch(e) {}
    }));

    // Return the most recent editorial story
    const best = candidates.sort((a,b) => b.dateMs - a.dateMs)[0];
    const result = best ? (({ dateMs,...rest }) => rest)(best) : null;

    return {
      statusCode: 200,
      headers: {"Access-Control-Allow-Origin":"*"},
      body: JSON.stringify(result || {}),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({error:e.message}) };
  }
};
