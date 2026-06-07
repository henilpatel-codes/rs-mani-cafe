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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post('/users/resend-otp', { email });
      toast.success('New OTP sent!');
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f05 0%, #3d2a15 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📧</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '28px', fontWeight: 700 }}>Verify Email</h1>
          <p style={{ color: '#b8997a', fontSize: '14px', marginTop: '8px' }}>Enter the 6-digit OTP sent to<br /><strong style={{ color: '#f5e6d0' }}>{email}</strong></p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,80,26,0.3)', borderRadius: '16px', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
              {otp.map((digit, idx) => (
                <input key={idx} ref={el => inputs.current[idx] = el} type="text" maxLength={1} value={digit}
                  onChange={e => handleChange(e.target.value, idx)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  style={{
                    width: '46px', height: '52px', textAlign: 'center', fontSize: '22px', fontWeight: 700,
                    background: 'rgba(255,255,255,0.1)', border: digit ? '2px solid #c8501a' : '1px solid rgba(200,80,26,0.4)',
                    borderRadius: '8px', color: '#fdf6ec', outline: 'none',
                  }}
                />
              ))}
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: '#c8501a', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {countdown > 0 ? (
              <p style={{ color: '#b8997a', fontSize: '14px' }}>Resend OTP in {countdown}s</p>
            ) : (
              <button onClick={handleResend} disabled={resendLoading} style={{ background: 'none', border: 'none', color: '#c8501a', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
