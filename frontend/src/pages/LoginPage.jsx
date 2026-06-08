// pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function AuthBrand({ subtitle }) {
  return (
    <div className="auth-brand">
      <div className="auth-brand-row"><div className="auth-logo">RS</div><div className="auth-title">MANI Café</div></div>
      <div className="auth-subtitle">{subtitle}</div>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/users/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'delivery') navigate('/delivery/dashboard');
      else navigate(from);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.requiresOTP) {
        navigate('/verify-otp', { state: { email: form.email } });
        return;
      }
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade-up">
        <AuthBrand subtitle="Sign in to order your South Indian favourites" />
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email Address</label>
              <input className="auth-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input auth-input-peek" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />
                <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: -6 }}><Link to="/forgot-password" className="auth-link">Forgot password?</Link></div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="auth-link-row">Don&apos;t have an account? <Link to="/register">Sign up</Link></p>
          <p className="auth-link-row" style={{ marginTop: 10 }}><Link className="auth-secondary-link" to="/delivery/login">Delivery partner? Login here →</Link></p>
        </div>
      </div>
    </div>
  );
}
