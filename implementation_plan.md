# Data Analyst Portfolio Projects — Implementation Plan

Two portfolio-ready projects that directly map to every bullet in the Data Analyst Intern JD. Both use **India-based datasets** and will be built as **stunning interactive web dashboards** you can host on GitHub Pages.

---

## Project Structure

```
c:\Users\PRATIRUPA\OneDrive\Desktop\Project\
├── project1-ecommerce-analytics/     ← E-Commerce Sales Dashboard
│   ├── data/                         ← Raw & cleaned CSVs
│   ├── scripts/                      ← Python ETL & analysis scripts
│   ├── sql/                          ← SQL queries
│   ├── dashboard/                    ← Interactive web dashboard (HTML/CSS/JS)
│   └── README.md                     ← Project documentation
│
├── project2-churn-analysis/          ← Telecom Churn Analysis
│   ├── data/                         ← Raw & cleaned CSVs
│   ├── scripts/                      ← Python EDA, modeling scripts
│   ├── report/                       ← Interactive web report (HTML/CSS/JS)
│   └── README.md                     ← Project documentation
```

---

## Project 1: India E-Commerce Sales Analytics Dashboard

### Dataset
**[E-Commerce Data by Ben Roshan](https://www.kaggle.com/datasets/benroshan/ecommerce-data)** — Indian e-commerce with 3 CSVs:
- `List of Orders.csv` — Order ID, date, customer, state, city
- `Order Details.csv` — Order ID, amount, profit, quantity, category, sub-category
- `Sales target.csv` — Monthly sales targets by category

### What We'll Build

#### Phase 1: Data & ETL (Python)
- `scripts/etl.py` — Load, clean, merge the 3 CSVs. Handle missing values, parse dates, standardize state names
- `scripts/analysis.py` — Generate summary statistics, aggregations, and export analysis-ready JSON for the dashboard
- Output: `data/cleaned_orders.csv`, `data/dashboard_data.json`

#### Phase 2: SQL Analysis
- `sql/queries.sql` — 10+ business questions answered in SQL:
  - Top 10 states by revenue
  - Monthly revenue trend
  - Most profitable product categories
  - Average order value by city
  - Sales vs target performance by category
  - Customer purchase frequency analysis
  - Year-over-year growth

#### Phase 3: Interactive Web Dashboard
A single-page **dark-themed analytics dashboard** built with HTML/CSS/JS + [Chart.js](https://www.chartjs.org/):
- **KPI Cards** — Total Revenue, Total Orders, Avg Order Value, Total Profit
- **Revenue Trend** — Line chart (monthly)
- **Sales by State** — Horizontal bar chart (top 15 states)
- **Category Performance** — Donut chart + bar chart
- **Sales vs Target** — Grouped bar chart
- **Profit Analysis** — Scatter plot (amount vs profit)
- **Filters** — Category, date range, state

**Design:** Dark glassmorphism theme, animated counters, smooth chart transitions, responsive layout.

---

## Project 2: Indian Telecom Customer Churn Analysis

### Dataset
**[Telecom Churn Dataset](https://www.kaggle.com/datasets/suraj520/telecom-churn-dataset)** — 243,553 rows of Indian telecom customer data (Airtel, Jio, Vodafone, BSNL) with:
- Demographics: gender, age, state, city
- Usage: calls_made, sms_sent, data_used
- Churn indicator (binary)

### What We'll Build

#### Phase 1: Data Cleaning & EDA (Python)
- `scripts/eda.py` — Clean data, handle nulls, feature engineering
- Explore: churn rate by telecom partner, age distribution, state-wise churn, usage patterns
- Generate: correlation matrix, distribution plots, statistical tests

#### Phase 2: Predictive Modeling (Python)
- `scripts/model.py` — Build a Logistic Regression + Random Forest classifier
- Feature importance analysis
- Confusion matrix, ROC curve, precision/recall
- Export predictions and model metrics as JSON

#### Phase 3: Interactive Web Report
A **presentation-ready web report** (like a data story) built with HTML/CSS/JS + Chart.js:
- **Executive Summary** — Key findings with animated KPIs
- **Churn Overview** — Overall churn rate, churn by telecom provider (bar chart)
- **Demographic Analysis** — Age distribution, gender split (histograms, pie charts)
- **Geographic Insights** — State-wise churn rate (heatmap-style visualization)
- **Usage Patterns** — Calls, SMS, Data usage comparison: churned vs retained (box plots / grouped bars)
- **Model Results** — Feature importance chart, confusion matrix visualization, ROC curve
- **Recommendations** — Data-driven business strategies

**Design:** Clean, professional dark theme with gradient accents. Sections animate in on scroll. Charts are interactive with tooltips.

---

## User Review Required

> [!IMPORTANT]
> **Dataset Download**: Since Kaggle requires authentication for downloads, I'll **generate realistic synthetic data** that mirrors the exact schema and distributions of these Kaggle datasets. This means you can run the projects immediately without needing a Kaggle account. The README will link to the original Kaggle datasets for reference.

> [!IMPORTANT]
> **No Power BI/Tableau**: Since these are paid/desktop tools, I'm building **interactive web dashboards** instead using Chart.js. These are actually *better* for your portfolio because:
> - They can be hosted on GitHub Pages (live demo link!)
> - They show you can code, not just drag-and-drop
> - Recruiters can view them in a browser without installing anything

## Open Questions

1. **Color theme preference?** I'll default to a sleek dark theme with blue/purple gradients. Want a different color scheme?
2. **Any specific business questions** you want answered in the analysis beyond what I've listed?

---

## Verification Plan

### Automated
- Run all Python scripts to ensure they execute without errors
- Verify dashboard loads correctly in browser
- Check all charts render with data

### Manual
- You review the dashboards visually
- You walk through the analysis logic in the Python scripts
- You can present the findings as if in an interview
