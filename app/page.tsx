const bars = [42, 74, 58, 88, 67, 95, 80];
const rows = [
  ["Deliveries", "942", "Apr 27", "Up 12%"],
  ["On-time rate", "96%", "Apr 27", "Up 4%"],
  ["Retail sales", "$18,420", "Apr 27", "Up 19%"],
  ["Orders", "318", "Apr 27", "Down 3%"]
];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="logo">S</span><span>SBD<br/><small>Simple dashboards</small></span></div>
        <nav className="nav">
          <a href="#command">Command Center</a>
          <a href="#logistics">Logistics</a>
          <a href="#retail">Retail</a>
          <a href="#custom">Custom Builder</a>
          <a href="#data">Data Entry</a>
          <a href="#settings">Settings</a>
        </nav>
      </aside>
      <section className="main">
        <header className="top"><strong>Simple Business Dashboard</strong><span>Phase 1</span></header>
        <div className="content">
          <section className="hero panel">
            <div>
              <div className="eyebrow">Premium SaaS dashboards for everyday businesses</div>
              <h1>SBD</h1>
              <p>Sign up, create a business profile, choose Logistics, Retail, or Custom, enter simple numbers, and get dashboards that update automatically from Supabase.</p>
              <div className="buttons"><a className="button primary" href="#command">View dashboard</a><a className="button" href="#data">Enter data</a></div>
            </div>
            <div className="panel">
              <strong>Dashboard types</strong>
              <p>Logistics tracks deliveries, on-time rate, and fuel cost. Retail tracks sales, orders, and average ticket. Custom lets teams build their own chart views.</p>
            </div>
          </section>
          <section id="command" className="kpis">
            <div className="panel kpi"><span>Total sales</span><div className="value">$18,420</div><div className="trend">Up 19% from yesterday</div></div>
            <div className="panel kpi"><span>Deliveries</span><div className="value">942</div><div className="trend">Up 12% from yesterday</div></div>
            <div className="panel kpi"><span>On-time rate</span><div className="value">96%</div><div className="trend">Up 4% from yesterday</div></div>
          </section>
          <section className="charts">
            <div className="panel"><strong>Line and bar chart area</strong><div className="bars">{bars.map((height, index)=><div className="bar" key={index} style={{height:`${height}%`}} />)}</div></div>
            <div className="panel"><strong>Pie chart</strong><div className="pie"/><p>Hover tooltips in the full app show value, date, trend, and a simple explanation.</p></div>
          </section>
          <section className="panel table" id="data">
            <strong>Recent metric entries</strong>
            <div className="row head"><span>Metric</span><span>Value</span><span>Date</span><span>Trend</span></div>
            {rows.map((row)=><div className="row" key={row[0]}>{row.map((cell)=><span key={cell}>{cell}</span>)}</div>)}
          </section>
        </div>
      </section>
    </main>
  );
}
