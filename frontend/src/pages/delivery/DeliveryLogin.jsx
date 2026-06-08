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
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade-up">
        <div className="auth-brand">
          <div style={{ width: 68, height: 68, borderRadius: 25, background: 'rgba(200,80,26,0.18)', display: 'grid', placeItems: 'center', marginBottom: 12 }}><Truck size={32} color="#ffb783" /></div>
          <div className="auth-title">Delivery Partner</div>
          <div className="auth-subtitle">RS MANI Café — sign in to manage assigned deliveries</div>
        </div>
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field"><label>Email Address</label><input className="auth-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input auth-input-peek" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />
                <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="auth-link-row"><Link className="auth-secondary-link" to="/login">← Customer / Admin login</Link></p>
        </div>
      </div>
    </div>
  );
}
