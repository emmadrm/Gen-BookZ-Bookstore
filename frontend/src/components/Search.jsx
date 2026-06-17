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
        // 1. Αναζήτηση στην τοπική μας Βάση Δεδομένων (Τα βιβλία των συγγραφέων)
        const localResponse = await fetch(`http://localhost:3000/search/local?q=${query}`);
        const localData = await localResponse.json();

        // Προσαρμογή των τοπικών βιβλίων ώστε να ταιριάζουν με το σχήμα του OpenLibrary
        const formattedLocalBooks = localData.map(book => ({
          id: book.bookKey,
          title: book.title,
          author_name: [book.author], // Σε πίνακα για να μη χτυπάει το .join() κάτω
          coverUrl: book.coverUrl || 'https://via.placeholder.com/150x220?text=Χωρίς+Εξώφυλλο',
          virtualPrice: book.price || 9.99,
          isLocal: true // "Σημαία" για να τα ξεχωρίζουμε
        }));

        // 2. Αναζήτηση στο εξωτερικό API του OpenLibrary
        const olResponse = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=12`);
        const olData = await olResponse.json();
        
        const formattedOlBooks = olData.docs.map(book => ({
          id: book.key,
          title: book.title,
          author_name: book.author_name || ['Άγνωστος Συγγραφέας'],
          coverUrl: book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
            : 'https://via.placeholder.com/150x220?text=Χωρίς+Εξώφυλλο',
          virtualPrice: (book.title.length % 15) + 9.99,
          isLocal: false
        }));

        // 3. Ένωση! Βάζουμε ΠΡΩΤΑ τα δικά μας βιβλία και μετά του API
        setBooks([...formattedLocalBooks, ...formattedOlBooks]);
        setLoading(false);
      } catch (error) {
        console.error("Σφάλμα αναζήτησης:", error);
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
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
          {books.map((book, index) => (
            <div className="book-card" key={index}>
              <div className="card-image-wrapper" style={{ position: 'relative' }}>
                <img src={book.coverUrl} alt={book.title} className="book-cover" />
                {/* Ένα μικρό ταμπελάκι για να ξεχωρίζουν τα βιβλία των συγγραφέων του GenBookZ */}
                {book.isLocal && (
                   <span style={{ position: 'absolute', top: 5, left: 5, background: '#e67e22', color: 'white', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                     GenBookZ Original
                   </span>
                )}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;