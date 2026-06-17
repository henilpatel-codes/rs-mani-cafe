// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Clock, IndianRupee, Package, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Generate a short beep using Web Audio API — no external file needed
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18, 0.36].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.15);
    });
  } catch (_) { /* AudioContext unavailable — silent fail */ }
}

const STATUS_COLOR = {
  Pending: '#f59e0b', Accepted: '#3b82f6', Preparing: '#8b5cf6',
  Packed: '#06b6d4', 'Out for Delivery': '#c8501a', Delivered: '#16a34a', Cancelled: '#dc2626',
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#7c5c3e', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#1a0f05', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', color: '#b8997a', marginTop: '4px' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [exportDate, setExportDate] = useState(new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const fetchData = () => {
    Promise.all([api.get('/orders/stats'), api.get('/settings')])
      .then(([s, set]) => { setStats(s.data); setSettings(set.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('rsmani_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/orders/export/csv?date=${exportDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${exportDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported orders for ${exportDate}`);
    } catch {
      toast.error('Export failed');
    } finally { setExporting(false); }
  };

  const toggleOpen = async () => {
    try {
      const { data } = await api.put('/settings', { isOpen: !settings.isOpen });
      setSettings(data);
      toast.success(`Restaurant is now ${data.isOpen ? 'OPEN' : 'CLOSED'}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#7c5c3e' }}>Loading stats...</div>
      ) : (
        <>
          {/* Restaurant status toggle */}
          {settings && (
            <div style={{ background: '#fff', borderRadius: '14px', border: `2px solid ${settings.isOpen ? '#16a34a' : '#dc2626'}`, padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: settings.isOpen ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a0f05' }}>Restaurant is currently <span style={{ color: settings.isOpen ? '#16a34a' : '#dc2626' }}>{settings.isOpen ? 'OPEN' : 'CLOSED'}</span></span>
              </div>
              <button onClick={toggleOpen} style={{ padding: '8px 20px', background: settings.isOpen ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                {settings.isOpen ? 'Close Restaurant' : 'Open Restaurant'}
              </button>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders || 0} color="#c8501a" />
            <StatCard icon={Package} label="Today's Orders" value={stats?.todayOrders || 0} color="#8b5cf6" sub={`₹${stats?.todayRevenue || 0} today`} />
            <StatCard icon={Clock} label="Pending" value={stats?.pendingOrders || 0} color="#f59e0b" sub="Needs attention" />
            <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="#16a34a" />
          </div>

          {/* CSV Export */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Download size={18} color="#c8501a" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a0f05', flex: '1 1 auto' }}>Export Daily Sales</span>
            <input type="date" value={exportDate} onChange={e => setExportDate(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
            <button onClick={handleExportCSV} disabled={exporting}
              style={{ padding: '8px 18px', background: exporting ? '#8a3d15' : '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: exporting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>
              {exporting ? 'Exporting…' : 'Download CSV'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(340px, 100%)', gap: '20px' }}>
            {/* Recent Orders */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0e4d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: 700, color: '#1a0f05' }}>Recent Orders</h3>
                <Link to="/admin/orders" style={{ fontSize: '13px', color: '#c8501a', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#fdf6ec' }}>
                    {['Invoice', 'Customer', 'Total', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#b8997a', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(stats?.recentOrders || []).map(order => (
                      <tr key={order._id} style={{ borderTop: '1px solid #f0e4d4' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#c8501a' }}>#{order.invoiceNumber}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1a0f05' }}>{order.customerName}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1a0f05' }}>₹{order.total}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status], padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{order.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Link to="/admin/orders" style={{ fontSize: '12px', color: '#c8501a', textDecoration: 'none' }}>Manage</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status breakdown */}
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', padding: '16px 20px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: 700, color: '#1a0f05', marginBottom: '12px' }}>Orders by Status</h3>
                {(stats?.statusCounts || []).map(({ _id, count }) => (
                  <div key={_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#4a3728' }}>{_id}</span>
                    <span style={{ background: `${STATUS_COLOR[_id]}15`, color: STATUS_COLOR[_id], padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{count}</span>
                  </div>
                ))}
              </div>

              {/* Popular items */}
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', padding: '16px 20px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: 700, color: '#1a0f05', marginBottom: '12px' }}>Popular Items</h3>
                {(stats?.popularItems || []).map((item, i) => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#4a3728' }}><span style={{ color: '#c8501a', fontWeight: 700 }}>#{i + 1}</span> {item.name}</span>
                    <span style={{ fontSize: '12px', color: '#b8997a' }}>{item.totalOrdered} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '20px' }}>
            {[
              ['/admin/orders', '📦', 'Manage Orders'],
              ['/admin/menu', '🍽️', 'Edit Menu'],
              ['/admin/coupons', '🏷️', 'Coupons'],
              ['/admin/delivery-boys', '🛵', 'Delivery Boys'],
              ['/admin/settings', '⚙️', 'Settings'],
            ].map(([to, icon, label]) => (
              <Link key={to} to={to} style={{ background: '#fff', border: '1px solid #e8d5c0', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c8501a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e8d5c0'}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a3728' }}>{label}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
