const COMPANIES = [
  { name:"Cameco",           ticker:"CCO",  feed:"https://www.cameco.com/feed/"                              },
  { name:"NexGen Energy",    ticker:"NXE",  feed:"https://nexgenenergy.ca/feed/"                             },
  { name:"Denison Mines",    ticker:"DML",  feed:"https://denisonmines.com/feed/"                            },
  { name:"Fission Uranium",  ticker:"FCU",  feed:"https://fissionuranium.com/feed/"                          },
  { name:"IsoEnergy",        ticker:"ISO",  feed:"https://isoenergy.ca/feed/"                                },
  { name:"Skyharbour",       ticker:"SYH",  feed:"https://skyharbourltd.com/feed/"                           },
  { name:"F3 Uranium",       ticker:"FUU",  feed:"https://f3uranium.ca/feed/"                                },
  { name:"Uranium Energy",   ticker:"UEC",  feed:"https://uraniumenergy.com/feed/"                           },
  { name:"Baselode Energy",  ticker:"FIND", feed:"https://baselodeenergy.com/feed/"                          },
  { name:"Canadian Uranium", ticker:"CANU", feed:"https://canadianuranium.ca/feed/"                          },
  { name:"Atha Energy",      ticker:"SASK", feed:"https://athaenergy.ca/feed/"                               },
  { name:"Purepoint Uranium",ticker:"PTU",  feed:"https://www.purepoint.ca/feed/"                            },
  { name:"Standard Uranium", ticker:"STND", feed:"https://standarduranium.ca/feed/"                          },
  { name:"Forum Energy",     ticker:"FMC",  feed:"https://forumenergymetals.com/feed/"                       },
  { name:"Azincourt Energy", ticker:"AAZ",  feed:"https://azincourtenergy.com/feed/"                         },
  { name:"Fortune Bay",      ticker:"FOR",  feed:"https://fortunebaycorp.com/feed/"                          },
  { name:"CanAlaska Uranium",ticker:"CVV",  feed:"https://canalaska.com/feed/"                               },
  { name:"ALX Resources",    ticker:"AL",   feed:"https://alxresources.ca/feed/"                             },
  { name:"Appia",            ticker:"API",  feed:"https://appiaenergy.ca/feed/"                              },
  { name:"Uranium Royalty",  ticker:"URC",  feed:"https://uraniumroyaltycorp.com/feed/"                      },
  { name:"Fission 3.0",      ticker:"FIS",  feed:"https://fission3.com/feed/"                                },
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
    const pubDate  = get("pubDate") || get("published") || get("updated") || get("dc:date");
    const rawDesc  = get("description") || get("summary") || get("content") || "";
    const summary  = rawDesc.replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim().substring(0,220);
    if (!headline || !url) continue;
    const parsedDate = parseDate(pubDate);
    if (!parsedDate || parsedDate < CUTOFF) continue;
    const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
    return { headline, url, date, dateMs:parsedDate.getTime(), summary,
             company:company.name, ticker:company.ticker, source:"Company IR", type:"Press Release" };
  }
  return null;
}

exports.handler = async () => {
  try {
    const results = await Promise.all(COMPANIES.map(async (co) => {
      try {
        const res = await fetch(co.feed, {
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
