// pages/customer/PaymentSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ReceiptText, Bike, Utensils } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) api.get(`/orders/${orderId}`).then(r => setOrder(r.data)).catch(console.error);
  }, [orderId]);

  return (
    <div className="app-page">
      <Navbar />
      <div className="rs-container page-pad" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 72px)' }}>
        <div className="rs-card success-card animate-fade-up">
          <div className="success-icon"><CheckCircle size={44} /></div>
          <span className="rs-eyebrow">Order confirmed</span>
          <h1 className="rs-section-title" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginTop: 14 }}>Order Placed! 🎉</h1>
          <p className="rs-section-subtitle">{order ? `Your order #${order.invoiceNumber} is confirmed and being prepared.` : 'Your order has been placed successfully.'}</p>

          {order && (
            <div className="rs-card" style={{ padding: 16, margin: '22px 0', textAlign: 'left', boxShadow: 'none' }}>
              <div className="item-line"><span>Total Paid</span><strong style={{ color: 'var(--cafe-orange)' }}>₹{order.total}</strong></div>
              <div className="item-line"><span>Payment</span><strong style={{ textTransform: 'capitalize' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</strong></div>
              <div className="item-line"><span>Order Type</span><strong style={{ textTransform: 'capitalize' }}>{order.orderType?.replace('-', ' ')}</strong></div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 11 }}>
            {orderId && <Link to={`/order/${orderId}/track`} className="rs-btn rs-btn-primary"><Bike size={17} /> Track Order</Link>}
            {orderId && <Link to={`/invoice/${orderId}`} className="rs-btn rs-btn-outline"><ReceiptText size={17} /> View Invoice</Link>}
            <Link to="/menu" className="rs-btn rs-btn-outline"><Utensils size={17} /> Order More</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
