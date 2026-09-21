const fs=require("fs");
const env=fs.readFileSync(".env.local","utf8");
const get=k=>{let v=(env.match(new RegExp("^"+k+"=(.*)$","m"))||[])[1]||"";return v.trim().replace(/^["']|["']$/g,"");};
const url=get("NEXT_PUBLIC_SUPABASE_URL"), key=get("SUPABASE_SERVICE_ROLE_KEY")||get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\|.*$/,"").replace(/[^a-z0-9]+/g," ").replace(/\b(the|bar|cocktail|lounge|cafe|restaurant|club)\b/g,"").replace(/\s+/g," ").trim();
(async()=>{
 let bars=[],from=0;
 while(true){
  const r=await fetch(`${url}/rest/v1/bars?select=slug,name,city,country,accolades&limit=1000&offset=${from}`,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const j=await r.json(); if(!Array.isArray(j))break; bars=bars.concat(j); if(j.length<1000)break; from+=1000;
 }
 const list=JSON.parse(fs.readFileSync("Claude outputs/falstaff/paste-87-88.json","utf8"));
 const have=[],miss=[];
 for(const f of list){
  const fn=norm(f.name);
  const hit=bars.find(b=>{
    const bn=norm(b.name);
    const sameCity=norm(b.city)===norm(f.city)||norm(b.country)===norm(f.country);
    return sameCity && (bn===fn || (fn.length>3 && (bn.includes(fn)||fn.includes(bn))));
  });
  if(hit) have.push({...f,slug:hit.slug,dbname:hit.name,dbcity:hit.city}); else miss.push(f);
 }
 console.log("HAVE ("+have.length+"):");
 for(const h of have) console.log("  "+h.name+"  ->  /bars/"+h.slug+"  ("+h.dbname+", "+h.dbcity+")");
 console.log("\nMISSING ("+miss.length+")  [kind]:");
 const byC={};
 for(const m of miss){ (byC[m.country]=byC[m.country]||[]).push(m); }
 for(const c of Object.keys(byC).sort()){ console.log("  "+c+" ("+byC[c].length+"):"); for(const m of byC[c]) console.log("     "+m.points+"  "+m.name+"  ("+m.city+")"+(m.kind!=="bars"?"  ["+m.kind+"]":"")); }
 // also: what do we hold in these countries already
 const cnt={};
 for(const b of bars){ if(["Austria","Germany","Switzerland"].includes(b.country)) cnt[b.country]=(cnt[b.country]||0)+1; }
 console.log("\nDB today: "+JSON.stringify(cnt));
 const falst=bars.filter(b=>JSON.stringify(b.accolades||"").toLowerCase().includes("falstaff")).length;
 console.log("bars with a Falstaff accolade already: "+falst);
})();
