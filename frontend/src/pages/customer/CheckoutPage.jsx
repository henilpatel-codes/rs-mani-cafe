// pages/customer/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e8d5c0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1a0f05',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#4a3728',
  marginBottom: '5px',
};

function Section({ title, children }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8d5c0',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      <h3
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '16px',
          fontWeight: 700,
          color: '#1a0f05',
          marginBottom: '16px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    phone: user?.phone || '',
    orderType: 'takeaway',
    tableNumber: '',
    street: '',
    city: '',
    pincode: '',
    landmark: '',
    specialInstructions: '',
    paymentMethod: '',
  });

  const [coupon, setCoupon] = useState({
    code: '',
    applied: false,
    discount: 0,
    message: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
    api.get('/settings').then(r => setSettings(r.data)).catch(console.error);
  }, []);

  const gstPct = settings?.gstPercentage || 5;

  const deliveryCharge =
    form.orderType === 'delivery'
      ? subtotal >= (settings?.freeDeliveryAbove || 500)
        ? 0
        : settings?.deliveryCharge || 30
      : 0;

  const gstAmount = Math.round(((subtotal - coupon.discount) * gstPct) / 100);
  const total = subtotal + gstAmount + deliveryCharge - coupon.discount;

  const handleApplyCoupon = async () => {
    if (!coupon.code.trim()) return;

    try {
      const { data } = await api.post('/coupons/validate', {
        code: coupon.code,
        orderAmount: subtotal,
      });

      setCoupon(c => ({
        ...c,
        applied: true,
        discount: data.discount,
        message: `"${data.coupon.code}" applied! -₹${data.discount}`,
      }));

      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      setCoupon(c => ({
        ...c,
        applied: false,
        discount: 0,
        message: err.response?.data?.message || 'Invalid coupon',
      }));

      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePlaceOrder = async () => {
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    if (form.orderType === 'delivery' && !form.street.trim()) {
      toast.error('Delivery address is required');
      return;
    }

    if (form.orderType === 'dine-in' && !form.tableNumber.trim()) {
      toast.error('Table number is required');
      return;
    }

    if (!form.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (form.orderType === 'delivery' && form.paymentMethod === 'cod' && settings?.codEnabled === false) {
      toast.error(settings?.codDisabledReason || 'Cash on Delivery is currently not available for delivery orders. Please pay online.');
      return;
    }

    if (settings?.minOrderAmount > 0 && subtotal < settings.minOrderAmount) {
      toast.error(`Minimum order amount is ₹${settings.minOrderAmount}`);
      return;
    }

    if (form.orderType === 'delivery' && settings?.servicedPincodes) {
      const allowed = settings.servicedPincodes
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      if (allowed.length > 0 && form.pincode.trim() && !allowed.includes(form.pincode.trim())) {
        toast.error(
          `We don't deliver to pincode ${form.pincode}. Serviceable: ${allowed.join(', ')}`
        );
        return;
      }
    }

    setLoading(true);

    const orderPayload = {
      userId: user?._id || null,
      customerName: form.customerName,
      phone: form.phone,
      orderType: form.orderType,
      tableNumber: form.tableNumber,
      deliveryAddress: {
        street: form.street,
        city: form.city,
        pincode: form.pincode,
        landmark: form.landmark,
      },
      items: items.map(i => ({
        itemId: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      specialInstructions: form.specialInstructions,
      paymentMethod: form.paymentMethod,
      couponCode: coupon.applied ? coupon.code : '',
    };

    try {
      if (form.paymentMethod === 'razorpay') {
        const loaded = await loadRazorpayScript();

        if (!loaded) {
          toast.error('Razorpay failed to load. Please try again.');
          setLoading(false);
          return;
        }

        const { data: rzpOrder } = await api.post('/payment/create-order', {
          amount: total,
        });

        const keyId = rzpOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

        await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: keyId,
            amount: rzpOrder.amount,
            currency: 'INR',
            name: 'RS MANI Café',
            description: 'Food Order',
            order_id: rzpOrder.orderId,
            handler: async (response) => {
              try {
                await api.post('/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                orderPayload.paymentId = response.razorpay_payment_id;
                orderPayload.razorpayOrderId = response.razorpay_order_id;
                orderPayload.razorpaySignature = response.razorpay_signature;

                const { data: order } = await api.post('/orders', orderPayload);

                clearCart();
                navigate(`/payment/success?orderId=${order._id}`);
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            prefill: {
              name: form.customerName,
              contact: form.phone,
            },
            theme: {
              color: '#c8501a',
            },
            modal: {
              ondismiss: () => reject(new Error('Payment cancelled')),
            },
          });

          rzp.open();
        });
      } else {
        const { data: order } = await api.post('/orders', orderPayload);
        clearCart();
        navigate(`/payment/success?orderId=${order._id}`);
      }
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        toast.error('Payment was cancelled');
      } else if (err.response?.data?.code === 'RAZORPAY_NOT_CONFIGURED') {
        toast.error('Online payment is not available right now. Please try again later.');
      } else {
        toast.error(err.response?.data?.message || 'Order failed. Please try again.');
      }

      navigate('/payment/failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a0f05',
            marginBottom: '24px',
          }}
        >
          Checkout
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr min(340px, 100%)',
            gap: '20px',
          }}
          className="checkout-grid"
        >
          <div>
            {settings?.minOrderAmount > 0 && subtotal < settings.minOrderAmount && (
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '14px',
                  fontSize: '13px',
                  color: '#92400e',
                  fontWeight: 600,
                }}
              >
                ⚠️ Minimum order amount is ₹{settings.minOrderAmount}. Add ₹
                {settings.minOrderAmount - subtotal} more to proceed.
              </div>
            )}

            <Section title="Contact Information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    style={inputStyle}
                    value={form.customerName}
                    onChange={e => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    style={inputStyle}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </Section>

            <Section title="Order Type">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {['takeaway', 'dine-in', 'delivery'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, orderType: type })}
                    style={{
                      flex: 1,
                      minWidth: '130px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `2px solid ${form.orderType === type ? '#c8501a' : '#e8d5c0'}`,
                      background: form.orderType === type ? '#fdf0e8' : '#fff',
                      color: form.orderType === type ? '#c8501a' : '#7c5c3e',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {type === 'takeaway' ? '🥡' : type === 'dine-in' ? '🍽️' : '🛵'}{' '}
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {form.orderType === 'dine-in' && (
                <div>
                  <label style={labelStyle}>Table Number *</label>
                  <input
                    style={inputStyle}
                    value={form.tableNumber}
                    onChange={e => setForm({ ...form, tableNumber: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>
              )}

              {form.orderType === 'delivery' && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Street Address *</label>
                    <input
                      style={inputStyle}
                      value={form.street}
                      onChange={e => setForm({ ...form, street: e.target.value })}
                      placeholder="House no., Street name"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input
                        style={inputStyle}
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Pincode</label>
                      <input
                        style={inputStyle}
                        value={form.pincode}
                        onChange={e => setForm({ ...form, pincode: e.target.value })}
                        placeholder="6-digit pincode"
                      />

                      {settings?.servicedPincodes && (
                        <p style={{ fontSize: '11px', color: '#7c5c3e', marginTop: '4px' }}>
                          Serviceable:{' '}
                          {settings.servicedPincodes
                            .split(',')
                            .map(p => p.trim())
                            .filter(Boolean)
                            .join(', ') || 'All areas'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Landmark</label>
                    <input
                      style={inputStyle}
                      value={form.landmark}
                      onChange={e => setForm({ ...form, landmark: e.target.value })}
                      placeholder="Near..."
                    />
                  </div>
                </div>
              )}
            </Section>

            <Section title="Special Instructions">
              <textarea
                value={form.specialInstructions}
                onChange={e => setForm({ ...form, specialInstructions: e.target.value })}
                placeholder="Any dietary preferences or special requests..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              />
            </Section>

            <Section title="Payment Method">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  ['cod', '💵 Cash on Delivery'],
                  ['razorpay', '💳 Pay Online (Razorpay)'],
                ].map(([val, label]) => {
                  const isCodDisabled = val === 'cod' && form.orderType === 'delivery' && settings?.codEnabled === false;
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={isCodDisabled}
                      onClick={() => {
                        if (isCodDisabled) {
                          toast.error(
                            settings?.codDisabledReason ||
                              'Cash on Delivery is currently not available.'
                          );
                          return;
                        }

                        setForm({ ...form, paymentMethod: val });
                      }}
                      style={{
                        flex: 1,
                        minWidth: '180px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `2px solid ${
                          form.paymentMethod === val ? '#c8501a' : '#e8d5c0'
                        }`,
                        background: isCodDisabled
                          ? '#f3f4f6'
                          : form.paymentMethod === val
                            ? '#fdf0e8'
                            : '#fff',
                        color: isCodDisabled
                          ? '#9ca3af'
                          : form.paymentMethod === val
                            ? '#c8501a'
                            : '#7c5c3e',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: isCodDisabled ? 'not-allowed' : 'pointer',
                        opacity: isCodDisabled ? 0.75 : 1,
                      }}
                    >
                      {label}
                      {isCodDisabled ? ' — Disabled' : ''}
                    </button>
                  );
                })}
              </div>

              {form.orderType === 'delivery' && settings?.codEnabled === false && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#dc2626',
                    marginTop: '8px',
                    fontWeight: 600,
                  }}
                >
                  {settings?.codDisabledReason ||
                    'Cash on Delivery is temporarily unavailable for delivery orders. Please pay online.'}
                </p>
              )}
            </Section>
          </div>

          <div>
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e8d5c0',
                padding: '20px',
                position: 'sticky',
                top: '80px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1a0f05',
                  marginBottom: '14px',
                }}
              >
                Order Summary
              </h3>

              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '14px' }}>
                {items.map(item => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      marginBottom: '6px',
                      color: '#4a3728',
                    }}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: '1px solid #f0e4d4',
                  paddingTop: '14px',
                  marginBottom: '14px',
                }}
              >
                <label style={labelStyle}>Coupon Code</label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={coupon.code}
                    onChange={e =>
                      setCoupon(c => ({
                        ...c,
                        code: e.target.value.toUpperCase(),
                        applied: false,
                        discount: 0,
                      }))
                    }
                    placeholder="Enter code"
                    disabled={coupon.applied}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      fontSize: '13px',
                      padding: '8px 12px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={coupon.applied}
                    style={{
                      padding: '8px 12px',
                      background: coupon.applied ? '#16a34a' : '#c8501a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {coupon.applied ? <CheckCircle size={14} /> : <Tag size={14} />}
                  </button>
                </div>

                {coupon.message && (
                  <p
                    style={{
                      fontSize: '12px',
                      marginTop: '5px',
                      color: coupon.applied ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {coupon.message}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f0e4d4', paddingTop: '12px', fontSize: '13px' }}>
                {[
                  ['Subtotal', subtotal],
                  ...(coupon.discount > 0 ? [['Discount', -coupon.discount]] : []),
                  [`GST (${gstPct}%)`, gstAmount],
                  ...(deliveryCharge > 0 ? [['Delivery Charge', deliveryCharge]] : []),
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      color: val < 0 ? '#16a34a' : '#4a3728',
                    }}
                  >
                    <span>{label}</span>
                    <span style={{ fontWeight: 600 }}>
                      {val < 0 ? '-' : ''}₹{Math.abs(val)}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    borderTop: '1px solid #f0e4d4',
                    paddingTop: '10px',
                    marginTop: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#1a0f05',
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: '#c8501a' }}>₹{total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  background: loading ? '#8a3d15' : '#c8501a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? 'Placing Order...'
                  : !form.paymentMethod
                    ? `Select Payment Method • ₹${total}`
                    : form.paymentMethod === 'cod'
                      ? `Place Order • ₹${total}`
                      : `Pay ₹${total}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}