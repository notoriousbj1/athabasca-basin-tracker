const COMPANIES = [
  { name:"Cameco",           ticker:"CCO",  search:"Cameco+Corporation"          },
  { name:"NexGen Energy",    ticker:"NXE",  search:"NexGen+Energy"               },
  { name:"Denison Mines",    ticker:"DML",  search:"Denison+Mines"               },
  { name:"Fission Uranium",  ticker:"FCU",  search:"Fission+Uranium"             },
  { name:"IsoEnergy",        ticker:"ISO",  search:"IsoEnergy"                   },
  { name:"Skyharbour",       ticker:"SYH",  search:"Skyharbour+Resources"        },
  { name:"F3 Uranium",       ticker:"FUU",  search:"F3+Uranium"                  },
  { name:"Uranium Energy",   ticker:"UEC",  search:"Uranium+Energy+Corp"         },
  { name:"Baselode Energy",  ticker:"FIND", search:"Baselode+Energy"             },
  { name:"Canadian Uranium", ticker:"CANU", search:"Canadian+Uranium"            },
  { name:"Atha Energy",      ticker:"SASK", search:"Atha+Energy"                 },
  { name:"Purepoint Uranium",ticker:"PTU",  search:"Purepoint+Uranium"           },
  { name:"Standard Uranium", ticker:"STND", search:"Standard+Uranium"            },
  { name:"Forum Energy",     ticker:"FMC",  search:"Forum+Energy+Metals"         },
  { name:"Azincourt Energy", ticker:"AAZ",  search:"Azincourt+Energy"            },
  { name:"Fortune Bay",      ticker:"FOR",  search:"Fortune+Bay+Corp"            },
  { name:"CanAlaska Uranium",ticker:"CVV",  search:"CanAlaska+Uranium"           },
  { name:"ALX Resources",    ticker:"AL",   search:"ALX+Resources"               },
  { name:"Appia",            ticker:"API",  search:"Appia+Rare+Earths"           },
  { name:"Uranium Royalty",  ticker:"URC",  search:"Uranium+Royalty+Corp"        },
  { name:"Fission 3.0",      ticker:"FIS",  search:"Fission+3"                   },
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

function getLatest(xml, company) {
  const items = [
    ...(xml.match(/<item[\s\S]*?<\/item>/g)   || []),
    ...(xml.match(/<entry[\s\S]*?<\/entry>/g) || []),
  ];
  for (const item of items) {
    const get = (tag) => {
      const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
      const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return (cd?.[1] || pl?.[1] || "").trim();
    };
    const headline = get("title").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    const url      = extractUrl(item);
    const pubDate  = get("pubDate") || get("published") || get("updated");
    const rawDesc  = get("description") || get("summary") || "";
    const summary  = rawDesc.replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim().substring(0,220);
    if (!headline || !url) continue;
    const parsedDate = parseDate(pubDate);
    if (!parsedDate || parsedDate < CUTOFF) continue;
    const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
    return { headline, url, date, dateMs:parsedDate.getTime(), summary,
             company:company.name, ticker:company.ticker, source:"GlobeNewswire", type:"Press Release" };
  }
  return null;
}

exports.handler = async () => {
  try {
    const results = await Promise.all(COMPANIES.map(async (co) => {
      try {
        const url = `https://www.globenewswire.com/RssFeed/keyword/${co.search}`;
        const res = await fetch(url, {
          headers:{ "User-Agent":"Mozilla/5.0 (compatible; news aggregator)" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return null;
        const xml = await res.text();
        return getLatest(xml, co);
      } catch(e) { return null; }
    }));

    const valid = results
      .filter(Boolean)
      .sort((a,b) => b.dateMs - a.dateMs)
      .map(({ dateMs, ...rest }) => rest)
      .slice(0, 12);

    return {
      statusCode:200,
      headers:{ "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(valid),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
