import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reference: '',
    name: '',
    image: '',
    quantity: '',
    description: '',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => {
        const product = res.data?.data;

        setFormData({
          reference: product?.reference || '',
          name: product?.name || '',
          image: product?.image || '',
          quantity: product?.quantity ?? '',
          description: product?.description || '',
          price: product?.price ?? '',
        });
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError('Failed to load product');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');

    const formDataToSend = new FormData();
    formDataToSend.append('reference', formData.reference);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', Number(formData.price));
    formDataToSend.append(
      'quantity',
      formData.quantity === '' ? 0 : Number(formData.quantity)
    );
    formDataToSend.append('description', formData.description);

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      const res = await API.patch(`/products/${id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Product updated:', res.data);
      setMessage('Product updated successfully!');

      setFormData((prev) => ({
        ...prev,
        image: res.data?.data?.image || prev.image,
      }));

      setImageFile(null);
    } catch (err) {
      console.error(err.response?.data || err.message);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update product';

      setError(backendMessage);
    }
  };

  if (loading) return <p className="page-message">Loading product...</p>;
  if (error && !formData.name) return <p className="page-message error">{error}</p>;

  const currentImageUrl = formData.image
    ? formData.image.startsWith('http')
      ? formData.image
      : `http://localhost:3000${formData.image}`
    : '/filter_element.png';

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-form-card">
          <div className="admin-top-row">
            <div>
              <h1>Edit Product</h1>
              <p className="admin-subtitle">
                Update the product information.
              </p>
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate('/admin/products')}
            >
              Back to Products
            </button>
          </div>

          {message && <p className="admin-success">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="checkout-grid">
              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-span">
                <label>Current Image</label>
                <img
                  src={currentImageUrl}
                  alt="Current product"
                  style={{ width: '200px', borderRadius: '10px' }}
                  onError={(e) => {
                    e.currentTarget.src = '/filter_element.png';
                  }}
                />
              </div>

              <div className="form-group full-span">
                <label>Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-span">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                />
              </div>
            </div>

            <button type="submit" className="primary-btn full-width">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;