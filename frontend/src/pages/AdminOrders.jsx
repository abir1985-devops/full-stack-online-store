import { useEffect, useState } from 'react';
import API from '../api';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await API.get('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data?.data?.orders || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    return transitions[currentStatus] || [];
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!newStatus) return;

    const token = localStorage.getItem('token');
    setUpdatingId(orderId);

    try {
      const res = await API.patch(
        `/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = res.data?.data?.order;

      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) return <p className="page-message">Loading orders...</p>;
  if (error) return <p className="page-message error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-list-header">
          <div>
            <h1>Admin Orders</h1>
            <p className="admin-subtitle">
              Review customer orders and update their status.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty-card">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-admin-grid">
            {orders.map((order) => {
              const nextStatuses = getNextStatuses(order.status);

              return (
                <div className="order-admin-card" key={order._id}>
                  <div className="order-admin-top">
                    <div>
                      <p className="order-admin-id">
                        Order ID: {order._id}
                      </p>
                      <h3>{order.user?.name || 'Unknown user'}</h3>
                      <p className="order-admin-email">
                        {order.user?.email || 'No email'}
                      </p>
                    </div>

                    <span className={`order-status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-admin-info">
                    <p>
                      <strong>Total:</strong> €{Number(order.totalAmount ?? 0).toFixed(2)}
                    </p>
                    <p>
                      <strong>Payment:</strong> {order.paymentMethod || 'N/A'}
                    </p>
                    <p>
                      <strong>Payment Status:</strong> {order.paymentStatus || 'N/A'}
                    </p>
                  </div>

                  <div className="order-admin-section">
                    <h4>Shipping Address</h4>
                    <p>{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.email}</p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                    </p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>

                  <div className="order-admin-section">
                    <h4>Items</h4>

                    <div className="admin-order-items">
                      {(order.items || []).map((item, index) => {
                        const imageUrl =
                          item.image && item.image.trim() !== ''
                            ? item.image.startsWith('http')
                              ? item.image
                              : `http://localhost:3000${item.image}`
                            : null;

                        return (
                          <div className="admin-order-item" key={item._id || index}>
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt={item.name || 'Product'}
                                className="admin-order-item-image"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}

                            <div>
                              <p className="admin-order-item-name">
                                {item.name || item.product?.name || 'Product'}
                              </p>
                              <p>Qty: {item.quantity}</p>
                              <p>€{Number(item.price ?? 0).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="order-admin-section">
                    <h4>Update Status</h4>

                    {nextStatuses.length === 0 ? (
                      <p className="status-note">
                        No further status changes available.
                      </p>
                    ) : (
                      <div className="order-status-actions">
                        {nextStatuses.map((status) => (
                          <button
                            key={status}
                            className="primary-btn small-btn"
                            onClick={() => handleStatusChange(order._id, status)}
                            disabled={updatingId === order._id}
                          >
                            {updatingId === order._id ? 'Updating...' : `Mark as ${status}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders