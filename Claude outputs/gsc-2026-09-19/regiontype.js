const fs=require("fs");
const env=fs.readFileSync(".env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const EU=["United Kingdom","Ireland","France","Spain","Portugal","Italy","Germany","Austria","Switzerland","Netherlands","Belgium","Denmark","Sweden","Norway","Finland","Iceland","Poland","Czechia","Czech Republic","Slovakia","Hungary","Croatia","Slovenia","Serbia","Greece","Romania","Bulgaria","Estonia","Latvia","Lithuania","Luxembourg","Malta","Monaco","Turkey","Ukraine"];
const ASIA=["Japan","China","Hong Kong","Macau","Taiwan","South Korea","Singapore","Malaysia","Thailand","Vietnam","Indonesia","Philippines","India","Sri Lanka","Cambodia","Laos","Myanmar","Nepal","Bangladesh","Mongolia"];
const ME=["United Arab Emirates","Saudi Arabia","Qatar","Bahrain","Kuwait","Oman","Israel","Jordan","Lebanon"];
const LATAM=["Mexico","Brazil","Argentina","Chile","Peru","Colombia","Uruguay","Ecuador","Bolivia","Paraguay","Venezuela","Costa Rica","Panama","Guatemala","Puerto Rico","Cuba","Dominican Republic","Jamaica"];
const OCE=["Australia","New Zealand","Fiji"];
const AFR=["South Africa","Morocco","Egypt","Kenya","Nigeria","Tanzania","Ghana","Ethiopia","Tunisia","Mauritius"];
const NA=["United States","Canada"];
function region(c){ if(EU.includes(c))return"Europe"; if(ASIA.includes(c))return"Asia"; if(ME.includes(c))return"Middle East"; if(LATAM.includes(c))return"Latin America & Caribbean"; if(OCE.includes(c))return"Oceania"; if(AFR.includes(c))return"Africa"; if(NA.includes(c))return"North America"; return"(unmapped: "+c+")"; }
(async()=>{
 let out=[],from=0;
 while(true){
  const r=await fetch(`${url}/rest/v1/bars?select=city,country,state,type,subtypes,accolades,editorial_sources&is_active=is.true&limit=1000&offset=${from}`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j)){console.error(JSON.stringify(j));break;}
  out=out.concat(j); if(j.length<1000)break; from+=1000;
 }
 const cnt=x=>Array.isArray(x)?x.length:(x&&typeof x==="object"?Object.keys(x).length:0);
 const kinds=b=>{ const s=new Set(Array.isArray(b.subtypes)?b.subtypes:[]); if(b.type) s.add(b.type); return [...s]; };
 const box={}, unmapped={};
 for(const b of out){
  const rg=region((b.country||"").trim());
  if(rg.startsWith("(unmapped")) unmapped[b.country]=(unmapped[b.country]||0)+1;
  const merit=cnt(b.accolades)>0||cnt(b.editorial_sources)>0;
  for(const k of kinds(b)){
   const key=rg+"||"+k; box[key]=box[key]||{n:0,m:0}; box[key].n++; if(merit)box[key].m++;
   if((b.country||"")==="United States"&&b.state){ const k2="US-"+b.state+"||"+k; box[k2]=box[k2]||{n:0,m:0}; box[k2].n++; if(merit)box[k2].m++; }
   if((b.country||"")==="United Arab Emirates"){ const k3="UAE||"+k; box[k3]=box[k3]||{n:0,m:0}; box[k3].n++; if(merit)box[k3].m++; }
  }
 }
 const rowsOut=Object.entries(box).filter(([k,v])=>v.n>=6&&!k.startsWith("(unmapped")).sort((a,b)=>b[1].n-a[1].n);
 console.log("REGION x TYPE, bars>=6   (bars / with merit)");
 for(const [k,v] of rowsOut){ const [r,t]=k.split("||"); console.log("  "+String(v.n).padStart(4)+" / "+String(v.m).padStart(3)+"   "+r+"  ->  "+t); }
 console.log("\nunmapped countries: "+JSON.stringify(unmapped));
})();
