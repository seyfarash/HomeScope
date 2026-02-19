import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Province code lookup ──────────────────────────────────────
const PROV_CODES = {
  "Ontario":"ON","Quebec":"QC","British Columbia":"BC","Alberta":"AB",
  "Manitoba":"MB","Saskatchewan":"SK","Nova Scotia":"NS","New Brunswick":"NB",
  "Newfoundland and Labrador":"NL","Prince Edward Island":"PE",
  "Northwest Territories":"NT","Yukon":"YT","Nunavut":"NU",
};

// ─── Local cities for instant autocomplete (Nominatim supplements) ──
const LOCAL_CITIES = [
  {city:"Toronto",prov:"ON",lat:43.6532,lng:-79.3832},{city:"Montreal",prov:"QC",lat:45.5017,lng:-73.5673},
  {city:"Vancouver",prov:"BC",lat:49.2827,lng:-123.1207},{city:"Calgary",prov:"AB",lat:51.0447,lng:-114.0719},
  {city:"Edmonton",prov:"AB",lat:53.5461,lng:-113.4938},{city:"Ottawa",prov:"ON",lat:45.4215,lng:-75.6972},
  {city:"Winnipeg",prov:"MB",lat:49.8951,lng:-97.1384},{city:"Quebec City",prov:"QC",lat:46.8139,lng:-71.208},
  {city:"Hamilton",prov:"ON",lat:43.2557,lng:-79.8711},{city:"Kitchener",prov:"ON",lat:43.4516,lng:-80.4925},
  {city:"London",prov:"ON",lat:42.9849,lng:-81.2453},{city:"Victoria",prov:"BC",lat:48.4284,lng:-123.3656},
  {city:"Halifax",prov:"NS",lat:44.6488,lng:-63.5752},{city:"Oshawa",prov:"ON",lat:43.8971,lng:-78.8658},
  {city:"Windsor",prov:"ON",lat:42.3149,lng:-83.0364},{city:"Saskatoon",prov:"SK",lat:52.1332,lng:-106.67},
  {city:"Regina",prov:"SK",lat:50.4452,lng:-104.6189},{city:"St. John's",prov:"NL",lat:47.5615,lng:-52.7126},
  {city:"Barrie",prov:"ON",lat:44.3894,lng:-79.6903},{city:"Kelowna",prov:"BC",lat:49.888,lng:-119.496},
  {city:"Abbotsford",prov:"BC",lat:49.0504,lng:-122.3045},{city:"Kingston",prov:"ON",lat:44.2312,lng:-76.486},
  {city:"Guelph",prov:"ON",lat:43.5448,lng:-80.2482},{city:"Moncton",prov:"NB",lat:46.0878,lng:-64.7782},
  {city:"Brantford",prov:"ON",lat:43.1394,lng:-80.2644},{city:"Thunder Bay",prov:"ON",lat:48.3809,lng:-89.2477},
  {city:"Nanaimo",prov:"BC",lat:49.1659,lng:-123.9401},{city:"Fredericton",prov:"NB",lat:45.9636,lng:-66.6431},
  {city:"Sudbury",prov:"ON",lat:46.4917,lng:-80.993},{city:"Red Deer",prov:"AB",lat:52.2681,lng:-113.8112},
  {city:"Lethbridge",prov:"AB",lat:49.6935,lng:-112.8418},{city:"Kamloops",prov:"BC",lat:50.6745,lng:-120.3273},
  {city:"Prince George",prov:"BC",lat:53.9171,lng:-122.7497},{city:"Saint John",prov:"NB",lat:45.2733,lng:-66.0633},
  {city:"Markham",prov:"ON",lat:43.8561,lng:-79.337},{city:"Vaughan",prov:"ON",lat:43.8361,lng:-79.4983},
  {city:"Richmond Hill",prov:"ON",lat:43.8828,lng:-79.4403},{city:"Oakville",prov:"ON",lat:43.4675,lng:-79.6877},
  {city:"Burlington",prov:"ON",lat:43.3255,lng:-79.799},{city:"Mississauga",prov:"ON",lat:43.589,lng:-79.6441},
  {city:"Brampton",prov:"ON",lat:43.7315,lng:-79.7624},{city:"Surrey",prov:"BC",lat:49.1913,lng:-122.849},
  {city:"Burnaby",prov:"BC",lat:49.2488,lng:-122.9805},{city:"Laval",prov:"QC",lat:45.5567,lng:-73.75},
  {city:"Gatineau",prov:"QC",lat:45.4765,lng:-75.7013},{city:"Charlottetown",prov:"PE",lat:46.2382,lng:-63.1311},
  {city:"Newmarket",prov:"ON",lat:44.0592,lng:-79.4613},{city:"Peterborough",prov:"ON",lat:44.3091,lng:-78.3197},
  {city:"Niagara Falls",prov:"ON",lat:43.0896,lng:-79.0849},{city:"St. Catharines",prov:"ON",lat:43.1594,lng:-79.2469},
  {city:"Cambridge",prov:"ON",lat:43.3616,lng:-80.3144},{city:"Ajax",prov:"ON",lat:43.8509,lng:-79.0204},
  {city:"Whitby",prov:"ON",lat:43.8975,lng:-78.9429},{city:"Milton",prov:"ON",lat:43.5183,lng:-79.8774},
  {city:"Coquitlam",prov:"BC",lat:49.2838,lng:-122.7932},{city:"Langley",prov:"BC",lat:49.1044,lng:-122.6609},
  {city:"Richmond",prov:"BC",lat:49.1666,lng:-123.1336},{city:"North Vancouver",prov:"BC",lat:49.32,lng:-123.0724},
  {city:"Airdrie",prov:"AB",lat:51.2917,lng:-114.0144},{city:"St. Albert",prov:"AB",lat:53.6301,lng:-113.6263},
  {city:"Collingwood",prov:"ON",lat:44.5001,lng:-80.2169},{city:"Orillia",prov:"ON",lat:44.6083,lng:-79.4208},
  {city:"Innisfil",prov:"ON",lat:44.3,lng:-79.5833},{city:"Orangeville",prov:"ON",lat:43.92,lng:-80.0942},
  {city:"Cobourg",prov:"ON",lat:43.9594,lng:-78.1681},{city:"Huntsville",prov:"ON",lat:45.3333,lng:-79.2167},
  {city:"Canmore",prov:"AB",lat:51.0884,lng:-115.3479},{city:"Whistler",prov:"BC",lat:50.1163,lng:-122.9574},
  {city:"Whitehorse",prov:"YT",lat:60.7212,lng:-135.0568},{city:"Yellowknife",prov:"NT",lat:62.454,lng:-114.3718},
  {city:"Sherbrooke",prov:"QC",lat:45.4,lng:-71.9},{city:"Trois-Rivières",prov:"QC",lat:46.3432,lng:-72.5421},
  {city:"Chicoutimi",prov:"QC",lat:48.4278,lng:-71.0687},{city:"Drummondville",prov:"QC",lat:45.8833,lng:-72.4833},
  {city:"Granby",prov:"QC",lat:45.4,lng:-72.7333},{city:"Saint-Hyacinthe",prov:"QC",lat:45.6308,lng:-72.9571},
  {city:"Rimouski",prov:"QC",lat:48.449,lng:-68.5239},{city:"Sault Ste. Marie",prov:"ON",lat:46.522,lng:-84.3461},
  {city:"North Bay",prov:"ON",lat:46.3091,lng:-79.4608},{city:"Belleville",prov:"ON",lat:44.1628,lng:-77.3832},
  {city:"Sarnia",prov:"ON",lat:42.9745,lng:-82.4066},{city:"Chatham-Kent",prov:"ON",lat:42.4005,lng:-82.191},
  {city:"Woodstock",prov:"ON",lat:43.1306,lng:-80.7467},{city:"Stratford",prov:"ON",lat:43.3699,lng:-80.9822},
  {city:"Owen Sound",prov:"ON",lat:44.5672,lng:-80.9431},{city:"Timmins",prov:"ON",lat:48.4758,lng:-81.3305},
  {city:"Kenora",prov:"ON",lat:49.7667,lng:-94.4833},{city:"Welland",prov:"ON",lat:42.9923,lng:-79.2483},
  {city:"Cornwall",prov:"ON",lat:45.0181,lng:-74.728},{city:"Pickering",prov:"ON",lat:43.8354,lng:-79.0868},
  {city:"Clarington",prov:"ON",lat:43.935,lng:-78.6083},{city:"Wasaga Beach",prov:"ON",lat:44.5206,lng:-80.0167},
  {city:"Midland",prov:"ON",lat:44.75,lng:-79.8833},{city:"Gravenhurst",prov:"ON",lat:44.9167,lng:-79.3667},
  {city:"Bracebridge",prov:"ON",lat:45.0333,lng:-79.3167},{city:"Parry Sound",prov:"ON",lat:45.3333,lng:-80.0333},
  {city:"Keswick",prov:"ON",lat:44.2333,lng:-79.4667},{city:"Bradford",prov:"ON",lat:44.1167,lng:-79.5667},
  {city:"Alliston",prov:"ON",lat:44.15,lng:-79.8667},{city:"Stouffville",prov:"ON",lat:43.9667,lng:-79.25},
  {city:"Fort McMurray",prov:"AB",lat:56.7264,lng:-111.3803},{city:"Grande Prairie",prov:"AB",lat:55.1707,lng:-118.7953},
  {city:"Medicine Hat",prov:"AB",lat:50.0405,lng:-110.6764},{city:"Cochrane",prov:"AB",lat:51.1891,lng:-114.467},
  {city:"Spruce Grove",prov:"AB",lat:53.5451,lng:-113.9009},{city:"Leduc",prov:"AB",lat:53.2594,lng:-113.5491},
  {city:"Chilliwack",prov:"BC",lat:49.1579,lng:-121.9514},{city:"Maple Ridge",prov:"BC",lat:49.2193,lng:-122.5984},
  {city:"New Westminster",prov:"BC",lat:49.2069,lng:-122.911},{city:"West Vancouver",prov:"BC",lat:49.328,lng:-123.1607},
  {city:"Delta",prov:"BC",lat:49.0847,lng:-123.0586},{city:"Saanich",prov:"BC",lat:48.4849,lng:-123.3818},
  {city:"Courtenay",prov:"BC",lat:49.6877,lng:-124.9954},{city:"Penticton",prov:"BC",lat:49.4991,lng:-119.5937},
  {city:"Vernon",prov:"BC",lat:50.267,lng:-119.272},{city:"Cranbrook",prov:"BC",lat:49.5097,lng:-115.7689},
  {city:"Brandon",prov:"MB",lat:49.8418,lng:-99.9532},{city:"Steinbach",prov:"MB",lat:49.5258,lng:-96.6839},
  {city:"Moose Jaw",prov:"SK",lat:50.3934,lng:-105.5519},{city:"Prince Albert",prov:"SK",lat:53.2034,lng:-105.7531},
  {city:"Sydney",prov:"NS",lat:46.1368,lng:-60.1942},{city:"Truro",prov:"NS",lat:45.3647,lng:-63.28},
  {city:"Bathurst",prov:"NB",lat:47.6198,lng:-65.6513},{city:"Miramichi",prov:"NB",lat:47.0289,lng:-65.5029},
  {city:"Corner Brook",prov:"NL",lat:48.9489,lng:-57.9523},{city:"Summerside",prov:"PE",lat:46.3936,lng:-63.7906},
];

const STEP_LABELS = ["Location & Budget", "Dwelling & Structure", "Rooms & Layout", "Features & Extras"];
const DWELLING_TYPES = [
  { id: "detached", label: "Detached", icon: "🏠" },
  { id: "semi_detached", label: "Semi-Detached", icon: "🏘️" },
  { id: "townhouse", label: "Townhouse / Row", icon: "🏚️" },
  { id: "condo", label: "Condo / Apt", icon: "🏢" },
  { id: "duplex_triplex", label: "Duplex / Triplex", icon: "🏗️" },
  { id: "multi_family", label: "Multi-Family", icon: "🏨" },
  { id: "bungalow", label: "Bungalow", icon: "🛖" },
  { id: "cottage", label: "Cottage / Cabin", icon: "🏕️" },
];
const ROOM_TYPES = ["Bedroom","Bathroom","Half Bath","Ensuite","Kitchen","Living Room","Dining Room","Family Room","Den / Office","Bonus Room","Rec Room","Laundry Room","Mudroom","Sunroom","Walk-in Closet","Storage"];
const FLOORS = ["Basement","Main Floor","Second Floor","Third Floor","Attic"];
const FEATURE_SUGGESTIONS = [
  "Legal second unit / ADU","Extra / second kitchen","Separate entrance",
  "In-law / nanny suite","Finished basement","Walkout basement",
  "Basement separate entrance","Swimming pool","Attached garage","Detached garage",
  "Central A/C","Fireplace","Hardwood floors","Ensuite laundry","EV charger",
  "Solar panels","Smart home","Radiant heating","Hot tub","Fenced yard",
  "Corner lot","Ravine lot","Deck / patio","Near transit","Near good schools",
  "No flood zone","Wheelchair accessible","Open concept","Pot lights",
  "Stainless steel appliances","Quartz countertops","Crown moulding",
];

function zoomToKm(z) {
  if (z <= 6) return 150; if (z === 7) return 100; if (z === 8) return 80;
  if (z === 9) return 50; if (z === 10) return 30; if (z === 11) return 15;
  if (z === 12) return 8; if (z === 13) return 4; if (z === 14) return 2; return 1;
}
function kmToZoom(km) {
  if (km >= 120) return 6; if (km >= 80) return 8; if (km >= 40) return 9;
  if (km >= 20) return 10; if (km >= 10) return 11; if (km >= 6) return 12;
  if (km >= 3) return 13; if (km >= 1.5) return 14; return 15;
}

const DEFAULT_CRITERIA = {
  location: "", selectedCity: null, radiusKm: 15,
  minPrice: "", maxPrice: "", dwellingType: "",
  minLotSqFt: "", maxLotSqFt: "", minHomeSqFt: "", maxHomeSqFt: "",
  stories: "", yearBuiltMin: "", yearBuiltMax: "",
  floorRooms: {},
  features: [], parkingSpaces: "", condoFeeMax: "", additionalNotes: "",
};

function cad(n) { if (!n && n !== 0) return "—"; return "$" + Number(n).toLocaleString("en-CA"); }
function fmtComma(v) { const n = String(v).replace(/\D/g,""); return n ? Number(n).toLocaleString("en-CA") : ""; }
function stripC(v) { return String(v).replace(/\D/g,""); }

function robustParseJSON(text) {
  if (!text) return [];
  let clean = text.replace(/```json\s*/gi,"").replace(/```\s*/gi,"").trim();
  const arrM = clean.match(/\[[\s\S]*\]/);
  if (arrM) clean = arrM[0];
  const tryParse = (s) => { try { const r = JSON.parse(s); return Array.isArray(r) ? r : []; } catch { return null; } };
  let r = tryParse(clean);
  if (r) return r;
  let fixed = clean.replace(/,\s*([\]}])/g,"$1");
  r = tryParse(fixed);
  if (r) return r;
  const lastBrace = fixed.lastIndexOf("}");
  if (lastBrace > 0) {
    let attempt = fixed.substring(0, lastBrace + 1).replace(/,\s*$/,"") + "]";
    attempt = attempt.replace(/,\s*([\]}])/g,"$1");
    r = tryParse(attempt);
    if (r) return r;
  }
  const objs = [];
  const re = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    try {
      const o = JSON.parse(m[0].replace(/,\s*([\]}])/g,"$1"));
      if (o.address || o.listPrice) objs.push(o);
    } catch {}
  }
  return objs;
}

// ═══ MAP via blob iframe ═══════════════════════════════════════
function RadiusMap({ lat, lng, radiusKm, onRadiusChange }) {
  const iframeRef = useRef(null);
  const [iframeSrc, setIframeSrc] = useState(null);
  const prevBlobUrl = useRef(null);

  useEffect(() => {
    const zoom = kmToZoom(radiusKm);
    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#090B10;}
  .leaflet-control-zoom a{background:#11141C!important;color:#E6EAF2!important;border-color:#222838!important;}
  .leaflet-control-attribution{display:none!important;}
</style>
</head><body>
<div id="map"></div>
<script>
  var map = L.map('map',{center:[${lat},${lng}],zoom:${zoom},zoomControl:true});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:''}).addTo(map);
  var marker = L.circleMarker([${lat},${lng}],{radius:7,color:'#fff',weight:3,fillColor:'#E04F5F',fillOpacity:1}).addTo(map);
  var circle = L.circle([${lat},${lng}],{radius:${radiusKm*1000},color:'#E04F5F',fillColor:'#E04F5F',fillOpacity:0.08,weight:2,dashArray:'8 5'}).addTo(map);
  map.on('zoomend',function(){
    var z = map.getZoom();
    window.parent.postMessage({type:'mapZoom',zoom:z},'*');
  });
<\/script>
</body></html>`;
    if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    prevBlobUrl.current = url;
    setIframeSrc(url);
    return () => {};
  }, [lat, lng, radiusKm]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "mapZoom") {
        const km = zoomToKm(e.data.zoom);
        onRadiusChange(km);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onRadiusChange]);

  useEffect(() => {
    return () => { if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current); };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      style={{ width:"100%", height:340, border:"1px solid var(--border)", borderRadius:14, display:"block" }}
      sandbox="allow-scripts"
      title="Search area map"
    />
  );
}

// ═══ AUTOCOMPLETE ══════════════════════════════════════════════
function LocationAutocomplete({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hl, setHl] = useState(-1);
  const [remoteResults, setRemoteResults] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const ref = useRef(null);
  const debounceRef = useRef(null);

  // Instant local filter
  const localFiltered = useMemo(() => {
    if (!value || value.length < 1) return [];
    const q = value.toLowerCase();
    return LOCAL_CITIES.filter(c =>
      c.city.toLowerCase().includes(q) || c.prov.toLowerCase().includes(q) ||
      (c.city + ", " + c.prov).toLowerCase().includes(q)
    ).slice(0, 6);
  }, [value]);

  // Try Nominatim in background to supplement (gracefully fails if blocked)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 3) { setRemoteResults([]); setRemoteLoading(false); return; }
    setRemoteLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(value)}&countrycodes=ca&format=json&limit=6&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const mapped = data
          .filter(r => r.address && (r.type==="city"||r.type==="town"||r.type==="village"||r.type==="hamlet"||r.type==="municipality"||r.class==="place"||r.class==="boundary"))
          .map(r => {
            const a = r.address || {};
            const name = a.city||a.town||a.village||a.hamlet||a.municipality||r.display_name.split(",")[0];
            const st = a.state||"";
            const prov = PROV_CODES[st]||st.substring(0,2).toUpperCase();
            return { city: name, prov, lat: parseFloat(r.lat), lng: parseFloat(r.lon), remote: true };
          })
          .filter((v,i,a) => a.findIndex(x => x.city===v.city && x.prov===v.prov) === i);
        setRemoteResults(mapped);
      } catch { setRemoteResults([]); }
      setRemoteLoading(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  // Merge: local first, then remote that aren't duplicates of local
  const merged = useMemo(() => {
    const localKeys = new Set(localFiltered.map(c => (c.city+c.prov).toLowerCase()));
    const extra = remoteResults.filter(c => !localKeys.has((c.city+c.prov).toLowerCase()));
    return [...localFiltered, ...extra].slice(0, 8);
  }, [localFiltered, remoteResults]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const onKey = e => {
    if (!open || !merged.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHl(i => Math.min(i+1, merged.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHl(i => Math.max(i-1, 0)); }
    else if (e.key === "Enter" && hl >= 0) { e.preventDefault(); onSelect(merged[hl]); setOpen(false); setHl(-1); }
    else if (e.key === "Escape") setOpen(false);
  };
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <label style={LBL}>City or Area</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:.35 }}>📍</span>
        <input type="text" value={value} placeholder="Search any Canadian city, town, or area..."
          onChange={e => { onChange(e.target.value); setOpen(true); setHl(-1); }}
          onFocus={() => { setFocused(true); if (merged.length) setOpen(true); }} onBlur={() => setFocused(false)}
          onKeyDown={onKey}
          style={{ ...INP, paddingLeft:42, paddingRight: remoteLoading ? 42 : 14, borderColor: focused?"var(--accent)":"var(--border)", boxShadow: focused?"0 0 0 3px var(--accent-glow)":"none" }}
        />
        {remoteLoading && (
          <div style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",width:16,height:16,borderRadius:"50%",border:"2px solid var(--border)",borderTopColor:"var(--accent)",animation:"spin .7s linear infinite" }} />
        )}
      </div>
      {open && merged.length > 0 && (
        <div style={{ position:"absolute",top:"100%",left:0,right:0,zIndex:50,marginTop:4,borderRadius:12,overflow:"hidden",background:"var(--surface)",border:"1.5px solid var(--border)",boxShadow:"0 16px 48px rgba(0,0,0,.5)" }}>
          {merged.map((c, i) => (
            <button key={c.city+c.prov+c.lat} onClick={() => { onSelect(c); setOpen(false); }}
              style={{ width:"100%",padding:"13px 18px",border:"none",borderBottom: i<merged.length-1?"1px solid var(--border)":"none",background: i===hl?"var(--surface-alt)":"transparent",color:"var(--text)",fontSize:14,fontFamily:"inherit",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left" }}
              onMouseEnter={() => setHl(i)}>
              <span>
                <strong>{c.city}</strong><span style={{color:"var(--text-muted)"}}>, {c.prov}</span>
                {c.remote && <span style={{marginLeft:6,fontSize:10,padding:"1px 6px",borderRadius:6,background:"var(--accent-bg)",color:"var(--accent)",fontWeight:600}}>web</span>}
              </span>
              <span style={{fontSize:11,color:"var(--text-muted)",fontFamily:"monospace"}}>{c.lat.toFixed(2)}°N</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ BUDGET INPUT ══════════════════════════════════════════════
function BudgetInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <label style={LBL}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"var(--text-muted)",fontWeight:700 }}>$</span>
        <input type="text" inputMode="numeric" value={value ? fmtComma(value) : ""} placeholder={placeholder}
          onChange={e => onChange(stripC(e.target.value))}
          style={{ ...INP,paddingLeft:32,paddingRight:52 }}
          onFocus={e => { e.target.style.borderColor="var(--accent)"; e.target.style.boxShadow="0 0 0 3px var(--accent-glow)"; }}
          onBlur={e => { e.target.style.borderColor="var(--border)"; e.target.style.boxShadow="none"; }}
        />
        <span style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"var(--text-muted)",fontWeight:600 }}>CAD</span>
      </div>
    </div>
  );
}

// ═══ FEATURE TAG INPUT ═════════════════════════════════════════
function FeatureTagInput({ features, setFeatures }) {
  const [input, setInput] = useState("");
  const [showSug, setShowSug] = useState(false);
  const ref = useRef(null);
  const sug = useMemo(() => {
    const ex = new Set(features.map(f => f.toLowerCase()));
    let l = FEATURE_SUGGESTIONS.filter(s => !ex.has(s.toLowerCase()));
    if (input.trim()) l = l.filter(s => s.toLowerCase().includes(input.toLowerCase()));
    return l.slice(0, 6);
  }, [input, features]);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setShowSug(false); }; document.addEventListener("mousedown",h); return () => document.removeEventListener("mousedown",h); }, []);
  const add = f => { const t = f.trim(); if (!t) return; if (!features.some(x => x.toLowerCase()===t.toLowerCase())) setFeatures([...features,t]); setInput(""); };
  const remove = i => setFeatures(features.filter((_,idx) => idx!==i));
  return (
    <div ref={ref} style={{ display:"flex",flexDirection:"column",gap:10 }}>
      <label style={LBL}>Required Features & Extras</label>
      <p style={{ fontSize:13,color:"var(--text-muted)",margin:"-2px 0 0",lineHeight:1.5 }}>Type anything and press Enter, or click suggestions below.</p>
      {features.length > 0 && (
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {features.map((f, i) => (
            <span key={i} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:"var(--accent-bg)",border:"1px solid rgba(224,79,95,.25)",color:"var(--accent)",fontSize:13,fontWeight:500 }}>
              ✓ {f}
              <button onClick={() => remove(i)} style={{ background:"none",border:"none",color:"var(--accent)",fontSize:16,cursor:"pointer",padding:0,lineHeight:1,fontFamily:"inherit",opacity:.7 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position:"relative" }}>
        <input type="text" value={input} placeholder={features.length?"Add another...":"Type a feature..."} onChange={e => { setInput(e.target.value); setShowSug(true); }}
          onFocus={() => setShowSug(true)} onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); add(input); } else if (e.key==="Backspace" && !input && features.length) remove(features.length-1); }}
          style={INP} />
        {input.trim() && <button onClick={() => add(input)} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",padding:"5px 14px",borderRadius:8,border:"none",background:"var(--accent)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Add</button>}
      </div>
      {showSug && sug.length > 0 && (
        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
          {sug.map(s => (
            <button key={s} onClick={() => add(s)} style={{ padding:"6px 13px",borderRadius:18,border:"1px solid var(--border)",background:"var(--surface-alt)",color:"var(--text-secondary)",fontSize:12,fontFamily:"inherit",cursor:"pointer",transition:"all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-secondary)"; }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ FLOOR-BASED ROOM EDITOR ═══════════════════════════════════
function FloorRoomEditor({ floorRooms, setFloorRooms }) {
  const [activeFloor, setActiveFloor] = useState("Main Floor");
  const addRoom = (floor, type) => {
    setFloorRooms(prev => {
      const f = { ...(prev[floor] || {}) };
      f[type] = { count: (f[type]?.count || 0) + 1, minSqFt: f[type]?.minSqFt || "" };
      return { ...prev, [floor]: f };
    });
  };
  const removeRoom = (floor, type) => {
    setFloorRooms(prev => {
      const f = { ...(prev[floor] || {}) };
      if (f[type]?.count > 1) f[type] = { ...f[type], count: f[type].count - 1 };
      else delete f[type];
      const next = { ...prev, [floor]: f };
      if (Object.keys(f).length === 0) delete next[floor];
      return next;
    });
  };
  const setSqFt = (floor, type, val) => {
    setFloorRooms(prev => {
      const f = { ...(prev[floor] || {}) };
      f[type] = { ...f[type], minSqFt: val };
      return { ...prev, [floor]: f };
    });
  };
  const floorCount = (floor) => Object.values(floorRooms[floor] || {}).reduce((s, r) => s + r.count, 0);
  const totalRooms = Object.values(floorRooms).reduce((s, f) => s + Object.values(f).reduce((ss, r) => ss + r.count, 0), 0);
  const BS = { width:26,height:26,borderRadius:6,border:"none",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      {/* Floor tabs */}
      <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:4 }}>
        {FLOORS.map(f => {
          const cnt = floorCount(f);
          const active = f === activeFloor;
          return (
            <button key={f} onClick={() => setActiveFloor(f)} style={{
              padding:"9px 16px",borderRadius:10,whiteSpace:"nowrap",
              border: active?"1.5px solid var(--accent)":"1.5px solid var(--border)",
              background: active?"var(--accent-bg)":"var(--surface)",
              color: active?"var(--accent)":"var(--text-secondary)",
              fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight: active?700:400,
              transition:"all .15s",
            }}>
              {f} {cnt > 0 && <span style={{ marginLeft:4,padding:"1px 7px",borderRadius:10,background: active?"var(--accent)":"var(--border)",color: active?"#fff":"var(--text-muted)",fontSize:11,fontWeight:700 }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Room type pills for active floor */}
      <div style={{ padding:"16px",borderRadius:14,background:"var(--surface-alt)",border:"1px solid var(--border)" }}>
        <div style={{ fontSize:12,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:12 }}>
          Add rooms to {activeFloor}
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
          {ROOM_TYPES.map(rt => {
            const has = floorRooms[activeFloor]?.[rt];
            return (
              <button key={rt} onClick={() => addRoom(activeFloor, rt)} style={{
                padding:"7px 14px",borderRadius:20,
                border: has?"1.5px solid var(--accent)":"1.5px solid var(--border)",
                background: has?"var(--accent-bg)":"var(--surface)",
                color: has?"var(--accent)":"var(--text-secondary)",
                fontSize:12,fontFamily:"inherit",cursor:"pointer",fontWeight: has?600:400,transition:"all .15s",
              }}>
                {rt} {has ? `(${has.count})` : "+"}
              </button>
            );
          })}
        </div>

        {/* Room detail rows for active floor */}
        {floorRooms[activeFloor] && Object.keys(floorRooms[activeFloor]).length > 0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:14 }}>
            {Object.entries(floorRooms[activeFloor]).map(([type, data]) => (
              <div key={type} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"var(--surface)",border:"1px solid var(--border)" }}>
                <span style={{ flex:1,fontSize:13,fontWeight:600 }}>{type}</span>
                <button onClick={() => removeRoom(activeFloor, type)} style={{ ...BS,background:"rgba(240,107,107,.12)",color:"#F06B6B" }}>−</button>
                <span style={{ fontSize:14,fontWeight:800,minWidth:18,textAlign:"center" }}>{data.count}</span>
                <button onClick={() => addRoom(activeFloor, type)} style={{ ...BS,background:"var(--accent-bg)",color:"var(--accent)" }}>+</button>
                <input type="number" placeholder="min ft²" value={data.minSqFt} onChange={e => setSqFt(activeFloor, type, e.target.value)}
                  style={{ width:76,padding:"5px 8px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface-alt)",fontSize:12,fontFamily:"inherit",color:"var(--text)",outline:"none" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary of all floors */}
      {totalRooms > 0 && (
        <div style={{ padding:"14px 16px",borderRadius:12,background:"var(--card)",border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:10 }}>Layout Summary — {totalRooms} rooms</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {Object.entries(floorRooms).filter(([,rooms]) => Object.keys(rooms).length > 0).map(([floor, rooms]) => (
              <div key={floor}>
                <div style={{ fontSize:13,fontWeight:700,color:"var(--accent)",marginBottom:4 }}>{floor}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {Object.entries(rooms).map(([type, d]) => (
                    <span key={type} style={{ padding:"3px 10px",borderRadius:8,background:"var(--surface-alt)",fontSize:12,color:"var(--text-secondary)" }}>
                      {d.count}× {type}{d.minSqFt ? ` (${d.minSqFt}+ ft²)` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ PROPERTY CARD with photos + links ═════════════════════════
function PropertyCard({ property, index }) {
  const [expanded, setExpanded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const fv = property.fairValueIndicator;
  const fvC = fv==="below"?"#2DD4A0":fv==="above"?"#F06B6B":"#F5B731";
  const fvL = fv==="below"?"Below Market — Good Deal":fv==="above"?"Above Market":"Fair Market Value";
  const photos = property.photos || property.imageUrls || [];
  const listingUrl = property.listingUrl || property.url || property.source_url || null;

  return (
    <div style={{
      opacity:0,transform:"translateY(24px)",animation:`fadeUp 0.5s cubic-bezier(.21,1.02,.73,1) ${index*0.07}s forwards`,
      background:"var(--card)",borderRadius:18,border:"1px solid var(--border)",overflow:"hidden",
      transition:"transform .25s, box-shadow .25s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 14px 44px rgba(0,0,0,.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>

      {/* Photo carousel area */}
      {photos.length > 0 && (
        <div style={{ position:"relative",width:"100%",height:220,background:"var(--surface-alt)",overflow:"hidden" }}>
          <img src={photos[photoIdx]} alt="Property" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} onError={e => { e.target.style.display="none"; }} />
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i-1+photos.length)%photos.length); }}
                style={{ position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.6)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i+1)%photos.length); }}
                style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.6)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
              <div style={{ position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5 }}>
                {photos.map((_, i) => <div key={i} style={{ width:7,height:7,borderRadius:"50%",background: i===photoIdx?"#fff":"rgba(255,255,255,.4)",transition:"background .2s" }} />)}
              </div>
            </>
          )}
          <div style={{ position:"absolute",top:10,right:10,padding:"4px 10px",borderRadius:8,background:"rgba(0,0,0,.65)",color:"#fff",fontSize:11,fontWeight:600 }}>{photos.length} photos</div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: photos.length>0?"var(--surface)":"linear-gradient(135deg, #E04F5F 0%, #B83A48 100%)", padding:"18px 22px", color: photos.length>0?"var(--text)":"#fff" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12 }}>
          <div>
            <h3 style={{ margin:0,fontSize:17,fontWeight:700 }}>{property.address}</h3>
            <p style={{ margin:"3px 0 0",fontSize:13,opacity:.8 }}>{property.city}, {property.province} {property.postalCode}</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:22,fontWeight:800,color: photos.length>0?"var(--accent)":"#fff" }}>{cad(property.listPrice)}</div>
            {property.estimatedValue && <div style={{ fontSize:12,opacity:.7,marginTop:2 }}>Est. Value: {cad(property.estimatedValue)}</div>}
          </div>
        </div>
      </div>

      {/* Value bar */}
      <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 22px",background:fvC+"14",borderBottom:"1px solid var(--border)" }}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:fvC }} />
        <span style={{ fontSize:13,fontWeight:600,color:fvC }}>{fvL}</span>
        {property.pricePerSqFt && <span style={{ marginLeft:"auto",fontSize:12,color:"var(--text-muted)" }}>${property.pricePerSqFt}/ft²</span>}
        {property.mlsNumber && <span style={{ fontSize:11,color:"var(--text-muted)",marginLeft:8 }}>MLS® #{property.mlsNumber}</span>}
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(85px, 1fr))",borderBottom:"1px solid var(--border)" }}>
        {[{l:"Beds",v:property.bedrooms},{l:"Baths",v:property.bathrooms},{l:"Sq Ft",v:property.sqFt?.toLocaleString()},{l:"Lot",v:property.lotSize||"—"},{l:"Built",v:property.yearBuilt},{l:"Type",v:property.dwellingType}].map((s,i) => (
          <div key={i} style={{ padding:"11px 8px",textAlign:"center",borderRight:"1px solid var(--border)" }}>
            <div style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.8 }}>{s.l}</div>
            <div style={{ fontSize:14,fontWeight:600,marginTop:2 }}>{s.v||"—"}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding:"14px 22px" }}>
        {property.description && <p style={{ fontSize:14,lineHeight:1.65,color:"var(--text-secondary)",margin:"0 0 10px" }}>{property.description}</p>}

        <div style={{ display:"flex",gap:12,alignItems:"center",flexWrap:"wrap" }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background:"none",border:"none",color:"var(--accent)",fontSize:13,fontWeight:600,cursor:"pointer",padding:0,fontFamily:"inherit" }}>
            {expanded ? "Hide Details ▲" : "Show Details ▼"}
          </button>
          {listingUrl && (
            <a href={listingUrl} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex",alignItems:"center",gap:5,
              padding:"6px 14px",borderRadius:8,border:"1px solid var(--accent)",
              background:"transparent",color:"var(--accent)",fontSize:12,fontWeight:600,
              textDecoration:"none",transition:"all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--accent)"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--accent)"; }}>
              View Listing ↗
            </a>
          )}
        </div>

        {expanded && (
          <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:14 }}>
            {property.rooms?.length > 0 && (
              <DS t="Room Breakdown">
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(170px, 1fr))",gap:6 }}>
                  {property.rooms.map((r,i) => <div key={i} style={{ padding:"7px 11px",borderRadius:8,background:"var(--surface-alt)",fontSize:12 }}><strong>{r.type}</strong>{r.size && ` — ${r.size}`}{r.floor && <span style={{color:"var(--text-muted)"}}> ({r.floor})</span>}</div>)}
                </div>
              </DS>
            )}
            {property.features?.length > 0 && (
              <DS t="Features">
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {property.features.map((f,i) => <span key={i} style={{ padding:"4px 11px",borderRadius:18,fontSize:11,background:"var(--accent-bg)",color:"var(--accent)",fontWeight:500 }}>✓ {f}</span>)}
                </div>
              </DS>
            )}
            {(property.lastSalePrice || property.lastSaleDate) && (
              <DS t="Sale History"><p style={{ fontSize:13,color:"var(--text-secondary)",margin:0 }}>Last sold for <strong>{cad(property.lastSalePrice)}</strong> on <strong>{property.lastSaleDate||"N/A"}</strong>. {property.appreciationNote}</p></DS>
            )}
            {property.recentWork?.length > 0 && (
              <DS t="Renovations">{property.recentWork.map((w,i) => <p key={i} style={{ fontSize:12,color:"var(--text-secondary)",margin:"2px 0" }}>• {w}</p>)}</DS>
            )}
            {(property.taxes||property.condoFees) && (
              <DS t="Taxes & Fees"><p style={{ fontSize:13,color:"var(--text-secondary)",margin:0 }}>{property.taxes?<>Tax: <strong>{cad(property.taxes)}/yr</strong></>:""}{property.condoFees?<> | Condo: <strong>{cad(property.condoFees)}/mo</strong></>:""}</p></DS>
            )}
            {property.source && <div style={{ fontSize:11,color:"var(--text-muted)",marginTop:2 }}>Source: {property.source}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
function DS({ t, children }) { return <div><h4 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:"var(--text-muted)",margin:"0 0 6px" }}>{t}</h4>{children}</div>; }

// ═══ GENERIC ═══════════════════════════════════════════════════
const LBL = { fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:"var(--text-muted)",display:"block",marginBottom:6 };
const INP = { width:"100%",boxSizing:"border-box",padding:"12px 14px",border:"1.5px solid var(--border)",borderRadius:12,background:"var(--surface)",color:"var(--text)",fontSize:15,fontFamily:"inherit",outline:"none",transition:"border-color .2s, box-shadow .2s" };
function Input({ label, suffix, ...p }) {
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>{label&&<label style={LBL}>{label}</label>}<div style={{position:"relative"}}><input {...p} style={{...INP,paddingRight:suffix?56:14,...p.style}} onFocus={e=>{e.target.style.borderColor="var(--accent)";e.target.style.boxShadow="0 0 0 3px var(--accent-glow)";}} onBlur={e=>{e.target.style.borderColor="var(--border)";e.target.style.boxShadow="none";}}/>{suffix&&<span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--text-muted)"}}>{suffix}</span>}</div></div>);
}
function Select({ label, options, value, onChange, placeholder }) {
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>{label&&<label style={LBL}>{label}</label>}<select value={value} onChange={e=>onChange(e.target.value)} style={{...INP,cursor:"pointer",appearance:"none",color:value?"var(--text)":"var(--text-muted)",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}><option value="">{placeholder||"Select..."}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>);
}
function StepIndicator({ current, total, labels }) {
  return (<div style={{display:"flex",alignItems:"center",gap:0,marginBottom:30,overflowX:"auto",paddingBottom:4}}>{labels.map((l,i)=>(<div key={i} style={{display:"flex",alignItems:"center",flex:i<total-1?1:"none"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:72}}><div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,background:i<=current?"var(--accent)":"var(--surface-alt)",color:i<=current?"#fff":"var(--text-muted)",border:i<=current?"none":"2px solid var(--border)",transition:"all .3s"}}>{i<current?"✓":i+1}</div><span style={{fontSize:10,fontWeight:i===current?700:400,color:i<=current?"var(--text)":"var(--text-muted)",textAlign:"center",whiteSpace:"nowrap"}}>{l}</span></div>{i<total-1&&<div style={{flex:1,height:2,margin:"0 5px",background:i<current?"var(--accent)":"var(--border)",marginBottom:20}}/>}</div>))}</div>);
}
function Tg({children}){return <span style={{padding:"3px 10px",borderRadius:10,background:"var(--surface)",border:"1px solid var(--border)",fontSize:12}}>{children}</span>;}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
export default function HomeScope() {
  const [step, setStep] = useState(0);
  const [c, setC] = useState(DEFAULT_CRITERIA);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("gemini_api_key") || window.localStorage.getItem("anthropic_api_key") || "";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = apiKey.trim();
    if (key) window.localStorage.setItem("gemini_api_key", key);
    else window.localStorage.removeItem("gemini_api_key");
    window.localStorage.removeItem("anthropic_api_key");
  }, [apiKey]);

  const up = (k,v) => setC(p => ({...p,[k]:v}));
  const selectCity = ci => { up("location", ci.city+", "+ci.prov); up("selectedCity", ci); };
  const onRadius = useCallback(km => up("radiusKm", km), []);

  function buildPrompt() {
    let p = `You are a Canadian real estate research assistant. Search the web for real houses/properties currently listed for sale in Canada matching these criteria. Search REALTOR.ca, HouseSigma, Zolo, Zillow.ca, Redfin, and local Canadian sites. All prices in CAD.\n\n`;
    p += `**Location:** ${c.location} (within ~${c.radiusKm} km)\n`;
    if (c.minPrice||c.maxPrice) p += `**Budget:** ${c.minPrice?"$"+Number(c.minPrice).toLocaleString():"No min"} to ${c.maxPrice?"$"+Number(c.maxPrice).toLocaleString():"No max"} CAD\n`;
    if (c.dwellingType) p += `**Type:** ${DWELLING_TYPES.find(d=>d.id===c.dwellingType)?.label}\n`;
    if (c.minHomeSqFt||c.maxHomeSqFt) p += `**Home Size:** ${c.minHomeSqFt||"Any"} – ${c.maxHomeSqFt||"Any"} sq ft\n`;
    if (c.minLotSqFt||c.maxLotSqFt) p += `**Lot:** ${c.minLotSqFt||"Any"} – ${c.maxLotSqFt||"Any"} sq ft\n`;
    if (c.stories) p += `**Stories:** ${c.stories}\n`;
    if (c.yearBuiltMin||c.yearBuiltMax) p += `**Year Built:** ${c.yearBuiltMin||"Any"} – ${c.yearBuiltMax||"Any"}\n`;
    // Floor-based rooms
    const floorEntries = Object.entries(c.floorRooms).filter(([,rooms])=>Object.keys(rooms).length>0);
    if (floorEntries.length) {
      p += `**Room Layout Requirements:**\n`;
      floorEntries.forEach(([floor, rooms]) => {
        p += `  ${floor}:\n`;
        Object.entries(rooms).forEach(([type,d]) => { p += `    - ${d.count}x ${type}${d.minSqFt?` (min ${d.minSqFt} sq ft)`:""}\n`; });
      });
    }
    if (c.features.length) p += `**Required Features:** ${c.features.join(", ")}\n`;
    if (c.parkingSpaces) p += `**Min Parking:** ${c.parkingSpaces}\n`;
    if (c.condoFeeMax) p += `**Max Condo Fees:** $${c.condoFeeMax}/mo\n`;
    if (c.additionalNotes) p += `**Notes:** ${c.additionalNotes}\n`;
    p += `\nSearch thoroughly. For EACH property provide maximum details including photos and the direct listing URL.\n\n`;
    p += `CRITICAL: Respond with ONLY a valid JSON array. No markdown, no backticks, no preamble. Start with [ end with ].\nEach object:\n`;
    p += `{"address":"string","city":"string","province":"XX","postalCode":"string","mlsNumber":"string_or_null","listPrice":number,"estimatedValue":number_or_null,"fairValueIndicator":"below"|"fair"|"above","pricePerSqFt":number_or_null,"bedrooms":number,"bathrooms":number,"sqFt":number,"lotSize":"string_or_null","yearBuilt":number_or_null,"dwellingType":"string","stories":number_or_null,"description":"2-3 sentences","rooms":[{"type":"string","size":"string_or_null","floor":"string_or_null"}],"features":["string"],"photos":["url_string"],"listingUrl":"direct_url_to_listing_or_null","lastSalePrice":number_or_null,"lastSaleDate":"string_or_null","appreciationNote":"string_or_null","recentWork":["string"],"taxes":number_or_null,"condoFees":number_or_null,"source":"string"}\n\nReturn 3-10 properties. Include listing URLs (from realtor.ca, housesigma.com etc.) and photo URLs where available. All prices CAD. Start response with [`;
    return p;
  }

  async function handleSearch() {
    if (!c.location.trim()) { setError("Please select a location."); return; }
    const key = apiKey.trim();
    if (!key) { setError("Please add your Gemini API key in the header first."); return; }
    setLoading(true); setError(null); setResults(null); setSearched(true);
    setLoadMsg("Building search query...");
    try {
      const prompt = buildPrompt();
      const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
      const apiHeaders = {
        "Content-Type":"application/json",
        "x-goog-api-key": key,
      };
      const readGeminiText = data => (data?.candidates || [])
        .flatMap(cand => cand?.content?.parts || [])
        .map(part => part?.text || "")
        .join("\n");
      setLoadMsg("Searching REALTOR.ca, HouseSigma, Zolo...");
      const res = await fetch(geminiEndpoint, {
        method:"POST",headers:apiHeaders,
        body:JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.2 },
        }),
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`API ${res.status}`); }
      const data = await res.json();
      setLoadMsg("Analyzing fair market values...");
      const txt = readGeminiText(data);
      let props = robustParseJSON(txt);
      if (!props.length && txt.length > 50) {
        setLoadMsg("Structuring results...");
        const repairPrompt = `${prompt}\n\nPrevious model output:\n${txt}\n\nReformat as JSON array only. Start with [ end with ]. No markdown. Include listing URLs and photo URLs.`;
        const f2 = await fetch(geminiEndpoint, {
          method:"POST",headers:apiHeaders,
          body:JSON.stringify({
            contents: [{ role: "user", parts: [{ text: repairPrompt }] }],
            generationConfig: { temperature: 0.1 },
          }),
        });
        if (f2.ok) { const d2 = await f2.json(); const t2 = readGeminiText(d2); props = robustParseJSON(t2); }
      }
      props.length ? setResults(props) : setError("No matching properties found. Try broadening your criteria.");
    } catch(e) {
      const msg = e?.message || "Unknown error";
      if (msg === "Failed to fetch") setError("Search failed: network/CORS blocked. Verify Gemini API key restrictions and try again.");
      else setError(`Search failed: ${msg}`);
    } finally { setLoading(false); }
  }

  const center = c.selectedCity || { lat:44.3894, lng:-79.6903 };
  const steps = [
    // 0: Location
    () => (
      <div style={{display:"flex",flexDirection:"column",gap:22}}>
        <LocationAutocomplete value={c.location} onChange={v=>up("location",v)} onSelect={selectCity} />
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
            <label style={LBL}>Search Radius — <span style={{color:"var(--accent)"}}>{c.radiusKm} km</span></label>
            <span style={{fontSize:11,color:"var(--text-muted)"}}>Zoom map to adjust</span>
          </div>
          {c.selectedCity ? (
            <RadiusMap lat={center.lat} lng={center.lng} radiusKm={c.radiusKm} onRadiusChange={onRadius} />
          ) : (
            <div style={{width:"100%",height:340,borderRadius:14,border:"1.5px dashed var(--border)",background:"var(--surface-alt)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
              <span style={{fontSize:36,opacity:.2}}>🗺️</span><span style={{fontSize:14,color:"var(--text-muted)"}}>Select a city to see the map</span>
            </div>
          )}
          {c.selectedCity && (
            <div style={{display:"flex",justifyContent:"center",gap:7,marginTop:10,flexWrap:"wrap"}}>
              {[3,5,10,15,25,50,80].map(km => (
                <button key={km} onClick={()=>up("radiusKm",km)} style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontFamily:"inherit",border:c.radiusKm===km?"1.5px solid var(--accent)":"1.5px solid var(--border)",background:c.radiusKm===km?"var(--accent-bg)":"var(--surface)",color:c.radiusKm===km?"var(--accent)":"var(--text-muted)",cursor:"pointer",fontWeight:c.radiusKm===km?700:400}}>{km} km</button>
              ))}
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <BudgetInput label="Min Budget" value={c.minPrice} onChange={v=>up("minPrice",v)} placeholder="300,000" />
          <BudgetInput label="Max Budget" value={c.maxPrice} onChange={v=>up("maxPrice",v)} placeholder="900,000" />
        </div>
        {c.dwellingType === "condo" && (
          <BudgetInput label="Max Condo / Strata Fees (Monthly)" value={c.condoFeeMax} onChange={v=>up("condoFeeMax",v)} placeholder="800" />
        )}
      </div>
    ),
    // 1: Dwelling
    () => (
      <div style={{display:"flex",flexDirection:"column",gap:22}}>
        <div>
          <label style={{...LBL,marginBottom:10}}>Dwelling Type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(125px, 1fr))",gap:10}}>
            {DWELLING_TYPES.map(dt => (
              <button key={dt.id} onClick={()=>up("dwellingType",c.dwellingType===dt.id?"":dt.id)} style={{padding:"14px 10px",borderRadius:14,border:c.dwellingType===dt.id?"2px solid var(--accent)":"1.5px solid var(--border)",background:c.dwellingType===dt.id?"var(--accent-bg)":"var(--surface)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,fontFamily:"inherit",transition:"all .2s"}}>
                <span style={{fontSize:26}}>{dt.icon}</span>
                <span style={{fontSize:11,fontWeight:c.dwellingType===dt.id?700:500,color:c.dwellingType===dt.id?"var(--accent)":"var(--text-secondary)",textAlign:"center"}}>{dt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Input label="Min Home Sq Ft" type="number" placeholder="1200" value={c.minHomeSqFt} onChange={e=>up("minHomeSqFt",e.target.value)} suffix="ft²" />
          <Input label="Max Home Sq Ft" type="number" placeholder="3000" value={c.maxHomeSqFt} onChange={e=>up("maxHomeSqFt",e.target.value)} suffix="ft²" />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Input label="Min Lot Sq Ft" type="number" placeholder="5000" value={c.minLotSqFt} onChange={e=>up("minLotSqFt",e.target.value)} suffix="ft²" />
          <Input label="Max Lot Sq Ft" type="number" placeholder="40000" value={c.maxLotSqFt} onChange={e=>up("maxLotSqFt",e.target.value)} suffix="ft²" />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          <Select label="Stories" value={c.stories} onChange={v=>up("stories",v)} placeholder="Any" options={[{value:"1",label:"1 (Bungalow)"},{value:"1.5",label:"1.5"},{value:"2",label:"2"},{value:"2.5",label:"2.5"},{value:"3",label:"3+"}]} />
          <Input label="Year Built (Min)" type="number" placeholder="1990" value={c.yearBuiltMin} onChange={e=>up("yearBuiltMin",e.target.value)} />
          <Input label="Year Built (Max)" type="number" placeholder="2025" value={c.yearBuiltMax} onChange={e=>up("yearBuiltMax",e.target.value)} />
        </div>
      </div>
    ),
    // 2: Floor-based rooms
    () => (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <p style={{fontSize:14,color:"var(--text-secondary)",margin:0,lineHeight:1.65}}>
          Select a floor, then add rooms to it. Set counts and minimum square footage for each. This tells the AI exactly what layout you need on each level.
        </p>
        <FloorRoomEditor floorRooms={c.floorRooms} setFloorRooms={v => up("floorRooms", typeof v==="function"?v(c.floorRooms):v)} />
      </div>
    ),
    // 3: Features
    () => (
      <div style={{display:"flex",flexDirection:"column",gap:22}}>
        <FeatureTagInput features={c.features} setFeatures={v=>up("features",v)} />
        <Input label="Minimum Parking Spaces" type="number" placeholder="2" value={c.parkingSpaces} onChange={e=>up("parkingSpaces",e.target.value)} />
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={LBL}>Additional Notes</label>
          <textarea placeholder="Any other preferences..." value={c.additionalNotes} onChange={e=>up("additionalNotes",e.target.value)} rows={3} style={{...INP,resize:"vertical",lineHeight:1.55}} />
        </div>
      </div>
    ),
  ];

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"'Manrope',-apple-system,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        :root{--bg:#090B10;--surface:#11141C;--surface-alt:#171B26;--card:#11141C;--border:#222838;--text:#E6EAF2;--text-secondary:#97A0B8;--text-muted:#4E5770;--accent:#E04F5F;--accent-deep:#B83A48;--accent-bg:rgba(224,79,95,.10);--accent-glow:rgba(224,79,95,.15)}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        *{box-sizing:border-box}input::placeholder,textarea::placeholder{color:var(--text-muted)}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
      `}</style>

      <header style={{padding:"18px 28px",borderBottom:"1px solid var(--border)",background:"linear-gradient(180deg,rgba(224,79,95,.03) 0%,transparent 100%)"}}>
        <div style={{maxWidth:1120,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,var(--accent) 0%,#C7374A 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 4px 16px rgba(224,79,95,.25)"}}>⌂</div>
            <div><h1 style={{margin:0,fontSize:20,fontWeight:800,letterSpacing:-.5}}>HomeScope</h1><p style={{margin:0,fontSize:10,color:"var(--text-muted)",letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Canadian Property Intelligence</p></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input
              type="password"
              value={apiKey}
              onChange={e=>setApiKey(e.target.value)}
              placeholder="Gemini API key"
              style={{...INP,width:230,height:34,padding:"0 12px",fontSize:12}}
            />
            <span style={{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:600,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text-muted)"}}>🇨🇦 CAD</span>
            {apiKey.trim() && <button onClick={()=>setApiKey("")} style={{padding:"7px 12px",borderRadius:10,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text-secondary)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Clear Key</button>}
            {searched && results && <button onClick={()=>{setSearched(false);setResults(null);setStep(0);}} style={{padding:"7px 16px",borderRadius:10,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text-secondary)",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>← New Search</button>}
          </div>
        </div>
      </header>

      <main style={{maxWidth:1120,margin:"0 auto",padding:"32px 20px 100px"}}>
        {(!searched||(!loading&&!results&&!error)) && (
          <div style={{opacity:0,animation:"fadeUp .5s .05s forwards"}}>
            <div style={{textAlign:"center",marginBottom:36}}>
              <h2 style={{fontSize:28,fontWeight:800,margin:"0 0 8px",letterSpacing:-.5}}>Find Your Perfect <span style={{color:"var(--accent)"}}>Canadian</span> Home</h2>
              <p style={{color:"var(--text-secondary)",fontSize:14,margin:0,maxWidth:520,marginInline:"auto",lineHeight:1.65}}>Specify every detail — floor-by-floor room layout, features, budget. Our AI searches MLS® and Canadian listing sites for your match.</p>
            </div>
            <div style={{background:"var(--card)",borderRadius:20,border:"1px solid var(--border)",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,.15)"}}>
              <div style={{padding:"26px 30px 0"}}><StepIndicator current={step} total={4} labels={STEP_LABELS} /></div>
              <div style={{padding:"0 30px 26px",minHeight:300}}>{steps[step]()}</div>
              <div style={{padding:"16px 30px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--surface-alt)"}}>
                <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:"10px 22px",borderRadius:11,border:"1.5px solid var(--border)",background:"var(--surface)",color:step===0?"var(--text-muted)":"var(--text-secondary)",fontSize:14,fontWeight:500,cursor:step===0?"default":"pointer",fontFamily:"inherit",opacity:step===0?.4:1}}>← Back</button>
                <div style={{display:"flex",gap:10}}>
                  {step<3 && c.location.trim() && <button onClick={()=>{setStep(3);setTimeout(handleSearch,100);}} style={{padding:"10px 18px",borderRadius:11,border:"1.5px solid var(--border)",background:"transparent",color:"var(--text-muted)",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Skip to Search</button>}
                  {step<3 ? (
                    <button onClick={()=>setStep(s=>s+1)} style={{padding:"10px 28px",borderRadius:11,border:"none",background:"var(--accent)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(224,79,95,.2)"}}>Continue →</button>
                  ) : (
                    <button onClick={handleSearch} disabled={!c.location.trim()} style={{padding:"12px 36px",borderRadius:11,border:"none",background:c.location.trim()?"linear-gradient(135deg,var(--accent) 0%,#C7374A 100%)":"var(--border)",color:"#fff",fontSize:15,fontWeight:700,cursor:c.location.trim()?"pointer":"default",fontFamily:"inherit",boxShadow:c.location.trim()?"0 6px 24px rgba(224,79,95,.3)":"none"}}>🔍 Search Properties</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"70px 20px",gap:24}}>
            <div style={{position:"relative",width:64,height:64}}>
              <div style={{width:64,height:64,borderRadius:"50%",border:"3px solid var(--border)",borderTopColor:"var(--accent)",animation:"spin 1s linear infinite",position:"absolute"}} />
              <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid var(--border)",borderBottomColor:"#B83A48",animation:"spin 1.5s linear infinite reverse",position:"absolute",top:10,left:10}} />
            </div>
            <div style={{textAlign:"center"}}><p style={{fontSize:17,fontWeight:700,margin:"0 0 6px"}}>Searching Canadian Listings</p><p style={{fontSize:13,color:"var(--text-muted)",margin:0,maxWidth:400}}>{loadMsg}</p></div>
          </div>
        )}

        {error && !loading && (
          <div style={{padding:"24px 28px",borderRadius:16,background:"rgba(240,107,107,.08)",border:"1px solid rgba(240,107,107,.2)",color:"#F06B6B",fontSize:14,textAlign:"center",lineHeight:1.6}}>
            {error}<br/><button onClick={()=>{setSearched(false);setError(null);}} style={{marginTop:14,padding:"9px 24px",borderRadius:10,border:"1px solid #F06B6B",background:"transparent",color:"#F06B6B",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Modify Search</button>
          </div>
        )}

        {results && !loading && (
          <div>
            <div style={{padding:"16px 22px",borderRadius:16,background:"linear-gradient(135deg,var(--surface-alt) 0%,var(--card) 100%)",border:"1px solid var(--border)",marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{results.length} {results.length===1?"property":"properties"} near <strong>{c.location}</strong></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>
                  {(c.minPrice||c.maxPrice)&&<Tg>{cad(c.minPrice||0)} – {cad(c.maxPrice||"∞")}</Tg>}
                  {c.dwellingType&&<Tg>{DWELLING_TYPES.find(d=>d.id===c.dwellingType)?.label}</Tg>}
                  <Tg>{c.radiusKm} km</Tg>
                  {c.features.length>0&&<Tg>{c.features.length} features</Tg>}
                </div>
              </div>
              <div style={{padding:"6px 14px",borderRadius:20,background:"var(--accent-bg)",color:"var(--accent)",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"var(--accent)",animation:"pulse 2s infinite",display:"inline-block"}}/>AI-Powered
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {results.map((p,i)=><PropertyCard key={i} property={p} index={i}/>)}
            </div>
            <div style={{textAlign:"center",marginTop:32,padding:"20px",borderRadius:16,background:"var(--surface-alt)",border:"1px solid var(--border)"}}>
              <p style={{fontSize:12,color:"var(--text-muted)",margin:0,lineHeight:1.65}}>Verify details with the listing brokerage. MLS® is a trademark of CREA. Estimates are AI approximations. All prices CAD.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
