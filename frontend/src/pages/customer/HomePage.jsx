// pages/customer/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

function MenuItemCard({ item, onAdd }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8d5c0', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,80,26,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ height: '160px', background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(135deg, #f5e6d0, #e8d5c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {!item.image && <span style={{ fontSize: '40px' }}>🍽️</span>}
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: item.isVeg ? '#16a34a' : '#dc2626', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
          {item.isVeg ? '🌿 VEG' : '🥩 NON-VEG'}
        </div>
        {!item.isAvailable && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Unavailable</span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a0f05', margin: 0, flex: 1 }}>{item.name}</h3>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#c8501a', marginLeft: '8px' }}>₹{item.price}</span>
        </div>
        {item.description && <p style={{ fontSize: '12px', color: '#7c5c3e', marginBottom: '10px', lineHeight: '1.4' }}>{item.description}</p>}
        {item.avgRating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: '12px', color: '#7c5c3e' }}>{item.avgRating} ({item.reviewCount})</span>
          </div>
        )}
        <button onClick={() => onAdd(item)} disabled={!item.isAvailable} style={{
          width: '100%', padding: '8px', background: item.isAvailable ? '#c8501a' : '#d4c4b0',
          color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          cursor: item.isAvailable ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
        }}>
          {item.isAvailable ? '+ Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [popular, setPopular] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all([api.get('/menu/popular'), api.get('/settings')]).then(([menuRes, settingsRes]) => {
      setPopular(menuRes.data);
      setSettings(settingsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAdd = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a0f05 0%, #3d2a15 60%, #6b3d1e 100%)', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,80,26,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(200,80,26,0.1) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          {settings && !settings.isOpen && (
            <div style={{ background: '#dc2626', color: '#fff', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600, display: 'inline-block' }}>
              🔴 Restaurant is currently CLOSED
            </div>
          )}
          <div style={{ display: 'inline-block', background: 'rgba(200,80,26,0.2)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '20px', padding: '6px 16px', marginBottom: '16px' }}>
            <span style={{ color: '#f5a623', fontSize: '13px', fontWeight: 600 }}>🍛 Authentic South Indian Flavours</span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700, lineHeight: '1.2', marginBottom: '16px' }}>
            Welcome to<br /><span style={{ color: '#c8501a' }}>RS MANI Café</span>
          </h1>
          <p style={{ color: '#b8997a', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
            Crispy dosas, fluffy idlis, and piping hot filter coffee.<br />Order online, track in real-time.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" style={{ background: '#c8501a', color: '#fff', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} /> Order Now
            </Link>
            <Link to="/menu" style={{ background: 'transparent', color: '#fdf6ec', border: '1px solid rgba(253,246,236,0.4)', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '16px', fontWeight: 500 }}>
              View Full Menu
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '32px' }}>
            {[['⚡', 'Fast Delivery'], ['🌿', '100% Fresh'], ['💳', 'Easy Payment']].map(([icon, text]) => (
              <div key={text} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
                <div style={{ color: '#b8997a', fontSize: '12px' }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info bar */}
      {settings && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e8d5c0', padding: '12px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7c5c3e' }}>
              <Clock size={14} color="#c8501a" />
              <span>Est. delivery: <strong>{settings.estimatedDeliveryTime} min</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7c5c3e' }}>
              <ShoppingBag size={14} color="#c8501a" />
              <span>Free delivery above <strong>₹{settings.freeDeliveryAbove}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: settings.isOpen ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: settings.isOpen ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
              {settings.isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>
        </div>
      )}

      {/* Popular Items */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#1a0f05', marginBottom: '4px' }}>Popular Items</h2>
            <p style={{ color: '#7c5c3e', fontSize: '14px' }}>Most loved by our customers</p>
          </div>
          <Link to="/menu" style={{ color: '#c8501a', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            See All <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '280px', background: '#e8d5c0', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {popular.map(item => <MenuItemCard key={item._id} item={item} onAdd={handleAdd} />)}
          </div>
        )}
      </section>

      {/* Categories */}
      <section style={{ background: '#1a0f05', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#fdf6ec', marginBottom: '24px', textAlign: 'center' }}>Browse by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {[['🥞', 'Dosas'], ['🍚', 'Idli'], ['☕', 'Beverages'], ['🍱', 'Combos'], ['🥨', 'Snacks'], ['🍛', 'Rice']].map(([icon, cat]) => (
              <Link key={cat} to={`/menu?category=${cat}`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,80,26,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,80,26,0.2)'; e.currentTarget.style.borderColor = '#c8501a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(200,80,26,0.3)'; }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ color: '#f5e6d0', fontSize: '13px', fontWeight: 600 }}>{cat}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0d0802', color: '#b8997a', padding: '32px 24px', textAlign: 'center', fontSize: '13px' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '18px', marginBottom: '8px' }}>RS MANI Café</p>
        <p>Authentic South Indian Restaurant</p>
        {settings?.whatsappNumber && (
          <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
            💬 WhatsApp: {settings.whatsappNumber}
          </a>
        )}
        <p style={{ marginTop: '16px', color: '#5c4030' }}>© {new Date().getFullYear()} RS MANI Café. All rights reserved.</p>
      </footer>
    </div>
  );
}
