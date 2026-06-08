// pages/VerifyOTPPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTPPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter the full 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/users/verify-otp', { email, otp: code });
      login(data.user, data.token);
      toast.success(data.message);
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post('/users/resend-otp', { email });
      toast.success('New OTP sent!');
      setCountdown(60);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to resend'); }
    finally { setResendLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade-up">
        <div className="auth-brand">
          <div style={{ fontSize: 46 }}>📧</div>
          <div className="auth-title">Verify Email</div>
          <div className="auth-subtitle">Enter the 6-digit OTP sent to<br /><strong style={{ color: '#fff1de' }}>{email}</strong></div>
        </div>
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            <div className="otp-grid">
              {otp.map((digit, idx) => (
                <input key={idx} ref={el => inputs.current[idx] = el} className={`otp-input ${digit ? 'filled' : ''}`} type="text" maxLength={1} value={digit} onChange={e => handleChange(e.target.value, idx)} onKeyDown={e => handleKeyDown(e, idx)} />
              ))}
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
          <div className="auth-link-row">
            {countdown > 0 ? <span>Resend OTP in {countdown}s</span> : <button onClick={handleResend} disabled={resendLoading} className="auth-link" style={{ background: 'none', border: 0, cursor: 'pointer' }}>{resendLoading ? 'Sending...' : 'Resend OTP'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
