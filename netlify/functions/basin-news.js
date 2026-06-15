const COMPANIES = [
  { name:"NexGen",           tickers:["NXE","NXG"],     match:["nexgen","nxe"] },
  { name:"Denison Mines",    tickers:["DML","DNN"],     match:["denison"] },
  { name:"Fission Uranium",  tickers:["FCU"],           match:["fission uranium","fcu"] },
  { name:"IsoEnergy",        tickers:["ISO"],           match:["isoenergy","iso energy"] },
  { name:"Skyharbour",       tickers:["SYH"],           match:["skyharbour"] },
  { name:"Cameco",           tickers:["CCO","CCJ"],     match:["cameco"] },
  { name:"Uranium Energy",   tickers:["UEC"],           match:["uranium energy","uec"] },
  { name:"Canadian Uranium", tickers:["CANU"],          match:["canadian uranium","canu"] },
  { name:"Atha Energy",      tickers:["SASK"],          match:["atha energy","sask"] },
  { name:"Baselode",         tickers:["FIND"],          match:["baselode"] },
  { name:"Purepoint",        tickers:["PTU"],           match:["purepoint"] },
  { name:"F3 Uranium",       tickers:["FUU"],           match:["f3 uranium","fuu"] },
  { name:"Standard Uranium", tickers:["STND"],          match:["standard uranium"] },
  { name:"Forum Energy",     tickers:["FMC"],           match:["forum energy"] },
  { name:"Azincourt",        tickers:["AAZ"],           match:["azincourt"] },
  { name:"Fortune Bay",      tickers:["FOR"],           match:["fortune bay"] },
  { name:"CanAlaska",        tickers:["CVV"],           match:["canalaska"] },
  { name:"ALX Resources",    tickers:["AL"],            match:["alx resources"] },
  { name:"Appia",            tickers:["API","APAAF"],   match:["appia"] },
  { name:"Uranium Royalty",  tickers:["URC","UROY"],    match:["uranium royalty"] },
  { name:"NexGen",           tickers:["NXE"],           match:["rook i","arrow deposit"] },
];

const FEEDS = [
  { url:"https://www.globenewswire.com/RssFeed/keyword/uranium",        source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/athabasca",      source:"GlobeNewswire" },
  { url:"https://www.globenewswire.com/RssFeed/keyword/uranium+mining", source:"GlobeNewswire" },
  { url:"https://www.newsfilecorp.com/rss/uranium",                     source:"Newsfile Corp" },
];

function parseRSS(xml, source) {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  return items.map(item => {
    const getText = (tag, text) => {
      const cdataMatch = text.match(new RegExp(`<${tag}>[^<]*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>[^<]*<\\/${tag}>`));
      const plainMatch = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return (cdataMatch?.[1] || plainMatch?.[1] || "").trim();
    };
    const title   = getText("title",       item);
    const link    = getText("link",        item) || getText("guid", item);
    const pubDate = getText("pubDate",     item);
    const desc    = getText("description", item).replace(/<[^>]+>/g,"").substring(0,250);
    const lower   = (title + " " + desc).toLowerCase();
    const matched = COMPANIES.find(c => c.match.some(m => lower.includes(m)));
    if (!matched || !title || !link) return null;
    let dateStr = "";
    try { dateStr = new Date(pubDate).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }); } catch {}
    return { headline:title, url:link.trim(), date:dateStr, company:matched.name,
             ticker:matched.tickers[0], summary:desc, source, type:"Press Release" };
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

    // Deduplicate by headline and sort newest first
    const seen = new Set();
    const results = allItems
      .filter(i => { if (seen.has(i.headline)) return false; seen.add(i.headline); return true; })
      .sort((a,b) => new Date(b.date||0) - new Date(a.date||0))
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
