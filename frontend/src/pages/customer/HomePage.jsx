// pages/customer/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bike,
  ChevronRight,
  Clock,
  Coffee,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

const CATEGORIES = [
  ['🥞', 'Dosas', 'Crispy & golden'],
  ['🍚', 'Idli', 'Soft & steamed'],
  ['☕', 'Beverages', 'Fresh sips'],
  ['🍱', 'Combos', 'Value meals'],
  ['🥨', 'Snacks', 'Quick bites'],
  ['🍛', 'Rice', 'Comfort bowls'],
];

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function PopularItemCard({ item, onAdd }) {
  const isVeg = item.isVeg !== false;

  return (
    <article className="menu-card">
      <div className="menu-card-media">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" />
        ) : (
          <div className="menu-card-placeholder">🍽️</div>
        )}
        <span className={`rs-badge ${isVeg ? 'rs-badge-veg' : 'rs-badge-nonveg'} menu-card-badge`}>
          {isVeg ? '● VEG' : '● NON-VEG'}
        </span>
        {!item.isAvailable && <div className="menu-card-overlay">UNAVAILABLE</div>}
      </div>

      <div className="menu-card-body">
        <div className="menu-card-top">
          <h3>{item.name}</h3>
          <span className="menu-price">₹{item.price}</span>
        </div>
        {item.description && <p className="menu-desc">{item.description}</p>}
        {Number(item.avgRating) > 0 && (
          <div className="menu-rating">
            <Star size={14} fill="#f5a623" color="#f5a623" />
            <span>{item.avgRating} {item.reviewCount ? `(${item.reviewCount})` : ''}</span>
          </div>
        )}
        <button type="button" className="menu-add" onClick={() => onAdd(item)} disabled={!item.isAvailable}>
          <ShoppingBag size={17} /> {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [popular, setPopular] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let mounted = true;

    Promise.all([api.get('/menu/popular'), api.get('/settings')])
      .then(([menuRes, settingsRes]) => {
        if (!mounted) return;
        setPopular(normalizeList(menuRes.data).slice(0, 4));
        setSettings(settingsRes.data?.data || settingsRes.data || null);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setPopular([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const handleAdd = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  const isOpen = settings?.isOpen !== false;

  return (
    <div className="rs-page">
      <Navbar />

      <section className="home-hero">
        <div className="hero-wrap">
          <div className="hero-copy">
            {!isOpen && (
              <div className="rs-eyebrow" style={{ background: 'rgba(220,38,38,0.16)', color: '#ffb4b4', borderColor: 'rgba(255,180,180,0.22)' }}>
                Restaurant is currently closed
              </div>
            )}
            {isOpen && (
              <div className="rs-eyebrow">
                <Sparkles size={16} /> Fresh South Indian food, made daily
              </div>
            )}

            <h1 className="hero-title">
              Real café taste,<br />delivered <span>hot.</span>
            </h1>
            <p className="hero-desc">
              Crispy dosas, fluffy idlis, comforting combos and fresh filter coffee from RS MANI Café. Order online, pay with COD or Razorpay, and track every order smoothly.
            </p>

            <div className="hero-actions">
              <Link to="/menu" className="rs-btn rs-btn-primary">
                <ShoppingBag size={19} /> Order Now
              </Link>
              <Link to="/menu" className="rs-btn rs-btn-secondary">
                View Full Menu <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hero-stats" aria-label="Cafe highlights">
              <div className="hero-stat">
                <strong>Fresh</strong>
                <span>Prepared after order</span>
              </div>
              <div className="hero-stat">
                <strong>Fast</strong>
                <span>{settings?.estimatedDeliveryTime || 30} min delivery</span>
              </div>
              <div className="hero-stat">
                <strong>Secure</strong>
                <span>COD & Razorpay</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card-main">
              <div className="hero-food-image">
                <span className="hero-food-emoji">🥞</span>
              </div>
              <div className="hero-card-body">
                <h3>Signature Masala Dosa</h3>
                <p>Golden dosa with homely chutney and hot sambhar.</p>
                <div className="hero-price-row">
                  <span className="hero-price">₹99</span>
                  <span className="rs-badge rs-badge-veg">● VEG</span>
                </div>
              </div>
            </div>
            <div className="hero-mini-card rs-glass">
              <strong><Coffee size={17} /> Filter Coffee</strong>
              <span>Freshly brewed café classic</span>
            </div>
            <div className="hero-rating-card rs-glass">
              <strong><Star size={16} fill="#f5a623" color="#f5a623" /> 4.8 Rating</strong>
              <span>Loved by regular customers</span>
            </div>
          </div>
        </div>
      </section>

      <div className="status-strip">
        <div className="status-strip-inner">
          <div className="status-pill">
            <Clock size={16} color="#c8501a" />
            <span>Est. delivery: <strong>{settings?.estimatedDeliveryTime || 30} min</strong></span>
          </div>
          <div className="status-pill">
            <Bike size={16} color="#c8501a" />
            <span>Free delivery above <strong>₹{settings?.freeDeliveryAbove || 299}</strong></span>
          </div>
          <div className={`status-pill ${isOpen ? 'status-open' : 'status-closed'}`}>
            <span className="status-dot" />
            <span>{isOpen ? 'Open Now' : 'Closed Now'}</span>
          </div>
          <div className="status-pill">
            <Wallet size={16} color="#c8501a" />
            <span>COD + Online Payment</span>
          </div>
        </div>
      </div>

      <section className="rs-section">
        <div className="rs-container">
          <div className="popular-header">
            <div>
              <span className="rs-eyebrow"><Heart size={15} /> Customer favourites</span>
              <h2 className="rs-section-title" style={{ marginTop: 12 }}>Popular Items</h2>
              <p className="rs-section-subtitle">Top picks that customers order again and again.</p>
            </div>
            <Link to="/menu" className="rs-btn rs-btn-outline">
              See All <ChevronRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="food-grid">
              {[1, 2, 3, 4].map((i) => <div key={i} className="rs-skeleton" style={{ height: 360, borderRadius: 24 }} />)}
            </div>
          ) : popular.length > 0 ? (
            <div className="food-grid">
              {popular.map((item) => <PopularItemCard key={item._id || item.name} item={item} onAdd={handleAdd} />)}
            </div>
          ) : (
            <div className="rs-empty">
              <div className="rs-empty-icon"><ShoppingBag size={34} /></div>
              <h3>No popular items yet</h3>
              <p>Browse the full menu and add your favourite dishes.</p>
              <Link to="/menu" className="rs-btn rs-btn-primary">Explore Menu</Link>
            </div>
          )}
        </div>
      </section>

      <section className="category-section" style={{ background: 'linear-gradient(135deg, #160b03, #2a1206)', padding: '58px 0' }}>
        <div className="rs-container">
          <div style={{ textAlign: 'center' }}>
            <span className="rs-eyebrow" style={{ color: '#ffd28a', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' }}>
              <ShieldCheck size={15} /> Quick category browsing
            </span>
            <h2 className="rs-section-title" style={{ color: '#fff8ef', marginTop: 12 }}>Browse by Category</h2>
            <p className="rs-section-subtitle" style={{ color: '#c9aa8b' }}>Find your favourite meal faster.</p>
          </div>

          <div className="category-grid">
            {CATEGORIES.map(([icon, cat, desc]) => (
              <Link key={cat} to={`/menu?category=${cat}`} className="category-card">
                <span className="category-icon">{icon}</span>
                <span>
                  <span className="category-name">{cat}</span>
                  <small style={{ display: 'block', marginTop: 5, color: '#c9aa8b', fontWeight: 700 }}>{desc}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="rs-footer">
        <div className="rs-container">
          <div className="rs-footer-brand">RS MANI Café</div>
          <p>Authentic South Indian Restaurant • Fresh food • Fast service</p>
          {settings?.whatsappNumber && (
            <p style={{ marginTop: 10 }}>
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer">
                WhatsApp: {settings.whatsappNumber}
              </a>
            </p>
          )}
          <p style={{ marginTop: 18, color: '#6f5440' }}>© {new Date().getFullYear()} RS MANI Café. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
