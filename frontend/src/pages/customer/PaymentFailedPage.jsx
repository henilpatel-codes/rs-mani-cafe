// pages/customer/PaymentFailedPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #fecaca', padding: '48px 36px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <XCircle size={40} color="#dc2626" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: '#1a0f05', marginBottom: '8px' }}>Payment Failed</h1>
          <p style={{ color: '#7c5c3e', fontSize: '15px', marginBottom: '28px' }}>
            Something went wrong with your payment. Your cart items are still saved.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => navigate('/checkout')} style={{ padding: '12px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
              Try Again
            </button>
            <Link to="/checkout" style={{ padding: '12px', background: '#fff', border: '1px solid #e8d5c0', color: '#4a3728', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              Pay with Cash (COD)
            </Link>
            <Link to="/menu" style={{ padding: '12px', color: '#c8501a', textDecoration: 'none', fontSize: '14px' }}>
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
