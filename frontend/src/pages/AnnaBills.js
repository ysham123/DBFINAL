import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billAPI } from '../services/api';
import { Eye, Edit } from 'lucide-react';

function AnnaBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [revisedAmount, setRevisedAmount] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billAPI.getAllBills();
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevise = (bill) => {
    setSelectedBill(bill);
    setRevisedAmount(bill.amount);
    setRevisionNote('');
    setShowModal(true);
  };

  const submitRevision = async () => {
    try {
      await billAPI.reviseBill(selectedBill.bill_id, {
        revised_amount: revisedAmount,
        revision_note: revisionNote
      });
      setMessage('Bill revised successfully!');
      setShowModal(false);
      fetchBills();
    } catch (error) {
      setMessage('Failed to revise bill');
    }
  };

  if (loading) {
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="container">
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Bills</h2>

        {bills.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            No bills yet
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Order ID</th>
                <th>Client</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Days Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.bill_id}>
                  <td>#{bill.bill_id}</td>
                  <td>#{bill.order_id}</td>
                  <td>
                    {bill.first_name} {bill.last_name}<br />
                    <small style={{ color: '#64748b' }}>{bill.email}</small>
                  </td>
                  <td>{bill.service_address}</td>
                  <td>${bill.amount}</td>
                  <td>
                    <span className={`badge badge-${bill.bill_status}`}>
                      {bill.bill_status}
                    </span>
                  </td>
                  <td>
                    {bill.days_since_generated > 7 && bill.bill_status !== 'paid' ? (
                      <span style={{ color: '#ef4444', fontWeight: '600' }}>
                        {bill.days_since_generated} days
                      </span>
                    ) : (
                      `${bill.days_since_generated} days`
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/bill/${bill.bill_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <Eye size={14} />
                      </Link>
                      {bill.bill_status === 'disputed' && (
                        <button
                          onClick={() => handleRevise(bill)}
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <Edit size={14} /> Revise
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
            <h2>Revise Bill</h2>
            <p><strong>Bill ID:</strong> #{selectedBill.bill_id}</p>
            <p><strong>Client:</strong> {selectedBill.first_name} {selectedBill.last_name}</p>
            <p><strong>Current Amount:</strong> ${selectedBill.amount}</p>
            {selectedBill.dispute_note && (
              <p><strong>Dispute Reason:</strong> {selectedBill.dispute_note}</p>
            )}
            
            <div className="form-group">
              <label>Revised Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                value={revisedAmount}
                onChange={(e) => setRevisedAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Revision Note *</label>
              <textarea
                rows="3"
                required
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Explain the revision (e.g., discount applied, error correction)"
              />
            </div>

            <div className="modal-actions">
              <button onClick={submitRevision} className="btn btn-primary">
                Submit Revision
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

export default AnnaBills;
