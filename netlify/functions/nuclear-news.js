const FEEDS = [
  { url:"https://www.world-nuclear-news.org/rss",                       source:"World Nuclear News"          },
  { url:"https://www.nucnet.org/rss.xml",                               source:"NucNet"                      },
  { url:"https://www.power-technology.com/category/nuclear/feed/",      source:"Power Technology"            },
  { url:"https://www.ans.org/news/rss/",                                source:"American Nuclear Society"    },
  { url:"https://www.neimagazine.com/rss",                              source:"Nuclear Engineering Intl"    },
];

const CATEGORIES = [
  { keys:["reactor","build","construct","new plant","unit"],   label:"New Builds"  },
  { keys:["policy","law","regulation","government","act"],     label:"Policy"       },
  { keys:["uranium","fuel","supply","demand","price","spot"],  label:"Market"       },
  { keys:["smr","small modular","advanced","technology"],      label:"Technology"   },
  { keys:["decommission","shutdown","waste","safety"],         label:"Operations"   },
];

const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

function classify(text) {
  const lower = text.toLowerCase();
  return CATEGORIES.find(c => c.keys.some(k => lower.includes(k)))?.label || "Nuclear";
}

function parseRSS(xml, source) {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  return items.map(item => {
    const get = (tag) => {
      const cd = item.match(new RegExp(`<${tag}>[^<]*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`));
      const pl = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return (cd?.[1] || pl?.[1] || "").trim();
    };
    const headline = get("title");
    const url      = get("link") || get("guid");
    const pubDate  = get("pubDate");
    const summary  = get("description").replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").trim().substring(0,200);

    let parsedDate;
    try { parsedDate = new Date(pubDate); } catch { return null; }
    if (!parsedDate || isNaN(parsedDate.getTime()) || parsedDate < CUTOFF) return null;
    if (!headline || !url) return null;

    const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
    return { headline, url:url.trim(), date, dateMs:parsedDate.getTime(),
             summary, source, category:classify(headline + " " + summary) };
  }).filter(Boolean);
}

exports.handler = async () => {
  try {
    const allItems = [];
    await Promise.all(FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers:{ "User-Agent":"Mozilla/5.0 (compatible; RSS reader)" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        allItems.push(...parseRSS(xml, source));
      } catch(e) {}
    }));

    const seen = new Set();
    const results = allItems
      .filter(i => { if (seen.has(i.headline)) return false; seen.add(i.headline); return true; })
      .sort((a,b) => b.dateMs - a.dateMs)
      .map(({ dateMs, ...rest }) => rest)
      .slice(0, 10);

    return {
      statusCode:200,
      headers:{ "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
