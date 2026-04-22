import { useEffect, useState } from 'react';
import API from '../api';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    API.get('/orders/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log('Orders response:', res.data);
        setOrders(res.data?.data?.orders || []);
      })
      .catch((err) => {
        console.error('Orders error:', err.response?.data || err.message);
        setError('Failed to load orders');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      setError('');
      setActionLoadingId(orderId);

      const token = localStorage.getItem('token');

      const res = await API.patch(
        `/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = res.data?.data?.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
    } catch (err) {
      console.error('Cancel order error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoadingId('');
    }
  };

  if (loading) return <h2>Loading orders...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => {
          const canCancel =
            order.status === 'pending' &&
            order.paymentStatus === 'unpaid';

          return (
            <div
              key={order._id}
              style={{
                border: '1px solid #ccc',
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '12px',
                background: '#fff',
              }}
            >
              <p><strong>Status:</strong> {order.status || 'Unknown'}</p>
              <p><strong>Payment:</strong> {order.paymentStatus || 'Unknown'}</p>
              <p><strong>Total:</strong> €{Number(order.totalAmount ?? 0).toFixed(2)}</p>

              {canCancel && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  disabled={actionLoadingId === order._id}
                  style={{
                    marginTop: '10px',
                    marginBottom: '12px',
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {actionLoadingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              {(order.items || []).map((item, index) => (
                <div key={item._id || index}>
                  <p>
                    {item.product?.name || `Product ID: ${item.product || 'missing'}`} - {item.quantity ?? 0} × €{Number(item.price ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyOrders;