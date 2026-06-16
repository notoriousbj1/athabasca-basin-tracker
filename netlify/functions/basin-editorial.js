const BASIN_KEYWORDS = ["athabasca","saskatchewan","athabasca basin"];

const FEEDS = [
  { url:"https://www.mining.com/category/uranium/feed/",                      source:"Mining.com"        },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+basin",      source:"GlobeNewswire"     },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+uranium",    source:"GlobeNewswire"     },
  { url:"https://www.world-nuclear-news.org/rss",                             source:"World Nuclear News"},
  { url:"https://www.mining.com/category/uranium-2/feed/",                    source:"Mining.com"        },
];

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

function extractImage(item) {
  // 1. media:content with image
  const mediaContent = item.match(/<media:content[^>]+url="([^"]+)"[^>]*>/i)?.[1];
  if (mediaContent && /\.(jpg|jpeg|png|webp|gif)/i.test(mediaContent)) return mediaContent;

  // 2. media:thumbnail
  const mediaThumbnail = item.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1];
  if (mediaThumbnail) return mediaThumbnail;

  // 3. enclosure tag with image type
  const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image\/[^"]+"/i)?.[1]
                 || item.match(/<enclosure[^>]+type="image\/[^"]+"[^>]+url="([^"]+)"/i)?.[1];
  if (enclosure) return enclosure;

  // 4. image src inside description
  const desc = item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "";
  const imgInDesc = desc.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  if (imgInDesc?.startsWith("http")) return imgInDesc;

  // 5. og:image in content
  const ogImage = item.match(/og:image.*?content="([^"]+)"/i)?.[1];
  if (ogImage?.startsWith("http")) return ogImage;

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
  return BASIN_KEYWORDS.some(k => text.toLowerCase().includes(k));
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
          const image    = extractImage(item);
          const pubDate  = getField(item,"pubDate")||getField(item,"published")||getField(item,"updated");
          const rawDesc  = getField(item,"description")||getField(item,"summary")||getField(item,"content")||"";
          const summary  = decodeHtml(rawDesc.replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().substring(0,300));

          if (!headline || !url) continue;
          const pd = parseDate(pubDate);
          if (!pd || pd < CUTOFF) continue;

          const combined = headline + " " + summary;
          if (!isBasinRelated(combined)) continue;

          // Prefer editorial (allow multi-company mentions)
          const companyCount = COMPANY_NAMES.filter(n => combined.toLowerCase().includes(n)).length;
          const headlineLower = headline.toLowerCase();
          const isSingleCompanyPR = COMPANY_NAMES.some(n => headlineLower.startsWith(n));
          if (companyCount > 1 || !isSingleCompanyPR) {
            const date = pd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
            candidates.push({
              headline, url, date, dateMs:pd.getTime(), summary, source, image,
              category:"Athabasca Basin",
            });
          }
        }
      } catch(e) {}
    }));

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
