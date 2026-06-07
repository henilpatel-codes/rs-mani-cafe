// components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChefHat, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin, isDelivery } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav style={{ background: '#1a0f05', fontFamily: 'DM Sans, sans-serif' }} className="sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#c8501a', borderRadius: '8px', padding: '6px 10px' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '16px', fontWeight: 700 }}>RS</span>
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '18px', fontWeight: 600 }}>MANI Café</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/menu" style={{ color: '#f5e6d0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Menu</Link>
          {isAdmin && <Link to="/admin" style={{ color: '#f5a623', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Admin Panel</Link>}
          {isDelivery && <Link to="/delivery/dashboard" style={{ color: '#f5a623', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Delivery</Link>}
          {user && !isAdmin && !isDelivery && <Link to="/orders" style={{ color: '#f5e6d0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>My Orders</Link>}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isAdmin && !isDelivery && (
            <Link to="/cart" style={{ position: 'relative', color: '#fdf6ec', textDecoration: 'none' }}>
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#c8501a', color: '#fff', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '11px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>{totalItems}</span>
              )}
            </Link>
          )}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <span style={{ color: '#f5e6d0', fontSize: '13px' }}>Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} style={{
                background: 'transparent', border: '1px solid #c8501a', color: '#c8501a',
                borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link to="/login" style={{
                background: 'transparent', border: '1px solid #c8501a', color: '#c8501a',
                borderRadius: '6px', padding: '6px 14px', fontSize: '13px', textDecoration: 'none', fontWeight: 500
              }}>Login</Link>
              <Link to="/register" style={{
                background: '#c8501a', color: '#fff',
                borderRadius: '6px', padding: '6px 14px', fontSize: '13px', textDecoration: 'none', fontWeight: 500
              }}>Sign Up</Link>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ background: 'none', border: 'none', color: '#fdf6ec', cursor: 'pointer' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#2d1a0a', borderTop: '1px solid #3d2a15' }} className="md:hidden">
          <div className="flex flex-col px-4 py-3 gap-3">
            <Link to="/menu" onClick={() => setOpen(false)} style={{ color: '#f5e6d0', textDecoration: 'none', fontSize: '15px', padding: '8px 0' }}>Menu</Link>
            {!isAdmin && !isDelivery && <Link to="/cart" onClick={() => setOpen(false)} style={{ color: '#f5e6d0', textDecoration: 'none', fontSize: '15px', padding: '8px 0' }}>Cart ({totalItems})</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} style={{ color: '#f5a623', textDecoration: 'none', fontSize: '15px', padding: '8px 0' }}>Admin Panel</Link>}
            {isDelivery && <Link to="/delivery/dashboard" onClick={() => setOpen(false)} style={{ color: '#f5a623', textDecoration: 'none', fontSize: '15px', padding: '8px 0' }}>Delivery Dashboard</Link>}
            {user && !isAdmin && !isDelivery && <Link to="/orders" onClick={() => setOpen(false)} style={{ color: '#f5e6d0', textDecoration: 'none', fontSize: '15px', padding: '8px 0' }}>My Orders</Link>}
            {user ? (
              <button onClick={handleLogout} style={{ color: '#c8501a', background: 'none', border: 'none', fontSize: '15px', textAlign: 'left', padding: '8px 0', cursor: 'pointer' }}>Logout</button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} style={{ color: '#c8501a', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} style={{ color: '#c8501a', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
