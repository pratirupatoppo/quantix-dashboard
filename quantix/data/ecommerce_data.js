// Quantix – Multi-Year India E-Commerce Synthetic Dataset Generator
// Simulates realistic YoY growth from 2018 to 2026

const ECOMMERCE_DATA = {};
const yearsList = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

// Baseline 2018 metrics
const baseStates = ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Rajasthan", "West Bengal", "Telangana", "Madhya Pradesh", "Punjab", "Bihar"];
const baseStateRev = [385000, 312000, 298000, 245000, 218000, 195000, 167000, 154000, 142000, 128000, 112000, 98000];

yearsList.forEach((startYear, index) => {
  const fy = `${startYear}-${startYear + 1}`;
  
  // Calculate a growth multiplier (roughly 15% growth per year)
  // Adds a tiny bit of random variance so charts don't look perfectly identical
  const growth = Math.pow(1.15, index) * (1 + (Math.random() * 0.05 - 0.025)); 
  
  const monthlyRevenue = months.map((m, i) => {
    // Simulate holiday spike in Oct/Nov
    let base = 150000 + (Math.random() * 40000);
    if (m === "Oct" || m === "Nov") base += 80000;
    
    const rev = Math.round(base * growth);
    return {
      month: `${m} '${startYear.toString().slice(-2)}`,
      revenue: rev,
      profit: Math.round(rev * (0.12 + Math.random() * 0.03)) // 12-15% profit margin
    };
  });

  const totalRev = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalProf = monthlyRevenue.reduce((sum, m) => sum + m.profit, 0);
  const totalOrd = Math.round(38765 * growth);

  ECOMMERCE_DATA[fy] = {
    kpis: {
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      avgOrderValue: (totalRev / totalOrd).toFixed(1),
      totalProfit: totalProf,
      yoyGrowth: index === 0 ? "Baseline" : `+${(Math.random() * 5 + 12).toFixed(1)}%`
    },

    monthlyRevenue: monthlyRevenue,

    stateRevenue: baseStates.map((state, i) => ({
      state: state,
      revenue: Math.round(baseStateRev[i] * growth * (1 + Math.random() * 0.1))
    })).sort((a, b) => b.revenue - a.revenue),

    categoryData: [
      { category: "Furniture", revenue: Math.round(987500 * growth), target: Math.round(1050000 * growth) },
      { category: "Electronics", revenue: Math.round(854200 * growth), target: Math.round(900000 * growth) },
      { category: "Clothing", revenue: Math.round(597050 * growth), target: Math.round(620000 * growth) }
    ],

    subCategoryProfit: [
      { sub: "Tables", profit: Math.round(42100 * growth), revenue: Math.round(186000 * growth) },
      { sub: "Phones", profit: Math.round(52300 * growth), revenue: Math.round(212000 * growth) },
      { sub: "Chairs", profit: Math.round(-12400 * (1/growth)), revenue: Math.round(154000 * growth) }, // Shrinking loss
      { sub: "Bookcases", profit: Math.round(38700 * growth), revenue: Math.round(168000 * growth) },
      { sub: "Accessories", profit: Math.round(28900 * growth), revenue: Math.round(142000 * growth) },
      { sub: "Sarees", profit: Math.round(18400 * growth), revenue: Math.round(98000 * growth) }
    ],

    scatterData: Array.from({ length: 200 }, () => {
      const amount = Math.round((20 + Math.random() * 480) * Math.sqrt(growth));
      return {
        amount: amount,
        profit: Math.round(amount * (Math.random() * 0.4 - 0.05)),
        category: ["Furniture", "Electronics", "Clothing"][Math.floor(Math.random() * 3)]
      };
    })
  };
});