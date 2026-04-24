import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/Cart' ; 
import '../index.css'; 

const Category = () => {
  const { addToCart } = useContext(CartContext);
  const { categoryName } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryTitles = {
    literature: 'Λογοτεχνία',
    science: 'Επιστήμες',
    biography: 'Βιογραφίες',
    fantasy: 'Φαντασία',
    children: 'Παιδικά'
  };

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      setLoading(true); 
      try {
        const response = await fetch(`https://openlibrary.org/subjects/${categoryName}.json?limit=40`);
        const data = await response.json();
        
        const booksWithPrices = data.works.map(book => {
        const price = (book.title.length % 15) + 9.99;
        return { ...book, virtualPrice: price };
        });
        setBooks(booksWithPrices);
        setLoading(false);
      } catch (error) {
        console.error("Σφάλμα κατά τη φόρτωση κατηγορίας:", error);
        setLoading(false);
      }
    };

    fetchCategoryBooks();
  }, [categoryName]); 

  return (
    <div className="home-container">
      <h2 className="section-title">
        Κατηγορία: {categoryTitles[categoryName] || categoryName}
      </h2>
      
      {loading ? (
        <div className="loading-spinner">Φόρτωση βιβλίων κατηγορίας...</div>
      ) : (
        <div className="books-grid">
          {books.map((book, index) => {
            const coverUrl = book.cover_id 
              ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` 
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
                    {book.authors ? book.authors.map(a => a.name).join(', ') : 'Άγνωστος Συγγραφέας'}
                  </p>
                  <div className="price-and-action">
                    <span className="book-price">{book.virtualPrice.toFixed(2)} €</span>
                  <button className="add-to-cart-btn" onClick={() => addToCart(book)}>Προσθήκη</button>
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

export default Category;