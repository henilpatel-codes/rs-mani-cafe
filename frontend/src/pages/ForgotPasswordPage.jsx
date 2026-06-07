// pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f05 0%, #3d2a15 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔑</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '28px', fontWeight: 700 }}>Forgot Password?</h1>
          <p style={{ color: '#b8997a', fontSize: '14px', marginTop: '8px' }}>Enter your email to receive a reset link</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,80,26,0.3)', borderRadius: '16px', padding: '32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ color: '#f5e6d0', fontSize: '15px', marginBottom: '20px' }}>Reset link sent to <strong>{email}</strong>. Check your inbox!</p>
              <Link to="/login" style={{ color: '#c8501a', textDecoration: 'none', fontWeight: 600 }}>← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
              />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '16px' }}>
                <Link to="/login" style={{ color: '#b8997a', fontSize: '14px', textDecoration: 'none' }}>← Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
