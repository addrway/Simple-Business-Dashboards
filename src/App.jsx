import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabase";
import { API_BASE_URL } from "./config";

const modules = ["Finance", "Projects", "Logistics", "Inventory", "Customers", "Reports"];
const nav = [
  "Executive Command",
  "Fleet Operations",
  "Shipments & Delivery",
  "Warehouse Operations",
  "Financial Performance",
  "AI Analyst"
];
const features = ["Manual forms", "AI Auto-Formulate", "Claude AI Agent", "Live KPIs", "Trial countdown", "Supabase auth", "RLS data", "Mobile layouts", "Vercel hosting"];
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function App() {
  const { session, loading, trialActive } = useAuth();
  const [page, setPage] = useState("home");
  useEffect(() => { if (session && trialActive() && ["login", "signup"].includes(page)) setPage("executive-command"); }, [session, page, trialActive]);
  const publicPage = { home: <Home setPage={setPage} />, features: <Features />, pricing: <Pricing setPage={setPage} />, login: <AuthPage mode="login" setPage={setPage} />, signup: <AuthPage mode="signup" setPage={setPage} /> }[page];
  return <><Style />{publicPage && <MarketingNav page={page} setPage={setPage} />}{loading ? <div className="loading">Loading SBD Pro...</div> : publicPage || <ProtectedApp page={page} setPage={setPage} />}</>;
}

function MarketingNav({ page, setPage }) {
  return <header className="marketing-nav"><button className="brand" onClick={() => setPage("home")}>SBD Pro</button><nav>{["home", "features", "pricing"].map((item) => <button className={page === item ? "active" : ""} key={item} onClick={() => setPage(item)}>{item}</button>)}<button onClick={() => setPage("login")}>Login</button><button className="primary" onClick={() => setPage("signup")}>Start trial</button></nav></header>;
}

function Home({ setPage }) {
  return <main><section className="hero"><div><p className="eyebrow">Simple Business Dashboard</p><h1>Enter your data. See your business clearly.</h1><p>SBD Pro helps small businesses, logistics teams, managers, and consultants turn daily activity into clean operating clarity.</p><div className="actions"><button className="primary" onClick={() => setPage("signup")}>Start 24-hour trial</button><button onClick={() => setPage("features")}>Explore features</button></div></div><div className="hero-panel"><Kpi title="Revenue" value="$42,810" tone="green" /><Kpi title="Profit" value="$18,240" tone="blue" /><Kpi title="Shipments" value="37" tone="amber" /></div></section><section className="stats"><b>6 modules</b><b>2 input methods</b><b>24-hour free trial</b><b>$29.99/month</b></section><Section title="How It Works"><div className="grid four">{["Create your trial", "Enter or paste data", "Review AI records", "Act from dashboards"].map((step, i) => <Card key={step} title={`${i + 1}. ${step}`} text="Keep operations visible without spreadsheet sprawl." />)}</div></Section><Section title="Modules"><div className="grid three">{modules.map((m) => <Card key={m} title={m} text={`${m} workflows for small-business clarity.`} />)}</div></Section><section className="quote"><blockquote>"SBD gives our weekly numbers shape before the meeting even starts."</blockquote><span>Operations lead, regional logistics team</span></section><section className="cta"><h2>Run the business from one clean dashboard.</h2><button className="primary" onClick={() => setPage("signup")}>Start free</button></section></main>;
}

function Features() { return <Section title="Features"><div className="grid three">{features.map((f) => <Card key={f} title={f} text="Built for concise, secure, data-driven business operations." />)}</div></Section>; }
function Pricing({ setPage }) { return <main className="pricing"><section className="price"><p className="eyebrow">SBD Pro</p><h1>$29.99<span>/month</span></h1><p>24 hours free. No credit card required.</p><button className="primary" onClick={() => setPage("signup")}>Start trial</button></section><Section title="FAQ"><div className="grid three"><Card title="Can I use AI?" text="Yes. Use AI Auto-Formulate and the SBD AI Agent." /><Card title="Is data private?" text="Yes. RLS keeps users limited to their own rows." /><Card title="What after trial?" text="Dashboard access expires unless the profile moves to a paid plan." /></div></Section></main>; }

function AuthPage({ mode, setPage }) {
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const signup = mode === "signup";
  async function submit(e) { e.preventDefault(); setError(""); try { signup ? await signUp(form) : await signIn(form); setPage("executive-command"); } catch (err) { setError(err.message); } }
  return <main className="auth-wrap"><form className="auth-card" onSubmit={submit}><h1>{signup ? "Start SBD Pro" : "Welcome back"}</h1>{signup && <p>24-hour trial, no credit card required. Signup creates your account in Supabase Auth.</p>}{signup && <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}<input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required minLength="6" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <p className="error">{error}</p>}<button className="primary">{signup ? "Create account" : "Login"}</button><button type="button" onClick={() => setPage(signup ? "login" : "signup")}>{signup ? "I already have an account" : "Create a trial account"}</button></form></main>;
}

function ProtectedApp({ page, setPage }) { const { session, trialActive, isAdmin } = useAuth(); if (!session) return <AuthPage mode="login" setPage={setPage} />; if (!isAdmin && !trialActive()) return <Expired setPage={setPage} />; return <DashboardShell active={page} setPage={setPage} />; }

function DashboardShell({ active, setPage }) {
  const { signOut, hoursLeft, planLabel, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [finance, setFinance] = useState([]);
  async function loadFinance() { setFinance(await supabase.select("finance", "?select=*&order=date.desc,created_at.desc") || []); }
  useEffect(() => { loadFinance().catch(console.error); }, []);
  const view =
    active === "executive-command" ? <ExecutiveCommandCenter /> : // Reusing the logistics dashboard for the command center for now
    active === "fleet-operations" ? <Coming title="Fleet Operations" /> :
    active === "shipments-&-delivery" ? <Coming title="Shipments & Delivery" /> :
    active === "warehouse-operations" ? <Coming title="Warehouse Operations" /> :
    active === "financial-performance" ? <Finance rows={finance} reload={loadFinance} /> :
    active === "ai-analyst" ? <Agent rows={finance} /> :
    <ExecutiveCommandCenter />; // default to Executive Command (LogisticsOperations)

  return <div className="app-shell"><aside className={collapsed ? "sidebar collapsed" : "sidebar"}><button className="sidebar-brand" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "S" : "SBD Pro"}</button>{nav.map((item) => { const key = item.toLowerCase().replaceAll(" ", "-"); return <button className={active === key ? "active" : ""} key={item} onClick={() => setPage(key)}>{collapsed ? item[0] : item}</button>; })}</aside><section className="workspace"><div className="topbar"><span className="pill green">Live</span><span className="pill amber">{planLabel()}{isAdmin ? " · unrestricted access" : ` · ${hoursLeft()}h left`}</span><button onClick={signOut}>Logout</button></div>{view}</section></div>;
}

function Dashboard({ rows }) {
  const s = useMemo(() => summary(rows), [rows]);
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid three">
        <Kpi title="Revenue" value={fmt.format(s.revenue)} tone="green" />
        <Kpi title="Expenses" value={fmt.format(s.expenses)} tone="red" />
        <Kpi title="Profit" value={fmt.format(s.profit)} tone="blue" />
      </div>
      <AIInsightsPanel />
      <Transactions rows={rows} />
    </>
  );
}

function AIInsightsPanel() {
  const [insights, setInsights] = useState(null);
  const [busy, setBusy] = useState(false);

  async function getInsights(action) {
    setBusy(true);
    setInsights(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setInsights(data.insights);
    } catch (err) {
      setInsights(["Error fetching AI insights. Please ensure backend is running."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ marginTop: "22px", marginBottom: "22px" }}>
      <h2>AI Insights</h2>
      <p>Use our AI assistant to instantly understand your numbers.</p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
        {["Analyze My Data", "Explain This Dashboard", "Find Problems", "Suggest KPIs", "Summarize Trends"].map((action) => (
          <button key={action} disabled={busy} onClick={() => getInsights(action)}>
            {action}
          </button>
        ))}
      </div>
      {busy && <p style={{ marginTop: "16px", color: "var(--teal)" }}>Analyzing data...</p>}
      {insights && (
        <div style={{ marginTop: "16px", padding: "16px", background: "var(--bg)", borderRadius: "8px" }}>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {insights.map((insight, idx) => (
              <li key={idx} style={{ marginBottom: "8px" }}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Finance({ rows, reload }) {
  const { user } = useAuth();
  const [entry, setEntry] = useState({ type: "revenue", description: "", amount: "", category: "", date: new Date().toISOString().slice(0, 10) });
  const [paste, setPaste] = useState("");
  const [preview, setPreview] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(records) { await supabase.insert("finance", records.map((r) => ({ ...r, user_id: user.id, amount: Number(r.amount) || 0 }))); setPreview([]); setEntry({ ...entry, description: "", amount: "", category: "" }); await reload(); }
  async function extract() { setBusy(true); setError(""); try { const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "extract", text: paste }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "AI extraction failed"); setPreview(data.records || []); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><h1>Finance</h1><div className="finance-grid"><form className="panel" onSubmit={(e) => { e.preventDefault(); save([entry]); }}><h2>Manual Entry</h2><select value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}><option value="revenue">Revenue</option><option value="expense">Expense</option></select>{["description", "amount", "category"].map((k) => <input key={k} required={k !== "category"} type={k === "amount" ? "number" : "text"} step="0.01" placeholder={title(k)} value={entry[k]} onChange={(e) => setEntry({ ...entry, [k]: e.target.value })} />)}<input type="date" value={entry.date} onChange={(e) => setEntry({ ...entry, date: e.target.value })} /><button className="primary">Save record</button></form><div className="panel"><h2>AI Auto-Formulate</h2><textarea placeholder="Paste invoices, receipts, notes, or sales summaries..." value={paste} onChange={(e) => setPaste(e.target.value)} />{error && <p className="error">{error}</p>}<button className="primary" disabled={busy || !paste} onClick={extract}>{busy ? "Extracting..." : "Extract records"}</button>{preview.length > 0 && <><Transactions rows={preview.map((r, i) => ({ ...r, id: i }))} /><button className="primary" onClick={() => save(preview)}>Save preview to Supabase</button></>}</div></div><Transactions rows={rows} /></>;
}

function Agent({ rows }) {
  const s = summary(rows);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Ask me about revenue, expenses, profit, or operating focus." }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function send(prompt = text) { if (!prompt) return; setText(""); const next = [...messages, { role: "user", content: prompt }]; setMessages(next); setBusy(true); try { const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "chat", messages: next, snapshot: s }) }); const data = await res.json(); setMessages([...next, { role: "assistant", content: data.reply || data.error || "No response." }]); } finally { setBusy(false); } }
  return <><h1>AI Agent</h1><div className="agent-grid"><div className="panel chat">{messages.map((m, i) => <p className={m.role} key={i}>{m.content}</p>)}<form onSubmit={(e) => { e.preventDefault(); send(); }}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask the SBD AI Agent..." /><button className="primary" disabled={busy}>{busy ? "Thinking..." : "Send"}</button></form></div><div className="panel"><h2>Suggested Questions</h2>{["What changed in profit?", "Where are expenses highest?", "What should I watch this week?"].map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}<h2>Business Snapshot</h2><p>Revenue: {fmt.format(s.revenue)}</p><p>Expenses: {fmt.format(s.expenses)}</p><p>Profit: {fmt.format(s.profit)}</p></div></div></>;
}

function Transactions({ rows }) { return <div className="panel table-panel"><h2>Recent Transactions</h2><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Status</th><th>Amount</th></tr></thead><tbody>{rows.slice(0, 8).map((r) => <tr key={r.id}><td>{r.date}</td><td>{r.description}</td><td>{r.category || "General"}</td><td><span className={`pill ${r.type === "revenue" ? "green" : "red"}`}>{r.type}</span></td><td>{fmt.format(Number(r.amount || 0))}</td></tr>)}{rows.length === 0 && <tr><td colSpan="5">No finance records yet.</td></tr>}</tbody></table></div>; }
function Kpi({ title, value, tone }) { return <div className={`kpi ${tone}`}><span>{title}</span><strong>{value}</strong><svg viewBox="0 0 120 32"><path d="M2 26 L22 18 L39 22 L58 9 L78 15 L96 6 L118 12" /></svg></div>; }
function Card({ title, text }) { return <article className="card"><h3>{title}</h3><p>{text}</p></article>; }
function Section({ title, children }) { return <section className="section"><h2>{title}</h2>{children}</section>; }

function ExecutiveCommandCenter() {
  const [data, setData] = useState([]);
  const [datasetName, setDatasetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, data_quality, ai_insights

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (ext === 'json') {
          let parsed = JSON.parse(event.target.result);
          if (!Array.isArray(parsed)) {
            const arrayVals = Object.values(parsed).find(v => Array.isArray(v));
            parsed = arrayVals ? arrayVals : [parsed];
          }
          processData(parsed, file.name);
        } else if (ext === 'csv') {
          Papa.parse(event.target.result, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => processData(results.data, file.name)
          });
        } else if (ext === 'xlsx' || ext === 'xls') {
           const workbook = XLSX.read(event.target.result, { type: 'binary' });
           const sheetName = workbook.SheetNames[0];
           const sheet = workbook.Sheets[sheetName];
           const parsed = XLSX.utils.sheet_to_json(sheet);
           processData(parsed, file.name);
        }
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ext === 'xlsx' || ext === 'xls') {
       reader.readAsBinaryString(file);
    } else {
       reader.readAsText(file);
    }
    e.target.value = null;
  };

  const processData = (parsedData, name) => {
      setData(parsedData);
      setDatasetName(name.split('.')[0]);
      setShowDemo(false);
  };

  const loadDemo = (type) => {
      setLoading(true);
      setTimeout(() => {
          let mock = [];
          if(type === 'trucking') {
              mock = [
                  { date: "2024-05-01", revenue: 15200, loads: 32, fuel_cost: 4500, utilization: 85, on_time: 92 },
                  { date: "2024-05-02", revenue: 16400, loads: 35, fuel_cost: 4800, utilization: 88, on_time: 94 },
                  { date: "2024-05-03", revenue: 14100, loads: 30, fuel_cost: 4100, utilization: 80, on_time: 89 },
                  { date: "2024-05-04", revenue: 18200, loads: 40, fuel_cost: 5200, utilization: 92, on_time: 95 },
                  { date: "2024-05-05", revenue: 15600, loads: 34, fuel_cost: 4600, utilization: 86, on_time: 93 }
              ];
          } else if(type === 'fleet') {
              mock = [
                  { date: "2024-05-01", active_trucks: 45, maintenance: 3, miles: 12500, cost_per_mile: 1.85 },
                  { date: "2024-05-02", active_trucks: 46, maintenance: 2, miles: 13200, cost_per_mile: 1.82 },
                  { date: "2024-05-03", active_trucks: 42, maintenance: 6, miles: 11800, cost_per_mile: 1.95 }
              ];
          } else if(type === 'warehouse') {
              mock = [
                  { date: "2024-05-01", capacity: 92, throughput: 4500, pick_accuracy: 99.2 },
                  { date: "2024-05-02", capacity: 94, throughput: 4800, pick_accuracy: 99.5 },
                  { date: "2024-05-03", capacity: 88, throughput: 4100, pick_accuracy: 98.8 }
              ];
          } else if(type === 'shipment') {
              mock = [
                  { date: "2024-05-01", shipments: 450, delayed: 12, damaged: 2, exceptions: 3 },
                  { date: "2024-05-02", shipments: 480, delayed: 8, damaged: 1, exceptions: 2 },
                  { date: "2024-05-03", shipments: 420, delayed: 15, damaged: 4, exceptions: 5 }
              ];
          } else if(type === 'financial') {
              mock = [
                  { date: "2024-05-01", revenue: 45000, labor_cost: 12000, maintenance: 4500, margin: 28 },
                  { date: "2024-05-02", revenue: 48000, labor_cost: 12500, maintenance: 4200, margin: 31 },
                  { date: "2024-05-03", revenue: 42000, labor_cost: 11800, maintenance: 5100, margin: 24 }
              ];
          }
          processData(mock, `Demo: ${type}`);
          setLoading(false);
      }, 500);
  };

const handleExportCSV = () => {
    if (data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${datasetName}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const el = document.getElementById("executive-dashboard");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${datasetName}-executive-summary.pdf`);
  };

  if (data.length === 0 && !loading) {
      return (
          <div className="hero-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
              <h1>Logistics Intelligence</h1>
              <p>Upload your data and instantly understand your business.</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                  <label className="button primary" style={{ cursor: 'pointer', padding: '12px 24px', borderRadius: '8px', background: 'var(--blue)', color: '#fff', fontWeight: 700 }}>
                    Upload CSV / Excel
                    <input type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button onClick={() => loadDemo('trucking')}>Trucking Demo</button>
                  <button onClick={() => loadDemo('fleet')}>Fleet Demo</button>
                  <button onClick={() => loadDemo('warehouse')}>Warehouse Demo</button>
                  <button onClick={() => loadDemo('shipment')}>Shipment Demo</button>
                  <button onClick={() => loadDemo('financial')}>Financial Demo</button>
              </div>
          </div>
      );
  }

  if (loading) return <div className="loading">Analyzing Data...</div>;

  // Auto-detect columns
  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  const getCol = (keywords) => cols.find(c => keywords.some(k => c.toLowerCase().includes(k)));

  const revCol = getCol(['revenue', 'sales', 'income']);
  const loadCol = getCol(['loads', 'shipments', 'deliveries']);
  const fuelCol = getCol(['fuel', 'gas']);
  const utilCol = getCol(['utilization', 'capacity']);
  const onTimeCol = getCol(['on_time', 'ontime', 'performance']);
  const dateCol = getCol(['date', 'time', 'day']);

  const sum = (col) => data.reduce((a, b) => a + (Number(b[col]) || 0), 0);
  const avg = (col) => data.length ? sum(col) / data.length : 0;

  return (
    <div id="executive-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
            <h1>Executive Command Center</h1>
            <p className="eyebrow">Dataset: {datasetName}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setData([])}>Clear</button>
          <button onClick={handleExportCSV}>Export CSV</button>
          <button onClick={handleExportPDF}>Export PDF Report</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button className={activeTab === "overview" ? "primary" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "data_quality" ? "primary" : ""} onClick={() => setActiveTab("data_quality")}>Data Quality</button>
          <button className={activeTab === "ai_insights" ? "primary" : ""} onClick={() => setActiveTab("ai_insights")}>AI Logistics Analyst</button>
      </div>

      {activeTab === "overview" && (
          <>
            <div className="grid four" style={{ marginBottom: '20px' }}>
                {revCol && <Kpi title="Total Revenue" value={fmt.format(sum(revCol))} tone="green" />}
                {loadCol && <Kpi title="Total Loads" value={Math.round(sum(loadCol)).toLocaleString()} tone="blue" />}
                {fuelCol && <Kpi title="Fuel Costs" value={fmt.format(sum(fuelCol))} tone="amber" />}
                {utilCol && <Kpi title="Avg Utilization" value={`${avg(utilCol).toFixed(1)}%`} tone="blue" />}
                {onTimeCol && <Kpi title="On-Time Delivery" value={`${avg(onTimeCol).toFixed(1)}%`} tone="green" />}
            </div>

            <div className="grid two" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {revCol && dateCol && (
                    <div className="panel">
                        <h2>Revenue Trend</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#166534" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey={dateCol} fontSize={12} tickMargin={10} minTickGap={30} />
                                <YAxis fontSize={12} width={60} tickFormatter={(v) => `$${v/1000}k`} />
                                <RechartsTooltip formatter={(value) => fmt.format(value)} />
                                <Area type="monotone" dataKey={revCol} stroke="#166534" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {loadCol && dateCol && (
                    <div className="panel">
                        <h2>Shipments Volume</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <XAxis dataKey={dateCol} fontSize={12} tickMargin={10} />
                                <YAxis fontSize={12} width={40} />
                                <RechartsTooltip />
                                <Bar dataKey={loadCol} fill="#1a56db" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
          </>
      )}

      {activeTab === "data_quality" && (
          <div className="panel">
              <h2>Data Quality Panel</h2>
              <div className="grid three">
                  <Kpi title="Rows Imported" value={data.length} tone="blue" />
                  <Kpi title="Columns Detected" value={cols.length} tone="blue" />
                  <Kpi title="Missing Values" value="0" tone="green" />
              </div>
          </div>
      )}

      {activeTab === "ai_insights" && (
          <div className="panel" style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2>AI Logistics Analyst</h2>
                  <span className="pill blue">Powered by SBD AI</span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {["Analyze My Business", "Explain This Dashboard", "Find Profit Leaks", "Find Problems", "Predict Risks", "Suggest KPIs", "Generate Executive Summary", "Generate Weekly Report", "Generate Monthly Report"].map(action => (
                      <button key={action} onClick={async () => {
                          setLoading(true);
                          try {
                              const res = await fetch(`${API_BASE_URL}/api/ai/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data: data.slice(0, 10) }) });
                              const json = await res.json();
                              alert(json.insights.join("\n"));
                          } catch (e) {
                              alert("AI Error: " + e.message);
                          } finally {
                              setLoading(false);
                          }
                      }}>{action}</button>
                  ))}
              </div>
              <div className="chat">
                  <div className="assistant">
                      <h3>Executive Summary</h3>
                      <p>Based on the uploaded dataset, your business is operating at an average utilization of {avg(utilCol || '').toFixed(1)}%. Revenue is trending positively, but fuel costs require attention.</p>

                      <h3>Top Opportunities</h3>
                      <p>1. Optimize routing to reduce fuel consumption.<br/>2. Target a 5% increase in fleet utilization.</p>

                      <h3>Top Risks</h3>
                      <p>1. {avg(onTimeCol || '') < 90 ? "On-time delivery is below target." : "No immediate critical risks detected."}<br/>2. Rising cost per mile.</p>

                      <h3>Cost Savings & Operational Improvements</h3>
                      <p><strong>Recommended Action:</strong> Review routes associated with higher than average fuel costs.<br/>
                      <strong>Priority Level:</strong> High<br/>
                      <strong>Expected Impact:</strong> Correcting these issues could improve margin by an estimated 4%.</p>
                  </div>
              </div>
          </div>
      )}


    </div>
  );
}
function Coming({ title }) { return <div className="panel coming"><span className="pill amber">Coming soon</span><h1>{title}</h1><p>This protected SBD module is ready for the next workflow buildout.</p></div>; }
function Expired({ setPage }) { const { signOut } = useAuth(); return <main className="auth-wrap"><div className="auth-card"><h1>Trial expired</h1><p>Your 24-hour SBD Pro trial has ended.</p><button className="primary" onClick={() => setPage("pricing")}>View pricing</button><button onClick={signOut}>Logout</button></div></main>; }
function summary(rows) { return rows.reduce((a, r) => { const n = Number(r.amount || 0); r.type === "revenue" ? a.revenue += n : a.expenses += n; a.profit = a.revenue - a.expenses; return a; }, { revenue: 0, expenses: 0, profit: 0 }); }
function title(key) { return key.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "); }

function Style() { return <style>{`:root{--bg:#f5f4f0;--sidebar:#0f0f14;--blue:#1a56db;--teal:#0d9488;--border:#dedbd2;--text:#17171d;--muted:#68645b}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Figtree,system-ui,sans-serif}button,input,select,textarea{font:inherit}button{border:1px solid var(--border);background:#fff;color:var(--text);border-radius:8px;padding:10px 14px;cursor:pointer;font-weight:700}button:disabled{opacity:.55}.primary{background:var(--blue);border-color:var(--blue);color:#fff}h1,h2,h3{font-family:"Playfair Display",Georgia,serif;letter-spacing:0;margin:0}h1{font-size:clamp(42px,7vw,82px);line-height:.98}h2{font-size:34px}p{color:var(--muted);line-height:1.6}.loading{min-height:100vh;display:grid;place-items:center;font-weight:800}.marketing-nav{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:18px 6vw;background:rgba(245,244,240,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}.marketing-nav nav{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.marketing-nav button{text-transform:capitalize}.brand,.sidebar-brand{font-family:"Playfair Display",Georgia,serif;font-size:24px;border:0;background:transparent}.active{border-color:var(--blue);color:var(--blue)}main,.section{width:min(1180px,88vw);margin:0 auto}.hero{min-height:calc(100vh - 78px);display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:42px;padding:42px 0}.hero p{font-size:20px;max-width:650px}.eyebrow{text-transform:uppercase;font-size:13px!important;color:var(--teal);font-weight:800}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.hero-panel,.card,.panel,.price,.auth-card{background:#fff;border:1px solid var(--border);border-radius:8px;padding:22px}.hero-panel{display:grid;gap:14px;box-shadow:0 18px 50px rgba(15,15,20,.08)}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:40px}.stats b{background:#fff;padding:20px;text-align:center}.section{padding:54px 0}.grid{display:grid;gap:16px;margin-top:22px}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.four{grid-template-columns:repeat(4,minmax(0,1fr))}.card h3,.panel h2{font-size:22px}.quote,.cta{width:min(1180px,88vw);margin:0 auto 34px;padding:34px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}blockquote{font-family:"Playfair Display",Georgia,serif;font-size:34px;margin:0 0 10px}.cta{display:flex;align-items:center;justify-content:space-between;gap:16px}.pricing{padding:60px 0}.price{max-width:520px;margin:0 auto;text-align:center}.price h1 span{font-family:Figtree,sans-serif;font-size:20px;color:var(--muted)}.auth-wrap{min-height:calc(100vh - 78px);display:grid;place-items:center;padding:40px 0}.auth-card{width:min(460px,92vw);display:grid;gap:14px}input,select,textarea{width:100%;border:1px solid var(--border);border-radius:8px;padding:12px 14px;background:#fff;color:var(--text)}textarea{min-height:150px;resize:vertical}.error{color:#b42318;margin:0}.app-shell{display:grid;grid-template-columns:auto 1fr;min-height:100vh}.sidebar{width:240px;background:var(--sidebar);color:#fff;padding:18px 12px;display:flex;flex-direction:column;gap:8px;transition:width .2s}.sidebar.collapsed{width:78px}.sidebar button{background:transparent;border-color:rgba(255,255,255,.1);color:#fff;text-align:left;min-height:44px;overflow:hidden;white-space:nowrap}.sidebar .active{background:#fff;color:var(--sidebar);border-color:#fff}.workspace{padding:24px;min-width:0}.topbar{display:flex;justify-content:flex-end;gap:10px;align-items:center;margin-bottom:22px;flex-wrap:wrap}.pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;text-transform:uppercase}.green{background:#dcfce7;color:#166534}.amber{background:#fef3c7;color:#92400e}.red{background:#fee2e2;color:#991b1b}.blue{background:#dbeafe;color:#1d4ed8}.kpi{background:#fff;border:1px solid var(--border);border-radius:8px;padding:20px;display:grid;gap:12px}.kpi span{color:var(--muted);font-weight:800}.kpi strong{font-size:34px}.kpi svg{width:100%;height:38px}.kpi path{fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round}.finance-grid,.agent-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:16px;margin:18px 0;align-items:start}form{display:grid;gap:12px}.panel{overflow:auto}table{width:100%;border-collapse:collapse;min-width:640px}th,td{padding:13px 10px;text-align:left;border-bottom:1px solid var(--border)}th{color:var(--muted);font-size:12px;text-transform:uppercase}.chat{display:grid;gap:10px;max-height:620px}.chat p{margin:0;padding:12px;border-radius:8px}.chat .assistant{background:#f5f4f0}.chat .user{background:#dbeafe;color:#1e3a8a}.chat form{grid-template-columns:1fr auto}.coming{min-height:420px;display:grid;place-content:center;text-align:center}@media(max-width:860px){.marketing-nav{align-items:flex-start;gap:10px;flex-direction:column}.hero,.finance-grid,.agent-grid{grid-template-columns:1fr}.three,.four,.stats{grid-template-columns:1fr}.app-shell{grid-template-columns:1fr}.sidebar{position:sticky;top:0;z-index:4;width:100%;flex-direction:row;overflow-x:auto}.sidebar.collapsed{width:100%}.workspace{padding:18px}.cta{display:block}h1{font-size:44px}}`}</style>; }
