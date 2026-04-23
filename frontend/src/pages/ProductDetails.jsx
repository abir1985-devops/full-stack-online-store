import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data?.data);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError('Failed to load product');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = existingCart.find((item) => item._id === product._id);

    let updatedCart;

    if (existingItem) {
      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      );
    } else {
      updatedCart = [...existingCart, { ...product, cartQuantity: 1 }];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    navigate('/cart');
  };

  if (loading) return <p className="page-message">Loading product...</p>;
  if (error) return <p className="page-message error">{error}</p>;
  if (!product) return <p className="page-message">Product not found</p>;

  const imageUrl =
    product.image && product.image.trim() !== ''
      ? product.image.startsWith('http')
        ? product.image
        : `${window.location.origin}${product.image}`
      : null;

  return (
    <div className="product-details-page">
      <div className="container product-details">
        <div className="product-image-section">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>

          <p className="product-ref">
            Reference: {product.reference || 'N/A'}
          </p>

          <p className="product-price-big">€{Number(product.price).toFixed(2)}</p>

          <span
            className={`stock-badge ${
              product.quantity > 0 ? 'in-stock' : 'out-of-stock'
            }`}
          >
            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>

          <p className="product-description">
            {product.description || 'No description available.'}
          </p>

          {role === 'user' && (
            <button className="primary-btn add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;