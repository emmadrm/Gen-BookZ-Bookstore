import { useState, useMemo } from "react";

function Analytics({ dashboardData }) {
  const [timeframe, setTimeframe] = useState("month");
  
  
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const dataByTimeframe = {
    week: {
      label: "Πωλήσεις ανά Ημέρα (Τρέχουσα Εβδομάδα)",
      totalSales: 42,
      totalEarnings: "609.00 €",
      bestSellerBook: "Το Μυστικό του Δάσους (28 πωλ.)",
      chartData: [
        { name: "Δευ", sales: 4 },
        { name: "Τρι", sales: 6 },
        { name: "Τετ", sales: 3 },
        { name: "Πέμ", sales: 5 },
        { name: "Παρ", sales: 12 },
        { name: "Σάβ", sales: 8 },
        { name: "Κυρ", sales: 4 },
      ],
      topBooks: [
        { title: "Το Μυστικό του Δάσους", sales: 28, percentage: 66 },
        { title: "Η Σκιά του Χρόνου", sales: 14, percentage: 34 }
      ],
      recentTransactions: [
        { id: "TX109", date: "15/06/2026", book: "Το Μυστικό του Δάσους", format: "E-book", amount: "9.50 €" },
        { id: "TX108", date: "15/06/2026", book: "Η Σκιά του Χρόνου", format: "Έντυπο", amount: "16.80 €" },
        { id: "TX107", date: "14/06/2026", book: "Το Μυστικό του Δάσους", format: "Έντυπο", amount: "14.50 €" }
      ]
    },
    month: {
      label: "Πωλήσεις ανά Εβδομάδα (Τρέχων Μήνας)",
      totalSales: 184,
      totalEarnings: "2,668.00 €",
      bestSellerBook: "Το Μυστικό του Δάσους (110 πωλ.)",
      chartData: [
        { name: "1η Εβδ", sales: 42 },
        { name: "2η Εβδ", sales: 58 },
        { name: "3η Εβδ", sales: 49 },
        { name: "4η Εβδ", sales: 35 },
      ],
      topBooks: [
        { title: "Το Μυστικό του Δάσους", sales: 110, percentage: 60 },
        { title: "Η Σκιά του Χρόνου", sales: 74, percentage: 40 }
      ],
      recentTransactions: [
        { id: "TX109", date: "15/06/2026", book: "Το Μυστικό του Δάσους", format: "E-book", amount: "9.50 €" },
        { id: "TX108", date: "14/06/2026", book: "Η Σκιά του Χρόνου", format: "Έντυπο", amount: "16.80 €" },
        { id: "TX105", date: "11/06/2026", book: "Το Μυστικό του Δάσους", format: "Έντυπο", amount: "14.50 €" }
      ]
    },
    year: {
      label: "Πωλήσεις ανά Μήνα (Τρέχον Έτος)",
      totalSales: 1240,
      totalEarnings: "17,980.00 €",
      bestSellerBook: "Το Μυστικό του Δάσους (780 πωλ.)",
      chartData: [
        { name: "Ιαν", sales: 85 },
        { name: "Φεβ", sales: 92 },
        { name: "Μάρ", sales: 110 },
        { name: "Απρ", sales: 78 },
        { name: "Μάι", sales: 95 },
        { name: "Ιούν", sales: 120 },
        { name: "Ιούλ", sales: 105 },
        { name: "Αύγ", sales: 60 },
        { name: "Σεπ", sales: 115 },
        { name: "Οκτ", sales: 130 },
        { name: "Νοέ", sales: 140 },
        { name: "Δεκ", sales: 210 },
      ],
      topBooks: [
        { title: "Το Μυστικό του Δάσους", sales: 780, percentage: 63 },
        { title: "Η Σκιά του Χρόνου", sales: 460, percentage: 37 }
      ],
      recentTransactions: [
        { id: "TX109", date: "15/06/2026", book: "Το Μυστικό του Δάσους", format: "E-book", amount: "9.50 €" },
        { id: "TX108", date: "14/06/2026", book: "Η Σκιά του Χρόνου", format: "Έντυπο", amount: "16.80 €" },
        { id: "TX022", date: "02/05/2026", book: "Το Μυστικό του Δάσους", format: "Έντυπο", amount: "14.50 €" }
      ]
    }
  };

  // If dashboard data provided via props, synthesize a simplified view
  const currentData = useMemo(() => {
    if (dashboardData) {
      const topBooks = dashboardData.topBooks || [];
      return {
        label: "Πωλήσεις (Όλα)",
        totalSales: dashboardData.totalSales || 0,
        totalEarnings: `${(dashboardData.totalEarnings || 0).toFixed(2)} €`,
        bestSellerBook: topBooks[0]
          ? `${topBooks[0].title} (${topBooks[0].sales} πωλ.)`
          : "-",
        chartData: (topBooks.length ? topBooks : []).map((b) => ({ name: b.title, sales: b.sales })),
        topBooks: topBooks,
        recentTransactions: dashboardData.recentTransactions || [],
      };
    }
    return dataByTimeframe[timeframe];
  }, [timeframe, dashboardData]);
  const maxSales = Math.max(...currentData.chartData.map(d => d.sales));

  
  const boxStyle = {
    backgroundColor: "#fcfbfa", 
    padding: "20px", 
    borderRadius: "6px", 
    border: "1px solid #e8e5e0",
    boxShadow: "0 2px 5px rgba(74, 55, 51, 0.02)" 
  };

  return (
    <div>
      <style>{`
        /* CSS για το hover εφέ στον πίνακα */
        .recent-tx-row {
          transition: background-color 0.2s ease;
        }
        .recent-tx-row:hover {
          background-color: #f2efe9 !important; /* Ζεστό γκρίζο-καφέ φόντο στο hover */
        }
      `}</style>

      <h3 style={{ color: "#4a3733", marginBottom: "25px", fontSize: "22px", fontWeight: "bold" }}>
        Στατιστικά Πωλήσεων
      </h3>

     
      <div style={{ display: "flex", gap: "15px", marginBottom: "35px", borderBottom: "1px solid #e8e5e0", paddingBottom: "15px" }}>
        {["week", "month", "year"].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            style={{
              background: "none",
              border: "none",
              color: timeframe === t ? "#e67e22" : "#70757a",
              fontWeight: timeframe === t ? "bold" : "normal",
              fontSize: "14px",
              cursor: "pointer",
              padding: "5px 12px",
              borderBottom: timeframe === t ? "2px solid #e67e22" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t === "week" ? "Ανά Εβδομάδα" : t === "month" ? "Ανά Μήνα" : "Ανά Έτος"}
          </button>
        ))}
      </div>

      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={boxStyle}>
          <span style={{ fontSize: "11px", color: "#70757a", fontWeight: "bold", textTransform: "uppercase" }}>Βιβλία που Πουλήθηκαν</span>
          <h4 style={{ margin: "10px 0 0 0", fontSize: "28px", color: "#4a3733", fontWeight: "300" }}>{currentData.totalSales}</h4>
        </div>

        <div style={boxStyle}>
          <span style={{ fontSize: "11px", color: "#70757a", fontWeight: "bold", textTransform: "uppercase" }}>Καθαρά Έσοδα</span>
          <h4 style={{ margin: "10px 0 0 0", fontSize: "28px", color: "#2e7d32", fontWeight: "300" }}>{currentData.totalEarnings}</h4>
        </div>

        <div style={boxStyle}>
          <span style={{ fontSize: "11px", color: "#70757a", fontWeight: "bold", textTransform: "uppercase" }}>Best Seller</span>
          <h4 style={{ margin: "12px 0 0 0", fontSize: "15px", color: "#4a3733", fontWeight: "600", lineHeight: "1.3" }}>
            {currentData.bestSellerBook}
          </h4>
        </div>
      </div>

      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", marginBottom: "40px" }}>
        
    
        <div style={{ ...boxStyle, padding: "25px", display: "flex", flexDirection: "column" }}>
          <h4 style={{ margin: "0 0 35px 0", fontSize: "13px", color: "#4a3733", fontWeight: "600", textTransform: "uppercase" }}>
            {currentData.label}
          </h4>

          <div style={{ 
            display: "flex", 
            alignItems: "flex-end", 
            justifyContent: "space-between", 
            height: "180px", 
            paddingBottom: "10px",
            borderBottom: "1px solid #e8e5e0",
            gap: "8px"
          }}>
            {currentData.chartData.map((item, index) => {
              const barHeight = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
              const isHovered = hoveredBarIndex === index;
              const anyBarHovered = hoveredBarIndex !== null;

              return (
                <div 
                  key={index} 
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  style={{ 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    height: "100%", 
                    justifyContent: "flex-end", 
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ 
                    fontSize: "11px", 
                    color: isHovered ? "#d4af37" : "#70757a", 
                    marginBottom: "4px",
                    fontWeight: isHovered ? "bold" : "normal",
                    transform: isHovered ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.2s ease"
                  }}>
                    {item.sales}
                  </span>

                  <div style={{ 
                    width: "100%", 
                    maxWidth: timeframe === "year" ? "22px" : "35px", 
                    height: `${barHeight}%`, 
                    backgroundColor: isHovered ? "#d4af37" : "#e67e22", 
                    borderRadius: "2px 2px 0 0",
                    opacity: isHovered ? 1 : anyBarHovered ? 0.35 : 0.85, 
                    transform: isHovered ? "scaleY(1.05)" : "scaleY(1)", 
                    transformOrigin: "bottom",
                    transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)"
                  }} />

                  <span style={{ 
                    position: "absolute", 
                    bottom: "-22px", 
                    fontSize: "10px", 
                    color: isHovered ? "#d4af37" : "#70757a",
                    fontWeight: isHovered ? "bold" : "normal",
                    transition: "color 0.2s"
                  }}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ height: "15px" }}></div>
        </div>

        
        <div style={{ ...boxStyle, padding: "25px" }}>
          <h4 style={{ margin: "0 0 25px 0", fontSize: "13px", color: "#4a3733", fontWeight: "600", textTransform: "uppercase" }}>
            Μερίδιο Πωλήσεων ανά Βιβλίο
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
            {currentData.topBooks.map((book, index) => (
              <div key={index}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "#4a3733" }}>
                  <span style={{ fontWeight: "500" }}>{book.title}</span>
                  <span style={{ color: "#70757a" }}>{book.sales} πωλ. ({book.percentage}%)</span>
                </div>
                <div style={{ height: "6px", backgroundColor: "#e8e5e0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${book.percentage}%`, height: "100%", backgroundColor: index === 0 ? "#4a3733" : "#d1c9bc", borderRadius: "3px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      
      <div style={{ ...boxStyle, padding: "25px" }}>
        <h4 style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#4a3733", fontWeight: "600", textTransform: "uppercase" }}>
          Πρόσφατες Αγορές
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e8e5e0", color: "#70757a" }}>
                <th style={{ padding: "12px 8px", fontWeight: "600" }}>ID</th>
                <th style={{ padding: "12px 8px", fontWeight: "600" }}>Ημερομηνία</th>
                <th style={{ padding: "12px 8px", fontWeight: "600" }}>Τίτλος Βιβλίου</th>
                <th style={{ padding: "12px 8px", fontWeight: "600" }}>Μορφή</th>
                <th style={{ padding: "12px 8px", fontWeight: "600", textAlign: "right" }}>Ποσό</th>
              </tr>
            </thead>
            <tbody>
              {currentData.recentTransactions.map((tx) => (
                <tr key={tx.id} className="recent-tx-row" style={{ borderBottom: "1px solid #e8e5e0", color: "#4a3733", cursor: "pointer" }}>
                  <td style={{ padding: "12px 8px", color: "#70757a" }}>{tx.id}</td>
                  <td style={{ padding: "12px 8px" }}>{tx.date}</td>
                  <td style={{ padding: "12px 8px", fontWeight: "500" }}>{tx.book}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ 
                      fontSize: "11px", 
                      padding: "3px 8px", 
                      borderRadius: "12px", 
                      backgroundColor: tx.format === "E-book" ? "#f0f7f4" : "#fbf9f6",
                      color: tx.format === "E-book" ? "#2e7d32" : "#e67e22" 
                    }}>
                      {tx.format}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600" }}>{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Analytics;