import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AddProduct from './pages/AddProduct';
import AdminProducts from './pages/AdminProducts';
import EditProduct from './pages/EditProduct';
import AdminOrders from './pages/AdminOrders';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="brand">
          AutoLux
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>

          {!token && <Link to="/login">Login</Link>}

          {token && role === 'user' && (
            <>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">Cart</Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {token && role === 'admin' && (
            <>
              <Link to="/admin/add-product">Add Product</Link>
              <Link to="/admin/products">Admin Products</Link>
              <Link to="/admin/orders">Admin Orders</Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

          <Route
            path="/orders"
            element={
              <UserRoute>
                <MyOrders />
              </UserRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <UserRoute>
                <Cart />
              </UserRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <UserRoute>
                <Checkout />
              </UserRoute>
            }
          />

          <Route
            path="/admin/add-product"
            element={
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/edit-product/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;