// pages/admin/AdminCoupons.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tag } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { code: '', discountType: 'percentage', discountValue: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', isActive: true, expiryDate: '' };

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState(coupon || EMPTY);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiryDate: form.expiryDate || null,
    };
    try {
      if (coupon?._id) await api.put(`/coupons/${coupon._id}`, payload);
      else await api.post('/coupons', payload);
      toast.success(coupon?._id ? 'Coupon updated!' : 'Coupon created!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const iStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const lStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700 }}>{coupon?._id ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#7c5c3e' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div><label style={lStyle}>Coupon Code *</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" style={iStyle} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lStyle}>Discount Type</label>
              <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} style={iStyle}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div><label style={lStyle}>Discount Value *</label><input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '20' : '50'} min="1" style={iStyle} required /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lStyle}>Min Order (₹)</label><input type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} min="0" style={iStyle} /></div>
            {form.discountType === 'percentage' && <div><label style={lStyle}>Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No limit" style={iStyle} /></div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lStyle}>Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" min="1" style={iStyle} /></div>
            <div><label style={lStyle}>Expiry Date</label><input type="date" value={form.expiryDate ? form.expiryDate.slice(0, 10) : ''} onChange={e => setForm({ ...form, expiryDate: e.target.value })} style={iStyle} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="active" style={{ fontSize: '14px', color: '#4a3728', cursor: 'pointer' }}>Active</label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
              {loading ? 'Saving...' : coupon?._id ? 'Update' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);

  const fetch = () => api.get('/coupons').then(r => setCoupons(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleToggle = async (c) => {
    try { await api.put(`/coupons/${c._id}`, { isActive: !c.isActive }); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title="Coupons">
      {modal !== undefined && <CouponModal coupon={modal} onClose={() => setModal(undefined)} onSave={fetch} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={() => setModal(null)} style={{ padding: '9px 18px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#7c5c3e' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {coupons.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#7c5c3e' }}>
              <Tag size={40} color="#d4c4b0" style={{ marginBottom: '12px' }} />
              <p>No coupons yet. Create one!</p>
            </div>
          ) : coupons.map(c => (
            <div key={c._id} style={{ background: '#fff', borderRadius: '14px', border: `2px dashed ${c.isActive ? '#c8501a' : '#e8d5c0'}`, padding: '20px', opacity: c.isActive ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ background: c.isActive ? '#c8501a' : '#e8d5c0', color: c.isActive ? '#fff' : '#7c5c3e', padding: '4px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '16px', letterSpacing: '1px' }}>{c.code}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setModal(c)} style={{ padding: '5px 8px', background: '#fdf0e8', color: '#c8501a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(c._id)} style={{ padding: '5px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1a0f05', marginBottom: '6px' }}>
                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
              </div>
              <div style={{ fontSize: '12px', color: '#7c5c3e', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {c.minOrderAmount > 0 && <span>Min order: ₹{c.minOrderAmount}</span>}
                {c.maxDiscount && <span>Max discount: ₹{c.maxDiscount}</span>}
                {c.usageLimit && <span>Used: {c.usedCount}/{c.usageLimit}</span>}
                {c.expiryDate && <span>Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN')}</span>}
              </div>
              <button onClick={() => handleToggle(c)} style={{ marginTop: '12px', width: '100%', padding: '7px', background: c.isActive ? '#fee2e2' : '#dcfce7', color: c.isActive ? '#dc2626' : '#16a34a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                {c.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
