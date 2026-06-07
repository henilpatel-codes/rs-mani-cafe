// pages/delivery/DeliveryLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function DeliveryLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/delivery/login', form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/delivery/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f05 0%, #3d2a15 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(200,80,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Truck size={28} color="#c8501a" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '26px', fontWeight: 700 }}>Delivery Partner</h1>
          <p style={{ color: '#b8997a', fontSize: '14px', marginTop: '6px' }}>RS MANI Café — Sign in to your account</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(200,80,26,0.3)', borderRadius: '16px', padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '13px', fontWeight: 600, marginBottom: '7px' }}>Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com"
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '22px', position: 'relative' }}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '13px', fontWeight: 600, marginBottom: '7px' }}>Password</label>
              <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password"
                style={{ width: '100%', padding: '11px 40px 11px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', color: '#b8997a', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#8a3d15' : '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '18px' }}>
            <Link to="/login" style={{ color: '#b8997a', fontSize: '13px', textDecoration: 'none' }}>← Customer / Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
