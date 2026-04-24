import React, { useState, useContext } from 'react';
import { CartContext } from '../context/Cart';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../index.css'; 

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = async (e) => {
    e.preventDefault(); 
    
    if (cart.length === 0) {
      toast.error('Το καλάθι σας είναι άδειο!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/orders/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart, amount: totalPrice })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Επιτυχία! Η παραγγελία σας καταχωρήθηκε.');
        clearCart(); 
        navigate('/'); 
      } 
      else {
        toast.error(`Σφάλμα: ${data.message}`);
      }
    } catch (error) {
      toast.error('Πρόβλημα σύνδεσης με τον server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Ταμείο / Ολοκλήρωση Παραγγελίας</h2>
      
      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handlePayment}>
          <h3>Στοιχεία Παράδοσης & Πληρωμής</h3>
          
          <input type="text" placeholder="Ονοματεπώνυμο" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Διεύθυνση Αποστολής" required />
          
          <h4 style={{marginTop: '20px'}}>Στοιχεία Κάρτας (Εικονικά)</h4>
          <input type="text" placeholder="Αριθμός Κάρτας (π.χ. 4111...)" required />
          <div className="card-details">
            <input type="text" placeholder="Μήνας/Έτος (MM/YY)" required />
            <input type="text" placeholder="CVV" required />
          </div>

          <button type="submit" className="submit-payment-btn" disabled={loading}>
            {loading ? 'Επεξεργασία...' : 'Ολοκλήρωση Πληρωμής'}
          </button>
        </form>

        <div className="order-summary">
          <h3>Σύνοψη Παραγγελίας</h3>
          {cart.map((item, index) => (
            <div key={index} className="summary-item">
              <span>{item.quantity}x {item.title}</span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Σύνολο:</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;