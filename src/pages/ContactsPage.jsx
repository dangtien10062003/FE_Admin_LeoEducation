import React, { useEffect, useState } from 'react';
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
  updateContactStatus,
} from '../services/api';
import { Loader2, RefreshCw, Trash2, X, User, Mail, Phone } from 'lucide-react';

const STATUS_OPTIONS = ['New', 'Processing', 'Resolved'];
const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
  'Resolved': 'bg-green-100 text-green-700'
};

export const ContactsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', message: '', status: 'New' });

  const load = async () => {
    setLoading(true);
    try { const res = await getContacts(); setItems(res.data || []); } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try { await updateContactStatus(id, status); load(); } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa liên hệ này?')) return;
    try {
      await deleteContact(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => {
    setEditing(null); setForm({ fullName: '', email: '', phone: '', message: '', status: 'New' }); setShowModal(true);
  };
  const openEdit = (c) => {
    setEditing(c); setForm({ fullName: c.fullName, email: c.email, phone: c.phone, message: c.message || '', status: c.status }); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateContact(editing.id, form);
      } else {
        await createContact(form);
      }
      setShowModal(false); load();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Liên hệ</h1>
          <p className="text-slate-500 text-sm">{items.length} yêu cầu • {items.filter(c => c.status === 'New').length} chưa xử lý</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><RefreshCw className="w-5 h-5" /></button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">+ Thêm liên hệ</button>
        </div>
      </div>
      <div className="space-y-3">
        {items.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{c.fullName}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || 'bg-slate-100'}`}>{c.status}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">{c.message || 'Không có nội dung'}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            {expanded === c.id && (
              <div className="px-5 pb-4 pt-0 border-t border-slate-100 bg-slate-50">
                <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4" />{c.phone}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4" />{c.email}</div>
                </div>
                {c.message && <p className="mt-2 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">{c.message}</p>}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">Trạng thái:</span>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => changeStatus(c.id, s)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${c.status === s ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-teal-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {s}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button onClick={() => openEdit(c)} className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">✏️ Sửa</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200">🗑️ Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">Chưa có yêu cầu liên hệ</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa liên hệ' : 'Thêm liên hệ'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">SĐT *</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">{editing ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
