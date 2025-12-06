import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billAPI } from '../services/api';
import { Eye } from 'lucide-react';

function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billAPI.getMyBills();
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>My Bills</h2>

        {bills.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            No bills yet.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Order ID</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.bill_id}>
                  <td>#{bill.bill_id}</td>
                  <td>#{bill.order_id}</td>
                  <td>{bill.service_address}</td>
                  <td>${bill.amount}</td>
                  <td>
                    <span className={`badge badge-${bill.bill_status}`}>
                      {bill.bill_status}
                    </span>
                  </td>
                  <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/bill/${bill.bill_id}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
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

export default MyBills;
