// pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = form;
      await api.post('/users/register', registerData);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade-up">
        <div className="auth-brand">
          <div className="auth-brand-row"><div className="auth-logo">RS</div><div className="auth-title">Join RS MANI</div></div>
          <div className="auth-subtitle">Create your account and track every order easily</div>
        </div>
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field"><label>Full Name</label><input className="auth-input" type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>
            <div className="auth-field"><label>Email Address</label><input className="auth-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
            <div className="auth-field"><label>Phone Number</label><input className="auth-input" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input auth-input-peek" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
                <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input auth-input-peek"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={e =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter your password"
                />
                <button
                  className="auth-eye"
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>
          <p className="auth-link-row">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
