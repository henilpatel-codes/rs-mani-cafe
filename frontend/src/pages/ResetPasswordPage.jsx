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
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade-up">
        <div className="auth-brand"><div style={{ fontSize: 46 }}>🔒</div><div className="auth-title">Reset Password</div><div className="auth-subtitle">Enter your new secure password below</div></div>
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>New Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input auth-input-peek" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
                <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div className="auth-field"><label>Confirm Password</label><input className="auth-input" type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat new password" /></div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            <p className="auth-link-row"><Link className="auth-secondary-link" to="/login">← Back to Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
