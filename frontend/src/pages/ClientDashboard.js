import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI, orderAPI, billAPI } from '../services/api';
import { Plus, FileText, Package, DollarSign, TrendingUp } from 'lucide-react';

function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    requests: 0,
    orders: 0,
    pendingBills: 0,
    completedOrders: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, ordersRes, billsRes] = await Promise.all([
        requestAPI.getMyRequests(),
        orderAPI.getMyOrders(),
        billAPI.getMyBills()
      ]);

      setStats({
        requests: requestsRes.data.length,
        orders: ordersRes.data.length,
        pendingBills: billsRes.data.filter(b => b.bill_status !== 'paid').length,
        completedOrders: ordersRes.data.filter(o => o.completion_status === 'completed').length
      });

      setRecentRequests(requestsRes.data.slice(0, 5));
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        Welcome back, {user?.first_name}! 👋
      </h1>

      {/* Stats Grid */}
      <div className="grid">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <div className="value">{stats.requests}</div>
          <Link to="/my-requests" style={{ color: '#667eea', fontSize: '14px' }}>View all →</Link>
        </div>
        
        <div className="stat-card">
          <h3>Active Orders</h3>
          <div className="value">{stats.orders}</div>
          <Link to="/my-orders" style={{ color: '#667eea', fontSize: '14px' }}>View all →</Link>
        </div>
        
        <div className="stat-card">
          <h3>Pending Bills</h3>
          <div className="value">{stats.pendingBills}</div>
          <Link to="/my-bills" style={{ color: '#667eea', fontSize: '14px' }}>View all →</Link>
        </div>
        
        <div className="stat-card">
          <h3>Completed Orders</h3>
          <div className="value">{stats.completedOrders}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/new-request" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> New Service Request
          </Link>
          <Link to="/my-requests" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} /> My Requests
          </Link>
          <Link to="/my-orders" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} /> My Orders
          </Link>
          <Link to="/my-bills" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} /> My Bills
          </Link>
        </div>
      </div>

      {/* Recent Requests */}
      {recentRequests.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Recent Requests</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Service Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(request => (
                <tr key={request.request_id}>
                  <td>#{request.request_id}</td>
                  <td>{request.service_address}</td>
                  <td>{request.cleaning_type}</td>
                  <td>{request.num_rooms}</td>
                  <td>
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/my-requests" style={{ color: '#667eea', fontWeight: '600', marginTop: '16px', display: 'inline-block' }}>
            View all requests →
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Recent Orders</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Address</th>
                <th>Price</th>
                <th>Scheduled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{order.service_address}</td>
                  <td>${order.final_price}</td>
                  <td>{new Date(order.scheduled_datetime).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${order.completion_status}`}>{order.completion_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/my-orders" style={{ color: '#667eea', fontWeight: '600', marginTop: '16px', display: 'inline-block' }}>
            View all orders →
          </Link>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;
