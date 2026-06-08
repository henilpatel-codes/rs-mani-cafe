// pages/customer/PaymentFailedPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle, RotateCcw, Wallet } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  return (
    <div className="app-page">
      <Navbar />
      <div className="rs-container page-pad" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 72px)' }}>
        <div className="rs-card success-card animate-fade-up" style={{ borderColor: '#fecaca' }}>
          <div className="danger-icon"><XCircle size={44} /></div>
          <span className="rs-eyebrow" style={{ color: 'var(--cafe-red)', background: '#fff1f1', borderColor: '#fecaca' }}>Payment failed</span>
          <h1 className="rs-section-title" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginTop: 14 }}>Couldn&apos;t Complete Payment</h1>
          <p className="rs-section-subtitle">Something went wrong with your payment. Your cart items are still saved, so you can try again or choose COD.</p>
          <div style={{ display: 'grid', gap: 11, marginTop: 24 }}>
            <button onClick={() => navigate('/checkout')} className="rs-btn rs-btn-primary"><RotateCcw size={17} /> Try Again</button>
            <Link to="/checkout" className="rs-btn rs-btn-outline"><Wallet size={17} /> Pay with Cash / COD</Link>
            <Link to="/menu" className="rs-btn rs-btn-outline">Back to Menu</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
