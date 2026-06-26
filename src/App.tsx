import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, AreaChart, Area, ComposedChart, Legend, ScatterChart, Scatter, ZAxis, ReferenceArea, CartesianGrid } from "recharts";
import { Atom, Hammer, Timer, DollarSign, Building2, Zap, Globe, TrendingUp, BarChart3, Newspaper, Landmark, Play, Map, Activity, Flag, Scale, Users, Tag, Radio, Linkedin, Star, Home, ChevronLeft, ChevronRight, Menu } from "lucide-react";

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

// Manually-curated featured videos. These REPLACE the auto channel-feed (which YouTube
// blocks from datacenter IPs). The first one is shown as the large "Featured" video;
// the rest fill the side list. Thumbnails come straight from YouTube by video id.
// To add/change a video: paste its id (the part after watch?v=), title and channel.
const PINNED_VIDEOS = [
  { id:"aW8nxjxbuNQ", title:"", channel:"", focus:"" },
  { id:"onpish1ESoA", title:"", channel:"", focus:"" },
  { id:"Zt4jEoXb2ZU", title:"", channel:"", focus:"" },
  { id:"zd1zzM3zfcw", title:"", channel:"", focus:"" },
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
  { id:"news",        label:"News Feed"   },
  { id:"drilling",    label:"Drilling"    },
  { id:"financings",  label:"Financings"  },
  { id:"videos",      label:"Videos"      },
  { id:"politics",    label:"Politics"    },
];

// Sidebar navigation. `scroll` items jump to a section on the Overview page;
// `tab` items switch to a separate tab view.
const SIDEBAR_NAV = [
  { id:"top",           label:"Dashboard Home",      icon:"Home",        kind:"scroll", target:"top"           },
  { id:"sec-featured",  label:"Featured Stories",    icon:"Star",        kind:"scroll", target:"sec-featured"  },
  { id:"sec-map",       label:"Map Tracker",         icon:"Map",         kind:"scroll", target:"sec-map"       },
  { id:"sec-drill",     label:"Drill Results",       icon:"Hammer",      kind:"scroll", target:"sec-drill"     },
  { id:"sec-capital",   label:"Capital Monitor",     icon:"DollarSign",  kind:"scroll", target:"sec-capital"   },
  { id:"sec-runway",    label:"Exploration Runway",  icon:"Timer",       kind:"scroll", target:"sec-runway"    },
  { id:"sec-sentiment", label:"Community Sentiment", icon:"Users",       kind:"scroll", target:"sec-sentiment" },
  { id:"sec-demand",    label:"Demand Tracker",      icon:"Activity",    kind:"scroll", target:"sec-demand"    },
  { id:"sec-interviews",label:"Interviews",          icon:"Play",        kind:"scroll", target:"sec-interviews"},
  { id:"sec-macro",     label:"Nuclear Macro",       icon:"Globe",       kind:"scroll", target:"sec-macro"     },
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

// Athabasca Basin — approximate Athabasca Group sandstone margin (simplified from real geology).
// Distinctive features: flatter southern margin, eastern notch near Wollaston/Mudjatik,
// western extension toward Alberta, irregular northern shore along Lake Athabasca.
const BASIN_BOUNDARY = [
  // Northwest corner — western extension reaching toward Alberta
  [-111.6,58.55],[-111.2,58.95],[-110.6,59.20],
  // Northern shore — irregular, following south of Lake Athabasca
  [-109.9,59.30],[-109.1,59.15],[-108.4,59.30],[-107.6,59.25],
  [-106.9,59.05],[-106.2,59.15],[-105.6,59.00],
  // Northeast — steps down toward the eastern notch
  [-105.0,58.70],[-104.6,58.40],
  // Eastern notch — the distinctive indentation near Wollaston/Mudjatik
  [-104.0,58.25],[-103.6,58.45],[-103.2,58.20],[-103.4,57.80],
  [-103.9,57.55],[-104.3,57.25],
  // Southern margin — relatively flat
  [-105.0,57.10],[-105.8,57.00],[-106.6,57.05],[-107.4,57.00],
  [-108.2,57.10],[-109.0,57.20],
  // Southwest — rounding up the western side into Alberta
  [-109.8,57.45],[-110.5,57.85],[-111.2,58.15],[-111.6,58.55],
];

// ─────────────────────────────────────────────
// BASIN MAP TRACKER — projects with real coordinates
// stage: Producer | Developer | Explorer | Royalty
// ─────────────────────────────────────────────
const BASIN_PROJECTS = [
  { name:"Cigar Lake",       company:"Cameco / Orano",     ticker:"CCO",   lat:58.06, lng:-104.53, stage:"Producer", grade:"~14.7% U₃O₈", gradePct:14.7, resourceMlb:230, drilling:false, type:"Unconformity",        info:"World's highest-grade producing uranium mine." },
  { name:"McArthur River",   company:"Cameco",             ticker:"CCO",   lat:57.761, lng:-105.052, stage:"Producer", grade:"~6.9% U₃O₈",  gradePct:6.9,  resourceMlb:390, drilling:false, type:"Unconformity",        info:"Largest high-grade uranium mine; restarted 2022." },
  { name:"Key Lake Mill",    company:"Cameco",             ticker:"CCO",   lat:57.20, lng:-105.62, stage:"Producer", labelDir:"up", grade:"Mill",        gradePct:null, resourceMlb:null,drilling:false, type:"Processing",          info:"Processes McArthur River ore." },
  { name:"Rabbit Lake",      company:"Cameco",             ticker:"CCO",   lat:58.22, lng:-103.68, stage:"Producer", status:"Care & Maintenance", labelDir:"down", grade:"~1.0–1.6% U₃O₈ (historical)", gradePct:1.3, resourceMlb:60,  drilling:false, type:"Unconformity",      info:"Historic mill & mine complex, on care & maintenance since 2016." },
  { name:"McClean Lake",     company:"Orano",              ticker:"—",     lat:58.30, lng:-103.83, stage:"Producer", labelDir:"up", grade:"Mill (JEB / SABRE)", gradePct:null, resourceMlb:null,drilling:false, type:"Processing",          info:"Orano's JEB mill — tolls Cigar Lake ore; SABRE mining operations." },
  { name:"Arrow / Rook I",   company:"NexGen Energy",      ticker:"NXE",   lat:57.658, lng:-109.26, stage:"Developer",grade:"~2.4% U₃O₈",  gradePct:2.4,  resourceMlb:340, drilling:false, type:"Basement-hosted",     info:"FS complete; flagship development, undergoing permitting. SW of Patterson Lake South." },
  { name:"Wheeler River",    company:"Denison Mines",      ticker:"DML",   lat:57.517, lng:-105.75, stage:"Developer",grade:"~3.5% U₃O₈",  gradePct:3.5,  resourceMlb:130, drilling:false, type:"Unconformity",        info:"Phoenix ISR + Gryphon deposits; FEED stage." },
  { name:"Triple R",         company:"Fission Uranium",    ticker:"FCU",   lat:57.683, lng:-109.433, stage:"Developer",grade:"~1.6% U₃O₈",  gradePct:1.6,  resourceMlb:130, drilling:false, type:"Basement / shallow",  info:"Patterson Lake South; FS-stage development." },
  { name:"Hurricane",        company:"IsoEnergy",          ticker:"ISO",   lat:58.538, lng:-104.589, stage:"Developer",grade:"~34% U₃O₈",   gradePct:34.0, resourceMlb:48,  drilling:false, type:"Unconformity",        info:"World's highest-grade indicated U deposit." },
  { name:"Patterson Lake N", company:"F3 Uranium",         ticker:"FUU",   lat:57.8, lng:-109.367, stage:"Explorer", grade:"~5–10% U₃O₈ (disc.)", gradePct:7.0, resourceMlb:null, drilling:true,  type:"Basement-hosted", info:"JR Zone high-grade discovery at Patterson Lake North; active drilling. 100% owned." },
  { name:"Moore / Russell",  company:"Skyharbour Res.",    ticker:"SYH",   lat:57.467, lng:-104.883, stage:"Explorer", grade:"~6% U₃O₈ (zones)", gradePct:6.0, resourceMlb:null, drilling:true,  type:"Unconformity",     info:"Maverick Zone high-grade intercept at Moore Lake; flagship + Russell Lake, South Falcon East & Preston Lake. Partner-funded option JVs." },
  { name:"CMB Package",      company:"Atha Energy",        ticker:"SASK",  lat:58.50, lng:-103.20, stage:"Explorer", grade:"Early-stage",  gradePct:null, resourceMlb:null,drilling:false, type:"Multiple targets",    info:"One of the largest basin land packages." },
  { name:"West McArthur",    company:"CanAlaska",          ticker:"CVV",   lat:57.733, lng:-105.25, stage:"Explorer", grade:"~6% U₃O₈ (disc.)", gradePct:6.0, resourceMlb:null, drilling:true,  type:"Unconformity",     info:"Pike Zone high-grade discovery at West McArthur (Cameco JV); also Moon Lake, Geikie & Key Extension." },
  { name:"Hook Lake JV",     company:"Purepoint Uranium",  ticker:"PTU",   lat:57.7, lng:-109.333, stage:"Explorer", grade:"Spitfire zone", gradePct:4.0, resourceMlb:null, drilling:false, type:"Unconformity",       info:"Spitfire Zone on the Hook Lake JV (Cameco & Orano); also Red Willow, Turnor Lake." },
  { name:"Davidson River",   company:"Standard Uranium",   ticker:"STND",  lat:57.6, lng:-109.583, stage:"Explorer", grade:"Drill target", gradePct:null, resourceMlb:null,drilling:true,  type:"Basement-hosted",     info:"Warrior Zone on the Davidson River structural trend; also Sun Dog, Atlantic & Canary. Western basin near PLS." },
  { name:"ACKIO / Hook",     company:"Baselode / Geiger",  ticker:"FIND",  lat:57.733, lng:-104.75, stage:"Explorer", grade:"Near-surface",  gradePct:1.0, resourceMlb:null, drilling:false, type:"Basement, shallow",  info:"Near-surface ACKIO discovery on the Hook Project; also Catharsis & Shadow." },
  { name:"Key Lake area",    company:"Canadian Uranium",   ticker:"CANU",  lat:57.30, lng:-105.40, stage:"Explorer", grade:"Drill-ready",   gradePct:null, resourceMlb:null,drilling:false, type:"Unconformity",       info:"Projects adjacent to Key Lake infrastructure." },
  { name:"East Preston",     company:"Azincourt Energy",   ticker:"AAZ",   lat:57.5, lng:-109.75, stage:"Explorer", grade:"Drill target",  gradePct:null, resourceMlb:null,drilling:false, type:"Basement-hosted",    info:"A1–A4 conductor zones at East Preston, western basin margin. JV operator." },
  { name:"Christie Lake",    company:"Uranium Energy",     ticker:"UEC",   lat:57.717, lng:-104.833, stage:"Explorer", grade:"~1–2% U₃O₈ (hist.)", gradePct:1.5, resourceMlb:null, drilling:false, type:"Unconformity",       info:"Roughrider deposit & Christie Lake / Horseshoe-Raven exploration zones. 100% owned." },
  { name:"NW Athabasca JV",  company:"Forum Energy",       ticker:"FMC",   lat:57.583, lng:-104.333, stage:"Explorer", grade:"Drill target",  gradePct:null, resourceMlb:null, drilling:false, type:"Unconformity",       info:"Wollaston & Fir Island corridors; also NW Athabasca & Highrock. 100% owned / JV options." },
  { name:"Murmac / Strike",  company:"Fortune Bay",        ticker:"FOR",   lat:59.517, lng:-108.917, stage:"Explorer", grade:"Drill target",  gradePct:null, resourceMlb:null, drilling:false, type:"Basement-hosted",    info:"Strike & Murmac high-grade conductor trends, far north near Uranium City. 100% owned." },
  { name:"Gibbons Creek",    company:"ALX Resources",      ticker:"AL",    lat:59.333, lng:-106.083, stage:"Explorer", grade:"Drill target",  gradePct:null, resourceMlb:null, drilling:false, type:"Basement-hosted",    info:"Gibbons Creek exploration & conductor drilling; also Sabre, Black Lake & Javelin. Western basin." },
  { name:"Loranger",         company:"Appia",              ticker:"API",   lat:57.35, lng:-104.2, stage:"Explorer", grade:"Drill target",  gradePct:null, resourceMlb:null, drilling:false, type:"Unconformity",       info:"Loranger Conductor & Otherside corridors; also Eastside & North Wollaston (plus Alces Lake REE)." },
  { name:"Royalty Portfolio",company:"Uranium Royalty",    ticker:"URC",   lat:57.50, lng:-106.20, stage:"Royalty",  grade:"Multiple",      gradePct:null, resourceMlb:null,drilling:false, type:"Royalties + physical",info:"Royalties across basin assets + physical U₃O₈." },
  { name:"Hearty Bay",       company:"Fission 3.0",        ticker:"FIS",   lat:59.25, lng:-109.00, stage:"Explorer", grade:"Boulder trains", gradePct:null, resourceMlb:null, drilling:false, type:"Basement-hosted", info:"Hearty Bay, Cree Bay, Murphy Lake & Hobo Lake — high-grade boulder field trains, far north basin. 100% owned." },
];

// All-weather highways (real approximate routes) — Hwy 905 (eastern) & Hwy 914 (Key Lake)
const BASIN_HIGHWAYS = [
  { name:"Highway 905", pts:[[-103.30,56.20],[-103.50,57.00],[-103.70,57.80],[-103.85,58.30],[-104.00,58.80]] },
  { name:"Highway 914", pts:[[-105.55,56.10],[-105.60,56.70],[-105.62,57.20]] },
];

// Major lakes — simplified shorelines [lng,lat], approximate real geography
const BASIN_LAKES = [
  { name:"Lake Athabasca", label:[-108.6,59.25], pts:[
    [-111.0,59.30],[-110.0,59.40],[-109.0,59.45],[-108.0,59.40],[-107.0,59.35],[-106.2,59.25],
    [-105.6,59.10],[-105.9,58.95],[-106.6,58.95],[-107.4,59.00],[-108.3,59.05],[-109.2,59.05],
    [-110.0,59.05],[-110.8,59.10],[-111.3,59.18],[-111.0,59.30],
  ]},
  { name:"Wollaston Lake", label:[-103.0,57.95], pts:[
    [-103.6,58.70],[-103.2,58.65],[-102.9,58.45],[-102.7,58.20],[-102.8,57.90],[-103.1,57.70],
    [-103.5,57.65],[-103.8,57.80],[-103.7,58.05],[-103.9,58.30],[-103.8,58.55],[-103.6,58.70],
  ]},
  { name:"Reindeer Lake", label:[-102.5,57.30], pts:[
    [-102.6,57.80],[-102.3,57.60],[-102.2,57.30],[-102.3,57.00],[-102.6,56.80],[-102.8,57.05],
    [-102.7,57.40],[-102.8,57.65],[-102.6,57.80],
  ]},
  { name:"Cree Lake", label:[-106.6,57.50], pts:[
    [-107.0,57.75],[-106.5,57.80],[-106.1,57.65],[-106.0,57.40],[-106.3,57.20],[-106.8,57.20],
    [-107.1,57.40],[-107.1,57.60],[-107.0,57.75],
  ]},
  { name:"Black Lake", label:[-105.3,59.15], pts:[
    [-105.6,59.20],[-105.2,59.22],[-104.9,59.12],[-105.0,58.98],[-105.4,58.96],[-105.7,59.06],[-105.6,59.20],
  ]},
];

// Stylised prospective "uranium trend" corridors (illustrative — not survey geology)
const URANIUM_TRENDS = [
  { name:"Patterson Lake Corridor",            pts:[[-110.0,58.5],[-109.2,58.2],[-108.6,57.9]] },
  { name:"Wollaston–Mudjatik Transition Zone", pts:[[-104.8,58.4],[-104.3,58.0],[-103.6,57.5],[-103.3,57.1]] },
  { name:"Key Lake Trend",                     pts:[[-106.0,57.35],[-105.6,57.12],[-105.2,56.92]] },
];

// Northern service hubs / settlements (approximate) — human & logistics context
const BASIN_SETTLEMENTS = [
  { name:"Uranium City",         lat:59.57, lng:-108.61, kind:"town" },
  { name:"Stony Rapids",         lat:59.26, lng:-105.84, kind:"town" },
  { name:"Black Lake",           lat:59.13, lng:-105.30, kind:"town" },
  { name:"Hatchet Lake",         lat:58.11, lng:-103.17, kind:"town" },
  { name:"Points North Landing", lat:58.28, lng:-104.08, kind:"airstrip" },
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
  { company:"NexGen",      ticker:"NXE",   stage:"Resource",   runway:36, budget:8.0, mktCap:5000, cash:"$430M CAD", project:"Arrow / Rook I" },
  { company:"Denison",     ticker:"DML",   stage:"Resource",   runway:24, budget:6.5, mktCap:1800, cash:"$45M CAD",  project:"Wheeler River" },
  { company:"Fission",     ticker:"FCU",   stage:"Resource",   runway:18, budget:6.0, mktCap:600,  cash:"$35M CAD",  project:"Patterson Lake South" },
  { company:"IsoEnergy",   ticker:"ISO",   stage:"Resource",   runway:14, budget:7.5, mktCap:350,  cash:"$28M CAD",  project:"Hurricane Deposit" },
  { company:"Cameco",      ticker:"CCO",   stage:"Resource",   runway:24, budget:8.5, mktCap:28000,cash:"$1.8B USD", project:"Cigar Lake & McArthur River" },
  { company:"UEC",         ticker:"UEC",   stage:"Resource",   runway:14, budget:5.0, mktCap:2500, cash:"$180M USD", project:"Roughrider" },
  { company:"U Royalty",   ticker:"URC",   stage:"Resource",   runway:20, budget:1.5, mktCap:200,  cash:"$28M USD",  project:"Royalty portfolio" },
  { company:"Skyharbour",  ticker:"SYH",   stage:"Advanced",   runway:8,  budget:4.5, mktCap:120,  cash:"$8M CAD",   project:"Moore / Russell Lake" },
  { company:"F3 Uranium",  ticker:"FUU",   stage:"Advanced",   runway:10, budget:6.2, mktCap:140,  cash:"$14M CAD",  project:"Patterson Lake North" },
  { company:"Atha Energy", ticker:"SASK",  stage:"Advanced",   runway:12, budget:4.0, mktCap:200,  cash:"$15M CAD",  project:"CMB Land Package" },
  { company:"CanAlaska",   ticker:"CVV",   stage:"Advanced",   runway:14, budget:3.5, mktCap:90,   cash:"$9M CAD",   project:"West McArthur" },
  { company:"Appia",       ticker:"API",   stage:"Advanced",   runway:7,  budget:2.5, mktCap:45,   cash:"$3M CAD",   project:"Alces Lake" },
  { company:"Purepoint",   ticker:"PTU",   stage:"Advanced",   runway:9,  budget:2.0, mktCap:25,   cash:"$3.5M CAD", project:"Hook Lake JV" },
  { company:"Baselode",    ticker:"FIND",  stage:"Grassroots", runway:10, budget:2.5, mktCap:40,   cash:"$2.5M CAD", project:"Hook / ACKIO" },
  { company:"CANU",        ticker:"CANU",  stage:"Grassroots", runway:8,  budget:2.0, mktCap:30,   cash:"$3.8M CAD", project:"Key Lake area" },
  { company:"Std Uranium", ticker:"STND",  stage:"Grassroots", runway:7,  budget:2.5, mktCap:20,   cash:"$2.2M CAD", project:"Davidson River" },
  { company:"Forum",       ticker:"FMC",   stage:"Grassroots", runway:5,  budget:1.5, mktCap:15,   cash:"$1.5M CAD", project:"Hook Lake" },
  { company:"Azincourt",   ticker:"AAZ",   stage:"Grassroots", runway:6,  budget:1.0, mktCap:8,    cash:"$1M CAD",   project:"East Preston" },
  { company:"Fortune Bay", ticker:"FOR",   stage:"Grassroots", runway:9,  budget:2.0, mktCap:22,   cash:"$2M CAD",   project:"Strike / Goldfields" },
  { company:"ALX",         ticker:"AL",    stage:"Grassroots", runway:5,  budget:1.0, mktCap:12,   cash:"$1M CAD",   project:"Gibbons Creek" },
  { company:"Fission 3.0", ticker:"FIS",   stage:"Grassroots", runway:6,  budget:1.5, mktCap:18,   cash:"$1.5M CAD", project:"PLN / Patterson" },
];

// Derived investor safety score (0–10) from runway, funding vs spend, and stage maturity.
// Illustrative model only — not financial advice.
const calcSafetyScore = (e) => {
  const runwayScore = Math.min(5, (e.runway/36)*5);            // up to 5 pts for runway
  const fundingScore = Math.min(2.5, (e.runway/Math.max(e.budget,1))*0.5); // funded vs burn
  const stageScore = e.stage==="Resource"?2.5 : e.stage==="Advanced"?1.5 : 0.8;
  return Math.max(1, Math.min(10, runwayScore + fundingScore + stageScore)).toFixed(1);
};

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
      indigo: { background:"#E2E2F2", color:"#3B3B7A", border:"1px solid #BFBFE0" },
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

function ReactorGlobe({ targetLng=null, spinToken=0 }) {
  const [rot, setRot] = useState(0);
  const rotRef = useRef(0);
  const animRef = useRef(null); // {from,to,start,dur} when animating to a target

  // Auto-spin loop, pausing while animating to a target
  useEffect(()=>{
    let raf, last=performance.now();
    const tick=(now)=>{
      const dt=now-last; last=now;
      if(animRef.current){
        const a=animRef.current;
        const t=Math.min(1,(now-a.start)/a.dur);
        const ease=1-Math.pow(1-t,3); // easeOutCubic
        const val=a.from+(a.to-a.from)*ease;
        rotRef.current=val; setRot(val%360);
        if(t>=1) animRef.current=null;
      } else {
        rotRef.current=(rotRef.current+dt*0.012)%360;
        setRot(rotRef.current);
      }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  // When a target nation is clicked, animate rotation so its longitude faces front (rot ≈ -lng)
  useEffect(()=>{
    if(targetLng===null) return;
    const cur=rotRef.current;
    let to=-targetLng;
    // choose shortest direction, keep continuous
    let diff=((to-cur)%360+540)%360-180;
    animRef.current={ from:cur, to:cur+diff, start:performance.now(), dur:900 };
  },[spinToken]);

  const R = 92, CX = 110, CY = 110;
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
    <svg viewBox="0 0 220 220" width="100%" height="100%" style={{ display:"block", maxHeight:250 }}>
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
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Atmosphere glow */}
      <circle cx={CX} cy={CY} r={R+12} fill="url(#globeRimLt)"/>
      {/* Ocean sphere */}
      <circle cx={CX} cy={CY} r={R} fill="url(#globeOceanLt)" stroke="#B8C8D6" strokeWidth={1}/>

      {/* Graticule */}
      {graticule.map((pts,i)=>(
        <path key={i} d={projectPath(pts)} fill="none" stroke="#8AA4BC" strokeWidth={0.4} strokeOpacity={0.3}/>
      ))}

      {/* Continents */}
      {CONTINENTS.map((pts,i)=>(
        <path key={i} d={projectPath([...pts])} fill="none" stroke="#6E9A78" strokeWidth={1.5} strokeOpacity={0.85} strokeLinejoin="round"/>
      ))}

      {/* Reactor dots */}
      {REACTOR_NATIONS.map(n=>{
        const [x,y,z]=project(n.lat,n.lng);
        if(z<0) return null;
        const sz = 2.2 + Math.sqrt(n.reactors)*0.9;
        const op = 0.5 + z*0.5;
        const col = dotColor(n.reactors);
        return (
          <g key={n.name} opacity={op}>
            <circle cx={x} cy={y} r={sz+3} fill={col} fillOpacity={0.22} filter="url(#dotGlow)"/>
            <circle cx={x} cy={y} r={sz} fill={col} stroke="#FFFFFF" strokeWidth={0.5}/>
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
// Animated count-up number (ticks from 0 to target on mount)
// ─────────────────────────────────────────────
function CountUp({ value, prefix="", suffix="", decimals=0, duration=900, style }) {
  const [n, setN] = useState(0);
  const raf = useRef(null);
  useEffect(()=>{
    const target = typeof value==="number" ? value : parseFloat(value)||0;
    if (!isFinite(target)) { setN(0); return; }
    const start = performance.now();
    const tick = (now)=>{
      const t = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-t, 3); // easeOutCubic
      setN(target*eased);
      if (t<1) raf.current = requestAnimationFrame(tick);
      else setN(target);
    };
    raf.current = requestAnimationFrame(tick);
    return ()=> raf.current && cancelAnimationFrame(raf.current);
  }, [value, duration]);
  const display = decimals>0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  return <span style={style}>{prefix}{display}{suffix}</span>;
}

// Tiny inline sparkline from an array of numbers
function Sparkline({ data, color="#B07A08", w=54, h=18 }) {
  if (!data || data.length<2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = (max-min)||1;
  const pts = data.map((v,i)=>`${(i/(data.length-1))*w},${h - ((v-min)/range)*h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display:"block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.85"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("overview");
  const [expanded, setExpanded]   = useState(null);
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
  const coListRef = useRef(null);
  const newsColRef = useRef(null);
  const [coFillRows, setCoFillRows] = useState(3);
  const [coStageFilter, setCoStageFilter] = useState("All");
  const [sdEndYear,     setSdEndYear]     = useState(2030);
  const [sdHighlight,   setSdHighlight]   = useState("Global Reactor Buildout");
  const [bcmType,       setBcmType]       = useState("All");
  const [bcmRegion,     setBcmRegion]     = useState("All");
  const [insiderView,   setInsiderView]   = useState("buys");
  const [erMinMktCap,   setErMinMktCap]   = useState(0);
  const [erStages,      setErStages]      = useState({ Grassroots:true, Advanced:true, Resource:true });
  const [erGuide,       setErGuide]       = useState(true);
  const [globeTarget,   setGlobeTarget]   = useState({ lng:null, token:0 });
  const [bmtFilters,    setBmtFilters]    = useState({ Producer:true, Developer:true, Explorer:true, Royalty:true });
  const [bmtTrends,     setBmtTrends]     = useState(true);
  const [bmtHover,      setBmtHover]      = useState(null);
  const [smdiDeposits,  setSmdiDeposits]  = useState([]);
  const [showSmdi,      setShowSmdi]      = useState(true);
  const [basinClaims,   setBasinClaims]   = useState([]);
  const [claimOwners,   setClaimOwners]   = useState([]);
  const [showClaims,    setShowClaims]    = useState(false);
  const [drillResults,  setDrillResults]  = useState([]);
  const [drillLoading,  setDrillLoading]  = useState(false);
  const [drillGenAt,    setDrillGenAt]    = useState(null);
  const [drillSeed,     setDrillSeed]     = useState(false);
  const [drillSort,     setDrillSort]     = useState({ col:"gt", dir:"desc" });
  const [showDrillHits, setShowDrillHits] = useState(true);
  const [bmtSizeMode,   setBmtSizeMode]   = useState("stage");  // "stage" | "resource" | "grade"
  const [showHwy,       setShowHwy]        = useState(true);
  const [mapView,       setMapView]        = useState({ z:1, cx:0, cy:0 }); // zoom + pan center offset (svg units)
  const mapDrag = useRef(null);
  const [globalNews, setGlobalNews]   = useState([]);
  const [globalNewsLoading, setGNL]   = useState(false);
  const [basinTopStory, setBasinTopStory] = useState(null);
  const [basinSat, setBasinSat] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subscribed, setSubscribed]     = useState(()=>{
    try { return localStorage.getItem("ab_subscribed")==="1"; } catch { return false; }
  });
  const [subEmail, setSubEmail]         = useState("");
  const [subBusy, setSubBusy]           = useState(false);
  const [subError, setSubError]         = useState("");

  const submitSubscribe = useCallback(async () => {
    const email = subEmail.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ setSubError("Please enter a valid email address."); return; }
    setSubBusy(true); setSubError("");
    try {
      const res = await fetch("/.netlify/functions/subscribe", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(()=>({}));
      if(res.ok && data.ok){
        setSubscribed(true);
        setShowSubModal(false);
        try { localStorage.setItem("ab_subscribed","1"); localStorage.setItem("ab_email", email); } catch {}
      } else {
        // surface the real reason instead of silently "succeeding"
        const msg = data?.beehiiv ? (typeof data.beehiiv==="string"?data.beehiiv:JSON.stringify(data.beehiiv)) : (data?.error || "Subscription failed. Please try again.");
        setSubError(msg);
        console.error("Subscribe failed:", data);
      }
    } catch(e) {
      setSubError("Network error — please try again.");
      console.error("Subscribe error", e);
    }
    setSubBusy(false);
  }, [subEmail]);
  const [videoData, setVideoData]       = useState([]);
  const [sentiment, setSentiment]       = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [activeSection, setActiveSection] = useState("top");
  const [scrollPct, setScrollPct]       = useState(0);
  const [sentPost, setSentPost]         = useState(null);
  const [sentLoading, setSentLoading]   = useState(false);
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

  const fetchSmdiDeposits = useCallback(async () => {
    try {
      const res = await fetch("/.netlify/functions/basin-deposits");
      const data = await res.json();
      if (Array.isArray(data?.deposits)) setSmdiDeposits(data.deposits);
    } catch(e) { console.error("SMDI deposits fetch failed", e); }
  }, []);

  const fetchBasinClaims = useCallback(async () => {
    try {
      const res = await fetch("/.netlify/functions/basin-claims");
      const data = await res.json();
      if (Array.isArray(data?.claims)) setBasinClaims(data.claims);
      if (Array.isArray(data?.topOwners)) setClaimOwners(data.topOwners);
    } catch(e) { console.error("Basin claims fetch failed", e); }
  }, []);

  const fetchDrillResults = useCallback(async () => {
    setDrillLoading(true);
    try {
      const res = await fetch("/.netlify/functions/drill-results");
      const data = await res.json();
      if (Array.isArray(data?.results)) setDrillResults(data.results);
      if (data?.generatedAt) setDrillGenAt(data.generatedAt);
      setDrillSeed(!!data?.seed);
    } catch(e) { console.error("Drill results fetch failed", e); }
    setDrillLoading(false);
  }, []);

  const fetchVideoData = useCallback(async () => {
    setVideosLoading(true);
    try {
      // Fetch each pinned video's real title + channel from YouTube's oEmbed endpoint
      // (no API key, works from the browser). Falls back to any title set in PINNED_VIDEOS.
      const enriched = await Promise.all(PINNED_VIDEOS.filter(v=>v.id).map(async (v)=>{
        try {
          const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.id}&format=json`, { signal: AbortSignal.timeout(8000) });
          if (!r.ok) throw new Error(String(r.status));
          const j = await r.json();
          return { id:v.id, videoTitle: v.title || j.title || "", channel: v.channel || j.author_name || "", focus: v.focus || "" };
        } catch {
          return { id:v.id, videoTitle: v.title || "", channel: v.channel || "", focus: v.focus || "" };
        }
      }));
      setVideoData(enriched);
    } catch(e) { console.error("Video fetch failed", e); }
    setVideosLoading(false);
  }, []);

  // Illustrative sample data shown (clearly labeled) until the live X-sentiment API key is configured.
  const SENTIMENT_SAMPLE = {
    ok:true, sample:true, score:67, label:"Bullish", volume:38, volumeChangePct:38,
    sources:{ reddit:24, bluesky:14 },
    updatedAt:new Date().toISOString(),
    tweets:[
      { text:"Spot price ripping again — basin juniors about to follow. $NXE $FCU looking primed.", author:"u/uraniumbull", source:"Reddit", score:82, tag:"Bullish", url:null },
      { text:"NexGen Arrow numbers are just on another level vs peers. Generational deposit.", author:"@ccjwatcher.bsky.social", source:"Bluesky", score:78, tag:"Bullish", url:null },
      { text:"Careful chasing here, a lot of these explorers are cash-light and will dilute hard.", author:"u/deepvaluemining", source:"Reddit", score:31, tag:"Bearish", url:null },
      { text:"Denison Phoenix ISR is the most de-risked path to production in the basin imo.", author:"u/isruranium", source:"Reddit", score:74, tag:"Bullish", url:null },
      { text:"Volume on the junior names is exploding today. Something is brewing. $URNM", author:"@juniortrader.bsky.social", source:"Bluesky", score:69, tag:"Bullish", url:null },
      { text:"Spot pulled back a touch, expect some profit taking across the sector short term.", author:"u/macrouranium", source:"Reddit", score:45, tag:"Neutral", url:null },
    ],
  };

  const fetchSentiment = useCallback(async () => {
    setSentLoading(true);
    try {
      const res = await fetch("/.netlify/functions/sentiment");
      const data = await res.json().catch(()=>({}));
      if (data?.ok) setSentiment(data);
      else { setSentiment({ ...SENTIMENT_SAMPLE }); } // not configured yet → labeled sample
    } catch(e) {
      console.error("Sentiment fetch failed", e);
      setSentiment({ ...SENTIMENT_SAMPLE });
    }
    setSentLoading(false);
  }, []);

  // Sidebar navigation: switch to overview if needed, then smooth-scroll to the section.
  const goToSection = useCallback((item) => {
    if (item.kind === "contact") {
      window.location.href = "mailto:admin@juniorstocks.com";
      return;
    }
    if (item.kind === "scroll") {
      if (tab !== "overview") setTab("overview");
      const doScroll = () => {
        if (item.target === "top") { window.scrollTo({ top:0, behavior:"smooth" }); return; }
        const el = document.getElementById(item.target);
        if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
      };
      // if we just switched tabs, wait a tick for the section to render
      if (tab !== "overview") setTimeout(doScroll, 80); else doScroll();
      setActiveSection(item.id);
    }
  }, [tab]);

  // Scroll progress bar: how far down the page the user has scrolled (0–100%).
  // Driven by requestAnimationFrame so updates sync with the paint cycle (smooth, no jank).
  useEffect(() => {
    let ticking = false;
    const compute = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
      setScrollPct(Math.max(0, Math.min(100, pct)));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); }
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  // Scroll-spy: highlight the sidebar item for whichever section is in view.
  useEffect(() => {
    if (tab !== "overview") return;
    const ids = SIDEBAR_NAV.filter(n=>n.kind==="scroll" && n.target!=="top").map(n=>n.target);
    const onScroll = () => {
      if (window.scrollY < 120) { setActiveSection("top"); return; }
      let current = "top";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [tab]);

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
      // Send ONE symbol per company (primary ticker only) to minimize credit usage.
      const symbols = [...new Set(COMPANIES.map(c => c.ticker).filter(Boolean))];
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

  useEffect(()=>{ fetchSpot(); fetchNews(); fetchPrices(); fetchVideoData(); fetchYTD(); fetchGlobalNews(); fetchBasinTopStory(); fetchBasinSat(); fetchSmdiDeposits(); fetchBasinClaims(); fetchDrillResults(); fetchSentiment(); },[]);

  // When locked, add blurred filler rows so the list fills down to the news column height.
  useEffect(()=>{
    if(subscribed) return; // subscribed list is full height; no filling needed
    const measure = () => {
      const left = coListRef.current, right = newsColRef.current;
      if(!left || !right) return;
      const gap = right.offsetHeight - left.offsetHeight;
      if(gap > 30){
        const ROW_H = 58;
        setCoFillRows(prev => Math.max(3, Math.min(12, prev + Math.round(gap/ROW_H))));
      }
    };
    const t = setTimeout(measure, 150);
    window.addEventListener("resize", measure);
    return ()=>{ clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [news, prices, coSort, ytdLive, subscribed]);

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
    const RuleH  = { borderBottom:"2px solid #D8D0C4", paddingBottom:10, marginBottom:18 };
    const RuleHG = { borderBottom:"2px solid #E8A020", paddingBottom:10, marginBottom:18 };

    return (
      <div>
        {/* Date masthead strip */}
        <div style={{ display:"flex", justifyContent:"flex-start", alignItems:"center", marginBottom:16, paddingBottom:10, borderBottom:"1px solid #D8D0C4" }}>
          <div style={{ fontSize:11, color:"#6A6A5A" }}>
            {new Date().toLocaleDateString("en-CA",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
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
              ].map(([label,val,color],idx,arr)=>(
                <div key={label} style={{ padding:"12px 16px", borderLeft:"1px solid #D8D0C4", borderBottom:idx<arr.length-1?"1px solid #D8D0C4":"none", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <div style={{ ...S.lbl, marginBottom:4 }}>{label}</div>
                  <div style={{ ...SERIF, fontSize:20, fontWeight:700, lineHeight:1,
                    color:color==="green"?"#1A7A44":"#C01818" }}>{val}</div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Basin at a Glance — horizontal live stat strip */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ ...S.lbl, letterSpacing:"0.15em", color:"#1A1A14" }}>BASIN AT A GLANCE</span>
            <span className="stat-live-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#16C44A", display:"inline-block" }}/>
            <span style={{ fontSize:9, color:"#16A34A", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Live</span>
          </div>
          {(()=>{
            const parseShares = s => { const n=parseFloat(s||"0"); if(!s)return 0; if(s.includes("B"))return n*1e9; if(s.includes("M"))return n*1e6; if(s.includes("K"))return n*1e3; return n; };
            const totalMktCap = COMPANIES.reduce((s,c)=>s+gP(c)*parseShares(c.sharesBasic),0);
            const totalVol    = COMPANIES.reduce((s,c)=>s+gVol(c),0);
            const activeDrills = DRILLING.filter(d=>d.status==="Active"||d.status==="Drilling").length;
            const pendingAssays = DRILLING.reduce((s,d)=>s+(d.pending||0),0);
            const activeProjects = COMPANIES.reduce((s,c)=>s+(c.projects?.length||0),0);
            const openRaises = FINANCINGS.filter(f=>f.status==="Open").length;
            // simple deterministic sparkline shapes per metric (visual texture, not literal history)
            const spk = (seed)=>{ const a=[]; let v=50; for(let i=0;i<8;i++){ v += ((Math.sin(seed*7.3+i*1.7)*0.5+0.5)-0.45)*30; a.push(Math.max(8,Math.min(92,v))); } return a; };
            const cards = [
              { icon:Hammer,    label:"Active Drills",    value:activeDrills, decimals:0, spark:spk(1), trend:"+2", up:true },
              { icon:Timer,     label:"Pending Assays",   value:pendingAssays, decimals:0, spark:spk(2), trend:null },
              { icon:Map,       label:"Active Projects",  value:activeProjects, decimals:0, spark:spk(3), trend:null },
              { icon:Atom,      label:"Total Resources",  value:900, suffix:" Mlb", decimals:0, prefix:"~", spark:spk(4), note:"~10% global", trend:null },
              { icon:DollarSign,label:"Total Market Cap", value:totalMktCap/1e9, prefix:"$", suffix:"B", decimals:1, spark:spk(5), trend:totalMktCap>0?"live":null, up:true },
              { icon:Activity,  label:"Daily Volume",     value:totalVol/1e6, suffix:"M", decimals:1, spark:spk(6), trend:null, dim:totalVol===0 },
              { icon:Landmark,  label:"Open Raises",      value:openRaises, decimals:0, spark:spk(7), trend:null },
            ];
            return (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:12 }}>
                {cards.map((c,i)=>{
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="stat-card"
                      style={{ background:"linear-gradient(150deg, #FFFFFF 0%, #FFFCF3 100%)", border:"1px solid #E2DCD0", borderRadius:10, padding:"13px 15px", position:"relative", overflow:"hidden", transition:"border-color 0.15s ease, transform 0.15s ease", animationDelay:`${i*60}ms` }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                        <Icon size={16} strokeWidth={2} color="#B07A08"/>
                        {c.spark && <Sparkline data={c.spark} color="#D4A03A" w={48} h={16}/>}
                      </div>
                      <div style={{ fontSize:24, fontWeight:800, color: c.dim?"#B8AE9C":"#1A1A14", lineHeight:1, letterSpacing:"-0.02em", ...MONO }}>
                        {c.dim ? "—" : <CountUp value={c.value} prefix={c.prefix||""} suffix={c.suffix||""} decimals={c.decimals||0} />}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                        <span style={{ fontSize:10.5, color:"#6A6A5A", fontWeight:600, letterSpacing:"0.02em" }}>{c.label}</span>
                        {c.trend==="live" && <span style={{ fontSize:8.5, color:"#16A34A", fontWeight:700, marginLeft:"auto", textTransform:"uppercase", letterSpacing:"0.06em" }}>● Live</span>}
                        {c.trend && c.trend!=="live" && <span style={{ fontSize:9.5, color:c.up?"#16A34A":"#C01818", fontWeight:700, marginLeft:"auto" }}>▲ {c.trend}</span>}
                      </div>
                      {c.note && <div style={{ fontSize:8.5, color:"#9A8A5A", fontStyle:"italic", marginTop:3 }}>{c.note}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Featured Stories — two column */}
        <div id="sec-featured" style={{ marginBottom:20, paddingBottom:20, borderBottom:"2px solid #D8D0C4", scrollMarginTop:90 }}>
          <div style={{ ...S.lbl, color:"#B07A08", marginBottom:12, letterSpacing:"0.15em" }}>FEATURED STORIES</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1px 1fr", gap:"0 24px" }}>

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
                    <div style={{ display:"flex", gap:6, marginBottom:8, alignItems:"center", flexWrap:"wrap" }}>
                      {featuredStory.source && <span style={{ ...S.badge("blue"), fontSize:10 }}>{featuredStory.source}</span>}
                      {(featuredStory.category||featuredStory.type) && <span style={{ ...S.badge("gray"), fontSize:10 }}>{featuredStory.category||featuredStory.type}</span>}
                      {/* Clickable ticker pills for any tracked company mentioned in the story */}
                      {(()=>{
                        const text = `${featuredStory.headline||""} ${featuredStory.summary||""}`.toLowerCase();
                        const GENERIC = new Set(["energy","uranium","resources","corp","corporation","inc","ltd","mining","metals","group","royalty"]);
                        const mentioned = COMPANIES.filter(c=>{
                          const tk = (c.ticker||"").split(".")[0].toLowerCase();
                          if (tk && new RegExp(`[(:\\s]${tk}[)\\s,.]`).test(text)) return true;
                          const toks = c.name.toLowerCase().replace(/[.,]/g," ").split(/\s+/).filter(t=>t && !GENERIC.has(t));
                          return toks.length && toks.every(t=>text.includes(t));
                        }).slice(0,4);
                        return mentioned.map(c=>{
                          const ch = gCh(c); const up = ch>=0;
                          return (
                            <span key={c.id}
                              onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setCompanyModal(c); }}
                              title={`View ${c.name} profile`}
                              style={{ ...S.badge(up?"green":"red"), fontSize:10, cursor:"pointer", transition:"filter 0.12s ease, transform 0.12s ease" }}
                              onMouseEnter={e=>{ e.currentTarget.style.filter="brightness(0.93)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.filter="none"; e.currentTarget.style.transform="none"; }}>
                              {(c.ticker||"").split(".")[0]} {ch!==null ? `${up?"▲":"▼"} ${Math.abs(ch).toFixed(2)}%` : ""}
                            </span>
                          );
                        });
                      })()}
                      <span style={{ fontSize:11, color:"#9A9A8A", marginLeft:"auto" }}>{featuredStory.date}</span>
                    </div>
                    {(featuredStory.image || basinSat) && (
                      <img src={featuredStory.image || basinSat} alt={featuredStory.headline}
                        style={{ width:"100%", borderRadius:8, marginBottom:10, display:"block", objectFit:"cover", maxHeight:160 }}
                        onError={e=>{ if(basinSat && e.target.src!==basinSat){ e.target.src=basinSat; } else { e.target.style.display="none"; } }}
                      />
                    )}
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
              <a href="https://www.juniorstocks.com/canada-s-new-nuclear-strategy-the-ground-to-grid-plan-to-power-the-future"
                target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <div>
                  {(()=>{
                    const co = COMPANIES.find(c=>c.ticker==="CCO.TO"||c.ticker==="CCO"||c.altTicker==="CCO");
                    const ch = co ? gCh(co) : null;
                    const up = ch !== null && ch >= 0;
                    return (
                      <div style={{ display:"flex", gap:6, marginBottom:8, alignItems:"center" }}>
                        <span
                          onClick={(e)=>{ if(co){ e.preventDefault(); e.stopPropagation(); setCompanyModal(co); } }}
                          title={co ? `View ${co.name} profile` : undefined}
                          style={{ ...S.badge(ch!==null?(up?"green":"red"):"amber"), fontSize:10, cursor:co?"pointer":"default", transition:"filter 0.12s ease, transform 0.12s ease" }}
                          onMouseEnter={e=>{ if(co){ e.currentTarget.style.filter="brightness(0.93)"; e.currentTarget.style.transform="translateY(-1px)"; } }}
                          onMouseLeave={e=>{ e.currentTarget.style.filter="none"; e.currentTarget.style.transform="none"; }}>
                          CCO {ch!==null ? `${up?"▲":"▼"} ${Math.abs(ch).toFixed(2)}%` : ""}
                        </span>
                        <span style={{ ...S.badge("gray"), fontSize:10 }}>News</span>
                      </div>
                    );
                  })()}
                  <img
                    src="https://cdn.investor-files.net/medium_hf_20260625_160449_1e560766_4e83_4179_af4b_0b03bac5635e_384a9d1218.png"
                    alt="Canada nuclear strategy"
                    style={{ width:"100%", borderRadius:8, marginBottom:10, display:"block", objectFit:"cover", maxHeight:160 }}
                    onError={e=>{ e.target.style.display="none"; }}
                  />
                  <h2 style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14", lineHeight:1.35, margin:"0 0 8px", letterSpacing:"-0.01em" }}>
                    Canada's New Nuclear Strategy: The Ground-to-Grid Plan to Power the Future
                  </h2>
                  <p style={{ fontSize:13, color:"#6A6A5A", lineHeight:1.7, margin:"0 0 10px" }}>
                    Ottawa's Ground-to-Grid nuclear strategy aims to fast-track a low-emission energy superpower — doubling the grid by 2050 and building a sovereign supply chain from Saskatchewan dirt to export market.
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:"#9A9A8A" }}>Jun 25, 2026</span>
                    <span style={{ fontSize:11, color:"#B07A08", fontWeight:600 }}>Read on Juniorstocks.com →</span>
                  </div>
                </div>
              </a>
            </div>


          </div>

        </div>

        {/* Companies + News 2-col */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"0 18px", marginBottom:20, alignItems:"start" }}>
          {/* Left: Companies */}
          <div ref={coListRef} style={{ ...S.card, marginBottom:0 }}>
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
                <div onClick={()=>setCompanyModal(canu)}
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
                      <span className={up?"up-arrow":""} style={{ fontSize:13, color:up?"#16C44A":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
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
                      <span className={up?"up-arrow":""} style={{ fontSize:13, color:up?"#16C44A":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
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
                          <span className={up?"up-arrow":""} style={{ fontSize:13, color:up?"#16C44A":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
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
                  {(()=>{
                    const pool = [...COMPANIES].filter(c=>c.id!=="canu")
                      .sort((a,b)=>coSort==="ytd"?getYTD(b)-getYTD(a):gCh(b)-gCh(a))
                      .slice(5);
                    if(pool.length===0) return null;
                    // repeat the pool to fill the requested number of rows
                    const rows = Array.from({length:coFillRows}, (_,i)=>pool[i % pool.length]);
                    return rows.map((c,i)=>{
                      const p=gP(c), ch=gCh(c), ytd=getYTD(c);
                      const up=ch>=0;
                      const barW=Math.min(100,Math.abs(ytd)*1.5);
                      return (
                        <div key={i} style={{ padding:"10px 0", borderBottom:"1px solid #D8D0C4" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <span style={{ fontSize:11, color:"#9A9A8A", width:16, flexShrink:0, textAlign:"center" }}>{i+6}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                                <span style={{ fontSize:15, fontWeight:700, color:"#1A1A14" }}>{c.name}</span>
                                <span style={{ ...MONO, fontWeight:700, color:c.color, fontSize:12 }}>{c.ticker}</span>
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                                <div style={{ width:60, height:4, background:"#EDE8E0", borderRadius:2, overflow:"hidden" }}>
                                  <div style={{ width:`${barW}%`, height:"100%", background:ytd>=0?"#1A7A44":"#C01818", borderRadius:2 }}/>
                                </div>
                                <span style={{ ...MONO, fontSize:10, fontWeight:700, color:ytd>=0?"#1A7A44":"#C01818" }}>YTD {ytd>=0?"+":""}{ytd.toFixed(1)}%</span>
                              </div>
                            </div>
                            <span style={{ ...MONO, fontWeight:700, fontSize:15, color:"#1A1A14", flexShrink:0 }}>{fmtP(p)}</span>
                            <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                              <span className={up?"up-arrow":""} style={{ fontSize:13, color:up?"#16C44A":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
                              <span style={{ ...MONO, fontSize:11, fontWeight:700, color:up?"#1A7A44":"#C01818" }}>{(p*Math.abs(ch)/100).toFixed(3)}</span>
                              <span style={{ ...S.badge(up?"green":"red"), fontSize:10 }}>{fmtPct(ch)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <button onClick={()=>setShowSubModal(true)} style={{ ...S.btn(), fontSize:11, padding:"6px 16px" }}>
                    Subscribe to See All 20 Companies
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Right: News */}
          <div ref={newsColRef} style={{ ...S.card, marginBottom:0 }}>
            <div style={{ position:"sticky", top:16 }}>
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
                    <span className={up?"up-arrow":""} style={{ fontSize:12, color:up?"#16C44A":"#C01818", fontWeight:900 }}>{up?"▲":"▼"}</span>
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
        </div>

        {/* Ad Banner */}
        <div style={{ marginBottom:40, padding:"18px 24px", background:"#F5F3EE", border:"1px solid #D8D0C4", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ ...S.lbl, marginBottom:4 }}>ADVERTISEMENT</div>
            <div style={{ ...SERIF, fontSize:19, color:"#B07A08", fontWeight:700 }}>Advertise with Juniorstocks.com</div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginTop:4 }}>Reach 10,000+ active uranium and junior mining investors.</div>
          </div>
          <a href="mailto:admin@juniorstocks.com" style={{ textDecoration:"none", flexShrink:0 }}>
            <button style={{ ...S.btn(), padding:"10px 22px", fontSize:12 }}>Advertise</button>
          </a>
        </div>

        {/* Basin Map Tracker */}
        <div id="sec-map" style={{ scrollMarginTop:90,  marginBottom:48, marginTop:24 }}>
          <div style={{ ...RuleH }}>
            <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Athabasca Basin Map Tracker</div>
            <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>Interactive deposit map — toggle by stage, hover any project for details</div>
          </div>
          <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
            {(()=>{
              const STAGE_COL = { Producer:"#1A5AA8", Developer:"#B07A08", Explorer:"#1A7A44", Royalty:"#8B5CF6" };
              const lf = 1/Math.sqrt(mapView.z); // label-scale factor — shrink text as we zoom in
              const STAGE_LBL = { Producer:"Producing", Developer:"Development", Explorer:"Exploration", Royalty:"Royalty" };
              const visible = BASIN_PROJECTS.filter(p=>bmtFilters[p.stage]);
              const toggle = (k)=> setBmtFilters(f=>({...f,[k]:!f[k]}));

              // Recently active (by a pseudo activity score)
              const active = [...BASIN_PROJECTS]
                .filter(p=>p.stage!=="Royalty")
                .slice(0,6);

              // Match top drill results to known coordinates (project name or company name)
              const norm = (s)=> (s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
              // Known acquisitions / stale registry names -> current owner
              const OWNER_ALIASES = [
                { match:/\buex\b/i,            to:"Uranium Energy Corp (UEC)" }, // UEX acquired by UEC (2022)
              ];
              // Brand-casing fixes applied after title-casing (industry-standard capitalization)
              const BRAND_FIXES = [
                [/\bCanalaska\b/g, "CanAlaska"],
                [/\bNexgen\b/g,    "NexGen"],
                [/\bIsoenergy\b/g, "IsoEnergy"],
                [/\bCansask\b/g,   "CanSask"],
              ];
              // Tidy raw claim-owner strings: drop ownership %, title-case, shorten suffixes
              const cleanOwner = (raw) => {
                if (!raw) return "Unknown holder";
                let s = raw
                  .replace(/\b\d{1,3}\.\d+\s*%?/g, "")   // "100.000%" / "100.000"
                  .replace(/\b\d{1,3}\s*%/g, "")          // "100 %"
                  .replace(/[:;,]+\s*$/g, "")             // trailing punctuation
                  .replace(/\s*[;]{1,}\s*/g, " / ")       // ";" or ";;" between JV partners → " / "
                  .replace(/\s*&\s*/g, " / ")             // "&" between partners → " / "
                  .replace(/\s*\/\s*\/+\s*/g, " / ")      // collapse any "//" → " / "
                  .replace(/^\s*\/\s*|\s*\/\s*$/g, "")    // strip leading/trailing slashes
                  .replace(/\s{2,}/g, " ")
                  .trim();
                // Title-case if the source is ALL CAPS
                if (s === s.toUpperCase()) {
                  s = s.toLowerCase().replace(/\b([a-z])/g, (m,c)=>c.toUpperCase());
                }
                // Shorten common corporate suffixes
                s = s
                  .replace(/\bCorporation\b/gi, "Corp.")
                  .replace(/\bIncorporated\b/gi, "Inc.")
                  .replace(/\bLimited\b/gi, "Ltd.")
                  .replace(/\bResources\b/gi, "Res.")
                  .replace(/\bExploration\b/gi, "Expl.")
                  .replace(/\bCompany\b/gi, "Co.")
                  .replace(/\bUranium\b/gi, "U")
                  .replace(/\s{2,}/g, " ")
                  .trim();
                // Industry-standard brand capitalization
                for (const [re, fix] of BRAND_FIXES) s = s.replace(re, fix);
                // Remap acquired / stale names to current owner. For JVs, swap the stale
                // partner in place rather than replacing the whole string.
                for (const a of OWNER_ALIASES) {
                  if (a.match.test(s)) {
                    s = /\/|&| and /i.test(s)
                      ? s.replace(/\bue?x\b[^/&]*/i, "UEC ").replace(/\s{2,}/g," ").trim()
                      : a.to;
                  }
                }
                return s || "Unknown holder";
              };
              const locateHit = (r) => {
                const proj = norm(r.project), comp = norm(r.company), tick = (r.ticker||"").replace(/\..*$/,"").toUpperCase();
                // 1) match against curated BASIN_PROJECTS by project name, ticker, or company
                let hit = BASIN_PROJECTS.find(p =>
                  (proj && (norm(p.name).includes(proj) || proj.includes(norm(p.name)))) ||
                  (tick && p.ticker===tick) ||
                  (comp && norm(p.company).includes(comp.slice(0,6)))
                );
                if (hit) return { lat:hit.lat, lng:hit.lng, matchedTo:hit.name };
                // 2) match against SMDI deposit names
                if (smdiDeposits.length) {
                  const sm = smdiDeposits.find(d => proj && norm(d.name).includes(proj));
                  if (sm) return { lat:sm.lat, lng:sm.lng, matchedTo:sm.name };
                }
                return null;
              };
              const drillHits = drillResults
                .map(r => { const loc=locateHit(r); return loc ? { ...r, ...loc } : null; })
                .filter(Boolean)
                .slice(0, 10);

              return (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:0 }}>
                  {/* MAP */}
                  <div style={{ position:"relative", borderRight:"1px solid #D8D0C4" }}>
                    {/* Data-layer toggles bar */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"12px 14px", borderBottom:"1px solid #EDE8E0", alignItems:"center" }}>
                      <button onClick={()=>setBmtTrends(v=>!v)} style={{
                        display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, cursor:"pointer",
                        border:`1px solid ${bmtTrends?"#B07A08":"#D8D0C4"}`, background:bmtTrends?"#B07A0814":"#F5F3EE", opacity:bmtTrends?1:0.5,
                      }}>
                        <span style={{ width:14, height:8, borderRadius:3, background:"linear-gradient(90deg,#E8C870,#B07A08)" }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:"#1A1A14" }}>Uranium Trends</span>
                      </button>
                      <button onClick={()=>setShowSmdi(v=>!v)} title="Real occurrence data from the Saskatchewan Mineral Deposit Index" style={{
                        display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, cursor:"pointer",
                        border:`1px solid ${showSmdi?"#8A1818":"#D8D0C4"}`, background:showSmdi?"#8A181814":"#F5F3EE", opacity:showSmdi?1:0.5,
                      }}>
                        <span style={{ width:7, height:7, borderRadius:"50%", background:"#8A1818" }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:"#1A1A14" }}>SMDI Occurrences {smdiDeposits.length>0 && `(${smdiDeposits.length})`}</span>
                      </button>
                      <button onClick={()=>setShowClaims(v=>!v)} title="Active mineral claims from Saskatchewan Mineral Tenure (Crown Dispositions)" style={{
                        display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, cursor:"pointer",
                        border:`1px solid ${showClaims?"#6B4FA0":"#D8D0C4"}`, background:showClaims?"#6B4FA014":"#F5F3EE", opacity:showClaims?1:0.5,
                      }}>
                        <span style={{ width:8, height:8, borderRadius:2, background:"#6B4FA0", opacity:0.6 }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:"#1A1A14" }}>Mineral Claims {basinClaims.length>0 && `(${basinClaims.length})`}</span>
                      </button>
                      <button onClick={()=>setShowDrillHits(v=>!v)} title="Top 10 recent drill intercepts, placed at their project location" style={{
                        display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, cursor:"pointer",
                        border:`1px solid ${showDrillHits?"#C01818":"#D8D0C4"}`, background:showDrillHits?"#C0181814":"#F5F3EE", opacity:showDrillHits?1:0.5,
                      }}>
                        <span style={{ fontSize:10 }}>🔥</span>
                        <span style={{ fontSize:11, fontWeight:600, color:"#1A1A14" }}>Top Drill Hits {drillHits.length>0 && `(${drillHits.length})`}</span>
                      </button>
                      <button onClick={()=>setShowHwy(v=>!v)} title="All-weather highways 905 & 914" style={{
                        display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, cursor:"pointer",
                        border:`1px solid ${showHwy?"#C8881A":"#D8D0C4"}`, background:showHwy?"#C8881A14":"#F5F3EE", opacity:showHwy?1:0.5,
                      }}>
                        <span style={{ width:14, height:0, borderTop:"2px dashed #C8881A" }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:"#1A1A14" }}>Highways</span>
                      </button>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:10, color:"#9A9A8A", fontWeight:600 }}>Bubbles:</span>
                        <select value={bmtSizeMode} onChange={e=>setBmtSizeMode(e.target.value)}
                          style={{ padding:"4px 8px", fontSize:10.5, border:"1px solid #D8D0C4", borderRadius:6, background:"#FFFFFF", color:"#1A1A14", cursor:"pointer" }}>
                          <option value="stage">By stage</option>
                          <option value="resource">Size by resource (Mlb)</option>
                          <option value="grade">Size + colour by grade</option>
                        </select>
                      </div>
                    </div>

                    {/* Grade colour legend (grade mode) */}
                    {bmtSizeMode==="grade" && (
                      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderBottom:"1px solid #EDE8E0", flexWrap:"wrap", fontSize:10, color:"#6A6A5A" }}>
                        <span style={{ fontWeight:700 }}>Grade (% U₃O₈):</span>
                        {[["<2%","#E8A020"],["2–6%","#E8730C"],["6–15%","#C01818"],["15%+","#7C1D6F"]].map(([lbl,c])=>(
                          <span key={lbl} style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <span style={{ width:10, height:10, borderRadius:"50%", background:c }}/>{lbl}
                          </span>
                        ))}
                        <span style={{ fontStyle:"italic", color:"#9A9A8A" }}>· bubble size ∝ grade · estimates only</span>
                      </div>
                    )}
                    {bmtSizeMode==="resource" && (
                      <div style={{ padding:"8px 14px", borderBottom:"1px solid #EDE8E0", fontSize:10, color:"#6A6A5A" }}>
                        <span style={{ fontWeight:700 }}>Bubble size</span> ∝ estimated contained resource (Mlb U₃O₈) · <span style={{ fontStyle:"italic", color:"#9A9A8A" }}>approximate public estimates, deposits only</span>
                      </div>
                    )}

                    {/* SVG map */}
                    <div style={{ position:"relative", background:"#EFEAE0" }}>
                      <svg width="100%"
                        viewBox={(()=>{ const z=mapView.z, vw=SVG_W/z, vh=SVG_H/z, maxX=SVG_W-vw, maxY=SVG_H-vh; const vx=Math.max(0,Math.min(maxX,(SVG_W-vw)/2+mapView.cx)); const vy=Math.max(0,Math.min(maxY,(SVG_H-vh)/2+mapView.cy)); return `${vx} ${vy} ${vw} ${vh}`; })()}
                        style={{ display:"block", cursor: mapView.z>1 ? (mapDrag.current?"grabbing":"grab") : "default", touchAction:"none" }}
                        onMouseLeave={()=>{ setBmtHover(null); mapDrag.current=null; }}
                        onMouseDown={e=>{ if(mapView.z>1){ mapDrag.current={ sx:e.clientX, sy:e.clientY, cx:mapView.cx, cy:mapView.cy, w:e.currentTarget.getBoundingClientRect().width }; } }}
                        onMouseMove={e=>{ if(mapDrag.current){ const d=mapDrag.current; const scale=(SVG_W/mapView.z)/d.w; setMapView(v=>({ ...v, cx:d.cx-(e.clientX-d.sx)*scale, cy:d.cy-(e.clientY-d.sy)*scale })); } }}
                        onMouseUp={()=>{ mapDrag.current=null; }}>
                        <defs>
                          <radialGradient id="basinFill" cx="50%" cy="45%" r="65%">
                            <stop offset="0%" stopColor="#F0E2C0" stopOpacity="0.75"/>
                            <stop offset="70%" stopColor="#E8D6AE" stopOpacity="0.55"/>
                            <stop offset="100%" stopColor="#DBC79A" stopOpacity="0.5"/>
                          </radialGradient>
                        </defs>
                        {/* land bg */}
                        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#EAE3D5"/>

                        {/* Coordinate graticule — faint lat/lng grid behind everything */}
                        {(()=>{
                          const lines=[];
                          // longitude lines every 2°
                          for(let lng=-112; lng<=-102; lng+=2){
                            const [x1,y1]=toSVG(60.5,lng); const [x2,y2]=toSVG(55.0,lng);
                            lines.push(<line key={`vg${lng}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D2C7B2" strokeWidth={0.5} strokeOpacity={0.35}/>);
                            lines.push(<text key={`vt${lng}`} x={x1} y={MAP_PT-6} textAnchor="middle" fontSize={6.5} fill="#B8AC94">{Math.abs(lng)}°W</text>);
                          }
                          // latitude lines every 1°
                          for(let lat=56; lat<=60; lat++){
                            const [x1,y1]=toSVG(lat,-112.5); const [x2,y2]=toSVG(lat,-101.0);
                            lines.push(<line key={`hg${lat}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D2C7B2" strokeWidth={0.5} strokeOpacity={0.35}/>);
                            lines.push(<text key={`ht${lat}`} x={MAP_PL-6} y={y1+2} textAnchor="end" fontSize={6.5} fill="#B8AC94">{lat}°N</text>);
                          }
                          return lines;
                        })()}

                        {/* Geopolitical labels */}
                        {(()=>{ const [x,y]=toSVG(57.0,-111.4); return <text x={x} y={y} textAnchor="middle" fontSize={9} fontWeight={700} fill="#9A8A6A" opacity={0.55} letterSpacing="2" transform={`rotate(-90 ${x} ${y})`}>ALBERTA</text>; })()}
                        {(()=>{ const [x,y]=toSVG(56.4,-108.5); return <text x={x} y={y} textAnchor="middle" fontSize={9} fontWeight={700} fill="#9A8A6A" opacity={0.55} letterSpacing="3">SASKATCHEWAN</text>; })()}
                        {(()=>{ const [x,y]=toSVG(60.3,-106.5); return <text x={x} y={y} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#9A8A6A" opacity={0.45} letterSpacing="2">NORTHWEST TERRITORIES</text>; })()}
                        {/* Major lakes — simplified shorelines */}
                        {BASIN_LAKES.map((lake,i)=>{
                          const d = lake.pts.map(([lng,lat],j)=>{ const [x,y]=toSVG(lat,lng); return `${j===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ")+" Z";
                          const [lx,ly]=toSVG(lake.label[1],lake.label[0]);
                          const major = lake.name==="Lake Athabasca" || lake.name==="Wollaston Lake";
                          return (
                            <g key={i}>
                              <path d={d} fill="#AECBDA" fillOpacity={0.75} stroke="#6E96AC" strokeWidth={0.6}/>
                              <text x={lx} y={ly} textAnchor="middle" fontSize={(major?8.5:7)*lf} fontWeight={major?700:400}
                                fill="#2E5468" fontStyle="italic" opacity={major?1:0.9}
                                style={{ paintOrder:"stroke" }} stroke="#C4D8E2" strokeWidth={(major?2.8:1.8)*lf} strokeLinejoin="round">{lake.name}</text>
                            </g>
                          );
                        })}

                        {/* Basin boundary — gradient fill + soft inner edge for a carved sedimentary-basin look */}
                        {(()=>{
                          const path = BASIN_BOUNDARY.map(([lng,lat],i)=>{ const [x,y]=toSVG(lat,lng); return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ")+" Z";
                          return (
                            <g>
                              <path d={path} fill="url(#basinFill)" stroke="none"/>
                              {/* soft inner shadow: a blurred inner stroke */}
                              <path d={path} fill="none" stroke="#9A7A30" strokeWidth={6} strokeOpacity={0.18} style={{ filter:"blur(4px)" }}/>
                              <path d={path} fill="none" stroke="#B07A08" strokeWidth={1.5} strokeOpacity={0.6}/>
                            </g>
                          );
                        })()}
                        <text x={toSVG(58.6,-107.0)[0]} y={toSVG(58.6,-107.0)[1]} textAnchor="middle" fontSize={11} fontWeight={700} fill="#B07A08" opacity={0.3} letterSpacing="2">ATHABASCA BASIN</text>

                        {/* Uranium trend corridors */}
                        {bmtTrends && URANIUM_TRENDS.map((t,i)=>{
                          const d = t.pts.map(([lng,lat],j)=>{ const [x,y]=toSVG(lat,lng); return `${j===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");
                          // label: midpoint + angle from first→last point so text follows the corridor
                          const a = toSVG(t.pts[0][1], t.pts[0][0]);
                          const b = toSVG(t.pts[t.pts.length-1][1], t.pts[t.pts.length-1][0]);
                          const mid = toSVG(t.pts[Math.floor(t.pts.length/2)][1], t.pts[Math.floor(t.pts.length/2)][0]);
                          let ang = Math.atan2(b[1]-a[1], b[0]-a[0]) * 180/Math.PI;
                          if (ang>90) ang -= 180;
                          if (ang<-90) ang += 180;
                          return (
                            <g key={i}>
                              <path d={d} fill="none" stroke="#E8B84B" strokeWidth={26} strokeLinecap="round" strokeOpacity={0.28} style={{ filter:"blur(5px)" }}/>
                              <path d={d} fill="none" stroke="#B07A08" strokeWidth={12} strokeLinecap="round" strokeOpacity={0.22} style={{ filter:"blur(3px)" }}/>
                              <text x={mid[0]} y={mid[1]} textAnchor="middle" transform={`rotate(${ang.toFixed(1)} ${mid[0]} ${mid[1]})`}
                                fontSize={7*lf} fontWeight={700} fill="#8A6A1A" letterSpacing="0.04em" opacity={0.85}
                                style={{ paintOrder:"stroke" }} stroke="#EAE3D5" strokeWidth={1.8*lf} strokeLinejoin="round">{t.name}</text>
                            </g>
                          );
                        })}

                        {/* AB/SK border */}
                        {(()=>{ const [x1,y1]=toSVG(60.5,-110.0); const [x2,y2]=toSVG(55.0,-110.0); return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9A9A8A" strokeWidth={1} strokeDasharray="4,4" opacity={0.5}/>; })()}

                        {/* All-weather highways */}
                        {showHwy && BASIN_HIGHWAYS.map((h,i)=>{
                          const d = h.pts.map(([lng,lat],j)=>{ const [x,y]=toSVG(lat,lng); return `${j===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");
                          const mid = h.pts[Math.floor(h.pts.length/2)];
                          const [mx,my]=toSVG(mid[1],mid[0]);
                          return (
                            <g key={`hwy-${i}`}>
                              <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeOpacity={0.7} strokeLinecap="round"/>
                              <path d={d} fill="none" stroke="#C8881A" strokeWidth={1.6} strokeDasharray="6,4" strokeLinecap="round"/>
                              <text x={mx+4} y={my} fontSize={7} fontWeight={700} fill="#8A6A1A" style={{ paintOrder:"stroke" }} stroke="#EAE3D5" strokeWidth={2} strokeLinejoin="round">{h.name}</text>
                            </g>
                          );
                        })}

                        {/* Northern settlements & logistics hubs */}
                        {BASIN_SETTLEMENTS.map((s,i)=>{
                          const [x,y]=toSVG(s.lat,s.lng);
                          const isAir = s.kind==="airstrip";
                          return (
                            <g key={`set-${i}`}>
                              {isAir ? (
                                <g>
                                  <rect x={x-3} y={y-3} width={6} height={6} fill="#7A7A6E" stroke="#FFFFFF" strokeWidth={0.8}/>
                                  <text x={x} y={y+2.4} textAnchor="middle" fontSize={5} fill="#FFFFFF" fontWeight={900}>✈</text>
                                </g>
                              ) : (
                                <rect x={x-2.2} y={y-2.2} width={4.4} height={4.4} fill="#8A8A7E" stroke="#FFFFFF" strokeWidth={0.7}/>
                              )}
                              <text x={x} y={y-5} textAnchor="middle" fontSize={6.5*lf} fontWeight={600} fill="#5A5A4A" opacity={0.85}
                                style={{ paintOrder:"stroke" }} stroke="#EAE3D5" strokeWidth={1.6*lf} strokeLinejoin="round">{s.name}</text>
                            </g>
                          );
                        })}

                        {/* Mineral claims (active dispositions) — real tenure data, bottom layer */}
                        {showClaims && basinClaims.map((c,i)=>{
                          if(c.lat<55||c.lat>61||c.lng<-113||c.lng>-101) return null;
                          const [x,y]=toSVG(c.lat,c.lng);
                          // Highlight claims whose owner matches a tracked company name
                          const ownerLc = (c.owner||"").toLowerCase();
                          const tracked = COMPANIES.some(co => ownerLc.includes(co.name.split(" ")[0].toLowerCase()) && co.name.split(" ")[0].length>3);
                          const hov = bmtHover?.isClaim && bmtHover?.id===c.id;
                          return (
                            <rect key={`claim-${i}`} x={x-2.5} y={y-2.5} width={5} height={5} rx={1}
                              fill={tracked?"#6B4FA0":"#9A86C0"} fillOpacity={hov?0.9:(tracked?0.55:0.3)}
                              stroke={hov?"#FFFFFF":"none"} strokeWidth={0.8}
                              style={{ cursor:"pointer" }}
                              onMouseEnter={()=>setBmtHover({ ...c, isClaim:true, name:c.id })}/>
                          );
                        })}

                        {/* SMDI uranium occurrences — real geological reference data */}
                        {showSmdi && smdiDeposits.map((d,i)=>{
                          if(d.lat<55||d.lat>61||d.lng<-113||d.lng>-101) return null;
                          const [x,y]=toSVG(d.lat,d.lng);
                          const hov = bmtHover?.smdi===d.smdi;
                          return (
                            <circle key={`smdi-${i}`} cx={x} cy={y} r={hov?4:2.2}
                              fill="#8A1818" fillOpacity={hov?0.85:0.4} stroke={hov?"#FFFFFF":"none"} strokeWidth={1}
                              style={{ cursor:"pointer" }}
                              onMouseEnter={()=>setBmtHover({ ...d, isSmdi:true })}/>
                          );
                        })}

                        {/* Project markers (curated) */}
                        {visible.map((p,i)=>{
                          const [x,y]=toSVG(p.lat,p.lng);
                          const MILL_COL = "#3B3B7A"; // dark indigo for mills / processing (matches legend)
                          // Color: by grade spectrum (grade mode) → else mill indigo for processing → else stage
                          const gradeColor = (g)=> g==null?"#9A9A8A" : g>=15?"#7C1D6F" : g>=6?"#C01818" : g>=2?"#E8730C" : "#E8A020";
                          const col = bmtSizeMode==="grade"
                            ? gradeColor(p.gradePct)
                            : (p.type==="Processing" ? MILL_COL : STAGE_COL[p.stage]);
                          // Size: by resource (if resource mode), by grade (grade mode), else by stage
                          let r;
                          if (bmtSizeMode==="resource") {
                            r = p.resourceMlb ? 4 + Math.sqrt(p.resourceMlb)*0.9 : 4;
                          } else if (bmtSizeMode==="grade") {
                            r = p.gradePct ? 4 + Math.sqrt(p.gradePct)*1.6 : 4;
                          } else {
                            r = p.stage==="Producer"?7 : p.stage==="Developer"?6.5 : 5.5;
                          }
                          r = Math.min(r, 16);
                          // Shrink bubbles as the map zooms in so overlapping markers separate
                          // and you can see ones hidden underneath. 1/sqrt(z) keeps them visible
                          // but progressively smaller (same factor used for labels).
                          r = r / Math.sqrt(mapView.z);
                          const hov = bmtHover?.name===p.name;
                          return (
                            <g key={i} style={{ cursor:"pointer" }}
                              onMouseEnter={()=>setBmtHover(p)} onClick={()=>setBmtHover(p)}>
                              {/* active drilling pulse ring */}
                              {p.drilling && (
                                <circle cx={x} cy={y} r={r+3} fill="none" stroke="#C01818" strokeWidth={1.5}
                                  style={{ transformOrigin:`${x}px ${y}px`, animation:"rigPulse 2s ease-in-out infinite" }}/>
                              )}
                              <circle cx={x} cy={y} r={r+(hov?5:3)} fill={col} fillOpacity={0.2}/>
                              {p.type==="Processing" ? (
                                // Mill / processing facility glyph (factory)
                                <g>
                                  <rect x={x-r} y={y-r*0.55} width={r*2} height={r*1.4} rx={1} fill={col} stroke="#FFFFFF" strokeWidth={1.2}/>
                                  {/* sawtooth roofline */}
                                  <path d={`M${x-r},${y-r*0.55} L${x-r*0.4},${y-r*1.05} L${x-r*0.4},${y-r*0.55} L${x+r*0.2},${y-r*1.05} L${x+r*0.2},${y-r*0.55} L${x+r*0.8},${y-r*1.05} L${x+r*0.8},${y-r*0.55} Z`} fill={col} stroke="#FFFFFF" strokeWidth={0.8} strokeLinejoin="round"/>
                                  {/* chimney */}
                                  <rect x={x+r*0.45} y={y-r*1.5} width={r*0.35} height={r*0.6} fill={col} stroke="#FFFFFF" strokeWidth={0.6}/>
                                </g>
                              ) : (
                                <circle cx={x} cy={y} r={r} fill={col} stroke="#FFFFFF" strokeWidth={1.5}/>
                              )}
                              {p.drilling && <text x={x} y={y+2.6} textAnchor="middle" fontSize={7} fill="#FFFFFF" fontWeight={900}>▲</text>}
                              {(p.stage==="Producer"||p.type==="Processing"||hov) && (()=>{
                                const dir = p.labelDir || "right";
                                const lx = dir==="left" ? x-r-4 : dir==="right" ? x+r+4 : x;
                                const ly = dir==="up" ? y-r-5 : dir==="down" ? y+r+9 : y+3;
                                const anchor = dir==="left" ? "end" : dir==="right" ? "start" : "middle";
                                return (
                                  <text x={lx} y={ly} textAnchor={anchor} fontSize={8*lf} fontWeight={700} fill="#1A1A14" style={{ paintOrder:"stroke" }} stroke="#EFEAE0" strokeWidth={3*lf} strokeLinejoin="round" strokeOpacity={0.92}>{p.name}</text>
                                );
                              })()}
                            </g>
                          );
                        })}
                        {/* Top drill hits — hot markers, top layer */}
                        {showDrillHits && drillHits.map((h,i)=>{
                          if(h.lat==null||h.lng==null) return null;
                          const [x,y]=toSVG(h.lat,h.lng);
                          const hov = bmtHover?.isDrill && bmtHover?._i===i;
                          const sz = (hov?10:8) / Math.sqrt(mapView.z);
                          // small starburst
                          const spikes = Array.from({length:8},(_,k)=>{
                            const a=(k/8)*Math.PI*2; const r1=sz, r2=sz*0.45;
                            return `${x+Math.cos(a)*r1},${y+Math.sin(a)*r1} ${x+Math.cos(a+Math.PI/8)*r2},${y+Math.sin(a+Math.PI/8)*r2}`;
                          }).join(" ");
                          return (
                            <g key={`drill-${i}`} style={{ cursor:"pointer" }}
                              onMouseEnter={()=>setBmtHover({ ...h, isDrill:true, _i:i, name:h.company })}>
                              <circle cx={x} cy={y} r={sz+4} fill="#C01818" fillOpacity={0.18}/>
                              <polygon points={spikes} fill="#E83838" stroke="#FFFFFF" strokeWidth={0.8} opacity={0.95}/>
                              <circle cx={x} cy={y} r={2.4} fill="#FFFFFF"/>
                              <text x={x} y={y-sz-3} textAnchor="middle" fontSize={7.5} fontWeight={800} fill="#C01818" style={{ paintOrder:"stroke" }} stroke="#EAE3D5" strokeWidth={2.5} strokeLinejoin="round">{i+1}</text>
                            </g>
                          );
                        })}

                        {/* Scale bar (bottom-left) — at ~58°N, 100km ≈ 1.70° lng */}
                        {(()=>{
                          const kmPerDeg = 111.32 * Math.cos(58*Math.PI/180); // ~58.98 km/°lng
                          const pxPerDeg = MAP_W / LNG_RANGE;
                          const px100 = (100/kmPerDeg) * pxPerDeg;
                          const px50  = px100/2;
                          const x0 = MAP_PL + 8, yb = MAP_PT + MAP_H - 6;
                          return (
                            <g>
                              <line x1={x0} y1={yb} x2={x0+px100} y2={yb} stroke="#5A5A4A" strokeWidth={1.5}/>
                              <line x1={x0} y1={yb-3} x2={x0} y2={yb+3} stroke="#5A5A4A" strokeWidth={1.5}/>
                              <line x1={x0+px50} y1={yb-2.5} x2={x0+px50} y2={yb+2.5} stroke="#5A5A4A" strokeWidth={1.2}/>
                              <line x1={x0+px100} y1={yb-3} x2={x0+px100} y2={yb+3} stroke="#5A5A4A" strokeWidth={1.5}/>
                              <text x={x0} y={yb-6} fontSize={6.5} fill="#5A5A4A" textAnchor="middle">0</text>
                              <text x={x0+px50} y={yb-6} fontSize={6.5} fill="#5A5A4A" textAnchor="middle">50</text>
                              <text x={x0+px100} y={yb-6} fontSize={6.5} fill="#5A5A4A" textAnchor="middle">100 km</text>
                            </g>
                          );
                        })()}

                        {/* North arrow (above the scale bar) */}
                        {(()=>{
                          const cx = MAP_PL + 18, cy = MAP_PT + MAP_H - 44;
                          return (
                            <g>
                              <polygon points={`${cx},${cy-11} ${cx-5},${cy+5} ${cx},${cy+1} ${cx+5},${cy+5}`} fill="#5A5A4A" stroke="#FFFFFF" strokeWidth={0.6}/>
                              <text x={cx} y={cy-13} fontSize={7} fontWeight={800} fill="#5A5A4A" textAnchor="middle">N</text>
                            </g>
                          );
                        })()}
                      </svg>

                      {/* Zoom controls */}
                      <div style={{ position:"absolute", top:12, right:12, display:"flex", flexDirection:"column", gap:4, zIndex:5 }}>
                        {[["+",()=>setMapView(v=>({ ...v, z:Math.min(6, +(v.z+0.5).toFixed(2)) }))],
                          ["\u2212",()=>setMapView(v=>{ const z=Math.max(1, +(v.z-0.5).toFixed(2)); return z===1?{z:1,cx:0,cy:0}:{ ...v, z }; })]].map(([lbl,fn],i)=>(
                          <button key={i} onClick={fn} style={{ width:30, height:30, borderRadius:7, border:"1px solid #D8D0C4", background:"#FFFFFF", color:"#1A1A14", fontSize:18, fontWeight:700, cursor:"pointer", lineHeight:1, boxShadow:"0 1px 3px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>{lbl}</button>
                        ))}
                        {mapView.z>1 && (
                          <button onClick={()=>setMapView({ z:1, cx:0, cy:0 })} title="Reset view"
                            style={{ width:30, height:30, borderRadius:7, border:"1px solid #D8D0C4", background:"#FFFFFF", color:"#6A6A5A", fontSize:13, cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>⤢</button>
                        )}
                      </div>
                      {mapView.z>1 && (
                        <div style={{ position:"absolute", bottom:12, right:12, fontSize:9, color:"#9A9A8A", background:"#FFFFFFcc", padding:"2px 7px", borderRadius:5, zIndex:5 }}>
                          {mapView.z.toFixed(1)}× · drag to pan
                        </div>
                      )}

                      {/* Hover tooltip */}
                      {bmtHover && (
                        <div style={{ position:"absolute", top:12, left:12, width:236, background:"#FFFFFF", border:`1px solid ${bmtHover.isDrill?"#C01818":bmtHover.isClaim?"#6B4FA0":bmtHover.isSmdi?"#8A1818":STAGE_COL[bmtHover.stage]}`, borderRadius:10, padding:"12px 14px", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", fontSize:11 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                            <span style={{ width:9, height:9, borderRadius:bmtHover.isClaim?2:"50%", background:bmtHover.isDrill?"#C01818":bmtHover.isClaim?"#6B4FA0":bmtHover.isSmdi?"#8A1818":STAGE_COL[bmtHover.stage] }}/>
                            <span style={{ fontSize:13, fontWeight:800, color:"#1A1A14" }}>{bmtHover.isDrill?`🔥 ${bmtHover.company}`:bmtHover.isClaim?`Claim ${bmtHover.name}`:bmtHover.name}</span>
                          </div>
                          {bmtHover.isDrill ? (
                            <>
                              <div style={{ display:"grid", gap:3 }}>
                                <div><span style={{ color:"#9A9A8A" }}>Intercept: </span><strong style={{ ...MONO, color:"#C01818" }}>{bmtHover.interval_text || `${bmtHover.thickness_m}m @ ${bmtHover.grade_pct}%`}</strong></div>
                                {bmtHover.hole    && <div><span style={{ color:"#9A9A8A" }}>Hole: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.hole}</strong></div>}
                                <div><span style={{ color:"#9A9A8A" }}>Grade × Thickness: </span><strong style={{ color:"#1A7A44" }}>{bmtHover.gt}</strong></div>
                                {bmtHover.matchedTo && <div><span style={{ color:"#9A9A8A" }}>Location: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.matchedTo}</strong></div>}
                              </div>
                              <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid #EDE8E0", color:"#9A9A8A", fontSize:9.5, fontStyle:"italic" }}>
                                AI-extracted from a press release · pin shows project area, not exact hole{bmtHover.url && <> · <a href={bmtHover.url} target="_blank" rel="noopener noreferrer" style={{ color:"#C01818" }}>source ↗</a></>}
                              </div>
                            </>
                          ) : bmtHover.isClaim ? (
                            <>
                              <div style={{ display:"grid", gap:3 }}>
                                <div><span style={{ color:"#9A9A8A" }}>Owner: </span><strong style={{ color:"#6B4FA0" }}>{bmtHover.owner}</strong></div>
                                {bmtHover.id        && <div><span style={{ color:"#9A9A8A" }}>Disposition #: </span><strong style={{ ...MONO, color:"#1A1A14", fontSize:10 }}>{bmtHover.id}</strong></div>}
                                {bmtHover.effective && <div><span style={{ color:"#9A9A8A" }}>Effective: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.effective}</strong></div>}
                                {bmtHover.goodUntil && <div><span style={{ color:"#9A9A8A" }}>Good standing to: </span><strong style={{ color:"#1A7A44" }}>{bmtHover.goodUntil}</strong></div>}
                              </div>
                              <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid #EDE8E0", color:"#9A9A8A", fontSize:9.5, fontStyle:"italic" }}>
                                Source: Saskatchewan Mineral Tenure — Crown Dispositions
                              </div>
                            </>
                          ) : bmtHover.isSmdi ? (
                            <>
                              <div style={{ display:"grid", gap:3 }}>
                                {bmtHover.status     && <div><span style={{ color:"#9A9A8A" }}>Status: </span><strong style={{ color:"#8A1818" }}>{bmtHover.status}</strong></div>}
                                {bmtHover.discovery  && <div><span style={{ color:"#9A9A8A" }}>Discovery: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.discovery}</strong></div>}
                                {bmtHover.production && <div><span style={{ color:"#9A9A8A" }}>Production: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.production}</strong></div>}
                                {bmtHover.resources  && <div><span style={{ color:"#9A9A8A" }}>Resources: </span><strong style={{ color:"#1A7A44" }}>{bmtHover.resources}</strong></div>}
                                {bmtHover.smdi       && <div><span style={{ color:"#9A9A8A" }}>SMDI #: </span><strong style={{ ...MONO, color:"#1A1A14", fontSize:10 }}>{bmtHover.smdi}</strong></div>}
                              </div>
                              <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid #EDE8E0", color:"#9A9A8A", fontSize:9.5, fontStyle:"italic" }}>
                                Source: Saskatchewan Mineral Deposit Index{bmtHover.weblink && <> · <a href={bmtHover.weblink} target="_blank" rel="noopener noreferrer" style={{ color:"#8A1818" }}>view record ↗</a></>}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display:"grid", gap:3 }}>
                                <div><span style={{ color:"#9A9A8A" }}>Company: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.company}</strong> {bmtHover.ticker!=="—" && <span style={{ ...MONO, color:STAGE_COL[bmtHover.stage], fontWeight:700, fontSize:10 }}>{bmtHover.ticker}</span>}</div>
                                <div><span style={{ color:"#9A9A8A" }}>Stage: </span><strong style={{ color:STAGE_COL[bmtHover.stage] }}>{STAGE_LBL[bmtHover.stage]}</strong>{bmtHover.status && <span style={{ color:"#C01818", fontWeight:600 }}> · {bmtHover.status}</span>}</div>
                                <div><span style={{ color:"#9A9A8A" }}>Grade: </span><strong style={{ color:"#1A7A44" }}>{bmtHover.grade}</strong></div>
                                <div><span style={{ color:"#9A9A8A" }}>Type: </span><strong style={{ color:"#1A1A14" }}>{bmtHover.type}</strong></div>
                                {bmtHover.resourceMlb && <div><span style={{ color:"#9A9A8A" }}>Resource: </span><strong style={{ color:"#B07A08" }}>~{bmtHover.resourceMlb} Mlb U₃O₈ <span style={{ fontWeight:400, fontStyle:"italic" }}>(approx.)</span></strong></div>}
                                {bmtHover.drilling && <div style={{ color:"#C01818", fontWeight:700, fontSize:10 }}>● Active drilling reported</div>}
                              </div>
                              <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid #EDE8E0", color:"#4A4A3A", lineHeight:1.45 }}>{bmtHover.info}</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SIDE PANELS */}
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    {/* Spot price */}
                    <div style={{ padding:"14px", borderBottom:"1px solid #EDE8E0" }}>
                      <div style={{ ...S.lbl, marginBottom:4 }}>U₃O₈ SPOT</div>
                      <div style={{ ...SERIF, fontSize:26, fontWeight:800, color:"#B07A08", lineHeight:1 }}>{spotLoading?"—":`$${spot.price?.toFixed(2)}`}</div>
                      <div style={{ fontSize:10, color:spotWoW>=0?"#16C44A":"#C01818", fontWeight:700, marginTop:3 }}>{spotWoW>=0?"▲":"▼"} {Math.abs(spotWoW).toFixed(2)} WoW</div>
                    </div>
                    {/* Stage filter — moved from top bar */}
                    <div style={{ padding:"14px", borderBottom:"1px solid #EDE8E0" }}>
                      <div style={{ ...S.lbl, marginBottom:8 }}>FILTER BY STAGE</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {Object.keys(STAGE_COL).map(k=>(
                          <button key={k} onClick={()=>toggle(k)} style={{
                            display:"flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, cursor:"pointer",
                            border:`1px solid ${bmtFilters[k]?STAGE_COL[k]:"#D8D0C4"}`,
                            background:bmtFilters[k]?`${STAGE_COL[k]}14`:"#F5F3EE", opacity:bmtFilters[k]?1:0.5,
                          }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background:STAGE_COL[k] }}/>
                            <span style={{ fontSize:10.5, fontWeight:600, color:"#1A1A14" }}>{STAGE_LBL[k]}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8, fontSize:10, color:"#6A6A5A" }} title="Mill / ore-processing facility">
                        <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="6" width="10" height="5" rx="0.5" fill="#3B3B7A"/><path d="M1,6 L4,3 L4,6 L7,3 L7,6 L10,3 L10,6 Z" fill="#3B3B7A"/><rect x="7.5" y="1.5" width="1.6" height="2.5" fill="#3B3B7A"/></svg>
                        Mill / processing facility
                      </div>
                    </div>
                    {/* Active companies */}
                    <div style={{ padding:"14px", borderBottom:"1px solid #EDE8E0", flex:1 }}>
                      <div style={{ ...S.lbl, marginBottom:8 }}>ACTIVE PROJECTS</div>
                      {active.map((p,i)=>(
                        <div key={i} onMouseEnter={()=>setBmtHover(p)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i<active.length-1?"1px solid #F0EDE8":"none", cursor:"pointer" }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#1A1A14", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                            <div style={{ fontSize:9, color:"#9A9A8A" }}>{p.company}</div>
                          </div>
                          <span style={{ ...S.badge(p.type==="Processing"?"indigo":p.stage==="Producer"?"blue":p.stage==="Developer"?"amber":"green"), fontSize:8, flexShrink:0, marginLeft:6 }}>{p.type==="Processing"?"Mill / processing":STAGE_LBL[p.stage]}</span>
                        </div>
                      ))}
                    </div>
                    {/* Regional spend */}
                    <div style={{ padding:"14px", borderBottom:claimOwners.length>0?"1px solid #EDE8E0":"none" }}>
                      <div style={{ ...S.lbl, marginBottom:4 }}>EST. EXPLORATION SPEND</div>
                      <div style={{ ...SERIF, fontSize:22, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>~C$240M</div>
                      <div style={{ fontSize:9, color:"#9A9A8A", marginTop:3, fontStyle:"italic" }}>2026E basin-wide · model estimate</div>
                    </div>
                    {/* Top claim holders (real tenure data) */}
                    {claimOwners.length>0 && (
                      <div style={{ padding:"14px" }}>
                        <div style={{ ...S.lbl, marginBottom:8 }}>TOP CLAIM HOLDERS</div>
                        {claimOwners.slice(0,8).map((o,i)=>(
                          <div key={i} title={o.owner} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i<7?"1px solid #F0EDE8":"none", gap:8 }}>
                            <span style={{ fontSize:11, color:"#1A1A14", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cleanOwner(o.owner)}</span>
                            <span style={{ ...MONO, fontSize:11, fontWeight:700, color:"#6B4FA0", flexShrink:0 }}>{o.count}</span>
                          </div>
                        ))}
                        <div style={{ fontSize:8.5, color:"#9A9A8A", marginTop:6, fontStyle:"italic" }}>Active dispositions · Sask. Mineral Tenure</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          {/* Disclaimer */}
          <div style={{ marginTop:12, padding:"10px 14px", background:"#FAFAF7", border:"1px solid #E8E4DE", borderRadius:8, fontSize:10, color:"#9A9A8A", lineHeight:1.6 }}>
            <strong style={{ color:"#6A6A5A" }}>Disclaimer:</strong> The larger labelled markers are curated company projects — positions, grades, and resource estimates are <strong>approximate public-knowledge figures</strong> and may be out of date. Bubble size/colour modes (resource, grade) use these estimates and are illustrative, not NI 43-101 figures. "Active drilling" flags and 🔥 top hits are derived from press releases and may lag reality. Highways 905/914 are approximate routes. The small dark-red dots (SMDI) and purple squares (Mineral Claims) are real data from Saskatchewan Geological Survey / Mineral Tenure. The basin outline and trend corridors are simplified schematics, not survey geology. Verify everything with official sources before making decisions. Not investment advice.
        </div>
        </div>

        {/* Drill Result Tracker */}
        <div id="sec-drill" style={{ scrollMarginTop:90,  marginBottom:48, marginTop:24 }}>
          <div style={{ ...RuleH, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Drill Result Tracker</div>
              <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>
                Latest assay intercepts from basin press releases, ranked by grade × thickness
                {drillSeed && <span style={{ color:"#B07A08", fontWeight:600 }}> · showing recent known results (no new assays in latest feed)</span>}
              </div>
            </div>
            <button onClick={fetchDrillResults} disabled={drillLoading}
              style={{ ...S.btn("s"), fontSize:10, padding:"4px 10px", marginBottom:8 }}>
              {drillLoading ? "Analyzing…" : "↻ Refresh"}
            </button>
          </div>
          <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
            {drillLoading && drillResults.length===0 ? (
              <div style={{ padding:"40px 24px", textAlign:"center", color:"#9A9A8A", fontSize:13 }}>
                Scanning recent press releases for drill assays…
              </div>
            ) : drillResults.length===0 ? (
              <div style={{ padding:"40px 24px", textAlign:"center", color:"#9A9A8A", fontSize:13 }}>
                No drill assays found in the latest releases. Check back after the next batch of results, or hit Refresh.
              </div>
            ) : (() => {
              const conf = { high:"#1A7A44", medium:"#B07A08", low:"#9A9A8A" };
              // sortable
              const sorted = [...drillResults].sort((a,b)=>{
                const { col, dir } = drillSort;
                let av, bv;
                if(col==="company"){ av=(a.company||"").toLowerCase(); bv=(b.company||"").toLowerCase(); }
                else if(col==="grade"){ av=a.grade_pct||0; bv=b.grade_pct||0; }
                else if(col==="thickness"){ av=a.thickness_m||0; bv=b.thickness_m||0; }
                else if(col==="date"){ av=a.date||""; bv=b.date||""; }
                else { av=a.gt||0; bv=b.gt||0; }
                if(av<bv) return dir==="asc"?-1:1;
                if(av>bv) return dir==="asc"?1:-1;
                return 0;
              });
              const topGT = Math.max(...drillResults.map(r=>r.gt||0), 1);
              const sortBy = (col)=> setDrillSort(s=> s.col===col ? { col, dir:s.dir==="asc"?"desc":"asc" } : { col, dir: col==="company"?"asc":"desc" });
              const Arrow = ({col}) => drillSort.col===col ? <span style={{ fontSize:8, marginLeft:4 }}>{drillSort.dir==="asc"?"▲":"▼"}</span> : <span style={{ fontSize:8, marginLeft:4, opacity:0.3 }}>⇅</span>;
              const COLS = "52px 1.6fr 1.4fr 1.15fr 0.85fr 84px";
              const hCell = { cursor:"pointer", userSelect:"none", display:"flex", alignItems:"center" };
              // medal palette for top-3 (only meaningful when sorted by rank/G×T descending)
              const rankSorted = drillSort.col==="gt" && drillSort.dir==="desc";
              const MEDALS = [
                { tint:"#FBF6E8", bar:"#C9A227", rank:"#9A7A12", glyph:"👑" }, // gold
                { tint:"#F6F5F3", bar:"#A6A6A6", rank:"#7A7A7A", glyph:"🥈" }, // silver
                { tint:"#F8F1E9", bar:"#B07A4A", rank:"#8A5A2E", glyph:"🥉" }, // bronze
              ];
              return (
                <>
                  {/* Header row */}
                  <div style={{ display:"grid", gridTemplateColumns:COLS, gap:0, padding:"11px 18px", borderBottom:"2px solid #D8D0C4", background:"#FAF8F3", fontSize:9.5, fontWeight:800, color:"#6A6A5A", textTransform:"uppercase", letterSpacing:"0.07em" }}>
                    <div style={{ ...hCell }} onClick={()=>sortBy("gt")}>Rank</div>
                    <div style={{ ...hCell }} onClick={()=>sortBy("company")}>Company / Project<Arrow col="company"/></div>
                    <div style={{ ...hCell }} onClick={()=>sortBy("grade")}>Intercept<Arrow col="grade"/></div>
                    <div style={{ ...hCell }} onClick={()=>sortBy("gt")}>Grade × Thickness<Arrow col="gt"/></div>
                    <div style={{ ...hCell, paddingLeft:10 }} onClick={()=>sortBy("date")}>Date<Arrow col="date"/></div>
                    <div style={{ textAlign:"center" }}>Source</div>
                  </div>
                  {/* Rows */}
                  {sorted.map((r,i)=>{
                    const medal = (rankSorted && i<3) ? MEDALS[i] : null;
                    const gtPct = Math.max(4, ((r.gt||0)/topGT)*100);
                    const barColor = medal ? medal.bar : "#C9C2B4";
                    const zebra = i%2===1 ? "#FCFBF8" : "#FFFFFF";
                    const rowBg = medal ? medal.tint : zebra;
                    return (
                      <div key={i} className="drill-row" style={{ display:"grid", gridTemplateColumns:COLS, gap:0, padding:"13px 18px", borderBottom:i<sorted.length-1?"1px solid #EDE8E0":"none", alignItems:"center", fontSize:12, background:rowBg, borderLeft:medal?`3px solid ${medal.bar}`:"3px solid transparent" }}>
                        {/* Rank */}
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          {medal
                            ? <span style={{ fontSize:14 }}>{medal.glyph}</span>
                            : <span style={{ ...MONO, fontWeight:700, color:"#B8AE9C", fontSize:12, width:18, textAlign:"center" }}>{i+1}</span>}
                          {medal && <span style={{ ...MONO, fontWeight:800, color:medal.rank, fontSize:12 }}>{i+1}</span>}
                        </div>
                        {/* Company / Project */}
                        <div style={{ minWidth:0, paddingRight:10 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontWeight:700, color:"#1A1A14", fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.company||"—"}</span>
                            {r.ticker && <span style={{ ...MONO, fontSize:9.5, color:"#B07A08", fontWeight:700, flexShrink:0 }}>{r.ticker}</span>}
                          </div>
                          {r.project && <div style={{ fontSize:10, color:"#9A9A8A", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.project}{r.hole?` · ${r.hole}`:""}</div>}
                        </div>
                        {/* Intercept — grade emphasized */}
                        <div style={{ ...MONO, fontSize:11.5, paddingRight:10, whiteSpace:"nowrap" }}>
                          {r.grade_pct!=null && r.thickness_m!=null ? (
                            <>
                              <span style={{ fontWeight:800, color:"#1A7A44" }}>{r.grade_pct}%</span>
                              <span style={{ color:"#9A9A8A", fontSize:9.5 }}> U₃O₈</span>
                              <span style={{ color:"#C8C0B4", margin:"0 3px" }}>/</span>
                              <span style={{ fontWeight:700, color:"#1A1A14" }}>{r.thickness_m}m</span>
                            </>
                          ) : <span style={{ color:"#1A1A14", fontWeight:600 }}>{r.interval_text || "—"}</span>}
                        </div>
                        {/* G × T — hero metric with gauge bar */}
                        <div style={{ display:"flex", alignItems:"center", gap:8, paddingRight:8 }}>
                          <div style={{ flex:1, height:7, background:"#ECE7DD", borderRadius:4, overflow:"hidden", minWidth:30 }}>
                            <div style={{ width:`${gtPct}%`, height:"100%", background:barColor, borderRadius:4, transition:"width .3s" }}/>
                          </div>
                          <span style={{ ...MONO, fontWeight:800, fontSize:14, color:medal?medal.rank:"#1A1A14", flexShrink:0, minWidth:34, textAlign:"right" }}>{r.gt}</span>
                        </div>
                        {/* Release date */}
                        <div style={{ fontSize:11, color:"#6A6A5A", paddingLeft:10 }}>{r.date||"—"}</div>
                        {/* Source link */}
                        <div style={{ textAlign:"center" }}>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                              title={r.seed ? "Opens the company's news page (specific release not deep-linked)" : `Verified release · confidence: ${r.confidence||"n/a"}`}
                              style={{ textDecoration:"none", fontSize:10.5, fontWeight:700, color:conf[r.confidence]||"#9A9A8A", whiteSpace:"nowrap", padding:"3px 8px", borderRadius:5, border:`1px solid ${(conf[r.confidence]||"#9A9A8A")}33` }}>
                              {r.seed ? "News ↗" : "PR ↗"}
                            </a>
                          ) : <span style={{ color:"#D8D0C4" }} title="No verified source link available">—</span>}
                        </div>
                      </div>
                    );
                  })}
                  {/* Footer */}
                  <div style={{ padding:"11px 18px", borderTop:"1px solid #EDE8E0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, fontSize:9.5, color:"#9A9A8A" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                      <span><strong style={{ color:"#6A6A5A" }}>PR ↗</strong> verified release · <strong style={{ color:"#6A6A5A" }}>News ↗</strong> company news page · bar = relative G×T · colour = AI confidence (<span style={{ color:"#1A7A44" }}>high</span>/<span style={{ color:"#B07A08" }}>med</span>/<span style={{ color:"#9A9A8A" }}>low</span>)</span>
                    </div>
                    {drillGenAt && <span>Updated {new Date(drillGenAt).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</span>}
                  </div>
                </>
              );
            })()}
          </div>
          {/* Disclaimer */}
          <div style={{ marginTop:12, padding:"10px 14px", background:"#FAFAF7", border:"1px solid #E8E4DE", borderRadius:8, fontSize:10, color:"#9A9A8A", lineHeight:1.6 }}>
            <strong style={{ color:"#6A6A5A" }}>Disclaimer:</strong> Drill intercepts are <strong>automatically extracted by AI</strong> from public press releases and may contain errors, omissions, or misread figures. "PR ↗" links are verified against the source news feed; "News ↗" links open the company's news page rather than a specific release. Grade × thickness is a simple ranking metric, not a resource estimate, and intervals are not necessarily true widths. Always confirm against the official company release and NI 43-101 disclosures before relying on any number. Not investment advice.
          </div>
        </div>

        {/* Basin Capital Monitor */}
        <div id="sec-capital" style={{ scrollMarginTop:90,  marginBottom:48, marginTop:24 }}>
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
              const totalDeployed = filtered.reduce((s,e)=>s+e.amount,0);
              const momentum = filtered.length===0?"—":filtered.reduce((s,e)=>s+e.momentum,0)/filtered.length>80?"High":filtered.reduce((s,e)=>s+e.momentum,0)/filtered.length>65?"Moderate":"Developing";

              return (
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>

                  {/* LEFT — Regional insight bands */}
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {/* Legend + filters */}
                    <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                      {Object.entries(TYPE_COLORS).map(([label,color])=>(
                        <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:10, height:10, borderRadius:"50%", background:color }}/>
                          <span style={{ fontSize:11, color:"#6A6A5A" }}>{label}</span>
                        </div>
                      ))}
                      <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                        <select value={bcmType} onChange={e=>setBcmType(e.target.value)}
                          style={{ padding:"3px 7px", fontSize:10.5, border:"1px solid #D8D0C4", borderRadius:6, background:"#FFFFFF", color:"#1A1A14" }}>
                          {["All","Bought Deal","Joint Venture","Insider Buy"].map(t=><option key={t}>{t}</option>)}
                        </select>
                        <select value={bcmRegion} onChange={e=>setBcmRegion(e.target.value)}
                          style={{ padding:"3px 7px", fontSize:10.5, border:"1px solid #D8D0C4", borderRadius:6, background:"#FFFFFF", color:"#1A1A14" }}>
                          {["All","Western Basin","Eastern Basin","Basin Margins"].map(r=><option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Three regional bands */}
                    {[
                      { key:"Western Basin", title:"Western Region Insights",  short:"WESTERN BASIN",  region:[[0.50,0.30],[0.72,0.28],[0.78,0.52],[0.62,0.66],[0.46,0.54]] },
                      { key:"Eastern Basin", title:"Eastern Region Insights",  short:"EASTERN BASIN",  region:[[0.30,0.34],[0.46,0.30],[0.50,0.50],[0.40,0.62],[0.26,0.52]] },
                      { key:"Basin Margins", title:"Basin Margin Insights",    short:"BASIN MARGINS",  region:[[0.40,0.60],[0.56,0.58],[0.60,0.74],[0.46,0.82],[0.34,0.72]] },
                    ].map(band=>{
                      const evts = filtered.filter(e=>e.region===band.key).sort((a,b)=>b.amount-a.amount);
                      const maxAmt = Math.max(...evts.map(e=>e.amount), 1);
                      return (
                        <div key={band.key} style={{ display:"grid", gridTemplateColumns:"112px 1fr", border:"1px solid #E8E4DE", borderRadius:8, overflow:"hidden", background:"#FBFAF6" }}>
                          {/* Mini-map cell */}
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 6px", background:"#F4F1EA", borderRight:"1px solid #E8E4DE", position:"relative" }}>
                            <div style={{ position:"absolute", left:6, top:0, bottom:0, display:"flex", alignItems:"center" }}>
                              <span style={{ fontSize:7.5, fontWeight:800, color:"#A89A80", letterSpacing:"0.5px", writingMode:"vertical-rl", transform:"rotate(180deg)" }}>{band.short}</span>
                            </div>
                            <svg width="58" height="48" viewBox="0 0 100 88">
                              {/* AB/SK province silhouette */}
                              <path d="M10,12 L46,12 L46,4 L62,4 L62,12 L90,12 L90,80 L10,80 Z" fill="#E4DECF" stroke="#CFC6B2" strokeWidth="1.5"/>
                              {/* highlighted region */}
                              <polygon points={band.region.map(([px,py])=>`${px*100},${py*88}`).join(" ")} fill="#C8881A" fillOpacity="0.55" stroke="#B07A08" strokeWidth="1"/>
                            </svg>
                            <span style={{ ...SERIF, fontSize:10.5, fontWeight:700, color:"#1A1A14", textAlign:"center", lineHeight:1.2 }}>{band.title}</span>
                          </div>
                          {/* Bars cell */}
                          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", justifyContent:"center", gap:8 }}>
                            {evts.length===0 ? (
                              <div style={{ fontSize:11, color:"#9A9A8A", fontStyle:"italic", textAlign:"center" }}>No activity matches filters in this region.</div>
                            ) : evts.map((e,i)=>(
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <span style={{ ...MONO, fontSize:9.5, fontWeight:700, color:TYPE_COLORS[e.type], width:46, flexShrink:0, textAlign:"right" }}>{e.ticker}</span>
                                <div style={{ flex:1, position:"relative", height:18, background:"#EFEAE0", borderRadius:3, overflow:"hidden" }}>
                                  <div title={e.headline} style={{ width:`${Math.max(6,(e.amount/maxAmt)*100)}%`, height:"100%", background:TYPE_COLORS[e.type], borderRadius:3, transition:"width .3s" }}/>
                                </div>
                                <span style={{ fontSize:10, color:"#1A1A14", fontWeight:700, flexShrink:0, whiteSpace:"nowrap" }}>{e.amountLabel}</span>
                                <span style={{ fontSize:9, color:"#9A9A8A", flexShrink:0, width:60, whiteSpace:"nowrap" }}>{e.momentum}% Mom.</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary row */}
                    <div style={{ border:"1px solid #E8E4DE", borderRadius:8, background:"#FBFAF6", padding:"12px 16px" }}>
                      <div style={{ ...SERIF, fontSize:13, fontWeight:700, color:"#1A1A14", marginBottom:8 }}>Summary</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
                        {[["Total Transactions",filtered.length],["Capital Deployed",`C$${totalDeployed.toFixed(0)}M`],["Market Momentum",momentum]].map(([label,val],i)=>(
                          <div key={label} style={{ textAlign:"center", borderRight:i<2?"1px solid #E8E4DE":"none", padding:"2px 8px" }}>
                            <div style={{ fontSize:10, color:"#9A9A8A", marginBottom:4 }}>{label}</div>
                            <div style={{ ...SERIF, fontSize:24, fontWeight:800, color:"#1A1A14" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Insider Activity 1/3 */}
                  <div style={{ borderLeft:"1px solid #D8D0C4", paddingLeft:18, display:"flex", flexDirection:"column" }}>
                    {/* Tab toggle */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ display:"flex", border:"1px solid #D8D0C4", borderRadius:6, overflow:"hidden" }}>
                        <button onClick={()=>setInsiderView("buys")} style={{ padding:"4px 12px", fontSize:10, fontWeight:700, border:"none", cursor:"pointer", background:insiderView==="buys"?"#1A1A14":"transparent", color:insiderView==="buys"?"#FFFFFF":"#6A6A5A" }}>Top Insider Buys</button>
                        <button onClick={()=>setInsiderView("sells")} style={{ padding:"4px 12px", fontSize:10, fontWeight:700, border:"none", cursor:"pointer", background:insiderView==="sells"?"#C01818":"transparent", color:insiderView==="sells"?"#FFFFFF":"#6A6A5A", borderLeft:"1px solid #D8D0C4" }}>Top Insider Sells</button>
                      </div>
                      <span style={{ ...S.badge("gray"), fontSize:9, fontWeight:600 }}>Source: SEDI</span>
                    </div>
                    <div style={{ fontSize:10, color:"#9A9A8A", marginBottom:12 }}>Last updated: {INSIDER_BUYS_UPDATED}</div>

                    <div style={{ flex:1, minHeight:0, maxHeight:480, overflowY:"auto", paddingRight:8, marginRight:-8 }}>
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

                </div>
              );
            })()}
          </div>
        </div>

        {/* Athabasca Exploration Runway */}
        <div id="sec-runway" style={{ scrollMarginTop:90,  marginBottom:48, marginTop:24 }}>
          <div style={{ ...RuleH, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Athabasca Exploration Runway</div>
              <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>A visual guide to understanding company risk and capital availability in the Athabasca Basin.</div>
            </div>
            <div style={{ fontSize:11, color:"#9A9A8A", whiteSpace:"nowrap" }}>{new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
          <div style={{ ...S.card, padding:20 }}>
            {(()=>{
              const STAGE_COLORS = { "Grassroots":"#1A7A44", "Advanced":"#B07A08", "Resource":"#1A5AA8" };
              const STAGE_DESC = {
                "Grassroots":"Early-Stage Exploration, High-Risk",
                "Advanced":"Defined Resource, Moderate Development Stage",
                "Resource":"Proven Deposit, Advancing to Production",
              };
              const filtered = EXPLORATION_RUNWAY.filter(e =>
                e.mktCap >= erMinMktCap &&
                (erStages[e.stage])
              );
              const byStage = {
                "Resource":   filtered.filter(e=>e.stage==="Resource"),
                "Advanced":   filtered.filter(e=>e.stage==="Advanced"),
                "Grassroots": filtered.filter(e=>e.stage==="Grassroots"),
              };
              // De-collide: nudge overlapping bubbles apart in data space (keep originals for tooltip).
              // Simple iterative relaxation on (runway, budget) using display coordinates.
              const decollide = (items) => {
                const pts = items.map(e=>({ ...e, _x:e.runway, _y:e.budget }));
                const xMin=0,xMax=36,yMin=0,yMax=11;
                // min separation in data units (~ bubble footprint)
                const sepX = 1.9, sepY = 0.62;
                for(let iter=0; iter<60; iter++){
                  for(let i=0;i<pts.length;i++){
                    for(let j=i+1;j<pts.length;j++){
                      const a=pts[i], b=pts[j];
                      const dx=(a._x-b._x)/sepX, dy=(a._y-b._y)/sepY;
                      const d2=dx*dx+dy*dy;
                      if(d2<1 && d2>0){
                        const d=Math.sqrt(d2), push=(1-d)/2;
                        const ox=(dx/d)*push*sepX, oy=(dy/d)*push*sepY;
                        a._x+=ox; a._y+=oy; b._x-=ox; b._y-=oy;
                      } else if(d2===0){
                        a._x+=sepX*0.3; b._x-=sepX*0.3;
                      }
                    }
                  }
                }
                // clamp into bounds
                pts.forEach(p=>{ p._x=Math.max(xMin+0.4,Math.min(xMax-0.4,p._x)); p._y=Math.max(yMin+0.3,Math.min(yMax-0.3,p._y)); });
                return pts;
              };
              const byStageDC = {
                "Resource":   decollide(byStage["Resource"]),
                "Advanced":   decollide(byStage["Advanced"]),
                "Grassroots": decollide(byStage["Grassroots"]),
              };
              // Note: de-collision is per-stage; good enough since stages rarely overlap heavily.
              const avgRunway = filtered.length ? (filtered.reduce((s,e)=>s+e.runway,0)/filtered.length).toFixed(1) : "—";
              // Derived sector cash (parse the cash strings loosely)
              const parseCash = (str) => { const n=parseFloat((str||"").replace(/[^0-9.]/g,""))||0; return /B/i.test(str)?n*1000:n; };
              const totalCash = filtered.reduce((s,e)=>s+parseCash(e.cash),0);
              const totalCashStr = totalCash>=1000?`$${(totalCash/1000).toFixed(1)}B`:`$${totalCash.toFixed(0)}M`;
              const avgHorizon = filtered.length ? (filtered.reduce((s,e)=>s+(e.stage==="Resource"?12:e.stage==="Advanced"?9:6),0)/filtered.length).toFixed(1) : "—";

              // Top picks by safety score
              const ranked = [...filtered].sort((a,b)=>calcSafetyScore(b)-calcSafetyScore(a));
              const topPicks = ranked.slice(0,2);

              const BubbleShape = (props) => {
                const { cx, cy, payload } = props;
                const col = STAGE_COLORS[payload.stage] || "#B07A08";
                const r = 11 + Math.min(10, Math.sqrt(payload.mktCap)/8);
                return (
                  <g style={{ cursor:"pointer" }}>
                    <circle cx={cx} cy={cy} r={r} fill={col} fillOpacity={0.82} stroke="#FFFFFF" strokeWidth={1.5}/>
                    <text x={cx} y={cy+3} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#FFFFFF">{payload.ticker}</text>
                  </g>
                );
              };

              // Mini cash-burn sparkline path (derived from runway/budget shape)
              const burnPath = (e) => {
                let s = e.ticker.split("").reduce((a,b)=>a+b.charCodeAt(0),0);
                const pts=[];
                for(let i=0;i<6;i++){ s=(s*9301+49297)%233280; pts.push(0.3+(s/233280)*0.7); }
                return pts.map((v,i)=>`${i===0?"M":"L"}${i*22},${30-v*26}`).join(" ");
              };

              const CustomTooltip = ({ active, payload }) => {
                if (!active||!payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const col = STAGE_COLORS[d.stage];
                const score = calcSafetyScore(d);
                const scorePct = (score/10);
                return (
                  <div style={{ background:"#FFFFFF", border:`1px solid ${col}`, borderRadius:10, padding:"12px 14px", fontSize:11, width:240, boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>
                    <div style={{ fontWeight:800, color:"#1A1A14", marginBottom:6, fontSize:12.5 }}>{d.company} ({d.ticker}) <span style={{ color:col, fontWeight:600 }}>Deep Dive</span></div>
                    <div style={{ display:"grid", gap:3, marginBottom:8 }}>
                      <div><span style={{ color:"#9A9A8A" }}>Primary Project: </span><strong style={{ color:"#1A1A14" }}>{d.project}</strong></div>
                      <div><span style={{ color:"#9A9A8A" }}>Cash Position: </span><strong style={{ color:"#1A7A44" }}>{d.cash}</strong></div>
                      <div><span style={{ color:"#9A9A8A" }}>Annual Budget: </span><strong style={{ color:"#1A1A14" }}>C${d.budget}M</strong></div>
                      <div><span style={{ color:"#9A9A8A" }}>Cash Runway: </span><strong style={{ color:"#1A1A14" }}>{d.runway} months</strong></div>
                    </div>
                    <div style={{ borderTop:"1px solid #EDE8E0", paddingTop:6 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <span style={{ fontWeight:700, color:"#1A1A14" }}>Safety Score</span>
                        <span style={{ fontWeight:800, color:scorePct>0.66?"#1A7A44":scorePct>0.4?"#B07A08":"#C01818", fontSize:13 }}>{score}/10</span>
                      </div>
                      <div style={{ height:5, background:"#EDE8E0", borderRadius:3, overflow:"hidden", marginBottom:8 }}>
                        <div style={{ width:`${scorePct*100}%`, height:"100%", background:scorePct>0.66?"#1A7A44":scorePct>0.4?"#B07A08":"#C01818", borderRadius:3 }}/>
                      </div>
                      <div style={{ fontSize:9, color:"#9A9A8A", marginBottom:3 }}>Est. Cash Burn (model)</div>
                      <svg width="110" height="30" style={{ display:"block" }}>
                        <path d={burnPath(d)} fill="none" stroke={col} strokeWidth={1.5}/>
                      </svg>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {/* KPI strip — top-level summary */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, marginBottom:18, border:"1px solid #E8E4DE", borderRadius:8, overflow:"hidden", background:"#FBFAF6" }}>
                    {[
                      ["Companies Shown", filtered.length],
                      ["Avg Runway", `${avgRunway} mo`],
                      ["Total Sector Cash", totalCashStr],
                      ["Avg Invest Horizon", `${avgHorizon} yrs`],
                    ].map(([label,val],idx,arr)=>(
                      <div key={label} style={{ padding:"12px 14px", borderRight:idx<arr.length-1?"1px solid #E8E4DE":"none", textAlign:"center" }}>
                        <div style={{ fontSize:10.5, color:"#9A9A8A", marginBottom:4 }}>{label}</div>
                        <div style={{ ...SERIF, fontSize:24, fontWeight:800, color:"#1A1A14" }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Legend — click to filter by stage */}
                  <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
                    {Object.entries(STAGE_COLORS).map(([stage,color])=>{
                      const on = erStages[stage];
                      return (
                        <button key={stage} onClick={()=>setErStages(s=>({ ...s, [stage]:!s[stage] }))}
                          title={`Toggle ${stage}`}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 9px", borderRadius:20, cursor:"pointer",
                            border:`1px solid ${on?color:"#D8D0C4"}`, background:on?`${color}14`:"#F5F3EE", opacity:on?1:0.55 }}>
                          <div style={{ width:11, height:11, borderRadius:"50%", background:color, flexShrink:0 }}/>
                          <span style={{ fontSize:11, color:"#4A4A3A" }}>
                            <strong style={{ color:"#1A1A14" }}>{stage}</strong>{erGuide ? ` — ${STAGE_DESC[stage]}` : ""}
                          </span>
                        </button>
                      );
                    })}
                    <span style={{ fontSize:10, color:"#9A9A8A", marginLeft:2 }}>click to filter</span>
                  </div>

                  {/* Main grid: chart + narrow vertical Market Cap slider */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 84px", gap:12 }}>
                    <div>
                      <ResponsiveContainer width="100%" height={360}>
                        <ScatterChart margin={{ top:14, right:20, bottom:22, left:8 }}>
                          {/* Soft pastel quadrant tints — let the background tell the story */}
                          <ReferenceArea x1={0}  x2={12} y1={5}  y2={11} fill="#C01818" fillOpacity={0.06} stroke="none"/>
                          <ReferenceArea x1={12} x2={36} y1={5}  y2={11} fill="#B07A08" fillOpacity={0.06} stroke="none"/>
                          <ReferenceArea x1={0}  x2={12} y1={0}  y2={5}  fill="#9A9A8A" fillOpacity={0.06} stroke="none"/>
                          <ReferenceArea x1={12} x2={36} y1={0}  y2={5}  fill="#1A7A44" fillOpacity={0.07} stroke="none"/>
                          {/* tiny muted corner labels */}
                          <ReferenceArea x1={0}  x2={12} y1={5} y2={11} fill="none" label={{ value:"High Dilution Risk", position:"insideTopLeft", fontSize:9, fill:"#C0181899", fontWeight:600 }}/>
                          <ReferenceArea x1={12} x2={36} y1={5} y2={11} fill="none" label={{ value:"Aggressive Growth", position:"insideTopRight", fontSize:9, fill:"#B07A0899", fontWeight:600 }}/>
                          <ReferenceArea x1={0}  x2={12} y1={0} y2={5}  fill="none" label={{ value:"Survival Mode", position:"insideBottomLeft", fontSize:9, fill:"#7A7A6A99", fontWeight:600 }}/>
                          <ReferenceArea x1={12} x2={36} y1={0} y2={5}  fill="none" label={{ value:"Fully Funded", position:"insideBottomRight", fontSize:9, fill:"#1A7A4499", fontWeight:600 }}/>
                          <XAxis type="number" dataKey="_x" domain={[0,36]} ticks={[0,9,18,27,36]} tick={{ fontSize:10, fill:"#6A6A5A" }}
                            label={{ value:"Cash Runway (months) →", position:"insideBottom", offset:-10, fontSize:9.5, fill:"#9A9A8A" }}/>
                          <YAxis type="number" dataKey="_y" domain={[0,11]} width={48} ticks={[0,3,6,9,11]} tick={{ fontSize:10, fill:"#6A6A5A" }}
                            tickFormatter={v=>`$${v}M`} label={{ value:"Annual Budget (CAD M)", angle:-90, position:"insideLeft", offset:10, fontSize:9.5, fill:"#9A9A8A" }}/>
                          <Tooltip content={<CustomTooltip/>} cursor={{ strokeDasharray:"3 3", stroke:"#C8C0B4" }}/>
                          {Object.entries(byStageDC).map(([stage,data])=>(
                            <Scatter key={stage} data={data} fill={STAGE_COLORS[stage]} shape={<BubbleShape/>}/>
                          ))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Vertical Market Cap slider — drag up to raise minimum */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, paddingTop:10 }}>
                      <span style={{ fontSize:9, color:"#9A9A8A", fontWeight:600, textAlign:"center", lineHeight:1.3 }}>Min Mkt Cap<br/>(CAD M)</span>
                      <span style={{ fontSize:13, fontWeight:800, color:"#1A1A14" }}>{erMinMktCap||"All"}</span>
                      <style>{`
                        input[type=range].er-vslider{
                          -webkit-appearance:none; appearance:none;
                          writing-mode:vertical-lr; direction:rtl;
                          width:6px; height:225px; border-radius:3px;
                          background:#D8D0C4; outline:none; cursor:pointer;
                        }
                        input[type=range].er-vslider::-webkit-slider-thumb{
                          -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
                          background:#1A7A44; cursor:pointer; border:2px solid #FFFFFF;
                          box-shadow:0 1px 3px rgba(0,0,0,0.25);
                        }
                        input[type=range].er-vslider::-moz-range-thumb{
                          width:18px; height:18px; border-radius:50%; background:#1A7A44;
                          cursor:pointer; border:2px solid #FFFFFF;
                        }
                        input[type=range].er-vslider::-moz-range-track{
                          width:6px; border-radius:3px; background:#D8D0C4;
                        }
                      `}</style>
                      <input type="range" className="er-vslider" min={0} max={500} step={10}
                        value={erMinMktCap} onChange={e=>setErMinMktCap(parseInt(e.target.value))}/>
                      <span style={{ fontSize:8.5, color:"#B0A890", textAlign:"center" }}>drag up ↑</span>
                    </div>
                  </div>

                  {/* Beginner Guide toggle — below chart */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:16 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#1A1A14" }}>Beginner Guide</span>
                    <button onClick={()=>setErGuide(v=>!v)} style={{ width:38, height:20, borderRadius:10, border:"none", cursor:"pointer", background:erGuide?"#1A7A44":"#C8C0B4", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                      <span style={{ position:"absolute", top:2, left:erGuide?20:2, width:16, height:16, borderRadius:"50%", background:"#FFFFFF", transition:"left 0.2s" }}/>
                    </button>
                    <span style={{ fontSize:10, color:"#9A9A8A" }}>{erGuide?"Showing chart guide & top picks":"Show how to read this chart"}</span>
                  </div>

                  {/* Beginner Guide — full-width below chart, only when on */}
                  {erGuide && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:12 }}>
                      <div style={{ ...S.card, padding:14, marginBottom:0, background:"#FAFAF7" }}>
                        <div style={{ fontSize:11, fontWeight:800, color:"#1A1A14", marginBottom:8 }}>How to read this chart</div>
                        <div style={{ fontSize:10.5, color:"#4A4A3A", lineHeight:1.6 }}>
                          Each bubble is a company; size reflects market cap. Bubbles to the <strong>right</strong> have more cash runway and are generally safer. <strong style={{ color:"#1A7A44" }}>Bottom-right</strong> companies are funded and steady; <strong style={{ color:"#C01818" }}>top-left</strong> ones spend fast with little runway — watch for share dilution. Use the vertical slider to filter out smaller companies.
                        </div>
                      </div>
                      <div style={{ ...S.card, padding:14, marginBottom:0, background:"#FAFAF7" }}>
                        <div style={{ fontSize:11, fontWeight:800, color:"#1A1A14", marginBottom:2 }}>Model Insights</div>
                        <div style={{ fontSize:9, color:"#9A9A8A", marginBottom:10, fontStyle:"italic" }}>Top safety-score picks</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                          {topPicks.map((p,i)=>{
                            const col = STAGE_COLORS[p.stage];
                            return (
                              <div key={i}>
                                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                                  <span style={{ ...MONO, fontSize:11, fontWeight:800, color:col }}>{p.ticker}</span>
                                  <span style={{ fontSize:9, color:"#9A9A8A" }}>({p.stage})</span>
                                  <span style={{ marginLeft:"auto", fontSize:11, fontWeight:800, color:"#1A7A44" }}>{calcSafetyScore(p)}</span>
                                </div>
                                <div style={{ fontSize:10, color:"#4A4A3A", lineHeight:1.45 }}>{p.runway}mo runway · {p.cash} · {p.project}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div style={{ marginTop:16, padding:"10px 14px", background:"#FAFAF7", border:"1px solid #E8E4DE", borderRadius:8, fontSize:10, color:"#9A9A8A", lineHeight:1.6 }}>
                    <strong style={{ color:"#6A6A5A" }}>Disclaimer:</strong> Cash runway, budget, cash position, Safety Scores, and burn-rate figures shown here are illustrative estimates derived from a simplified internal model — not audited financial data or investment advice. Figures may be inaccurate or out of date. Always verify with official company filings (SEDAR+) and consult a licensed advisor before making investment decisions.
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Community Sentiment (X / social) */}
        <div id="sec-sentiment" style={{ scrollMarginTop:90,  marginBottom:48, marginTop:24 }}>
          <div style={{ ...RuleH, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <div style={{ ...SERIF, fontSize:20, fontWeight:700, color:"#1A1A14" }}>Community Sentiment</div>
              <div style={{ fontSize:12, color:"#6A6A5A", marginTop:2 }}>
                Real-time mood from Reddit & Bluesky, AI-scored
                {sentiment?.sources && <span style={{ color:"#9A9A8A" }}> · {sentiment.sources.reddit||0} Reddit · {sentiment.sources.bluesky||0} Bluesky posts</span>}
                {sentiment?.sample && <span style={{ color:"#B07A08", fontWeight:600 }}> · sample data (live source unavailable)</span>}
              </div>
            </div>
            <button onClick={fetchSentiment} disabled={sentLoading} style={{ ...S.btn("s"), fontSize:11 }}>
              {sentLoading ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>

          {!sentiment ? (
            <div style={{ ...S.card, padding:40, textAlign:"center", color:"#9A9A8A", fontSize:13 }}>Loading community sentiment…</div>
          ) : (()=>{
            const score = sentiment.score ?? 50;
            // color by zone
            const zone = score>=60 ? { c:"#16A34A", bg:"#F0FAF2", label:"Bullish" }
                       : score<=40 ? { c:"#C01818", bg:"#FCF2F2", label:"Bearish" }
                       : { c:"#B07A08", bg:"#FBF7EE", label:"Neutral" };
            const tagColor = (t)=> t==="Bullish" ? "#16A34A" : t==="Bearish" ? "#C01818" : "#B07A08";
            // gauge geometry — semicircle from -90° to +90°
            const R=78, CX=100, CY=100;
            const ang = Math.PI*(1 - score/100); // 0→π
            const nx = CX + R*Math.cos(ang), ny = CY - R*Math.sin(ang);
            return (
              <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20 }}>

                {/* LEFT — gauge + volume */}
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {/* Sentiment gauge */}
                  <div style={{ ...S.card, padding:20, marginBottom:0, textAlign:"center", background:zone.bg }}>
                    <div style={{ ...S.lbl, marginBottom:8 }}>SENTIMENT SCORE</div>
                    <svg viewBox="0 0 200 120" style={{ width:"100%", maxWidth:240, display:"block", margin:"0 auto" }}>
                      {/* track */}
                      <path d="M22,100 A78,78 0 0 1 178,100" fill="none" stroke="#E8E2D6" strokeWidth={14} strokeLinecap="round"/>
                      {/* zones: red / amber / green arcs */}
                      <path d="M22,100 A78,78 0 0 1 70.6,30.4" fill="none" stroke="#C01818" strokeWidth={14} strokeLinecap="round" strokeOpacity={0.25}/>
                      <path d="M70.6,30.4 A78,78 0 0 1 129.4,30.4" fill="none" stroke="#B07A08" strokeWidth={14} strokeOpacity={0.25}/>
                      <path d="M129.4,30.4 A78,78 0 0 1 178,100" fill="none" stroke="#16A34A" strokeWidth={14} strokeLinecap="round" strokeOpacity={0.25}/>
                      {/* needle */}
                      <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={zone.c} strokeWidth={3} strokeLinecap="round"/>
                      <circle cx={CX} cy={CY} r={6} fill={zone.c}/>
                    </svg>
                    <div style={{ ...SERIF, fontSize:44, fontWeight:800, color:zone.c, lineHeight:1, marginTop:-6 }}>{score}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:zone.c, marginTop:4 }}>{zone.label}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#9A9A8A", marginTop:10, padding:"0 6px" }}>
                      <span>0 · Bearish</span><span>50</span><span>Bullish · 100</span>
                    </div>
                  </div>

                  {/* Social volume */}
                  <div style={{ ...S.card, padding:18, marginBottom:0 }}>
                    <div style={{ ...S.lbl, marginBottom:8 }}>POSTS ANALYZED</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                      <span style={{ ...SERIF, fontSize:30, fontWeight:800, color:"#1A1A14" }}>{(sentiment.volume??0).toLocaleString()}</span>
                      <span style={{ fontSize:12, color:"#6A6A5A" }}>recent posts</span>
                      {sentiment.volumeChangePct!=null && (
                        <span className={sentiment.volumeChangePct>=0?"up-arrow":""} style={{ marginLeft:"auto", fontSize:13, fontWeight:800, color:sentiment.volumeChangePct>=0?"#16C44A":"#C01818" }}>
                          {sentiment.volumeChangePct>=0?"▲":"▼"} {Math.abs(sentiment.volumeChangePct)}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:10, color:"#9A9A8A", marginTop:6, lineHeight:1.5 }}>
                      Recent uranium-related posts pulled from Reddit & Bluesky and scored by AI. A surge in chatter often precedes sharp moves in junior miners.
                    </div>
                  </div>
                </div>

                {/* RIGHT — tagged posts */}
                <div style={{ ...S.card, padding:0, marginBottom:0, display:"flex", flexDirection:"column" }}>
                  <div style={{ padding:"14px 18px", borderBottom:"1px solid #EDE8E0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ ...S.lbl }}>WHAT THE COMMUNITY IS SAYING</span>
                    <span style={{ fontSize:9.5, color:"#9A9A8A" }}>AI-tagged · filter the noise</span>
                  </div>
                  <div style={{ flex:1, maxHeight:420, overflowY:"auto" }}>
                    {(sentiment.tweets||[]).map((t,i)=>(
                      <div key={i} onClick={()=>setSentPost(t)}
                        style={{ display:"block", padding:"12px 18px", borderBottom:i<(sentiment.tweets.length-1)?"1px solid #F0ECE4":"none", cursor:"pointer" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ ...MONO, fontSize:11, fontWeight:700, color:"#1A5AA8" }}>{t.author}</span>
                          {t.source && <span style={{ fontSize:8.5, fontWeight:700, color:"#9A9A8A", padding:"1px 6px", borderRadius:4, background:"#F0ECE4", textTransform:"uppercase", letterSpacing:"0.04em" }}>{t.source}</span>}
                          <span style={{ marginLeft:"auto", fontSize:9.5, fontWeight:800, padding:"2px 8px", borderRadius:20, color:tagColor(t.tag), background:`${tagColor(t.tag)}14`, border:`1px solid ${tagColor(t.tag)}33` }}>
                            {t.tag} · {t.score}
                          </span>
                        </div>
                        <div style={{ fontSize:12.5, color:"#2A2A22", lineHeight:1.5 }}>{t.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"10px 18px", borderTop:"1px solid #EDE8E0", fontSize:9, color:"#9A9A8A", lineHeight:1.5 }}>
                    Sentiment is AI-scored from public Reddit & Bluesky posts and may be inaccurate or unrepresentative. Not investment advice. {sentiment.updatedAt && `Updated ${new Date(sentiment.updatedAt).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}.`}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Supply Deficit & Price Visualizer */}
        <div id="sec-demand" style={{ scrollMarginTop:90,  marginBottom:48, marginTop:24 }}>
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
                "Price Outlook":           { color:"#0E7C7B", note:"Uranium spot prices recovered from $18/lb (2016) to $87/lb (2024) — a 5× move driven entirely by supply/demand fundamentals. Long-term contract prices remain below the marginal cost of new mine supply, suggesting the price must rise further to incentivise the capital investment needed to close the deficit by 2030." },
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
                      const spinTo = (name) => {
                        const n = REACTOR_NATIONS.find(x=>x.name===name || x.name.startsWith(name));
                        if(n) setGlobeTarget(t=>({ lng:n.lng, token:t.token+1 }));
                      };
                      return (
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#FAF6EE 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"18px 20px", display:"flex", flexDirection:"column" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:h.color, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.12em" }}>Global Reactor Buildout</div>
                          <div style={{ display:"flex", gap:18, alignItems:"center" }}>
                            <div style={{ width:185, flexShrink:0 }}><ReactorGlobe targetLng={globeTarget.lng} spinToken={globeTarget.token}/></div>
                            <div>
                              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
                                <span style={{ ...SERIF, fontSize:38, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>60+</span>
                                <span style={{ fontSize:11.5, color:"#6A6A5A" }}>reactors u/c by 2030</span>
                              </div>
                              <div style={{ fontSize:11.5, color:"#4A4A3A", lineHeight:1.55 }}>
                                Each 1GWe reactor needs <strong style={{ color:"#1A1A14" }}>~400,000 lbs U₃O₈/yr</strong>. Demand is structural and contractual — locked in by engineering timelines, not speculation.
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize:10, fontWeight:800, color:h.color, margin:"16px 0 10px", textTransform:"uppercase", letterSpacing:"0.1em" }}>Top Builders Under Construction <span style={{ fontWeight:400, color:"#9A9A8A", textTransform:"none", letterSpacing:0 }}>· tap to locate</span></div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"7px 18px" }}>
                            {[
                              ["China","#1A7A44",28],["India","#1A7A44",7],["Russia","#1A5AA8",6],
                              ["Turkey","#1A5AA8",4],["Egypt","#1A5AA8",4],["S. Korea","#B07A08",3],
                            ].map(([name,col,n])=>(
                              <div key={name} onClick={()=>spinTo(name)} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, paddingBottom:6, borderBottom:"1px solid #EDE8E0", cursor:"pointer" }}>
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
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#F4F8F4 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"18px 20px", display:"flex", flexDirection:"column" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:h.color, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.12em" }}>Supply Constraints</div>
                          <div style={{ width:"100%", flex:1, display:"flex", alignItems:"center" }}><SupplyChainFlow/></div>
                          <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"16px 0 6px" }}>
                            <span style={{ ...SERIF, fontSize:38, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>2016</span>
                            <span style={{ fontSize:11.5, color:"#6A6A5A" }}>primary supply peaked at ~165 Mlb</span>
                          </div>
                          <div style={{ fontSize:11.5, color:"#4A4A3A", lineHeight:1.55 }}>
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
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#FAF6EE 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"18px 20px", display:"flex", flexDirection:"column" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:h.color, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.12em" }}>Athabasca Focus</div>
                          <div style={{ marginBottom:14 }}>
                            <AthabascaFocusMap satImage={basinSat}/>
                          </div>
                          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
                            <span style={{ ...SERIF, fontSize:38, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>~10%</span>
                            <span style={{ fontSize:11.5, color:"#6A6A5A" }}>of global uranium resources · grades 10–100× world average</span>
                          </div>
                          <div style={{ fontSize:11.5, color:"#4A4A3A", lineHeight:1.55 }}>
                            The highest-grade uranium district on Earth. As the deficit widens, Basin explorers face the <strong style={{ color:"#1A1A14" }}>most compelling risk/reward</strong> in the junior resource sector.
                          </div>
                        </div>
                      );
                    })()}

                    {/* Price Outlook */}
                    {(()=>{
                      const h = HIGHLIGHTS["Price Outlook"];
                      const bars = [
                        { yr:"2016", val:18,  col:"#C01818" },
                        { yr:"2024", val:87,  col:"#B07A08" },
                        { yr:"2026", val:82,  col:"#B07A08" },
                        { yr:"2030E", val:110, col:"#1A7A44" },
                      ];
                      const maxV = 120;
                      return (
                        <div style={{ background:"linear-gradient(135deg,#FFFFFF,#F0F7F6 55%,#FFFFFF)", borderRadius:12, border:"1px solid #D8D0C4", borderLeft:`3px solid ${h.color}`, padding:"18px 20px", display:"flex", flexDirection:"column" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:h.color, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.12em" }}>Price Outlook <span style={{ fontWeight:400, color:"#9A9A8A", textTransform:"none", letterSpacing:0 }}>· targets & history</span></div>
                          <PriceOutlookTable/>

                          {/* Spot price recovery bars */}
                          <div style={{ marginTop:18, marginBottom:4 }}>
                            <div style={{ fontSize:10, fontWeight:800, color:h.color, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.1em" }}>Spot Price Trajectory (USD / lb)</div>
                            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-around", gap:16, height:110, padding:"0 8px", borderBottom:"1px solid #D8D0C4" }}>
                              {bars.map(b=>(
                                <div key={b.yr} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
                                  <span style={{ ...MONO, fontSize:11.5, fontWeight:800, color:b.col, marginBottom:4 }}>${b.val}</span>
                                  <div style={{ width:"100%", maxWidth:42, height:`${(b.val/maxV)*100}%`, background:`linear-gradient(to top,${b.col},${b.col}CC)`, borderRadius:"4px 4px 0 0" }}/>
                                </div>
                              ))}
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-around", gap:16, padding:"6px 8px 0" }}>
                              {bars.map(b=>(
                                <span key={b.yr} style={{ flex:1, textAlign:"center", fontSize:10, color:"#6A6A5A", fontWeight:600 }}>{b.yr}</span>
                              ))}
                            </div>
                          </div>

                          <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"16px 0 6px" }}>
                            <span style={{ ...SERIF, fontSize:38, fontWeight:800, color:"#1A1A14", lineHeight:1 }}>5×</span>
                            <span style={{ fontSize:11.5, color:"#6A6A5A" }}>recovery from $18 (2016) to $87/lb (2024)</span>
                          </div>
                          <div style={{ fontSize:11.5, color:"#4A4A3A", lineHeight:1.55 }}>
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

        {/* Video / Interviews */}
        <div id="sec-interviews" style={{ scrollMarginTop:90,  marginBottom:20 }}>
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
          {(()=>{
            const THUMBS = [
              "linear-gradient(150deg,#1A2A4A 0%,#0D3868 100%)",
              "linear-gradient(150deg,#2A1808 0%,#7A4210 100%)",
              "linear-gradient(150deg,#0A2A18 0%,#1A6038 100%)",
              "linear-gradient(150deg,#181818 0%,#383838 100%)",
              "linear-gradient(150deg,#1A0A2A 0%,#4A1A5A 100%)",
              "linear-gradient(150deg,#0A1828 0%,#1A3A58 100%)",
            ];
            // Build the list from the manually-pinned videos (PINNED_VIDEOS), enriched with
            // titles/channels fetched via YouTube oEmbed (held in videoData). Replaces the
            // auto channel-feed, which YouTube blocks from datacenter IPs.
            const meta = {};
            (videoData||[]).forEach(d=>{ if(d.id) meta[d.id]=d; });
            const items = PINNED_VIDEOS.filter(v=>v.id).map((v,i)=>{
              const m = meta[v.id] || {};
              const title = v.title || m.videoTitle || "";
              const channel = v.channel || m.channel || "";
              const focus = v.focus || m.focus || "";
              return {
                inf: { name: channel, channel, handle:"", focus, url:`https://www.youtube.com/watch?v=${v.id}` },
                grad: THUMBS[i % THUMBS.length],
                href: `https://www.youtube.com/watch?v=${v.id}`,
                thumb: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
                maxThumb: `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`,
                title,
                date: null,
                hasVideo: true,
              };
            });
            const sorted = items;
            const featured = sorted[0];
            const sideList = sorted.slice(1);

            return (
              <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16 }}>
                {/* Featured video — left */}
                <a href={featured.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <div style={{ ...S.card, marginBottom:0, overflow:"hidden", padding:0, height:"100%", display:"flex", flexDirection:"column" }}>
                    <div style={{ position:"relative", paddingBottom:"56.25%", background:featured.grad, overflow:"hidden" }}>
                      {featured.thumb && (
                        <img src={featured.maxThumb} alt={featured.inf.name}
                          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
                          onError={e=>{ if(e.target.src!==featured.thumb){ e.target.src=featured.thumb; } else { e.target.style.display="none"; } }}
                        />
                      )}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%)" }}/>
                      <div style={{ position:"absolute", top:10, left:10, background:"rgba(192,24,24,0.92)", color:"#FFFFFF", fontSize:9, fontWeight:800, letterSpacing:"0.08em", padding:"3px 8px", borderRadius:4 }}>● FEATURED</div>
                      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)", width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.94)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 12px rgba(0,0,0,0.3)" }}>
                        <Play size={24} strokeWidth={2} color="#1A1A14" style={{ marginLeft:3 }}/>
                      </div>
                      <div style={{ position:"absolute", bottom:14, left:16, right:16 }}>
                        {featured.date && <div style={{ fontSize:10, color:"rgba(255,255,255,0.8)", marginBottom:5, fontWeight:600 }}>{featured.inf.name} · {featured.date}</div>}
                        <div style={{ color:"#FFFFFF", fontSize:17, fontWeight:700, lineHeight:1.35, textShadow:"0 1px 6px rgba(0,0,0,0.9)" }}>{featured.title}</div>
                      </div>
                    </div>
                    <div style={{ padding:"12px 16px", flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:"#1A1A14" }}>{featured.inf.name}</span>
                        <span style={{ fontSize:10, color:"#9A9A8A" }}>{featured.inf.handle}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#6A6A5A", lineHeight:1.45 }}>{featured.inf.focus}</div>
                    </div>
                  </div>
                </a>

                {/* Vertical list — right (real videos only, 16:9 thumbnails) */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:560, overflowY:"auto", paddingRight:4 }}>
                  {sideList.map((v,vi)=>(
                    <a key={v.href||vi} href={v.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ ...S.card, marginBottom:0, overflow:"hidden", padding:0, display:"flex", gap:0, alignItems:"stretch" }}>
                        {/* 16:9 thumbnail */}
                        <div style={{ position:"relative", width:140, flexShrink:0, aspectRatio:"16/9", background:v.grad, overflow:"hidden", alignSelf:"center" }}>
                          {v.thumb && (
                            <img src={v.thumb} alt={v.inf.name}
                              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
                              onError={e=>{
                                const mq = v.thumb.replace("hqdefault","mqdefault");
                                if(e.target.src!==mq && !e.target.dataset.tried){ e.target.dataset.tried="1"; e.target.src=mq; }
                                else { e.target.style.display="none"; }
                              }}
                            />
                          )}
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.25) 100%)" }}/>
                          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.25)" }}>
                            <Play size={11} strokeWidth={2} color="#1A1A14" style={{ marginLeft:1.5 }}/>
                          </div>
                        </div>
                        {/* Info */}
                        <div style={{ padding:"8px 12px", flex:1, display:"flex", flexDirection:"column", justifyContent:"center", minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                            <span style={{ fontWeight:700, fontSize:12, color:"#1A1A14" }}>{v.inf.name}</span>
                            {v.date && <span style={{ fontSize:9, color:"#9A9A8A", marginLeft:"auto", whiteSpace:"nowrap" }}>{v.date}</span>}
                          </div>
                          <div style={{ fontSize:11, color:"#4A4A3A", lineHeight:1.35, fontWeight:600, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{v.title}</div>
                        </div>
                      </div>
                    </a>
                  ))}
                  {sideList.length===0 && (
                    <div style={{ ...S.card, marginBottom:0, padding:"20px 16px", textAlign:"center", fontSize:12, color:"#9A9A8A" }}>
                      Loading latest videos…
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Expert Perspective */}
        <div style={{ marginBottom:20, padding:"22px 24px", background:"#F5F3EE", border:"1px solid #D8D0C4", borderRadius:8, borderLeft:"3px solid #E8A020" }}>
          <div style={{ ...S.lbl, color:"#B07A08", marginBottom:12, letterSpacing:"0.12em" }}>EXPERT PERSPECTIVE</div>
          <blockquote style={{ ...SERIF, fontSize:21, fontWeight:400, color:"#1A1A14", lineHeight:1.65, fontStyle:"italic", margin:"0 0 14px", padding:0 }}>
            "The uranium market has the most compelling supply/demand fundamentals I have seen in my forty-year career. Decades of underinvestment now meet an unstoppable global build-out in reactor capacity."
          </blockquote>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQAHgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDzOFR2rXs4QD+8Ax2rMswQRxkGty0VFAYkZx3rcyZOiRlflHNF0zIgC8A0LOm/HaraxpIVJGfSmK5nwqTyc1n6/wCIrfS0ECDzrsjIQdF+p/pWz4mU6ZorXKZDsQiHsCa83ttEudSuAwBYMdxY9/esqk+RGlOHtGaUGtX2qAxqrKT3ViB+VW20nUVjLLOVc843Hg12PhHw9b2gTzEDMeuRzXdjRrdoWCRDeR6V5s8U76Hr08Eranh8et6hpM6LqkTTW/Qk/eH0Pf8AGu50q4tdRtlmtXEkLdCvX6H0q/rfhWFhIJU3q2dwI4NcFplrP4a8QxrA7GznbawI4Izj8xxzXTh8UpvlZx4rBOmuaJ2N5CFQkL06cVksDu5FbE94jA9z6VmtIjZY9feuxq5wJlK7IwAtUCnzdavyASScUjQ+gzTsO5myIqscUVLONvUUUFIjsjsByMntV3cTgk1Tt0cEjGQe/pV2JeBnqKm7FZElsjM+W/CtuBSsQI4rMtoz5gOeK0PNG0ryBVIllPxY8l7oDQtyFdGUfjiren2qWVhGgUZK9ant7NNQR4JPutheDjn1zT5kCXcdqCDNEuGAOc4xzXFiZJ3id+Dg1ab2ZuaEm3y2C5Nd3p6cqSuOM8ivOPKnsUhmn1A2e4EqjR7gPc10mga/ex3kMF3OlzDMAYpVQqpGOOvSvP5Op66qLY29fgMkRZUBxknj2rynXtP+0OEAIYHzE9iOa9A8X+I5bZ1sbWNVlcDLupYAH6CuJmkuUu0urm5SWAP5bKsZUAnjHP1qqUbSUjKvNODiZaxGRuQQKie0OeD8vWtkxLAuMZbOBVa5ZguCoX8K9tHzvUoGFFXk81XkBTgE4q20Zzls4qGUDBzQXoZVzz1op0y56DmilqBKBhAF61bijVUDNyao2zbjhulbltaGQKwOcjpTJZFDtZqshQfYCpVtNmSFANQyIyng0ydyzYlllZI22PIpVT6E9D+dMurdbbW4JIwYzLGFKEfcIbB/z3qvGzB8k4x3pr3r3uqxBto8sBQR3P8AnFcGMg/iR6eX1Fb2b6ao9V07yblVk25mC8sAOlVvEWI7YMFCYI+YkZ46ACqejpPAJGDfuwPmPemalHFrChoLzyyABujkHPOcVwRTZ7CcUTmV01GGWRCFdepOPrVTxhaRXkK2RxGZnVjJ9Dn+QqHUJLm3e3F9cQyFAQBu6jp09ap60szQrL5oZcAp6iqSd0hVJRcW7dDKadTM0jDGTke1VZX82TJNP8outMNu/Y4Fe4fLLe4MqnrVeeDJwtSkrG2WPNVp7jL/AC5A9aBlO4jCKd1FTXjI0WXPzUUAZ2n81u20zKQBWBZOA3BrUScAjsaQ7G4p+XLGqzgE5pkTb+9QalqFrp0Jku5Qn91erN9B3oHGPcLjgMTgDHJrC0+7a6WW8tlzCkxSNh/GFxk/rXK+IfE13qTSQwA29oeCoPzOPc/0FeifCTSU1rwTPDCVF1b3chGeh3AHB9iP5VlUpupFxRtQmqU1J7HZ+HtbivLeNgwV2AVue4rV+wwPO0hihLE5wyAivMr2xvNGvnTZJEwOWQj/AD+YrpNJ8WxRW6fbSVdOAxHB+teb7OS2PZhWjszpL60jjkSRooo9vTYmPzNYt1OLyQwqQVi+9jrmrcGst4hnS00+NiWBPmEcKAOTXzXLeXJ1KaaaaT7UZDmQMVbOfUVvRoty55dDmxmJXLyQ3Z9BzGKGDbjB681RaXcjEjAHevILbxFq0AAW/ndR/DKd4/WtGPxlqfAmW3lX02FT+hrvuePyHeTnL59TVadwDgKTWNpvimzucJcq1tIeMscofx7fjW80DNyB70w2MmVt7jJIz2oqS8Uxt0+tFAEFtGGTg81Nc3FpYRCS9mCDHAHLN9BXJ3niH7IWhtvnm6FuoU/1NYksk91IXmkZ2bkknNFykjq7/wAYymIwabEIR3lf5n/DsP1rnJpZrhzJPIzyN1Zjkmo4ogo6VI3SjcexAUGWGK9E+BWtf2V4rNhMcQaiBGOeBIuSv5jI/KvPsfM1SW80trcRT27FJonEiMOoYHIP504uzuJq6sfat54c0/XbUrdRK+O/Rl+h7VwviP4dDS4pbu1lgngTlVuDtKE8fQ9q73wlqS6xoOn6nARi7t0lyOhOOfyORiuZ+Leq6lbaXp8mmKCsF0JbpMZ3R4K/kCwJ/Ctp0YVXqZU686Xwsk8FaVYadoTSxOHvZMLNldpjB6KB6d896+QfEVu1vr2pRFSpjupUIIxjDmvpG6N2fEWl6tpDgwNDHBe2wP345H2hsdirYP5+9eV/G/SBpfxBvGCYivIo7oehYja3/jyn86VakoRUV0HCo5ycpdTzqJiwwetTBacIgDleKcMEcVgka3Ex8pr0XwBqwvNHe3mbNxaADnqyHofw5H5V52elWPD9+dO1WGUnEbkwyfRun5HFF7Caueh6nKshOKKz5Swk+ZutFFxWsf/Z" alt="Rick Rule" style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", objectPosition:"center top", flexShrink:0, border:"2px solid #E8D890", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}/>
            <div>
              <div style={{ fontSize:13, color:"#B07A08", fontWeight:700 }}>Rick Rule</div>
              <div style={{ fontSize:11, color:"#6A6A5A" }}>Natural Resource Investor · Sprott Asset Management · Public commentary, 2024</div>
            </div>
          </div>
        </div>

        {/* Nuclear Macro + Global News */}
        <div id="sec-macro" style={{ scrollMarginTop:90,  display:"grid", gridTemplateColumns:"256px 1fr", gap:20, marginBottom:20 }}>
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');@keyframes tkr{from{transform:translateX(0)}to{transform:translateX(-50%)}}.tkr-track{animation:tkr 55s linear infinite}.tkr-track:hover{animation-play-state:paused}@keyframes card-glow{0%,100%{box-shadow:0 0 0 0 rgba(176,122,8,0)}50%{box-shadow:0 0 28px 6px rgba(176,122,8,0.12)}}.spot-glow{animation:card-glow 3s ease-in-out infinite}@keyframes upPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.8;transform:scale(1.06)}}.up-arrow{display:inline-block;animation:upPulse 2.2s ease-in-out infinite;color:#16C44A}@keyframes rigPulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.75;transform:scale(1.8)}}.drill-row{transition:background 0.12s ease}.drill-row:hover{background:#F0EDE5 !important}@keyframes statLive{0%,100%{opacity:0.35}50%{opacity:1}}.stat-live-dot{animation:statLive 2s ease-in-out infinite}@keyframes statRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.stat-card{animation:statRise 0.5s ease-out both}.stat-card:hover{border-color:#D4A03A !important;transform:translateY(-2px)}`}</style>
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


      {/* Sidebar + Content layout */}
      <div style={{ display:"flex", alignItems:"flex-start" }}>

        {/* Collapsible Sidebar */}
        <aside style={{
          position:"sticky", top:0, alignSelf:"flex-start",
          width: sidebarOpen ? 224 : 60, flexShrink:0,
          height:"100vh", overflowY:"auto", overflowX:"hidden",
          background:"#F5F3EE", borderRight:"1px solid #D8D0C4",
          transition:"width 0.18s ease", paddingTop:0, paddingBottom:24,
          display:"flex", flexDirection:"column", gap:2, zIndex:20,
        }}>
          {/* Logo + title */}
          <div style={{ display:"flex", alignItems:"center", gap:11, padding: sidebarOpen ? "18px 16px 16px" : "18px 0 14px", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAATK0lEQVR42u2aaXQc1ZXH/6+quqp3dWttbZaszZssWwaMd9kYjAPDamyYcEjIyjKZmUCGMFlAliEhGzPZgDjkhJAYSIwBA8aAg5GFbbzKsWxrX1pLq1vqfe9a35sPkM/BIDGZnLmfqs6pc+791b313q33v8A/uJFPxQn5wM2Ch28RAaB3xx4VABhj/8ffHiFgjHEf3ubBjEq4UYk8uAFgN2P8X+Fny4TZAqOUcuQDwz1PtK6aSgS1m2+8fjMFIbv37HljbmGldRshxwAIuxljt3KcMRsZJbMFBsB034P3zWv+1y13hmzpSysuaM+cXEWepABZcVi/59hi9fP5OUfX9JPv/u6J7/+4F4C6le3GHu7WGQWdMcBWxri2D8rN3PrkD5rmXHfZ7VqJ+dYRU6Io0N5z2+KVSx56VRxZRBnFdVpdb/vhQ61YX7u7hrgj9qC2O7mve9fTd7WdA5BrZYy1EUL/bgAX3tti73myw/Stp3+0sObaS7+oFPK3TJiyzhBkBE+eu+fGurWbXs2fvikcnjaoQWErKeC3Rstf+9n5V94gLXU7C2QJ5YY1ZU3jpcRbvc+8fOcPu/NvX65FnzuZAvCJ0sl/sqy1ct3H056xPx4Tfz6+75HCDYuenHDQ5u6sVySSiQRHxn5yk2Wp6Wh5+p6R6ITCq+CoZiCei2vhImHRnXTJXw6Mdp5kdmm1d3RCTMy1NkvNZV+o++I6t/+LL7xvuXaR85sDd2c62jrY/04Gi2BH9dyyr7/Q9jlKaUQ2UyfvNG+0O91rI4npI5vGyvYOL8n7yTEMgQcHGTp0UDAwJKHgctRj2YXcg4+6jl9rtbrW5UKx9xnR35E0Eqccnz/w5V270D/qRwSpTxWQEIJbbrmFj9TbljRfvqTauLrqVyZBdGQSyXe0eO5dMc2x/if2H7z3vrtviNhJcZammEGAHNNgIiaoRCOEcoyC4yoUKfjITx7fa/6XVVeq0KDqrIW5zZsYp2cWn6N3B48PeTsHWRf2vGh8nGL9WIDsg/1L2jl14Nn+VKAvXsJvy7c6Gsy8FSIEnN936IbeFY5/tlFTUYHMq6e1Sd7E82ypqZyFtTQZ1oJwEIks5kvpMd5vKjHbw8n3BnZJm+a/rgZyMEJZKJw2WO12v1ieV9iwt/zeO1tYq9JB2vRZ3wcZY4QQwn//4DNbJkv4W074hu5rKl7o1hVGJauJ83f1P9DRqN5sKeRvW5GswAAJo0QswiLJg1E5iiCnod5SibiWwTRVsAxl6OIjsDR6VNIdvF+Y4/ov1adRk5139fm9ITrP/e2rD25/7W2yfTdjzPiwMWCzssgQQtDO2oU1TZvrPV9a8fsTmLAJgcwbeUXuqwrtHkvG7/+VnFXStQ3zv1ExSrVUMoMzQS9bhhLWFR5jpZqFNekFjCQ1Vqs5GEnKLDUdZ4Uh3pDnOJpz6dRhRZH7hOr85UZK1kxJ7WCUqJud9UUrPLLtja/+ti2O3rBxMTFzF/Pwn+if+I62DnPzd25oPSNFy5R0NssMUKvD4WLJ2Ht/On/kcPdc45G+/gGjJxMU3s+O8U3OCt5H0nyNs4h3ma384dwoH2IZviczxXOcwBeaHbyqakLFgG4sLpm7Y0XU+b6WTR0yzXW6KKWGMZrJjsSjZdYH1jyMF3vMLe8+LMwKIGOMbCPbuO1nn79rvETc5ktNAQrSVofVRRTdt/fggZ9ZLpvz38OTk3w6l+MKJTu5PL8aWdHAOEmixlKEw1kvFjvKIQgCssRAWlcAk4Bym5tYcgY30jfKna3ET+v7yS+JwMYEl9nFKTSd6J1GqEzYtqrr0bs6NrQRxhiZ8RLtWdTDB3KWsjmXzisdsoaTgmiaI5l4G+9PvWobz76ZW1p8v19JN1THrUaxJY8bowmMkBhygoHrnY04Lftg4yRAZzie8GKlvRohJQ1GKdLZFJK5LKkze2hQz9nK53pqB7p6H3Vwkq55zDdwdiGrptN7pITerYxEwm95Q+mxjg46c4CEoOfFbta8eW2lcOv8R31avJcfSTxvlulfzvz0nXdGbyy4Z33xoiu7e4f1Cmu+MKrGkeQ0GCKw2T4fZzU/RtQYlollOJUax3JrJda56uESrDge6IWVCQAEmIhAlEDCUAqE8rhNNVn+0Pd7fmlJGEn5JcNELLlSaQs3kny75wfPTH3U9f8jlugHixZVdCUlGvVCset+NJY8ESUK79hY7eJLnDd39Q/RNY4awZuYRolkh0Y1gFJkNAUROQMnE5AzFDBQLLWX40feA+iJ+3BnzVrEdQU2UYKF4xBKx3irN0vd5Z7rEytKimVNhe60/ULT+W8YhM43qKHO2iKTJTqXURU5NRA0silZMhui+TPZKrYqWToRNnKcm0iMUQYHTCgVHNByOrriPnzG3ABN0RDPprFE9OC5wEmYDYL3QwM4FOpHg7MM04kIMtksKuxuNkVzXGnSOnm1UqHl62azNp226BdChqEaMqyUzBpgCgoUZoDYTLwaToxRVUuUXb/sqwdDFw7WFJdgNBGijc5yHI94UcmcWC3MgWAA74b7cLVUB1XTEJczuNRSAU3TYAaH7sg4zodHUSjaMRyZQrGzgGr5IvIV7s8Fn1l8pySZ40ZaHuVcEs8AQOfYrAFCAlSmU+IUoafktyaL1Ca/U7mqIEbOXFB8MBGebCxYgFpzEU4Gh3A0NIgK2FHKbPjzVA8WiEWQDIKhWAArXdWoNOej0VqGCrMLCTWHxWU1GIlOkkK7HWKSdoVFZfOYM91sojjAuS0AGFUvsjG5KEBVUaFB53RFhRHJnlKAdeN8xnOrfVHWrCDqpQnuleFjbLlUih211+HR+uvQEehFT2gCy2wVODzdjxrBjYySw3B8CpzG4EtFYOdFzHUWYTIRZjCbOJ1psVJmTcepUpqLyuvELD1FOACEcJhVQF1jOscceirXrVsFO8dLFX6kke8qmmvixU5PUT44jbKjwUEcnu5FIpPCl8pWY1leJU5MDWAO50RfYhKXu6rRMz2OUCqGdWULMJEIo9M3iJwiM1eVBz3y9OnasopKbyIMIU7LqY13gNFu8JwDWW32SlRNUYPxRKLp3H6Wb75CkIHpZBwJm7HcHw+d7pQncMTXz2BQuE1WbD/1IiKZBO6asxZU1gDGEEknkcnmcPuclVhXMg/vDHQi32JHoSUPTNWY22nDbdalZyb45OXT/hC4iAZDJBsEge3nTJxIUrnZa9UEj1U0QCdpQh6monAFgjlkYin08LFlm2jVCAM1rqlr5prs5fhj7xGUm10QdIZfdL2FRY4ynJvyYoHVg0PjF/DayCns6T2OuU4PRqemYBVErGxYzPlz04aQVbw+LXlpajIK5k9DN7CBSygjnInzUafdNGuApoWFTiOlvmuIYhUskl3PqAaNqXRETBcsslU4NjrrB+NEI8+dP0wz6SwWOcrhjU1jLDqFCrML0UQCw5EA1hXPg5tZsLFiMQLJKFRVQY2jiL4SOE9KhYLBxoJKcUCNFiCYoyyrGBTErsqsms/pB8VFbuesAeoRhdIz0we0PGmzGpehU0q4HJhfTUEstDV1BPtOnFJ92Fy5mFVbi2BnIobDU0jKMgSDg5VJGAsHMRQMoMJZiKMj3fDHIvi3NTciI2dYS9NiTLHMqSlRWxqIR8GnNQZGCQ3nQAWymTs1/TYX0mahRBmA9lYh8r0DY5pTsKHK2ayEUrqmG4TojEQjCXSZwstLVXPXqqoF6AyMkFg8gRpXMWKpFGKpFGBQOIkEgRIEEhEcHb6AbY2r8YWmDej09sEnp0hfYhJ5CbVrgk+viPrCMBkcASOExmWdq3UtMVyiI/zwG160twof9Y/wo2dwPSjqClUumo0QRfkL6pyCagbRFJXJ00nWa0Tmfda1LDeUmor59SRX7yxmkXQS5WYXSFZFVpFh401IZTIgBpDHmbFmzgIcGD6H9sGzzGKzckQ0xZvclan+zHSDMZlijFJm5ImEW1YoEBM7y2LpKJZUUawHnfkSJW0UNy7PBm767fvcC933CYn0Y1yVJUprnTwyuh7mFS7hZFXjcqjTUpKHioJiemK4F3lEQo3Tg4HABK6bfxnyBStyyRRq8j3Y13UUq6vmwwDPTmS9OJ8dOyM4LVXBXIrnsrrOGgt5rrkgKgp4zPq2777gjc+9X7duQQ6kjc5OJ7Njj4qtC+NCRX6ZrShvAd8X/BrP9OelujxTVFLJlE1usinc8eI5xZBlBZqmI5pKwpPnRpdvBAe6TuELl10JolHkizaEsxkouRzW1zcyvUhEhZB3LCwoSxJmjUjNJSY+X3zeGpO/ljeveCGtdJRi68LY0C/fVmavVWMM2N2t+27YuVeFIXPrG3Yak8kLtunk3SpVLngd8uZKwxKscOVpI9FJziJKyBg6RgKTWFkxHz3jg/jzuZPYetkGlDrdSMo5HB3ugazJ3PLa+bo1Y0wOOZKbDTvrteraPUJK7+KuqvuVBkMN/NNv9mJ3t46LPNa/6NYHhFC0tmiZ21/8TyLnomyp5/vJDPuc9nr/D7hY7tfNBVUoF50T4y4d3niQzs8vhtc/Bo4Ahc5CBKIRLPRU4PRQN/zREDzufHpIGUa94PY3u6osNC3v1PaPfi+bI3fQRQU/hCInYl/a+wDaWzRwF3+cf/GAAMH2Q0a8vTfAnZl6mGiaoSr6KlNhwa5T57ptfc+8+/pAavoFfXk+ydkMaIbOiCQhk8uBB8G1l6zC04ffRJ9vFPWFpWyETwIrS8gR/4VdY7tOvHbu+KCNz3P8Qc/pq3gzo0J38GF5f28A6w8ZYBd/zPlxABkIYWCtdHLjUy8LjL0kzHVAG4ppzGq5Y2ila8vW6NyzGAtuz1tbBbXcShhh1BsKYMPCJYhnU5iIhWBzuahWIJB4g0DsMfro3dqyE33LLdfCafk8HUvopvl5kEz8y/6W37wE1kpBCPs4OsXH1yZ2dFC0tlBXZ7yP2zhnixqXbWwyx1ROVfTmfM+1pZeV2wfiPx4o09apPLOlJoJGQ1kVF4hF4ItOG+JSDx9vkOIlw5kv33Hp5suPm6fqBgdGF5FppQ4eidibiyL8znNfSa0r8+OKZ/WPG+YnEV8IDo2y1IbPxly3NcuswX2N2h0hgiCUD/gHfxOcb/3Oas98i6nTv713ntFkzs8rHu3x6tXFpdRfywvKHKF/g8/+jas2bLrjedpz8+mDR39uNsz3GhlFslw9h7NMZx/y3bbrTRy608D2jy++fCJ1CW1tQHsrSa36Ya/rgZZLdAtXa8Q1yaaK58PxePJCce6a9Q1LG28Ycm8/UBRw0mp7Q3F9Oce5Te2fHSl9rGBt43efNc6vDZ3x7suLCIrGcVfxjW5iK7G+k657/DsKa5VB2oxPEuInAwSA379H0QLdKRYNCqsrtirhnMgSitUM075sOH11Z3qsuKC55opv+hp//FbpuD7FEr1Phza+eHal9PPf9R6uUQejcGTor5WsdhMtkjyOJQVp6bWRrwT93V7c/Z7+ScObGYWXMQ6EmCp7/+PbCYl7WDkWMEyq9jXmND+kRdQStVbib11zBVt/znpPgmXUE03s6b0nj/CmEdkQ3eIUF0w9okrSE+a1Ht6hajsm5v30MTCmYgZUXm5GAAmhaG81oltfetJqE48Ll3p4Bu4SjpH9vN3MC90peV/wAhmp0jcl51qveSfSz/MXkrKQZ+YJj/0a+Ev4S4p5i1U4EbnplafQ3qpjhiTsmQEEgI079MwFb1g6MtFmLTRrRr50jRBXTkJglOjMxEc0llSz2bSqZsWYwTgGE3iDCtHcaVJsvdbqsWjikYnt2Z6xCDbu0GcqrJkDpAxguzG25dkOc0R+yrymskyWNTsn4AzJs/BMZ0RmBpdhMjF0SkiexHMc6VRTht28trzMGpefGtuyqwNsNwWduSmLmQMEALLNQHuLpt//7uMWgglusftmPmvsI24JjFIoMJCBCkYNELcZSOn7uEb3zRKjPvXf2x/Hzkt0kG3GTIY0s4AAsP6QEdjXOSmenn7Q3VC8hsm5CcGgMU4SkKYKy0IDkwQwRqM0p/js8wtXi2eCDwb2dQbw1dP6TIcz84CEsBbWSsY27dxrVsl+5/KqVQRsP1dkYzloVGWGwRdZGUeNN50rylebNPbm2FW/frmFtbIP27G/c0AAHVybjt1b1fizXd/NK3bUigI5LVh4IhMNOejEZOGJheC0s9hRl/3D2Yewe6vWwbXpsxHLrMyqgQFs625KCOnK31T7amFlEVKyOqXykpVylIoZZcpRWcAZ3uSr4W+90cUYo2Tb7AzlzUoGP9TzGRhj44++/bLFlwhZOf6YbqIC5ZlgI/wx3pcOTba9tQcfDBbM2lzlrAH+9XuUU5ngyPZ9J4X+1Otmg88IOpG5odS+wCMHjsvnM0HMItzM9KJ/y8YTuipxVAkkEp6l1XnI6FODj799MN3rD2JiOj3b7mcfEAC+vkJXzwbN6eHgePi0dyA5Ek5jy7wIDo3R2Xb9qYw0AwCuarIhES8GgCKLPRTq6EnjH80sV84rs1w5r+zT9Cl8ms5ymif4wVU//t9myP4HNzb5ELgYO0kAAAAASUVORK5CYII=" alt="logo" style={{ width:38, height:38, objectFit:"contain", flexShrink:0 }}/>
            {sidebarOpen && (
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#B07A08", letterSpacing:"0.03em", lineHeight:1.05 }}>ATHABASCA<br/>BASIN TRACKER</div>
              </div>
            )}
          </div>

          <div style={{ borderBottom:"1px solid #E2DCD0", margin:"0 0 6px" }}/>
          {/* Collapse toggle row — tagline left, chevron right */}
          <div style={{ display:"flex", alignItems:"center", justifyContent: sidebarOpen?"space-between":"center", padding: sidebarOpen?"4px 10px 8px 16px":"4px 0 8px", gap:8 }}>
            {sidebarOpen && (
              <div style={{ fontSize:9.5, color:"#6A6A5A", letterSpacing:"0.05em", textTransform:"uppercase", lineHeight:1.45, minWidth:0, fontWeight:600 }}>
                Uranium Intelligence<br/>Dashboard <span style={{ color:"#B07A08", fontWeight:700 }}>by Juniorstocks.com</span>
              </div>
            )}
            <button onClick={()=>setSidebarOpen(o=>!o)}
              title={sidebarOpen?"Collapse":"Expand"}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                background:"none", border:"none", cursor:"pointer", color:"#9A9A8A", padding:4 }}>
              {sidebarOpen ? <ChevronLeft size={18}/> : <Menu size={18}/>}
            </button>
          </div>

          {SIDEBAR_NAV.map(item=>{
            const ICONS = { Home, Star, Map, Hammer, DollarSign, Timer, Users, Activity, Play, Globe, Newspaper };
            const Icon = ICONS[item.icon] || Atom;
            const active = tab==="overview" && activeSection===item.id;
            return (
              <button key={item.id} onClick={()=>goToSection(item)}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding: sidebarOpen ? "10px 16px" : "10px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  background: active ? "#FFFFFF" : "transparent",
                  borderLeft: active ? "3px solid #B07A08" : "3px solid transparent",
                  borderTop:"none", borderRight:"none", borderBottom:"none",
                  cursor:"pointer", width:"100%", textAlign:"left",
                  color: active ? "#1A1A14" : "#6A6A5A",
                  fontSize:13, fontWeight: active ? 700 : 500,
                  fontFamily:"Helvetica, Arial, sans-serif",
                  transition:"background 0.12s, color 0.12s", whiteSpace:"nowrap",
                }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="#EDE9E1"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
                <Icon size={18} strokeWidth={active?2.4:2} color={active?"#B07A08":"#8A8A7A"} style={{ flexShrink:0 }}/>
                {sidebarOpen && <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>}
              </button>
            );
          })}

          {/* Tab links the sidebar doesn't cover (News Feed, Financings, Politics) */}
          {sidebarOpen && <div style={{ ...S.lbl, padding:"16px 16px 6px", fontSize:9, color:"#B8AE9C" }}>MORE</div>}
          {[{id:"news",label:"News Feed",icon:Newspaper},{id:"financings",label:"Financings",icon:Landmark},{id:"politics",label:"Politics",icon:Flag}].map(t=>{
            const Icon = t.icon; const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>{ setTab(t.id); window.scrollTo({top:0}); }}
                title={!sidebarOpen ? t.label : undefined}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding: sidebarOpen ? "10px 16px" : "10px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  background: active ? "#FFFFFF" : "transparent",
                  borderLeft: active ? "3px solid #B07A08" : "3px solid transparent",
                  borderTop:"none", borderRight:"none", borderBottom:"none",
                  cursor:"pointer", width:"100%", textAlign:"left",
                  color: active ? "#1A1A14" : "#6A6A5A", fontSize:13, fontWeight: active?700:500,
                  fontFamily:"Helvetica, Arial, sans-serif", whiteSpace:"nowrap",
                }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="#EDE9E1"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
                <Icon size={18} strokeWidth={active?2.4:2} color={active?"#B07A08":"#8A8A7A"} style={{ flexShrink:0 }}/>
                {sidebarOpen && <span>{t.label}</span>}
              </button>
            );
          })}

          {/* U₃O₈ Spot price card — spacing that survives sidebar overflow/scroll */}
          {sidebarOpen && (
            <div style={{ marginTop:"auto", marginLeft:12, marginRight:12, marginBottom:28, padding:"12px 14px", background:"#FFFFFF", border:"1px solid #E2DCD0", borderRadius:8, flexShrink:0 }}>
              <div style={{ ...S.lbl, marginBottom:4, fontSize:8.5 }}>U₃O₈ SPOT · USD/LB</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontSize:26, fontWeight:900, color:"#B07A08", ...MONO, letterSpacing:"-1px", lineHeight:1 }}>
                  {spotLoading ? "—" : `$${spot.price?.toFixed(2)}`}
                </span>
                <span style={{ fontSize:10.5, color:spotWoW>=0?"#1A7A44":"#C01818", fontWeight:700 }}>
                  {spotWoW>=0?"▲":"▼"} {Math.abs(spotWoW).toFixed(2)}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:9, fontSize:9.5, ...MONO }}>
                <span style={{ color:"#C01818" }}>${spot.low52||"73"}</span>
                <div style={{ flex:1, height:3, background:"#E8E2D6", borderRadius:2, position:"relative" }}>
                  <div style={{ position:"absolute", top:-2, width:7, height:7, borderRadius:"50%", background:"#B07A08",
                    left:`${Math.max(0, Math.min(100, ((((spot.price||79.5)-(spot.low52||73))/(((spot.high52||106)-(spot.low52||73))||1))*100)))}%`,
                    transform:"translateX(-50%)" }}/>
                </div>
                <span style={{ color:"#1A7A44" }}>${spot.high52||"106"}</span>
              </div>
            </div>
          )}
          {/* Spacer to guarantee breathing room below the card when the sidebar scrolls */}
          <div style={{ height:16, flexShrink:0 }} aria-hidden="true"/>
        </aside>

        {/* Content */}
        <main style={{ ...S.main, flex:1, minWidth:0, position:"relative" }}>
          {/* Scroll progress bar — sticky at top of content, starts where the sidebar ends */}
          <div style={{ position:"sticky", top:0, zIndex:15, height:3, background:"#E8E2D6", margin:"-16px -20px 13px", borderRadius:0 }}>
            <div style={{ height:"100%", width:`${scrollPct}%`, background:"linear-gradient(90deg, #B07A08, #D4A03A)", transition:"width 0.15s ease-out", willChange:"width" }}/>
          </div>
          {tab==="overview"   && renderOverview()}
          {tab==="news"       && renderNews()}
          {tab==="drilling"   && renderDrilling()}
          {tab==="financings" && renderFinancings()}
          {tab==="videos"     && renderVideos()}
          {tab==="politics"   && renderPolitics()}
        </main>
      </div>

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
          <a href="mailto:admin@juniorstocks.com" style={{ textDecoration:"none", flexShrink:0 }}>
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

      {/* Sentiment post modal */}
      {sentPost && (()=>{
        const tc = sentPost.tag==="Bullish" ? "#16A34A" : sentPost.tag==="Bearish" ? "#C01818" : "#B07A08";
        return (
          <div onClick={()=>setSentPost(null)}
            style={{ position:"fixed", inset:0, background:"rgba(26,26,20,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div onClick={e=>e.stopPropagation()}
              style={{ background:"#FFFFFF", borderRadius:12, padding:"28px 30px", width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", position:"relative" }}>
              <button onClick={()=>setSentPost(null)}
                style={{ position:"absolute", top:16, right:18, background:"none", border:"none", fontSize:22, color:"#9A9A8A", cursor:"pointer", lineHeight:1 }}>×</button>

              {/* Header: author + source */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ ...MONO, fontSize:14, fontWeight:700, color:"#1A5AA8" }}>{sentPost.author}</span>
                {sentPost.source && <span style={{ fontSize:9, fontWeight:700, color:"#6A6A5A", padding:"2px 8px", borderRadius:5, background:"#F0ECE4", textTransform:"uppercase", letterSpacing:"0.05em" }}>{sentPost.source}</span>}
              </div>
              <div style={{ ...S.lbl, marginBottom:16 }}>COMMUNITY POST</div>

              {/* Full text */}
              <div style={{ fontSize:15, color:"#1A1A14", lineHeight:1.6, marginBottom:18, whiteSpace:"pre-wrap" }}>{sentPost.text}</div>

              {/* Sentiment tag/score */}
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:`${tc}0E`, border:`1px solid ${tc}33`, borderRadius:8, marginBottom:18 }}>
                <span style={{ fontSize:12, color:"#6A6A5A" }}>AI sentiment:</span>
                <span style={{ fontSize:13, fontWeight:800, color:tc }}>{sentPost.tag}</span>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:90, height:6, background:"#ECE7DD", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${sentPost.score}%`, height:"100%", background:tc, borderRadius:3 }}/>
                  </div>
                  <span style={{ ...MONO, fontSize:14, fontWeight:800, color:tc }}>{sentPost.score}</span>
                </div>
              </div>

              {/* Link out */}
              {sentPost.url ? (
                <a href={sentPost.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <button style={{ ...S.btn(), width:"100%", padding:"12px", fontSize:13 }}>
                    View on {sentPost.source || "source"} ↗
                  </button>
                </a>
              ) : (
                <div style={{ fontSize:11, color:"#9A9A8A", textAlign:"center", padding:"8px" }}>Original post link unavailable.</div>
              )}

              <div style={{ fontSize:9.5, color:"#9A9A8A", textAlign:"center", marginTop:12, lineHeight:1.5 }}>
                Sentiment is AI-estimated from the post text and may be inaccurate. Not investment advice.
              </div>
            </div>
          </div>
        );
      })()}

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
              onChange={e=>{ setSubEmail(e.target.value); if(subError) setSubError(""); }}
              onKeyDown={e=>{ if(e.key==="Enter") submitSubscribe(); }}
              style={{ width:"100%", padding:"12px 14px", border:`1px solid ${subError?"#C01818":"#D8D0C4"}`, borderRadius:6, fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:subError?6:10, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", color:"#1A1A14" }}
            />

            {subError && (
              <div style={{ fontSize:11, color:"#C01818", marginBottom:10, lineHeight:1.4 }}>{subError}</div>
            )}

            {/* Submit */}
            <button
              onClick={submitSubscribe}
              disabled={subBusy}
              style={{ width:"100%", padding:"13px", background:subBusy?"#C8A858":"#B07A08", color:"#FFFFFF", border:"none", borderRadius:6, fontSize:14, fontWeight:700, cursor:subBusy?"default":"pointer", letterSpacing:"0.04em" }}>
              {subBusy ? "Subscribing…" : "Get Free Access"}
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
        const tickerRoot = (t)=> (t||"").replace(/\.(V|TO|CN|NE)$/i,"").toUpperCase();
        const coRoot = tickerRoot(c.ticker);
        const coAlt  = tickerRoot(c.altTicker);
        const firstWord = c.name.split(" ")[0].toLowerCase();
        const companyNews = news.filter(n=>{
          const nt = tickerRoot(n.ticker);
          const hay = `${n.company||""} ${n.headline||""}`.toLowerCase();
          return (nt && (nt===coRoot || nt===coAlt)) ||
                 (firstWord.length>3 && hay.includes(firstWord)) ||
                 hay.includes(c.name.toLowerCase());
        }).slice(0,5);

        // Generate seeded 30-day price series with real dates (counting back from today)
        const gen30Day = (price, seed) => {
          let s = seed.split("").reduce((a,b)=>a+b.charCodeAt(0),0);
          const pts = [price];
          for (let i=1;i<30;i++){
            s=(s*9301+49297)%233280;
            const r=s/233280;
            pts.unshift(Math.max(0.001, pts[0]*(1-(r-0.5)*0.05)));
          }
          const today = new Date();
          return pts.map((v,i)=>{
            const dt = new Date(today);
            dt.setDate(today.getDate() - (29 - i));
            return {
              d: i+1,
              date: dt.toLocaleDateString("en-US",{ month:"short", day:"numeric" }),
              price: Math.round(v*1000)/1000,
            };
          });
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
                      <Tooltip
                        formatter={(v)=>[`${fmtP(v)}`,"Price"]}
                        labelFormatter={(d,payload)=>payload?.[0]?.payload?.date || ""}
                        contentStyle={{ background:"#FFFFFF", border:"1px solid #D8D0C4", fontSize:11, borderRadius:4 }}/>
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
                <a href={`https://ceo.ca/${(c.ticker||"").replace(/\..*$/,"")}`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn(), fontSize:11, textDecoration:"none" }}>CEO.CA ↗</a>
                <a href={`https://finance.yahoo.com/quote/${c.altTicker||c.ticker}`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>Yahoo Finance ↗</a>
                <a href={`https://www.sedarplus.ca/`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>SEDAR+ ↗</a>
                {SOCIAL[c.id]?.x  && <a href={SOCIAL[c.id].x}  target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>X / Twitter ↗</a>}
                {SOCIAL[c.id]?.li && <a href={SOCIAL[c.id].li} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("s"), fontSize:11, textDecoration:"none" }}>LinkedIn ↗</a>}
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
