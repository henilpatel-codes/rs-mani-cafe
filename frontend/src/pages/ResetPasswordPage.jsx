// pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post(`/users/reset-password/${token}`, { password: form.password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f05 0%, #3d2a15 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔒</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '28px', fontWeight: 700 }}>Reset Password</h1>
          <p style={{ color: '#b8997a', fontSize: '14px', marginTop: '8px' }}>Enter your new password below</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,80,26,0.3)', borderRadius: '16px', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>New Password</label>
              <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" style={{ ...inputStyle, paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '40px', background: 'none', border: 'none', color: '#b8997a', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Confirm Password</label>
              <input type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat new password" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ color: '#b8997a', fontSize: '14px', textDecoration: 'none' }}>← Back to Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
