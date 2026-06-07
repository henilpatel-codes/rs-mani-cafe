// pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f05 0%, #3d2a15 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ background: '#c8501a', borderRadius: '10px', padding: '8px 12px' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '20px', fontWeight: 700 }}>RS</span>
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '24px', fontWeight: 700 }}>MANI Café</span>
          </div>
          <p style={{ color: '#b8997a', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(200,80,26,0.3)', borderRadius: '16px', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <label style={{ display: 'block', color: '#f5e6d0', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Password</label>
              <input
                type={showPass ? 'text' : 'password'} required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                style={{ width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '40px', background: 'none', border: 'none', color: '#b8997a', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '-16px', marginBottom: '20px' }}>
              <Link to="/forgot-password" style={{ color: '#c8501a', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: loading ? '#8a3d15' : '#c8501a',
              color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#b8997a', fontSize: '14px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#c8501a', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link to="/delivery/login" style={{ color: '#b8997a', fontSize: '13px', textDecoration: 'none' }}>Delivery partner? Login here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
