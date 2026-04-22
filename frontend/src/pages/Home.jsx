import { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);

    console.log("Fetching page:", page); // ✅ DEBUG

    API.get(`/products?page=${page}&limit=${limit}`)
      .then((res) => {
        console.log("API RESPONSE:", res.data); // ✅ DEBUG

        setProducts(res.data?.data?.products || []);
        setTotal(res.data?.total || 0);
      })
      .catch((err) => {
        console.error('Products error:', err.response?.data || err.message);
        setError('Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  if (loading) return <p className="page-message">Loading products...</p>;
  if (error) return <p className="page-message error">{error}</p>;

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge">Premium Auto Parts Store</span>
            <h1>Drive with confidence using quality parts.</h1>
            <p>
              Discover reliable auto parts for your vehicle with a clean shopping
              experience, elegant design, and trusted products.
            </p>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <div className="section-title">
            <h2>Featured Products</h2>
          </div>

          <div className="products-grid">
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => {
                const imageUrl =
                  product.image && product.image.trim() !== ''
                    ? product.image.startsWith('http')
                      ? product.image
                      : `http://localhost:3000${product.image}`
                    : null;

                return (
                  <div className="product-card" key={product._id}>
                    <div className="product-image-wrapper">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="product-image"
                        />
                      )}
                    </div>

                    <div className="product-info">
                      <h3>{product.name}</h3>

                      <p className="product-price">
                        €{Number(product.price).toFixed(2)}
                      </p>

                      <span
                        className={`stock-badge ${
                          product.quantity > 0 ? 'in-stock' : 'out-of-stock'
                        }`}
                      >
                        {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>

                      <button
                        className="card-btn"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ✅ Pagination */}
          <div className="pagination">
            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>Page {page}</span>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={products.length < limit} // 🔥 important fix
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;