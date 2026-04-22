import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import API from '../api';

function Checkout() {
  const navigate = useNavigate();

  let storedCart = [];
  try {
    storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!Array.isArray(storedCart)) storedCart = [];
  } catch {
    storedCart = [];
  }

  const cartItems = storedCart;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'stripe',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paypalLocalOrderId, setPaypalLocalOrderId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.cartQuantity || 0),
    0
  );

  const createLocalOrder = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to place an order.');
    }

    const validItems = cartItems
      .filter((item) => item._id && Number(item.cartQuantity) > 0)
      .map((item) => ({
        product: item._id,
        quantity: Number(item.cartQuantity),
      }));

    if (validItems.length === 0) {
      throw new Error('Your cart is empty or invalid.');
    }

    const orderPayload = {
      items: validItems,
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      paymentMethod: formData.paymentMethod,
    };

    const orderRes = await API.post('/orders', orderPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return orderRes.data?.data?.order || null;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to place an order.');
        navigate('/login');
        return;
      }

      if (formData.paymentMethod === 'paypal') {
        setSubmitting(false);
        return;
      }

      const createdOrder = await createLocalOrder();

      if (!createdOrder?._id) {
        throw new Error('Order was created but no order ID was returned');
      }

      if (formData.paymentMethod === 'stripe') {
        const paymentRes = await API.post(
          '/payments/stripe/create-checkout-session',
          { orderId: createdOrder._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const checkoutUrl = paymentRes.data?.data?.url;

        if (!checkoutUrl) {
          throw new Error('Stripe checkout URL was not returned');
        }

        window.location.href = checkoutUrl;
        return;
      }

      if (formData.paymentMethod === 'cash') {
        localStorage.removeItem('cart');
        navigate('/orders');
        return;
      }

      throw new Error(`Unsupported payment method: ${formData.paymentMethod}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="page-message">Your cart is empty.</p>;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-form-area">
            <form className="checkout-form" onSubmit={handlePlaceOrder}>
              <div className="checkout-card">
                <h2>Shipping Information</h2>
                {error && <p className="auth-error">{error}</p>}

                <div className="checkout-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group full-span">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group full-span">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="checkout-card">
                <h2>Payment Method</h2>

                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={(e) => {
                        setPaypalLocalOrderId(null);
                        handleChange(e);
                      }}
                    />
                    Credit / Debit Card
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => {
                        setPaypalLocalOrderId(null);
                        handleChange(e);
                      }}
                    />
                    Cash on Delivery
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                    />
                    PayPal
                  </label>
                </div>
              </div>

              {formData.paymentMethod !== 'paypal' && (
                <button
                  type="submit"
                  className="primary-btn place-order-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </form>

            {formData.paymentMethod === 'paypal' && (
              <div className="checkout-card" style={{ marginTop: '1rem' }}>
                <h2>Pay with PayPal</h2>

                <PayPalScriptProvider
                  options={{
                    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                    currency: 'EUR',
                    intent: 'capture',
                  }}
                >
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={async () => {
                      try {
                        const token = localStorage.getItem('token');

                        let localOrderId = paypalLocalOrderId;

                        if (!localOrderId) {
                          const createdOrder = await createLocalOrder();

                          if (!createdOrder?._id) {
                            throw new Error('Local order ID was not returned');
                          }

                          localOrderId = createdOrder._id;
                          setPaypalLocalOrderId(localOrderId);
                        }

                        const res = await API.post(
                          '/paypal/create-order',
                          { orderId: localOrderId },
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        const paypalOrderId = res.data?.data?.paypalOrderId;

                        if (!paypalOrderId) {
                          throw new Error('PayPal order ID was not returned');
                        }

                        return paypalOrderId;
                      } catch (err) {
                        setError(
                          err.response?.data?.message ||
                            err.message ||
                            'Failed to start PayPal checkout'
                        );
                        throw err;
                      }
                    }}
                    onApprove={async (data) => {
                      try {
                        const token = localStorage.getItem('token');

                        await API.post(
                          '/paypal/capture-order',
                          {
                            paypalOrderId: data.orderID,
                            orderId: paypalLocalOrderId,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        localStorage.removeItem('cart');
                        navigate('/orders?payment=success');
                      } catch (err) {
                        setError(
                          err.response?.data?.message ||
                            err.message ||
                            'Failed to capture PayPal payment'
                        );
                      }
                    }}
                    onCancel={() => {
                      setError('PayPal payment was cancelled.');
                    }}
                    onError={(err) => {
                      console.error(err);
                      setError('PayPal payment failed. Please try again.');
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div className="checkout-card">
              <h2>Order Summary</h2>

              {cartItems.map((item) => (
                <div className="summary-item" key={item._id}>
                  <div>
                    <p className="summary-name">{item.name}</p>
                    <p className="summary-qty">Qty: {item.cartQuantity}</p>
                  </div>
                 <p className="summary-price">
                    €{(Number(item.price || 0) * Number(item.cartQuantity || 0)).toFixed(2)}
                 </p>
                </div>
              ))}

              <div className="summary-total">
                <p>Payment: {formData.paymentMethod}</p>
                <h3>Total: €{totalPrice.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;