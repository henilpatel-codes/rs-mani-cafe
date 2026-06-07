// pages/admin/AdminOrders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MessageCircle, Printer } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'Pending', 'Accepted', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLOR = {
  Pending: '#f59e0b', Accepted: '#3b82f6', Preparing: '#8b5cf6',
  Packed: '#06b6d4', 'Out for Delivery': '#c8501a', Delivered: '#16a34a', Cancelled: '#dc2626',
};

function OrderModal({ order, deliveryBoys, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [deliveryBoyId, setDeliveryBoyId] = useState(order.deliveryBoy?._id || '');
  const [estimatedTime, setEstimatedTime] = useState(order.estimatedTime || 30);
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/orders/${order._id}`, { status, deliveryBoyId: deliveryBoyId || null, estimatedTime, cancellationReason });
      toast.success('Order updated');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handleKOTPrint = () => {
    const w = window.open('', '_blank', 'width=320,height=600');
    w.document.write(`
      <html><head><title>KOT #${order.invoiceNumber}</title>
      <style>
        body{font-family:monospace;font-size:13px;padding:16px;width:280px}
        h2{text-align:center;font-size:15px;margin:0 0 4px}
        p{text-align:center;margin:2px 0;font-size:12px}
        hr{border:1px dashed #000;margin:8px 0}
        table{width:100%;border-collapse:collapse}
        td{padding:3px 2px;font-size:13px}
        td:last-child{text-align:right}
        .big{font-size:16px;font-weight:bold;text-align:center;margin:6px 0}
      </style></head><body>
      <h2>RS MANI Café</h2>
      <p>KITCHEN ORDER TICKET</p>
      <hr/>
      <p><b>Order:</b> #${order.invoiceNumber}</p>
      <p><b>Type:</b> ${order.orderType}${order.tableNumber ? ' — Table ' + order.tableNumber : ''}</p>
      <p><b>Time:</b> ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
      <p><b>Customer:</b> ${order.customerName}</p>
      <hr/>
      <table>
        ${order.items.map(i => `<tr><td>${i.name}</td><td><b>x${i.quantity}</b></td></tr>`).join('')}
      </table>
      <hr/>
      ${order.specialInstructions ? `<p><b>Note:</b> ${order.specialInstructions}</p><hr/>` : ''}
      <div class="big">★ KOT COPY ★</div>
      <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>
    `);
    w.document.close();
  };

  const whatsappMsg = () => {
    const text = encodeURIComponent(
      `*RS MANI Café — Order #${order.invoiceNumber}*\nStatus: ${status}\n\n` +
      order.items.map(i => `• ${i.name} ×${i.quantity}`).join('\n') +
      `\n\nTotal: ₹${order.total}`
    );
    window.open(`https://wa.me/${order.phone}?text=${text}`, '_blank');
  };

  const selStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', color: '#1a0f05', background: '#fff', outline: 'none' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700 }}>Order #{order.invoiceNumber}</h3>
            <p style={{ color: '#7c5c3e', fontSize: '13px', marginTop: '2px' }}>{order.customerName} • {order.phone}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#7c5c3e' }}>×</button>
        </div>

        {/* Items */}
        <div style={{ background: '#fdf6ec', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a3728', marginBottom: '4px' }}>
              <span>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #e8d5c0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
            <span>Total</span><span style={{ color: '#c8501a' }}>₹{order.total}</span>
          </div>
          {order.orderType === 'delivery' && order.deliveryAddress?.street && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#7c5c3e' }}>📍 {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.pincode}</div>
          )}
          {order.specialInstructions && <div style={{ marginTop: '6px', fontSize: '12px', color: '#7c5c3e' }}>📝 {order.specialInstructions}</div>}
        </div>

        <div style={{ display: 'grid', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' }}>Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={selStyle}>
              {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {status === 'Cancelled' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' }}>Cancellation Reason</label>
              <input value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} placeholder="Reason..." style={{ ...selStyle }} />
            </div>
          )}
          {order.orderType === 'delivery' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' }}>Assign Delivery Boy</label>
              <select value={deliveryBoyId} onChange={e => setDeliveryBoyId(e.target.value)} style={selStyle}>
                <option value="">— Not assigned —</option>
                {deliveryBoys.map(b => <option key={b._id} value={b._id}>{b.name} {b.phone ? `(${b.phone})` : ''}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a3728', marginBottom: '5px' }}>Estimated Time (min)</label>
            <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(Number(e.target.value))} min="5" max="180" style={selStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleKOTPrint} style={{ padding: '10px 14px', background: '#1a0f05', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Printer size={14} /> KOT
          </button>
          <button onClick={whatsappMsg} style={{ padding: '10px 14px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MessageCircle size={14} /> WA
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={handleUpdate} disabled={loading} style={{ flex: 2, padding: '10px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
            {loading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    api.get(`/orders?status=${filter}&page=${page}&limit=20`)
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { api.get('/users/delivery-boys/list').then(r => setDeliveryBoys(r.data)).catch(console.error); }, []);

  const filtered = search ? orders.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.invoiceNumber?.includes(search) || o.phone?.includes(search)
  ) : orders;

  return (
    <AdminLayout title="Orders">
      {selectedOrder && <OrderModal order={selectedOrder} deliveryBoys={deliveryBoys} onClose={() => setSelectedOrder(null)} onUpdate={fetchOrders} />}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b8997a' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, invoice, phone..."
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          style={{ padding: '9px 32px 9px 12px', border: '1px solid #e8d5c0', borderRadius: '8px', fontSize: '14px', color: '#1a0f05', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
        <button onClick={fetchOrders} style={{ padding: '9px 16px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Refresh</button>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8d5c0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0e4d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#7c5c3e' }}>{total} orders total</span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7c5c3e' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7c5c3e' }}>No orders found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#fdf6ec' }}>
                {['Invoice', 'Customer', 'Items', 'Total', 'Type', 'Payment', 'Status', 'Time', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: '#b8997a', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id} style={{ borderTop: '1px solid #f0e4d4' }}>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#c8501a', whiteSpace: 'nowrap' }}>#{order.invoiceNumber}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a0f05' }}>{order.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#b8997a' }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#4a3728', maxWidth: '160px' }}>
                      {order.items.map(i => `${i.name}×${i.quantity}`).join(', ')}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: '#1a0f05', whiteSpace: 'nowrap' }}>₹{order.total}</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#4a3728', textTransform: 'capitalize' }}>{order.orderType}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: order.paymentStatus === 'paid' ? '#16a34a' : '#f59e0b', textTransform: 'capitalize' }}>{order.paymentStatus}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status], padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>{order.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: '#b8997a', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => setSelectedOrder(order)} style={{ padding: '6px 14px', background: '#c8501a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '7px 16px', border: '1px solid #e8d5c0', borderRadius: '8px', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>← Prev</button>
          <span style={{ padding: '7px 16px', fontSize: '13px', color: '#4a3728' }}>Page {page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} style={{ padding: '7px 16px', border: '1px solid #e8d5c0', borderRadius: '8px', background: '#fff', cursor: page * 20 >= total ? 'not-allowed' : 'pointer', fontSize: '13px' }}>Next →</button>
        </div>
      )}
    </AdminLayout>
  );
}
