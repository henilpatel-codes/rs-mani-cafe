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
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade-up">
        <div className="auth-brand"><div style={{ fontSize: 44 }}>🔑</div><div className="auth-title">Forgot Password?</div><div className="auth-subtitle">Enter your email to receive a reset link</div></div>
        <div className="auth-card">
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 46, marginBottom: 14 }}>✅</div>
              <p style={{ color: '#f8dfc3', lineHeight: 1.6 }}>Reset link sent to <strong>{email}</strong>. Check your inbox.</p>
              <p className="auth-link-row"><Link to="/login">← Back to Login</Link></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field"><label>Email Address</label><input className="auth-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
              <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
              <p className="auth-link-row"><Link className="auth-secondary-link" to="/login">← Back to Login</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
