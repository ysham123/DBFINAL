import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, FileText, Package, DollarSign, LayoutDashboard } from 'lucide-react';

function Navbar() {
  const { user, logout, isAnna } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <h1>🏠 Anna's Cleaning Services</h1>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isAnna ? (
          <>
            <Link to="/anna/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/anna/requests" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={18} /> Requests
            </Link>
            <Link to="/anna/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={18} /> Orders
            </Link>
            <Link to="/anna/bills" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={18} /> Bills
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Home size={18} /> Home
            </Link>
            <Link to="/my-requests" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={18} /> My Requests
            </Link>
            <Link to="/my-orders" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={18} /> My Orders
            </Link>
            <Link to="/my-bills" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={18} /> My Bills
            </Link>
          </>
        )}
        <span style={{ color: '#64748b', marginLeft: '10px' }}>
          {user?.first_name} {user?.last_name}
        </span>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>
    </div>
  );
}

export default Navbar;
