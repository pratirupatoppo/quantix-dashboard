// Quantix – Multi-Year India E-Commerce Churn Synthetic Dataset
// Simulates realistic customer base growth and churn metrics from 2018 to 2026

const CHURN_DATA = {};
const churnYearsList = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Baseline Data structure
const baseProviders = [
  { provider: "Guest", total: 81240, churnRate: 20.5 },
  { provider: "Standard", total: 72410, churnRate: 16.0 },
  { provider: "Plus", total: 56830, churnRate: 7.5 },
  { provider: "Premium", total: 33073, churnRate: 5.9 }
];

// RENAMED: Changed from baseStates to churnBaseStates to prevent collision with ecommerce_data.js
const churnBaseStates = [
  { state: "UP", rate: 18.4 }, { state: "Bihar", rate: 17.1 }, { state: "MP", rate: 16.8 },
  { state: "Rajasthan", rate: 15.9 }, { state: "Odisha", rate: 15.4 }, { state: "Jharkhand", rate: 14.9 },
  { state: "Assam", rate: 14.2 }, { state: "Gujarat", rate: 13.6 }, { state: "WB", rate: 13.1 },
  { state: "Tamil Nadu", rate: 12.8 }, { state: "Karnataka", rate: 12.2 }, { state: "AP", rate: 11.7 },
  { state: "Maharashtra", rate: 11.1 }, { state: "Kerala", rate: 10.4 }, { state: "Punjab", rate: 9.8 },
  { state: "Haryana", rate: 9.1 }, { state: "Delhi", rate: 8.6 }, { state: "HP", rate: 7.9 }
];

churnYearsList.forEach((startYear, index) => {
  const fy = `${startYear}-${startYear + 1}`;
  
  // Growth factor tied to E-Commerce revenue growth (~15% YoY)
  const growth = Math.pow(1.15, index) * (1 + (Math.random() * 0.04 - 0.02)); 
  
  // As years go on, churn improves slightly (-0.4% per year) and model gets better
  const churnImprovement = index * 0.4;
  const modelAcc = Math.min(96.5, 89.3 + (index * 0.6) + (Math.random() * 0.8));

  // Scale providers
  let totalCustOverall = 0;
  let totalChurnedOverall = 0;
  
  const churnByProvider = baseProviders.map(p => {
    const total = Math.round(p.total * growth);
    const rate = Math.max(2.0, p.churnRate - churnImprovement + (Math.random() * 1.5 - 0.75));
    const churned = Math.round(total * (rate / 100));
    
    totalCustOverall += total;
    totalChurnedOverall += churned;
    
    return { provider: p.provider, total, churned, churnRate: parseFloat(rate.toFixed(1)) };
  });

  const avgChurnRate = (totalChurnedOverall / totalCustOverall) * 100;

  CHURN_DATA[fy] = {
    kpis: {
      totalCustomers: totalCustOverall,
      churnedCustomers: totalChurnedOverall,
      churnRate: parseFloat(avgChurnRate.toFixed(1)),
      modelAccuracy: parseFloat(modelAcc.toFixed(1)),
      avgAge: Math.round(38 + (Math.random() * 2 - 1)),
      churnTrend: index === 0 ? "Baseline" : `↓ ${((Math.random() * 0.5) + 0.2).toFixed(1)}%`
    },

    churnByProvider: churnByProvider,

    genderSplit: [
      { gender: "Male", churned: Math.round(18940 * growth * (avgChurnRate/14.2)), retained: Math.round(105120 * growth) },
      { gender: "Female", churned: Math.round(15645 * growth * (avgChurnRate/14.2)), retained: Math.round(103848 * growth) }
    ],

    ageDistribution: [
      { bucket: "18-25", churned: Math.round(6210 * growth * 0.9), retained: Math.round(28900 * growth) },
      { bucket: "26-35", churned: Math.round(10240 * growth * 0.95), retained: Math.round(52300 * growth) },
      { bucket: "36-45", churned: Math.round(9120 * growth), retained: Math.round(48700 * growth) },
      { bucket: "46-55", churned: Math.round(5680 * growth), retained: Math.round(34200 * growth) },
      { bucket: "56-65", churned: Math.round(2340 * growth), retained: Math.round(17200 * growth) },
      { bucket: "65+",   churned: Math.round(995 * growth), retained: Math.round(27668 * growth) }
    ],

    // Fixed the reference here to use churnBaseStates
    stateChurn: churnBaseStates.map(s => {
      const rate = Math.max(4.0, s.rate - churnImprovement + (Math.random() * 2 - 1));
      return { state: s.state, churnRate: parseFloat(rate.toFixed(1)) };
    }),

    usageComparison: [
      // As years progress (index increases), retained customers noticeably buy more and spend more. 
      // Churned customers stay relatively stagnant.
      { metric: "Orders/year",  
        churned: parseFloat((1.2 + Math.random()*0.1).toFixed(1)), 
        retained: parseFloat((4.8 + (index * 0.4) + Math.random()*0.2).toFixed(1)) 
      },
      { metric: "Items/order",  
        churned: parseFloat((1.5 + Math.random()*0.1).toFixed(1)), 
        retained: parseFloat((3.2 + (index * 0.2) + Math.random()*0.2).toFixed(1)) 
      },
      { metric: "Spend (₹k/yr)",
        churned: parseFloat((2.1 + (index * 0.1) + Math.random()*0.2).toFixed(1)), 
        retained: parseFloat((8.5 + (index * 1.5) + Math.random()*0.5).toFixed(1)) 
      }
    ],

    featureImportance: [
      { feature: "Days Since Last Order", importance: 0.284 },
      { feature: "Total Spend",           importance: 0.231 },
      { feature: "Account Tier",          importance: 0.187 },
      { feature: "Tenure (months)",       importance: 0.142 },
      { feature: "Return Rate",           importance: 0.089 },
      { feature: "Support Tickets",       importance: 0.067 },
      { feature: "Customer Age",          importance: 0.048 },
      { feature: "State",                 importance: 0.041 },
      { feature: "Gender",                importance: 0.011 }
    ],

    confusionMatrix: {
      TP: Math.round(29842 * growth), FP: Math.round(4182 * growth * 0.8), 
      FN: Math.round(3698 * growth * 0.8),  TN: Math.round(205831 * growth)
    },

    rocPoints: [
      {fpr:0,tpr:0}, {fpr:0.05,tpr:0.51}, {fpr:0.1,tpr:0.68},
      {fpr:0.15,tpr:0.77}, {fpr:0.2,tpr:0.83}, {fpr:0.3,tpr:0.89},
      {fpr:0.4,tpr:0.93}, {fpr:0.5,tpr:0.95}, {fpr:0.7,tpr:0.97}, {fpr:1,tpr:1}
    ],

    recommendations: [
      { icon: "🛒", title: "Target Dormant Shoppers", desc: "Customers with >90 days since their last order have 2.8× higher churn risk. Send win-back offers." },
      { icon: "📦", title: "Re-engage Cart Abandoners", desc: "Users with high cart abandonment show 63% higher churn. Trigger personalized discount emails." },
      { icon: "⭐", title: "Promote Premium Tiers", desc: "Guest users churn at 20.5% vs 5.9% for Premium members. Push loyalty program signups." },
      { icon: "🗺️", title: "Focus on High-Risk States", desc: "UP, Bihar, MP show highest historical churn. Investigate and optimize regional shipping times." }
    ]
  };
});