const fs=require("fs");
const env=fs.readFileSync(".env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
(async()=>{
 let out=[],from=0;
 while(true){
  const r=await fetch(`${url}/rest/v1/bars?select=city,city_ascii,subtypes,photos&is_active=is.true&limit=1000&offset=${from}`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j)){console.error(JSON.stringify(j));break;}
  out=out.concat(j); if(j.length<1000)break; from+=1000;
 }
 const m={};
 for(const b of out){
  const k=(b.city||"").trim(); if(!k)continue;
  m[k]=m[k]||{n:0,sub:{}};
  m[k].n++;
  const s=Array.isArray(b.subtypes)?b.subtypes:[];
  for(const t of s){ m[k].sub[t]=(m[k].sub[t]||0)+1; }
 }
 for(const k of Object.keys(m).sort()){
  const s=Object.entries(m[k].sub).filter(([,v])=>v>=4).sort((a,b)=>b[1]-a[1]).map(([t,v])=>t+":"+v).join(",");
  console.log([k,m[k].n,s].join("\t"));
 }
})();
