const fs=require("fs");
const env=fs.readFileSync(".env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
(async()=>{
 let out=[],from=0;
 while(true){
  const r=await fetch(`${url}/rest/v1/bars?select=city,type,subtypes&is_active=is.true&limit=1000&offset=${from}`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j)){console.error(JSON.stringify(j));break;}
  out=out.concat(j); if(j.length<1000)break; from+=1000;
 }
 const vocab={}, types={}, withSub=out.filter(b=>Array.isArray(b.subtypes)&&b.subtypes.length).length;
 for(const b of out){
  types[b.type||"(null)"]=(types[b.type||"(null)"]||0)+1;
  for(const s of (Array.isArray(b.subtypes)?b.subtypes:[])) vocab[s]=(vocab[s]||0)+1;
 }
 console.log("total active bars: "+out.length+"   with >=1 subtype: "+withSub);
 console.log("\nsubtype vocabulary:");
 for(const [k,v] of Object.entries(vocab).sort((a,b)=>b[1]-a[1])) console.log("  "+String(v).padStart(4)+"  "+k);
 console.log("\n`type` column:");
 for(const [k,v] of Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,15)) console.log("  "+String(v).padStart(4)+"  "+k);
})();
