// pages/customer/PaymentSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e8d5c0', padding: '48px 36px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: '#1a0f05', marginBottom: '8px' }}>Order Placed! 🎉</h1>
          <p style={{ color: '#7c5c3e', fontSize: '15px', marginBottom: '20px' }}>
            {order ? `Your order #${order.invoiceNumber} is confirmed.` : 'Your order has been placed successfully.'}
          </p>
          {order && (
            <div style={{ background: '#fdf6ec', borderRadius: '10px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a3728', marginBottom: '4px' }}>
                <span>Total Paid</span><span style={{ fontWeight: 700, color: '#c8501a' }}>₹{order.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a3728' }}>
                <span>Payment</span><span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orderId && (
              <Link to={`/order/${orderId}/track`} style={{ padding: '12px', background: '#c8501a', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
                Track Order
              </Link>
            )}
            {orderId && (
              <Link to={`/invoice/${orderId}`} style={{ padding: '12px', background: '#fff', border: '1px solid #e8d5c0', color: '#4a3728', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                Download Invoice
              </Link>
            )}
            <Link to="/menu" style={{ padding: '12px', background: '#fdf0e8', color: '#c8501a', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              Order More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
