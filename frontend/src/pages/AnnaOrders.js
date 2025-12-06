import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, billAPI } from '../services/api';
import { Eye, DollarSign } from 'lucide-react';

function AnnaOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billAmount, setBillAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      setMessage(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      setMessage('Failed to update status');
    }
  };

  const handleGenerateBill = (order) => {
    setSelectedOrder(order);
    setBillAmount(order.final_price);
    setShowModal(true);
  };

  const submitBill = async () => {
    try {
      await billAPI.create({
        order_id: selectedOrder.order_id,
        amount: billAmount
      });
      setMessage('Bill generated successfully!');
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      setMessage('Failed to generate bill');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container">
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Orders</h2>

        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            No orders yet
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Address</th>
                <th>Type</th>
                <th>Price</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Bill</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>
                    {order.first_name} {order.last_name}<br />
                    <small style={{ color: '#64748b' }}>{order.email}</small>
                  </td>
                  <td>{order.service_address}</td>
                  <td>{order.cleaning_type}</td>
                  <td>${order.final_price}</td>
                  <td>{new Date(order.scheduled_datetime).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={order.completion_status}
                      onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {order.has_bill > 0 ? (
                      <span className="badge badge-completed">Generated</span>
                    ) : (
                      <span className="badge badge-pending">Not Generated</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/order/${order.order_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <Eye size={14} />
                      </Link>
                      {order.completion_status === 'completed' && order.has_bill === 0 && (
                        <button
                          onClick={() => handleGenerateBill(order)}
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <DollarSign size={14} /> Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Generate Bill</h2>
            <p><strong>Order ID:</strong> #{selectedOrder.order_id}</p>
            <p><strong>Client:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
            <p><strong>Address:</strong> {selectedOrder.service_address}</p>
            
            <div className="form-group">
              <label>Bill Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button onClick={submitBill} className="btn btn-primary">
                Generate Bill
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnaOrders;
