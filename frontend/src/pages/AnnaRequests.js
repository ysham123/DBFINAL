import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI, quoteAPI } from '../services/api';
import { Eye, Check, X } from 'lucide-react';

function AnnaRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteData, setQuoteData] = useState({
    quoted_price: '',
    scheduled_datetime: '',
    anna_notes: ''
  });
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestAPI.getAllRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = (request) => {
    setSelectedRequest(request);
    setQuoteData({
      quoted_price: request.proposed_budget,
      scheduled_datetime: request.preferred_datetime.slice(0, 16),
      anna_notes: ''
    });
    setShowModal(true);
  };

  const submitQuote = async () => {
    try {
      await quoteAPI.create({
        request_id: selectedRequest.request_id,
        ...quoteData
      });
      setMessage('Quote sent successfully!');
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      setMessage('Failed to send quote');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      setMessage('Please enter a rejection reason');
      return;
    }
    try {
      await quoteAPI.create({
        request_id: requestId,
        action: 'reject',
        anna_notes: rejectReason
      });
      setMessage('Request rejected');
      fetchRequests();
      setRejectReason('');
    } catch (error) {
      setMessage('Failed to reject request');
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="container">
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Service Requests</h2>

        {requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            No service requests
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Photos</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.request_id}>
                  <td>#{request.request_id}</td>
                  <td>
                    {request.first_name} {request.last_name}<br />
                    <small style={{ color: '#64748b' }}>{request.email}</small>
                  </td>
                  <td>{request.service_address}</td>
                  <td>{request.cleaning_type}</td>
                  <td>{request.num_rooms}</td>
                  <td>${request.proposed_budget}</td>
                  <td>
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                  </td>
                  <td>{request.photo_count}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/request/${request.request_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <Eye size={14} />
                      </Link>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleQuote(request)}
                            className="btn btn-success"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <Check size={14} /> Quote
                          </button>
                        </>
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
            <h2>Create Quote</h2>
            <p><strong>Client:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>
            <p><strong>Address:</strong> {selectedRequest.service_address}</p>
            
            <div className="form-group">
              <label>Quoted Price *</label>
              <input
                type="number"
                step="0.01"
                required
                value={quoteData.quoted_price}
                onChange={(e) => setQuoteData({ ...quoteData, quoted_price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Scheduled Date/Time *</label>
              <input
                type="datetime-local"
                required
                value={quoteData.scheduled_datetime}
                onChange={(e) => setQuoteData({ ...quoteData, scheduled_datetime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={quoteData.anna_notes}
                onChange={(e) => setQuoteData({ ...quoteData, anna_notes: e.target.value })}
                placeholder="Additional notes for the client"
              />
            </div>

            <div className="modal-actions">
              <button onClick={submitQuote} className="btn btn-primary">
                Send Quote
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

export default AnnaRequests;
