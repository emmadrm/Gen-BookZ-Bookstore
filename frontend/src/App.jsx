import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/Category.jsx';
import Checkout from './components/Checkout.jsx' ;
import Search from './components/Search.jsx';
import Cart from './components/CartPage.jsx' ; 

import { CartProvider } from './context/Cart.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css' ; 

import './index.css';

import {BrowserRouter , Routes , Route} from 'react-router-dom';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header/>
        <ToastContainer position="bottom-right" autoClose={2500} theme="colored" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/search/:query" element={<Search />} />
          </Routes>
        <Footer />
      </BrowserRouter>
   </CartProvider>
  )
}

export default App