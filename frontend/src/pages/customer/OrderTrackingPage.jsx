// pages/customer/OrderTrackingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, Package, Truck, Home, XCircle, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { io } from 'socket.io-client';

const STATUSES = ['Pending', 'Accepted', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered'];

const STATUS_META = {
  Pending:          { icon: Clock,       color: '#f59e0b', label: 'Order Placed',     desc: 'Waiting for restaurant to accept' },
  Accepted:         { icon: CheckCircle, color: '#3b82f6', label: 'Accepted',         desc: 'Restaurant accepted your order' },
  Preparing:        { icon: Package,     color: '#8b5cf6', label: 'Preparing',         desc: 'Chef is preparing your food' },
  Packed:           { icon: Package,     color: '#06b6d4', label: 'Packed',            desc: 'Your order is packed and ready' },
  'Out for Delivery':{ icon: Truck,      color: '#c8501a', label: 'Out for Delivery', desc: 'On the way to you!' },
  Delivered:        { icon: Home,        color: '#16a34a', label: 'Delivered',         desc: 'Enjoy your meal! 🎉' },
  Cancelled:        { icon: XCircle,     color: '#dc2626', label: 'Cancelled',         desc: 'Order was cancelled' },
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = () => {
    api.get(`/orders/${id}`)
      .then(r => { setOrder(r.data); setError(''); })
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const socket = io(import.meta.env.VITE_API_URL || '', { transports: ['websocket'] });
    socket.on('order_status_update', (data) => {
      if (data.orderId === id || data.orderId?.toString() === id) {
        setOrder(prev => prev ? { ...prev, status: data.status, deliveryStatus: data.deliveryStatus } : prev);
      }
    });
    return () => socket.disconnect();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ textAlign: 'center', color: '#7c5c3e' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading order...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <XCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: '#1a0f05', marginBottom: '8px' }}>Order not found</h2>
        <Link to="/" style={{ color: '#c8501a', textDecoration: 'none' }}>Go Home</Link>
      </div>
    </div>
  );

  const isCancelled = order.status === 'Cancelled';
  const currentIdx = isCancelled ? -1 : STATUSES.indexOf(order.status);
  const meta = STATUS_META[order.status] || STATUS_META['Pending'];
  const Icon = meta.icon;

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon size={28} color={meta.color} />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: '#1a0f05', marginBottom: '4px' }}>{meta.label}</h1>
          <p style={{ color: '#7c5c3e', fontSize: '14px', marginBottom: '12px' }}>{meta.desc}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#fdf0e8', color: '#c8501a', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>#{order.invoiceNumber}</span>
            {order.estimatedTime && !isCancelled && order.status !== 'Delivered' && (
              <span style={{ background: '#f0f9ff', color: '#0ea5e9', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                ~{order.estimatedTime} min
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!isCancelled && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {STATUSES.map((s, idx) => {
                  const done = idx <= currentIdx;
                  const active = idx === currentIdx;
                  const SMeta = STATUS_META[s];
                  const SIcon = SMeta.icon;
                  return (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? SMeta.color : '#e8d5c0',
                        boxShadow: active ? `0 0 0 4px ${SMeta.color}30` : 'none',
                        transition: 'all 0.4s', flexShrink: 0,
                      }}>
                        <SIcon size={16} color={done ? '#fff' : '#b8997a'} />
                      </div>
                      <span style={{ fontSize: '10px', color: done ? '#1a0f05' : '#b8997a', fontWeight: done ? 600 : 400, marginTop: '6px', textAlign: 'center', lineHeight: '1.2' }}>
                        {s === 'Out for Delivery' ? 'Out' : s}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* connector lines */}
              <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', height: '2px', background: '#e8d5c0', zIndex: 0 }}>
                <div style={{ height: '100%', background: '#c8501a', width: `${(currentIdx / (STATUSES.length - 1)) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: 700, color: '#1a0f05', marginBottom: '12px' }}>Order Details</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4a3728', marginBottom: '6px' }}>
              <span>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f0e4d4', marginTop: '10px', paddingTop: '10px' }}>
            {order.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', marginBottom: '4px' }}><span>Discount</span><span>-₹{order.discountAmount}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7c5c3e', marginBottom: '4px' }}><span>GST</span><span>₹{order.gstAmount}</span></div>
            {order.deliveryCharge > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7c5c3e', marginBottom: '4px' }}><span>Delivery</span><span>₹{order.deliveryCharge}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: '#1a0f05', marginTop: '6px' }}>
              <span>Total</span><span style={{ color: '#c8501a' }}>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Delivery OTP — shown only for delivery orders that are not yet delivered */}
        {order.deliveryOTP && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '2px dashed #c8501a', padding: '16px 20px', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#7c5c3e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Your Delivery OTP</p>
            <div style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '12px', color: '#c8501a' }}>{order.deliveryOTP}</div>
            <p style={{ fontSize: '12px', color: '#b8997a', marginTop: '6px' }}>Share this with your delivery partner when they arrive</p>
          </div>
        )}

        {/* Delivery boy */}
        {order.deliveryBoy && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8d5c0', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#c8501a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px' }}>
              {order.deliveryBoy.name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a0f05' }}>{order.deliveryBoy.name}</div>
              <div style={{ fontSize: '12px', color: '#7c5c3e' }}>Your delivery partner</div>
            </div>
            {order.deliveryBoy.phone && (
              <a href={`tel:${order.deliveryBoy.phone}`} style={{ marginLeft: 'auto', background: '#c8501a', color: '#fff', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Call</a>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchOrder} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #c8501a', color: '#c8501a', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to={`/invoice/${id}`} style={{ flex: 1, padding: '12px', background: '#c8501a', color: '#fff', borderRadius: '10px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
            View Invoice
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
