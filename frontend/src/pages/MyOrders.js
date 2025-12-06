import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { Eye } from 'lucide-react';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>My Orders</h2>

        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            No orders yet. Accept a quote to create an order!
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Price</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{order.service_address}</td>
                  <td>{order.cleaning_type}</td>
                  <td>{order.num_rooms}</td>
                  <td>${order.final_price}</td>
                  <td>{new Date(order.scheduled_datetime).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${order.completion_status}`}>
                      {order.completion_status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/order/${order.order_id}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                      <Eye size={16} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
