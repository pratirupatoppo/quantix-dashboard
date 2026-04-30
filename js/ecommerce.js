'use strict';

/* ================================================================
   QUANTIX — E-Commerce Dashboard JS
   ================================================================ */

let ecomActiveCategory = 'All';
let currentYear = '2018-2019'; // Default year

function initEcomDashboard() {
  const dropdown = document.getElementById('yearFilter');
  if (dropdown) currentYear = dropdown.value;
  
  renderDashboardData();
  observeFadeIn();
}

function switchYear(year) {
  currentYear = year;
  
  // Re-apply the current category filter so charts rebuild smoothly
  const activeBtn = document.querySelector('.ec-filter-pill.active');
  filterEcom(ecomActiveCategory, activeBtn); 
}

// Helper function to render data based on currentYear
function renderDashboardData() {
  const d = ECOMMERCE_DATA[currentYear];
  if (!d) return;

  // Update YoY badge dynamically
  const badgeEl = document.querySelector('#ec-kpi-revenue').nextElementSibling.querySelector('span');
  if (badgeEl) {
    badgeEl.textContent = d.kpis.yoyGrowth;
    badgeEl.className = d.kpis.yoyGrowth === 'Baseline' ? '' : 'badge-up';
  }

  // Animate KPIs
  animateCounter(document.getElementById('ec-kpi-revenue'),  d.kpis.totalRevenue,  '₹', '', 0);
  animateCounter(document.getElementById('ec-kpi-orders'),   d.kpis.totalOrders,   '', '', 0);
  animateCounter(document.getElementById('ec-kpi-aov'),      d.kpis.avgOrderValue, '₹', '', 1);
  animateCounter(document.getElementById('ec-kpi-profit'),   d.kpis.totalProfit,   '₹', '', 0);

  // Build Charts
  buildRevenueChart(d);
  buildStateChart(d);
  buildCategoryDonut(d);
  buildSalesVsTarget(d);
  buildScatterChart(d);
  buildSubCategoryTable(d);
}

// ── Category Filter ──────────────────────────────────────────────
function filterEcom(category, btn) {
  ecomActiveCategory = category;
  
  // Update buttons
  document.querySelectorAll('.ec-filter-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const d = ECOMMERCE_DATA[currentYear]; // Pull data for the selected year
  
  if (category === 'All') {
    renderDashboardData(); // Re-render everything
    const chartTitle = document.querySelector('#page-ecommerce .charts-row-wide .chart-card-title');
    if (chartTitle) chartTitle.textContent = 'Order Amount vs Profit';
    return;
  }

  // --- Filter Logic for Specific Category ---
  const colorMap = { Furniture: Q.yellow, Electronics: Q.orange, Clothing: Q.pink };
  const col = colorMap[category];
  
  // 1. Calculate true KPIs from the actual category data (Fixes the tiny numbers bug)
  const catData = d.categoryData.find(c => c.category === category);
  const trueRevenue = catData.revenue;
  
  const subCategoryMap = { Furniture: ['Tables', 'Bookcases', 'Chairs'], Electronics: ['Phones', 'Accessories', 'Machines'], Clothing: ['Sarees', 'Kurtas', 'Stoles'] };
  const validSubs = subCategoryMap[category] || [];
  const trueProfit = d.subCategoryProfit
      .filter(s => validSubs.includes(s.sub))
      .reduce((sum, s) => sum + s.profit, 0);
      
  const trueOrders = Math.round(trueRevenue / d.kpis.avgOrderValue);

  // Update KPIs
  animateCounter(document.getElementById('ec-kpi-revenue'), trueRevenue, '₹', '', 0);
  animateCounter(document.getElementById('ec-kpi-orders'),  trueOrders, '', '', 0);
  animateCounter(document.getElementById('ec-kpi-aov'),     d.kpis.avgOrderValue, '₹', '', 1);
  animateCounter(document.getElementById('ec-kpi-profit'),  trueProfit, '₹', '', 0);

  // 2. SCALE THE LINE & STATE CHARTS (Fixes the frozen charts issue)
  // We find out what % this category makes up of the total, and scale the charts by that ratio
  const catRatio = trueRevenue / d.kpis.totalRevenue;
  const scaledData = {
    monthlyRevenue: d.monthlyRevenue.map(m => ({
      month: m.month,
      revenue: m.revenue * catRatio,
      profit: m.profit * catRatio
    })),
    stateRevenue: d.stateRevenue.map(s => ({
      state: s.state,
      revenue: s.revenue * catRatio
    }))
  };

  buildRevenueChart(scaledData);
  buildStateChart(scaledData);

  // 3. Rebuild Scatter Chart
  const filteredScatterData = d.scatterData.filter(p => p.category === category);
  destroyChart('chart-scatter');
  makeChart('chart-scatter', {
    type: 'scatter',
    data: {
      datasets: [{
        label: category,
        data: filteredScatterData.map(p => ({ x: p.amount, y: p.profit })),
        backgroundColor: Q.alpha(col, 0.65),
        pointRadius: 5, pointHoverRadius: 8
      }]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { color: Q.border }, title: { display: true, text: 'Order Amount (₹)', color: Q.textSecondary }, ticks: { color: Q.textSecondary, callback: v => '₹'+v } },
        y: { grid: { color: Q.border }, title: { display: true, text: 'Profit (₹)', color: Q.textSecondary }, ticks: { color: Q.textSecondary, callback: v => '₹'+v } }
      }
    }
  });

  const chartTitle = document.querySelector('#page-ecommerce .charts-row-wide .chart-card-title');
  if (chartTitle) chartTitle.textContent = `Order Amount vs Profit [${category}]`;

  // 4. Rebuild Target Bar
  destroyChart('chart-target');
  makeChart('chart-target', {
    type: 'bar',
    data: {
      labels: [catData.category],
      datasets: [
        { label: 'Actual Sales', data: [catData.revenue], backgroundColor: col, borderRadius: 6 },
        { label: 'Target', data: [catData.target], backgroundColor: Q.alpha(Q.textSecondary, 0.3), borderRadius: 6 }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: Q.textPrimary, font:{weight:'600'} } },
        y: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => fmtINR(v) } }
      }
    }
  });

  // 5. Rebuild Donut
  destroyChart('chart-donut');
  makeChart('chart-donut', {
    type: 'doughnut',
    data: {
      labels: [catData.category],
      datasets: [{
        data: [catData.revenue],
        backgroundColor: [col],
        borderColor: '#141414', borderWidth: 3
      }]
    },
    options: { cutout: '65%', plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmtINR(ctx.raw)}` } } } }
  });

  // 6. Update Sub-category Table
  const filteredSubCategories = d.subCategoryProfit.filter(s => validSubs.includes(s.sub));
  const tbody = document.getElementById('subcategory-tbody');
  if (tbody && filteredSubCategories.length > 0) {
    const maxRev = Math.max(...filteredSubCategories.map(s => s.revenue));
    tbody.innerHTML = filteredSubCategories.map(s => {
      const pct = ((s.revenue / maxRev) * 100).toFixed(0);
      const profColor = s.profit >= 0 ? 'var(--green)' : 'var(--pink)';
      return `
        <tr>
          <td style="font-weight:600">${s.sub}</td>
          <td>${fmtINR(s.revenue)}</td>
          <td><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${col}"></div></div></td>
          <td style="color:${profColor};font-weight:700">${s.profit >= 0 ? '+' : ''}${fmtINR(s.profit)}</td>
        </tr>`;
    }).join('');
  }
}

// ── 1. Monthly Revenue Trend (Line) ─────────────────────────────
function buildRevenueChart(d) {
  makeChart('chart-revenue', {
    type: 'line',
    data: {
      labels: d.monthlyRevenue.map(r => r.month),
      datasets: [
        {
          label: 'Revenue',
          data: d.monthlyRevenue.map(r => r.revenue),
          borderColor: Q.yellow,
          backgroundColor: Q.alpha(Q.yellow, 0.08),
          borderWidth: 3,
          fill: true,
          tension: 0,
          pointBackgroundColor: Q.yellow,
          pointRadius: 5,
          pointHoverRadius: 8,
          yAxisID: 'y'
        },
        {
          label: 'Profit',
          data: d.monthlyRevenue.map(r => r.profit),
          borderColor: Q.green,
          backgroundColor: Q.alpha(Q.green, 0.05),
          borderWidth: 2,
          fill: false,
          tension: 0,
          pointBackgroundColor: Q.green,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: [5,3],
          yAxisID: 'y'
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { color: Q.border }, ticks: { color: Q.textSecondary } },
        y: {
          grid: { color: Q.border },
          ticks: { color: Q.textSecondary, callback: v => fmtINR(v) }
        }
      }
    }
  });
}

// ── 2. Revenue by State (Horizontal Bar) ─────────────────────────
function buildStateChart(d) {
  const top = d.stateRevenue.slice(0, 12);
  makeChart('chart-states', {
    type: 'bar',
    data: {
      labels: top.map(s => s.state),
      datasets: [{
        label: 'Revenue',
        data: top.map(s => s.revenue),
        backgroundColor: top.map((_, i) =>
          i === 0 ? Q.yellow : Q.alpha(Q.orange, 0.75)),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => fmtINR(v) } },
        y: { grid: { display: false }, ticks: { color: Q.textPrimary, font:{weight:'600'} } }
      }
    }
  });
}

// ── 3. Category Donut ────────────────────────────────────────────
function buildCategoryDonut(d) {
  makeChart('chart-donut', {
    type: 'doughnut',
    data: {
      labels: d.categoryData.map(c => c.category),
      datasets: [{
        data: d.categoryData.map(c => c.revenue),
        backgroundColor: [Q.yellow, Q.orange, Q.pink],
        borderColor: '#141414', borderWidth: 3, hoverOffset: 8
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmtINR(ctx.raw)}` } }
      }
    }
  });
}

// ── 4. Sales vs Target (Grouped Bar) ────────────────────────────
function buildSalesVsTarget(d) {
  makeChart('chart-target', {
    type: 'bar',
    data: {
      labels: d.categoryData.map(c => c.category),
      datasets: [
        { label: 'Actual Sales', data: d.categoryData.map(c => c.revenue), backgroundColor: Q.yellow, borderRadius: 6 },
        { label: 'Target', data: d.categoryData.map(c => c.target), backgroundColor: Q.alpha(Q.orange, 0.65), borderRadius: 6 }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: Q.textPrimary, font:{weight:'600'} } },
        y: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => fmtINR(v) } }
      }
    }
  });
}

// ── 5. Profit Scatter ────────────────────────────────────────────
function buildScatterChart(d) {
  const colorMap = { Furniture: Q.yellow, Electronics: Q.orange, Clothing: Q.pink };
  const datasets = Object.keys(colorMap).map(cat => ({
    label: cat,
    data: d.scatterData.filter(p => p.category === cat).map(p => ({ x: p.amount, y: p.profit })),
    backgroundColor: Q.alpha(colorMap[cat], 0.65),
    pointRadius: 5, pointHoverRadius: 8
  }));

  makeChart('chart-scatter', {
    type: 'scatter',
    data: { datasets },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: {
          grid: { color: Q.border },
          title: { display: true, text: 'Order Amount (₹)', color: Q.textSecondary },
          ticks: { color: Q.textSecondary, callback: v => '₹'+v }
        },
        y: {
          grid: { color: Q.border },
          title: { display: true, text: 'Profit (₹)', color: Q.textSecondary },
          ticks: { color: Q.textSecondary, callback: v => '₹'+v }
        }
      }
    }
  });
}

// ── 6. Sub-category table ────────────────────────────────────────
function buildSubCategoryTable(d) {
  const tbody = document.getElementById('subcategory-tbody');
  if (!tbody) return;
  const maxRev = Math.max(...d.subCategoryProfit.map(s => s.revenue));
  tbody.innerHTML = d.subCategoryProfit.map(s => {
    const pct = ((s.revenue / maxRev) * 100).toFixed(0);
    const profColor = s.profit >= 0 ? 'var(--green)' : 'var(--pink)';
    return `
      <tr>
        <td style="font-weight:600">${s.sub}</td>
        <td>${fmtINR(s.revenue)}</td>
        <td><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:var(--orange)"></div></div></td>
        <td style="color:${profColor};font-weight:700">${s.profit >= 0 ? '+' : ''}${fmtINR(s.profit)}</td>
      </tr>`;
  }).join('');
}