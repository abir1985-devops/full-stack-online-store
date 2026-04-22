import { Link, useSearchParams } from 'react-router-dom';

function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="payment-result-page">
      <div className="container">
        <div className="payment-result-card cancel-card">
          <div className="payment-result-icon">!</div>
          <h1>Payment Cancelled</h1>
          <p className="payment-result-text">
            Your payment was not completed. Your order is still saved, and you can
            try again whenever you are ready.
          </p>

          {orderId && (
            <p className="payment-order-id">
              Order ID: <strong>{orderId}</strong>
            </p>
          )}

          <div className="payment-result-actions">
            <Link to="/checkout" className="primary-btn">
              Back to Checkout
            </Link>
            <Link to="/orders" className="secondary-btn">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;