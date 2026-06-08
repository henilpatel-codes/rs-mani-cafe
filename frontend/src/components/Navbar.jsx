// components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  ChefHat,
  Package,
  Home,
  ClipboardList,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin, isDelivery } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const firstName = user?.name?.split(' ')?.[0] || 'User';

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const closeMenu = () => setOpen(false);

  const navLinkClass = ({ isActive }) => `rs-nav-link ${isActive ? 'active' : ''}`;
  const mobileLinkClass = ({ isActive }) => `rs-mobile-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="rs-navbar">
      <div className="rs-nav-inner">
        <Link to="/" className="rs-brand" onClick={closeMenu} aria-label="RS MANI Café home">
          <span className="rs-brand-mark">RS</span>
          <span className="rs-brand-text">
            <span className="rs-brand-title">MANI Café</span>
            <span className="rs-brand-subtitle">Fresh • Fast • South Indian</span>
          </span>
        </Link>

        <div className="rs-nav-links" aria-label="Main navigation">
          <NavLink to="/" className={navLinkClass}>
            <Home size={17} /> Home
          </NavLink>
          <NavLink to="/menu" className={navLinkClass}>
            <ChefHat size={17} /> Menu
          </NavLink>
          {user && !isAdmin && !isDelivery && (
            <NavLink to="/orders" className={navLinkClass}>
              <ClipboardList size={17} /> My Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `rs-nav-link rs-nav-link-highlight ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={17} /> Admin Panel
            </NavLink>
          )}
          {isDelivery && (
            <NavLink to="/delivery/dashboard" className={({ isActive }) => `rs-nav-link rs-nav-link-highlight ${isActive ? 'active' : ''}`}>
              <Truck size={17} /> Delivery
            </NavLink>
          )}
        </div>

        <div className="rs-nav-actions">
          {!isAdmin && !isDelivery && (
            <Link to="/cart" className="rs-cart-link" onClick={closeMenu} aria-label="Open cart">
              <ShoppingCart size={21} />
              {totalItems > 0 && <span className="rs-cart-count">{totalItems > 99 ? '99+' : totalItems}</span>}
            </Link>
          )}

          {user ? (
            <>
              <div className="rs-user-pill" title={user.name || 'User'}>
                <User size={16} />
                <span>Hi, {firstName}</span>
              </div>
              <button type="button" onClick={handleLogout} className="rs-nav-btn rs-nav-auth" aria-label="Logout">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="rs-nav-auth">
              <Link to="/login" className="rs-nav-btn">Login</Link>
              <Link to="/register" className="rs-nav-btn rs-nav-btn-filled">
                <Sparkles size={15} /> Sign Up
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rs-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="rs-mobile-panel">
          <div className="rs-mobile-content">
            <NavLink to="/" className={mobileLinkClass} onClick={closeMenu}>
              <Home size={18} /> Home
            </NavLink>
            <NavLink to="/menu" className={mobileLinkClass} onClick={closeMenu}>
              <ChefHat size={18} /> Menu
            </NavLink>
            {!isAdmin && !isDelivery && (
              <NavLink to="/cart" className={mobileLinkClass} onClick={closeMenu}>
                <ShoppingCart size={18} /> Cart ({totalItems})
              </NavLink>
            )}
            {user && !isAdmin && !isDelivery && (
              <NavLink to="/orders" className={mobileLinkClass} onClick={closeMenu}>
                <Package size={18} /> My Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={closeMenu}>
                <ShieldCheck size={18} /> Admin Panel
              </NavLink>
            )}
            {isDelivery && (
              <NavLink to="/delivery/dashboard" className={mobileLinkClass} onClick={closeMenu}>
                <Truck size={18} /> Delivery Dashboard
              </NavLink>
            )}

            {user ? (
              <button type="button" className="rs-mobile-logout" onClick={handleLogout}>
                <LogOut size={18} /> Logout from {firstName}
              </button>
            ) : (
              <div className="rs-mobile-auth">
                <Link to="/login" onClick={closeMenu} className="rs-btn rs-btn-outline">Login</Link>
                <Link to="/register" onClick={closeMenu} className="rs-btn rs-btn-primary">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
