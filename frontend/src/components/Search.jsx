import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/Cart.jsx'; 
import '../index.css'; 

const Search = () => {
  const { query } = useParams(); 
  const { addToCart } = useContext(CartContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=12`);
        const data = await response.json();
        
        const booksWithPrices = data.docs.map(book => {
          const price = (book.title.length % 15) + 9.99;
          return { ...book, virtualPrice: price };
        });

        setBooks(booksWithPrices);
        setLoading(false);
      } catch (error) {
        console.error("Σφάλμα αναζήτησης:", error);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]); 

  return (
    <div className="home-container">
      <h2 className="section-title">
        Αποτελέσματα αναζήτησης για: "{query}"
      </h2>
      
      {loading ? (
        <div className="loading-spinner">Αναζήτηση βιβλίων... (μπορεί να πάρει λίγο χρόνο)</div>
      ) : books.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Δεν βρέθηκαν βιβλία με αυτόν τον όρο.</p>
      ) : (
        <div className="books-grid">
          {books.map((book, index) => {
            const coverUrl = book.cover_i 
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
              : 'https://via.placeholder.com/150x220?text=Χωρίς+Εξώφυλλο';

            return (
              <div className="book-card" key={index}>
                <div className="card-image-wrapper">
                  <img src={coverUrl} alt={book.title} className="book-cover" />
                </div>
                <div className="book-info">
                  <h3 className="book-title" title={book.title}>
                    {book.title.length > 40 ? book.title.substring(0, 40) + '...' : book.title}
                  </h3>
                  <p className="book-author">
                    {book.author_name ? book.author_name.join(', ') : 'Άγνωστος Συγγραφέας'}
                  </p>
                  <div className="price-and-action">
                    <span className="book-price">{book.virtualPrice.toFixed(2)} €</span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(book)}
                    >
                      Προσθήκη
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;