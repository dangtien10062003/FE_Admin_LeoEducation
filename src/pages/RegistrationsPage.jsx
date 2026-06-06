import React, { useEffect, useState } from 'react';
import {
  createRegistration,
  deleteRegistration,
  getRegistrations,
  updateRegistration,
  updateRegistrationStatus,
} from '../services/api';
import { Loader2, RefreshCw, Trash2, X, User, Phone, Mail } from 'lucide-react';
import { formatDisplayCode } from '../utils/displayCode';

const STATUS_OPTIONS = ['Mới', 'Đã gọi', 'Đã nhập học', 'Pending', 'Approved', 'Cancelled'];
const STATUS_COLORS = {
  'Mới': 'bg-blue-100 text-blue-700',
  'Đã gọi': 'bg-purple-100 text-purple-700',
  'Đã nhập học': 'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Approved': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

export const RegistrationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', courseId: '', status: 'Mới'
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getRegistrations();
      setItems(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try { await updateRegistrationStatus(id, status); load(); }
    catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đăng ký này?')) return;
    try {
      await deleteRegistration(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ fullName: '', email: '', phone: '', courseId: '', status: 'Mới' });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      fullName: r.fullName, email: r.email || '', phone: r.phone,
      courseId: r.courseId, status: r.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      fullName: form.fullName, email: form.email, phone: form.phone,
      courseId: parseInt(form.courseId), status: form.status
    };
    try {
      if (editing) {
        await updateRegistration(editing.registrationId, data);
      } else {
        await createRegistration(data);
      }
      setShowModal(false); load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Đăng ký</h1>
          <p className="text-slate-500 text-sm">{items.length} đăng ký • {items.filter(r => r.status === 'Mới').length} mới</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
            + Thêm đăng ký
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3">Mã đăng ký</th>
                <th className="px-5 py-3">Họ tên</th>
                <th className="px-5 py-3">SĐT</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Khóa học</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Ngày</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(r => (
                <tr key={r.registrationId} className="text-sm hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500 font-mono">{formatDisplayCode('DK', r.registrationId)}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{r.fullName}</td>
                  <td className="px-5 py-3 text-slate-600">{r.phone}</td>
                  <td className="px-5 py-3 text-slate-600">{r.email || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{r.courseName || formatDisplayCode('KH', r.courseId)}</td>
                  <td className="px-5 py-3">
                    <select value={r.status} onChange={e => changeStatus(r.registrationId, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[r.status] || 'bg-slate-100'}`}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">✏️</button>
                    <button onClick={() => handleDelete(r.registrationId)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">🗑️</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="8" className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <ClipboardList className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">Chưa có đăng ký</p>
                    <button onClick={openCreate} className="mt-3 text-sm text-teal-600 hover:underline">+ Thêm đăng ký đầu tiên</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa đăng ký' : 'Thêm đăng ký'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SĐT *</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã khóa học nội bộ *</label>
                  <input type="number" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                  {editing ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ClipboardList = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
  </svg>
);
