// pages/admin/AdminDeliveryBoys.jsx
import React, { useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight, Truck } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', password: '', phone: '', vehicleNumber: '' };

function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/admin/delivery-boy', form);
      toast.success('Delivery boy created!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally { setLoading(false); }
  };

  const iStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const lStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700 }}>Add Delivery Boy</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#7c5c3e' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div><label style={lStyle}>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" style={iStyle} required /></div>
          <div><label style={lStyle}>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" style={iStyle} required /></div>
          <div><label style={lStyle}>Password *</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" style={iStyle} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lStyle}>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" style={iStyle} /></div>
            <div><label style={lStyle}>Vehicle No.</label><input value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="TN 01 AB 1234" style={iStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDeliveryBoys() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(r => setUsers(r.data.filter(u => u.role === 'delivery')))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/toggle`);
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <AdminLayout title="Delivery Boys">
      {showModal && <AddModal onClose={() => setShowModal(false)} onSave={fetchUsers} />}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={() => setShowModal(true)} style={{ padding: '9px 18px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Delivery Boy
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7c5c3e' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7c5c3e' }}>
          <Truck size={40} color="#d4c4b0" style={{ marginBottom: '12px' }} />
          <p style={{ marginBottom: '16px' }}>No delivery boys yet.</p>
          <button onClick={() => setShowModal(true)} style={{ padding: '9px 20px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Add First Delivery Boy</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {users.map(user => (
            <div key={user._id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', padding: '20px', opacity: user.isActive ? 1 : 0.65 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: user.isActive ? '#c8501a' : '#e8d5c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a0f05' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#7c5c3e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: user.isActive ? '#16a34a' : '#dc2626', background: user.isActive ? '#dcfce7' : '#fee2e2', padding: '3px 8px', borderRadius: '20px', flexShrink: 0 }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#4a3728', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                {user.phone && <span>📞 {user.phone}</span>}
                {user.vehicleNumber && <span>🛵 {user.vehicleNumber}</span>}
              </div>
              <button onClick={() => handleToggle(user)} style={{ width: '100%', padding: '8px', background: user.isActive ? '#fee2e2' : '#dcfce7', color: user.isActive ? '#dc2626' : '#16a34a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
