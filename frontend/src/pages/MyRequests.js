import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { Eye } from 'lucide-react';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestAPI.getMyRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>My Service Requests</h2>
          <Link to="/new-request" className="btn btn-primary">
            + New Request
          </Link>
        </div>

        {requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            No service requests yet. Create your first request!
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.request_id}>
                  <td>#{request.request_id}</td>
                  <td>{request.service_address}</td>
                  <td>{request.cleaning_type}</td>
                  <td>{request.num_rooms}</td>
                  <td>${request.proposed_budget}</td>
                  <td>
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/request/${request.request_id}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
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

export default MyRequests;
