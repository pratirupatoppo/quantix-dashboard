/* ================================================================
   QUANTIX — Chart.js Global Defaults
   ================================================================ */

'use strict';

// ── Shared color palette ─────────────────────────────────────────
const Q = {
  yellow: '#F5C800', orange: '#FF6B35', pink: '#FF3D77',
  cyan:   '#00E5D4', green:  '#7AE582', purple: '#B388FF',
  bg:     '#141414', bgCard: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.10)',
  textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.55)',

  palette: ['#F5C800','#FF6B35','#FF3D77','#00E5D4','#7AE582','#B388FF'],

  // Transparent versions for fills
  alpha(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }
};

// ── Chart.js Global Defaults ─────────────────────────────────────
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = Q.textSecondary;
Chart.defaults.borderColor = Q.border;
Chart.defaults.responsive  = true;
Chart.defaults.maintainAspectRatio = false;

Chart.defaults.plugins.legend.labels.color = Q.textPrimary;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 16;

Chart.defaults.plugins.tooltip.backgroundColor = '#1e1e1e';
Chart.defaults.plugins.tooltip.borderColor     = Q.border;
Chart.defaults.plugins.tooltip.borderWidth     = 1;
Chart.defaults.plugins.tooltip.titleColor      = Q.textPrimary;
Chart.defaults.plugins.tooltip.bodyColor       = Q.textSecondary;
Chart.defaults.plugins.tooltip.padding         = 12;
Chart.defaults.plugins.tooltip.cornerRadius    = 8;
Chart.defaults.plugins.tooltip.titleFont       = { family:"'Space Grotesk',sans-serif", weight:'700', size:13 };
Chart.defaults.plugins.tooltip.bodyFont        = { family:"'Space Grotesk',sans-serif", size:12 };

// ── Utility: format currency ─────────────────────────────────────
function fmtINR(n) {
  if (n >= 1e7) return '₹' + (n/1e7).toFixed(1) + 'Cr';
  if (n >= 1e5) return '₹' + (n/1e5).toFixed(1) + 'L';
  if (n >= 1e3) return '₹' + (n/1e3).toFixed(1) + 'K';
  return '₹' + n;
}

// ── Utility: format large numbers ───────────────────────────────
function fmtNum(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return n;
}

// ── Utility: animate counter ────────────────────────────────────
function animateCounter(el, target, prefix='', suffix='', decimals=0) {
  const duration = 1400;
  const start = performance.now();
  const fn = (ts) => {
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = (target * ease).toFixed(decimals);
    el.textContent = prefix + parseFloat(value).toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(fn);
  };
  requestAnimationFrame(fn);
}

// ── Utility: observe fade-in ─────────────────────────────────────
function observeFadeIn() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
}

// ── Navigation ───────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active','active-orange','active-pink');
  });

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const link = document.querySelector(`[data-page="${pageId}"]`);
  if (link) {
    if (pageId === 'churn') link.classList.add('active', 'active-pink');
    else                    link.classList.add('active');
  }

  // Scroll to top
  document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });

  // Re-observe animations
  setTimeout(observeFadeIn, 80);
}

// ── Chart registry (for destroy/rebuild) ─────────────────────────
const ChartRegistry = {};

function destroyChart(id) {
  if (ChartRegistry[id]) { ChartRegistry[id].destroy(); delete ChartRegistry[id]; }
}

function makeChart(id, config) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  ChartRegistry[id] = new Chart(ctx, config);
  return ChartRegistry[id];
}
