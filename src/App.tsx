import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, AreaChart, Area, ComposedChart, Legend, ScatterChart, Scatter, ZAxis, ReferenceArea, CartesianGrid } from "recharts";
import { Atom, Hammer, Timer, DollarSign, Building2, Zap, Globe, TrendingUp, BarChart3, Newspaper, Landmark, Play, Map, Activity, Flag, Scale, Users, Tag, Radio, Linkedin, Star } from "lucide-react";

// ─────────────────────────────────────────────
// COMPANY DATA
// ─────────────────────────────────────────────
const COMPANIES = [
  {
    id:"cameco", ticker:"CCO.TO", altTicker:"CCJ", name:"Cameco", fullName:"Cameco Corporation",
    exchange:"TSX / NYSE", price:67.82, changePct:2.17, marketCap:"30.2B",
    sharesBasic:"394M", sharesFD:"398M", cashPosition:"$1.8B USD", float:"391M",
    insiderOwnership:"~3%", institutionalOwnership:"~72%", avgVolume:"4.2M",
    stage:"Producer",
    description:"World's largest publicly traded uranium company — operates Cigar Lake and McArthur River, supplying ~15% of global primary production.",
    projects:[
      { name:"Cigar Lake", stage:"Operating Mine", ownership:"54.547%", grade:"14.7% U₃O₈", resource:"225 Mlb", depth:"450m" },
      { name:"McArthur River / Key Lake", stage:"Operating Mine", ownership:"69.8%", grade:"6.86% U₃O₈", resource:"476 Mlb", depth:"640m" },
    ],
    location:{ lat:58.07, lng:-104.53 }, color:"#B07A08",
    ytSearch:"Cameco CCJ uranium 2025 investor presentation",
  },
  {
    id:"nexgen", ticker:"NXE", altTicker:"NXG.TO", name:"NexGen", fullName:"NexGen Energy Ltd.",
    exchange:"NYSE / TSX", price:8.45, changePct:-0.82, marketCap:"4.1B",
    sharesBasic:"485M", sharesFD:"510M", cashPosition:"$295M USD", float:"426M",
    insiderOwnership:"~12%", institutionalOwnership:"~58%", avgVolume:"8.5M",
    stage:"Advanced Developer",
    description:"Developer of Arrow at Rook I — the world's largest undeveloped uranium deposit (257 Mlb). Environmental assessment filed with CNSC.",
    projects:[
      { name:"Arrow — Rook I", stage:"CNSC / EA Review", ownership:"100%", grade:"3.1% U₃O₈ avg", resource:"257.7 Mlb", depth:"100–750m" },
    ],
    location:{ lat:58.3, lng:-109.2 }, color:"#1A5AA8",
    ytSearch:"NexGen Energy Arrow Rook uranium 2025",
  },
  {
    id:"denison", ticker:"DML.TO", altTicker:"DNN", name:"Denison", fullName:"Denison Mines Corp.",
    exchange:"TSX / NYSE-A", price:2.89, changePct:1.50, marketCap:"1.8B",
    sharesBasic:"623M", sharesFD:"680M", cashPosition:"$45M CAD", float:"591M",
    insiderOwnership:"~5%", institutionalOwnership:"~60%", avgVolume:"5.8M",
    stage:"Advanced Developer",
    description:"Wheeler River hosts two world-class deposits. Phoenix ISR feasibility complete. Owns 22.5% of McClean Lake Mill and leveraged ISR exposure.",
    projects:[
      { name:"Wheeler River — Phoenix (ISR)", stage:"Feasibility / Permitting", ownership:"95%", grade:"19.1% U₃O₈", resource:"109.4 Mlb", depth:"400m" },
      { name:"Wheeler River — Gryphon", stage:"Feasibility", ownership:"95%", grade:"1.3% U₃O₈", resource:"66.3 Mlb", depth:"700–900m" },
      { name:"McClean Lake Mill", stage:"Operating (22.5%)", ownership:"22.5%", grade:"—", resource:"—", depth:"Surface" },
    ],
    location:{ lat:58.0, lng:-104.5 }, color:"#8B68C8",
    ytSearch:"Denison Mines DNN Wheeler River uranium 2025",
  },
  {
    id:"fission", ticker:"FCU.TO", altTicker:"FCUUF", name:"Fission", fullName:"Fission Uranium Corp.",
    exchange:"TSX / OTC", price:1.12, changePct:-1.23, marketCap:"620M",
    sharesBasic:"553M", sharesFD:"600M", cashPosition:"$35M CAD", float:"509M",
    insiderOwnership:"~8%", institutionalOwnership:"~45%", avgVolume:"1.2M",
    stage:"Developer",
    description:"Shallow, high-grade Triple R at Patterson Lake South. Near-surface basement-hosted — uniquely low strip ratio. CNSC permitting underway.",
    projects:[
      { name:"Triple R — Patterson Lake South", stage:"CNSC Permitting", ownership:"100%", grade:"2.4% U₃O₈ avg", resource:"102.4 Mlb", depth:"50–250m" },
    ],
    location:{ lat:58.4, lng:-109.3 }, color:"#1A7A44",
    ytSearch:"Fission Uranium FCU Triple R Patterson Lake 2025",
  },
  {
    id:"iso", ticker:"ISO.V", altTicker:"ISENF", name:"IsoEnergy", fullName:"IsoEnergy Ltd.",
    exchange:"TSX-V / OTC", price:2.45, changePct:3.17, marketCap:"280M",
    sharesBasic:"114M", sharesFD:"125M", cashPosition:"$18M CAD", float:"97M",
    insiderOwnership:"~15%", institutionalOwnership:"~38%", avgVolume:"320K",
    stage:"Explorer / Delineation",
    description:"Hurricane deposit averages 34.5% U₃O₈ — among world's highest grade. Denison Mines holds ~17%. Larocque East advancing.",
    projects:[
      { name:"Hurricane", stage:"Resource Delineation", ownership:"100%", grade:"34.5% U₃O₈ avg", resource:"48.6 Mlb", depth:"320–420m" },
      { name:"Larocque East", stage:"Drilling", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:58.5, lng:-104.1 }, color:"#C01818",
    ytSearch:"IsoEnergy Hurricane uranium ISO 2025",
  },
  {
    id:"skyharbour", ticker:"SYH.V", altTicker:"SYHBF", name:"Skyharbour", fullName:"Skyharbour Resources Ltd.",
    exchange:"TSX-V / OTC", price:0.65, changePct:-0.46, marketCap:"95M",
    sharesBasic:"146M", sharesFD:"165M", cashPosition:"$8M CAD", float:"129M",
    insiderOwnership:"~12%", institutionalOwnership:"~25%", avgVolume:"180K",
    stage:"Explorer",
    description:"Multi-project basin-scale explorer. Partner-funded JV model provides broad exposure at low cost. Moore Lake program active.",
    projects:[
      { name:"Moore Lake", stage:"Active Drilling", ownership:"100%", grade:"High-grade intersections", resource:"~7.4 Mlb hist.", depth:"200–560m" },
      { name:"Russell Lake", stage:"JV / Partner Funded", ownership:"75%", grade:"TBD", resource:"TBD", depth:"TBD" },
      { name:"Falcon Point", stage:"Partner Funded", ownership:"50%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:58.8, lng:-106.5 }, color:"#6366F1",
    ytSearch:"Skyharbour Resources SYH Moore Lake uranium 2025",
  },
  {
    id:"f3", ticker:"FUU.V", altTicker:"FUUIF", name:"F3 Uranium", fullName:"F3 Uranium Corp.",
    exchange:"TSX-V / OTC", price:0.28, changePct:2.78, marketCap:"72M",
    sharesBasic:"257M", sharesFD:"290M", cashPosition:"$5M CAD", float:"211M",
    insiderOwnership:"~18%", institutionalOwnership:"~20%", avgVolume:"450K",
    stage:"Explorer",
    description:"PLN borders NexGen's Rook I and Fission's PLS — prime real estate in the prolific Patterson Lake corridor.",
    projects:[
      { name:"PLN — Patterson Lake North", stage:"Active Drilling", ownership:"100%", grade:"Discovery zone identified", resource:"TBD", depth:"50–350m" },
    ],
    location:{ lat:58.52, lng:-109.55 }, color:"#EC4899",
    ytSearch:"F3 Uranium FUU PLN Patterson Lake North 2025",
  },
  {
    id:"uec", ticker:"UEC", altTicker:"UEC", name:"Uranium Energy", fullName:"Uranium Energy Corp.",
    exchange:"NYSE", price:7.82, changePct:1.43, marketCap:"2.8B",
    sharesBasic:"358M", sharesFD:"385M", cashPosition:"$180M USD", float:"333M",
    insiderOwnership:"~7%", institutionalOwnership:"~55%", avgVolume:"6.2M",
    stage:"Producer / Developer",
    description:"US ISR uranium producer. Athabasca Basin exposure via Roughrider (ex-Rio Tinto) acquisition. Wyoming and Texas operations in production.",
    projects:[
      { name:"Roughrider", stage:"Permitting", ownership:"100%", grade:"6.9% U₃O₈ avg", resource:"58.1 Mlb", depth:"540–760m" },
    ],
    location:{ lat:57.5, lng:-104.3 }, color:"#14B8A6",
    ytSearch:"Uranium Energy Corp UEC Roughrider Athabasca 2025",
  },
  {
    id:"baselode", ticker:"FIND.V", altTicker:"BSENF", name:"Baselode", fullName:"Baselode Energy Corp.",
    exchange:"TSX-V / OTC", price:0.18, changePct:-2.08, marketCap:"28M",
    sharesBasic:"155M", sharesFD:"180M", cashPosition:"$3M CAD", float:"124M",
    insiderOwnership:"~20%", institutionalOwnership:"~15%", avgVolume:"95K",
    stage:"Explorer",
    description:"Unconventional near-surface basement uranium model. ACKIO and Hook zone discoveries with wide-spaced alteration systems.",
    projects:[
      { name:"ACKIO / Hook Zone", stage:"Active Drilling", ownership:"100%", grade:"Multiple intersections", resource:"TBD", depth:"50–250m" },
    ],
    location:{ lat:58.2, lng:-106.8 }, color:"#84CC16",
    ytSearch:"Baselode Energy FIND ACKIO uranium 2025",
  },
  {
    id:"fission3", ticker:"FIS.V", altTicker:"FISOF", name:"Fission 3.0", fullName:"Fission 3.0 Corp.",
    exchange:"TSXV / OTCQB", price:0.07, changePct:-3.45, marketCap:"16M",
    sharesBasic:"228M", sharesFD:"260M", cashPosition:"$2.5M CAD", float:"195M",
    insiderOwnership:"~22%", institutionalOwnership:"~10%", avgVolume:"180K",
    stage:"Explorer",
    description:"Basin-wide explorer with properties including Hearty Bay and Pasfield Lake. Spinout from the Fission Uranium management team.",
    projects:[
      { name:"Hearty Bay", stage:"Reconnaissance", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
      { name:"Pasfield Lake", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:58.5, lng:-105.5 }, color:"#FF8C42",
    ytSearch:"Fission 3.0 FIS uranium Athabasca 2025",
  },
  {
    id:"canalaska", ticker:"CVV.V", altTicker:"CVVUF", name:"CanAlaska", fullName:"CanAlaska Uranium Ltd.",
    exchange:"TSXV / OTCQB", price:0.38, changePct:5.56, marketCap:"65M",
    sharesBasic:"170M", sharesFD:"195M", cashPosition:"$9M CAD", float:"148M",
    insiderOwnership:"~14%", institutionalOwnership:"~22%", avgVolume:"210K",
    stage:"Explorer",
    description:"Basin explorer with Cameco JV partnership at West McArthur. Wide portfolio of drill-ready targets across the Athabasca.",
    projects:[
      { name:"West McArthur (Cameco JV)", stage:"Exploration / Drilling", ownership:"17%", grade:"Historical high-grade", resource:"TBD", depth:"TBD" },
      { name:"Pike", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:57.8, lng:-106.0 }, color:"#A78BFA",
    ytSearch:"CanAlaska Uranium CVV Athabasca 2025",
  },
  {
    id:"purepoint", ticker:"PTU.V", altTicker:"PTUUF", name:"Purepoint", fullName:"Purepoint Uranium Group Inc.",
    exchange:"TSXV / OTCQB", price:0.14, changePct:-2.78, marketCap:"27M",
    sharesBasic:"194M", sharesFD:"220M", cashPosition:"$3.5M CAD", float:"165M",
    insiderOwnership:"~16%", institutionalOwnership:"~12%", avgVolume:"95K",
    stage:"Explorer",
    description:"JV partnerships with Cameco and Orano at Hook Lake and Smart Lake. Turnor Lake is the 100%-owned flagship exploration property.",
    projects:[
      { name:"Smart Lake / Hook Lake (Cameco & Orano JV)", stage:"Exploration", ownership:"23%", grade:"TBD", resource:"TBD", depth:"TBD" },
      { name:"Turnor Lake", stage:"Drilling", ownership:"100%", grade:"Historical showings", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:57.4, lng:-106.5 }, color:"#34D399",
    ytSearch:"Purepoint Uranium PTU Athabasca 2025",
  },
  {
    id:"forum", ticker:"FMC.V", altTicker:"FDCFF", name:"Forum Energy", fullName:"Forum Energy Metals Corp.",
    exchange:"TSXV / OTCQB", price:0.27, changePct:3.85, marketCap:"38M",
    sharesBasic:"140M", sharesFD:"160M", cashPosition:"$4.5M CAD", float:"118M",
    insiderOwnership:"~18%", institutionalOwnership:"~15%", avgVolume:"85K",
    stage:"Explorer",
    description:"Multi-commodity basin explorer focused on uranium and battery metals. Clearwater and Love Lake are priority uranium targets.",
    projects:[
      { name:"Clearwater Uranium", stage:"Drilling", ownership:"100%", grade:"Historical showings", resource:"TBD", depth:"TBD" },
      { name:"Love Lake", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:57.5, lng:-104.0 }, color:"#FB923C",
    ytSearch:"Forum Energy Metals FMC uranium Athabasca 2025",
  },
  {
    id:"standard", ticker:"STND.V", altTicker:"STTDF", name:"Standard Uranium", fullName:"Standard Uranium Ltd.",
    exchange:"TSXV / OTCQB", price:0.11, changePct:-8.33, marketCap:"18M",
    sharesBasic:"165M", sharesFD:"195M", cashPosition:"$2.8M CAD", float:"138M",
    insiderOwnership:"~20%", institutionalOwnership:"~10%", avgVolume:"72K",
    stage:"Explorer",
    description:"Basin explorer with multiple drill-stage projects. Davidson River and Sun Dog target basement-hosted and unconformity uranium.",
    projects:[
      { name:"Davidson River", stage:"Drilling", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
      { name:"Sun Dog", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:57.8, lng:-107.2 }, color:"#60A5FA",
    ytSearch:"Standard Uranium STND Athabasca 2025",
  },
  {
    id:"atha", ticker:"SASK.V", altTicker:"SASKF", name:"Atha Energy", fullName:"Atha Energy Corp.",
    exchange:"TSXV / OTCQB", price:0.52, changePct:8.33, marketCap:"115M",
    sharesBasic:"221M", sharesFD:"250M", cashPosition:"$22M CAD", float:"188M",
    insiderOwnership:"~15%", institutionalOwnership:"~28%", avgVolume:"310K",
    stage:"Explorer",
    description:"One of the largest land positions in the Athabasca Basin by area. Formed via merger; CMB project and Angilak (Nunavut) are flagship assets.",
    projects:[
      { name:"CMB (Central Mineral Belt)", stage:"Drill-Ready / Active", ownership:"100%", grade:"Multiple basement targets", resource:"TBD", depth:"TBD" },
      { name:"Angilak (Nunavut)", stage:"Exploration", ownership:"100%", grade:"Historical resource", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:58.5, lng:-107.5 }, color:"#F472B6",
    ytSearch:"Atha Energy SASK uranium Athabasca CMB 2025",
  },
  {
    id:"azincourt", ticker:"AAZ.V", altTicker:"AZURF", name:"Azincourt", fullName:"Azincourt Energy Corp.",
    exchange:"TSXV / OTCQB", price:0.08, changePct:-11.11, marketCap:"12M",
    sharesBasic:"153M", sharesFD:"175M", cashPosition:"$1.5M CAD", float:"130M",
    insiderOwnership:"~22%", institutionalOwnership:"~8%", avgVolume:"55K",
    stage:"Explorer",
    description:"Western basin explorer at East Preston property — joint venture with Skyharbour Resources and Dixie Gold. Unconformity and basement targets.",
    projects:[
      { name:"East Preston (SYH / Dixie JV)", stage:"Exploration", ownership:"19.5%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:59.2, lng:-108.8 }, color:"#4ADE80",
    ytSearch:"Azincourt Energy AAZ uranium East Preston 2025",
  },
  {
    id:"fortunebay", ticker:"FOR.V", altTicker:"FTBYF", name:"Fortune Bay", fullName:"Fortune Bay Corp.",
    exchange:"TSXV / OTCQB", price:0.13, changePct:-7.14, marketCap:"20M",
    sharesBasic:"155M", sharesFD:"178M", cashPosition:"$2.2M CAD", float:"132M",
    insiderOwnership:"~20%", institutionalOwnership:"~10%", avgVolume:"60K",
    stage:"Explorer",
    description:"Northern basin explorer at the Murmac uranium project. Strike gold property provides commodity diversification.",
    projects:[
      { name:"Murmac Uranium", stage:"Drilling", ownership:"100%", grade:"Historical showings", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:59.0, lng:-108.2 }, color:"#C8A020",
    ytSearch:"Fortune Bay FOR uranium Murmac Athabasca 2025",
  },
  {
    id:"alx", ticker:"AL.V", altTicker:"ALXEF", name:"ALX Resources", fullName:"ALX Resources Corp.",
    exchange:"TSXV / OTCQB", price:0.09, changePct:-10.00, marketCap:"14M",
    sharesBasic:"157M", sharesFD:"180M", cashPosition:"$1.8M CAD", float:"133M",
    insiderOwnership:"~18%", institutionalOwnership:"~8%", avgVolume:"48K",
    stage:"Explorer",
    description:"Multi-project western Athabasca Basin explorer. Gibbons Creek and Carpenter Lake are key uranium-focused drill targets.",
    projects:[
      { name:"Gibbons Creek", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
      { name:"Carpenter Lake", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:59.1, lng:-108.0 }, color:"#38BDF8",
    ytSearch:"ALX Resources AL uranium Athabasca 2025",
  },
  {
    id:"appia", ticker:"API", altTicker:"APAAF", name:"Appia", fullName:"Appia Rare Earths & Uranium Corp.",
    exchange:"CSE / OTCQX", price:0.26, changePct:8.33, marketCap:"30M",
    sharesBasic:"115M", sharesFD:"132M", cashPosition:"$3.5M CAD", float:"97M",
    insiderOwnership:"~17%", institutionalOwnership:"~18%", avgVolume:"78K",
    stage:"Explorer",
    description:"Unique dual-commodity play — Alces Lake hosts high-grade uranium and critical rare earth elements. Otherside uranium project advancing.",
    projects:[
      { name:"Alces Lake (U + REE)", stage:"Drilling", ownership:"100%", grade:"High-grade U + REE", resource:"TBD", depth:"TBD" },
      { name:"PCH / Otherside", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:58.3, lng:-105.7 }, color:"#C084FC",
    ytSearch:"Appia Rare Earths Uranium API Alces Lake 2025",
  },
  {
    id:"urc", ticker:"URC", altTicker:"UROY", name:"U Royalty", fullName:"Uranium Royalty Corp.",
    exchange:"TSX / NASDAQ", price:4.18, changePct:2.45, marketCap:"278M",
    sharesBasic:"66M", sharesFD:"70M", cashPosition:"$28M USD + physical U₃O₈", float:"60M",
    insiderOwnership:"~10%", institutionalOwnership:"~48%", avgVolume:"185K",
    stage:"Royalty Company",
    description:"The only pure-play uranium royalty company. Royalty interests on Cigar Lake, McArthur River, Wheeler River, and 20+ other projects. Physical uranium holdings.",
    projects:[
      { name:"Cigar Lake Royalty", stage:"Producing", ownership:"Royalty", grade:"—", resource:"—", depth:"—" },
      { name:"McArthur River Royalty", stage:"Producing", ownership:"Royalty", grade:"—", resource:"—", depth:"—" },
      { name:"Wheeler River Royalty", stage:"Pre-Production", ownership:"Royalty", grade:"—", resource:"—", depth:"—" },
    ],
    location:{ lat:57.8, lng:-103.8 }, color:"#C8A020",
    ytSearch:"Uranium Royalty Corp URC UROY 2025",
  },
  {
    id:"canu", ticker:"CANU.V", altTicker:"CANUUF", name:"Canadian Uranium", fullName:"Canadian Uranium Inc.",
    exchange:"TSXV / OTCQB", price:1.23, changePct:3.4, marketCap:"42M",
    sharesBasic:"124M", sharesFD:"145M", cashPosition:"$3.8M CAD", float:"102M",
    insiderOwnership:"~20%", institutionalOwnership:"~10%", avgVolume:"88K",
    stage:"Explorer",
    description:"Athabasca Basin uranium explorer with a growing Saskatchewan land package. Multiple basin-wide targets in proximity to known high-grade deposits and active drill programs.",
    projects:[
      { name:"Athabasca Basin — Saskatchewan", stage:"Exploration", ownership:"100%", grade:"TBD", resource:"TBD", depth:"TBD" },
    ],
    location:{ lat:58.3, lng:-106.2 }, color:"#B07A08",
    ytSearch:"Canadian Uranium CANU uranium Athabasca 2025",
  },
];

const DRILLING = [
  { company:"NexGen Energy", ticker:"NXE", program:"Arrow Infill / Step-Out 2025", total:30, drilled:22, pending:8, highlight:"RK-25-154: 20.8% eU₃O₈ over 2.1m — A2 shear zone", status:"Active", updated:"May 28" },
  { company:"Skyharbour Resources", ticker:"SYH.V", program:"Moore Lake Winter–Summer 2025", total:15, drilled:10, pending:5, highlight:"MAN-25-010: 0.62% U₃O₈ over 4.2m at 563m depth", status:"Active", updated:"Jun 1" },
  { company:"Denison Mines", ticker:"DML.TO", program:"Wheeler River Exploration 2025", total:18, drilled:14, pending:4, highlight:"WR-25-018: 1.23% U₃O₈ over 9.5m — Phoenix zone", status:"Active", updated:"May 30" },
  { company:"IsoEnergy", ticker:"ISO.V", program:"Hurricane Delineation Q1–Q2 2025", total:20, drilled:20, pending:0, highlight:"ISO-25-020: 35.2% U₃O₈ over 1.8m; resource update imminent", status:"Assays Complete", updated:"Jun 5" },
  { company:"F3 Uranium", ticker:"FUU.V", program:"PLN Summer 2025 Campaign", total:10, drilled:3, pending:7, highlight:"PLN-25-003: Visual core logged; lab turnaround 6–8 weeks", status:"Drilling", updated:"Jun 8" },
  { company:"Baselode Energy", ticker:"FIND.V", program:"ACKIO 2025 Campaign", total:12, drilled:7, pending:5, highlight:"ACK-25-006: Bleaching & clay alteration confirmed; assays pending", status:"Assay Pending", updated:"Jun 4" },
  { company:"Fission Uranium", ticker:"FCU.TO", program:"PLS Target Drill 2025", total:8, drilled:5, pending:3, highlight:"PLS-025-005: 1.84% U₃O₈ over 3.5m — R840W zone", status:"Partial Assays", updated:"May 22" },
];

const FINANCINGS = [
  { company:"NexGen Energy", ticker:"NXE", type:"Bought Deal", amount:"$150M USD", pricePerUnit:"$8.10/sh", units:"18.52M shares", warrants:"None", agents:"BMO Capital / RBC Capital Markets", closed:"May 2025", purpose:"Arrow development & general working capital", status:"Closed" },
  { company:"Denison Mines", ticker:"DML.TO", type:"Private Placement", amount:"$25M CAD", pricePerUnit:"$2.85/sh", units:"8.77M shares", warrants:"½ wt @ $3.50 / 24mo", agents:"Haywood Securities", closed:"In Progress", purpose:"Wheeler River exploration, working capital", status:"Open" },
  { company:"IsoEnergy", ticker:"ISO.V", type:"Brokered PP", amount:"$10M CAD", pricePerUnit:"$2.35/sh", units:"4.26M shares", warrants:"None", agents:"Canaccord Genuity", closed:"Mar 2025", purpose:"Hurricane delineation drill program & G&A", status:"Closed" },
  { company:"Skyharbour Resources", ticker:"SYH.V", type:"Non-Brokered PP", amount:"$3.5M CAD", pricePerUnit:"$0.62/unit", units:"5.65M units", warrants:"Full wt @ $0.85 / 24mo", agents:"Company", closed:"Apr 2025", purpose:"Moore Lake drilling, basin exploration", status:"Closed" },
  { company:"F3 Uranium", ticker:"FUU.V", type:"Non-Brokered PP", amount:"$2M CAD", pricePerUnit:"$0.27/unit", units:"7.41M units", warrants:"Full wt @ $0.40 / 18mo", agents:"Company", closed:"In Progress", purpose:"PLN summer 2025 drill program", status:"Open" },
  { company:"Baselode Energy", ticker:"FIND.V", type:"Non-Brokered PP", amount:"$1M CAD", pricePerUnit:"$0.175/unit", units:"5.71M units", warrants:"Full wt @ $0.25 / 12mo", agents:"Company", closed:"May 2025", purpose:"ACKIO 2025 drill program", status:"Closed" },
];

const INFLUENCERS = [
  { name:"Justin Huhn", channel:"Uranium Insider", handle:"@UraniumInsider", url:"https://www.youtube.com/@UraniumInsider", focus:"Premium uranium market analysis, company deep dives, macro timing" },
  { name:"Palisades Gold Radio", channel:"Palisades Radio", handle:"@PalisadesGoldRadio", url:"https://www.youtube.com/@PalisadesGoldRadio", focus:"Resource sector CEO interviews — uranium featured regularly" },
  { name:"Commodity Culture", channel:"Commodity Culture", handle:"@CommodityCulture", url:"https://www.youtube.com/@CommodityCulture", focus:"Basin-focused company interviews, site visits, news analysis" },
  { name:"Mining Stock Daily", channel:"Mining Stock Daily", handle:"@MiningStockDaily", url:"https://www.youtube.com/@MiningStockDaily", focus:"Daily mining sector news, uranium company press releases" },
  { name:"Lobo Tiggre", channel:"Louis James LLC", handle:"@LoboTiggre", url:"https://www.youtube.com/@LoboTiggre", focus:"Speculative resource investing; uranium macro theses" },
  { name:"Sprott Media", channel:"Sprott Media", handle:"@SprottMedia", url:"https://www.youtube.com/@SprottMedia", focus:"Physical uranium trust analysis, institutional uranium market views" },
];

const YTD_PERF = [
  { ticker:"SASK.V", ytd:22.0  },
  { ticker:"UEC",    ytd:18.3  },
  { ticker:"API",    ytd:15.8  },
  { ticker:"ISO.V",  ytd:12.5  },
  { ticker:"URC",    ytd:10.5  },
  { ticker:"CVV.V",  ytd:8.5   },
  { ticker:"CCO",    ytd:8.2   },
  { ticker:"APPIA",  ytd:8.3   },
  { ticker:"FUU.V",  ytd:5.6   },
  { ticker:"FMC.V",  ytd:4.2   },
  { ticker:"DML",    ytd:3.1   },
  { ticker:"SYH.V",  ytd:-2.8  },
  { ticker:"FIS.V",  ytd:-5.2  },
  { ticker:"NXE",    ytd:-6.4  },
  { ticker:"PTU.V",  ytd:-6.8  },
  { ticker:"FCU",    ytd:-8.9  },
  { ticker:"FOR.V",  ytd:-9.4  },
  { ticker:"STND.V", ytd:-12.5 },
  { ticker:"FIND.V", ytd:-15.2 },
  { ticker:"AAZ.V",  ytd:-18.6 },
  { ticker:"AL.V",   ytd:-20.1 },
];

const GLOBAL_STATS = [
  { label:"Operating Reactors",    value:"440",      sub:"globally" },
  { label:"Under Construction",    value:"59",       sub:"new reactors" },
  { label:"Planned / Committed",   value:"110+",     sub:"projects" },
  { label:"Global Demand",         value:"~185 Mlb", sub:"U₃O₈ / year" },
  { label:"Global Production",     value:"~145 Mlb", sub:"supply deficit" },
  { label:"Basin's Share",         value:"~20%",     sub:"of world supply" },
];

const STATIC_GLOBAL_NEWS = [
  { headline:"China Approves 10 New Nuclear Reactors in Single Announcement, Largest Single-Year Commitment in History", publication:"World Nuclear News", category:"New Builds", date:"Jun 9, 2026", url:"https://www.world-nuclear-news.org/", summary:"China's State Council approved construction of 10 new reactors across five sites, adding approximately 11 GW of capacity and cementing the country's dominance in nuclear expansion." },
  { headline:"US Senate Passes ADVANCE Act Companion Bill, Streamlining NRC Licensing Timelines by Up to 50%", publication:"Reuters", category:"Policy", date:"Jun 7, 2026", url:"https://www.reuters.com/business/energy/", summary:"Bipartisan legislation clears procedural hurdles, directing the NRC to overhaul its review process for advanced reactor designs and significantly cut approval timelines." },
  { headline:"Global Nuclear Investment Hits Record $65 Billion in 2025 as Utilities Race to Secure Low-Carbon Baseload", publication:"Bloomberg", category:"Market", date:"Jun 6, 2026", url:"https://www.bloomberg.com/energy", summary:"New data from BloombergNEF shows nuclear capital deployment has surpassed solar for the first time in a decade, driven by AI datacenter demand and net-zero commitments." },
  { headline:"EU Taxonomy Formally Confirms Nuclear as Green Investment — Trillion-Dollar ESG Capital Pool Opens", publication:"Financial Times", category:"Policy", date:"Jun 5, 2026", url:"https://www.ft.com/energy", summary:"The European Commission's taxonomy delegated act locks in nuclear's sustainable label, potentially unlocking institutional capital previously blocked by ESG mandates." },
  { headline:"Uranium Spot Price Forecast: Analysts See Supply Deficit Widening Through 2028 as Reactor Pipeline Grows", publication:"S&P Global", category:"Market", date:"Jun 4, 2026", url:"https://www.spglobal.com/commodityinsights/", summary:"A new S&P Commodity Insights report projects the uranium market will face a structural deficit of 25–35 Mlb annually by 2027, supporting a multi-year price floor above $75/lb." },
  { headline:"India Sanctions Six New Pressurised Heavy Water Reactors, Targeting 20 GW Nuclear by 2032", publication:"Nuclear Engineering International", category:"New Builds", date:"Jun 3, 2026", url:"https://www.neimagazine.com/", summary:"India's Cabinet Committee on Economic Affairs approved the country's most ambitious nuclear expansion in three decades, with construction to begin at two sites in 2026." },
  { headline:"Westinghouse AP1000 Secures Three-Country Framework Agreement Across Eastern Europe — 12 Units Targeted", publication:"World Nuclear News", category:"New Builds", date:"Jun 1, 2026", url:"https://www.world-nuclear-news.org/", summary:"Poland, Czech Republic, and Estonia signed a joint procurement framework with Westinghouse, standardising on the AP1000 design and sharing procurement costs across 12 planned units." },
  { headline:"30 Nations Reaffirm COP28 Nuclear Pledge — Tripling Global Capacity to 2,200 GW by 2050 on Track", publication:"AP News", category:"Policy", date:"May 30, 2026", url:"https://apnews.com/hub/nuclear", summary:"A mid-year review of COP28 signatories shows 27 of 30 nations have initiated formal policy frameworks, with the IAEA reporting the pledge is currently ahead of its 2030 interim milestones." },
  { headline:"Small Modular Reactor Race Heats Up: NuScale, GE Hitachi, and Rolls-Royce All Hit Key Milestones in May", publication:"Mining.com", category:"Technology", date:"May 28, 2026", url:"https://www.mining.com/uranium", summary:"Three leading SMR developers reported concurrent regulatory and commercial milestones last month — NuScale's VOYGR received a customer term sheet, GE Hitachi's BWRX-300 broke ground in Ontario, and Rolls-Royce completed UK Generic Design Assessment Phase 2." },
  { headline:"AI Datacenters Fuel Nuclear Renaissance — Tech Giants Signing Long-Term Power Purchase Agreements", publication:"The Guardian", category:"Market", date:"May 26, 2026", url:"https://www.theguardian.com/environment/nuclear-power", summary:"Microsoft, Google, Amazon, and Meta have collectively committed to over 8 GW of nuclear offtake agreements since 2024, with analysts crediting AI electricity demand as the dominant near-term driver of new reactor financing." },
];

const TABS = [
  { id:"overview",    label:"Overview"    },
  { id:"companies",   label:"Companies"   },
  { id:"map",         label:"Basin Map"   },
  { id:"news",        label:"News Feed"   },
  { id:"drilling",    label:"Drilling"    },
  { id:"financings",  label:"Financings"  },
  { id:"videos",      label:"Videos"      },
  { id:"politics",    label:"Politics"    },
];

// ─────────────────────────────────────────────
// MAP PROJECTION
// ─────────────────────────────────────────────
const LNG_MIN = -112.5, LNG_RANGE = 11.5;
const LAT_MAX = 60.5,   LAT_RANGE = 5.5;
const MAP_W = 700, MAP_H = 450, MAP_PL = 50, MAP_PT = 20;
const SVG_W = MAP_PL + MAP_W + 10;
const SVG_H = MAP_PT + MAP_H + 30;

const toSVG = (lat, lng) => [
  ((lng - LNG_MIN) / LNG_RANGE) * MAP_W + MAP_PL,
  ((LAT_MAX - lat) / LAT_RANGE) * MAP_H + MAP_PT,
];

const BASIN_BOUNDARY = [
  [-111.5,59.0],[-110.8,59.3],[-110.2,59.5],[-109.5,59.8],
  [-108.5,60.0],[-107.5,60.1],[-106.5,60.2],[-105.5,60.0],
  [-104.5,59.8],[-103.8,59.5],[-103.0,59.0],[-102.5,58.5],
  [-102.2,58.0],[-102.2,57.5],[-102.5,57.0],[-103.0,56.5],
  [-103.8,56.0],[-105.0,55.8],[-106.0,55.5],[-107.5,55.3],
  [-109.0,55.5],[-110.0,55.8],[-110.5,56.0],[-111.0,56.5],
  [-111.5,57.5],[-112.0,58.0],[-111.8,58.5],[-111.5,59.0],
];

const SMART_MONEY_EVENTS = [
  { company:"NexGen",      ticker:"NXE",    type:"Insider Buy",  amount:2.1,  amountLabel:"C$2.1M",  date:"May 2026", momentum:98, regionY:2, region:"Western Basin",  headline:"CEO & Directors add $2.1M in open market purchases post-permitting update", proximity:"Arrow Deposit"            },
  { company:"Denison",     ticker:"DML.TO", type:"Joint Venture", amount:25,  amountLabel:"C$25M",   date:"Jun 2026", momentum:90, regionY:2, region:"Western Basin",  headline:"Denison expands Russell Lake JV with Skyharbour — 3 new targets adjacent to Arrow", proximity:"4.2km from Arrow" },
  { company:"Fission",     ticker:"FCU",    type:"Bought Deal",  amount:30,   amountLabel:"C$30M",   date:"Apr 2026", momentum:70, regionY:2, region:"Western Basin",  headline:"Fission closes $30M bought deal to fund Triple R feasibility study",            proximity:"Patterson Lake South" },
  { company:"F3 Uranium",  ticker:"FUU.V",  type:"Bought Deal",  amount:12,   amountLabel:"C$12M",   date:"Mar 2026", momentum:83, regionY:2, region:"Western Basin",  headline:"$12M financing to fund 2026 summer PLN exploration program",                    proximity:"Patterson Lake North" },
  { company:"Skyharbour",  ticker:"SYH.V",  type:"Joint Venture", amount:8,   amountLabel:"C$8M",    date:"May 2026", momentum:80, regionY:2, region:"Western Basin",  headline:"Orano Canada JV expanded — $8M earn-in at Preston Project",                     proximity:"12km from McArthur"   },
  { company:"CanAlaska",   ticker:"CVV.V",  type:"Joint Venture", amount:5,   amountLabel:"C$5M",    date:"Apr 2026", momentum:72, regionY:1, region:"Eastern Basin",  headline:"Cameco JV active at West McArthur — partner-funded $5M program",               proximity:"West McArthur"        },
  { company:"Atha Energy", ticker:"SASK.V", type:"Bought Deal",  amount:15,   amountLabel:"C$15M",   date:"Mar 2026", momentum:65, regionY:1, region:"Eastern Basin",  headline:"$15M financing to fund multi-platform basin-wide geophysics",                   proximity:"CMB Land Package"     },
  { company:"IsoEnergy",   ticker:"ISO.V",  type:"Bought Deal",  amount:10,   amountLabel:"C$10M",   date:"Feb 2026", momentum:68, regionY:1, region:"Eastern Basin",  headline:"$10M raise to advance Hurricane deposit delineation program",                   proximity:"Hurricane Deposit"    },
  { company:"Std Uranium", ticker:"STND.V", type:"Bought Deal",  amount:6,    amountLabel:"C$6M",    date:"May 2026", momentum:58, regionY:0, region:"Basin Margins",  headline:"Davidson River drill program financed via $6M bought deal",                     proximity:"Davidson River"       },
  { company:"CANU",        ticker:"CANU.V", type:"Insider Buy",  amount:0.38, amountLabel:"C$380K",  date:"Jun 2026", momentum:55, regionY:0, region:"Basin Margins",  headline:"Management adds $380K ahead of summer drill program at Key Lake",              proximity:"Adjacent to Key Lake" },
  { company:"Baselode",    ticker:"FIND.V", type:"Insider Buy",  amount:0.5,  amountLabel:"C$500K",  date:"May 2026", momentum:52, regionY:0, region:"Basin Margins",  headline:"Management buying post-Forum merger on Hook project potential",                  proximity:"Hook Lake"            },
  { company:"Purepoint",   ticker:"PTU.V",  type:"Joint Venture", amount:3,   amountLabel:"C$3M",    date:"Mar 2026", momentum:60, regionY:1, region:"Eastern Basin",  headline:"Cameco & UEC JV funds $3M Hook Lake exploration",                               proximity:"Hook Lake JV"         },
];

const SUPPLY_DEFICIT_DATA = [
  { year:"2018", supply:162, demand:178, price:21 },
  { year:"2019", supply:155, demand:185, price:25 },
  { year:"2020", supply:122, demand:163, price:30 },
  { year:"2021", supply:130, demand:177, price:33 },
  { year:"2022", supply:140, demand:190, price:51 },
  { year:"2023", supply:148, demand:198, price:59 },
  { year:"2024", supply:150, demand:210, price:87 },
  { year:"2025", supply:147, demand:220, price:73 },
  { year:"2026", supply:143, demand:230, price:82 },
  { year:"2027", supply:140, demand:244, price:null },
  { year:"2028", supply:137, demand:257, price:null },
  { year:"2029", supply:133, demand:268, price:null },
  { year:"2030", supply:130, demand:280, price:null },
  { year:"2032", supply:126, demand:300, price:null },
  { year:"2034", supply:122, demand:318, price:null },
];

const EXPLORATION_RUNWAY = [
  { company:"NexGen",      ticker:"NXE",   stage:"Resource",   runway:36, budget:8.0, mktCap:5000 },
  { company:"Denison",     ticker:"DML",   stage:"Resource",   runway:24, budget:6.5, mktCap:1800 },
  { company:"Fission",     ticker:"FCU",   stage:"Resource",   runway:18, budget:6.0, mktCap:600  },
  { company:"IsoEnergy",   ticker:"ISO",   stage:"Resource",   runway:14, budget:7.5, mktCap:350  },
  { company:"Cameco",      ticker:"CCO",   stage:"Resource",   runway:24, budget:8.5, mktCap:28000},
  { company:"UEC",         ticker:"UEC",   stage:"Resource",   runway:14, budget:5.0, mktCap:2500 },
  { company:"U Royalty",   ticker:"URC",   stage:"Resource",   runway:20, budget:1.5, mktCap:200  },
  { company:"Skyharbour",  ticker:"SYH",   stage:"Advanced",   runway:8,  budget:4.5, mktCap:120  },
  { company:"F3 Uranium",  ticker:"FUU",   stage:"Advanced",   runway:10, budget:6.2, mktCap:140  },
  { company:"Atha Energy", ticker:"SASK",  stage:"Advanced",   runway:12, budget:4.0, mktCap:200  },
  { company:"CanAlaska",   ticker:"CVV",   stage:"Advanced",   runway:14, budget:3.5, mktCap:90   },
  { company:"Appia",       ticker:"API",   stage:"Advanced",   runway:7,  budget:2.5, mktCap:45   },
  { company:"Purepoint",   ticker:"PTU",   stage:"Advanced",   runway:9,  budget:2.0, mktCap:25   },
  { company:"Baselode",    ticker:"FIND",  stage:"Grassroots", runway:10, budget:2.5, mktCap:40   },
  { company:"CANU",        ticker:"CANU",  stage:"Grassroots", runway:8,  budget:2.0, mktCap:30   },
  { company:"Std Uranium", ticker:"STND",  stage:"Grassroots", runway:7,  budget:2.5, mktCap:20   },
  { company:"Forum",       ticker:"FMC",   stage:"Grassroots", runway:5,  budget:1.5, mktCap:15   },
  { company:"Azincourt",   ticker:"AAZ",   stage:"Grassroots", runway:6,  budget:1.0, mktCap:8    },
  { company:"Fortune Bay", ticker:"FOR",   stage:"Grassroots", runway:9,  budget:2.0, mktCap:22   },
  { company:"ALX",         ticker:"AL",    stage:"Grassroots", runway:5,  budget:1.0, mktCap:12   },
  { company:"Fission 3.0", ticker:"FIS",   stage:"Grassroots", runway:6,  budget:1.5, mktCap:18   },
];

const INSIDER_BUYS_UPDATED = "Jun 16, 2026";
const INSIDER_BUYS = [
  { company:"NexGen Energy",    ticker:"NXE",   buyer:"Leigh Curyer (CEO)",        amount:"C$2,100,000", date:"May 2026", shares:"248,520" },
  { company:"Cameco",           ticker:"CCO",   buyer:"Timothy Gitzel (CEO)",      amount:"C$1,240,000", date:"Apr 2026", shares:"21,380"  },
  { company:"Denison Mines",    ticker:"DML",   buyer:"David Cates (CEO)",         amount:"C$852,000",   date:"May 2026", shares:"480,000" },
  { company:"Fission Uranium",  ticker:"FCU",   buyer:"Ross McElroy (CEO)",        amount:"C$540,000",   date:"Apr 2026", shares:"540,000" },
  { company:"Canadian Uranium", ticker:"CANU",  buyer:"Multiple Directors",        amount:"C$380,000",   date:"Jun 2026", shares:"320,000" },
  { company:"IsoEnergy",        ticker:"ISO",   buyer:"Tim Gauthier (CEO)",        amount:"C$320,000",   date:"Apr 2026", shares:"145,000" },
  { company:"Skyharbour",       ticker:"SYH",   buyer:"Jordan Trimble (CEO)",      amount:"C$285,000",   date:"May 2026", shares:"475,000" },
  { company:"Baselode Energy",  ticker:"FIND",  buyer:"Rebecca Hunter (CEO)",      amount:"C$200,000",   date:"May 2026", shares:"1,666,000"},
  { company:"Atha Energy",      ticker:"SASK",  buyer:"Board of Directors",        amount:"C$180,000",   date:"Mar 2026", shares:"225,000" },
  { company:"F3 Uranium",       ticker:"FUU",   buyer:"Dev Randhawa (Chair)",      amount:"C$165,000",   date:"Mar 2026", shares:"550,000" },
];

const INSIDER_SELLS = [
  { company:"Cameco",           ticker:"CCO",   seller:"James Sykes (EVP)",        amount:"C$3,200,000", date:"May 2026", shares:"55,000"  },
  { company:"NexGen Energy",    ticker:"NXE",   seller:"Christopher McFadden",     amount:"C$1,800,000", date:"Apr 2026", shares:"210,000" },
  { company:"Denison Mines",    ticker:"DML",   seller:"W. Robert Dengler (Dir.)", amount:"C$1,100,000", date:"Apr 2026", shares:"620,000" },
  { company:"UEC",              ticker:"UEC",   seller:"Amir Adnani (CEO)",        amount:"C$980,000",   date:"Mar 2026", shares:"120,000" },
  { company:"Fission Uranium",  ticker:"FCU",   seller:"Dev Randhawa (Dir.)",      amount:"C$720,000",   date:"Mar 2026", shares:"720,000" },
  { company:"IsoEnergy",        ticker:"ISO",   seller:"Craig Parry (Dir.)",       amount:"C$540,000",   date:"May 2026", shares:"245,000" },
  { company:"Skyharbour",       ticker:"SYH",   seller:"Riley Trimble (Dir.)",     amount:"C$320,000",   date:"Apr 2026", shares:"535,000" },
  { company:"Atha Energy",      ticker:"SASK",  seller:"Nick Tintor (CEO)",        amount:"C$285,000",   date:"Mar 2026", shares:"355,000" },
  { company:"Baselode Energy",  ticker:"FIND",  seller:"James Sykes (Dir.)",       amount:"C$180,000",   date:"Apr 2026", shares:"2,000,000"},
  { company:"Purepoint Uranium",ticker:"PTU",   seller:"Scott Frostad (Dir.)",     amount:"C$95,000",    date:"May 2026", shares:"630,000" },
];

const STAGE_GROUPS = [
  { key:"Producer",  label:"Producers",  color:"#B07A08", test:(s)=>s==="Producer" },
  { key:"Developer", label:"Developers", color:"#1A5AA8", test:(s)=>s.includes("Developer")||s==="Producer / Developer" },
  { key:"Explorer",  label:"Explorers",  color:"#6366F1", test:(s)=>s.includes("Explorer")||s.includes("Delineation") },
  { key:"Royalty",   label:"Royalty",    color:"#C8A020", test:(s)=>s.includes("Royalty") },
];

const SOCIAL = {
  cameco:     { x:"https://x.com/Cameco",           li:"https://linkedin.com/company/cameco" },
  nexgen:     { x:"https://x.com/NexGenEnergy_",    li:"https://linkedin.com/company/nexgen-energy" },
  denison:    { x:"https://x.com/DenisonMines",     li:"https://linkedin.com/company/denison-mines-corp" },
  fission:    { x:"https://x.com/FissionUranium",   li:"https://linkedin.com/company/fission-uranium" },
  iso:        { x:"https://x.com/IsoEnergyLtd",     li:"https://linkedin.com/company/isoenergy-ltd" },
  skyharbour: { x:"https://x.com/skyharbourltd",    li:"https://linkedin.com/company/skyharbour-resources-ltd" },
  f3:         { x:"https://x.com/F3Uranium",         li:"https://linkedin.com/company/f3-uranium-corp" },
  uec:        { x:"https://x.com/UraniumEnergy",    li:"https://linkedin.com/company/uranium-energy" },
  baselode:   { x:"https://x.com/BaselodeEnergy",   li:"https://linkedin.com/company/baselode-energy-corp" },
  fission3:   { x:"https://x.com/Fission30Corp",    li:"https://linkedin.com/company/fission-3" },
  canalaska:  { x:"https://x.com/CanAlaska",        li:"https://linkedin.com/company/canalaska-uranium" },
  purepoint:  { x:"https://x.com/PurepointU",       li:"https://linkedin.com/company/purepoint-uranium-group" },
  forum:      { x:"https://x.com/ForumEnergyMet",   li:"https://linkedin.com/company/forum-energy-metals" },
  standard:   { x:"https://x.com/StandardUranium",  li:"https://linkedin.com/company/standard-uranium" },
  atha:       { x:"https://x.com/AthaEnergyCorp",   li:"https://linkedin.com/company/atha-energy-corp" },
  azincourt:  { x:"https://x.com/AzincourtEnergy",  li:"https://linkedin.com/company/azincourt-energy" },
  fortunebay: { x:"https://x.com/FortuneBayCorp",   li:"https://linkedin.com/company/fortune-bay-corp" },
  alx:        { x:"https://x.com/ALXResources",     li:"https://linkedin.com/company/alx-resources-corp" },
  appia:      { x:"https://x.com/AppiaEnergy",      li:"https://linkedin.com/company/appia-rare-earths-uranium" },
  urc:        { x:"https://x.com/UraniumRoyalty",   li:"https://linkedin.com/company/uranium-royalty-corp" },
  canu:       { x:"https://x.com/CanadianUranium",   li:"https://linkedin.com/company/canadian-uranium-inc" },
};
const BASIN_PTS = BASIN_BOUNDARY.map(([lng,lat]) => toSVG(lat,lng));
const BASIN_PATH = BASIN_PTS.map(([x,y],i) => `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z";

// ─────────────────────────────────────────────
// TABLE HELPERS
// ─────────────────────────────────────────────
const XLogo = ({ size=13, style={} }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const parseCap = (s) => {
  const n = parseFloat(s);
  return s.includes("B") ? n * 1e6 : n;
};

const parseVol = (s) => {
  if (!s) return 0;
  const n = parseFloat(s);
  return s.includes("M") ? n * 1e6 : s.includes("K") ? n * 1e3 : n;
};

const cadTk = (c) => {
  const hasCAD = ["TSX","TSXV","CSE"].some(ex=>c.exchange.includes(ex));
  if (!hasCAD) return "—";
  return c.ticker.includes(".")
    ? c.ticker
    : c.altTicker?.includes(".")
      ? c.altTicker
      : c.ticker;
};

const usTk = (c) => {
  if (!c.ticker.includes(".")) return c.ticker;
  if (c.altTicker && !c.altTicker.includes(".")) return c.altTicker;
  return "—";
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function aiSearch(userPrompt, system = "") {
  const res = await fetch("/.netlify/functions/claude", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      ...(system ? { system } : {}),
      messages:[{ role:"user", content:userPrompt }],
      tools:[{ type:"web_search_20250305", name:"web_search" }],
    }),
  });
  const d = await res.json();
  return d.content.filter(b=>b.type==="text").map(b=>b.text).join("\n");
}

const fmtP  = (n) => `$${Number(n).toFixed(2)}`;
const fmtPct = (n) => `${n>=0?"+":""}${Number(n).toFixed(2)}%`;

const MONO  = { letterSpacing:"-0.02em" };
const SERIF = { fontFamily:"Helvetica, 'Helvetica Neue', Arial, sans-serif" };

// ─────────────────────────────────────────────
// STYLE HELPERS
// ─────────────────────────────────────────────
const SHARE_UPDATES = {
  cameco:"Mar 31, 2026",  nexgen:"Mar 31, 2026",  denison:"Mar 31, 2026",
  fission:"Mar 31, 2026", iso:"Mar 31, 2026",       skyharbour:"Mar 31, 2026",
  f3:"Mar 31, 2026",      uec:"Jan 31, 2026",        baselode:"Mar 31, 2026",
  fission3:"Mar 31, 2026",canalaska:"Mar 31, 2026",  purepoint:"Mar 31, 2026",
  forum:"Mar 31, 2026",   standard:"Mar 31, 2026",   atha:"Mar 31, 2026",
  azincourt:"Mar 31, 2026",fortunebay:"Mar 31, 2026",alx:"Mar 31, 2026",
  appia:"Mar 31, 2026",   urc:"Jan 31, 2026",        canu:"Jun 10, 2026",
};

const MARKETING = {
  canu:       { firm:"Hybrid Financial Ltd.",         amount:"$15,000 CAD / month", period:"Apr 2026 – Oct 2026" },
  skyharbour: { firm:"Fundamental Research Corp.",    amount:"$8,000 CAD / month",  period:"Jan 2026 – Dec 2026" },
  standard:   { firm:"Haywood Securities Inc.",       amount:"$10,000 CAD / month", period:"Mar 2026 – Sep 2026" },
  purepoint:  { firm:"RedChip Companies Inc.",        amount:"$6,500 USD / month",  period:"Feb 2026 – Aug 2026" },
};

const S = {
  root:{ background:"#FAFAF7", minHeight:"100vh", color:"#1A1A14", fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" },
  tape:{ background:"#FFFFFF", borderBottom:"2px solid #1A1A14", padding:"5px 20px", overflowX:"auto", whiteSpace:"nowrap", display:"flex", gap:24, alignItems:"center" },
  header:{ background:"#FFFFFF", borderBottom:"2px solid #1A1A14", padding:"10px 20px", display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" },
  nav:{ background:"#FFFFFF", borderBottom:"2px solid #1A1A14", padding:"0 20px", display:"flex", overflowX:"auto" },
  tab:(a)=>({ padding:"11px 16px", fontSize:11, fontWeight:600, cursor:"pointer",
    color:a?"#B07A08":"#5A5A4A", background:"none", border:"none",
    borderBottom:a?"2px solid #B07A08":"2px solid transparent",
    letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap" }),
  main:{ padding:"16px 20px", maxWidth:1380, margin:"0 auto" },
  card:{ background:"#FFFFFF", border:"1px solid #D8D0C4", borderRadius:8, padding:16, marginBottom:12 },
  lbl:{ fontSize:10, color:"#9A9A8A", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 },
  badge:(t)=>{
    const M={
      green:  { background:"#D4EDDA", color:"#1A7A44", border:"1px solid #A8D8B8" },
      red:    { background:"#F8E0E0", color:"#C01818", border:"1px solid #F0B8B8" },
      amber:  { background:"#FFF2CC", color:"#B07A08", border:"1px solid #E8D890" },
      blue:   { background:"#E0EDFC", color:"#1A5AA8", border:"1px solid #A8CCF0" },
      purple: { background:"#EEE4FC", color:"#6B48A8", border:"1px solid #CDB8F0" },
      gray:   { background:"#F0EDE8", color:"#5A5A4A", border:"1px solid #D8D0C4" },
    };
    return { ...(M[t]||M.gray), padding:"2px 7px", borderRadius:4, fontSize:11, fontWeight:600, display:"inline-block" };
  },
  tbl:{ width:"100%", borderCollapse:"collapse", fontSize:13 },
  th:{ padding:"8px 10px", textAlign:"left", color:"#9A9A8A", borderBottom:"1px solid #D8D0C4", fontWeight:600, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" },
  td:{ padding:"9px 10px", borderBottom:"1px solid #F0EDE8", verticalAlign:"middle" },
  btn:(v="p")=> v==="p"
    ? { padding:"6px 14px", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", background:"#B07A08", color:"#FFFFFF", border:"none" }
    : { padding:"6px 12px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background:"transparent", color:"#5A5A4A", border:"1px solid #D8D0C4" },
  sectionTitle:{ fontSize:13, fontWeight:700, color:"#1A1A14", marginBottom:14, display:"flex", alignItems:"center", gap:8, letterSpacing:"-0.01em" },
};

// ─────────────────────────────────────────────
// SPINNING REACTOR GLOBE (decorative, auto-spin)
// ─────────────────────────────────────────────
const REACTOR_NATIONS = [
  { name:"China",   lat:35.0,  lng:103.0, reactors:28 },
  { name:"India",   lat:21.0,  lng:78.0,  reactors:7  },
  { name:"Russia",  lat:60.0,  lng:90.0,  reactors:6  },
  { name:"Turkey",  lat:39.0,  lng:35.0,  reactors:4  },
  { name:"Egypt",   lat:27.0,  lng:30.0,  reactors:4  },
  { name:"S. Korea",lat:36.0,  lng:128.0, reactors:3  },
  { name:"USA",     lat:39.0,  lng:-98.0, reactors:2  },
  { name:"UK",      lat:54.0,  lng:-2.0,  reactors:2  },
  { name:"France",  lat:47.0,  lng:2.0,   reactors:1  },
  { name:"UAE",     lat:24.0,  lng:54.0,  reactors:1  },
  { name:"Japan",   lat:36.0,  lng:138.0, reactors:2  },
  { name:"Bangladesh",lat:24.0,lng:90.0,  reactors:2  },
];

const CONTINENTS = [
  [[60,-130],[55,-130],[48,-124],[33,-117],[23,-106],[18,-95],[28,-82],[45,-67],[60,-64],[70,-80],[68,-110],[60,-130]],
  [[10,-75],[0,-80],[-18,-70],[-40,-73],[-52,-69],[-38,-58],[-23,-43],[-5,-35],[5,-52],[10,-62],[10,-75]],
  [[60,-5],[55,-8],[44,-9],[37,-9],[37,15],[40,18],[45,15],[55,12],[60,25],[68,28],[68,12],[60,-5]],
  [[35,-5],[30,-10],[15,-17],[5,-5],[-5,10],[-22,15],[-34,18],[-30,30],[-12,40],[5,48],[12,43],[30,33],[33,10],[35,-5]],
  [[68,30],[55,30],[45,50],[35,55],[25,60],[20,75],[8,78],[20,90],[10,105],[22,118],[35,122],[50,135],[68,140],[72,100],[70,60],[68,30]],
  [[-12,132],[-20,115],[-35,117],[-38,145],[-25,153],[-15,142],[-12,132]],
];

function ReactorGlobe() {
  const [rot, setRot] = useState(0);
  useEffect(()=>{
    let raf, last=performance.now();
    const tick=(now)=>{ const dt=now-last; last=now; setRot(r=>(r+dt*0.012)%360); raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const R = 70, CX = 90, CY = 90;
  const project = (lat, lng) => {
    const λ = (lng + rot) * Math.PI/180;
    const φ = lat * Math.PI/180;
    const x = Math.cos(φ) * Math.sin(λ);
    const y = Math.sin(φ);
    const z = Math.cos(φ) * Math.cos(λ);
    return [CX + x*R, CY - y*R, z];
  };
  const projectPath = (pts) => {
    let d="", started=false;
    pts.forEach(([lat,lng])=>{
      const [x,y,z]=project(lat,lng);
      if(z>=-0.05){ d+=`${started?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`; started=true; }
      else { started=false; }
    });
    return d;
  };
  const graticule = [];
  for(let lat=-60;lat<=60;lat+=30){ const pts=[]; for(let lng=-180;lng<=180;lng+=10)pts.push([lat,lng]); graticule.push(pts); }
  for(let lng=-180;lng<180;lng+=30){ const pts=[]; for(let lat=-90;lat<=90;lat+=10)pts.push([lat,lng]); graticule.push(pts); }

  const dotColor = (r) => r>=10?"#1A7A44" : r>=4?"#1A5AA8" : "#B07A08";

  return (
    <svg viewBox="0 0 180 180" width="100%" height="100%" style={{ display:"block", maxHeight:210 }}>
      <defs>
        <radialGradient id="globeOceanLt" cx="40%" cy="35%" r="75%">
          <stop offset="0%"  stopColor="#EAF1F6"/>
          <stop offset="65%" stopColor="#DCE6EE"/>
          <stop offset="100%" stopColor="#C8D6E2"/>
        </radialGradient>
        <radialGradient id="globeRimLt" cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor="#B07A08" stopOpacity={0}/>
          <stop offset="97%" stopColor="#B07A08" stopOpacity={0.22}/>
          <stop offset="100%" stopColor="#B07A08" stopOpacity={0}/>
        </radialGradient>
        <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Atmosphere glow */}
      <circle cx={CX} cy={CY} r={R+10} fill="url(#globeRimLt)"/>
      {/* Ocean sphere */}
      <circle cx={CX} cy={CY} r={R} fill="url(#globeOceanLt)" stroke="#B8C8D6" strokeWidth={0.8}/>

      {/* Graticule */}
      {graticule.map((pts,i)=>(
        <path key={i} d={projectPath(pts)} fill="none" stroke="#8AA4BC" strokeWidth={0.3} strokeOpacity={0.3}/>
      ))}

      {/* Continents */}
      {CONTINENTS.map((pts,i)=>(
        <path key={i} d={projectPath([...pts])} fill="none" stroke="#6E9A78" strokeWidth={1.2} strokeOpacity={0.85} strokeLinejoin="round"/>
      ))}

      {/* Reactor dots */}
      {REACTOR_NATIONS.map(n=>{
        const [x,y,z]=project(n.lat,n.lng);
        if(z<0) return null;
        const sz = 1.6 + Math.sqrt(n.reactors)*0.7;
        const op = 0.5 + z*0.5;
        const col = dotColor(n.reactors);
        return (
          <g key={n.name} opacity={op}>
            <circle cx={x} cy={y} r={sz+2.5} fill={col} fillOpacity={0.22} filter="url(#dotGlow)"/>
            <circle cx={x} cy={y} r={sz} fill={col} stroke="#FFFFFF" strokeWidth={0.4}/>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// SUPPLY CHAIN FLOW DIAGRAM (light, animated arrows)
// ─────────────────────────────────────────────
function SupplyChainFlow() {
  const [pulse, setPulse] = useState(0);
  useEffect(()=>{
    let raf, last=performance.now();
    const tick=(now)=>{ const dt=now-last; last=now; setPulse(p=>(p+dt*0.0006)%1); raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  // Node positions on a 460 x 150 canvas
  const nodes = [
    { id:"uranium", x:34,  y:92, label:"Uranium",      color:"#6A6A5A", icon:"flask",  sub:"" },
    { id:"kaz",     x:140, y:92, label:"Kazatomprom",  color:"#C01818", icon:"alert",  sub:"Acid shortage" },
    { id:"cigar",   x:248, y:92, label:"Cigar Lake",   color:"#C01818", icon:"alert",  sub:"Production fatigue" },
    { id:"under",   x:356, y:92, label:"Underinvest.", color:"#C01818", icon:"alert",  sub:"10yr lead times" },
    { id:"other",   x:440, y:92, label:"Supply",       color:"#1A7A44", icon:"stack",  sub:"" },
  ];

  const Icon = ({ type, x, y, color }) => {
    if(type==="flask") return (
      <g stroke={color} strokeWidth={1.4} fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={`M${x-4},${y-7} L${x-4},${y-1} L${x-8},${y+7} L${x+8},${y+7} L${x+4},${y-1} L${x+4},${y-7}`}/>
        <line x1={x-5} y1={y-7} x2={x+5} y2={y-7}/>
      </g>
    );
    if(type==="stack") return (
      <g stroke={color} strokeWidth={1.3} fill="none">
        <ellipse cx={x} cy={y-5} rx={8} ry={2.6}/>
        <ellipse cx={x} cy={y} rx={8} ry={2.6}/>
        <ellipse cx={x} cy={y+5} rx={8} ry={2.6}/>
        <line x1={x-8} y1={y-5} x2={x-8} y2={y+5}/>
        <line x1={x+8} y1={y-5} x2={x+8} y2={y+5}/>
      </g>
    );
    // alert triangle
    return (
      <g stroke={color} strokeWidth={1.4} fill="none" strokeLinejoin="round">
        <path d={`M${x},${y-8} L${x+8},${y+6} L${x-8},${y+6} Z`}/>
        <line x1={x} y1={y-2} x2={x} y2={y+2} strokeWidth={1.6}/>
        <circle cx={x} cy={y+4.4} r={0.5} fill={color}/>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 460 156" width="100%" height="100%" style={{ display:"block", maxHeight:210 }}>
      {/* Bottleneck callout */}
      {(()=>{
        const bx=248, by=34;
        return (
          <g>
            {/* curved feeders from kaz and under up to bottleneck */}
            <path d={`M140,76 C140,50 ${bx-40},${by} ${bx-12},${by}`} fill="none" stroke="#B07A08" strokeWidth={1.4} strokeOpacity={0.6} strokeDasharray="3,3"/>
            <path d={`M356,76 C356,50 ${bx+40},${by} ${bx+12},${by}`} fill="none" stroke="#B07A08" strokeWidth={1.4} strokeOpacity={0.6} strokeDasharray="3,3"/>
            <circle cx={bx} cy={by} r={13} fill="#1A7A44" fillOpacity={0.1} stroke="#1A7A44" strokeWidth={1.4}/>
            <g stroke="#1A7A44" strokeWidth={1.3} fill="none" strokeLinejoin="round" strokeLinecap="round">
              <path d={`M${bx-3},${by-6} L${bx-3},${by-1} L${bx-6},${by+6} L${bx+6},${by+6} L${bx+3},${by-1} L${bx+3},${by-6}`}/>
              <line x1={bx-4} y1={by-6} x2={bx+4} y2={by-6}/>
            </g>
            <text x={bx} y={by-17} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1A7A44">BOTTLENECK</text>
          </g>
        );
      })()}

      {/* Connecting arrows between main nodes */}
      {nodes.slice(0,-1).map((n,i)=>{
        const next=nodes[i+1];
        const x1=n.x+13, x2=next.x-13, y=92;
        const dashOffset = -(pulse*16);
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2-3} y2={y} stroke="#C8C0B4" strokeWidth={1.5}/>
            <line x1={x1} y1={y} x2={x2-3} y2={y} stroke="#B07A08" strokeWidth={1.5} strokeDasharray="4,12" strokeDashoffset={dashOffset} strokeOpacity={0.8}/>
            <path d={`M${x2-3},${y-3.5} L${x2+2},${y} L${x2-3},${y+3.5} Z`} fill="#8A8273"/>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(n=>(
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={13} fill={n.color} fillOpacity={0.08} stroke={n.color} strokeWidth={1.4}/>
          <Icon type={n.icon} x={n.x} y={n.y} color={n.color}/>
          <text x={n.x} y={n.y+26} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#1A1A14">{n.label}</text>
          {n.sub && <text x={n.x} y={n.y+37} textAnchor="middle" fontSize={7.5} fill="#9A8A6A" fontStyle="italic">{n.sub}</text>}
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// ATHABASCA FOCUS — stylized basin mini-map
// ─────────────────────────────────────────────
function AthabascaFocusMap({ satImage }) {
  // Deposit markers positioned as % of the frame (matches the satellite bbox)
  const deposits = [
    { left:"52%", top:"30%", label:"Highest-grade deposit", color:"#E83838", big:true },
    { left:"70%", top:"42%", label:"Eastern deposits",      color:"#E83838", big:true },
    { left:"34%", top:"54%", label:"Western corridor",      color:"#F0A030", big:false },
    { left:"56%", top:"64%", label:"Core explorers",        color:"#4BA3F0", big:false },
  ];
  return (
    <div style={{ position:"relative", width:"100%", aspectRatio:"800/440", borderRadius:8, overflow:"hidden", background:"#2E4A34" }}>
      {satImage ? (
        <img src={satImage} alt="Athabasca Basin satellite view" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
      ) : (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#9FBFA4", fontSize:11, background:"linear-gradient(135deg,#2E4A34,#22382A)" }}>
          Loading satellite imagery…
        </div>
      )}
      {/* subtle dark gradient for label legibility */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.18))", pointerEvents:"none" }}/>
      {/* Deposit markers */}
      {satImage && deposits.map((d,i)=>(
        <div key={i} style={{ position:"absolute", left:d.left, top:d.top, transform:"translate(-50%,-50%)", display:"flex", alignItems:"center", gap:5, pointerEvents:"none" }}>
          <span style={{ width:d.big?12:10, height:d.big?12:10, borderRadius:"50%", background:d.color, boxShadow:`0 0 0 4px ${d.color}33, 0 0 8px ${d.color}`, border:"1.5px solid #FFFFFF", flexShrink:0 }}/>
          <span style={{ fontSize:9, fontWeight:700, color:"#FFFFFF", whiteSpace:"nowrap", textShadow:"0 1px 3px rgba(0,0,0,0.9)" }}>{d.label}</span>
        </div>
      ))}
      {/* Attribution */}
      <div style={{ position:"absolute", bottom:3, right:6, fontSize:7, color:"rgba(255,255,255,0.6)", textShadow:"0 1px 2px rgba(0,0,0,0.8)", pointerEvents:"none" }}>Esri World Imagery</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRICE OUTLOOK — target & correlation table
// ─────────────────────────────────────────────
function PriceOutlookTable() {
  const rows = [
    { label:"2016 Low",      lt:"$18/lb",  spot:"$18/lb",  note:"cycle bottom" },
    { label:"2024 Actual",   lt:"$80/lb",  spot:"$87/lb",  note:"5× recovery" },
    { label:"2026 Current",  lt:"$79/lb",  spot:"$82/lb",  note:"holding" },
    { label:"2030 Forecast", lt:"$95/lb",  spot:"$110/lb", note:"consensus", highlight:true },
  ];
  return (
    <div style={{ border:"1px solid #D8D0C4", borderRadius:8, overflow:"hidden", fontSize:11 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr 1fr", background:"#F4F0E8", borderBottom:"1px solid #D8D0C4" }}>
        {["","Long-term","Spot price"].map((h,i)=>(
          <div key={i} style={{ padding:"7px 10px", fontSize:9.5, fontWeight:800, color:"#6A6A5A", textTransform:"uppercase", letterSpacing:"0.06em", borderRight:i<2?"1px solid #E8E0D4":"none", textAlign:i===0?"left":"center" }}>{h}</div>
        ))}
      </div>
      {rows.map((r,i)=>(
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr 1fr", borderBottom:i<rows.length-1?"1px solid #EDE8E0":"none", background:r.highlight?"#FFF8E8":"transparent" }}>
          <div style={{ padding:"7px 10px", borderRight:"1px solid #EDE8E0" }}>
            <div style={{ fontWeight:700, color:"#1A1A14" }}>{r.label}</div>
            <div style={{ fontSize:8.5, color:"#9A9A8A", fontStyle:"italic" }}>{r.note}</div>
          </div>
          <div style={{ padding:"7px 10px", textAlign:"center", borderRight:"1px solid #EDE8E0", ...MONO, fontWeight:700, color:r.highlight?"#1A7A44":"#1A1A14" }}>{r.lt}</div>
          <div style={{ padding:"7px 10px", textAlign:"center", ...MONO, fontWeight:700, color:r.highlight?"#1A7A44":"#B07A08" }}>{r.spot}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("overview");
  const [expanded, setExpanded]   = useState(null);
  const [mapSel, setMapSel]       = useState(null);
  const [companyModal, setCompanyModal] = useState(null);
  const [spot, setSpot]           = useState({ price:79.50, high52:106, low52:73, source:"Trading Economics", date:"Jun 2026" });
  const [spotLoading, setSL]      = useState(false);
  const [news, setNews]           = useState([]);
  const [newsLoading, setNL]      = useState(false);
  const [pol, setPol]             = useState([]);
  const [polLoading, setPL]       = useState(false);
  const [prices, setPrices]       = useState({});
  const [refreshing, setRefresh]  = useState(false);
  const [showAllCos, setShowAllCos]   = useState(false);
  const [showAllYTD, setShowAllYTD]   = useState(false);
  const [stageFilter, setStageFilter] = useState({ Producer:true, Developer:true, Explorer:true, Royalty:true });
  const [sortCol, setSortCol]         = useState("chg");
  const [sortDir, setSortDir]         = useState("desc");
  const [coSort,  setCoSort]          = useState("today");
  const [coStageFilter, setCoStageFilter] = useState("All");
  const [sdEndYear,     setSdEndYear]     = useState(2030);
  const [sdHighlight,   setSdHighlight]   = useState("Global Reactor Buildout");
  const [bcmType,       setBcmType]       = useState("All");
  const [bcmRegion,     setBcmRegion]     = useState("All");
  const [insiderView,   setInsiderView]   = useState("buys");
  const [erMinMktCap,   setErMinMktCap]   = useState(0);
  const [erStage,       setErStage]       = useState("All");
  const [globalNews, setGlobalNews]   = useState([]);
  const [globalNewsLoading, setGNL]   = useState(false);
  const [basinTopStory, setBasinTopStory] = useState(null);
  const [basinSat, setBasinSat] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subscribed, setSubscribed]     = useState(false);
  const [subEmail, setSubEmail]         = useState("");
  const [videoData, setVideoData]       = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [ytdLive, setYtdLive]           = useState({});

  const fetchSpot = useCallback(async () => {
    setSL(true);
    try {
      const res = await fetch("/.netlify/functions/uranium-price");
      const data = await res.json();
      if (data?.price && data.price > 20) setSpot(data);
    } catch {}
    setSL(false);
  }, []);

  const fetchNews = useCallback(async () => {
    setNL(true);
    try {
      const res = await fetch("/.netlify/functions/basin-news");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setNews(data);
    } catch(e) { console.error("News fetch failed", e); }
    setNL(false);
  }, []);

  const fetchPol = useCallback(async () => {
    setPL(true);
    try {
      const raw = await aiSearch(
        `Search for the latest political, regulatory, and policy news affecting uranium mining in the Athabasca Basin from the past 60 days. Cover: Canadian federal nuclear/energy policy; Saskatchewan provincial mining/royalty regulations; US nuclear legislation (HALEU, DOE offtake, Russian ban); CNSC regulatory decisions (Arrow EA, ISR approvals); global nuclear expansion (COP28, EU taxonomy, China/India builds); indigenous consultation developments in Saskatchewan. Return ONLY a JSON array (6-10 items, no markdown): [{"category":"Federal Canada","date":"2025-06-01","headline":"...","summary":"...","impact":"Positive","source":"..."}]`,
        "Return ONLY a valid JSON array with no markdown."
      );
      try { const a=JSON.parse(raw.replace(/```json|```/g,"").trim()); if(Array.isArray(a)) setPol(a); } catch {}
    } catch {}
    setPL(false);
  }, []);

  const fetchGlobalNews = useCallback(async () => {
    setGNL(true);
    try {
      const res = await fetch("/.netlify/functions/nuclear-news");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setGlobalNews(data);
    } catch(e) { console.error("Global news fetch failed", e); }
    setGNL(false);
  }, []);

  const fetchBasinTopStory = useCallback(async () => {
    try {
      const res = await fetch("/.netlify/functions/basin-editorial");
      const data = await res.json();
      if (data?.headline) setBasinTopStory(data);
    } catch(e) { console.error("Basin top story fetch failed", e); }
  }, []);

  const fetchBasinSat = useCallback(async () => {
    try {
      const res = await fetch("/.netlify/functions/basin-satellite");
      const data = await res.json();
      if (data?.image) setBasinSat(data.image);
    } catch(e) { console.error("Basin satellite fetch failed", e); }
  }, []);

  const fetchVideoData = useCallback(async () => {
    setVideosLoading(true);
    try {
      const response = await fetch("/.netlify/functions/videos");
      const data = await response.json();
      if (Array.isArray(data)) setVideoData(data);
    } catch(e) { console.error("Video fetch failed", e); }
    setVideosLoading(false);
  }, []);

  const fetchYTD = useCallback(async () => {
    try {
      const symbols = COMPANIES.map(c => ({ id:c.id, ticker:cadTk(c) }));
      const res = await fetch("/.netlify/functions/ytd", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ symbols }),
      });
      const data = await res.json();
      if (data && typeof data === "object") setYtdLive(data);
    } catch(e) { console.error("YTD fetch failed", e); }
  }, []);

  const fetchPrices = useCallback(async () => {
    setRefresh(true);
    try {
      const symbols = [...new Set(COMPANIES.flatMap(c => c.altTicker && c.altTicker !== c.ticker ? [c.ticker, c.altTicker] : [c.ticker]))];
      const response = await fetch("/.netlify/functions/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols })
      });
      const data = await response.json();
      const upd = {};
      COMPANIES.forEach(c => {
        const hit = data[c.ticker] || data[c.altTicker];
        if (hit?.price) upd[c.id] = { price: hit.price, changePct: hit.changePct, volume: hit.volume || 0 };
      });
      if (Object.keys(upd).length > 0) setPrices(upd);
    } catch(e) { console.error("Price fetch failed", e); }
    setRefresh(false);
  }, []);

  useEffect(()=>{ fetchSpot(); fetchNews(); fetchPrices(); fetchVideoData(); fetchYTD(); fetchGlobalNews(); fetchBasinTopStory(); fetchBasinSat(); },[]);

  const gP   = (c) => prices[c.id]?.price ?? c.price;
  const gCh  = (c) => prices[c.id]?.changePct ?? c.changePct;
  const gVol = (c) => prices[c.id]?.volume || 0;
  const getYTD = (c) => { const cad=cadTk(c); return ytdLive[c.id]?.ytd ?? (YTD_PERF.find(y=>y.ticker===cad||y.ticker===c.ticker||y.ticker===c.altTicker)?.ytd||0); };
  // WoW derived from current spot vs the prior weekly reference point ($79.25), kept consistent everywhere
  const SPOT_PRIOR_WEEK = 79.25;
  const spotNow   = spot.price || 79.50;
  const spotWoW   = spotNow - SPOT_PRIOR_WEEK;
  const spotWoWPct = SPOT_PRIOR_WEEK ? (spotWoW / SPOT_PRIOR_WEEK) * 100 : 0;
  const calcMktCap = (c) => {
    const p = gP(c);
    if (!p || !c.sharesBasic) return c.marketCap;
    const parseShares = (s) => {
      const n = parseFloat(s);
      if (!n) return null;
      if (s.includes('B')) return n * 1e9;
      if (s.includes('M')) return n * 1e6;
      if (s.includes('K')) return n * 1e3;
      return n;
    };
    const shares = parseShares(c.sharesBasic);
    if (!shares) return c.marketCap;
    const cap = p * shares;
    if (cap >= 1e9) return `$${(cap/1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap/1e6).toFixed(1)}M`;
    return `$${(cap/1e3).toFixed(0)}K`;
  };

  // ── OVERVIEW ──
  const renderOverview = () => {
    const sparkData = [
      { m:"Dec", price:73.25 },{ m:"",    price:73.50 },{ m:"",    price:73.75 },{ m:"",    price:74.00 },
      { m:"Jan", price:74.50 },{ m:"",    price:75.25 },{ m:"",    price:75.75 },{ m:"",    price:76.00 },
      { m:"Feb", price:76.50 },{ m:"",    price:77.00 },{ m:"",    price:77.50 },{ m:"",    price:78.00 },
      { m:"Mar", price:79.00 },{ m:"",    price:80.50 },{ m:"",    price:82.00 },{ m:"",    price:83.50 },
      { m:"Apr", price:84.00 },{ m:"",    price:84.50 },{ m:"",    price:83.00 },{ m:"",    price:82.00 },
      { m:"May", price:81.00 },{ m:"",    price:80.50 },{ m:"",    price:80.00 },{ m:"",    price:79.50 },
      { m:"Jun", price:79.00 },{ m:"",    price:SPOT_PRIOR_WEEK },{ m:"Live", price:spot.price||79.50 },
    ];

    const featuredStory = basinTopStory || {
      source:"Mining.com", category:"Market", date:"Jun 16, 2026",
      headline:"Athabasca Basin Uranium Explorers Advance Summer Drill Programs as Spot Price Holds Above $80/lb",
      summary:"Junior uranium explorers across Saskatchewan's Athabasca Basin are mobilising for summer drill campaigns with renewed confidence as uranium spot prices hold above $80/lb and utility contracting accelerates. The basin remains home to the world's highest-grade uranium deposits and accounts for an estimated 10% of global uranium resources.",
      url:"https://www.mining.com/category/uranium/",
    };

    const topCos = [...COMPANIES].filter(c=>c.id!=="canu").sort((a,b)=>coSort==="ytd"?getYTD(b)-getYTD(a):gCh(b)-gCh(a)).slice(0,5);
    const canu   = COMPANIES.find(c=>c.id==="canu");
    const RuleH  = { borderBottom:"2px solid #D8D0C4", paddingBottom:8, marginBottom:14 };
    const RuleHG = { borderBottom:"2px solid #E8A020", paddingBottom:8, marginBottom:14 };

    return (
      <div>
        {/* Date masthead strip */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, paddingBottom:10, borderBottom:"1px solid #D8D0C4" }}>
          <div style={{ fontSize:11, color:"#6A6A5A" }}>
            {new Date().toLocaleDateString("en-CA",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </div>
          <div style={{ ...SERIF, fontSize:11, color:"#6A6A5A", fontStyle:"italic" }}>
            Uranium Intelligence: Athabasca Basin Edition
          </div>
        </div>

        {/* Spot price sparkline + 4 info pits */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 256px", gap:0, marginBottom:20, border:"1px solid #D8D0C4", borderRadius:8, overflow:"hidden" }} className="spot-glow">
          <div style={{ padding:"14px 20px", borderRight:"1px solid #D8D0C4" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:4, flexWrap:"wrap" }}>
              <div style={{ ...SERIF, fontSize:38, fontWeight:700, color:"#B07A08", lineHeight:1, letterSpacing:"-1px" }}>
                {spotLoading?"—":`$${spot.price?.toFixed(2)}`}
                <span style={{ fontSize:13, color:"#6A6A5A", fontWeight:400, marginLeft:8, fontFamily:"'Helvetica Neue',Helvetica,sans-serif" }}>USD / lb</span>
              </div>
              <span style={{ ...S.badge(spotWoW>=0?"green":"red"), fontSize:11 }}>
                {spotWoW>=0?"+":""}{spotWoW.toFixed(2)} ({spotWoW>=0?"+":""}{spotWoWPct.toFixed(1)}% WoW)
              </span>
              {!spotLoading && (
                <>
                  <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.45;transform:scale(0.85)}}`}</style>
                  <span style={{ ...S.badge("amber"), fontSize:10, display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ display:"inline-block", animation:"livePulse 1.6s ease-in-out infinite" }}>●</span> Live
                  </span>
                </>
              )}
              <button onClick={fetchSpot} style={{ ...S.btn("s"), padding:"3px 10px", fontSize:10, marginLeft:"auto" }} disabled={spotLoading}>↻</button>
            </div>
            <div style={{ ...S.lbl, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              U₃O₈ SPOT — 6-MONTH PRICE TREND
              {spot.sourceUrl && (
                <a href={spot.sourceUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:9, color:"#9A9A8A", fontWeight:500, textDecoration:"none", letterSpacing:"0.04em" }}>
                  {spot.source || "Trading Economics"} ↗
                </a>
              )}
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={sparkData} margin={{ top:2, right:4, bottom:0, left:0 }}>
                <defs>
                  <linearGradient id="spotGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#B07A08" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#B07A08" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize:9, fill:"#9A9A8A" }} interval={0} height={16}/>
                <Area type="monotone" dataKey="price" stroke="#B07A08" strokeWidth={1.5} fill="url(#spotGradient)" dot={false}/>
                <YAxis domain={["auto","auto"]} hide/>
                <Tooltip formatter={(v)=>[`$${v.toFixed(2)}`,"U₃O₈/lb"]} contentStyle={{ background:"#FFFFFF", border:"1px solid #D8D0C4", fontSize:11, borderRadius:4 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:"grid", gridTemplateRows:"1fr 1fr 1fr", gridTemplateColumns:"1fr" }}>
            {(()=>{
              const currentPrice = spot.price || sparkData[sparkData.length-1]?.price || 79.5;
              const threeMonthPrice = sparkData[Math.floor(sparkData.length/2)]?.price || currentPrice;
              const trendUp = currentPrice >= threeMonthPrice;
              const trendLabel = trendUp ? "Bullish" : "Bearish";
              return [
                ["52-Wk High", `$${spot.high52||106}`, "green"],
                ["52-Wk Low",  `$${spot.low52||73}`,   "red"  ],
                ["Trend",      trendLabel,              trendUp?"green":"red"],
              ].map(([label,val,color])=>(
                <div key={label} style={{ padding:"12px 14px", borderLeft:"1px solid #D8D0C4", borderBottom:"1px solid #D8D0C4" }}>
                  <div style={S.lbl}>{label}</div>
                  <div style={{ ...SERIF, fontSize:18, fontWeight:700, lineHeight:1.2,
                    color:color==="green"?"#1A7A44":"#C01818" }}>{val}</div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Featured Stories — two column */}
        <div style={{ marginBottom:20, paddingBottom:20, borderBottom:"2px solid #D8D0C4" }}>
          <div style={{ ...S.lbl, color:"#B07A08", marginBottom:12, letterSpacing:"0.15em" }}>FEATURED STORIES</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1px 1fr 1px 240px", gap:"0 20px" }}>

            {/* Left — top basin story */}
            <div>
              <div style={{ ...S.lbl, marginBottom:8 }}>TOP BASIN STORY</div>
              {newsLoading && news.length===0 ? (
                <div>
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
                  {[["80%","20px"],["100%","14px"],["70%","14px"]].map(([w,h],i)=>(
                    <div key={i} style={{ width:w, height:h, background:"#F0EDE8", borderRadius:4, marginBottom:10, animation:"pulse 1.4s ease-in-out infinite" }}/>
                  ))}
                </div>
              ) : (
                <a href={featuredStory.url||"#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <div>
                    {featuredStory.image && (
                      <img src={featuredStory.image} alt={featuredStory.headline}
                        style={{ width:"100%", borderRadius:8, marginBottom:10, display:"block", objectFit:"cover", maxHeight:160 }}
                        onError={e=>{ e.target.style.display="none"; }}
                      />
                    )}
                    <div style={{ display:"flex", gap:6, marginBottom:8, alignItems:"center", flexWrap:"wrap" }}>
                      {featuredStory.source && <span style={{ ...S.badge("blue"), fontSize:10 }}>{featuredStory.source}</span>}
                      {(featuredStory.category||featuredStory.type) && <span style={{ ...S.badge("gray"), fontSize:10 }}>{featuredStory.category||featuredStory.type}</span>}
                      <span style={{ fontSize:11, color:"#9A9A8A", marginLeft:"auto" }}>{featuredStory.date}</span>
                    </div>
                    <h2 style={{ ...SERIF, fontSize:22, fontWeight:700, color:"#1A1A14", lineHeight:1.35, margin:"0 0 10px", letterSpacing:"-0.01em" }}>
                      {featuredStory.headline}
                    </h2>
                    <p style={{ fontSize:13, color:"#6A6A5A", lineHeight:1.7, margin:"0 0 10px" }}>
                      {featuredStory.summary}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:11, color:"#B07A08", fontWeight:600 }}>Read full article →</span>
                    </div>
                  </div>
                </a>
              )}
            </div>

            {/* Vertical rule */}
            <div style={{ background:"#D8D0C4" }}/>

            {/* Right — Juniorstocks.com feature */}
            <div>
              <div style={{ ...S.lbl, marginBottom:8 }}>FEATURED ON JUNIORSTOCKS.COM</div>
              <a href="https://www.juniorstocks.com/saskatchewan-breaks-20-year-resource-drought-with-historic-copper-and-uranium-milestones"
                target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <div>
                  {(()=>{
                    const co = COMPANIES.find(c=>c.ticker==="DML.TO"||c.altTicker==="DNN");
                    const ch = co ? gCh(co) : null;
                    const up = ch !== null && ch >= 0;
                    return (
                      <div style={{ display:"flex", gap:6, marginBottom:8, alignItems:"center" }}>
                        <span style={{ ...S.badge(ch!==null?(up?"green":"red"):"amber"), fontSize:10 }}>
                          DML {ch!==null ? `${up?"▲":"▼"} ${Math.abs(ch).toFixed(2)}%` : ""}
                        </span>
                        <span style={{ ...S.badge("gray"), fontSize:10 }}>News</span>
                      </div>
                    );
                  })()}
                  <img
                    src="https://cdn.investor-files.net/medium_hf_20260608_184353_4b88ea9a_7f4e_4acb_b0aa_0f4993f97029_93b621ab41.png"
                    alt="Saskatchewan resource story"
                    style={{ width:"100%", borderRadius:8, marginBottom:10, display:"block", objectFit:"cover", maxHeight:160 }}
                    onError={e=>{ e.target.style.display="none"; }}
                  />
                  <h2 style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14", lineHeight:1.35, margin:"0 0 8px", letterSpacing:"-0.01em" }}>
                    Saskatchewan Breaks 20-Year Resource Drought with Historic Copper and Uranium Milestones
                  </h2>
                  <p style={{ fontSize:13, color:"#6A6A5A", lineHeight:1.7, margin:"0 0 10px" }}>
                    How Eldorado Gold and Denison Mines are shattering a two-decade resource dry spell to anchor North America's clean energy supply chain.
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:"#9A9A8A" }}>Jun 14, 2026</span>
                    <span style={{ fontSize:11, color:"#B07A08", fontWeight:600 }}>Read on Juniorstocks.com →</span>
                  </div>
                </div>
              </a>
            </div>

            {/* Vertical rule */}
            <div style={{ background:"#D8D0C4" }}/>

            {/* Basin at a Glance — vertical */}
            <div style={{ ...S.card, marginBottom:0, background:"linear-gradient(145deg, #FFFDF5 0%, #FFF5DC 100%)", border:"1px solid #E8D890" }}>
              <div style={{ ...S.lbl, marginBottom:12, fontSize:11, letterSpacing:"0.12em", color:"#1A1A14" }}>BASIN AT A GLANCE</div>
              {(()=>{
                const parseShares = s => { const n=parseFloat(s||"0"); if(!s)return 0; if(s.includes("B"))return n*1e9; if(s.includes("M"))return n*1e6; if(s.includes("K"))return n*1e3; return n; };
                const totalMktCap = COMPANIES.reduce((s,c)=>s+gP(c)*parseShares(c.sharesBasic),0);
                const mktCapStr   = totalMktCap>=1e9?`$${(totalMktCap/1e9).toFixed(1)}B`:`$${(totalMktCap/1e6).toFixed(0)}M`;
                const totalVol    = COMPANIES.reduce((s,c)=>s+gVol(c),0);
                const volStr      = totalVol>0?totalVol>=1e6?`${(totalVol/1e6).toFixed(1)}M`:`${(totalVol/1e3).toFixed(0)}K`:"—";
                return [
                  ["Active Drills",    null,                                             DRILLING.filter(d=>d.status==="Active"||d.status==="Drilling").length],
                  ["Pending Assays",   null,                                             DRILLING.reduce((s,d)=>s+(d.pending||0),0)],
                  ["Active Projects",  null,                                             COMPANIES.reduce((s,c)=>s+(c.projects?.length||0),0)],
                  ["Total Resources",  "Estimate · ~10% of global uranium resources",   "~900 Mlb"],
                  ["Total Market Cap", "Live · all 21 basin companies",                  mktCapStr],
                  ["Daily Volume",     totalVol>0?"Combined shares traded today":"Refreshes with quotes", volStr],
                  ["Open Raises",      null,                                             FINANCINGS.filter(f=>f.status==="Open").length],
                ].map(([k,note,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #EDE8E0" }}>
                    <div>
                      <span style={{ fontSize:12, color:"#1A1A14", fontWeight:500 }}>{k}</span>
                      {note && <div style={{ fontSize:9, color:"#1A1A14", fontStyle:"italic", marginTop:1 }}>{note}</div>}
                    </div>
                    <span style={{ fontWeight:800, color:"#1A1A14", fontSize:16 }}>{v}</span>
                  </div>
                ));
              })()}
            </div>

          </div>

        </div>

        {/* Companies + News 2-col */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1px 284px", gap:"0 18px", marginBottom:20 }}>
          {/* Left: Companies */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ ...S.lbl, letterSpacing:"0.15em" }}>TOP PERFORMING COMPANIES</div>
              <div style={{ display:"flex", border:"1px solid #D8D0C4", borderRadius:6, overflow:"hidden" }}>
                <button onClick={()=>setCoSort("today")} style={{ padding:"3px 10px", fontSize:10, fontWeight:600, border:"none", cursor:"pointer", background:coSort==="today"?"#1A1A14":"transparent", color:coSort==="today"?"#FFFFFF":"#6A6A5A" }}>Today</button>
                <button onClick={()=>setCoSort("ytd")}   style={{ padding:"3px 10px", fontSize:10, fontWeight:600, border:"none", cursor:"pointer", background:coSort==="ytd"  ?"#1A1A14":"transparent", color:coSort==="ytd"  ?"#FFFFFF":"#6A6A5A", borderLeft:"1px solid #D8D0C4" }}>YTD</button>
              </div>
            </div>
            {/* Featured CANU */}
            {canu && (()=>{
              const p=gP(canu), ch=gCh(canu);
              const chAmt=(p*Math.abs(ch)/100).toFixed(3);
              const up=ch>=0;
              return (
                <div onClick={()=>{setTab("companies");setExpanded(canu.id);}}
                  style={{ padding:"10px 12px", background:"rgba(176,122,8,0.06)", borderRadius:6, marginBottom:8, cursor:"pointer", border:"1px solid rgba(176,122,8,0.2)" }}>
                  {/* Main row */}
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <Star size={16} color="#B07A08" fill="#B07A08" strokeWidth={0} style={{ flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:15, fontWeight:700, color:"#1A1A14" }}>{canu.fullName}</span>
                        <span style={{ ...MONO, fontWeight:700, color:canu.color, fontSize:12 }}>{canu.ticker}</span>
                        <span style={{ ...S.badge("amber"), fontSize:9 }}>Featured</span>
                      </div>
                    </div>
                    <span style={{ ...MONO, fontWeight:700, fontSize:15, color:"#1A1A14", flexShrink:0 }}>{fmtP(p)}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <span style={{ fontSize:13, color:up?"#1A7A44":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
                      <span style={{ ...MONO, fontSize:11, fontWeight:700, color:up?"#1A7A44":"#C01818" }}>{chAmt}</span>
                      <span style={{ ...S.badge(up?"green":"red"), fontSize:10 }}>{fmtPct(ch)}</span>
                    </div>
                  </div>

                </div>
              );
            })()}
            {/* Top 5 */}
            {topCos.map((c,i)=>{
              const p=gP(c), ch=gCh(c), ytd=getYTD(c);
              const chAmt = (p * Math.abs(ch) / 100).toFixed(3);
              const up = ch >= 0;
              const ytdUp = ytd >= 0;
              const barW = Math.min(100, Math.abs(ytd) * 1.5);
              return (
                <div key={c.id} onClick={()=>setCompanyModal(c)}
                  style={{ padding:"10px 0", borderBottom:"1px solid #D8D0C4", cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:11, color:"#9A9A8A", width:16, flexShrink:0, textAlign:"center" }}>{i+1}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                        <span style={{ fontSize:15, fontWeight:700, color:"#1A1A14" }}>{c.name}</span>
                        <span style={{ ...MONO, fontWeight:700, color:c.color, fontSize:12 }}>{c.ticker}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                        <div style={{ width:60, height:4, background:"#EDE8E0", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ width:`${barW}%`, height:"100%", background:ytdUp?"#1A7A44":"#C01818", borderRadius:2 }}/>
                        </div>
                        <span style={{ ...MONO, fontSize:10, fontWeight:700, color:ytdUp?"#1A7A44":"#C01818" }}>YTD {ytdUp?"+":""}{ytd.toFixed(1)}%</span>
                      </div>
                    </div>
                    <span style={{ ...MONO, fontWeight:700, fontSize:15, color:"#1A1A14", flexShrink:0 }}>{fmtP(p)}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <span style={{ fontSize:13, color:up?"#1A7A44":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
                      <span style={{ ...MONO, fontSize:11, fontWeight:700, color:up?"#1A7A44":"#C01818" }}>{chAmt}</span>
                      <span style={{ ...S.badge(up?"green":"red"), fontSize:10 }}>{fmtPct(ch)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Subscribe CTA or unlocked companies */}
            {subscribed ? (
              [...COMPANIES].filter(c=>c.id!=="canu")
                .sort((a,b)=>coSort==="ytd"?getYTD(b)-getYTD(a):gCh(b)-gCh(a))
                .slice(5)
                .map((c,i)=>{
                  const p=gP(c), ch=gCh(c), ytd=getYTD(c);
                  const chAmt=(p*Math.abs(ch)/100).toFixed(3);
                  const up=ch>=0, ytdUp=ytd>=0;
                  const barW=Math.min(100,Math.abs(ytd)*1.5);
                  return (
                    <div key={c.id} onClick={()=>setCompanyModal(c)}
                      style={{ padding:"10px 0", borderBottom:"1px solid #D8D0C4", cursor:"pointer" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:11, color:"#9A9A8A", width:16, flexShrink:0, textAlign:"center" }}>{i+6}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                            <span style={{ fontSize:15, fontWeight:700, color:"#1A1A14" }}>{c.name}</span>
                            <span style={{ ...MONO, fontWeight:700, color:c.color, fontSize:12 }}>{c.ticker}</span>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                            <div style={{ width:60, height:4, background:"#EDE8E0", borderRadius:2, overflow:"hidden" }}>
                              <div style={{ width:`${barW}%`, height:"100%", background:ytdUp?"#1A7A44":"#C01818", borderRadius:2 }}/>
                            </div>
                            <span style={{ ...MONO, fontSize:10, fontWeight:700, color:ytdUp?"#1A7A44":"#C01818" }}>YTD {ytdUp?"+":""}{ytd.toFixed(1)}%</span>
                          </div>
                        </div>
                        <span style={{ ...MONO, fontWeight:700, fontSize:15, color:"#1A1A14", flexShrink:0 }}>{fmtP(p)}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          <span style={{ fontSize:13, color:up?"#1A7A44":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
                          <span style={{ ...MONO, fontSize:11, fontWeight:700, color:up?"#1A7A44":"#C01818" }}>{chAmt}</span>
                          <span style={{ ...S.badge(up?"green":"red"), fontSize:10 }}>{fmtPct(ch)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div style={{ position:"relative", overflow:"hidden", marginTop:2 }}>
                <div style={{ filter:"blur(3px)", opacity:0.32, pointerEvents:"none" }}>
                  {[...COMPANIES].filter(c=>c.id!=="canu")
                    .sort((a,b)=>coSort==="ytd"?getYTD(b)-getYTD(a):gCh(b)-gCh(a))
                    .slice(5,8)
                    .map((c,i)=>{
                      const p=gP(c), ch=gCh(c), ytd=getYTD(c);
                      const up=ch>=0, ytdUp=ytd>=0;
                      const barW=Math.min(100,Math.abs(ytd)*1.5);
                      return (
                        <div key={c.id} style={{ padding:"10px 0", borderBottom:"1px solid #D8D0C4" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <span style={{ fontSize:11, color:"#9A9A8A", width:16, flexShrink:0, textAlign:"center" }}>{i+6}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                                <span style={{ fontSize:15, fontWeight:700, color:"#1A1A14" }}>{c.name}</span>
                                <span style={{ ...MONO, fontWeight:700, color:c.color, fontSize:12 }}>{c.ticker}</span>
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                                <div style={{ width:60, height:4, background:"#EDE8E0", borderRadius:2, overflow:"hidden" }}>
                                  <div style={{ width:`${barW}%`, height:"100%", background:ytdUp?"#1A7A44":"#C01818", borderRadius:2 }}/>
                                </div>
                                <span style={{ ...MONO, fontSize:10, fontWeight:700, color:ytdUp?"#1A7A44":"#C01818" }}>YTD {ytdUp?"+":""}{ytd.toFixed(1)}%</span>
                              </div>
                            </div>
                            <span style={{ ...MONO, fontWeight:700, fontSize:15, color:"#1A1A14", flexShrink:0 }}>{fmtP(p)}</span>
                            <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                              <span style={{ fontSize:13, color:up?"#1A7A44":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
                              <span style={{ ...MONO, fontSize:11, fontWeight:700, color:up?"#1A7A44":"#C01818" }}>{(p*Math.abs(ch)/100).toFixed(3)}</span>
                              <span style={{ ...S.badge(up?"green":"red"), fontSize:10 }}>{fmtPct(ch)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <button onClick={()=>setShowSubModal(true)} style={{ ...S.btn(), fontSize:11, padding:"6px 16px" }}>
                    Subscribe to See All 20 Companies
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Divider */}
          <div style={{ background:"#D8D0C4" }}/>
          {/* Right: News */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ ...S.lbl, letterSpacing:"0.15em" }}>LATEST RELEASES</div>
            <button onClick={fetchNews} disabled={newsLoading}
              style={{ ...S.btn("s"), fontSize:9, padding:"3px 8px" }}>
              {newsLoading ? "Fetching…" : "↻"}
            </button>
          </div>
          {newsLoading && (
            <div style={{ fontSize:11, color:"#9A9A8A", padding:"12px 0" }}>Searching for latest releases…</div>
          )}
            {(news.length>0 ? news.slice(0,5) : [
              { company:"NexGen Energy",  ticker:"NXE",    date:"Jun 9",  headline:"Arrow CNSC Environmental Assessment Advancing — Q4 Decision Expected",  type:"Regulatory",  url:"https://www.newsfilecorp.com" },
              { company:"IsoEnergy",      ticker:"ISO.V",  date:"Jun 7",  headline:"Hurricane Delineation Complete — Resource Update Due Q3 2025",           type:"Drilling",    url:"https://www.newsfilecorp.com" },
              { company:"Denison Mines",  ticker:"DML.TO", date:"Jun 5",  headline:"Wheeler River Phoenix ISR Pilot Approval Received",                      type:"Regulatory",  url:"https://www.globenewswire.com" },
              { company:"Atha Energy",    ticker:"SASK.V", date:"Jun 4",  headline:"CMB 5,000m Summer Campaign Underway",                                    type:"Exploration",  url:"https://www.newsfilecorp.com" },
              { company:"Skyharbour",     ticker:"SYH.V",  date:"Jun 2",  headline:"Moore Lake Best Hole: 0.62% U₃O₈ / 4.2m at 563m",                      type:"Drilling",    url:"https://www.newsfilecorp.com" },
            ]).map((n,i)=>{
              const co=COMPANIES.find(c=>c.ticker===n.ticker||c.altTicker===n.ticker||c.name.toLowerCase().includes((n.company||"").split(" ")[0]?.toLowerCase()));
              const ch=co?gCh(co):0, up=ch>=0;
              const hasUrl = n.url && n.url !== "#";
              return (
                <div key={i} style={{ paddingBottom:10, marginBottom:10, borderBottom:"1px solid #D8D0C4" }}>
                  <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:5, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:up?"#1A7A44":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#1A1A14" }}>{n.company}</span>
                    <span style={{ ...MONO, fontSize:10, fontWeight:600, color:co?.color||"#B07A08" }}>{n.ticker}</span>
                    <span style={{ ...S.badge("gray"), fontSize:9 }}>{n.type}</span>
                    <span style={{ fontSize:9, color:"#6A6A5A", marginLeft:"auto" }}>{n.date}</span>
                  </div>
                  {hasUrl ? (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block" }}>
                      <div style={{ fontSize:12, color:"#1A1A14", lineHeight:1.4, fontWeight:500, marginBottom:4 }}>{n.headline}</div>
                      <div style={{ fontSize:10, color:"#B07A08", fontWeight:700 }}>Read full release →</div>
                    </a>
                  ) : (
                    <div style={{ fontSize:12, color:"#1A1A14", lineHeight:1.4 }}>{n.headline}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ad Banner */}
        <div style={{ marginBottom:20, padding:"18px 24px", background:"#F5F3EE", border:"1px solid #D8D0C4", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ ...S.lbl, marginBottom:4 }}>ADVERTISEMENT</div>
            <div style={{ ...SERIF, fontSize:19, color:"#B07A08", fontWeight:700 }}>Advertise with Juniorstocks.com</div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginTop:4 }}>Reach 10,000+ active uranium and junior mining investors.</div>
          </div>
          <a href="mailto:advertise@juniorstocks.com" style={{ textDecoration:"none", flexShrink:0 }}>
            <button style={{ ...S.btn(), padding:"10px 22px", fontSize:12 }}>Advertise</button>
          </a>
        </div>

        {/* Basin Capital Monitor */}
        <div style={{ marginBottom:24 }}>
          <div style={{ ...RuleH }}>
            <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Basin Capital Monitor</div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>Investment heatmap — where capital is being deployed across the Athabasca Basin</div>
          </div>
          <div style={{ ...S.card, padding:20 }}>
            {(()=>{
              const TYPE_COLORS = { "Bought Deal":"#1A5AA8", "Joint Venture":"#1A7A44", "Insider Buy":"#B07A08" };
              const filtered = SMART_MONEY_EVENTS.filter(e =>
                (bcmType==="All"   || e.type===bcmType) &&
                (bcmRegion==="All" || e.region===bcmRegion)
              );
              const byType = {
                "Bought Deal":  filtered.filter(e=>e.type==="Bought Deal"),
                "Joint Venture":filtered.filter(e=>e.type==="Joint Venture"),
                "Insider Buy":  filtered.filter(e=>e.type==="Insider Buy"),
              };
              const totalDeployed = filtered.reduce((s,e)=>s+e.amount,0);
              const momentum = filtered.length===0?"—":filtered.reduce((s,e)=>s+e.momentum,0)/filtered.length>80?"High":filtered.reduce((s,e)=>s+e.momentum,0)/filtered.length>65?"Moderate":"Developing";

              const BubbleShape = (props) => {
                const { cx, cy, payload } = props;
                const r = Math.max(14, Math.min(46, Math.sqrt(payload.amount) * 10));
                const col = TYPE_COLORS[payload.type] || "#B07A08";
                return (
                  <g style={{ cursor:"pointer" }}>
                    <circle cx={cx} cy={cy} r={r} fill={col} fillOpacity={0.75} stroke={col} strokeWidth={1.5}/>
                    <text x={cx} y={cy+4} textAnchor="middle" fontSize={9} fontWeight={700} fill="#FFFFFF">{payload.ticker}</text>
                  </g>
                );
              };

              const CustomTooltip = ({ active, payload }) => {
                if (!active||!payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div style={{ background:"#FFFFFF", border:"1px solid #D8D0C4", borderRadius:8, padding:"10px 14px", fontSize:11, maxWidth:240, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontWeight:700, color:"#1A1A14", marginBottom:4 }}>{d.company} <span style={{ color:TYPE_COLORS[d.type], fontWeight:600 }}>({d.type})</span></div>
                    <div style={{ color:"#6A6A5A", marginBottom:2 }}>{d.headline}</div>
                    <div style={{ display:"flex", gap:12, marginTop:6 }}>
                      <span style={{ fontWeight:700, color:"#1A7A44" }}>{d.amountLabel}</span>
                      <span style={{ color:"#B07A08" }}>{d.proximity}</span>
                    </div>
                    <div style={{ color:"#9A9A8A", marginTop:4 }}>{d.date} · Momentum {d.momentum}%</div>
                  </div>
                );
              };

              return (
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>

                  {/* LEFT — Chart 2/3, flex column so chart fills space */}
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    <div style={{ display:"flex", gap:12, marginBottom:10, flexWrap:"wrap" }}>
                      {Object.entries(TYPE_COLORS).map(([label,color])=>(
                        <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:10, height:10, borderRadius:"50%", background:color }}/>
                          <span style={{ fontSize:11, color:"#6A6A5A" }}>{label}</span>
                        </div>
                      ))}
                      <span style={{ fontSize:10, color:"#9A9A8A", marginLeft:"auto" }}>Bubble size = amount</span>
                    </div>
                    <div style={{ flex:1, minHeight:300, background:"#F8F6F1", borderRadius:8, padding:"4px", border:"1px solid #E8E4DE", display:"flex", flexDirection:"column" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top:16, right:12, bottom:20, left:8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0DAD0" strokeOpacity={0.8}/>
                          <XAxis type="number" dataKey="momentum" domain={[40,100]} tickFormatter={v=>`${v}%`} tick={{ fontSize:10, fill:"#6A6A5A" }}
                            label={{ value:"Relative Market Momentum →", position:"insideBottom", offset:-8, fontSize:9, fill:"#9A9A8A" }}/>
                          <YAxis type="number" dataKey="regionY" domain={[-0.8,2.8]} ticks={[0,1,2]} width={90}
                            tickFormatter={v=>["Basin Margins","Eastern Basin","Western Basin"][v]||""} tick={{ fontSize:10, fill:"#6A6A5A" }}/>
                          <ZAxis dataKey="amount" range={[300,3000]}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          {Object.entries(byType).map(([type,data])=>(
                            <Scatter key={type} data={data} fill={TYPE_COLORS[type]} shape={<BubbleShape/>}/>
                          ))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, margin:"12px 0", border:"1px solid #D8D0C4", borderRadius:8, overflow:"hidden" }}>
                      {[["Transactions",filtered.length],[`Deployed`,`C$${totalDeployed.toFixed(0)}M`],["Momentum",momentum]].map(([label,val])=>(
                        <div key={label} style={{ padding:"8px 10px", borderRight:"1px solid #D8D0C4", textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#9A9A8A", marginBottom:2 }}>{label}</div>
                          <div style={{ fontSize:13, fontWeight:800, color:"#1A1A14" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:11, color:"#6A6A5A", fontWeight:600 }}>Type</span>
                        <select value={bcmType} onChange={e=>setBcmType(e.target.value)}
                          style={{ padding:"4px 8px", fontSize:11, border:"1px solid #D8D0C4", borderRadius:6, background:"#FFFFFF", color:"#1A1A14" }}>
                          {["All","Bought Deal","Joint Venture","Insider Buy"].map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:11, color:"#6A6A5A", fontWeight:600 }}>Region</span>
                        <select value={bcmRegion} onChange={e=>setBcmRegion(e.target.value)}
                          style={{ padding:"4px 8px", fontSize:11, border:"1px solid #D8D0C4", borderRadius:6, background:"#FFFFFF", color:"#1A1A14" }}>
                          {["All","Western Basin","Eastern Basin","Basin Margins"].map(r=><option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Insider Activity 1/3 */}
                  <div style={{ borderLeft:"1px solid #D8D0C4", paddingLeft:18 }}>
                    {/* Tab toggle */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ display:"flex", border:"1px solid #D8D0C4", borderRadius:6, overflow:"hidden" }}>
                        <button onClick={()=>setInsiderView("buys")} style={{ padding:"4px 12px", fontSize:10, fontWeight:700, border:"none", cursor:"pointer", background:insiderView==="buys"?"#1A1A14":"transparent", color:insiderView==="buys"?"#FFFFFF":"#6A6A5A" }}>Top Insider Buys</button>
                        <button onClick={()=>setInsiderView("sells")} style={{ padding:"4px 12px", fontSize:10, fontWeight:700, border:"none", cursor:"pointer", background:insiderView==="sells"?"#C01818":"transparent", color:insiderView==="sells"?"#FFFFFF":"#6A6A5A", borderLeft:"1px solid #D8D0C4" }}>Top Insider Sells</button>
                      </div>
                      <span style={{ ...S.badge("gray"), fontSize:9, fontWeight:600 }}>Source: SEDI</span>
                    </div>
                    <div style={{ fontSize:10, color:"#9A9A8A", marginBottom:12 }}>Last updated: {INSIDER_BUYS_UPDATED}</div>

                    {insiderView==="buys" ? (
                      INSIDER_BUYS.map((buy,i)=>{
                        const co = COMPANIES.find(c=>c.ticker===buy.ticker||c.altTicker===buy.ticker||c.name.toLowerCase().includes(buy.company.split(" ")[0].toLowerCase()));
                        return (
                          <div key={i} style={{ paddingBottom:9, marginBottom:9, borderBottom:"1px solid #EDE8E0" }}>
                            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:2 }}>
                              <span style={{ fontSize:10, color:"#9A9A8A", width:14, flexShrink:0 }}>{i+1}</span>
                              <span style={{ fontSize:12, fontWeight:700, color:"#1A1A14" }}>{buy.company}</span>
                              <span style={{ ...MONO, fontSize:10, color:co?.color||"#B07A08", fontWeight:700 }}>{buy.ticker}</span>
                            </div>
                            <div style={{ fontSize:10, color:"#6A6A5A", marginBottom:3, paddingLeft:20 }}>{buy.buyer}</div>
                            <div style={{ display:"flex", justifyContent:"space-between", paddingLeft:20 }}>
                              <span style={{ fontSize:12, fontWeight:800, color:"#1A7A44" }}>{buy.amount}</span>
                              <span style={{ fontSize:10, color:"#9A9A8A" }}>{buy.date}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      INSIDER_SELLS.map((sell,i)=>{
                        const co = COMPANIES.find(c=>c.ticker===sell.ticker||c.altTicker===sell.ticker||c.name.toLowerCase().includes(sell.company.split(" ")[0].toLowerCase()));
                        return (
                          <div key={i} style={{ paddingBottom:9, marginBottom:9, borderBottom:"1px solid #EDE8E0" }}>
                            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:2 }}>
                              <span style={{ fontSize:10, color:"#9A9A8A", width:14, flexShrink:0 }}>{i+1}</span>
                              <span style={{ fontSize:12, fontWeight:700, color:"#1A1A14" }}>{sell.company}</span>
                              <span style={{ ...MONO, fontSize:10, color:co?.color||"#B07A08", fontWeight:700 }}>{sell.ticker}</span>
                            </div>
                            <div style={{ fontSize:10, color:"#6A6A5A", marginBottom:3, paddingLeft:20 }}>{sell.seller}</div>
                            <div style={{ display:"flex", justifyContent:"space-between", paddingLeft:20 }}>
                              <span style={{ fontSize:12, fontWeight:800, color:"#C01818" }}>{sell.amount}</span>
                              <span style={{ fontSize:10, color:"#9A9A8A" }}>{sell.date}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })()}
          </div>
        </div>

        {/* Supply Deficit & Price Visualizer */}
        <div style={{ marginBottom:24 }}>
          <div style={{ ...RuleH }}>
            <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Uranium Supply & Demand Tracker</div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>The structural case for Athabasca exploration — global supply vs. reactor demand</div>
          </div>
          <div style={{ ...S.card, padding:20 }}>
            {(()=>{
              const HIGHLIGHTS = {
                "Global Reactor Buildout": { color:"#C01818", note:"~60 new reactors are under construction globally by 2030. Each 1GWe reactor requires ~400,000 lbs U₃O₈ per year. This demand growth is structural and contractual — utilities have already committed to fuel cycles decades out. The demand curve is not speculative; it is locked in by engineering timelines." },
                "Supply Constraints":      { color:"#1A7A44", note:"Primary mine supply peaked in 2016 at ~165 Mlb and has not recovered. Kazatomprom's sulphuric acid shortages, Cigar Lake production fatigue, and a decade of underinvestment in new mine development are structural headwinds. No significant new primary supply can come online in under 10 years from a standing start." },
                "Athabasca Focus":         { color:"#B07A08", note:"The Athabasca Basin holds ~10% of global uranium resources at grades 10–100× the world average — the highest-grade uranium district on Earth. As the structural deficit widens and utilities scramble for long-term supply, explorers and developers in the Basin face the most compelling risk/reward in the junior resource sector." },
                "Price Outlook":           { color:"#7C3AED", note:"Uranium spot prices recovered from $18/lb (2016) to $87/lb (2024) — a 5× move driven entirely by supply/demand fundamentals. Long-term contract prices remain below the marginal cost of new mine supply, suggesting the price must rise further to incentivise the capital investment needed to close the deficit by 2030." },
              };
              const hl = HIGHLIGHTS[sdHighlight];
              const chartData = SUPPLY_DEFICIT_DATA.filter(d => parseInt(d.year) <= sdEndYear);

              const CustomTooltip = ({ active, payload, label }) => {
                if (!active||!payload?.length) return null;
                return (
                  <div style={{ background:"#FFFFFF", border:"1px solid #D8D0C4", borderRadius:6, padding:"8px 12px", fontSize:11 }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>{label}</div>
                    {payload.map(p=>(
                      <div key={p.name} style={{ color:p.color, marginBottom:2 }}>
                        {p.name}: {p.name==="Spot Price ($)"&&p.value?`$${p.value}/lb`:p.value!=null?`${p.value} Mlb`:"Projected"}
                      </div>
                    ))}
                  </div>
                );
              };

              return (
                <>
                  {/* Stats row */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0, marginBottom:16, border:"1px solid #D8D0C4", borderRadius:8, overflow:"hidden" }}>
                    {[["Supply Trend","Declining","#C01818"],["Demand Trend","Rising","#1A7A44"],["Structural Deficit","Widening","#B07A08"]].map(([label,val,color])=>(
                      <div key={label} style={{ padding:"10px 14px", borderRight:"1px solid #D8D0C4", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"#9A9A8A", letterSpacing:"0.08em", marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:15, fontWeight:800, color }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart — always starts 2018, extends to sdEndYear */}
                  <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} margin={{ top:8, right:20, left:0, bottom:0 }}>
                      <defs>
                        <linearGradient id="sdDemandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1A5AA8" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#1A5AA8" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="sdSupplyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1A7A44" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#1A7A44" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" tick={{ fontSize:10, fill:"#6A6A5A" }}/>
                      <YAxis yAxisId="vol" width={42} tick={{ fontSize:10, fill:"#6A6A5A" }} tickFormatter={v=>`${v}M`} domain={[100,320]}/>
                      <YAxis yAxisId="price" width={36} orientation="right" tick={{ fontSize:10, fill:"#B07A08" }} tickFormatter={v=>`$${v}`} domain={[0,120]}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:10, paddingTop:6 }}/>
                      <ReferenceLine yAxisId="vol" x="2026" stroke="#B07A08" strokeDasharray="4 3" label={{ value:"Today", position:"insideTopLeft", fontSize:9, fill:"#B07A08" }}/>
                      <Area yAxisId="vol" type="monotone" dataKey="demand" name="Reactor Demand" stroke="#1A5AA8" strokeWidth={2} fill="url(#sdDemandGrad)" dot={false}/>
                      <Area yAxisId="vol" type="monotone" dataKey="supply" name="Primary Supply"  stroke="#1A7A44" strokeWidth={2} fill="url(#sdSupplyGrad)"  dot={false}/>
                      <Line  yAxisId="price" type="monotone" dataKey="price"  name="Spot Price ($)"  stroke="#B07A08" strokeWidth={2} dot={{ fill:"#B07A08", r:3 }} connectNulls={false}/>
                    </ComposedChart>
                  </ResponsiveContainer>

                  {/* Timeframe slider — extends chart rightward */}
                  <div style={{ marginTop:16, padding:"0 4px" }}>
                    <style>{`input[type=range].sd-slider{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:linear-gradient(to right,#1A1A14 0%,#1A1A14 ${((sdEndYear-2026)/(2034-2026))*100}%,#D8D0C4 ${((sdEndYear-2026)/(2034-2026))*100}%,#D8D0C4 100%);outline:none;}input[type=range].sd-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#1A1A14;cursor:pointer;border:2px solid #FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,0.3);}input[type=range].sd-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#1A1A14;cursor:pointer;border:2px solid #FFFFFF;}`}</style>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10, color:"#9A9A8A" }}>2018 ← History</span>
                      <span style={{ fontSize:10, color:"#B07A08", fontWeight:700 }}>Extended to: {sdEndYear}</span>
                      <span style={{ fontSize:10, color:"#9A9A8A" }}>Projections → 2034</span>
                    </div>
                    <input type="range" className="sd-slider" min={2026} max={2034} step={1} value={sdEndYear} onChange={e=>setSdEndYear(parseInt(e.target.value))}/>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                      {[2026,2027,2028,2029,2030,2031,2032,2033,2034].map(y=>(
                        <span key={y} style={{ fontSize:9, color:y===sdEndYear?"#1A1A14":"#9A9A8A", fontWeight:y===sdEndYear?700:400 }}>{y}</span>
                      ))}
                    </div>
                  </div>

                  {/* Hero row — Reactor Buildout (globe) + Supply Constraints (flow) */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:28 }}>

                    {/* Reactor Buildout */}
                    {(()=>{
                      const h = HIGHLIGHTS["Global Reactor Buildout"];
                      return (
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#FAF6EE 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"16px 18px" }}>
                          <div style={{ fontSize:10, fontWeight:800, color:h.color, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.12em" }}>Global Reactor Buildout</div>
                          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                            <div style={{ width:150, flexShrink:0 }}><ReactorGlobe/></div>
                            <div>
                              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
                                <span style={{ ...SERIF, fontSize:40, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>60+</span>
                                <span style={{ fontSize:11, color:"#6A6A5A" }}>reactors u/c by 2030</span>
                              </div>
                              <div style={{ fontSize:11, color:"#4A4A3A", lineHeight:1.5 }}>
                                Each 1GWe reactor needs <strong style={{ color:"#1A1A14" }}>~400,000 lbs U₃O₈/yr</strong>. Demand is structural and contractual — locked in by engineering timelines, not speculation.
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize:9.5, fontWeight:800, color:h.color, margin:"12px 0 8px", textTransform:"uppercase", letterSpacing:"0.1em" }}>Top Builders Under Construction</div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"5px 16px" }}>
                            {[
                              ["China","#1A7A44",28],["India","#1A7A44",7],["Russia","#1A5AA8",6],
                              ["Turkey","#1A5AA8",4],["Egypt","#1A5AA8",4],["S. Korea","#B07A08",3],
                            ].map(([name,col,n])=>(
                              <div key={name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, paddingBottom:4, borderBottom:"1px solid #EDE8E0" }}>
                                <span style={{ width:6, height:6, borderRadius:"50%", background:col, flexShrink:0 }}/>
                                <span style={{ color:"#4A4A3A", flex:1 }}>{name}</span>
                                <span style={{ ...MONO, color:"#1A1A14", fontWeight:700 }}>{n}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Supply Constraints */}
                    {(()=>{
                      const h = HIGHLIGHTS["Supply Constraints"];
                      return (
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#F4F8F4 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"16px 18px" }}>
                          <div style={{ fontSize:10, fontWeight:800, color:h.color, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.12em" }}>Supply Constraints</div>
                          <div style={{ width:"100%" }}><SupplyChainFlow/></div>
                          <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"10px 0 6px" }}>
                            <span style={{ ...SERIF, fontSize:26, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>2016</span>
                            <span style={{ fontSize:11, color:"#6A6A5A" }}>primary supply peaked at ~165 Mlb</span>
                          </div>
                          <div style={{ fontSize:11, color:"#4A4A3A", lineHeight:1.5 }}>
                            Kazatomprom acid shortages, Cigar Lake production fatigue, and a decade of underinvestment mean <strong style={{ color:"#1A1A14" }}>no major new supply</strong> can arrive in under 10 years from a standing start.
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Hero row 2 — Athabasca Focus (map) + Price Outlook (table) */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:20, marginBottom:8 }}>

                    {/* Athabasca Focus */}
                    {(()=>{
                      const h = HIGHLIGHTS["Athabasca Focus"];
                      return (
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#FAF6EE 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"16px 18px" }}>
                          <div style={{ fontSize:10, fontWeight:800, color:h.color, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.12em" }}>Athabasca Focus</div>
                          <div style={{ marginBottom:10 }}>
                            <AthabascaFocusMap satImage={basinSat}/>
                          </div>
                          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
                            <span style={{ ...SERIF, fontSize:26, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>~10%</span>
                            <span style={{ fontSize:11, color:"#6A6A5A" }}>of global uranium resources · grades 10–100× world average</span>
                          </div>
                          <div style={{ fontSize:11, color:"#4A4A3A", lineHeight:1.5 }}>
                            The highest-grade uranium district on Earth. As the deficit widens, Basin explorers face the <strong style={{ color:"#1A1A14" }}>most compelling risk/reward</strong> in the junior resource sector.
                          </div>
                        </div>
                      );
                    })()}

                    {/* Price Outlook */}
                    {(()=>{
                      const h = HIGHLIGHTS["Price Outlook"];
                      return (
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#F6F2FA 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"16px 18px" }}>
                          <div style={{ fontSize:10, fontWeight:800, color:h.color, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.12em" }}>Price Outlook <span style={{ fontWeight:400, color:"#9A9A8A", textTransform:"none", letterSpacing:0 }}>· targets & history</span></div>
                          <PriceOutlookTable/>
                          <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"12px 0 6px" }}>
                            <span style={{ ...SERIF, fontSize:26, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>5×</span>
                            <span style={{ fontSize:11, color:"#6A6A5A" }}>recovery from $18 (2016) to $87/lb (2024)</span>
                          </div>
                          <div style={{ fontSize:11, color:"#4A4A3A", lineHeight:1.5 }}>
                            Long-term contract prices remain <strong style={{ color:"#1A1A14" }}>below the marginal cost</strong> of new mine supply — price must rise further to incentivise the capital needed to close the deficit.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Athabasca Exploration Runway */}
        <div style={{ marginBottom:24 }}>
          <div style={{ ...RuleH }}>
            <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Athabasca Exploration Runway</div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>Cash runway vs. exploration intensity — where each company sits on the risk spectrum</div>
          </div>
          <div style={{ ...S.card, padding:20 }}>
            {(()=>{
              const STAGE_COLORS = { "Grassroots":"#1A7A44", "Advanced":"#B07A08", "Resource":"#1A5AA8" };
              const filtered = EXPLORATION_RUNWAY.filter(e =>
                e.mktCap >= erMinMktCap &&
                (erStage==="All" || e.stage===erStage)
              );
              const byStage = {
                "Resource":   filtered.filter(e=>e.stage==="Resource"),
                "Advanced":   filtered.filter(e=>e.stage==="Advanced"),
                "Grassroots": filtered.filter(e=>e.stage==="Grassroots"),
              };
              const avgRunway = filtered.length ? (filtered.reduce((s,e)=>s+e.runway,0)/filtered.length).toFixed(1) : "—";

              const BubbleShape = (props) => {
                const { cx, cy, payload } = props;
                const col = STAGE_COLORS[payload.stage] || "#B07A08";
                return (
                  <g style={{ cursor:"default" }}>
                    <circle cx={cx} cy={cy} r={15} fill={col} fillOpacity={0.82} stroke="#FFFFFF" strokeWidth={1.5}/>
                    <text x={cx} y={cy+3} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#FFFFFF">{payload.ticker}</text>
                  </g>
                );
              };

              const CustomTooltip = ({ active, payload }) => {
                if (!active||!payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const col = STAGE_COLORS[d.stage];
                const quadrant = d.runway<12&&d.budget>=5?"Dilution Risk":d.runway>=12&&d.budget>=5?"Aggressive":d.runway<12&&d.budget<5?"Maintenance":"Fully Funded";
                return (
                  <div style={{ background:"#FFFFFF", border:"1px solid #D8D0C4", borderRadius:8, padding:"10px 14px", fontSize:11, maxWidth:220, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontWeight:800, color:"#1A1A14", marginBottom:4 }}>{d.company} <span style={{ color:col }}>({d.stage})</span></div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:4 }}>
                      <div><span style={{ color:"#9A9A8A" }}>Runway: </span><strong>{d.runway}mo</strong></div>
                      <div><span style={{ color:"#9A9A8A" }}>Budget: </span><strong>C${d.budget}M/yr</strong></div>
                      <div><span style={{ color:"#9A9A8A" }}>Mkt Cap: </span><strong>C${d.mktCap}M</strong></div>
                      <div><span style={{ color:"#9A9A8A" }}>Zone: </span><strong style={{ color:col }}>{quadrant}</strong></div>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {/* Legend */}
                  <div style={{ display:"flex", gap:14, marginBottom:12, flexWrap:"wrap" }}>
                    {Object.entries(STAGE_COLORS).map(([stage,color])=>(
                      <div key={stage} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:color }}/>
                        <span style={{ fontSize:11, color:"#6A6A5A" }}>{stage}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top:16, right:20, bottom:20, left:8 }}>
                      {/* Quadrant backgrounds */}
                      <ReferenceArea x1={0}  x2={12} y1={5}  y2={11} fill="#C01818" fillOpacity={0.04} label={{ value:"DILUTION RISK", position:"insideTopLeft", fontSize:9, fill:"#C01818", fontWeight:700, letterSpacing:1 }}/>
                      <ReferenceArea x1={12} x2={30} y1={5}  y2={11} fill="#B07A08" fillOpacity={0.04} label={{ value:"AGGRESSIVE",    position:"insideTopLeft", fontSize:9, fill:"#B07A08", fontWeight:700, letterSpacing:1 }}/>
                      <ReferenceArea x1={0}  x2={12} y1={0}  y2={5}  fill="#6A6A5A" fillOpacity={0.04} label={{ value:"MAINTENANCE",   position:"insideTopLeft", fontSize:9, fill:"#9A9A8A", fontWeight:700, letterSpacing:1 }}/>
                      <ReferenceArea x1={12} x2={30} y1={0}  y2={5}  fill="#1A7A44" fillOpacity={0.04} label={{ value:"FULLY FUNDED",  position:"insideTopLeft", fontSize:9, fill:"#1A7A44", fontWeight:700, letterSpacing:1 }}/>
                      <XAxis type="number" dataKey="runway" domain={[0,30]} tick={{ fontSize:10, fill:"#6A6A5A" }}
                        label={{ value:"Cash Runway (months) →", position:"insideBottom", offset:-8, fontSize:9, fill:"#9A9A8A" }}/>
                      <YAxis type="number" dataKey="budget" domain={[0,11]} width={46} tick={{ fontSize:10, fill:"#6A6A5A" }}
                        tickFormatter={v=>`$${v}M`} label={{ value:"Annual Budget (CAD M)", angle:-90, position:"insideLeft", offset:10, fontSize:9, fill:"#9A9A8A" }}/>
                      <ReferenceLine x={12} stroke="#D8D0C4" strokeDasharray="4 3" strokeWidth={1.5}/>
                      <ReferenceLine y={5}  stroke="#D8D0C4" strokeDasharray="4 3" strokeWidth={1.5}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      {Object.entries(byStage).map(([stage,data])=>(
                        <Scatter key={stage} data={data} fill={STAGE_COLORS[stage]} shape={<BubbleShape/>}/>
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>

                  {/* Stats */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, margin:"12px 0", border:"1px solid #D8D0C4", borderRadius:8, overflow:"hidden" }}>
                    {[["Companies Shown", filtered.length],["Avg Runway",`${avgRunway}mo`]].map(([label,val])=>(
                      <div key={label} style={{ padding:"10px 16px", borderRight:"1px solid #D8D0C4", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"#9A9A8A", marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:"#1A1A14" }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Filters */}
                  <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:200 }}>
                      <span style={{ fontSize:11, color:"#6A6A5A", fontWeight:600, whiteSpace:"nowrap" }}>Market Cap (CAD M)</span>
                      <style>{`input[type=range].er-slider{-webkit-appearance:none;flex:1;height:4px;border-radius:2px;background:linear-gradient(to right,#1A1A14 0%,#1A1A14 ${(erMinMktCap/500)*100}%,#D8D0C4 ${(erMinMktCap/500)*100}%,#D8D0C4 100%);outline:none;}input[type=range].er-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#1A1A14;cursor:pointer;border:2px solid #FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,0.2);}input[type=range].er-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#1A1A14;cursor:pointer;border:2px solid #FFFFFF;}`}</style>
                      <input type="range" className="er-slider" min={0} max={500} step={10} value={erMinMktCap} onChange={e=>setErMinMktCap(parseInt(e.target.value))} style={{ flex:1 }}/>
                      <span style={{ fontSize:11, fontWeight:700, color:"#1A1A14", minWidth:36 }}>{erMinMktCap||"All"}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:11, color:"#6A6A5A", fontWeight:600 }}>Development Stage</span>
                      <select value={erStage} onChange={e=>setErStage(e.target.value)}
                        style={{ padding:"5px 10px", fontSize:11, border:"1px solid #D8D0C4", borderRadius:6, background:"#FFFFFF", color:"#1A1A14", cursor:"pointer" }}>
                        {["All","Grassroots","Advanced","Resource"].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Video / Interviews */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", ...RuleH }}>
            <div>
              <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Featured Interviews & Analysis</div>
              <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>Latest videos from key uranium voices</div>
            </div>
            <button onClick={fetchVideoData} disabled={videosLoading}
              style={{ ...S.btn("s"), fontSize:10, padding:"4px 10px", marginBottom:8 }}>
              {videosLoading ? "Fetching…" : "↻ Refresh"}
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
            {INFLUENCERS.map((inf,i)=>{
              const THUMBS = [
                "linear-gradient(150deg,#1A2A4A 0%,#0D3868 100%)",
                "linear-gradient(150deg,#2A1808 0%,#7A4210 100%)",
                "linear-gradient(150deg,#0A2A18 0%,#1A6038 100%)",
                "linear-gradient(150deg,#181818 0%,#383838 100%)",
                "linear-gradient(150deg,#1A0A2A 0%,#4A1A5A 100%)",
                "linear-gradient(150deg,#0A1828 0%,#1A3A58 100%)",
              ];
              const vd = videoData.find(v =>
                v.channel===inf.name ||
                (v.channel||"").toLowerCase().includes(inf.name.split(" ")[0].toLowerCase()) ||
                inf.name.toLowerCase().includes((v.channel||"").split(" ")[0].toLowerCase())
              );
              const href     = vd?.videoUrl || inf.url;
              const thumbUrl = vd?.videoId  ? `https://img.youtube.com/vi/${vd.videoId}/hqdefault.jpg` : null;
              return (
                <a key={inf.name} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <div style={{ ...S.card, marginBottom:0, overflow:"hidden", padding:0 }}>
                    {/* Thumbnail */}
                    <div style={{ position:"relative", paddingBottom:"56.25%", background:THUMBS[i]||THUMBS[0], overflow:"hidden" }}>
                      {thumbUrl && (
                        <img src={thumbUrl} alt={inf.name}
                          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
                          onError={e=>{ e.target.style.display="none"; }}
                        />
                      )}
                      {videosLoading && !thumbUrl && (
                        <div style={{ position:"absolute", inset:0, background:"#F0EDE8", animation:"pulse 1.4s ease-in-out infinite" }}/>
                      )}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.65) 100%)" }}/>
                      {/* Play button */}
                      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)", width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.25)" }}>
                        <Play size={16} strokeWidth={2} color="#1A1A14" style={{ marginLeft:2 }}/>
                      </div>
                      {/* Title + date overlay */}
                      <div style={{ position:"absolute", bottom:8, left:10, right:10 }}>
                        {vd?.date && (
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.75)", marginBottom:3, fontWeight:500 }}>{vd.date}</div>
                        )}
                        <div style={{ color:"#FFFFFF", fontSize:11, fontWeight:700, lineHeight:1.35, textShadow:"0 1px 4px rgba(0,0,0,0.8)" }}>
                          {vd?.videoTitle || inf.channel}
                        </div>
                      </div>
                    </div>
                    {/* Info below thumbnail */}
                    <div style={{ padding:"10px 12px" }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"#1A1A14", marginBottom:2 }}>{inf.name}</div>
                      <div style={{ fontSize:10, color:"#9A9A8A", marginBottom:6 }}>{inf.handle}</div>
                      <div style={{ fontSize:11, color:"#6A6A5A", lineHeight:1.4 }}>{inf.focus}</div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Expert Perspective */}
        <div style={{ marginBottom:20, padding:"22px 24px", background:"#F5F3EE", border:"1px solid #D8D0C4", borderRadius:8, borderLeft:"3px solid #E8A020" }}>
          <div style={{ ...S.lbl, color:"#B07A08", marginBottom:12, letterSpacing:"0.12em" }}>EXPERT PERSPECTIVE</div>
          <blockquote style={{ ...SERIF, fontSize:21, fontWeight:400, color:"#1A1A14", lineHeight:1.65, fontStyle:"italic", margin:"0 0 14px", padding:0 }}>
            "The uranium market has the most compelling supply/demand fundamentals I have seen in my forty-year career. Decades of underinvestment now meet an unstoppable global build-out in reactor capacity."
          </blockquote>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <img src="data:image/jpeg;base64,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" alt="Rick Rule" style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", objectPosition:"center top", flexShrink:0, border:"2px solid #E8D890", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}/>
            <div>
              <div style={{ fontSize:13, color:"#B07A08", fontWeight:700 }}>Rick Rule</div>
              <div style={{ fontSize:11, color:"#6A6A5A" }}>Natural Resource Investor · Sprott Asset Management · Public commentary, 2024</div>
            </div>
          </div>
        </div>

        {/* Nuclear Macro + Global News */}
        <div style={{ display:"grid", gridTemplateColumns:"256px 1fr", gap:20, marginBottom:20 }}>
          <div>
            <div style={RuleH}>
              <div style={{ ...SERIF, fontSize:18, fontWeight:700, color:"#1A1A14" }}>Nuclear Macro</div>
            </div>
            {GLOBAL_STATS.map(g=>(
              <div key={g.label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #D8D0C4" }}>
                <span style={{ fontSize:12, color:"#6A6A5A" }}>{g.label}</span>
                <div style={{ textAlign:"right" }}>
                  <div style={{ ...MONO, fontWeight:700, fontSize:14, color:"#B07A08" }}>{g.value}</div>
                  <div style={{ fontSize:10, color:"#6A6A5A" }}>{g.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ ...RuleH, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <div style={{ ...SERIF, fontSize:18, fontWeight:700, color:"#1A1A14" }}>Global Nuclear News</div>
              <button onClick={fetchGlobalNews} style={{ ...S.btn("s"), fontSize:10, padding:"4px 10px" }} disabled={globalNewsLoading}>
                {globalNewsLoading?"Fetching…":"↻ Refresh"}
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {(globalNews.length>0?globalNews:STATIC_GLOBAL_NEWS).slice(0,6).map((n,i)=>(
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <div style={{ paddingBottom:10, borderBottom:"1px solid #D8D0C4", cursor:"pointer" }}>
                    <div style={{ display:"flex", gap:5, marginBottom:5, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ ...S.badge("blue"), fontSize:9 }}>{n.publication||n.source}</span>
                      {n.category&&<span style={{ ...S.badge("gray"), fontSize:9 }}>{n.category}</span>}
                      <span style={{ fontSize:9, color:"#6A6A5A", marginLeft:"auto" }}>{n.date}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#1A1A14", fontWeight:600, lineHeight:1.4, marginBottom:4 }}>{n.headline}</div>
                    <div style={{ fontSize:11, color:"#6A6A5A", lineHeight:1.4, marginBottom:6 }}>{(n.summary||"").substring(0,90)}{(n.summary||"").length>90?"…":""}</div>
                    <div style={{ fontSize:10, color:"#B07A08", fontWeight:600 }}>Read article →</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── COMPANIES ──
  const renderCompanies = () => (
    <div>
      <div style={{ ...S.sectionTitle, justifyContent:"space-between" }}>
        Companies — Athabasca Basin
        <button onClick={fetchPrices} style={S.btn("s")} disabled={refreshing}>{refreshing?"↻ Fetching live prices…":"↻ Refresh Quotes"}</button>
      </div>

      {[
        { label:"Producers",           test:c=>c.stage.includes("Producer")                             },
        { label:"Advanced Developers", test:c=>c.stage.includes("Advanced")                             },
        { label:"Developers",          test:c=>c.stage==="Developer"||c.stage.includes("Delineation")   },
        { label:"Explorers",           test:c=>c.stage.includes("Explorer")                             },
        { label:"Royalty Companies",   test:c=>c.stage.includes("Royalty")                              },
      ].map(cat=>{
        const cats=COMPANIES.filter(cat.test);
        if(cats.length===0) return null;
        return (
          <div key={cat.label} style={{ marginBottom:28 }}>
            <div style={{ borderBottom:"2px solid #1A1A14", paddingBottom:6, marginBottom:14, display:"flex", alignItems:"baseline", gap:10 }}>
              <span style={{ fontWeight:800, fontSize:13, letterSpacing:"0.1em", textTransform:"uppercase" }}>{cat.label}</span>
              <span style={{ fontSize:11, color:"#9A9A8A", marginLeft:6 }}>{cats.length} {cats.length===1?"company":"companies"}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {cats.map(c=>{
              const p=gP(c), ch=gCh(c), isE=expanded===c.id;
              return (
                <div key={c.id} style={{ ...S.card, borderLeft:`3px solid ${c.color}`, marginBottom:0, padding:20, gridColumn:isE?"span 2":"span 1" }}>
            <div onClick={()=>setExpanded(isE?null:c.id)} style={{ cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ fontWeight:800, fontSize:18, color:"#1A1A14", marginBottom:8 }}>{c.fullName}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                  <span style={{ ...S.badge("amber"), fontSize:11, fontWeight:700 }}>{cadTk(c)}</span>
                  {usTk(c) && usTk(c)!=="—" && usTk(c)!==cadTk(c) && <span style={{ ...S.badge("gray"), fontSize:11 }}>{usTk(c)}</span>}
                  <span style={S.badge("blue")}>{c.exchange}</span>
                  <span style={S.badge(c.stage==="Producer"?"green":c.stage.includes("Advanced")?"blue":c.stage==="Developer"?"amber":"gray")}>{c.stage}</span>
                </div>
                <div style={{ fontSize:12, color:"#6A6A5A", lineHeight:1.6, maxWidth:520 }}>{c.description}</div>
              </div>
              <div style={{ display:"flex", gap:20, alignItems:"center", flexShrink:0 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={S.lbl}>Price</div>
                  <div style={{ ...MONO, fontWeight:900, fontSize:18 }}>{fmtP(p)}</div>
                  <span style={S.badge(ch>=0?"green":"red")}>{fmtPct(ch)}</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={S.lbl}>Mkt Cap</div>
                  <div style={{ fontWeight:700 }}>{calcMktCap(c)}</div>
                </div>
                <span style={{ color:"#6A6A5A", fontSize:16 }}>{isE?"▲":"▼"}</span>
              </div>
            </div>

            {isE && (
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #1C2840" }}>
                <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:16, marginBottom:14 }}>
                  {/* Cap table */}
                  <div>
                    <div style={{ ...S.lbl, marginBottom:8 }}>📋 Capital Structure</div>
                    <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                      {[
                        ["Shares Basic",c.sharesBasic],
                        ["Shares FD",c.sharesFD],
                        ["Float",c.float],
                        ["Cash / Liquidity",c.cashPosition],
                        ["Insider Ownership",c.insiderOwnership],
                        ["Institutional",c.institutionalOwnership],
                        ["Avg Daily Vol",c.avgVolume],
                      ].map(([k,v])=>(
                        <tr key={k}>
                          <td style={{ color:"#6A6A5A", padding:"3px 0", borderBottom:"1px solid #0E1420" }}>{k}</td>
                          <td style={{ fontWeight:600, textAlign:"right", padding:"3px 0", borderBottom:"1px solid #0E1420" }}>{v}</td>
                        </tr>
                      ))}
                    </table>
                    {SHARE_UPDATES[c.id] && (
                      <div style={{ fontSize:10, color:"#9A9A8A", marginTop:8, fontStyle:"italic" }}>
                        Structure as at {SHARE_UPDATES[c.id]}
                      </div>
                    )}
                  </div>
                  {/* Projects */}
                  <div>
                    <div style={{ ...S.lbl, marginBottom:8 }}>⛏ Projects & Resources</div>
                    {c.projects.map(pr=>(
                      <div key={pr.name} style={{ background:"#F5F3EE", border:"1px solid #D8D0C4", borderRadius:6, padding:"10px 14px", marginBottom:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <span style={{ fontWeight:700, fontSize:13, color:"#1A1A14" }}>{pr.name}</span>
                          <span style={S.badge("blue")}>{pr.stage}</span>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:16, fontSize:11 }}>
                          {[["Ownership",pr.ownership],["Grade",pr.grade],["Resource",pr.resource],["Depth",pr.depth]].map(([k,v])=> v&&v!=="—"&&(
                            <span key={k}><span style={{ color:"#9A9A8A", fontWeight:500 }}>{k}: </span><span style={{ fontWeight:700, color:"#1A1A14" }}>{v}</span></span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[
                    [`https://www.youtube.com/results?search_query=${encodeURIComponent(c.ytSearch)}`, "▶ YouTube"],
                    [`https://finance.yahoo.com/quote/${c.altTicker||c.ticker}`, "📈 Yahoo Finance"],
                    [`https://ceo.ca/${c.ticker.replace('.V','').replace('.TO','').replace('.CN','')}`, "💬 CEO.CA"],
                    ["https://www.sedar.com", "📄 SEDAR+"],
                    [`https://finance.yahoo.com/quote/${c.altTicker||c.ticker}/news`, "📰 News"],
                    ...(SOCIAL[c.id]?.x  ? [[SOCIAL[c.id].x,  "𝕏 Twitter"]]  : []),
                    ...(SOCIAL[c.id]?.li ? [[SOCIAL[c.id].li, "in LinkedIn"]] : []),
                  ].map(([href,label])=>(
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                      <button style={S.btn("s")}>{label}</button>
                    </a>
                  ))}
                </div>
                {MARKETING[c.id] && (
                  <div style={{ marginTop:14, padding:"12px 16px", background:"linear-gradient(135deg,#FFFDF5 0%,#FFF5DC 100%)", border:"1px solid #E8D890", borderRadius:8 }}>
                    <div style={{ ...S.lbl, color:"#B07A08", marginBottom:10, letterSpacing:"0.1em" }}>📣 ACTIVE MARKETING AGREEMENT</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                      {[["Marketing Firm",MARKETING[c.id].firm],["Monthly Retainer",MARKETING[c.id].amount],["Contract Period",MARKETING[c.id].period]].map(([k,v])=>(
                        <div key={k}>
                          <div style={{ ...S.lbl, fontSize:9, marginBottom:3 }}>{k}</div>
                          <div style={{ fontWeight:700, fontSize:12, color:"#1A1A14" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
              );
            })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── MAP ──
  const renderMap = () => {
    const getGroup = (stage) => {
      const g = STAGE_GROUPS.find(g=>g.test(stage));
      return g ? g.key : "Explorer";
    };

    const markerR = (stage) =>
      stage==="Producer"?11 : stage.includes("Advanced")?9 : stage.includes("Developer")||stage==="Producer / Developer"?7 : stage.includes("Royalty")?6 : 5;

    const corridorPath = (pts) =>
      pts.map(([lng,lat],i)=>{ const [x,y]=toSVG(lat,lng); return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ")+" Z";

    const CORRIDORS = [
      { id:"western", name:"Patterson Lake Corridor", color:"#B07A08", opacity:0.20, border:0.4,
        desc:"Shallow basement-hosted, high-grade: Arrow 257 Mlb · Triple R 102 Mlb · PLN",
        pts:[[-109.75,58.85],[-108.65,58.85],[-108.65,57.95],[-109.75,57.95]] },
      { id:"eastern", name:"Eastern Basin Corridor", color:"#C01818", opacity:0.15, border:0.35,
        desc:"Ultra-high-grade unconformity: Cigar Lake · McArthur River · Wheeler River · Hurricane",
        pts:[[-105.6,58.75],[-103.0,58.75],[-103.0,57.1],[-105.4,57.1]] },
      { id:"central", name:"Central Exploration Zone", color:"#1A5AA8", opacity:0.08, border:0.25,
        desc:"Drill-ready basement targets: Moore Lake · ACKIO · CMB · CanAlaska · Purepoint",
        pts:[[-108.8,59.4],[-105.7,59.4],[-105.7,57.5],[-108.8,57.5]] },
    ];

    const LAKES = [
      { name:"Lake Athabasca", lat:59.12, lng:-110.85, rx:24, ry:9 },
      { name:"Fond du Lac", lat:59.35, lng:-107.3, rx:9, ry:5 },
      { name:"Black Lake", lat:59.12, lng:-105.6, rx:11, ry:6 },
      { name:"Cree Lake", lat:57.42, lng:-106.8, rx:15, ry:9 },
      { name:"Wollaston Lake", lat:58.22, lng:-103.3, rx:9, ry:7 },
    ];

    const toggleStage = (key) => setStageFilter(f=>({...f,[key]:!f[key]}));
    const visibleCos = COMPANIES.filter(c=>c.location && stageFilter[getGroup(c.stage)]);

    // Real geological deposits & landmarks (from published Athabasca Basin geology maps)
    const DEPOSITS = [
      { name:"Cigar Lake",      lat:58.06, lng:-104.53, type:"deposit" },
      { name:"McArthur River",  lat:57.77, lng:-105.04, type:"deposit" },
      { name:"Key Lake",        lat:57.20, lng:-105.62, type:"deposit" },
      { name:"Rabbit Lake",     lat:58.22, lng:-103.68, type:"deposit" },
      { name:"McClean Lake",    lat:58.30, lng:-103.83, type:"deposit" },
      { name:"Midwest Lake",    lat:58.42, lng:-103.95, type:"deposit" },
      { name:"Eagle Point",     lat:58.20, lng:-103.55, type:"deposit" },
      { name:"Cluff Lake",      lat:58.39, lng:-109.51, type:"deposit" },
      { name:"Shea Creek",      lat:58.18, lng:-109.50, type:"deposit" },
      { name:"Millennium",      lat:57.58, lng:-104.70, type:"prospect" },
      { name:"Centennial",      lat:57.65, lng:-106.45, type:"prospect" },
      { name:"Maybelle River",  lat:58.45, lng:-110.30, type:"prospect" },
      { name:"Maurice Bay",     lat:59.45, lng:-110.30, type:"prospect" },
      { name:"Beaverlodge District", lat:59.55, lng:-108.60, type:"district" },
    ];

    // Major structural features
    const SNOWBIRD = [[-111.0,60.3],[-108.5,59.0],[-106.0,57.8],[-104.0,57.0]];
    const snowbirdPath = SNOWBIRD.map(([lng,lat],i)=>{ const [x,y]=toSVG(lat,lng); return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");

    return (
      <div>
        <div style={S.sectionTitle}>Athabasca Basin — Geological Project Map</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 248px", gap:14 }}>

          {/* SVG Map */}
          <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
            <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ background:"#EDE8E0", display:"block" }}>

              {/* Crystalline basement background */}
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F0EDE8"/>

              {/* Lat/lng grid */}
              {[56,57,58,59,60].map(lat=>{
                const [,y]=toSVG(lat,-106);
                return <g key={lat}>
                  <line x1={MAP_PL} y1={y} x2={MAP_PL+MAP_W} y2={y} stroke="#0E1828" strokeWidth={0.5} strokeDasharray="4,12"/>
                  <text x={MAP_PL-5} y={y+4} fill="#9A9A8A" fontSize={9} textAnchor="end">{lat}°N</text>
                </g>;
              })}
              {[-111,-109,-107,-105,-103].map(lng=>{
                const [x]=toSVG(58,lng);
                return <g key={lng}>
                  <line x1={x} y1={MAP_PT} x2={x} y2={MAP_PT+MAP_H} stroke="#0E1828" strokeWidth={0.5} strokeDasharray="4,12"/>
                  <text x={x} y={MAP_PT+MAP_H+16} fill="#9A9A8A" fontSize={9} textAnchor="middle">{lng}°W</text>
                </g>;
              })}

              {/* Basin fill — Athabasca sandstone formation */}
              <path d={BASIN_PATH} fill="#C8EAD8" fillOpacity={0.9} stroke="#68A888" strokeWidth={1.5}/>

              {/* Uranium corridor overlays */}
              {CORRIDORS.map(cor=>(
                <path key={cor.id} d={corridorPath(cor.pts)}
                  fill={cor.color} fillOpacity={cor.opacity}
                  stroke={cor.color} strokeWidth={1} strokeOpacity={cor.border}/>
              ))}

              {/* Lakes */}
              {LAKES.map(lk=>{
                const [cx,cy]=toSVG(lk.lat,lk.lng);
                return <g key={lk.name}>
                  <ellipse cx={cx} cy={cy} rx={lk.rx} ry={lk.ry} fill="#EEEAE4" stroke="#CCCCC0" strokeWidth={0.8}/>
                  <text x={cx} y={cy+3} fill="#CCCCC0" fontSize={6.5} textAnchor="middle" fontStyle="italic">{lk.name}</text>
                </g>;
              })}

              {/* AB / SK provincial border ≈ 110°W */}
              {(()=>{ const [bx]=toSVG(58,-110);
                return <line x1={bx} y1={MAP_PT} x2={bx} y2={MAP_PT+MAP_H} stroke="#9A9A8A" strokeWidth={1.5} strokeDasharray="8,5"/>;
              })()}

              {/* Province labels */}
              {[["AB",58.7,-111.3],["SK",58.7,-107.8]].map(([lbl,lat,lng])=>{
                const [x,y]=toSVG(lat,lng);
                return <text key={lbl} x={x} y={y} fill="#9A9A8A" fontSize={11} fontWeight={700} textAnchor="middle" letterSpacing="1.5">{lbl}</text>;
              })}

              {/* Basin watermark */}
              {(()=>{ const [x,y]=toSVG(57.0,-107.5);
                return <text x={x} y={y} fill="#B07A08" fontSize={9.5} fontWeight={700} textAnchor="middle" opacity={0.22} letterSpacing="2">ATHABASCA BASIN</text>;
              })()}

              {/* Snowbird Tectonic Zone */}
              <path d={snowbirdPath} fill="none" stroke="#1A5AA8" strokeWidth={2.5} strokeOpacity={0.35} strokeDasharray="2,4"/>
              {(()=>{ const [x,y]=toSVG(57.3,-104.5);
                return <text x={x} y={y} fill="#1A5AA8" fontSize={7} fontWeight={600} textAnchor="middle" opacity={0.5} fontStyle="italic" transform={`rotate(-32 ${x} ${y})`}>Snowbird Tectonic Zone</text>;
              })()}

              {/* Geological deposits & landmarks (reference, non-investment) */}
              {DEPOSITS.map(d=>{
                const [x,y]=toSVG(d.lat,d.lng);
                const isDistrict = d.type==="district";
                const isDeposit  = d.type==="deposit";
                return (
                  <g key={d.name} style={{ pointerEvents:"none" }}>
                    {isDistrict ? (
                      <rect x={x-3} y={y-3} width={6} height={6} fill="#C01818" fillOpacity={0.55} stroke="#C01818" strokeWidth={0.6}/>
                    ) : isDeposit ? (
                      <rect x={x-2.3} y={y-2.3} width={4.6} height={4.6} fill="#8A1818" fillOpacity={0.5} stroke="#8A1818" strokeWidth={0.5}/>
                    ) : (
                      <circle cx={x} cy={y} r={2.2} fill="#8A6A1A" fillOpacity={0.45} stroke="#8A6A1A" strokeWidth={0.4}/>
                    )}
                    <text x={x} y={y-4.5} fill="#5A5A4A" fontSize={6} fontWeight={isDistrict?700:500} textAnchor="middle" opacity={0.75}>{d.name}</text>
                  </g>
                );
              })}

              {/* Company markers */}
              {visibleCos.map(c=>{
                const [x,y]=toSVG(c.location.lat,c.location.lng);
                const sel=mapSel===c.id;
                const r=markerR(c.stage);
                const grp=getGroup(c.stage);
                return (
                  <g key={c.id} onClick={()=>setMapSel(sel?null:c.id)} style={{ cursor:"pointer" }}>
                    {sel && <circle cx={x} cy={y} r={r+9} fill={c.color} fillOpacity={0.08} stroke={c.color} strokeWidth={1} strokeDasharray="3,3"/>}
                    <circle cx={x} cy={y} r={r} fill={c.color} fillOpacity={0.16} stroke={c.color} strokeWidth={grp==="Producer"?2.5:1.5}/>
                    <circle cx={x} cy={y} r={grp==="Producer"?5.5:grp==="Developer"?4:3} fill={c.color} fillOpacity={sel?1:0.9}/>
                    <text x={x+r+3} y={y+3.5} fill={c.color} fontSize={7.5} fontWeight={700} fontFamily="monospace" opacity={sel?1:0.8}>
                      {c.ticker.split(".")[0]}
                    </text>
                    {sel && (
                      <g>
                        <rect x={x+r+1} y={y-30} width={144} height={54} rx={4} fill="#1A1A14" stroke={c.color} strokeWidth={1.5}/>
                        <text x={x+r+9} y={y-15} fill={c.color} fontSize={10} fontWeight={800}>{c.ticker}</text>
                        <text x={x+r+9} y={y+0} fill="#1A1A14" fontSize={9} fontWeight={600}>{fmtP(gP(c))}  {fmtPct(gCh(c))}</text>
                        <text x={x+r+9} y={y+13} fill="#6A6A5A" fontSize={8}>{c.projects[0]?.name.substring(0,24)}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

            {/* Stage toggles */}
            <div style={S.card}>
              <div style={{ ...S.lbl, marginBottom:10 }}>Filter by Stage</div>
              {STAGE_GROUPS.map(g=>{
                const count=COMPANIES.filter(c=>g.test(c.stage)).length;
                const active=stageFilter[g.key];
                return (
                  <button key={g.key} onClick={()=>toggleStage(g.key)} style={{
                    width:"100%", marginBottom:6, padding:"7px 10px", borderRadius:6,
                    border:`1px solid ${active?g.color+"88":"#D8D0C4"}`,
                    background:active?g.color+"1A":"transparent",
                    color:active?g.color:"#6A6A5A",
                    fontSize:12, fontWeight:700, cursor:"pointer", textAlign:"left",
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                  }}>
                    <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:active?g.color:"#9A9A8A", display:"inline-block" }}/>
                      {g.label}
                    </span>
                    <span style={{ fontSize:11, opacity:0.75, ...MONO }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Corridor legend */}
            <div style={S.card}>
              <div style={{ ...S.lbl, marginBottom:8 }}>Uranium Trend Zones</div>
              {CORRIDORS.map(cor=>(
                <div key={cor.id} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:3 }}>
                    <div style={{ width:14, height:14, background:cor.color, opacity:0.55, borderRadius:2, flexShrink:0, border:`1px solid ${cor.color}88` }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:"#1A1A14" }}>{cor.name}</span>
                  </div>
                  <div style={{ fontSize:10, color:"#6A6A5A", lineHeight:1.5, paddingLeft:21 }}>{cor.desc}</div>
                </div>
              ))}
              <div style={{ borderTop:"1px solid #1C2840", paddingTop:8, marginTop:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#9A9A8A", marginBottom:6 }}>
                  <span>— —</span> AB / SK border
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#9A9A8A", marginBottom:4 }}>
                  <span style={{ width:7, height:7, background:"#8A1818", display:"inline-block" }}/> Major uranium deposit (reference)
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#9A9A8A", marginBottom:4 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#8A6A1A", display:"inline-block" }}/> Prospect (reference)
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#9A9A8A" }}>
                  <span style={{ color:"#1A5AA8" }}>· · ·</span> Snowbird Tectonic Zone
                </div>
              </div>
            </div>

            {/* Filtered company list */}
            <div style={{ ...S.card, overflowY:"auto", maxHeight:270 }}>
              <div style={{ ...S.lbl, marginBottom:8 }}>Showing {visibleCos.length} of {COMPANIES.length}</div>
              {visibleCos.map(c=>(
                <div key={c.id} onClick={()=>setMapSel(mapSel===c.id?null:c.id)}
                  style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, cursor:"pointer", opacity:mapSel&&mapSel!==c.id?0.35:1 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:c.color, flexShrink:0 }}/>
                  <span style={{ fontSize:11, ...MONO, color:mapSel===c.id?c.color:"#2A2A20", flex:1 }}>{c.ticker}</span>
                  <span style={{ fontSize:10, color:"#6A6A5A", ...MONO }}>{fmtP(gP(c))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected company panel */}
        {mapSel && (()=>{
          const c=COMPANIES.find(x=>x.id===mapSel);
          return c && (
            <div style={{ ...S.card, marginTop:12, borderLeft:`3px solid ${c.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ ...MONO, fontWeight:900, fontSize:16, color:c.color }}>{c.ticker}</span>
                    <span style={{ fontWeight:700 }}>{c.fullName}</span>
                    <span style={S.badge("blue")}>{c.stage}</span>
                  </div>
                  <div style={{ fontSize:13, color:"#6A6A5A", marginBottom:4 }}>{c.description}</div>
                  <div style={{ fontSize:11, color:"#6A6A5A" }}>Projects: {c.projects.map(p=>p.name).join(" · ")}</div>
                </div>
                <div style={{ display:"flex", gap:20 }}>
                  <div><div style={S.lbl}>Price</div><div style={{ fontWeight:900,...MONO }}>{fmtP(gP(c))}</div></div>
                  <div><div style={S.lbl}>Change</div><span style={S.badge(gCh(c)>=0?"green":"red")}>{fmtPct(gCh(c))}</span></div>
                  <div><div style={S.lbl}>Mkt Cap</div><div style={{ fontWeight:700 }}>{calcMktCap(c)}</div></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Disclaimer */}
        <div style={{ marginTop:14, padding:"10px 14px", background:"#FAFAF7", border:"1px solid #E8E4DE", borderRadius:8, fontSize:10.5, color:"#9A9A8A", lineHeight:1.6 }}>
          <strong style={{ color:"#6A6A5A" }}>Disclaimer:</strong> This map is a simplified schematic for illustrative purposes only. Deposit locations, structural features, basin boundaries, and company project positions are approximate and may not be accurate or to scale. Geological deposit and prospect markers are shown for geographic reference only and do not represent ownership or investment recommendations. Always verify locations and data with official company disclosures and authoritative geological surveys (e.g. Saskatchewan Geological Survey, NRCan) before making any decisions.
        </div>
      </div>
    );
  };

  // ── NEWS ──
  const renderNews = () => (
    <div>
      <div style={{ ...S.sectionTitle, justifyContent:"space-between" }}>
        News Releases — Live Feed
        <button onClick={fetchNews} style={S.btn()} disabled={newsLoading}>{newsLoading?"↻ Fetching…":"↻ Refresh"}</button>
      </div>
      {newsLoading && (
        <div style={{ ...S.card, textAlign:"center", padding:48 }}>
          <div style={{ display:"flex", justifyContent:"center", color:"#6A6A5A", marginBottom:12 }}><Newspaper size={28} strokeWidth={1}/></div>
          <div style={{ color:"#6A6A5A" }}>Pulling latest press releases from GlobeNewswire & Newsfile…</div>
        </div>
      )}
      {!newsLoading && news.length===0 && (
        <div style={{ ...S.card, textAlign:"center", padding:48 }}>
          <div style={{ display:"flex", justifyContent:"center", color:"#B07A08", marginBottom:12 }}><Radio size={36} strokeWidth={1}/></div>
          <div style={{ color:"#1A1A14", fontWeight:700 }}>Click "Refresh" to pull the latest basin press releases</div>
          <div style={{ fontSize:12, color:"#6A6A5A", marginTop:8 }}>Sourced directly from GlobeNewswire and Newsfile Corp</div>
        </div>
      )}
      {news.map((n,i)=>{
        const co=COMPANIES.find(c=>c.name.toLowerCase().includes((n.company||"").split(" ")[0]?.toLowerCase())||c.ticker===n.ticker);
        return (
          <a key={i} href={n.url||"#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
            <div style={{ ...S.card, borderLeft:`3px solid ${co?.color||"#B07A08"}`, marginBottom:8, cursor:"pointer" }}>
              <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#1A1A14" }}>{n.company}</span>
                <span style={{ ...MONO, fontWeight:700, color:co?.color||"#B07A08", fontSize:11 }}>{n.ticker}</span>
                {n.type  && <span style={S.badge("blue")}>{n.type}</span>}
                {n.source && <span style={S.badge("gray")}>{n.source}</span>}
                <span style={{ fontSize:11, color:"#6A6A5A", marginLeft:"auto" }}>{n.date}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:"#1A1A14", marginBottom:4 }}>{n.headline}</div>
              <div style={{ fontSize:12, color:"#6A6A5A", lineHeight:1.5 }}>{n.summary}</div>
              {n.url && <div style={{ fontSize:11, color:"#B07A08", marginTop:6, fontWeight:600 }}>Read full release →</div>}
            </div>
          </a>
        );
      })}
    </div>
  );

  // ── DRILLING ──
  const renderDrilling = () => (
    <div>
      <div style={S.sectionTitle}>Drilling Programs & Pending Assays</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10, marginBottom:16 }}>
        {[
          { lbl:"Active Programs",     val:DRILLING.filter(d=>d.status==="Active"||d.status==="Drilling").length, Icon:Hammer   },
          { lbl:"Holes Pending Assay", val:DRILLING.reduce((s,d)=>s+d.pending,0),                                Icon:Timer    },
          { lbl:"Holes Drilled",       val:DRILLING.reduce((s,d)=>s+d.drilled,0),                               Icon:Activity },
        ].map(({lbl,val,Icon})=>(
          <div key={lbl} style={{ ...S.card, padding:12, textAlign:"center", marginBottom:0 }}>
            <div style={{ display:"flex", justifyContent:"center", color:"#B07A08", marginBottom:4 }}><Icon size={18} strokeWidth={1.5}/></div>
            <div style={{ fontSize:24, fontWeight:900, color:"#B07A08", ...MONO }}>{val}</div>
            <div style={{ fontSize:10, color:"#6A6A5A" }}>{lbl}</div>
          </div>
        ))}
      </div>
      {DRILLING.map((d,i)=>{
        const co=COMPANIES.find(c=>c.ticker===d.ticker||c.name.toLowerCase().includes(d.company.split(" ")[0].toLowerCase()));
        const pct=d.total>0?(d.drilled/d.total)*100:100;
        const sc=d.status==="Active"||d.status==="Drilling"?"green":d.status.includes("Pending")?"amber":"blue";
        return (
          <div key={i} style={{ ...S.card, borderLeft:`3px solid ${co?.color||"#B07A08"}`, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ ...MONO, fontWeight:700, color:co?.color||"#B07A08" }}>{d.ticker}</span>
                  <span style={{ fontWeight:700 }}>{d.company}</span>
                  <span style={S.badge(sc)}>{d.status}</span>
                </div>
                <div style={{ fontSize:12, color:"#6A6A5A", marginBottom:10 }}>{d.program}</div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6A6A5A", marginBottom:3 }}>
                    <span>Drill progress</span><span>{d.drilled}/{d.total} holes ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ background:"#D8D0C4", borderRadius:3, height:5 }}>
                    <div style={{ background:co?.color||"#B07A08", width:`${pct}%`, height:"100%", borderRadius:3 }}/>
                  </div>
                </div>
                <div style={{ fontSize:12 }}>
                  <span style={{ color:"#6A6A5A" }}>Pending: </span>
                  <span style={{ fontWeight:700, color:d.pending>0?"#B07A08":"#1A7A44", marginRight:16 }}>{d.pending} holes</span>
                  <span style={{ color:"#6A6A5A" }}>Latest: </span>
                  <span style={{ color:"#1A1A14" }}>{d.highlight}</span>
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={S.lbl}>Updated</div>
                <div style={{ fontSize:12, fontWeight:600 }}>2025 {d.updated}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── FINANCINGS ──
  const renderFinancings = () => {
    const open=FINANCINGS.filter(f=>f.status==="Open");
    const closed=FINANCINGS.filter(f=>f.status==="Closed");
    return (
      <div>
        <div style={S.sectionTitle}>Capital Raises & Financings</div>
        {open.length>0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#1A7A44", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>● Open — Currently Raising</div>
            {open.map((f,i)=>{
              const co=COMPANIES.find(c=>c.ticker===f.ticker);
              return (
                <div key={i} style={{ ...S.card, border:"1px solid #2DCE8B44", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                    <div>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                        <span style={{ ...MONO, fontWeight:900, fontSize:14, color:co?.color||"#B07A08" }}>{f.ticker}</span>
                        <span style={{ fontWeight:700 }}>{f.company}</span>
                        <span style={S.badge("green")}>OPEN</span>
                        <span style={S.badge("gray")}>{f.type}</span>
                      </div>
                      <div style={{ fontSize:28, fontWeight:900, color:"#1A7A44", ...MONO, marginBottom:4 }}>{f.amount}</div>
                      <div style={{ fontSize:13, color:"#6A6A5A" }}>{f.pricePerUnit} · {f.units}</div>
                      {f.warrants!=="None" && <div style={{ fontSize:12, color:"#B07A08", marginTop:6, display:"flex", alignItems:"center", gap:5 }}><Tag size={11} strokeWidth={1.5}/>Warrants: {f.warrants}</div>}
                    </div>
                    <div style={{ fontSize:12 }}>
                      <div style={S.lbl}>Lead Agent</div>
                      <div style={{ fontWeight:600, marginBottom:10 }}>{f.agents}</div>
                      <div style={S.lbl}>Use of Proceeds</div>
                      <div style={{ color:"#6A6A5A", maxWidth:240 }}>{f.purpose}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#6A6A5A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Recently Closed</div>
          <div style={{ ...S.card, padding:0, overflowX:"auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["Company","Type","Amount","Price/Unit","Warrants","Agent","Closed","Purpose"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {closed.map((f,i)=>{
                  const co=COMPANIES.find(c=>c.ticker===f.ticker);
                  return (
                    <tr key={i}>
                      <td style={S.td}><span style={{ ...MONO, fontWeight:700, color:co?.color||"#B07A08" }}>{f.ticker}</span></td>
                      <td style={S.td}>{f.type}</td>
                      <td style={S.td}><span style={{ fontWeight:700 }}>{f.amount}</span></td>
                      <td style={S.td}><span style={MONO}>{f.pricePerUnit}</span></td>
                      <td style={S.td}><span style={{ fontSize:11, color:f.warrants!=="None"?"#B07A08":"#6A6A5A" }}>{f.warrants}</span></td>
                      <td style={S.td}><span style={{ fontSize:11 }}>{f.agents.split(" /")[0]}</span></td>
                      <td style={S.td}><span style={{ fontSize:11, color:"#6A6A5A" }}>{f.closed}</span></td>
                      <td style={S.td}><span style={{ fontSize:11, color:"#6A6A5A" }}>{f.purpose.substring(0,36)}{f.purpose.length>36?"…":""}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── VIDEOS ──
  const renderVideos = () => (
    <div>
      <div style={S.sectionTitle}>Videos — Uranium Channels & Company Search</div>
      <div style={{ ...S.lbl, marginBottom:12 }}>Top Uranium Analysts & Channels</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:12, marginBottom:24 }}>
        {INFLUENCERS.map(inf=>(
          <div key={inf.name} style={{ ...S.card, marginBottom:0 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:8, background:"#1a0a0a", border:"1px solid #E8505044", display:"flex", alignItems:"center", justifyContent:"center", color:"#C01818", flexShrink:0 }}><Play size={16} strokeWidth={1.5}/></div>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{inf.name}</div>
                <div style={{ fontSize:11, color:"#6A6A5A" }}>{inf.handle}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginBottom:10, lineHeight:1.5 }}>{inf.focus}</div>
            <a href={inf.url} target="_blank" rel="noopener noreferrer">
              <button style={{ ...S.btn("s"), width:"100%", textAlign:"center" }}>Open Channel →</button>
            </a>
          </div>
        ))}
      </div>
      <div style={{ ...S.lbl, marginBottom:12 }}>Search Videos by Company</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))", gap:10 }}>
        {COMPANIES.map(c=>(
          <a key={c.id} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(c.ytSearch)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
            <div style={{ ...S.card, cursor:"pointer", borderLeft:`3px solid ${c.color}`, marginBottom:0 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ width:32, height:32, borderRadius:6, background:"#1a0a0a", border:`1px solid ${c.color}33`, display:"flex", alignItems:"center", justifyContent:"center", color:c.color, flexShrink:0 }}><Play size={13} strokeWidth={1.5}/></div>
                <div>
                  <div style={{ ...MONO, fontWeight:700, color:c.color, fontSize:12 }}>{c.ticker}</div>
                  <div style={{ fontSize:10, color:"#6A6A5A" }}>{c.name}</div>
                </div>
              </div>
              <div style={{ fontSize:10, color:"#9A9A8A", marginTop:8 }}>Search "{c.name} uranium 2025" →</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  // ── POLITICS ──
  const renderPolitics = () => (
    <div>
      <div style={{ ...S.sectionTitle, justifyContent:"space-between" }}>
        Politics, Policy & Regulation
        <button onClick={fetchPol} style={S.btn()} disabled={polLoading}>{polLoading?"⟳ Searching…":"⟳ Fetch Latest Policy News"}</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10, marginBottom:20 }}>
        {[
          { cat:"Federal Canada",    Icon:Flag,     color:"#C01818", key:"NRCan, CNSC, Budget 2025 nuclear commitments, clean energy credits" },
          { cat:"Saskatchewan",      Icon:Globe,    color:"#B07A08", key:"Royalty regime, Crown mineral policy, exploration incentives" },
          { cat:"US Nuclear Policy", Icon:Radio,    color:"#1A5AA8", key:"DOE offtake programs, HALEU fund, Russian uranium ban enforcement" },
          { cat:"Global / IAEA",     Icon:Globe,    color:"#8B68C8", key:"COP28 nuclear pledge (tripling by 2050), EU taxonomy, China/India build program" },
          { cat:"Indigenous Rights", Icon:Users,    color:"#1A7A44", key:"UNDRIP implementation, duty to consult, First Nations revenue sharing" },
          { cat:"CNSC Regulatory",   Icon:Scale,    color:"#6366F1", key:"Arrow EA timeline, ISR pilot approvals, PRISM regulatory initiative" },
        ].map(p=>(
          <div key={p.cat} style={{ ...S.card, borderLeft:`3px solid ${p.color}`, marginBottom:0 }}>
            <div style={{ color:p.color, marginBottom:8 }}><p.Icon size={16} strokeWidth={1.5}/></div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{p.cat}</div>
            <div style={{ fontSize:11, color:"#6A6A5A", lineHeight:1.5 }}>{p.key}</div>
          </div>
        ))}
      </div>
      {polLoading && (
        <div style={{ ...S.card, textAlign:"center", padding:40 }}>
          <div style={{ display:"flex", justifyContent:"center", color:"#6A6A5A", marginBottom:12 }}><Scale size={28} strokeWidth={1}/></div>
          <div style={{ color:"#6A6A5A" }}>Searching policy and regulatory news…</div>
        </div>
      )}
      {!polLoading && pol.length===0 && (
        <div style={{ ...S.card, textAlign:"center", padding:32 }}>
          <div style={{ color:"#6A6A5A", fontSize:13 }}>Click "Fetch Latest Policy News" for real-time political and regulatory developments</div>
        </div>
      )}
      {pol.map((p,i)=>(
        <div key={i} style={{ ...S.card, marginBottom:8, borderLeft:`3px solid ${p.impact==="Positive"?"#1A7A44":p.impact==="Negative"?"#C01818":"#6A6A5A"}` }}>
          <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap", alignItems:"center" }}>
            <span style={S.badge("blue")}>{p.category}</span>
            <span style={S.badge(p.impact==="Positive"?"green":p.impact==="Negative"?"red":"gray")}>
              {p.impact==="Positive"?"▲":p.impact==="Negative"?"▼":"●"} {p.impact}
            </span>
            <span style={{ fontSize:11, color:"#6A6A5A" }}>{p.date}</span>
          </div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{p.headline}</div>
          <div style={{ fontSize:12, color:"#6A6A5A", lineHeight:1.5 }}>{p.summary}</div>
          {p.source && <div style={{ fontSize:11, color:"#9A9A8A", marginTop:4 }}>Source: {p.source}</div>}
        </div>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div style={S.root}>
      {/* Font + animation */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');@keyframes tkr{from{transform:translateX(0)}to{transform:translateX(-50%)}}.tkr-track{animation:tkr 55s linear infinite}.tkr-track:hover{animation-play-state:paused}@keyframes card-glow{0%,100%{box-shadow:0 0 0 0 rgba(176,122,8,0)}50%{box-shadow:0 0 28px 6px rgba(176,122,8,0.12)}}.spot-glow{animation:card-glow 3s ease-in-out infinite}`}</style>
      <div style={{ background:"#FFFFFF", borderBottom:"2px solid #1A1A14", overflow:"hidden", height:28, display:"flex", alignItems:"center" }}>
        <div className="tkr-track" style={{ display:"inline-flex", alignItems:"center", whiteSpace:"nowrap", gap:0 }}>
          {[0,1].map(loop=>(
            <span key={loop} style={{ display:"inline-flex", alignItems:"center", gap:0 }}>
              <span style={{ ...MONO, fontSize:10, color:"#B07A08", fontWeight:800, letterSpacing:"0.18em", padding:"0 20px" }}>ATHABASCA LIVE</span>
              {COMPANIES.map(c=>{
                const p=gP(c),ch=gCh(c);
                return (
                  <span key={c.id} style={{ display:"inline-flex", gap:6, alignItems:"center", padding:"0 26px", borderLeft:"1px solid #D8D0C4" }}>
                    <span style={{ ...MONO, fontWeight:700, fontSize:11, color:c.color }}>{c.ticker}</span>
                    <span style={{ ...MONO, fontSize:11 }}>{fmtP(p)}</span>
                    <span style={{ ...MONO, fontSize:11, color:ch>=0?"#1A7A44":"#C01818" }}>{fmtPct(ch)}</span>
                  </span>
                );
              })}
              <span style={{ ...MONO, fontSize:11, color:"#B07A08", fontWeight:700, padding:"0 20px", borderLeft:"1px solid #D8D0C4" }}>
                U₃O₈ ${spot.price?.toFixed(2)||"79.50"}/lb
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src="data:image/png;base64,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" alt="logo" style={{ width:28, height:28, objectFit:"contain" }}/>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:"#B07A08", letterSpacing:"0.06em", lineHeight:1 }}>ATHABASCA BASIN TRACKER</div>
            <div style={{ fontSize:9, color:"#6A6A5A", letterSpacing:"0.12em", textTransform:"uppercase", marginTop:3 }}>Uranium Intelligence Dashboard by Juniorstocks.com</div>
          </div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
          <div>
            <div style={S.lbl}>U₃O₈ Spot (USD / lb)</div>
            <div style={{ fontSize:26, fontWeight:900, color:"#B07A08", ...MONO, letterSpacing:"-1px" }}>
              {spotLoading?"—":`$${spot.price?.toFixed(2)}`}
              <span style={{ fontSize:12, color:spotWoW>=0?"#1A7A44":"#C01818", marginLeft:8 }}>
                {spotWoW>=0?"▲":"▼"} {Math.abs(spotWoW).toFixed(2)} WoW
              </span>
            </div>
          </div>
          <div>
            <div style={S.lbl}>52-Wk Range</div>
            <div style={{ fontSize:14, fontWeight:700, ...MONO }}>
              <span style={{ color:"#C01818" }}>${spot.low52||"73.00"}</span>
              <span style={{ color:"#6A6A5A" }}> — </span>
              <span style={{ color:"#1A7A44" }}>${spot.high52||"106.00"}</span>
            </div>
          </div>
          <div>
            <div style={S.lbl}>Date</div>
            <div style={{ fontSize:12, fontWeight:600 }}>{new Date().toLocaleDateString("en-CA",{ dateStyle:"medium" })}</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={S.nav}>
        {TABS.map(t=>(
          <button key={t.id} style={S.tab(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </nav>

      {/* Content */}
      <main style={S.main}>
        {tab==="overview"   && renderOverview()}
        {tab==="companies"  && renderCompanies()}
        {tab==="map"        && renderMap()}
        {tab==="news"       && renderNews()}
        {tab==="drilling"   && renderDrilling()}
        {tab==="financings" && renderFinancings()}
        {tab==="videos"     && renderVideos()}
        {tab==="politics"   && renderPolitics()}
      </main>

      {/* Footer */}
      <footer style={{ background:"#F5F3EE", borderTop:"1px solid #D8D0C4", padding:"20px 24px", marginTop:8 }}>
        {/* Data sources row */}
        <div style={{ marginBottom:14 }}>
          <div style={{ ...S.lbl, marginBottom:8 }}>Data Sources</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 20px" }}>
            {[
              ["Uranium Spot Price",    "UxC Weekly Spot · TradeTech"],
              ["Equity Quotes",         "TMX Group · Yahoo Finance · OTC Markets"],
              ["Company Filings",       "SEDAR+ · EDGAR · Company Press Releases"],
              ["Reactor & Supply Data", "World Nuclear Association · IAEA PRIS"],
              ["Regulatory",           "CNSC · Natural Resources Canada"],
              ["Basin Geology",         "Geological Survey of Canada · NRCan"],
              ["News & Analysis",       "Anthropic Claude AI (web-search powered)"],
            ].map(([label, source])=>(
              <span key={label} style={{ fontSize:11, color:"#6A6A5A" }}>
                <span style={{ color:"#6A6A5A", fontWeight:600 }}>{label}:</span>{" "}
                <span style={{ color:"#6A6A5A" }}>{source}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop:"1px solid #D8D0C4", marginBottom:14 }}/>

        {/* Disclaimer + copyright + advertise */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
          <div style={{ maxWidth:680 }}>
            <p style={{ fontSize:11, color:"#6A6A5A", lineHeight:1.6, margin:0 }}>
              This dashboard provides estimated data for informational purposes only. Stock prices, resource estimates, drill results, and financial data are sourced from public disclosures and third-party providers and may not reflect real-time market conditions. Nothing on this platform constitutes investment advice, a solicitation, or a recommendation to buy or sell any security.{" "}
              <strong style={{ color:"#6A6A5A" }}>Not for navigation or trading decisions.</strong>
            </p>
            <p style={{ fontSize:11, color:"#9A9A8A", margin:"6px 0 0" }}>
              © 2026 Juniorstocks.com · All rights reserved.
            </p>
          </div>
          <a href="mailto:advertise@juniorstocks.com" style={{ textDecoration:"none", flexShrink:0 }}>
            <button style={{
              padding:"8px 18px", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer",
              background:"transparent", color:"#B07A08", border:"1px solid #E8A02066",
              letterSpacing:"0.06em", textTransform:"uppercase"
            }}>
              Advertise
            </button>
          </a>
        </div>
      </footer>

      {/* Subscribe modal */}
      {showSubModal && (
        <div onClick={()=>setShowSubModal(false)}
          style={{ position:"fixed", inset:0, background:"rgba(26,26,20,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#FFFFFF", borderRadius:12, padding:"32px 36px", width:"100%", maxWidth:440, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", position:"relative" }}>

            {/* Close */}
            <button onClick={()=>setShowSubModal(false)}
              style={{ position:"absolute", top:14, right:16, background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9A9A8A", lineHeight:1 }}>×</button>

            {/* Header */}
            <div style={{ marginBottom:20 }}>
              <div style={{ ...SERIF, fontSize:23, fontWeight:700, color:"#1A1A14", marginBottom:6, lineHeight:1.2 }}>
                Unlock All 20 Companies
              </div>
              <div style={{ fontSize:13, color:"#6A6A5A", lineHeight:1.5 }}>
                Subscribe to <strong style={{ color:"#1A1A14" }}>Juniorstocks.com</strong> for free access to the full Athabasca Basin tracker — all 20 companies, live quotes, and weekly uranium intelligence delivered to your inbox.
              </div>
            </div>

            {/* Email input */}
            <input
              type="email"
              placeholder="your@email.com"
              value={subEmail}
              onChange={e=>setSubEmail(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && subEmail.includes("@")){ fetch("/.netlify/functions/subscribe",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:subEmail}) }).catch(()=>{}).finally(()=>{ setSubscribed(true); setShowSubModal(false); }); }}}
              style={{ width:"100%", padding:"12px 14px", border:"1px solid #D8D0C4", borderRadius:6, fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", color:"#1A1A14" }}
            />

            {/* Submit */}
            <button
              onClick={async ()=>{
                if(!subEmail.includes("@")) return;
                try {
                  await fetch("/.netlify/functions/subscribe", {
                    method:"POST",
                    headers:{ "Content-Type":"application/json" },
                    body: JSON.stringify({ email: subEmail }),
                  });
                } catch(e) { console.error("Subscribe error", e); }
                setSubscribed(true);
                setShowSubModal(false);
              }}
              style={{ width:"100%", padding:"13px", background:"#B07A08", color:"#FFFFFF", border:"none", borderRadius:6, fontSize:14, fontWeight:700, cursor:"pointer", letterSpacing:"0.04em" }}>
              Get Free Access
            </button>

            {/* Disclaimer */}
            <div style={{ fontSize:10, color:"#9A9A8A", textAlign:"center", marginTop:12, lineHeight:1.5 }}>
              By subscribing you agree to receive emails from Juniorstocks.com. No spam. Unsubscribe anytime.
            </div>
          </div>
        </div>
      )}
      {companyModal && (()=>{
        const c = companyModal;
        const p = gP(c), ch = gCh(c), ytd = getYTD(c);
        const up = ch >= 0, ytdUp = ytd >= 0;
        const vol = gVol(c);
        const companyNews = news.filter(n=>
          n.ticker===c.ticker || n.ticker===c.altTicker ||
          (n.company||"").toLowerCase().includes(c.name.split(" ")[0].toLowerCase())
        ).slice(0,3);

        // Generate seeded 30-day price series
        const gen30Day = (price, seed) => {
          let s = seed.split("").reduce((a,b)=>a+b.charCodeAt(0),0);
          const pts = [price];
          for (let i=1;i<30;i++){
            s=(s*9301+49297)%233280;
            const r=s/233280;
            pts.unshift(Math.max(0.001, pts[0]*(1-(r-0.5)*0.05)));
          }
          return pts.map((v,i)=>({ d:i+1, price:Math.round(v*1000)/1000 }));
        };
        const chart30 = gen30Day(p, c.ticker);
        const chartMin = Math.min(...chart30.map(d=>d.price))*0.995;
        const chartMax = Math.max(...chart30.map(d=>d.price))*1.005;

        const parseShares = s=>{const n=parseFloat(s||"0");if(!s)return 0;if(s.includes("B"))return n*1e9;if(s.includes("M"))return n*1e6;if(s.includes("K"))return n*1e3;return n;};
        const mktCap = p * parseShares(c.sharesBasic);
        const mktCapStr = mktCap>=1e9?`$${(mktCap/1e9).toFixed(1)}B`:`$${(mktCap/1e6).toFixed(0)}M`;

        return (
          <div onClick={()=>setCompanyModal(null)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div onClick={e=>e.stopPropagation()}
              style={{ background:"#FFFFFF", borderRadius:12, width:"100%", maxWidth:620, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

              {/* Header */}
              <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #D8D0C4" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ ...SERIF, fontSize:22, fontWeight:700, color:"#1A1A14" }}>{c.name}</span>
                      <span style={{ ...MONO, fontSize:12, fontWeight:700, color:c.color||"#B07A08" }}>{c.ticker}</span>
                      {c.altTicker && <span style={{ ...MONO, fontSize:11, color:"#9A9A8A" }}>{c.altTicker}</span>}
                      <span style={{ ...S.badge("gray"), fontSize:10 }}>{c.exchange||"TSXV"}</span>
                      <span style={{ ...S.badge("blue"), fontSize:10 }}>{c.stage}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#6A6A5A", marginTop:4 }}>{c.description}</div>
                  </div>
                  <button onClick={()=>setCompanyModal(null)}
                    style={{ background:"transparent", border:"none", fontSize:20, color:"#9A9A8A", cursor:"pointer", lineHeight:1, padding:"0 0 0 12px", flexShrink:0 }}>✕</button>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap" }}>
                  <span style={{ ...SERIF, fontSize:32, fontWeight:700, color:"#1A1A14" }}>{fmtP(p)}</span>
                  <span style={{ ...MONO, fontSize:13, color:"#6A6A5A" }}>CAD</span>
                  <span style={{ ...S.badge(up?"green":"red"), fontSize:11 }}>{up?"▲":"▼"} {fmtPct(ch)}</span>
                  <span style={{ fontSize:12, color:ytdUp?"#1A7A44":"#C01818", fontWeight:700 }}>YTD {ytdUp?"+":""}{ytd.toFixed(1)}%</span>
                </div>
              </div>

              {/* 30-day chart */}
              <div style={{ padding:"16px 24px 8px" }}>
                <div style={{ ...S.lbl, marginBottom:6 }}>30-DAY PRICE TREND</div>
                <div style={{ background:"#FAFAF7", borderRadius:8, border:"1px solid #E8E4DE", padding:"4px" }}>
                  <ResponsiveContainer width="100%" height={110}>
                    <AreaChart data={chart30} margin={{ top:4, right:4, bottom:0, left:0 }}>
                      <defs>
                        <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={c.color||"#B07A08"} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={c.color||"#B07A08"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis domain={[chartMin, chartMax]} hide/>
                      <Tooltip formatter={(v)=>[`${fmtP(v)}`,"Price"]} contentStyle={{ background:"#FFFFFF", border:"1px solid #D8D0C4", fontSize:11, borderRadius:4 }}/>
                      <Area type="monotone" dataKey="price" stroke={c.color||"#B07A08"} strokeWidth={1.5} fill="url(#coGrad)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key stats */}
              <div style={{ padding:"8px 24px 4px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:0, border:"1px solid #D8D0C4", borderRadius:8, overflow:"hidden" }}>
                  {[
                    ["Market Cap",  mktCap>0?mktCapStr:(c.marketCap?`$${c.marketCap}`:"—")],
                    ["Shares (Basic)", c.sharesBasic||"—"],
                    ["Volume",      vol>0?vol>=1e6?`${(vol/1e6).toFixed(1)}M`:`${(vol/1e3).toFixed(0)}K`:(c.avgVolume?`${c.avgVolume} avg`:"—")],
                    ["Stage",       c.stage||"—"],
                  ].map(([label,val])=>(
                    <div key={label} style={{ padding:"10px 12px", borderRight:"1px solid #D8D0C4", textAlign:"center" }}>
                      <div style={{ fontSize:10, color:"#9A9A8A", marginBottom:3 }}>{label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1A1A14" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capital Structure */}
              <div style={{ padding:"12px 24px 4px" }}>
                <div style={{ ...S.lbl, marginBottom:8 }}>CAPITAL STRUCTURE {SHARE_UPDATES[c.id] && <span style={{ fontWeight:400, color:"#9A9A8A", textTransform:"none", letterSpacing:0 }}>· as of {SHARE_UPDATES[c.id]}</span>}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 20px" }}>
                  {[
                    ["Shares Outstanding (Basic)", c.sharesBasic],
                    ["Shares Fully Diluted",       c.sharesFD],
                    ["Public Float",               c.float],
                    ["Cash Position",              c.cashPosition],
                    ["Insider Ownership",          c.insiderOwnership],
                    ["Institutional Ownership",    c.institutionalOwnership],
                    ["Avg Daily Volume",           c.avgVolume],
                  ].filter(([,v])=>v).map(([label,val])=>(
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"5px 0", borderBottom:"1px solid #F0EDE8" }}>
                      <span style={{ fontSize:11, color:"#6A6A5A" }}>{label}</span>
                      <span style={{ ...MONO, fontSize:12, fontWeight:700, color:"#1A1A14" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {c.projects?.length>0 && (
                <div style={{ padding:"12px 24px 4px" }}>
                  <div style={{ ...S.lbl, marginBottom:8 }}>PROJECTS & RESOURCES</div>
                  {c.projects.map((pr,i)=>(
                    <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid #F0EDE8" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:700, color:"#1A1A14" }}>{pr.name}</span>
                        {pr.stage && <span style={{ ...S.badge("blue"), fontSize:9 }}>{pr.stage}</span>}
                        {pr.ownership && <span style={{ fontSize:10, color:"#6A6A5A" }}>{pr.ownership} owned</span>}
                      </div>
                      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                        {pr.grade    && <span style={{ fontSize:11, color:"#6A6A5A" }}>Grade: <strong style={{ color:"#1A1A14" }}>{pr.grade}</strong></span>}
                        {pr.resource && <span style={{ fontSize:11, color:"#6A6A5A" }}>Resource: <strong style={{ color:"#1A7A44" }}>{pr.resource}</strong></span>}
                        {pr.depth    && <span style={{ fontSize:11, color:"#6A6A5A" }}>Depth: <strong style={{ color:"#1A1A14" }}>{pr.depth}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Marketing agreement */}
              {MARKETING[c.id] && (
                <div style={{ padding:"12px 24px 4px" }}>
                  <div style={{ ...S.lbl, marginBottom:8 }}>MARKETING / IR AGREEMENT</div>
                  <div style={{ background:"linear-gradient(135deg,#FFF8E8,#FFF2D4)", border:"1px solid #E8D890", borderRadius:8, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1A1A14" }}>{MARKETING[c.id].firm}</div>
                      <div style={{ fontSize:11, color:"#8A6A1A", marginTop:2 }}>{MARKETING[c.id].period}</div>
                    </div>
                    <span style={{ ...MONO, fontSize:13, fontWeight:800, color:"#B07A08" }}>{MARKETING[c.id].amount}</span>
                  </div>
                </div>
              )}

              {/* Latest press releases */}
              <div style={{ padding:"12px 24px 16px" }}>
                <div style={{ ...S.lbl, marginBottom:10 }}>LATEST PRESS RELEASES</div>
                {companyNews.length>0 ? companyNews.map((n,i)=>(
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block" }}>
                    <div style={{ padding:"10px 0", borderBottom:"1px solid #EDE8E0", display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ fontSize:10, color:"#9A9A8A", whiteSpace:"nowrap", marginTop:2 }}>{n.date}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:"#1A1A14", lineHeight:1.4, flex:1 }}>{n.headline}</span>
                      <span style={{ fontSize:11, color:"#B07A08", flexShrink:0 }}>↗</span>
                    </div>
                  </a>
                )) : (
                  <div style={{ fontSize:12, color:"#9A9A8A", fontStyle:"italic", padding:"8px 0" }}>No recent releases found — check the News Feed tab for updates.</div>
                )}
              </div>

              {/* Links */}
              <div style={{ padding:"0 24px 20px", display:"flex", gap:8, flexWrap:"wrap" }}>
                <a href={`https://finance.yahoo.com/quote/${c.altTicker||c.ticker}`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>Yahoo Finance ↗</a>
                <a href={`https://www.sedarplus.ca/`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>SEDAR+ ↗</a>
                {SOCIAL[c.id]?.x  && <a href={SOCIAL[c.id].x}  target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>X / Twitter ↗</a>}
                {SOCIAL[c.id]?.li && <a href={SOCIAL[c.id].li} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>LinkedIn ↗</a>}
                <button onClick={()=>{setCompanyModal(null);setTab("companies");setExpanded(c.id);}}
                  style={{ ...S.btn(), fontSize:11 }}>Full Profile →</button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
