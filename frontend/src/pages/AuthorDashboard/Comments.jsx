import { useState, useEffect } from "react";

function Comments({ initialComments }) {
  
  const [comments, setComments] = useState(initialComments || []);

  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState({});
  
  
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (initialComments && Array.isArray(initialComments)) {
      setComments(initialComments.map((r, idx) => ({ 
        id: r.id || `r${idx}`, 
        readerName: r.user?.name || 'Αναγνώστης', 
        bookTitle: r.bookTitle || 'Άγνωστο', 
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '', 
        text: r.content || '', 
        // Διάβασμα της πρώτης απάντησης αν υπάρχει στη βάση:
        reply: r.answers && r.answers.length > 0 ? r.answers[0].content : '' 
      })));
    }
  }, [initialComments]);

  const handleSendReply = async (commentId) => {
    const textToSave = replyText[commentId]?.trim();
    if (!textToSave) return;

    const clerkId = sessionStorage.getItem("clerkId");

    try {
      const res = await fetch("http://localhost:3000/book/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: commentId, content: textToSave, clerkId })
      });

      if (res.ok) {
        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, reply: textToSave };
          }
          return comment;
        }));
        setReplyText({ ...replyText, [commentId]: "" });
      } else {
        alert("Σφάλμα κατά την αποθήκευση της απάντησης.");
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert("Δίκτυακό σφάλμα.");
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Θέλετε σίγουρα να διαγράψετε αυτό το σχόλιο;")) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === "pending") {
      return comment.reply === ""; 
    }
    return true; 
  });

  return (
    <div>
      <h3 style={{ color: "#4a3733", marginBottom: "25px", fontSize: "22px", fontWeight: "bold" }}>
        Σχόλια και Ερωτήσεις Αναγνωστών
      </h3>

      
      <div style={{ display: "flex", gap: "15px", marginBottom: "30px", borderBottom: "1px solid #e8e5e0", paddingBottom: "15px" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            background: "none",
            border: "none",
            color: filter === "all" ? "#e67e22" : "#70757a",
            fontWeight: filter === "all" ? "bold" : "normal",
            fontSize: "14px",
            cursor: "pointer",
            padding: "5px 10px",
            borderBottom: filter === "all" ? "2px solid #e67e22" : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          Όλα τα σχόλια ({comments.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          style={{
            background: "none",
            border: "none",
            color: filter === "pending" ? "#e67e22" : "#70757a",
            fontWeight: filter === "pending" ? "bold" : "normal",
            fontSize: "14px",
            cursor: "pointer",
            padding: "5px 10px",
            borderBottom: filter === "pending" ? "2px solid #e67e22" : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          Εκκρεμούν απάντηση ({comments.filter(c => c.reply === "").length})
        </button>
      </div>

      
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {filteredComments.length === 0 ? (
          <p style={{ color: "#70757a", fontStyle: "italic", margin: 0, fontSize: "14px" }}>
            Δεν υπάρχουν σχόλια σε αυτή την κατηγορία.
          </p>
        ) : (
          filteredComments.map((comment) => (
            <div 
              key={comment.id} 
              style={{ 
                backgroundColor: "#ffffff", 
                padding: "25px", 
                borderRadius: "6px", 
                border: "1px solid #e8e5e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)" 
              }}
            >
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontWeight: "600", color: "#4a3733", fontSize: "15px" }}>{comment.readerName}</span>
                  <span style={{ color: "#70757a", fontSize: "13px", marginLeft: "10px" }}>
                    στο βιβλίο{" "}
                    <button
                      onClick={() => setSelectedBook(comment.bookDetails)}
                      style={{
                        background: "none",
                        border: "none",
                        fontStyle: "italic",
                        fontWeight: "600",
                        color: "#e67e22",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "13px",
                        textDecoration: "underline",
                        fontFamily: "inherit"
                      }}
                      title="Προβολή Κάρτας Βιβλίου"
                    >
                      {comment.bookTitle}
                    </button>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ color: "#70757a", fontSize: "12px" }}>{comment.date}</span>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c62828",
                      fontSize: "12px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                
                      fontWeight: "bold",
                      padding: 0
                    }}
                  >
                    Διαγραφή
                  </button>
                </div>
              </div>

              
              <p style={{ color: "#4a3733", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px 0", backgroundColor: "#fbf9f6", padding: "15px", borderRadius: "4px" }}>
                {comment.text}
              </p>

              
              {comment.reply ? (
                <div style={{ borderLeft: "3px solid #e67e22", paddingLeft: "15px", marginTop: "15px" }}>
                  <span style={{ fontSize: "12px", color: "#b85c14", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
                    Η απάντησή σας
                  </span>
                  <p style={{ color: "#4a3733", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                    {comment.reply}
                  </p>
                </div>
              ) : (
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                  <textarea
                    rows="2"
                    placeholder="Γράψτε μια απάντηση στον αναγνώστη..."
                    value={replyText[comment.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      resize: "vertical"
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      style={{
                        backgroundColor: "#4a3733",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#332522"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#4a3733"}
                    >
                      Απάντηση
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

       
      {selectedBook && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)", 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(3px)"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            width: "90%",
            maxWidth: "700px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: "30px",
            position: "relative",
            animation: "fadeIn 0.3s ease",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            
            
            <button 
              onClick={() => setSelectedBook(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
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

            
            <div style={{ display: "flex", gap: "35px", flexWrap: "wrap", marginTop: "10px" }}>
              
              
              <div style={{ flex: "1", minWidth: "200px", display: "flex", justifyContent: "center" }}>
                <img 
                  src={selectedBook.coverImage} 
                  alt={selectedBook.title} 
                  style={{ 
                    width: "100%", 
                    maxWidth: "200px", 
                    height: "280px", 
                    objectFit: "cover", 
                    borderRadius: "4px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
                  }} 
                />
              </div>

              
              <div style={{ flex: "1.5", minWidth: "260px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#e67e22", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {selectedBook.category}
                  </span>
                  <h4 style={{ margin: "5px 0 10px 0", color: "#4a3733", fontSize: "22px", fontWeight: "bold" }}>
                    {selectedBook.title}
                  </h4>
                </div>

                <p style={{ color: "#70757a", fontSize: "13.5px", lineHeight: "1.6", margin: 0 }}>
                  {selectedBook.description}
                </p>

                <hr style={{ border: 0, borderTop: "1px solid #e8e5e0", margin: "5px 0" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "13px" }}>
                  <div>
                    <span style={{ display: "block", color: "#70757a", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase" }}>ISBN</span>
                    <span style={{ color: "#4a3733" }}>{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", color: "#70757a", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase" }}>Τιμή Πώλησης</span>
                    <span style={{ color: "#4a3733", fontWeight: "600" }}>{selectedBook.price}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", color: "#70757a", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase" }}>Κατάσταση</span>
                    <span style={{ color: "#2e7d32", fontWeight: "600" }}>{selectedBook.status}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Comments;