import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import { CartProvider } from "./context/Cart.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import CategoryPage from "./pages/Category.jsx";
import Checkout from "./components/Checkout.jsx";
import Search from "./components/Search.jsx";
import Cart from "./components/CartPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import RoleModal from "./components/RoleModal.jsx";
import Library from "./components/Library.jsx";
import BookForum from "./components/BookForum.jsx";
import AuthorDashboard from "./pages/AuthorDashboard/AuthorDashboard.jsx";

function ProtectedApp() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [needsRole, setNeedsRole] = useState(false);
  const [userSaved, setUserSaved] = useState(false);
  const clerkIdRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Αποθήκευση του ID για τη συνεδρία
  useEffect(() => {
    if (user?.id) {
      clerkIdRef.current = user.id;
      sessionStorage.setItem("clerkId", user.id);
    }
  }, [user]);

  // 1. ΕΛΕΓΧΟΣ ΡΟΛΟΥ: Κοιτάμε ΜΟΝΟ την προσωρινή μνήμη, όχι τη Βάση!
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const hasChosenRole = sessionStorage.getItem("roleChosen");
    if (hasChosenRole) {
      // Αν διάλεξε ρόλο σε αυτή τη συνεδρία (π.χ. έκανε refresh τη σελίδα), προχωράει
      setUserSaved(true);
      setNeedsRole(false);
    } else {
      // Αν μόλις έκανε Login, του ζητάμε ΠΑΝΤΑ ρόλο
      setNeedsRole(true);
      setUserSaved(false);
    }
  }, [isSignedIn, user]);

  // 2. ΑΠΟΣΥΝΔΕΣΗ: Καθαρίζουμε ΜΟΝΟ τη μνήμη, ΔΕΝ διαγράφουμε τίποτα από τη Βάση!
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.log("Ο χρήστης αποσυνδέθηκε - Καθαρισμός Session");
      sessionStorage.clear(); // Αδειάζει η μνήμη
      clerkIdRef.current = null;
      setUserSaved(false);
      setNeedsRole(false);
    }
  }, [isSignedIn, isLoaded]);

  // 3. ΕΠΙΛΟΓΗ ΡΟΛΟΥ: Αποθηκεύουμε την επιλογή στο session και κάνουμε update στη Βάση
  const handleRoleSelected = async (role) => {
    await fetch("http://localhost:3000/users/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        role,
      }),
    });
    
    // Αποθηκεύουμε ότι διαλέξαμε ρόλο για να μη μας ξαναρωτήσει αν κάνουμε Refresh (F5)
    sessionStorage.setItem("roleChosen", "true");
    
    setNeedsRole(false);
    setUserSaved(true);

    if (role === "AUTHOR") {
      navigate("/author-dashboard");
    } else {
      navigate("/"); // Αν είναι αναγνώστης, πάει στην αρχική
    }
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return <LandingPage />;

  // Block the whole app until role is chosen
  if (needsRole) return <RoleModal onRoleSelected={handleRoleSelected} />;

  // Wait until user is confirmed saved
  if (!userSaved) return null;

  const hideHeader = location.pathname === "/author-dashboard";

  return (
    <CartProvider>
      {!hideHeader && <Header />}
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/completion" element={<PaymentSuccess />} />
        <Route path="/search/:query" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:bookKey" element={<BookForum />} />
        <Route path="/author-dashboard" element={<AuthorDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}

function App() {
  return <ProtectedApp />;
}

export default App;