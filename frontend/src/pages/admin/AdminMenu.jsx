// pages/admin/AdminMenu.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Upload } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Dosas', 'Idli', 'Beverages', 'Combos', 'Snacks', 'Rice', 'Breads', 'Sweets'];
const EMPTY = { name: '', category: 'Dosas', price: '', description: '', image: '', isVeg: true, spiceLevel: 'mild', isAvailable: true };

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return; }
    setLoading(true);
    try {
      if (item?._id) await api.put(`/menu/${item._id}`, { ...form, price: Number(form.price) });
      else await api.post('/menu', { ...form, price: Number(form.price) });
      toast.success(item?._id ? 'Item updated!' : 'Item added!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally { setLoading(false); }
  };

    const handleImageUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const data = new FormData();
      data.append('image', file);

      setUploading(true);

      try {
        const res = await api.post('/upload/menu-image', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setForm((prev) => ({
          ...prev,
          image: res.data.imageUrl,
        }));

        toast.success('Image uploaded!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Image upload failed');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };

  const iStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const lStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700 }}>{item?._id ? 'Edit Item' : 'Add New Item'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#7c5c3e' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div><label style={lStyle}>Item Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Masala Dosa" style={iStyle} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lStyle}>Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={iStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lStyle}>Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min="0" placeholder="0" style={iStyle} required /></div>
          </div>
          <div><label style={lStyle}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..." style={{ ...iStyle, resize: 'vertical' }} /></div>
                    <div>
                      <label style={lStyle}>Image</label>

                      <input
                        value={form.image}
                        onChange={e => setForm({ ...form, image: e.target.value })}
                        placeholder="Paste image URL or upload from gallery"
                        style={iStyle}
                      />

                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 12px',
                            background: uploading ? '#e5e7eb' : '#fdf0e8',
                            color: uploading ? '#6b7280' : '#c8501a',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            border: '1px solid #f1c7ad',
                          }}
                        >
                          <Upload size={14} />
                          {uploading ? 'Uploading...' : 'Upload from Gallery'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {form.image && (
                          <span style={{ fontSize: '12px', color: '#16a34a' }}>
                            Image selected
                          </span>
                        )}
                      </div>

                      {form.image && (
                        <img
                          src={form.image}
                          alt="Preview"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{
                            marginTop: '10px',
                            width: '100%',
                            maxHeight: '160px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid #e8d5c0',
                          }}
                        />
                      )}
                    </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lStyle}>Type</label>
              <select value={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.value === 'true' })} style={iStyle}>
                <option value="true">🌿 Veg</option>
                <option value="false">🥩 Non-Veg</option>
              </select>
            </div>
            <div>
              <label style={lStyle}>Spice Level</label>
              <select value={form.spiceLevel} onChange={e => setForm({ ...form, spiceLevel: e.target.value })} style={iStyle}>
                <option value="mild">Mild</option>
                <option value="medium">Medium</option>
                <option value="hot">Hot</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
              {loading ? 'Saving...' : item?._id ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalItem, setModalItem] = useState(undefined); // undefined = closed, null = new, obj = edit

  const fetchItems = () => {
    api.get('/menu').then(r => setItems(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleToggle = async (item) => {
    try {
      await api.put(`/menu/${item._id}/toggle`);
      toast.success(`${item.name} marked ${item.isAvailable ? 'unavailable' : 'available'}`);
      fetchItems();
    } catch { toast.error('Failed to toggle'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/menu/${item._id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = items.filter(i =>
    (categoryFilter === 'All' || i.category === categoryFilter) &&
    (i.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout title="Menu Management">
      {modalItem !== undefined && <ItemModal item={modalItem} onClose={() => setModalItem(undefined)} onSave={fetchItems} />}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b8997a' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          {['All', ...CATEGORIES].map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setModalItem(null)} style={{ padding: '9px 18px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0e4d4', fontSize: '13px', color: '#7c5c3e' }}>
          {filtered.length} items
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7c5c3e' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#fdf6ec' }}>
                {['Item', 'Category', 'Price', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: '#b8997a', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id} style={{ borderTop: '1px solid #f0e4d4', opacity: item.isAvailable ? 1 : 0.6 }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: item.image ? `url(${item.image}) center/cover` : '#f5e6d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {!item.image && '🍽️'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a0f05' }}>{item.name}</div>
                          {item.description && <div style={{ fontSize: '11px', color: '#b8997a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a3728' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, color: '#c8501a' }}>₹{item.price}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: item.isVeg ? '#16a34a' : '#dc2626' }}>{item.isVeg ? '🌿 Veg' : '🥩 Non-Veg'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggle(item)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: item.isAvailable ? '#16a34a' : '#dc2626' }}>
                        {item.isAvailable ? <ToggleRight size={20} color="#16a34a" /> : <ToggleLeft size={20} color="#dc2626" />}
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setModalItem(item)} style={{ padding: '6px 10px', background: '#fdf0e8', color: '#c8501a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(item)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
