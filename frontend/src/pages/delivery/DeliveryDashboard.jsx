// pages/delivery/DeliveryDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, MapPin, Phone, RefreshCw, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NEXT_STATUS = {
  Pending: 'Accepted',
  Accepted: 'Preparing',
  Preparing: 'Packed',
  Packed: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
};

const STATUS_COLOR = {
  Pending: '#f59e0b', Accepted: '#3b82f6', Preparing: '#8b5cf6',
  Packed: '#06b6d4', 'Out for Delivery': '#c8501a', Delivered: '#16a34a', Cancelled: '#dc2626',
};

function OTPModal({ onConfirm, onClose }) {
  const [otp, setOtp] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Delivery OTP</h3>
        <p style={{ color: '#7c5c3e', fontSize: '13px', marginBottom: '18px' }}>Ask the customer for their 4-digit OTP to confirm delivery.</p>
        <input type="number" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 4-digit OTP" maxLength={4}
          style={{ width: '100%', padding: '12px', textAlign: 'center', fontSize: '24px', fontWeight: 700, border: '2px solid #c8501a', borderRadius: '10px', outline: 'none', letterSpacing: '8px', boxSizing: 'border-box', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={() => onConfirm(otp)} disabled={otp.length < 4}
            style={{ flex: 2, padding: '10px', background: otp.length < 4 ? '#d4c4b0' : '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: otp.length < 4 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px' }}>
            Confirm Delivery
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const next = NEXT_STATUS[order.status];

  const handleAdvance = async (otpValue) => {
    if (!next) return;
    setLoading(true);
    try {
      await api.put(`/delivery/orders/${order._id}/status`, {
        status: next,
        ...(next === 'Delivered' && otpValue ? { deliveryOTP: otpValue } : {}),
      });
      toast.success(`Status updated to "${next}"`);
      setShowOTP(false);
      onUpdate();
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
      if (err.response?.data?.requiresOTP) setShowOTP(true);
    } finally { setLoading(false); }
  };

  const handleButtonClick = () => {
    if (!next) return;
    // If next status is Delivered and order has deliveryOTP, show OTP modal
    if (next === 'Delivered' && order.deliveryOTP) {
      setShowOTP(true);
    } else {
      handleAdvance();
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', overflow: 'hidden', marginBottom: '16px' }}>
      {showOTP && <OTPModal onConfirm={(otp) => handleAdvance(otp)} onClose={() => setShowOTP(false)} />}
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0e4d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#c8501a' }}>#{order.invoiceNumber}</div>
          <div style={{ fontSize: '12px', color: '#b8997a' }}>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <span style={{ background: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status], padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
          {order.status}
        </span>
      </div>

      {/* Customer info */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0e4d4' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a0f05', marginBottom: '6px' }}>{order.customerName}</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a href={`tel:${order.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#c8501a', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            <Phone size={13} /> {order.phone}
          </a>
          {order.deliveryAddress?.street ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4a3728', fontSize: '13px' }}>
              <MapPin size={13} color="#c8501a" />
              {order.deliveryAddress.street}{order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}
              {order.deliveryAddress.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
            </span>
          ) : (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude) ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4a3728', fontSize: '13px', fontWeight: 600 }}>
              <MapPin size={13} color="#c8501a" />
              Shared Live Location
            </span>
          ) : null}
        </div>
        {order.deliveryAddress?.landmark && (
          <div style={{ fontSize: '12px', color: '#7c5c3e', marginTop: '4px' }}>📍 Near: {order.deliveryAddress.landmark}</div>
        )}
        {order.deliveryAddress?.latitude && order.deliveryAddress?.longitude && (
          <div style={{ marginTop: '8px' }}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fdf0e8',
                color: '#c8501a',
                border: '1px solid #c8501a',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              🧭 Open Live Location (Google Maps)
            </a>
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #f0e4d4', background: '#fdf6ec' }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a3728', marginBottom: '3px' }}>
            <span>{item.name} × {item.quantity}</span>
            <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #e8d5c0', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
          <span>Total</span>
          <span style={{ color: '#c8501a' }}>₹{order.total}</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: order.paymentMethod === 'cod' ? '#f59e0b' : '#16a34a', fontWeight: 600 }}>
          {order.paymentMethod === 'cod' ? '💵 Collect ₹' + order.total + ' (COD)' : '✓ Already Paid Online'}
        </div>
      </div>

      {/* Action */}
      <div style={{ padding: '14px 18px' }}>
        {next ? (
          <button onClick={handleButtonClick} disabled={loading} style={{ width: '100%', padding: '11px', background: loading ? '#8a3d15' : '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px' }}>
            {loading ? 'Updating...' : next === 'Delivered' && order.deliveryOTP ? `🔐 Mark as "${next}" (OTP)` : `Mark as "${next}"`}
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700, fontSize: '14px', padding: '8px' }}>✓ Order Delivered!</div>
        )}
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/delivery/orders'),
      api.get('/delivery/orders/history'),
    ]).then(([active, hist]) => {
      setActiveOrders(active.data);
      setHistory(hist.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogout = () => { logout(); navigate('/delivery/login'); };

  const todayDelivered = history.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && o.status === 'Delivered';
  }).length;

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a0f05', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '18px', fontWeight: 700 }}>RS MANI Café</div>
          <div style={{ color: '#b8997a', fontSize: '12px' }}>Hi, {user?.name} 👋</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={fetchOrders} style={{ background: 'none', border: 'none', color: '#b8997a', cursor: 'pointer', padding: '6px' }}>
            <RefreshCw size={18} />
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(200,80,26,0.2)', border: '1px solid rgba(200,80,26,0.4)', color: '#c8501a', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            ['Active', activeOrders.length, '#c8501a'],
            ["Today's", todayDelivered, '#16a34a'],
            ['Total', history.length + activeOrders.length, '#3b82f6'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8d5c0', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: '12px', color: '#7c5c3e', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#fff', borderRadius: '10px', border: '1px solid #e8d5c0', padding: '4px', marginBottom: '20px' }}>
          {[['active', `Active (${activeOrders.length})`], ['history', 'History']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', background: tab === key ? '#c8501a' : 'transparent', color: tab === key ? '#fff' : '#7c5c3e', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7c5c3e' }}>Loading orders...</div>
        ) : tab === 'active' ? (
          activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#7c5c3e' }}>
              <Package size={40} color="#d4c4b0" style={{ marginBottom: '12px' }} />
              <p>No active orders assigned to you.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Pull down to refresh.</p>
            </div>
          ) : (
            activeOrders.map(order => <OrderCard key={order._id} order={order} onUpdate={fetchOrders} />)
          )
        ) : (
          history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#7c5c3e' }}>No delivery history yet.</div>
          ) : (
            history.map(order => (
              <div key={order._id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8d5c0', padding: '14px 18px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#c8501a' }}>#{order.invoiceNumber}</div>
                  <div style={{ fontSize: '13px', color: '#1a0f05', marginTop: '2px' }}>{order.customerName}</div>
                  <div style={{ fontSize: '12px', color: '#b8997a' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#1a0f05' }}>₹{order.total}</div>
                  <span style={{ background: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status], padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{order.status}</span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
