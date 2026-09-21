const fs=require("fs");
const env=fs.readFileSync(".env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const cnt=x=>Array.isArray(x)?x.length:(x&&typeof x==="object"?Object.keys(x).length:0);
(async()=>{
 let out=[],from=0;
 while(true){
  const r=await fetch(`${url}/rest/v1/bars?select=city,country,accolades,editorial_sources,photos,subtypes,description&is_active=is.true&limit=1000&offset=${from}`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j)){console.error(JSON.stringify(j));break;}
  out=out.concat(j); if(j.length<1000)break; from+=1000;
 }
 const m={};
 for(const b of out){
  const k=(b.city||"").trim(); if(!k)continue;
  m[k]=m[k]||{n:0,merit:0,acc:0,ph:0,country:b.country||""};
  m[k].n++;
  if(cnt(b.accolades)>0) m[k].acc++;
  if(cnt(b.accolades)>0||cnt(b.editorial_sources)>0) m[k].merit++;
  if(cnt(b.photos)>0) m[k].ph++;
 }
 for(const k of Object.keys(m).sort()){
  const v=m[k];
  const slug=k.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  console.log([slug,k,v.n,v.acc,v.merit,v.ph,v.country].join("\t"));
 }
})();
