// components/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Tag, Truck, Settings, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { path: '/admin/delivery-boys', icon: Truck, label: 'Delivery Boys' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children, title }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      [0, 0.18, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = 880;

        gain.gain.setValueAtTime(0.4, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + offset + 0.15
        );

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.15);
      });
    } catch (_) {}
  };  

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || '', {
      transports: ['websocket'],
    });

    socket.emit('join_admin');

    socket.on('new_order', (data) => {
      playAlertSound();

      toast.success(
        `🔔 New order from ${data.customerName} — ₹${data.total}`,
        { duration: 6000 }
      );
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-shell">
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div>
            <div className="admin-brand-title">RS MANI</div>
            <div className="admin-brand-sub">Admin Control</div>
          </div>
          <button className="admin-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X size={20} /></button>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)} className={`admin-nav-link ${active ? 'active' : ''}`}>
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="admin-logout">
          <LogOut size={17} /> Logout
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={21} /></button>
            <div>
              <h1 className="admin-title">{title}</h1>
              <p style={{ margin: '2px 0 0', color: 'var(--cafe-muted)', fontSize: 13, fontWeight: 700 }}>Manage cafe operations smoothly</p>
            </div>
          </div>
          <Link to="/" className="admin-view-site"><ExternalLink size={15} /> View Site</Link>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
