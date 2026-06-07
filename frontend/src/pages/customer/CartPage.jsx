// pages/customer/CartPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', gap: '16px', textAlign: 'center', padding: '24px' }}>
          <ShoppingBag size={64} color="#d4c4b0" />
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#1a0f05' }}>Your cart is empty</h2>
          <p style={{ color: '#7c5c3e', fontSize: '15px' }}>Add some delicious items from our menu!</p>
          <Link to="/menu" style={{ background: '#c8501a', color: '#fff', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#1a0f05' }}>Your Cart</h1>
          <button onClick={clearCart} style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Clear All</button>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', overflow: 'hidden', marginBottom: '20px' }}>
          {items.map((item, idx) => (
            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: idx < items.length - 1 ? '1px solid #f0e4d4' : 'none' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(135deg, #f5e6d0, #e8d5c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {!item.image && <span style={{ fontSize: '22px' }}>🍽️</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#1a0f05', marginBottom: '2px' }}>{item.name}</div>
                <div style={{ fontSize: '14px', color: '#c8501a', fontWeight: 600 }}>₹{item.price} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: '#fdf6ec', borderRadius: '8px', border: '1px solid #e8d5c0' }}>
                <button onClick={() => updateQty(item._id, item.quantity - 1)} style={{ width: '34px', height: '34px', background: 'none', border: 'none', fontSize: '18px', color: '#c8501a', cursor: 'pointer', fontWeight: 700 }}>−</button>
                <span style={{ width: '28px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)} style={{ width: '34px', height: '34px', background: 'none', border: 'none', fontSize: '18px', color: '#c8501a', cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>
              <div style={{ minWidth: '64px', textAlign: 'right', fontWeight: 700, fontSize: '15px', color: '#1a0f05' }}>₹{item.price * item.quantity}</div>
              <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#7c5c3e' }}>
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span style={{ fontWeight: 600, color: '#1a0f05' }}>₹{subtotal}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#b8997a', marginBottom: '12px' }}>GST, delivery charges & discounts calculated at checkout</div>
          <div style={{ borderTop: '1px solid #f0e4d4', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#1a0f05' }}>
            <span>Estimated Total</span>
            <span style={{ color: '#c8501a' }}>₹{subtotal}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/menu" style={{ flex: 1, padding: '13px', background: '#fff', border: '1px solid #c8501a', color: '#c8501a', borderRadius: '10px', textDecoration: 'none', textAlign: 'center', fontWeight: 600, fontSize: '15px' }}>
            ← Continue Shopping
          </Link>
          <button onClick={() => navigate('/checkout')} style={{ flex: 1, padding: '13px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
