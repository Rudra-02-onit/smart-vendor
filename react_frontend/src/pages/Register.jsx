import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name:"", email:"", phone:"", address:"",
    password:"", confirm_password:"", role:"customer",
    id_proof_number:"", tax_number:"", bank_name:"",
    account_holder_name:"", account_number:"", ifsc_code:"",
  });
  const [idProofDoc, setIdProofDoc] = useState(null);
  const [taxDoc,     setTaxDoc]     = useState(null);
  const [message,    setMessage]    = useState("");
  const [msgType,    setMsgType]    = useState("error");
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState(1);

  const set = (e) => setForm({...form, [e.target.name]: e.target.value});

  // ── Validations ──
  const phoneOk = (p) => /^[6-9][0-9]{9}$/.test(p);
  const passRules = (p) => ({
    len:     p.length >= 8 && p.length <= 12,
    upper:   /[A-Z]/.test(p),
    special: /[@#$*!%^&]/.test(p),
    number:  /[0-9]/.test(p),
  });
  const passOk = (p) => { const r=passRules(p); return r.len&&r.upper&&r.special&&r.number; };

  const handleNext = (e) => {
    e.preventDefault();
    setMessage("");
    if (!phoneOk(form.phone)) {
      setMessage("Phone must be 10 digits and start with 6, 7, 8 or 9.");
      setMsgType("error"); return;
    }
    if (!passOk(form.password)) {
      setMessage("Password needs: 8+ chars, 1 uppercase (A-Z), 1 special (@#$*!%^&), 1 number.");
      setMsgType("error"); return;
    }
    if (form.password !== form.confirm_password) {
      setMessage("Passwords do not match."); setMsgType("error"); return;
    }
    if (form.role === "vendor") { setStep(2); return; }
    submit();
  };

  const submit = async () => {
    setLoading(true);
    setMessage("");
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    if (form.role === "vendor") {
      if (!idProofDoc) { setMessage("Upload ID proof document."); setMsgType("error"); setLoading(false); return; }
      if (!taxDoc)     { setMessage("Upload tax document.");       setMsgType("error"); setLoading(false); return; }
      fd.append("id_proof_document", idProofDoc);
      fd.append("tax_document",      taxDoc);
    }
    try {
      const res  = await fetch("http://localhost/backend/register.php", { method:"POST", credentials:"include", body:fd });
      const data = await res.json();
      setMsgType(data.success ? "success" : "error");
      setMessage(data.message);
      if (data.success && form.role === "customer") setTimeout(()=>navigate("/login"), 1800);
    } catch {
      setMsgType("error"); setMessage("Server connection failed.");
    } finally { setLoading(false); }
  };

  const r = passRules(form.password);
  const isVendor = form.role === "vendor";

  return (
    <div style={S.page}>
      <div style={{...S.blob, width:500, height:500, top:-150, right:-150, background:"radial-gradient(circle, rgba(67,160,71,0.25), transparent 70%)"}} />
      <div style={{...S.blob, width:350, height:350, bottom:-100, left:-80,  background:"radial-gradient(circle, rgba(46,125,50,0.2),  transparent 70%)"}} />

      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.hIcon}>🥬</div>
          <h1 style={S.hTitle}>Smart Vendor</h1>
          <p style={S.hSub}>Create your account</p>
          {/* Role Toggle */}
          <div style={S.toggle}>
            {["customer","vendor"].map(r=>(
              <button key={r} type="button"
                onClick={()=>{setForm({...form,role:r}); setStep(1); setMessage("");}}
                style={{...S.tBtn, ...(form.role===r ? S.tBtnOn : {})}}>
                {r==="customer" ? "👤 Customer" : "🏪 Vendor"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress for vendor */}
        {isVendor && (
          <div style={S.progress}>
            {["1. Basic Info","2. Documents"].map((l,i)=>(
              <>
                <div key={l} style={{...S.pStep, ...(step>=i+1?S.pOn:{})}}>
                  <div style={{...S.pDot, ...(step>=i+1?S.pDotOn:{})}}>{i+1}</div>
                  <span>{l}</span>
                </div>
                {i===0 && <div style={S.pLine}/>}
              </>
            ))}
          </div>
        )}

        <div style={S.body}>
          {message && (
            <div style={msgType==="success" ? S.sBox : S.eBox}>{message}</div>
          )}

          {/* ── STEP 1 ── */}
          {step===1 && (
            <form onSubmit={handleNext}>
              <div style={S.row}>
                <Field label="Full Name *">
                  <input name="name" type="text" placeholder="Rahul Kumar"
                    value={form.name} onChange={set} required style={S.inp} />
                </Field>
                <Field label="Email *">
                  <input name="email" type="email" placeholder="rahul@email.com"
                    value={form.email} onChange={set} required style={S.inp} />
                </Field>
              </div>

              <Field label="Phone Number *">
                <div style={{position:"relative"}}>
                  <span style={S.prefix}>+91</span>
                  <input name="phone" type="tel" placeholder="9876543210"
                    value={form.phone}
                    onChange={e=>{
                      const v=e.target.value.replace(/\D/g,"").slice(0,10);
                      setForm({...form, phone:v});
                    }}
                    required maxLength={10}
                    style={{...S.inp, paddingLeft:52}} />
                </div>
                {form.phone.length>0 && (
                  <small style={{color: phoneOk(form.phone)?"#2e7d32":"#e53935", fontSize:12, marginTop:4, display:"block"}}>
                    {phoneOk(form.phone) ? "✅ Valid number" : "❌ Must be 10 digits, start with 6-9"}
                  </small>
                )}
              </Field>

              <Field label="Address *">
                <textarea name="address" placeholder="Enter your full address"
                  value={form.address} onChange={set} required
                  style={{...S.inp, minHeight:70, resize:"vertical"}} />
              </Field>

              <div style={S.row}>
                <Field label="Password *">
                  <input name="password" type="password" placeholder="e.g. Rahul@123"
                    value={form.password} onChange={set} required style={S.inp} />
                  {form.password && (
                    <div style={{marginTop:6, display:"flex", flexDirection:"column", gap:2}}>
                      {[
                        {ok:r.len,     txt:"8-12 characters"},
                        {ok:r.upper,   txt:"1 Uppercase (A-Z)"},
                        {ok:r.special, txt:"1 Special (@#$*!%^&)"},
                        {ok:r.number,  txt:"1 Number (0-9)"},
                      ].map(x=>(
                        <small key={x.txt} style={{fontSize:11, color:x.ok?"#2e7d32":"#e53935"}}>
                          {x.ok?"✅":"❌"} {x.txt}
                        </small>
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="Confirm Password *">
                  <input name="confirm_password" type="password" placeholder="Re-enter password"
                    value={form.confirm_password} onChange={set} required style={S.inp} />
                  {form.confirm_password && (
                    <small style={{fontSize:12, color: form.password===form.confirm_password?"#2e7d32":"#e53935"}}>
                      {form.password===form.confirm_password ? "✅ Match" : "❌ No match"}
                    </small>
                  )}
                </Field>
              </div>

              <button type="submit" style={S.btn}>
                {isVendor ? "Next: Documents →" : (loading ? "Creating..." : "Create Account ✓")}
              </button>
            </form>
          )}

          {/* ── STEP 2 - Vendor Docs ── */}
          {step===2 && isVendor && (
            <form onSubmit={e=>{e.preventDefault(); submit();}}>
              <div style={S.secHead}>📄 Documents</div>
              <div style={S.row}>
                <Field label="ID Proof Number *">
                  <input name="id_proof_number" type="text" placeholder="Aadhaar / PAN"
                    value={form.id_proof_number} onChange={set} required style={S.inp} />
                </Field>
                <Field label="Tax Number *">
                  <input name="tax_number" type="text" placeholder="GST Number"
                    value={form.tax_number} onChange={set} required style={S.inp} />
                </Field>
              </div>
              <div style={S.row}>
                <Field label="ID Proof Document *">
                  <label style={S.fileLbl}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={e=>setIdProofDoc(e.target.files[0])} style={{display:"none"}} />
                    📎 {idProofDoc ? idProofDoc.name : "Choose file..."}
                  </label>
                </Field>
                <Field label="Tax Document *">
                  <label style={S.fileLbl}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={e=>setTaxDoc(e.target.files[0])} style={{display:"none"}} />
                    📎 {taxDoc ? taxDoc.name : "Choose file..."}
                  </label>
                </Field>
              </div>

              <div style={S.secHead}>🏦 Bank Details</div>
              <div style={S.row}>
                <Field label="Bank Name *">
                  <input name="bank_name" type="text" placeholder="SBI / HDFC"
                    value={form.bank_name} onChange={set} required style={S.inp} />
                </Field>
                <Field label="Account Holder *">
                  <input name="account_holder_name" type="text" placeholder="Full name"
                    value={form.account_holder_name} onChange={set} required style={S.inp} />
                </Field>
                <Field label="Account Number *">
                  <input name="account_number" type="text" placeholder="Account number"
                    value={form.account_number} onChange={set} required style={S.inp} />
                </Field>
                <Field label="IFSC Code *">
                  <input name="ifsc_code" type="text" placeholder="SBIN0001234"
                    value={form.ifsc_code} onChange={set} required style={S.inp} />
                </Field>
              </div>

              <div style={{display:"flex", gap:10, marginTop:8}}>
                <button type="button" onClick={()=>setStep(1)} style={S.backBtn}>← Back</button>
                <button type="submit" disabled={loading} style={{...S.btn, flex:1, margin:0}}>
                  {loading ? "Submitting..." : "Submit Application ✓"}
                </button>
              </div>
            </form>
          )}

          <p style={{textAlign:"center", marginTop:20, color:"#666", fontSize:13}}>
            Already have an account? <Link to="/login" style={{color:"#2e7d32", fontWeight:"bold", textDecoration:"none"}}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Small helper component
function Field({label, children}) {
  return (
    <div style={{marginBottom:16, flex:1}}>
      <label style={{display:"block", marginBottom:6, fontWeight:700, color:"#333", fontSize:13}}>{label}</label>
      {children}
    </div>
  );
}

const S = {
  page: {
    minHeight:"100vh",
    background:"linear-gradient(135deg, #071a07 0%, #0d2e0d 30%, #1b5e20 60%, #0a1f0a 100%)",
    display:"flex", justifyContent:"center", alignItems:"flex-start",
    padding:"30px 16px", position:"relative", overflow:"hidden",
  },
  blob: { position:"absolute", borderRadius:"50%", filter:"blur(70px)", pointerEvents:"none" },
  card: {
    width:"100%", maxWidth:680, borderRadius:24, overflow:"hidden",
    boxShadow:"0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
    position:"relative", zIndex:1, background:"white",
  },
  header: {
    background:"linear-gradient(135deg, #1b5e20, #2e7d32)",
    padding:"32px 32px 24px", textAlign:"center",
  },
  hIcon:  { fontSize:48, marginBottom:8, filter:"drop-shadow(0 0 15px rgba(129,199,132,0.8))", display:"block" },
  hTitle: { color:"white", fontSize:26, fontWeight:900, margin:"0 0 4px" },
  hSub:   { color:"rgba(255,255,255,0.75)", fontSize:14, marginBottom:18 },
  toggle: { display:"flex", background:"rgba(0,0,0,0.2)", borderRadius:10, padding:4, gap:4, maxWidth:280, margin:"0 auto" },
  tBtn:   { flex:1, padding:"10px 0", border:"none", borderRadius:7, background:"transparent", color:"rgba(255,255,255,0.7)", fontWeight:"bold", cursor:"pointer", fontSize:14 },
  tBtnOn: { background:"white", color:"#2e7d32" },
  progress: { display:"flex", alignItems:"center", padding:"16px 32px 0", gap:6 },
  pStep: { display:"flex", alignItems:"center", gap:6, color:"#aaa", fontSize:13, fontWeight:"bold" },
  pOn:   { color:"#2e7d32" },
  pDot:  { width:24, height:24, borderRadius:"50%", background:"#eee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:"bold", color:"#aaa" },
  pDotOn:{ background:"#2e7d32", color:"white" },
  pLine: { flex:1, height:2, background:"#eee" },
  body:  { padding:"24px 32px 32px" },
  row:   { display:"flex", gap:14, flexWrap:"wrap" },
  inp: {
    width:"100%", padding:"11px 14px", border:"2px solid #e8f5e9",
    borderRadius:10, fontSize:14, boxSizing:"border-box",
    outline:"none", background:"#f9fff9", color:"#1b5e20",
    fontFamily:"inherit",
  },
  prefix: { position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#555", fontWeight:"bold", fontSize:13, pointerEvents:"none" },
  fileLbl: {
    display:"flex", alignItems:"center", padding:"10px 14px",
    border:"2px dashed #a5d6a7", borderRadius:10, cursor:"pointer",
    fontSize:13, color:"#2e7d32", fontWeight:"bold",
    background:"#f1f8e9", boxSizing:"border-box", width:"100%",
  },
  secHead: {
    background:"linear-gradient(135deg, #e8f5e9, #f1f8e9)",
    color:"#1b5e20", padding:"10px 14px", borderRadius:8,
    fontWeight:800, fontSize:13, marginBottom:14, marginTop:8,
    borderLeft:"4px solid #2e7d32",
  },
  sBox: { background:"#e8f5e9", color:"#1b5e20", padding:"12px 16px", borderRadius:10, marginBottom:16, fontWeight:"bold", fontSize:13, borderLeft:"4px solid #2e7d32" },
  eBox: { background:"#fff3f3", color:"#c62828", padding:"12px 16px", borderRadius:10, marginBottom:16, fontWeight:"bold", fontSize:13, borderLeft:"4px solid #e53935" },
  btn: {
    width:"100%", padding:"14px", marginTop:12,
    background:"linear-gradient(135deg, #1b5e20, #2e7d32, #43a047)",
    color:"white", border:"none", borderRadius:12, fontSize:16,
    fontWeight:"bold", cursor:"pointer",
    boxShadow:"0 8px 25px rgba(46,125,50,0.4)",
  },
  backBtn: { padding:"14px 20px", background:"#f5f5f5", color:"#555", border:"none", borderRadius:12, fontWeight:"bold", cursor:"pointer", fontSize:14 },
};
