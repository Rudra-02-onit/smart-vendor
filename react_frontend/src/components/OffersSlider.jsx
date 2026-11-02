import { useEffect, useState } from "react";

const OFFERS = [
  { emoji:"🥕🍅🥦", title:"Fresh Vegetables",  desc:"Farm-fresh daily • Best quality guaranteed",     price:"From ₹20/kg", bg:"linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)", badge:"30% OFF",    textColor:"white" },
  { emoji:"🍎🍋🍇", title:"Seasonal Fruits",    desc:"Hand-picked seasonal fruits • Sweet & juicy",    price:"From ₹40/kg", bg:"linear-gradient(135deg,#e65100,#f57c00,#ffa726)", badge:"NEW ARRIVALS",textColor:"white" },
  { emoji:"🥛🧀🥚", title:"Fresh Dairy",        desc:"Pure & fresh every morning • Direct from farms", price:"From ₹25/L",  bg:"linear-gradient(135deg,#1565c0,#1976d2,#42a5f5)", badge:"DAILY FRESH", textColor:"white" },
  { emoji:"🌾🫘🌽", title:"Organic Grocery",   desc:"Chemical-free • Healthy for your family",        price:"From ₹15/kg", bg:"linear-gradient(135deg,#4a148c,#6a1b9a,#ab47bc)", badge:"ORGANIC",     textColor:"white" },
  { emoji:"🌿🌶️🧅", title:"Herbs & Spices",   desc:"Fresh herbs • Authentic flavors • Local vendors",price:"From ₹10",    bg:"linear-gradient(135deg,#004d40,#00695c,#26a69a)", badge:"FRESH PICK",  textColor:"white" },
];

export default function OffersSlider() {
  const [curr, setCurr] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurr(c => (c+1) % OFFERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const O = OFFERS[curr];

  return (
    <div style={{position:"relative",marginBottom:20}}>
      {/* Main slide */}
      <div style={{
        background: O.bg,
        borderRadius:16, overflow:"hidden",
        height:150, position:"relative",
        cursor:"pointer", transition:"all 0.5s",
        boxShadow:"0 8px 25px rgba(0,0,0,0.15)",
      }}>
        {/* BG emoji */}
        <div style={{position:"absolute",right:-10,top:-10,fontSize:120,opacity:0.1,lineHeight:1}}>{O.emoji}</div>

        <div style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",height:"100%",boxSizing:"border-box"}}>
          <div style={{zIndex:1}}>
            <span style={{background:"rgba(255,255,255,0.25)",color:O.textColor,fontSize:9,fontWeight:900,padding:"3px 10px",borderRadius:20,letterSpacing:1,marginBottom:8,display:"inline-block"}}>{O.badge}</span>
            <h2 style={{color:O.textColor,margin:"5px 0 6px",fontSize:22,fontWeight:900,lineHeight:1}}>{O.title}</h2>
            <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,margin:"0 0 8px",maxWidth:280}}>{O.desc}</p>
            <span style={{background:"rgba(255,255,255,0.2)",color:"white",padding:"5px 12px",borderRadius:20,fontSize:13,fontWeight:900}}>{O.price}</span>
          </div>
          <div style={{fontSize:72,filter:"drop-shadow(0 8px 16px rgba(0,0,0,0.3))",flexShrink:0,zIndex:1}}>{O.emoji.split("")[0]}</div>
        </div>
      </div>

      {/* Dots */}
      <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
        {OFFERS.map((_,i)=>(
          <div key={i} onClick={()=>setCurr(i)}
            style={{width:i===curr?24:7,height:7,borderRadius:4,background:i===curr?"#1b5e20":"#c8e6c9",transition:"all 0.3s",cursor:"pointer"}} />
        ))}
      </div>

      {/* Small offer tiles */}
      <div style={{display:"flex",gap:10,marginTop:12,overflowX:"auto",paddingBottom:6}}>
        {OFFERS.map((o,i)=>(
          <div key={i} onClick={()=>setCurr(i)}
            style={{
              background:i===curr?o.bg:"white",
              borderRadius:12, padding:"12px 16px",
              minWidth:130, flexShrink:0, cursor:"pointer",
              border:i===curr?"none":"1px solid #e0e0d8",
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
              transition:"all 0.2s",
              transform:i===curr?"scale(1.02)":"scale(1)",
            }}>
            <div style={{fontSize:24,marginBottom:4}}>{o.emoji.split("")[0]}</div>
            <div style={{fontWeight:800,fontSize:12,color:i===curr?"white":"#333",lineHeight:1.2}}>{o.title}</div>
            <div style={{fontSize:11,color:i===curr?"rgba(255,255,255,0.8)":"#e65100",fontWeight:"bold",marginTop:3}}>{o.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
