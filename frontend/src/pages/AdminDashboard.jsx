import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/react";

const AdminDashboard = () => {
  const { user } = useUser();
  const [view, setView] = useState("dashboard");

  // Στατιστικά & Διαγράμματα
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // Σχόλια
  const [commentsData, setCommentsData] = useState({ reviews: [], questions: [] });
  const [loadingComments, setLoadingComments] = useState(false);

  // Παραγγελίες
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Βιβλία & Φόρμα Διαχείρισης
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Πεδία Φόρμας Βιβλίου
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(""); 
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Λογοτεχνία");
  const [customCategory, setCustomCategory] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [description, setDescription] = useState("");

  // Fetch Στατιστικών
  useEffect(() => {
    if (view !== "stats") return;
    setLoading(true);
    fetch("http://localhost:3000/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, [view]);

  // Fetch Σχολίων
  useEffect(() => {
    if (view !== "comments") return;
    setLoadingComments(true);
    fetch("http://localhost:3000/admin/comments")
      .then(res => res.json())
      .then(data => {
        setCommentsData({ reviews: data.reviews || [], questions: data.questions || [] });
        setLoadingComments(false);
      });
  }, [view]);

  // Fetch Παραγγελιολογίου
  useEffect(() => {
    if (view !== "orders") return;
    setLoadingOrders(true);
    fetch("http://localhost:3000/admin/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoadingOrders(false);
      });
  }, [view]);

  // Fetch Βιβλίων
  const fetchBooks = () => {
    setLoadingBooks(true);
    fetch("http://localhost:3000/admin/books")
      .then(res => res.json())
      .then(data => {
        setBooks(data.books || []);
        setLoadingBooks(false);
      });
  };

  useEffect(() => {
    if (view === "books") fetchBooks();
  }, [view]);

  // Μετατροπή εικόνας σε Base64
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

  // Ενεργοποίηση Επεξεργασίας Βιβλίου
  const handleEditClick = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author || ""); 
    setIsbn(book.isbn);
    setPrice(book.price || "");
    setCoverUrl(book.coverUrl || "");
    setDescription(book.description || "");
    const defaults = ["Λογοτεχνία", "Επιστήμες", "Βιογραφίες", "Φαντασία"];
    if (defaults.includes(book.category)) {
      setCategory(book.category);
      setCustomCategory("");
    } else {
      setCategory("Άλλο");
      setCustomCategory(book.category || "");
    }
    setShowForm(true);
  };

  // Υποβολή Φόρμας
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !isbn || !price) return alert("Συμπληρώστε τα υποχρεωτικά πεδία!");

    const finalCategory = category === "Άλλο" ? customCategory.trim() : category;
    const url = editingBook 
      ? `http://localhost:3000/admin/books/${editingBook.bookKey}`
      : `http://localhost:3000/books`;

    const method = editingBook ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        title, author, isbn, price: Number(price), category: finalCategory, coverUrl, description
      })
    });

    if (res.ok) {
      alert(editingBook ? "Το βιβλίο ενημερώθηκε!" : "Το βιβλίο προστέθηκε με επιτυχία!");
      handleCancelForm();
      fetchBooks();
    } else {
      alert("Αποτυχία αποθήκευσης.");
    }
  };

  const handleCancelForm = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor(""); 
    setIsbn("");
    setPrice("");
    setCategory("Λογοτεχνία");
    setCustomCategory("");
    setCoverUrl("");
    setDescription("");
    setShowForm(false);
  };

  // Διαγραφές
  const handleDeleteBook = async (bookKey) => {
    if (!window.confirm("Θέλετε σίγουρα να διαγράψετε αυτό το βιβλίο;")) return;
    const res = await fetch(`http://localhost:3000/admin/books/${bookKey}`, { method: "DELETE" });
    if (res.ok) setBooks(prev => prev.filter(b => b.bookKey !== bookKey));
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Διαγραφή αυτής της κριτικής;")) return;
    const res = await fetch(`http://localhost:3000/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) setCommentsData(prev => ({ ...prev, reviews: prev.reviews.filter(r => r.id !== id) }));
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Διαγραφή αυτής της ερώτησης;")) return;
    const res = await fetch(`http://localhost:3000/admin/questions/${id}`, { method: "DELETE" });
    if (res.ok) setCommentsData(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  };

  const TopBar = ({ title }) => (
    <div className="flex justify-between items-center border-b pb-4 mb-6 mt-8">
      <h2 className="text-3xl font-bold text-black">{title}</h2>
      <button onClick={() => { setView("dashboard"); handleCancelForm(); }} className="text-indigo-600 font-semibold hover:bg-indigo-50 px-4 py-2 rounded-lg transition">
        &larr; Πάνελ
      </button>
    </div>
  );

  // ================== VIEWS RENDERING ==================

  // 1. VIEW: ΣΤΑΤΙΣΤΙΚΑ & ΔΙΑΓΡΑΜΜΑΤΑ
  if (view === "stats") {
    const maxSales = stats?.bestSellers?.length ? Math.max(...stats.bestSellers.map(d => d.sales)) : 1;
    return (
      <main className="max-w-5xl mx-auto p-6 min-h-screen">
        <TopBar title="Αναλυτικά Στατιστικά Καταστήματος" />
        {loading ? <p className="text-gray-500">Φόρτωση Analytics...</p> : stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-sm text-gray-400 font-bold uppercase">Συνολικά Έσοδα</p><p className="text-4xl font-light text-green-600 mt-2">{stats.totalRevenue?.toFixed(2)} €</p></div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-sm text-gray-400 font-bold uppercase">Παραγγελίες</p><p className="text-4xl font-light text-black mt-2">{stats.totalOrders}</p></div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-sm text-gray-400 font-bold uppercase">Εγγεγραμμένα Μέλη</p><p className="text-4xl font-light text-black mt-2">{stats.totalUsers}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-8">Γράφημα Κορυφαίων Πωλήσεων (Best Sellers)</h4>
                <div className="flex items-end justify-between h-48 border-b pb-2 gap-4">
                  {stats.bestSellers?.map((item, index) => {
                    const barHeight = (item.sales / maxSales) * 100;
                    const isHovered = hoveredBarIndex === index;
                    return (
                      <div key={index} onMouseEnter={() => setHoveredBarIndex(index)} onMouseLeave={() => setHoveredBarIndex(null)} className="flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer group">
                        <span className={`text-xs text-indigo-600 font-bold mb-1 transition-all ${isHovered ? "scale-110" : "opacity-70"}`}>{item.sales}</span>
                        <div style={{ height: `${barHeight}%` }} className={`w-full max-w-[32px] rounded-t transition-all duration-200 ${isHovered ? "bg-amber-500 scale-x-105" : "bg-indigo-500 opacity-85"}`} />
                        <span className="text-[10px] text-gray-400 mt-2 text-center truncate w-full" title={item.title}>{item.title}</span>
                      </div>
                    );
                  })}
                  {stats.bestSellers?.length === 0 && <p className="text-gray-500 pb-12 w-full text-center italic">Δεν υπάρχουν δεδομένα πωλήσεων.</p>}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-6">Μερίδιο Πωλήσεων ανά Βιβλίο</h4>
                <div className="space-y-4">
                  {stats.bestSellers?.map((book, idx) => {
                    const maxSalesVal = stats.bestSellers[0].sales;
                    const barWidth = Math.round((book.sales / maxSalesVal) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1 text-gray-700"><span className="font-semibold truncate max-w-[200px]">{book.title}</span><span className="text-gray-500 text-xs">{book.sales} πωλ. ({book.revenue.toFixed(2)} €)</span></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div style={{ width: `${barWidth}%` }} className={`h-full rounded-full ${idx === 0 ? "bg-indigo-600" : "bg-gray-400"}`} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // 2. VIEW: ΔΙΑΧΕΙΡΙΣΗ & ΠΡΟΣΘΗΚΗ ΒΙΒΛΙΩΝ (Προστέθηκε πεδίο Συγγραφέα)
  if (view === "books") {
    return (
      <main className="max-w-7xl mx-auto p-6 min-h-screen">
        <div className="flex justify-between items-center border-b pb-4 mb-6 mt-8">
          <h2 className="text-3xl font-bold text-black">Διαχείριση Βιβλιοθήκης</h2>
          <div className="flex gap-3">
            <button onClick={() => { if(showForm) handleCancelForm(); else setShowForm(true); }} className={`px-4 py-2 text-white font-bold rounded-lg text-sm transition ${showForm ? "bg-gray-500" : "bg-amber-500 hover:bg-amber-600"}`}>{showForm ? "Κλείσιμο Φόρμας" : "Προσθήκη Νέου Βιβλίου"}</button>
            <button onClick={() => { setView("dashboard"); handleCancelForm(); }} className="text-indigo-600 font-semibold hover:bg-indigo-50 px-4 py-2 rounded-lg transition">&larr; Πάνελ</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleFormSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-4 shadow-sm">
            <h4 className="text-md font-bold text-gray-700 uppercase border-b pb-2">{editingBook ? "Επεξεργασία Βιβλίου" : "Καταχώρηση Νέου Βιβλίου"}</h4>
            
            {/* Διορθώθηκε το grid για να χωρέσει και τον Συγγραφέα */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Τίτλος Βιβλίου *</label><input type="text" className="w-full border p-2 text-sm rounded bg-white" value={title} onChange={e => setTitle(e.target.value)} required placeholder="π.χ. Οδύσσεια"/></div>
              <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Συγγραφέας *</label><input type="text" className="w-full border p-2 text-sm rounded bg-white" value={author} onChange={e => setAuthor(e.target.value)} required placeholder="π.χ. Όμηρος"/></div>
              <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">ISBN *</label><input type="text" className="w-full border p-2 text-sm rounded bg-white" value={isbn} onChange={e => setIsbn(e.target.value)} required placeholder="978-..."/></div>
              <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Τιμή (€) *</label><input type="number" step="0.01" className="w-full border p-2 text-sm rounded bg-white" value={price} onChange={e => setPrice(e.target.value)} required placeholder="0.00"/></div>
              <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Κατηγορία</label><select className="w-full border p-2 text-sm rounded bg-white cursor-pointer" value={category} onChange={e => setCategory(e.target.value)}><option value="Λογοτεχνία">Λογοτεχνία</option><option value="Επιστήμες">Επιστήμες</option><option value="Βιογραφίες">Βιογραφίες</option><option value="Φαντασία">Φαντασία</option><option value="Άλλο">Άλλο...</option></select></div>
            </div>
            
            {category === "Άλλο" && (<div><label className="block text-xs font-bold text-amber-600 uppercase mb-1">Όνομα Νέας Κατηγορίας</label><input type="text" className="w-full border-2 border-amber-400 p-2 text-sm rounded bg-white" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="π.χ. Αστυνομικό"/></div>)}
            <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Εξώφυλλο (Αρχείο Εικόνας)</label><label className="block border p-2 text-sm rounded bg-white text-gray-400 cursor-pointer hover:bg-gray-100"><input type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>{coverUrl ? "Αλλαγή επιλεγμένου εξωφύλλου..." : "Επιλέξτε αρχείο φωτογραφίας..."}</label></div>
            <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Περιγραφή / Σύνοψη</label><textarea className="w-full border p-2 text-sm rounded bg-white" rows="3" value={description} onChange={e => setDescription(e.target.value)} placeholder="Γράψτε τη σύνοψη της πλοκής..."/></div>
            <div className="flex gap-2"><button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-lg text-sm hover:bg-indigo-700">{editingBook ? "Ενημέρωση" : "Αποθήκευση στο Ράφι"}</button><button type="button" onClick={handleCancelForm} className="bg-gray-400 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-gray-500">Ακύρωση</button></div>
          </form>
        )}

        {loadingBooks ? <p className="text-gray-500">Φόρτωση βιβλίων...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {books.map(book => (
              <div key={book.bookKey} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
                <div className="h-52 bg-gray-50 rounded-lg overflow-hidden mb-3 flex justify-center"><img src={book.coverUrl || "https://via.placeholder.com/150x220?text=No+Cover"} alt={book.title} className="h-full object-cover shadow-sm" /></div>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold uppercase self-start mb-2">{book.category}</span>
                <h4 className="font-bold text-md text-gray-900 leading-tight truncate mb-1" title={book.title}>{book.title}</h4>
                <p className="text-xs text-gray-500 mb-2 truncate">Από: {book.author}</p>
                <div className="mt-auto flex justify-between items-center border-t pt-3">
                  <span className="font-bold text-amber-600 text-lg">{book.price?.toFixed(2)} €</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditClick(book)} className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded font-bold hover:bg-blue-100">Edit</button>
                    <button onClick={() => handleDeleteBook(book.bookKey)} className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 rounded font-bold hover:bg-red-100">Διαγραφή</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // 3. VIEW: ΠΡΟΒΟΛΗ ΟΛΩΝ ΤΩΝ ΠΑΡΑΓΓΕΛΙΩΝ
  if (view === "orders") {
    return (
      <main className="max-w-6xl mx-auto p-6 min-h-screen">
        <TopBar title="Διαχείριση Παραγγελιολογίου (Όλες οι Παραγγελίες)" />
        {loadingOrders ? <p className="text-gray-500">Φόρτωση παραγγελιών...</p> : (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-700 min-w-[700px]">
              <thead className="bg-gray-50 border-b text-gray-400 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">ID Παραγγελίας</th>
                  <th className="p-4">Στοιχεία Πελάτη</th>
                  <th className="p-4">Ημερομηνία</th>
                  <th className="p-4">Αγορασμένα Βιβλία</th>
                  <th className="p-4">Κατάσταση</th>
                  <th className="p-4 text-right">Ποσό</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{order.userName || "Επισκέπτης"}</div>
                      <div className="text-xs text-gray-400 font-mono">{order.userEmail}</div>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString("el-GR")}</td>
                    <td className="p-4 max-w-xs truncate font-medium text-gray-800" title={order.items?.map(i => i.title).join(", ")}>
                      {order.items?.map(i => i.title).join(", ") || "-"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                        order.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900 text-md">{order.totalAmount?.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    );
  }

  // 4. VIEW: ΣΧΟΛΙΑ & ΚΡΙΤΙΚΕΣ (Επιστροφή σε εμφάνιση bookKey)
  if (view === "comments") {
    return (
      <main className="max-w-5xl mx-auto p-6 min-h-screen">
        <TopBar title="Διαχείριση Σχολιασμών & Κριτικών" />
        {loadingComments ? <p className="text-gray-500">Φόρτωση δεδομένων...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-xl font-bold text-black mb-4 border-b pb-2">Κριτικές ({commentsData.reviews.length})</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {commentsData.reviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-gray-900">{review.user?.name || "Άγνωστος"}</span>
                      <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
                    </div>
                    {/* ΕΜΦΑΝΙΣΗ BOOKKEY ΑΝΤΙ ΓΙΑ ΤΙΤΛΟ */}
                    <p className="text-xs text-indigo-600 mb-2 font-mono">BookKey: {review.bookKey}</p>
                    <p className="text-sm text-gray-700 bg-white p-3 border rounded-md">{review.content}</p>
                    <button onClick={() => handleDeleteReview(review.id)} className="mt-3 text-red-600 text-sm font-bold hover:underline">Διαγραφή</button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-xl font-bold text-black mb-4 border-b pb-2">Ερωτήσεις ({commentsData.questions.length})</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {commentsData.questions.map(question => (
                  <div key={question.id} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="font-bold text-sm text-blue-900">{question.user?.name || "Άγνωστος"}</span>
                    {/* ΕΜΦΑΝΙΣΗ BOOKKEY ΑΝΤΙ ΓΙΑ ΤΙΤΛΟ */}
                    <p className="text-xs text-blue-600 mt-1 mb-2 font-mono">BookKey: {question.bookKey}</p>
                    <p className="text-sm text-gray-800 bg-white p-3 border border-blue-100 rounded-md">{question.content}</p>
                    <button onClick={() => handleDeleteQuestion(question.id)} className="mt-3 text-red-600 text-sm font-bold hover:underline">Διαγραφή</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // 5. VIEW: ΚΕΝΤΡΙΚΟ DASHBOARD
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8 min-h-screen">
      <header className="border-b border-gray-200 pb-6 mt-8">
        <h1 className="text-4xl font-bold text-black mb-2">Πάνελ Διαχειριστή</h1>
        <p className="text-xl text-gray-500 font-light">Καλώς ήρθες, {user?.firstName || "Admin"}. Εποπτεία και έλεγχος του GenBookZ.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <section className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-pointer flex flex-col" onClick={() => setView("books")}>
          <div className="text-4xl mb-3">📚</div>
          <h2 className="text-xl font-bold text-black mb-1">Βιβλία</h2>
          <p className="text-xs text-gray-400 mt-auto">Προσθήκη, επεξεργασία και οριστική διαγραφή τίτλων.</p>
        </section>

        <section className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md hover:border-green-200 transition cursor-pointer flex flex-col" onClick={() => setView("orders")}>
          <div className="text-4xl mb-3">🛒</div>
          <h2 className="text-xl font-bold text-black mb-1">Παραγγελίες</h2>
          <p className="text-xs text-gray-400 mt-auto">Πλήρης έλεγχος του ιστορικού αγορών και παραγγελιολογίου.</p>
        </section>

        <section className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md hover:border-amber-200 transition cursor-pointer flex flex-col" onClick={() => setView("stats")}>
          <div className="text-4xl mb-3">📈</div>
          <h2 className="text-xl font-bold text-black mb-1">Στατιστικά</h2>
          <p className="text-xs text-gray-400 mt-auto">Γραφήματα, τζίρος, Analytics και Best Sellers της αγοράς.</p>
        </section>

        <section className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md hover:border-red-200 transition cursor-pointer flex flex-col" onClick={() => setView("comments")}>
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-bold text-black mb-1">Σχόλια</h2>
          <p className="text-xs text-gray-400 mt-auto">Εποπτεία χρηστών και διαγραφή ακατάλληλου περιεχομένου.</p>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;