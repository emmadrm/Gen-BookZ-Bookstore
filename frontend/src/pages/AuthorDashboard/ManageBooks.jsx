import { useState, useEffect } from "react";

function ManageBooks({ initialBooks }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBooks = async () => {
    const clerkId = sessionStorage.getItem("clerkId");
    if (!clerkId) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`http://localhost:3000/author/${clerkId}/books`);
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Αποτυχία φόρτωσης βιβλίων.");
        return;
      }
      if (json.books) setBooks(json.books);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setErrorMessage("Σφάλμα κατά τη φόρτωση βιβλίων.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBooks && Array.isArray(initialBooks)) {
      setBooks(initialBooks.map((b) => ({ ...b, id: b.id || b.bookKey })));
    } else {
      fetchBooks();
    }
  }, [initialBooks]);

  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null); 
  
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Λογοτεχνία");
  const [customCategory, setCustomCategory] = useState(""); 
  const [coverUrl, setCoverUrl] = useState(""); 
  const [description, setDescription] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setCoverUrl(reader.result); 
      };
  
      reader.readAsDataURL(file);
    }
  };

  
  const handleEditClick = (book) => {
    setEditingKey(book.bookKey || book.id);
    setTitle(book.title);
    setIsbn(book.isbn);
    setPrice(book.price);
    
    
    const defaultCategories = ["Λογοτεχνία", "Επιστήμες", "Βιογραφίες", "Φαντασία"];
    if (defaultCategories.includes(book.category)) {
      setCategory(book.category);
      setCustomCategory("");
    } else {
      setCategory("Άλλο");
      setCustomCategory(book.category);
    }
    
    setCoverUrl(book.coverUrl);
    setDescription(book.description);
    setShowForm(true); 
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !isbn || !price) return alert("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία!");
    
    const finalCategory = category === "Άλλο" ? (customCategory.trim() || "Γενικό") : category;
    const clerkId = sessionStorage.getItem("clerkId");
    if (!clerkId) return alert("Κάνε σύνδεση πρώτα.");

    // Update existing
    if (editingKey) {
      try {
        const res = await fetch(`http://localhost:3000/books/${editingKey}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId, title, isbn, price, category: finalCategory, coverUrl, description }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrorMessage(json.error || "Αποτυχία ενημέρωσης βιβλίου.");
          return;
        }
        if (json.book) {
          await fetchBooks();
        }
      } catch (err) {
        console.error("Update failed:", err);
        setErrorMessage("Σφάλμα κατά την ενημέρωση βιβλίου.");
        return;
      }
      setEditingKey(null);
    } else {
      // Create new book
      try {
        const res = await fetch(`http://localhost:3000/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId, title, isbn, price, category: finalCategory, coverUrl, description }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrorMessage(json.error || "Αποτυχία δημιουργίας βιβλίου.");
          return;
        }
        if (json.book) {
          setBooks([json.book, ...books]);
        }
      } catch (err) {
        console.error("Create failed:", err);
        setErrorMessage("Σφάλμα κατά τη δημιουργία βιβλίου.");
        return;
      }
    }

    // Καθαρισμός πεδίων και κλείσιμο φόρμας
    setTitle("");
    setIsbn("");
    setPrice("");
    setCategory("Λογοτεχνία");
    setCustomCategory("");
    setCoverUrl("");
    setDescription("");
    setShowForm(false);
  };

  const handleDelete = async (book) => {
    if (!window.confirm("Θέλετε σίγουρα να διαγράψετε αυτό το βιβλίο;")) return;
    const clerkId = sessionStorage.getItem("clerkId");
    try {
      const res = await fetch(`http://localhost:3000/books/${book.bookKey}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId }),
      });
      const json = await res.json();
      if (json.success) setBooks(books.filter((b) => b.bookKey !== book.bookKey));
    } catch (err) {
      console.error("Delete failed:", err);
    }
    if (editingKey === book.bookKey) {
      setEditingKey(null);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setIsbn("");
    setPrice("");
    setCategory("Λογοτεχνία");
    setCustomCategory("");
    setCoverUrl("");
    setDescription("");
    setEditingKey(null);
    setShowForm(false);
  };

  return (
    <div style={{ fontFamily: "inherit" }}>
      
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <h3 style={{ color: "#4a3733", margin: 0, fontSize: "22px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Διαχείριση Βιβλίων
        </h3>
        <button 
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
          style={{
            backgroundColor: showForm ? "#70757a" : "#e67e22",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "13px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background-color 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {showForm ? "Ακύρωση / Κλείσιμο" : "Προσθήκη Νέου Βιβλίου"}
        </button>
      </div>

      
      {showForm && (
        <form onSubmit={handleFormSubmit} style={{ backgroundColor: "#e0dacf", padding: "30px", borderRadius: "6px", marginBottom: "40px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #d3c9bc" }}>
          <h4 style={{ color: "#4a3733", marginTop: 0, marginBottom: "25px", fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #c5bba1", paddingBottom: "10px" }}>
            {editingKey ? "Επεξεργασία Βιβλίου" : "Νέο Βιβλίο"}
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "25px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a3733", textTransform: "uppercase" }}>
                Τίτλος Βιβλίου <span style={{ color: "#c62828" }}>*</span>
              </label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "12px", borderRadius: "4px", border: "1px solid #bdae9c", backgroundColor: "#fff", color: "#333", fontSize: "14px" }} placeholder="π.χ. Ο γέρος και η θαλλασα..." />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a3733", textTransform: "uppercase" }}>
                ISBN <span style={{ color: "#c62828" }}>*</span>
              </label>
              <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} style={{ padding: "12px", borderRadius: "4px", border: "1px solid #bdae9c", backgroundColor: "#fff", color: "#333", fontSize: "14px" }} placeholder="978-960-..." />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a3733", textTransform: "uppercase" }}>
                Τιμή (€) <span style={{ color: "#c62828" }}>*</span>
              </label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: "12px", borderRadius: "4px", border: "1px solid #bdae9c", backgroundColor: "#fff", color: "#333", fontSize: "14px" }} placeholder="0.00" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a3733", textTransform: "uppercase" }}>Κατηγορία</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "12px", borderRadius: "4px", border: "1px solid #bdae9c", backgroundColor: "#fff", color: "#333", fontSize: "14px", cursor: "pointer" }}>
                <option value="Λογοτεχνία">Λογοτεχνία</option>
                <option value="Επιστήμες">Επιστήμες</option>
                <option value="Βιογραφίες">Βιογραφίες</option>
                <option value="Φαντασία">Φαντασία</option>
                <option value="Άλλο">Άλλο...</option>
              </select>
            </div>
          </div>

          
          {category === "Άλλο" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#e67e22", textTransform: "uppercase" }}>Πληκτρολογήστε τη νέα Κατηγορία</label>
              <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} style={{ padding: "12px", borderRadius: "4px", border: "2px solid #e67e22", backgroundColor: "#fff", color: "#333", fontSize: "14px" }} placeholder="π.χ. Αστυνομικό, Ποίηση" />
            </div>
          )}

          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a3733", textTransform: "uppercase" }}>Εξώφυλλο Βιβλίου</label>
            
            <label style={{
              display: "block",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #bdae9c",
              backgroundColor: "#fff",
              color: "#999", 
              fontSize: "14px",
              cursor: "pointer"
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: "none" }} 
              />
              {coverUrl ? "Αλλαγή επιλεγμένης εικόνας..." : "Επιλέξτε εικόνα από τον υπολογιστή σας..."}
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "25px" }}>
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4a3733", textTransform: "uppercase" }}>Περιγραφή / Σύνοψη Βιβλίου</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" style={{ padding: "12px", borderRadius: "4px", border: "1px solid #bdae9c", backgroundColor: "#fff", color: "#333", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }} placeholder="Γράψτε λίγα λόγια για την πλοκή ή το περιεχόμενο του βιβλίου..." />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ backgroundColor: "#e67e22", color: "#fff", border: "none", padding: "12px 30px", borderRadius: "4px", fontWeight: "bold", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>
              {editingKey ? "Ενημέρωση Βιβλίου" : "Αποθήκευση στο Ράφι"}
            </button>
            {editingKey && (
              <button type="button" onClick={handleCancel} style={{ backgroundColor: "#70757a", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "4px", fontWeight: "bold", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>
                Ακύρωση
              </button>
            )}
          </div>
        </form>
      )}

      
      {books.length === 0 ? (
        <p style={{ color: "#70757a", fontStyle: "italic", textAlign: "center", padding: "40px" }}>Δεν έχετε προσθέσει κάποιο βιβλίο ακόμα.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px" }}>
          {books.map((book) => (
            <div key={book.bookKey || book.id} style={{ display: "flex", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
              
              
              <div style={{ width: "150px", minWidth: "150px", height: "210px" }}>
                <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1 }}>
                <div>
                  <span style={{ fontSize: "10px", backgroundColor: "#f5f5f5", color: "#4a3733", padding: "4px 10px", borderRadius: "4px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", border: "1px solid #ddd" }}>
                    {book.category}
                  </span>
                  <h4 style={{ margin: "12px 0 6px 0", color: "#4a3733", fontSize: "18px", lineHeight: "1.4", fontWeight: "bold" }}>
                    {book.title}
                  </h4>
                  <div style={{ fontSize: "12px", color: "#70757a", marginBottom: "8px" }}>ISBN: {book.isbn}</div>
                  
                  <p style={{ fontSize: "13px", color: "#555", margin: "0 0 10px 0", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                    {book.description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <span style={{ fontSize: "20px", fontWeight: "bold", color: "#e67e22" }}>{book.price ? parseFloat(book.price).toFixed(2) : "0.00"} €</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* Διορθώθηκε: Τώρα καλεί τη συνάρτηση handleEditClick */}
                    <button onClick={() => handleEditClick(book)} style={{ padding: "6px 12px", backgroundColor: "#fff", color: "#70757a", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                      Επεξεργασία
                    </button>
                    <button onClick={() => handleDelete(book)} style={{ padding: "6px 12px", backgroundColor: "#fff", color: "#c62828", border: "1px solid #ffcdd2", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                      Διαγραφή
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ManageBooks;