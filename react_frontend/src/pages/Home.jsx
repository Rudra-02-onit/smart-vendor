import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ITEMS = [
  { emoji:"🍅", name:"Tomato",      delay:0    },
  { emoji:"🥕", name:"Carrot",      delay:0.15 },
  { emoji:"🥦", name:"Broccoli",    delay:0.3  },
  { emoji:"🍎", name:"Apple",       delay:0.45 },
  { emoji:"🌽", name:"Corn",        delay:0.6  },
  { emoji:"🥑", name:"Avocado",     delay:0.75 },
  { emoji:"🍋", name:"Lemon",       delay:0.9  },
  { emoji:"🫑", name:"Capsicum",    delay:1.05 },
  { emoji:"🍇", name:"Grapes",      delay:1.2  },
  { emoji:"🥝", name:"Kiwi",        delay:1.35 },
  { emoji:"🫛", name:"Peas",        delay:1.5  },
  { emoji:"🧅", name:"Onion",       delay:1.65 },
];

export default function Home() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #f9fff5 0%, #e8f5e9 40%, #f1f8e9 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", overflow:"hidden", position:"relative",
      fontFamily:"system-ui,sans-serif",
    }}>

      {/* BG decorative circles */}
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(46,125,50,0.06)",top:-150,right:-150,pointerEvents:"none"}} />
      <div style={{position:"absolute",width:350,height:350,borderRadius:"50%",background:"rgba(46,125,50,0.05)",bottom:-100,left:-100,pointerEvents:"none"}} />

      {/* ── BOUNCING FRUITS GRID ── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(6,1fr)",
        gap:"12px 16px",
        marginBottom:32,
        opacity: entered ? 1 : 0,
        transition:"opacity 0.5s",
      }}>
        {ITEMS.map((item, i) => (
          <div key={i} style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            animation:`bounce 2s ease-in-out infinite`,
            animationDelay:`${item.delay}s`,
            animationFillMode:"both",
          }}>
            <div style={{
              fontSize:44,
              filter:"drop-shadow(0 6px 12px rgba(0,0,0,0.15))",
              lineHeight:1,
              animation:`bucketDrop 0.6s ease-out both`,
              animationDelay:`${item.delay + 0.1}s`,
            }}>
              {item.emoji}
            </div>
            <span style={{fontSize:9,color:"#888",marginTop:4,fontWeight:"bold",textTransform:"uppercase",letterSpacing:0.5}}>
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* ── LOGO + TITLE ── */}
      <div style={{
        textAlign:"center",
        animation:"fadeUp 0.8s ease-out both",
        animationDelay:"0.5s",
        marginBottom:28,
      }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:14,
          background:"white",
          borderRadius:24,
          padding:"16px 28px",
          boxShadow:"0 8px 30px rgba(46,125,50,0.2)",
          marginBottom:16,
          border:"2px solid rgba(46,125,50,0.15)",
        }}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:"linear-gradient(135deg,#1b5e20,#43a047)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28,
            boxShadow:"0 4px 16px rgba(46,125,50,0.4)",
            animation:"pulse 2s ease-in-out infinite",
          }}>🌿</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:28,fontWeight:900,color:"#1b5e20",lineHeight:1}}>FreshMart</div>
            <div style={{fontSize:12,color:"#888",fontWeight:600,letterSpacing:1}}>Smart Vendor Platform</div>
          </div>
        </div>

        <h1 style={{fontSize:"clamp(22px,4vw,36px)",fontWeight:900,color:"#1b5e20",marginBottom:10,lineHeight:1.2}}>
          Fresh Vegetables & Groceries
        </h1>
        <p style={{color:"#666",fontSize:16,maxWidth:440,lineHeight:1.6,margin:"0 auto 24px"}}>
          Direct from local vendors • Best prices • Fast delivery to your door
        </p>

        {/* Stats bar */}
        <div style={{
          display:"flex", gap:24, justifyContent:"center",
          marginBottom:28, flexWrap:"wrap",
        }}>
          {[
            {n:"500+",l:"Happy Customers"},
            {n:"50+", l:"Local Vendors"},
            {n:"200+",l:"Products"},
            {n:"⚡",  l:"Same Day Delivery"},
          ].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:900,color:"#1b5e20"}}>{s.n}</div>
              <div style={{fontSize:11,color:"#888"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>navigate("/login")} style={{
            padding:"14px 36px",
            background:"linear-gradient(135deg,#1b5e20,#2e7d32,#43a047)",
            color:"white", border:"none", borderRadius:50,
            fontSize:16, fontWeight:800, cursor:"pointer",
            boxShadow:"0 8px 25px rgba(46,125,50,0.45)",
            transition:"transform 0.2s",
          }}
            onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
            onMouseLeave={e=>e.target.style.transform="scale(1)"}>
            Login →
          </button>
          <button onClick={()=>navigate("/register")} style={{
            padding:"14px 36px",
            background:"white", color:"#1b5e20",
            border:"2.5px solid #2e7d32", borderRadius:50,
            fontSize:16, fontWeight:800, cursor:"pointer",
            transition:"transform 0.2s",
          }}
            onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
            onMouseLeave={e=>e.target.style.transform="scale(1)"}>
            Register Free
          </button>
        </div>
      </div>

      {/* ── POSTER CARDS (slidable) ── */}
      <div style={{
        width:"100%", maxWidth:800, padding:"0 16px",
        animation:"fadeUp 0.8s ease-out both",
        animationDelay:"0.8s",
      }}>
        <div style={{
          display:"flex", gap:12, overflowX:"auto",
          paddingBottom:12,
          scrollbarWidth:"none",
        }}>
          {[
            {emoji:"🥕",name:"Fresh Veggies", price:"From ₹20/kg", bg:"linear-gradient(135deg,#e8f5e9,#c8e6c9)", color:"#1b5e20", badge:"30% OFF"},
            {emoji:"🍎",name:"Fresh Fruits",  price:"From ₹40/kg", bg:"linear-gradient(135deg,#fff3e0,#ffe0b2)", color:"#e65100", badge:"NEW"},
            {emoji:"🥛",name:"Dairy Fresh",   price:"From ₹25/L",  bg:"linear-gradient(135deg,#e3f2fd,#bbdefb)", color:"#1565c0", badge:"DAILY"},
            {emoji:"🌾",name:"Organic",       price:"From ₹15/kg", bg:"linear-gradient(135deg,#f3e5f5,#e1bee7)", color:"#6a1b9a", badge:"ORGANIC"},
            {emoji:"🌿",name:"Herbs",         price:"From ₹10",    bg:"linear-gradient(135deg,#e0f2f1,#b2dfdb)", color:"#00695c", badge:"FRESH"},
          ].map((p,i)=>(
            <div key={i} onClick={()=>navigate("/login")} style={{
              background:p.bg,
              borderRadius:16, padding:"18px 20px",
              minWidth:160, flexShrink:0, cursor:"pointer",
              boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
              border:"1px solid rgba(255,255,255,0.8)",
              transition:"transform 0.2s",
              position:"relative",
            }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <div style={{
                position:"absolute",top:10,right:10,
                background:p.color, color:"white",
                fontSize:9,fontWeight:900,
                padding:"3px 7px",borderRadius:20,letterSpacing:0.5,
              }}>{p.badge}</div>
              <div style={{fontSize:40,marginBottom:8}}>{p.emoji}</div>
              <div style={{fontWeight:800,color:p.color,fontSize:14}}>{p.name}</div>
              <div style={{color:"#555",fontSize:12,marginTop:3}}>{p.price}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{color:"#aaa",fontSize:11,marginTop:20}}>© 2026 Smart Vendor · FreshMart Platform</p>
    </div>
  );
}
