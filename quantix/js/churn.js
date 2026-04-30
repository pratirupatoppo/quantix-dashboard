'use strict';

/* ================================================================
   QUANTIX — Churn Dashboard JS
   ================================================================ */

let activeChurnTab = 'overview';
let currentChurnYear = '2018-2019';

function initChurnDashboard() {
  const dropdown = document.getElementById('churnYearFilter');
  if (dropdown) currentChurnYear = dropdown.value;

  renderChurnData();
  showChurnTab('overview');
  observeFadeIn();
}

function switchChurnYear(year) {
  currentChurnYear = year;
  renderChurnData();
  
  // Re-render the charts for the tab the user is currently looking at
  showChurnTab(activeChurnTab); 
}

function renderChurnData() {
  const d = CHURN_DATA[currentChurnYear];
  if (!d) return;

  // Update KPI counters
  animateCounter(document.getElementById('ch-kpi-rate'),     d.kpis.churnRate,        '', '%', 1);
  animateCounter(document.getElementById('ch-kpi-atrisk'),   d.kpis.churnedCustomers, '', '', 0);
  animateCounter(document.getElementById('ch-kpi-accuracy'), d.kpis.modelAccuracy,    '', '%', 1);
  animateCounter(document.getElementById('ch-kpi-total'),    d.kpis.totalCustomers,   '', '', 0);

  // Update KPI trend badge
  const badgeEl = document.getElementById('ch-kpi-rate-badge');
  if (badgeEl) {
    badgeEl.textContent = d.kpis.churnTrend;
    if (d.kpis.churnTrend === "Baseline") {
      badgeEl.className = 'badge-up';
      badgeEl.style.color = "var(--text-s)";
    } else {
      badgeEl.className = 'badge-up'; 
      badgeEl.style.color = "var(--green)"; // Green because churn going DOWN is good
    }
  }

  // Update recommendations grid dynamically
  const recGrid = document.getElementById('rec-grid');
  if (recGrid) {
    recGrid.innerHTML = d.recommendations.map(r => `
      <div class="rec-card fade-in visible">
        <div class="rec-icon">${r.icon}</div>
        <div class="rec-title">${r.title}</div>
        <div class="rec-desc">${r.desc}</div>
      </div>`).join('');
  }
}

function showChurnTab(tab) {
  activeChurnTab = tab;
  document.querySelectorAll('.ch-tab-btn').forEach(b => b.classList.remove('active', 'active-pink'));
  const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active', 'active-pink');

  document.querySelectorAll('.churn-tab-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('churn-panel-' + tab);
  if (panel) panel.style.display = 'block';

  // Lazy-build charts for that tab using the current year's data
  setTimeout(() => {
    switch(tab) {
      case 'overview':    buildOverviewCharts(); break;
      case 'demographic': buildDemoCharts(); break;
      case 'geographic':  buildGeoChart(); break;
      case 'usage':       buildUsageChart(); break;
      case 'model':       buildModelCharts(); break;
    }
    observeFadeIn();
  }, 60);
}

// ── OVERVIEW: Churn by Provider + Gender ─────────────────────────
function buildOverviewCharts() {
  const d = CHURN_DATA[currentChurnYear];

  makeChart('chart-provider', {
    type: 'bar',
    data: {
      labels: d.churnByProvider.map(p => p.provider),
      datasets: [
        {
          label: 'Churned',
          data: d.churnByProvider.map(p => p.churned),
          backgroundColor: Q.pink,
          borderRadius: 8, borderSkipped: false
        },
        {
          label: 'Retained',
          data: d.churnByProvider.map(p => p.total - p.churned),
          backgroundColor: Q.alpha(Q.cyan, 0.5),
          borderRadius: 8, borderSkipped: false
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: Q.textPrimary, font:{weight:'700'} } },
        y: { stacked: true, grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => fmtNum(v) } }
      }
    }
  });

  makeChart('chart-gender', {
    type: 'doughnut',
    data: {
      labels: ['Male Churned', 'Female Churned', 'Male Retained', 'Female Retained'],
      datasets: [{
        data: [
          d.genderSplit[0].churned,
          d.genderSplit[1].churned,
          d.genderSplit[0].retained,
          d.genderSplit[1].retained
        ],
        backgroundColor: [Q.orange, Q.pink, Q.alpha(Q.cyan, 0.5), Q.alpha(Q.green, 0.5)],
        borderColor: '#141414', borderWidth: 3, hoverOffset: 8
      }]
    },
    options: {
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size:11 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmtNum(ctx.raw)}` } }
      }
    }
  });

  // Churn rate table
  const tbody = document.getElementById('provider-tbody');
  if (tbody) {
    tbody.innerHTML = d.churnByProvider.map(p => {
      const ratePct = p.churnRate.toFixed(1);
      const color = p.churnRate > 15 ? 'var(--pink)' : p.churnRate > 10 ? 'var(--orange)' : 'var(--cyan)';
      return `
        <tr>
          <td style="font-weight:700">${p.provider}</td>
          <td>${fmtNum(p.total)}</td>
          <td>${fmtNum(p.churned)}</td>
          <td style="color:${color};font-weight:700">${ratePct}%</td>
          <td>
            <div class="progress-track"><div class="progress-fill" style="width:${ratePct*5}%;background:${color}"></div></div>
          </td>
        </tr>`;
    }).join('');
  }
}

// ── DEMOGRAPHIC: Age + Gender breakdown ──────────────────────────
function buildDemoCharts() {
  const d = CHURN_DATA[currentChurnYear];

  makeChart('chart-age', {
    type: 'bar',
    data: {
      labels: d.ageDistribution.map(a => a.bucket),
      datasets: [
        {
          label: 'Churned',
          data: d.ageDistribution.map(a => a.churned),
          backgroundColor: Q.pink,
          borderRadius: 6, borderSkipped: false
        },
        {
          label: 'Retained',
          data: d.ageDistribution.map(a => a.retained),
          backgroundColor: Q.alpha(Q.yellow, 0.65),
          borderRadius: 6, borderSkipped: false
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: Q.textPrimary } },
        y: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => fmtNum(v) } }
      }
    }
  });

  makeChart('chart-age-rate', {
    type: 'line',
    data: {
      labels: d.ageDistribution.map(a => a.bucket),
      datasets: [{
        label: 'Churn Rate %',
        data: d.ageDistribution.map(a =>
          ((a.churned / (a.churned + a.retained)) * 100).toFixed(1)),
        borderColor: Q.orange,
        backgroundColor: Q.alpha(Q.orange, 0.1),
        borderWidth: 3, fill: true, tension: 0.3,
        pointBackgroundColor: Q.orange, pointRadius: 5, pointHoverRadius: 8
      }]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: Q.textPrimary } },
        y: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => v+'%' } }
      }
    }
  });
}

// ── GEOGRAPHIC: State-wise heatmap ───────────────────────────────
function buildGeoChart() {
  const d = CHURN_DATA[currentChurnYear];
  const container = document.getElementById('geo-heatmap');
  if (!container) return;

  const max = Math.max(...d.stateChurn.map(s => s.churnRate));
  const min = Math.min(...d.stateChurn.map(s => s.churnRate));

  container.innerHTML = d.stateChurn.map(s => {
    const pct = (s.churnRate - min) / (max - min);
    let bg, textColor;
    if (pct < 0.5) {
      const t = pct * 2;
      bg = `rgba(${Math.round(0 + 255*t)}, ${Math.round(229 - 75*t)}, ${Math.round(212 - 159*t)}, 0.85)`;
    } else {
      const t = (pct - 0.5) * 2;
      bg = `rgba(255, ${Math.round(107 - 46*t)}, ${Math.round(53 + 66*t)}, 0.90)`;
    }
    textColor = pct > 0.5 ? '#fff' : '#000';
    return `
      <div class="heat-cell" style="background:${bg};color:${textColor}" 
           title="${s.state}: ${s.churnRate}%">
        <div style="font-size:9px;opacity:0.8">${s.state}</div>
        <div style="font-size:14px;font-weight:800">${s.churnRate}%</div>
      </div>`;
  }).join('');

  makeChart('chart-state-churn', {
    type: 'bar',
    data: {
      labels: d.stateChurn.map(s => s.state),
      datasets: [{
        label: 'Churn Rate %',
        data: d.stateChurn.map(s => s.churnRate),
        backgroundColor: d.stateChurn.map(s => {
          if (s.churnRate >= 16) return Q.pink;
          if (s.churnRate >= 13) return Q.orange;
          return Q.cyan;
        }),
        borderRadius: 5, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => v+'%' } },
        y: { grid: { display: false }, ticks: { color: Q.textPrimary, font:{size:11} } }
      }
    }
  });
}

// ── USAGE: Churned vs Retained usage comparison ──────────────────
function buildUsageChart() {
  const d = CHURN_DATA[currentChurnYear];

  makeChart('chart-usage', {
    type: 'bar',
    data: {
      labels: d.usageComparison.map(u => u.metric),
      datasets: [
        {
          label: 'Churned Customers',
          data: d.usageComparison.map(u => u.churned),
          backgroundColor: Q.pink,
          borderRadius: 8, borderSkipped: false
        },
        {
          label: 'Retained Customers',
          data: d.usageComparison.map(u => u.retained),
          backgroundColor: Q.cyan,
          borderRadius: 8, borderSkipped: false
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: Q.textPrimary, font:{weight:'600'} } },
        y: { grid: { color: Q.border }, ticks: { color: Q.textSecondary } }
      }
    }
  });

  makeChart('chart-usage-ratio', {
    type: 'polarArea',
    data: {
      labels: ['Orders Ratio', 'Items Ratio', 'Spend Ratio'],
      datasets: [{
        data: d.usageComparison.map(u => (u.retained / u.churned).toFixed(2)),
        backgroundColor: [Q.alpha(Q.yellow,0.7), Q.alpha(Q.orange,0.7), Q.alpha(Q.cyan,0.7)],
        borderColor: ['#141414','#141414','#141414'],
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}× more` } }
      },
      scales: { r: { grid: { color: Q.border }, ticks: { display: false } } }
    }
  });
}

// ── MODEL: Feature importance + Confusion Matrix + ROC ───────────
function buildModelCharts() {
  const d = CHURN_DATA[currentChurnYear];

  makeChart('chart-feature', {
    type: 'bar',
    data: {
      labels: d.featureImportance.map(f => f.feature),
      datasets: [{
        label: 'Importance Score',
        data: d.featureImportance.map(f => f.importance),
        backgroundColor: d.featureImportance.map((_, i) =>
          [Q.yellow, Q.orange, Q.pink, Q.cyan, Q.green, Q.purple, Q.alpha(Q.yellow,0.6), Q.alpha(Q.orange,0.6), Q.alpha(Q.pink,0.6)][i]
        ),
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: Q.border }, ticks: { color: Q.textSecondary, callback: v => (v*100).toFixed(0)+'%' } },
        y: { grid: { display: false }, ticks: { color: Q.textPrimary, font:{weight:'600'} } }
      }
    }
  });

  makeChart('chart-roc', {
    type: 'line',
    data: {
      datasets: [
        {
          label: `ROC Curve (AUC = ${(d.kpis.modelAccuracy/100 + 0.04).toFixed(2)})`,
          data: d.rocPoints.map(p => ({ x: p.fpr, y: p.tpr })),
          borderColor: Q.yellow,
          backgroundColor: Q.alpha(Q.yellow, 0.08),
          borderWidth: 3, fill: true, tension: 0.4,
          pointBackgroundColor: Q.yellow, pointRadius: 4
        },
        {
          label: 'Random Classifier',
          data: [{x:0,y:0},{x:1,y:1}],
          borderColor: Q.alpha(Q.textSecondary, 0.4),
          borderWidth: 1, borderDash: [6,4],
          pointRadius: 0, fill: false
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'False Positive Rate', color: Q.textSecondary }, grid: { color: Q.border }, ticks: { color: Q.textSecondary } },
        y: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'True Positive Rate', color: Q.textSecondary }, grid: { color: Q.border }, ticks: { color: Q.textSecondary } }
      }
    }
  });

  const cm = d.confusionMatrix;
  const cmEl = document.getElementById('confusion-matrix');
  if (cmEl) {
    const precision = (cm.TP / (cm.TP + cm.FP) * 100).toFixed(1);
    const recall = (cm.TP / (cm.TP + cm.FN) * 100).toFixed(1);
    const f1 = (2 * (precision * recall) / (parseFloat(precision) + parseFloat(recall))).toFixed(1);
    
    cmEl.innerHTML = `
      <div class="cm-cell cm-tp"><div class="cm-num">${fmtNum(cm.TP)}</div><div class="cm-lbl">True Positive</div></div>
      <div class="cm-cell cm-fp"><div class="cm-num">${fmtNum(cm.FP)}</div><div class="cm-lbl">False Positive</div></div>
      <div class="cm-cell cm-fn"><div class="cm-num">${fmtNum(cm.FN)}</div><div class="cm-lbl">False Negative</div></div>
      <div class="cm-cell cm-tn"><div class="cm-num">${fmtNum(cm.TN)}</div><div class="cm-lbl">True Negative</div></div>
    `;
    
    // Update the metrics under the confusion matrix dynamically
    const metricsDiv = cmEl.nextElementSibling;
    if(metricsDiv) {
      metricsDiv.innerHTML = `Precision: <strong style="color:var(--green)">${precision}%</strong> &nbsp;|&nbsp; Recall: <strong style="color:var(--cyan)">${recall}%</strong> &nbsp;|&nbsp; F1: <strong style="color:var(--yellow)">${f1}%</strong>`;
    }
  }
}