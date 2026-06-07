// pages/customer/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Star, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

const CATEGORIES = ['All', 'Dosas', 'Idli', 'Beverages', 'Combos', 'Snacks', 'Rice', 'Breads', 'Sweets'];

function ItemCard({ item, onAdd, qty, onInc, onDec }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8d5c0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '150px', background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(135deg, #f5e6d0, #e8d5c0)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!item.image && <span style={{ fontSize: '36px' }}>🍽️</span>}
        <span style={{ position: 'absolute', top: '8px', left: '8px', background: item.isVeg ? '#16a34a' : '#dc2626', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', fontWeight: 700 }}>
          {item.isVeg ? '● VEG' : '● NON-VEG'}
        </span>
        {!item.isAvailable && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>UNAVAILABLE</span>
          </div>
        )}
      </div>
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a0f05', margin: 0, flex: 1, lineHeight: '1.3' }}>{item.name}</h3>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#c8501a', marginLeft: '6px', whiteSpace: 'nowrap' }}>₹{item.price}</span>
        </div>
        {item.description && <p style={{ fontSize: '11px', color: '#7c5c3e', margin: '0 0 6px', lineHeight: '1.4', flex: 1 }}>{item.description}</p>}
        {item.avgRating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '8px' }}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: '11px', color: '#7c5c3e' }}>{item.avgRating} ({item.reviewCount})</span>
          </div>
        )}
        <div style={{ marginTop: 'auto' }}>
          {qty > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fdf6ec', borderRadius: '8px', border: '1px solid #c8501a', overflow: 'hidden' }}>
              <button onClick={onDec} style={{ padding: '7px 14px', background: 'none', border: 'none', color: '#c8501a', fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>−</button>
              <span style={{ fontWeight: 700, color: '#1a0f05', fontSize: '14px' }}>{qty}</span>
              <button onClick={onInc} style={{ padding: '7px 14px', background: 'none', border: 'none', color: '#c8501a', fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} disabled={!item.isAvailable} style={{
              width: '100%', padding: '8px', background: item.isAvailable ? '#c8501a' : '#d4c4b0',
              color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              cursor: item.isAvailable ? 'pointer' : 'not-allowed',
            }}>
              {item.isAvailable ? '+ Add' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const { addItem, updateQty, items: cartItems } = useCart();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api.get('/menu').then(r => setItems(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getQty = (id) => cartItems.find(i => i._id === id)?.quantity || 0;

  const handleAdd = (item) => {
    addItem(item);
    toast.success(`${item.name} added!`, { duration: 1500 });
  };

  const handleInc = (item) => {
    const q = getQty(item._id);
    updateQty(item._id, q + 1);
  };

  const handleDec = (item) => {
    const q = getQty(item._id);
    updateQty(item._id, q - 1);
  };

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'All' || i.category === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.filter(c => c !== 'All').reduce((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      {/* Header */}
      <div style={{ background: '#1a0f05', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fdf6ec', fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>Our Menu</h1>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b8997a' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..."
              style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,80,26,0.4)', borderRadius: '8px', color: '#fdf6ec', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
              background: activeCategory === cat ? '#c8501a' : '#fff',
              color: activeCategory === cat ? '#fff' : '#7c5c3e',
              boxShadow: activeCategory === cat ? '0 2px 8px rgba(200,80,26,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '260px', background: '#e8d5c0', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7c5c3e' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No items found</p>
          </div>
        ) : activeCategory !== 'All' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {filtered.map(item => (
              <ItemCard key={item._id} item={item} onAdd={handleAdd} qty={getQty(item._id)} onInc={() => handleInc(item)} onDec={() => handleDec(item)} />
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} style={{ marginBottom: '36px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 700, color: '#1a0f05', marginBottom: '14px', paddingBottom: '8px', borderBottom: '2px solid #e8d5c0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {cat} <span style={{ fontSize: '14px', color: '#b8997a', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>({catItems.length} items)</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {catItems.map(item => (
                  <ItemCard key={item._id} item={item} onAdd={handleAdd} qty={getQty(item._id)} onInc={() => handleInc(item)} onDec={() => handleDec(item)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
