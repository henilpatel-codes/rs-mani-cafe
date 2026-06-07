// pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [form, setForm] = useState({
    restaurantName: '', phone: '', address: '', whatsappNumber: '',
    gstPercentage: 5, deliveryCharge: 30, freeDeliveryAbove: 500,
    estimatedDeliveryTime: 30, isOpen: true,
    minOrderAmount: 0, servicedPincodes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(r => setForm(f => ({ ...f, ...r.data })))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const f = (key, type = 'text') => ({
    value: form[key] ?? '',
    onChange: e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value })),
  });

  const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' };

  function Card({ title, children }) {
    return (
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', padding: '22px', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: 700, color: '#1a0f05', marginBottom: '18px' }}>{title}</h3>
        {children}
      </div>
    );
  }

  if (loading) return <AdminLayout title="Settings"><div style={{ textAlign: 'center', padding: '40px', color: '#7c5c3e' }}>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Settings">
      <form onSubmit={handleSave} style={{ maxWidth: '680px' }}>

        {/* Restaurant Status */}
        <Card title="Restaurant Status">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: form.isOpen ? '#f0fdf4' : '#fef2f2', borderRadius: '10px', border: `1px solid ${form.isOpen ? '#bbf7d0' : '#fecaca'}` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: form.isOpen ? '#15803d' : '#dc2626' }}>
                {form.isOpen ? '🟢 Restaurant is OPEN' : '🔴 Restaurant is CLOSED'}
              </div>
              <div style={{ fontSize: '12px', color: '#7c5c3e', marginTop: '2px' }}>Toggle to accept or pause new orders</div>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, isOpen: !f.isOpen }))}
              style={{ padding: '8px 20px', background: form.isOpen ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
              {form.isOpen ? 'Close Now' : 'Open Now'}
            </button>
          </div>
        </Card>

        {/* Restaurant Info */}
        <Card title="Restaurant Information">
          <div style={{ display: 'grid', gap: '14px' }}>
            <div><label style={lStyle}>Restaurant Name</label><input {...f('restaurantName')} placeholder="RS MANI Café" style={iStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={lStyle}>Phone Number</label><input {...f('phone')} placeholder="+91 98765 43210" style={iStyle} /></div>
              <div><label style={lStyle}>WhatsApp Number</label><input {...f('whatsappNumber')} placeholder="919876543210 (with country code)" style={iStyle} /></div>
            </div>
            <div><label style={lStyle}>Address</label><textarea {...f('address')} rows={2} placeholder="Full restaurant address..." style={{ ...iStyle, resize: 'vertical' }} /></div>
          </div>
        </Card>

        {/* Pricing */}
        <Card title="Pricing & Charges">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={lStyle}>GST (%)</label>
              <input type="number" {...f('gstPercentage', 'number')} min="0" max="28" style={iStyle} />
              <p style={{ fontSize: '11px', color: '#b8997a', marginTop: '4px' }}>Applied on subtotal</p>
            </div>
            <div>
              <label style={lStyle}>Delivery Charge (₹)</label>
              <input type="number" {...f('deliveryCharge', 'number')} min="0" style={iStyle} />
              <p style={{ fontSize: '11px', color: '#b8997a', marginTop: '4px' }}>For delivery orders</p>
            </div>
            <div>
              <label style={lStyle}>Free Delivery Above (₹)</label>
              <input type="number" {...f('freeDeliveryAbove', 'number')} min="0" style={iStyle} />
              <p style={{ fontSize: '11px', color: '#b8997a', marginTop: '4px' }}>0 = always charge</p>
            </div>
            <div>
              <label style={lStyle}>Est. Delivery Time (min)</label>
              <input type="number" {...f('estimatedDeliveryTime', 'number')} min="5" max="180" style={iStyle} />
              <p style={{ fontSize: '11px', color: '#b8997a', marginTop: '4px' }}>Shown to customers</p>
            </div>
            <div>
              <label style={lStyle}>Min Order Amount (₹)</label>
              <input type="number" {...f('minOrderAmount', 'number')} min="0" style={iStyle} />
              <p style={{ fontSize: '11px', color: '#b8997a', marginTop: '4px' }}>0 = no minimum</p>
            </div>
          </div>
        </Card>

        {/* Delivery Zones */}
        <Card title="Delivery Zones">
          <div>
            <label style={lStyle}>Serviceable Pincodes (comma-separated)</label>
            <input {...f('servicedPincodes')} placeholder="e.g. 600001, 600002, 600003" style={iStyle} />
            <p style={{ fontSize: '11px', color: '#b8997a', marginTop: '6px' }}>
              Leave empty to allow all pincodes. Customers will see this list at checkout.
            </p>
          </div>
          {form.servicedPincodes && (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {form.servicedPincodes.split(',').map(p => p.trim()).filter(Boolean).map(pin => (
                <span key={pin} style={{ background: '#fdf0e8', color: '#c8501a', border: '1px solid #e8d5c0', borderRadius: '6px', padding: '3px 10px', fontSize: '13px', fontWeight: 600 }}>{pin}</span>
              ))}
            </div>
          )}
        </Card>

        {/* Summary preview */}
        <div style={{ background: '#fdf6ec', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', fontSize: '13px', color: '#4a3728' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: '#1a0f05' }}>Live Preview</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <span>GST: <strong>{form.gstPercentage}%</strong></span>
            <span>Delivery: <strong>₹{form.deliveryCharge}</strong></span>
            <span>Free above: <strong>₹{form.freeDeliveryAbove}</strong></span>
            <span>ETA: <strong>{form.estimatedDeliveryTime} min</strong></span>
            <span>Min order: <strong>₹{form.minOrderAmount}</strong></span>
          </div>
        </div>

        <button type="submit" disabled={saving} style={{ padding: '12px 32px', background: saving ? '#8a3d15' : '#c8501a', color: '#fff', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </AdminLayout>
  );
}
