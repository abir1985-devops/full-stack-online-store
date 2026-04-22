import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    localStorage.removeItem('cart');
  }, []);

  return (
    <div className="payment-result-page">
      <div className="container">
        <div className="payment-result-card success-card">
          <div className="payment-result-icon">✓</div>
          <h1>Payment Successful</h1>
          <p className="payment-result-text">
            Thank you for your purchase. Your payment was completed successfully
            and your order has been received.
          </p>

          {orderId && (
            <p className="payment-order-id">
              Order ID: <strong>{orderId}</strong>
            </p>
          )}

          <div className="payment-result-actions">
            <Link to="/orders" className="primary-btn">
              View My Orders
            </Link>
            <Link to="/" className="secondary-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;