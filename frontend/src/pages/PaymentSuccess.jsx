import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    if (!paymentIntentId) {
      setError("No payment information found.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:3000/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    })
      .then((res) => res.json())
      .then(({ order, error }) => {
        if (error) setError(error);
        else setOrder(order);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Επιβεβαίωση παραγγελίας...</p>;
  if (error) return <p>Σφάλμα: {error}</p>;

  return (
    <div className="success-container">
      <h2 className="text-black"> Η παραγγελία σας ολοκληρώθηκε!</h2>
      <p>
        Ευχαριστούμε, <strong>{order.userName}</strong>!
      </p>
      <p>Email επιβεβαίωσης: {order.userEmail}</p>

      <h3>Βιβλία που αγοράσατε:</h3>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> — {item.author} —{" "}
            {item.price.toFixed(2)}€
          </li>
        ))}
      </ul>

      <p>
        Σύνολο: <strong>{order.totalAmount.toFixed(2)}€</strong>
      </p>

      <Link to="/">Επιστροφή στο κατάστημα</Link>
    </div>
  );
};

export default PaymentSuccess;
