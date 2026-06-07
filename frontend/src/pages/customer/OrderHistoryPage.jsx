// pages/customer/OrderHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, RotateCcw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  Pending: '#f59e0b', Accepted: '#3b82f6', Preparing: '#8b5cf6',
  Packed: '#06b6d4', 'Out for Delivery': '#c8501a', Delivered: '#16a34a', Cancelled: '#dc2626',
};

function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await api.post(`/orders/${order._id}/review`, { rating, review });
      toast.success('Review submitted!');
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Rate Your Order</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
              <Star size={28} color="#f59e0b" fill={s <= rating ? '#f59e0b' : 'none'} />
            </button>
          ))}
        </div>
        <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Write a review (optional)..." rows={3}
          style={{ width: '100%', padding: '10px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '10px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);

  const fetchOrders = () => {
    api.get(`/users/${user._id}/orders`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleRepeat = (order) => {
    order.items.forEach(item => addItem({ _id: item.itemId, name: item.name, price: item.price }));
    toast.success('Items added to cart!');
  };

  const handleCancel = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`, { cancellationReason: 'Cancelled by customer' });
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel at this stage');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmit={fetchOrders} />}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#1a0f05', marginBottom: '24px' }}>My Orders</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7c5c3e' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Package size={48} color="#d4c4b0" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#7c5c3e', fontSize: '16px', marginBottom: '16px' }}>No orders yet</p>
            <Link to="/menu" style={{ background: '#c8501a', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Order Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div key={order._id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #f0e4d4' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a0f05', marginBottom: '2px' }}>#{order.invoiceNumber}</div>
                    <div style={{ fontSize: '12px', color: '#b8997a' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <span style={{ background: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status], padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '13px', color: '#4a3728', marginBottom: '10px' }}>
                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#c8501a' }}>₹{order.total}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link to={`/order/${order._id}/track`} style={{ padding: '7px 14px', background: '#fdf0e8', color: '#c8501a', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Track</Link>
                      <Link to={`/invoice/${order._id}`} style={{ padding: '7px 14px', background: '#f5f5f5', color: '#4a3728', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Invoice</Link>
                      <button onClick={() => handleRepeat(order)} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #e8d5c0', color: '#4a3728', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RotateCcw size={12} /> Repeat
                      </button>
                      {order.status === 'Delivered' && !order.rating && (
                        <button onClick={() => setReviewOrder(order)} style={{ padding: '7px 14px', background: '#fef9c3', color: '#854d0e', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} /> Review
                        </button>
                      )}
                      {order.status === 'Delivered' && order.rating && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> {order.rating}
                        </span>
                      )}
                      {['Pending', 'Accepted'].includes(order.status) && (
                        <button onClick={() => handleCancel(order._id)} style={{ padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
