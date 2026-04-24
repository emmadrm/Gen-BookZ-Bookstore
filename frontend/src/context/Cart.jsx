import React, { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (book) => {
    const existingBook = cart.find((item) => item.title === book.title);

    if (existingBook) {
      toast.info(`Αυξήθηκε η ποσότητα: ${book.title.substring(0, 20)}...`);
    } else {
      toast.success(`Προστέθηκε στο καλάθι: ${book.title.substring(0, 20)}...`);
    }

    setCart((prevCart) => {
      if (existingBook) {
        return prevCart.map((item) =>
          item.title === book.title ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const safePrice = book.virtualPrice || ((book.title.length % 15) + 9.99);
        return [...prevCart, { ...book, quantity: 1, price: safePrice }];
      }
    });
  };

  const clearCart = () => { setCart([]); };

  const decreaseQuantity = (title) => {
    setCart((prevCart) => {
      const existingBook = prevCart.find((item) => item.title === title);
      
      if (existingBook.quantity === 1) {
        // Αν είναι 1 και το μειώσει κι άλλο, το αφαιρούμε τελείως
        toast.error(`Αφαιρέθηκε από το καλάθι!`);
        return prevCart.filter((item) => item.title !== title);
      } else {
        return prevCart.map((item) =>
          item.title === title ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const removeFromCart = (title) => {
    setCart((prevCart) => prevCart.filter((item) => item.title !== title));
    toast.error(`Διαγράφηκε από το καλάθι!`);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};