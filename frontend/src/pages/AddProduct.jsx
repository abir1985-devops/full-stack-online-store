import { useState } from 'react';
import API from '../api';

function AddProduct() {
  const [formData, setFormData] = useState({
    reference: '',
    name: '',
    quantity: '',
    description: '',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const res = await API.post('/products', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Product created:', res.data);
      setMessage('Product added successfully!');

      setFormData({
        reference: '',
        name: '',
        quantity: '',
        description: '',
        price: '',
      });

      setImageFile(null);
    } catch (err) {
      console.error(err.response?.data || err.message);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add product';

      setError(backendMessage);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-form-card">
          <h1>Add New Product</h1>
          <p className="admin-subtitle">
            Fill in the product information to add a new item to your store.
          </p>

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
                <label>Product Image</label>
                <input
                  type="file"
                  name="image"
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
              Add Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;