import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

function BillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [disputeNote, setDisputeNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    try {
      const response = await billAPI.getBill(id);
      setBill(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      await billAPI.payBill(id);
      setMessage('Bill paid successfully!');
      fetchBill();
    } catch (error) {
      setMessage('Failed to pay bill');
    }
  };

  const handleDispute = async () => {
    if (!disputeNote.trim()) {
      setMessage('Please enter a dispute note');
      return;
    }
    try {
      await billAPI.disputeBill(id, { dispute_note: disputeNote });
      setMessage('Bill disputed successfully');
      fetchBill();
      setDisputeNote('');
    } catch (error) {
      setMessage('Failed to dispute bill');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!bill) {
    return <div className="container"><div className="card">Bill not found</div></div>;
  }

  const canPay = bill.bill_status !== 'paid';
  const canDispute = bill.bill_status === 'pending' || bill.bill_status === 'revised';

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back
      </button>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h2>Bill #{bill.bill_id}</h2>
        <span className={`badge badge-${bill.bill_status}`}>{bill.bill_status}</span>

        <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
          <h3>Bill Details</h3>
          <div><strong>Amount:</strong> <span style={{ fontSize: '24px', color: '#667eea' }}>${bill.amount}</span></div>
          <div><strong>Order ID:</strong> #{bill.order_id}</div>
          <div><strong>Service Address:</strong> {bill.service_address}</div>
          <div><strong>Cleaning Type:</strong> {bill.cleaning_type}</div>
          <div><strong>Bill Created:</strong> {new Date(bill.created_at).toLocaleString()}</div>
          {bill.payment_datetime && (
            <div><strong>Paid At:</strong> {new Date(bill.payment_datetime).toLocaleString()}</div>
          )}
          {bill.dispute_note && (
            <div><strong>Dispute Note:</strong> {bill.dispute_note}</div>
          )}
        </div>

        {canPay && (
          <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
            <h3>Payment Actions</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handlePay} className="btn btn-success">
                Pay Bill
              </button>
              {canDispute && (
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Enter dispute reason"
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    style={{ width: '100%', marginBottom: '8px' }}
                  />
                  <button onClick={handleDispute} className="btn btn-danger">
                    Dispute Bill
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {bill.revisions && bill.revisions.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3>Revision History</h3>
            {bill.revisions.map((revision, index) => (
              <div key={revision.revision_id} style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                <div><strong>Revision #{index + 1}</strong></div>
                <div><strong>Amount:</strong> ${revision.revised_amount}</div>
                <div><strong>By:</strong> {revision.revised_by}</div>
                <div><strong>Note:</strong> {revision.revision_note || 'None'}</div>
                <div><strong>Date:</strong> {new Date(revision.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BillDetails;
