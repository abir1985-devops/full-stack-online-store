import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchProducts = () => {
    setLoading(true);

    API.get(`/products?page=${page}&limit=${limit}`)
      .then((res) => {
        setProducts(res.data?.data?.products || []);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError('Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    const token = localStorage.getItem('token');

    try {
      await API.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <p className="page-message">Loading products...</p>;
  if (error) return <p className="page-message error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-list-header">
          <div>
            <h1>Admin Products</h1>
            <p className="admin-subtitle">
              Manage your store products from one place.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate('/admin/add-product')}
          >
            Add New Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="admin-empty-card">
            <p>No products found.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Reference</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const imageUrl =
                    product.image && product.image.trim() !== ''
                      ? product.image.startsWith('http')
                        ? product.image
                        : `${window.location.origin}${product.image}`
                      : null;

                  return (
                    <tr key={product._id}>
                      <td>
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="admin-product-thumb"
                          />
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.reference}</td>
                      <td>€{Number(product.price).toFixed(2)}</td>
                      <td>{product.quantity ?? 0}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="secondary-btn small-btn"
                            onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                          >
                            Edit
                          </button>

                          <button
                            className="danger-btn small-btn"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          <span>Page {page}</span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={products.length < limit}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;