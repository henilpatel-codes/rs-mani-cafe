// pages/customer/InvoicePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Download, ArrowLeft, MessageCircle } from 'lucide-react';
import api from '../../utils/api';

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/orders/${id}`), api.get('/settings')])
      .then(([o, s]) => { setOrder(o.data); setSettings(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    if (!order || !settings?.whatsappNumber) return;
    const text = encodeURIComponent(
      `*RS MANI Café — Order #${order.invoiceNumber}*\n\n` +
      order.items.map(i => `• ${i.name} ×${i.quantity} = ₹${i.price * i.quantity}`).join('\n') +
      `\n\n*Total: ₹${order.total}*\nPayment: ${order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#7c5c3e' }}>Loading invoice...</div>;
  if (!order) return <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'DM Sans, sans-serif' }}>Order not found. <Link to="/">Go Home</Link></div>;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .invoice-container { box-shadow: none !important; border: none !important; max-width: 100% !important; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif', padding: '24px' }}>
        {/* Action bar */}
        <div className="no-print" style={{ maxWidth: '680px', margin: '0 auto 16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to={`/order/${id}/track`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c8501a', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {settings?.whatsappNumber && (
              <button onClick={handleWhatsApp} style={{ padding: '8px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={14} /> WhatsApp
              </button>
            )}
            <button onClick={handlePrint} style={{ padding: '8px 16px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="invoice-container" style={{ maxWidth: '680px', margin: '0 auto', background: '#fff', borderRadius: '16px', border: '1px solid #e8d5c0', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#1a0f05' }}>RS MANI Café</div>
              <div style={{ color: '#7c5c3e', fontSize: '13px', marginTop: '4px' }}>Authentic South Indian Restaurant</div>
              {settings?.address && <div style={{ color: '#7c5c3e', fontSize: '12px', marginTop: '2px' }}>{settings.address}</div>}
              {settings?.phone && <div style={{ color: '#7c5c3e', fontSize: '12px' }}>{settings.phone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#b8997a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Invoice</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#c8501a' }}>#{order.invoiceNumber}</div>
              <div style={{ fontSize: '12px', color: '#7c5c3e', marginTop: '4px' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ fontSize: '12px', color: '#7c5c3e' }}>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Customer + Order info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px', padding: '16px', background: '#fdf6ec', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#b8997a', marginBottom: '6px', fontWeight: 600 }}>Bill To</div>
              <div style={{ fontWeight: 700, color: '#1a0f05', fontSize: '15px' }}>{order.customerName}</div>
              <div style={{ color: '#7c5c3e', fontSize: '13px' }}>{order.phone}</div>
              {order.orderType === 'delivery' && (
                <div style={{ color: '#7c5c3e', fontSize: '12px', marginTop: '4px' }}>
                  {order.deliveryAddress?.street ? (
                    `${order.deliveryAddress.street}${order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}${order.deliveryAddress.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}`
                  ) : (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude) ? (
                    <span style={{ fontWeight: 600 }}>Shared Live Location</span>
                  ) : (
                    'No Address Provided'
                  )}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#b8997a', marginBottom: '6px', fontWeight: 600 }}>Order Info</div>
              <div style={{ fontSize: '13px', color: '#4a3728' }}><span style={{ fontWeight: 600 }}>Type:</span> <span style={{ textTransform: 'capitalize' }}>{order.orderType}</span></div>
              {order.tableNumber && <div style={{ fontSize: '13px', color: '#4a3728' }}><span style={{ fontWeight: 600 }}>Table:</span> {order.tableNumber}</div>}
              <div style={{ fontSize: '13px', color: '#4a3728' }}><span style={{ fontWeight: 600 }}>Payment:</span> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</div>
              <div style={{ fontSize: '13px', color: order.paymentStatus === 'paid' ? '#16a34a' : '#f59e0b', fontWeight: 600, marginTop: '2px' }}>
                {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus === 'pending' ? '⏳ Pending' : order.paymentStatus}
              </div>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8d5c0' }}>
                {['#', 'Item', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: i >= 2 ? 'center' : 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#b8997a', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0e4d4' }}>
                  <td style={{ padding: '10px 8px', fontSize: '13px', color: '#7c5c3e' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', fontSize: '14px', fontWeight: 600, color: '#1a0f05' }}>{item.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '14px', color: '#4a3728' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '14px', color: '#4a3728' }}>₹{item.price}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#1a0f05' }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '240px' }}>
              {[
                ['Subtotal', order.subtotal],
                ...(order.discountAmount > 0 ? [['Discount', -order.discountAmount]] : []),
                [`GST (${settings?.gstPercentage || 5}%)`, order.gstAmount],
                ...(order.deliveryCharge > 0 ? [['Delivery Charge', order.deliveryCharge]] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: val < 0 ? '#16a34a' : '#4a3728', padding: '4px 0' }}>
                  <span>{label}</span><span>{val < 0 ? '-' : ''}₹{Math.abs(val)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', color: '#1a0f05', borderTop: '2px solid #e8d5c0', paddingTop: '10px', marginTop: '6px' }}>
                <span>Total</span><span style={{ color: '#c8501a' }}>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px dashed #e8d5c0', textAlign: 'center', color: '#b8997a', fontSize: '12px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#7c5c3e', marginBottom: '4px' }}>Thank you for your order!</div>
            <div>Visit us again • RS MANI Café</div>
            {settings?.whatsappNumber && <div style={{ marginTop: '4px' }}>📞 {settings.whatsappNumber}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
