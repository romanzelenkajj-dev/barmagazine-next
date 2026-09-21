const fs=require("fs");
const env=fs.readFileSync(".env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const cities=["Seoul","Taipei","Madrid","Shanghai","Montreal","Macau","Osaka","Split","Helsinki","Vienna","Bangkok","Tokyo","Hong Kong","Sydney","Melbourne","Budapest","Las Vegas","Boston","Toronto","Bengaluru"];
const cnt=x=>Array.isArray(x)?x.length:(x&&typeof x==="object"?Object.keys(x).length:0);
(async()=>{
 for(const c of cities){
  const r=await fetch(`${url}/rest/v1/bars?select=slug,accolades,editorial_sources,subtypes,photos,editorial_pick&city=eq.${encodeURIComponent(c)}&is_active=is.true&limit=1000`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j)){console.log(c,"ERR");continue;}
  const acc=j.filter(b=>cnt(b.accolades)>0).length;
  const ed=j.filter(b=>cnt(b.editorial_sources)>0).length;
  const merit=j.filter(b=>cnt(b.accolades)>0||cnt(b.editorial_sources)>0).length;
  const sub=j.filter(b=>cnt(b.subtypes)>0).length;
  console.log([c,j.length,acc,ed,merit,sub].join("\t"));
 }
})();
