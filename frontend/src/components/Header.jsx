import React, { useContext, useState } from "react";
import {
  FaSearch,
  FaShoppingCart,
  FaUserAlt,
  FaHeart,
  FaBook,
} from "react-icons/fa";
import Logo from "../assets/Logoo.png";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/Cart.jsx";
import "../index.css";
import { UserButton } from "@clerk/react";

const Header = () => {
  const { cart } = useContext(CartContext);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/search/${searchTerm}`);
    }
  };

  return (
    <header className="header-main">
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="contact-info">
            <span>Τηλ. Εξυπηρέτησης: 210 1234567</span>
          </div>
        </div>
      </div>

      <div className="main-header">
        <div className="logo-group">
          <Link to="/">
            {" "}
            <img alt="Gen BookZ logo" className="logo" src={Logo}></img>{" "}
          </Link>
          <div className="logo-container user-links">
            <Link to="/">
              {" "}
              <h1 className="title">
                <span>Gen</span> Book<span>Z</span>
              </h1>{" "}
            </Link>
          </div>
        </div>

        <div className="search-container">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Αναζήτηση με τίτλο, συγγραφέα, εκδότη, ISBN..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="header-actions">
          <Link
            to="/library"
            style={{ textDecoration: "none", color: "black" }}
          >
            <div
              className="action-icon"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <FaBook size={20} />
              <span>My Library</span>
            </div>
          </Link>
          <div className="action-icon">
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-300/50",
                },
              }}
            />
          </div>
          <Link to="/cart" style={{ textDecoration: "none", color: "black" }}>
            <div className="action-cart">
              <FaShoppingCart className="cart-icon" />
              <span className="cart-count">{totalItems}</span>
              <div className="cart-text">
                <span>Το καλάθι μου</span>
                <span className="cart-total">{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <nav className="nav-bar">
        <ul className="nav-links">
          <li>
            <Link to="/">ΑΡΧΙΚΗ</Link>
          </li>
          <li>
            <Link to="/category/literature">ΛΟΓΟΤΕΧΝΙΑ</Link>
          </li>
          <li>
            <Link to="/category/science">ΕΠΙΣΤΗΜΕΣ</Link>
          </li>
          <li>
            <Link to="/category/biography">ΒΙΟΓΡΑΦΙΕΣ</Link>
          </li>
          <li>
            <Link to="/category/fantasy">ΦΑΝΤΑΣΙΑ</Link>
          </li>
          <li>
            <Link to="/category/children">ΠΑΙΔΙΚΑ</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
