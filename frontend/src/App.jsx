import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

function ProtectedApp() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [needsRole, setNeedsRole] = useState(false);
  const [userSaved, setUserSaved] = useState(false);
  const clerkIdRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      clerkIdRef.current = user.id;
      sessionStorage.setItem("clerkId", user.id);
    }
  }, [user]);

  // Check if user is already saved in DB when they sign in
  useEffect(() => {
    if (!isSignedIn || !user) return;

    fetch(`http://localhost:3000/users/${user.id}`)
      .then((res) => res.json())
      .then(({ user: dbUser }) => {
        if (dbUser) {
          // Already in DB with a role — good to go
          setUserSaved(true);
          setNeedsRole(false);
        } else {
          // New sign in — needs role selection
          setNeedsRole(true);
        }
      });
  }, [isSignedIn, user]);

  // Delete user from DB on sign out
  useEffect(() => {
    const storedClerkId =
      clerkIdRef.current || sessionStorage.getItem("clerkId");
    console.log("Sign out effect fired:", {
      isLoaded,
      isSignedIn,
      storedClerkId,
    });
    if (isLoaded && !isSignedIn && storedClerkId) {
      console.log("Attempting delete for:", clerkIdRef.current);
      fetch("http://localhost:3000/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: storedClerkId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Delete response:", data);
          sessionStorage.removeItem("clerkId");
          clerkIdRef.current = null;
          setUserSaved(false);
          setNeedsRole(false);
        })
        .catch((err) => console.error("Delete failed:", err));
    }
  }, [isSignedIn, isLoaded]);

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
    setNeedsRole(false);
    setUserSaved(true);
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return <LandingPage />;

  // Block the whole app until role is chosen
  if (needsRole) return <RoleModal onRoleSelected={handleRoleSelected} />;

  // Wait until user is confirmed saved
  if (!userSaved) return null;

  return (
    <CartProvider>
      <Header />
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
