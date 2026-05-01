(function () {
  const $ = (id) => document.getElementById(id);
  let revenueChart, profitChart;

  function normalizeRow(row) {
    return {
      date: row.date || new Date().toISOString().slice(0, 10),
      category: row.category || 'General',
      revenue: SBD.parseNumber(row.revenue),
      expense: SBD.parseNumber(row.expense)
    };
  }

  function calc(rows) {
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalExpense = rows.reduce((s, r) => s + r.expense, 0);
    const profit = totalRevenue - totalExpense;
    const margin = totalRevenue ? ((profit / totalRevenue) * 100) : 0;
    return { totalRevenue, totalExpense, profit, margin };
  }

  function renderTable(rows) {
    const tbody = $('dataBody');
    tbody.innerHTML = rows.map((r) => `<tr><td>${r.date}</td><td>${r.category}</td><td>${SBD.formatCurrency(r.revenue)}</td><td>${SBD.formatCurrency(r.expense)}</td><td>${SBD.formatCurrency(r.revenue - r.expense)}</td></tr>`).join('');
  }

  function renderKPIs(rows) {
    const c = calc(rows);
    $('kpiRevenue').textContent = SBD.formatCurrency(c.totalRevenue);
    $('kpiExpense').textContent = SBD.formatCurrency(c.totalExpense);
    $('kpiProfit').textContent = SBD.formatCurrency(c.profit);
    $('kpiMargin').textContent = `${c.margin.toFixed(1)}%`;
  }

  function renderCharts(rows) {
    const labels = rows.map((r) => r.date);
    const revenue = rows.map((r) => r.revenue);
    const expense = rows.map((r) => r.expense);
    const profit = rows.map((r) => r.revenue - r.expense);

    revenueChart && revenueChart.destroy();
    profitChart && profitChart.destroy();

    revenueChart = new Chart(document.getElementById('revenueChart'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Revenue', data: revenue, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.15)', tension: .35, fill: true }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    profitChart = new Chart(document.getElementById('profitChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Expenses', data: expense, backgroundColor: '#f97316' }, { label: 'Profit', data: profit, backgroundColor: '#16a34a' }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function renderAll() {
    const rows = SBD.readData();
    renderKPIs(rows); renderTable(rows); renderCharts(rows);
  }

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error('CSV must include header and at least one row.');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = { date: headers.indexOf('date'), category: headers.indexOf('category'), revenue: headers.indexOf('revenue'), expense: headers.indexOf('expense') };
    if ([idx.date, idx.category, idx.revenue, idx.expense].some((n) => n === -1)) throw new Error('Header must contain: date, category, revenue, expense');
    return lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      return normalizeRow({ date: cols[idx.date], category: cols[idx.category], revenue: cols[idx.revenue], expense: cols[idx.expense] });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const user = SBD.getUser();
    if (!user) $('authNotice').textContent = 'Demo mode: You are not logged in. You can still test everything.';

    $('manualForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const row = normalizeRow({ date: $('date').value, category: $('category').value, revenue: $('revenue').value, expense: $('expense').value });
      const rows = SBD.readData(); rows.push(row); SBD.writeData(rows); renderAll(); e.target.reset();
    });

    $('csvInput').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseCSV(text);
        SBD.writeData(parsed);
        renderAll();
      } catch (err) {
        alert(err.message || 'Failed to parse CSV file.');
      }
    });

    $('resetBtn').addEventListener('click', () => {
      if (confirm('Clear all dashboard data?')) { SBD.writeData([]); renderAll(); }
    });

    if (SBD.readData().length === 0) {
      SBD.writeData([
        { date: '2026-04-01', category: 'Online', revenue: 4200, expense: 1700 },
        { date: '2026-04-08', category: 'Retail', revenue: 5100, expense: 2000 },
        { date: '2026-04-15', category: 'Wholesale', revenue: 3900, expense: 1500 }
      ]);
    }
    renderAll();
  });
})();
