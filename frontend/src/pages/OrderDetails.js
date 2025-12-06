import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!order) {
    return <div className="container"><div className="card">Order not found</div></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card">
        <h2>Order #{order.order_id}</h2>
        <span className={`badge badge-${order.completion_status}`}>{order.completion_status}</span>

        <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
          <h3>Service Details</h3>
          <div><strong>Service Address:</strong> {order.service_address}</div>
          <div><strong>Cleaning Type:</strong> {order.cleaning_type}</div>
          <div><strong>Number of Rooms:</strong> {order.num_rooms}</div>
          <div><strong>Special Notes:</strong> {order.special_notes || 'None'}</div>
          
          <h3 style={{ marginTop: '16px' }}>Pricing & Schedule</h3>
          <div><strong>Final Price:</strong> ${order.final_price}</div>
          <div><strong>Scheduled Date/Time:</strong> {new Date(order.scheduled_datetime).toLocaleString()}</div>
          {order.completed_at && (
            <div><strong>Completed At:</strong> {new Date(order.completed_at).toLocaleString()}</div>
          )}
          
          <h3 style={{ marginTop: '16px' }}>Order Information</h3>
          <div><strong>Order Created:</strong> {new Date(order.created_at).toLocaleString()}</div>
          <div><strong>Quote ID:</strong> #{order.quote_id}</div>
          <div><strong>Request ID:</strong> #{order.request_id}</div>
        </div>

        {order.photos && order.photos.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Photos</h3>
            <div className="photo-grid">
              {order.photos.map(photo => (
                <img
                  key={photo.photo_id}
                  src={`http://localhost:5000${photo.photo_url}`}
                  alt="Service location"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
