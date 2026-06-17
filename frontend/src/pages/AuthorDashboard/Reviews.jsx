import { useState, useEffect } from "react";

function Reviews({ initialReviews }) {
  
  const formatReviews = (raw) => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((r, idx) => ({ 
      id: r.id || `rev${idx}`, 
      readerName: r.user?.name || 'Αναγνώστης', 
      bookTitle: r.bookTitle || r.bookKey || 'Άγνωστο', 
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("el-GR") : '', 
      rawDate: r.createdAt || new Date(0), 
      rating: r.rating || 0, 
      comment: r.content || '' 
    }));
  };

  const [reviews, setReviews] = useState(() => formatReviews(initialReviews));

  const [sortBy, setSortBy] = useState("recent");
  const [selectedBookFilter, setSelectedBookFilter] = useState("all"); 
  const [selectedBookDetails, setSelectedBookDetails] = useState(null); 

  // 3. Ενημερώνουμε με ασφάλεια όταν έρχονται νέα δεδομένα
  useEffect(() => {
    setReviews(formatReviews(initialReviews));
  }, [initialReviews]);

  const bookFilteredReviews = selectedBookFilter === "all"
    ? reviews
    : reviews.filter(r => r.bookTitle === selectedBookFilter);

  const totalReviews = bookFilteredReviews.length;
  const averageRating = totalReviews > 0 
    ? (bookFilteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";

  const getDistributionPercentage = (stars) => {
    if (totalReviews === 0) return 0;
    const count = bookFilteredReviews.filter(r => r.rating === stars).length;
    return (count / totalReviews) * 100;
  };

  const sortedReviews = [...bookFilteredReviews].sort((a, b) => {
    if (sortBy === "high") return b.rating - a.rating;
    if (sortBy === "low") return a.rating - b.rating;
    
    const dateA = new Date(a.rawDate);
    const dateB = new Date(b.rawDate);
    return dateB - dateA;
  });

  const handleReportReview = (reviewId) => {
    alert("Η κριτική έχει επισημανθεί για έλεγχο από την ομάδα υποστήριξης του GenBookZ.");
  };

  const renderStars = (rating) => {
    return (
      <span style={{ color: "#d4af37", fontSize: "16px", letterSpacing: "2px" }}>
        {"★".repeat(rating)}{"☆".repeat(5 - rating)}
      </span>
    );
  };

  
  const openBookModal = (title) => {
    if (booksData[title]) {
      setSelectedBookDetails(booksData[title]);
    }
  };

  const uniqueBooks = [...new Set(reviews.map(r => r.bookTitle))];

  return (
    <div style={{ position: "relative" }}>
      
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <h3 style={{ color: "#4a3733", margin: 0, fontSize: "22px", fontWeight: "bold" }}>
          Κριτικές και Βαθμολογίες
        </h3>
        
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "#70757a", fontWeight: "500" }}>Προβολή στατιστικών για:</span>
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #e8e5e0",
              fontSize: "13px",
              color: "#4a3733",
              backgroundColor: "#fff",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <option value="all">Όλα τα βιβλία μαζί</option>
            {uniqueBooks.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>
      </div>

      
      <div style={{ 
        display: "flex", 
        gap: "40px", 
        backgroundColor: "#ffffff", 
        padding: "30px", 
        borderRadius: "6px", 
        border: "1px solid #e8e5e0", 
        marginBottom: "40px",
        flexWrap: "wrap"
      }}>
        
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "150px", flex: "1" }}>
          <span style={{ fontSize: "48px", fontWeight: "300", color: "#4a3733", lineHeight: "1" }}>{averageRating}</span>
          <div style={{ margin: "10px 0" }}>{renderStars(Math.round(Number(averageRating)))}</div>
          <span style={{ fontSize: "13px", color: "#70757a", textAlign: "center" }}>
            {totalReviews} {totalReviews === 1 ? "αξιολόγηση" : "αξιολογήσεις"} {selectedBookFilter !== "all" ? "γι' αυτό το βιβλίο" : "συνολικά"}
          </span>
        </div>

        
        <div style={{ flex: "2", minWidth: "280px", display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const percentage = getDistributionPercentage(stars);
            return (
              <div key={stars} style={{ display: "flex", alignItems: "center", gap: "15px", fontSize: "13px", color: "#4a3733" }}>
                <span style={{ minWidth: "50px", textAlign: "right", fontWeight: "500" }}>{stars} αστέρια</span>
                <div style={{ flexGrow: 1, height: "6px", backgroundColor: "#f5f5f5", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: "#d4af37", borderRadius: "3px" }} />
                </div>
                <span style={{ minWidth: "35px", color: "#70757a", fontSize: "12px" }}>{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>

      </div>

      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #e8e5e0", paddingBottom: "15px" }}>
        <span style={{ fontSize: "14px", color: "#4a3733", fontWeight: "600" }}>
          {selectedBookFilter === "all" ? "Όλες οι κριτικές αναγνωστών" : `Κριτικές για «${selectedBookFilter}»`}
        </span>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "13px",
            color: "#4a3733",
            backgroundColor: "#fff",
            fontFamily: "inherit",
            cursor: "pointer"
          }}
        >
          <option value="recent">Πιο πρόσφατες</option>
          <option value="high">Υψηλότερη βαθμολογία</option>
          <option value="low">Χαμηλότερη βαθμολογία</option>
        </select>
      </div>

      
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sortedReviews.length === 0 ? (
          <p style={{ color: "#70757a", fontStyle: "italic", margin: 0, fontSize: "14px" }}>
            Δεν υπάρχουν ακόμα διαθέσιμες κριτικές για αυτό το βιβλίο.
          </p>
        ) : (
          sortedReviews.map((review) => (
            <div 
              key={review.id} 
              style={{ 
                backgroundColor: "#ffffff", 
                padding: "25px", 
                borderRadius: "6px", 
                border: "1px solid #e8e5e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)" 
              }}
            >
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontWeight: "600", color: "#4a3733", fontSize: "15px" }}>{review.readerName}</span>
                  <span style={{ color: "#70757a", fontSize: "13px", marginLeft: "10px" }}>
                    για το βιβλίο{" "}
                    
                    <span 
                      onClick={() => openBookModal(review.bookTitle)}
                      style={{ 
                        fontStyle: "italic", 
                        fontWeight: "600", 
                        color: "#e67e22", 
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px"
                      }}
                      title="Κάντε κλικ για πληροφορίες βιβλίου"
                    >
                      {review.bookTitle}
                    </span>
                  </span>
                  <div style={{ marginTop: "5px" }}>{renderStars(review.rating)}</div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ color: "#70757a", fontSize: "12px" }}>{review.date}</span>
                  <button 
                    onClick={() => handleReportReview(review.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#70757a",
                      fontSize: "12px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      padding: 0
                    }}
                    onMouseEnter={(e) => e.target.style.color = "#c62828"}
                    onMouseLeave={(e) => e.target.style.color = "#70757a"}
                  >
                    Anαφορά
                  </button>
                </div>
              </div>

              
              <p style={{ 
                color: "#4a3733", 
                fontSize: "14px", 
                lineHeight: "1.6", 
                margin: 0, 
                backgroundColor: "#fbf9f6", 
                padding: "15px", 
                borderRadius: "4px",
                borderLeft: "3px solid #d4af37" 
              }}>
                "{review.comment}"
              </p>

            </div>
          ))
        )}
      </div>

      
      {selectedBookDetails && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(74, 55, 51, 0.4)", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "8px",
            maxWidth: "550px",
            width: "100%",
            border: "1px solid #e8e5e0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            position: "relative",
            animation: "fadeIn 0.2s ease-out"
          }}>
            
            
            <button 
              onClick={() => setSelectedBookDetails(null)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "20px",
                color: "#70757a",
                cursor: "pointer",
                fontWeight: "300"
              }}
            >
              ✕
            </button>

            
            <div style={{ display: "flex", gap: "25px", alignItems: "flex-start", marginTop: "10px", flexWrap: "wrap" }}>
              
              
              <img 
                src={selectedBookDetails.coverUrl} 
                alt={selectedBookDetails.title} 
                style={{
                  width: "130px",
                  height: "190px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  backgroundColor: "#f5f5f5"
                }}
              />

              
              <div style={{ flex: "1", minWidth: "200px" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#4a3733", fontSize: "18px", fontWeight: "bold" }}>
                  {selectedBookDetails.title}
                </h4>
                <p style={{ margin: "0 0 15px 0", color: "#70757a", fontSize: "13px" }}>
                  Συγγραφέας: <strong style={{ color: "#4a3733" }}>{selectedBookDetails.author}</strong>
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#70757a", marginBottom: "15px" }}>
                  <div><strong>Έκδοση:</strong> {selectedBookDetails.published}</div>
                  <div><strong>ISBN:</strong> {selectedBookDetails.isbn}</div>
                </div>
              </div>
            </div>

            
            <div style={{ marginTop: "20px", borderTop: "1px solid #e8e5e0", paddingTop: "15px" }}>
              <h5 style={{ margin: "0 0 8px 0", color: "#4a3733", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" }}>
                Σύνοψη
              </h5>
              <p style={{ margin: 0, color: "#555555", fontSize: "13px", lineHeight: "1.6" }}>
                {selectedBookDetails.summary}
              </p>
            </div>

            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}>
              <button
                onClick={() => setSelectedBookDetails(null)}
                style={{
                  backgroundColor: "#4a3733",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Κλείσιμο
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Reviews;