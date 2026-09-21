const fs=require("fs");
const env=fs.readFileSync(process.env.HOME+"/mnt/barmagazine-next/.env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
(async()=>{
 let out=[],from=0;
 while(true){
  const r=await fetch(`${url}/rest/v1/bars?select=slug,photos,tier,description,accolades,wp_article_slug&is_active=is.true&limit=1000&offset=${from}`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j)){console.error(JSON.stringify(j));break;}
  out=out.concat(j); if(j.length<1000)break; from+=1000;
 }
 for(const b of out){
  const ph=Array.isArray(b.photos)?b.photos.length:(b.photos?Object.keys(b.photos).length:0);
  const desc=(b.description||"").length;
  const acc=Array.isArray(b.accolades)?b.accolades.length:(b.accolades?Object.keys(b.accolades).length:0);
  console.log([b.slug,ph,desc,acc,b.tier||"",b.wp_article_slug?1:0].join("\t"));
 }
})();
