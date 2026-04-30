# 📊 Quantix — Data Analytics Platform

Quantix is a custom-built, interactive Business Intelligence (BI) dashboard designed to visualize e-commerce performance and predict customer retention. Built entirely as a Single Page Application (SPA) without heavy frameworks, it demonstrates highly performant frontend architecture and complex data visualization.

## 🚀 Live Demo
https://pratirupatoppo.github.io/quantix-dashboard

## ✨ Key Features

**🛒 India E-Commerce Analytics**
* Tracks total revenue, order volumes, average order value (AOV), and profit margins.
* Dynamic category filtering (Furniture, Electronics, Clothing) that instantly scales all associated charts and KPIs.
* Visualizes revenue breakdown across top Indian states.

**📡 Customer Churn Analysis**
* Visualizes the aftermath of a simulated Random Forest Classifier predicting customer churn.
* Breaks down retention metrics across customer segments (Guest, Standard, Plus, Premium).
* Displays Machine Learning metrics including Feature Importance, a Confusion Matrix (Precision, Recall, F1), and an ROC Curve (AUC).

**⏳ Multi-Year Simulation Engine**
* Instead of relying on static CSV files, Quantix uses a custom JavaScript data engine to simulate 8 years of realistic financial data (FY 2018 to FY 2026).
* Applies a ~15% Compound Annual Growth Rate (CAGR) with randomized monthly variances to simulate realistic holiday spikes and seasonal business growth over time.

## 🛠️ Tech Stack
* **HTML5 / CSS3:** Uses native CSS Variables for a dark-mode, Voxie-inspired aesthetic with the "Space Grotesk" typography. Features complex CSS Grids for heatmaps and matrices.
* **Vanilla JavaScript (ES6+):** Handles all state management, dynamic data generation, and DOM manipulation without React or Vue.
* **Chart.js (v4.4.3):** Powers all interactive line, bar, doughnut, scatter, and polar area charts. Includes a custom `ChartRegistry` to prevent memory leaks during rapid data filtering.

## 👨‍💻 Author
**Pratirupa Toppo**
* GitHub: [@pratirupatoppo](https://github.com/pratirupatoppo)
