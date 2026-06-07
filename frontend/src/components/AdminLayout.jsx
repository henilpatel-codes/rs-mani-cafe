// components/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Tag, Truck, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
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

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div style={{
      width: '240px', background: '#1a0f05', height: '100vh',
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 40,
      transition: 'transform 0.3s ease',
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #3d2a15', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '18px', fontWeight: 700 }}>RS MANI</div>
          <div style={{ color: '#c8501a', fontSize: '12px', fontWeight: 500 }}>Admin Panel</div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ background: 'none', border: 'none', color: '#fdf6ec', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '8px', marginBottom: '4px', textDecoration: 'none',
              background: active ? '#c8501a' : 'transparent',
              color: active ? '#fff' : '#b8997a',
              fontSize: '14px', fontWeight: active ? 600 : 400,
              transition: 'all 0.2s',
            }}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid #3d2a15' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
          background: 'none', border: 'none', color: '#b8997a', fontSize: '14px', cursor: 'pointer', padding: '8px 12px'
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)}>
          <div onClick={e => e.stopPropagation()}><Sidebar /></div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column' }} className="lg:ml-60">
        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #e8d5c0', padding: '0 24px',
          height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a0f05' }}><Menu size={22} /></button>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1a0f05', fontFamily: 'Playfair Display, serif' }}>{title}</h1>
          </div>
          <Link to="/" style={{ fontSize: '13px', color: '#c8501a', textDecoration: 'none' }}>← View Site</Link>
        </div>
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
