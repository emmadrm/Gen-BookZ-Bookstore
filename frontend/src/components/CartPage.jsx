import React, { useContext } from "react";
import { CartContext } from "../context/Cart.jsx";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const CartPage = () => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <h2 style={{ color: 'black' }}>Το καλάθι σας είναι άδειο.</h2>
        <Link to="/" className="continue-shopping-btn">
          Συνέχεια αγορών
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <p className="text-gray-400 font-bold mb-2 text-2xl">Το Καλάθι μου</p>

      <div className="cart-items-list">
        {cart.map((item, index) => (
          <div className="cart-item" key={index}>
            <div className="cart-item-info">
              <h4>{item.title}</h4>
              <p>{item.price.toFixed(2)} €</p>
            </div>

            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button onClick={() => decreaseQuantity(item.title)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>

              <div className="item-total-price">
                {(item.price * item.quantity).toFixed(2)} €
              </div>

              <button
                className="remove-item-btn"
                onClick={() => removeFromCart(item.title)}
              >
                Αφαίρεση
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Γενικό Σύνολο: {totalPrice.toFixed(2)} €</h3>
        <button
          className="checkout-btn"
          onClick={() => {
            console.log("Cart sample item:", cart[0]);
            navigate("/checkout", {
              state: {
                TotalPrice: totalPrice.toFixed(2),
                Cart: cart,
              },
            });
          }}
        >
          Μετάβαση στο Ταμείο
        </button>
      </div>
    </div>
  );
};

export default CartPage;
