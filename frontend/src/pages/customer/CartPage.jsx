// pages/customer/CartPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, CreditCard, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="rs-container cart-empty-wrap">
          <div className="rs-card cart-empty-card">
            <div className="rs-empty-icon" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <ShoppingBag size={36} />
            </div>
            <h1>Your cart is empty</h1>
            <p>Add crispy dosas, soft idlis, beverages or combos from the menu and come back here to checkout.</p>
            <Link to="/menu" className="rs-btn rs-btn-primary">
              Browse Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />

      <main className="rs-container cart-wrap">
        <div className="cart-header">
          <div>
            <span className="rs-eyebrow"><ShoppingBag size={15} /> Ready to checkout</span>
            <h1 className="rs-section-title" style={{ marginTop: 12 }}>Your Cart</h1>
            <p className="rs-section-subtitle">Review your items before placing the order.</p>
          </div>
          <button type="button" onClick={clearCart} className="rs-btn rs-btn-danger">
            <Trash2 size={16} /> Clear All
          </button>
        </div>

        <div className="cart-layout">
          <section className="rs-card cart-list" aria-label="Cart items">
            {items.map((item) => (
              <article key={item._id} className="cart-item">
                <div className="cart-img">
                  {item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <span>🍽️</span>}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 className="cart-name">{item.name}</h3>
                  <div className="cart-price-small">₹{item.price} each</div>
                </div>

                <div className="qty-control" aria-label={`${item.name} quantity`}>
                  <button type="button" onClick={() => updateQty(item._id, item.quantity - 1)} aria-label="Decrease quantity">
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item._id, item.quantity + 1)} aria-label="Increase quantity">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="cart-line-total">₹{item.price * item.quantity}</div>

                <button type="button" onClick={() => removeItem(item._id)} className="cart-remove" aria-label={`Remove ${item.name}`}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </section>

          <aside className="rs-card cart-summary" aria-label="Cart summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-line">
              <span>Items</span>
              <strong>{itemCount}</strong>
            </div>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="summary-line">
              <span>Delivery / GST</span>
              <strong>At checkout</strong>
            </div>

            <div className="summary-note">
              <Clock size={18} color="#c8501a" />
              <span>Final delivery charges, discounts and taxes will be calculated on the checkout page.</span>
            </div>

            <div className="summary-total">
              <span>Estimated Total</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="cart-actions" style={{ marginTop: 18 }}>
              <button type="button" onClick={() => navigate('/checkout')} className="rs-btn rs-btn-primary">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <Link to="/menu" className="rs-btn rs-btn-outline">
                Continue Shopping
              </Link>
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
              <div className="summary-line" style={{ padding: 0, justifyContent: 'flex-start' }}>
                <ShieldCheck size={17} color="#159447" />
                <span>Secure ordering</span>
              </div>
              <div className="summary-line" style={{ padding: 0, justifyContent: 'flex-start' }}>
                <CreditCard size={17} color="#159447" />
                <span>COD and Razorpay supported</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
