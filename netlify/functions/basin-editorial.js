const BASIN_KEYWORDS = ["athabasca","saskatchewan","athabasca basin","uranium","nuclear","cameco","yellowcake","u3o8","nexgen","denison"];

const FEEDS = [
  { url:"https://www.mining.com/category/uranium/feed/",                      source:"Mining.com"        },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+basin",      source:"GlobeNewswire"     },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca+uranium",    source:"GlobeNewswire"     },
  { url:"https://www.world-nuclear-news.org/rss",                             source:"World Nuclear News"},
  { url:"https://www.mining.com/category/uranium-2/feed/",                    source:"Mining.com"        },
  { url:"https://financialpost.com/tag/uranium/feed",                         source:"Financial Post"    },
  { url:"https://financialpost.com/tag/cameco-corp/feed",                     source:"Financial Post"    },
  { url:"https://financialpost.com/commodities/energy/feed",                  source:"Financial Post"    },
  { url:"https://www.northernminer.com/news/feed/",                           source:"Northern Miner"    },
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

function relevanceScore(text) {
  const t = text.toLowerCase();
  let s = 0;
  // Strongest: directly about the basin / Saskatchewan
  if (t.includes("athabasca")) s += 10;
  if (t.includes("saskatchewan")) s += 6;
  // Canada nuclear/uranium policy angle
  if (t.includes("uranium")) s += 4;
  if (t.includes("cameco")) s += 4;
  if (t.includes("nuclear")) s += 2;
  if (t.includes("canada") || t.includes("canadian") || t.includes("carney")) s += 2;
  // Named juniors
  ["nexgen","denison","fission","isoenergy","skyharbour"].forEach(n=>{ if(t.includes(n)) s += 2; });
  return s;
}

// Optional: pin a specific article as the hero story by setting FEATURED_STORY_URL in Netlify.
// We fetch the page's OpenGraph tags so the card renders with the right title/image/summary.
async function fetchPinnedStory(url) {
  try {
    const res = await fetch(url, {
      headers:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const og = (p) => html.match(new RegExp(`<meta[^>]+property=["']og:${p}["'][^>]+content=["']([^"']+)["']`,"i"))?.[1]
                    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${p}["']`,"i"))?.[1]
                    || html.match(new RegExp(`<meta[^>]+name=["']${p}["'][^>]+content=["']([^"']+)["']`,"i"))?.[1];
    const headline = decodeHtml(og("title") || html.match(/<title>([^<]+)<\/title>/)?.[1] || "");
    if (!headline) return null;
    const siteName = og("site_name") || "";
    return {
      headline,
      url,
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      summary: decodeHtml(og("description") || ""),
      source: siteName || "Featured",
      image: og("image") || null,
      category: "Featured",
      pinned: true,
    };
  } catch { return null; }
}

exports.handler = async () => {
  try {
    // 1) Manual override wins if set
    const pinnedUrl = process.env.FEATURED_STORY_URL;
    if (pinnedUrl) {
      const pinned = await fetchPinnedStory(pinnedUrl.trim());
      if (pinned) {
        return { statusCode:200, headers:{"Access-Control-Allow-Origin":"*"}, body: JSON.stringify(pinned) };
      }
    }

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

          const score = relevanceScore(combined);
          if (score < 4) continue; // must be genuinely uranium/nuclear-relevant, not just any match

          // Prefer editorial (allow multi-company mentions)
          const companyCount = COMPANY_NAMES.filter(n => combined.toLowerCase().includes(n)).length;
          const headlineLower = headline.toLowerCase();
          const isSingleCompanyPR = COMPANY_NAMES.some(n => headlineLower.startsWith(n));
          if (companyCount > 1 || !isSingleCompanyPR) {
            const date = pd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
            candidates.push({
              headline, url, date, dateMs:pd.getTime(), summary, source, image,
              category:"Athabasca Basin", score,
            });
          }
        }
      } catch(e) {}
    }));

    // Rank by relevance, then recency. Recent + highly-relevant wins.
    const now = Date.now();
    const best = candidates.sort((a,b) => {
      const ra = a.score + Math.max(0, 6 - (now - a.dateMs)/(24*3600*1000)); // recency bonus, decays over ~6 days
      const rb = b.score + Math.max(0, 6 - (now - b.dateMs)/(24*3600*1000));
      return rb - ra;
    })[0];
    const result = best ? (({ dateMs, score, ...rest }) => rest)(best) : null;

    return {
      statusCode: 200,
      headers: {"Access-Control-Allow-Origin":"*"},
      body: JSON.stringify(result || {}),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({error:e.message}) };
  }
};
