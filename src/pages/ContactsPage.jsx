import React, { useEffect, useState } from 'react';
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
  updateContactStatus,
} from '../services/api';
import { Loader2, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { MobileActions, MobileCardList, MobileField } from '../components/MobileCardList';

const STATUS_OPTIONS = ['New', 'Processing', 'Resolved'];
const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
  'Resolved': 'bg-green-100 text-green-700'
};

export const ContactsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', message: '', status: 'New' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getContacts({ searchTerm: keyword, pageIndex, pageSize });
      setItems(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [keyword, pageIndex, pageSize]);

  const changeStatus = async (id, status) => {
    try { await updateContactStatus(id, status); load(); } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa liên hệ này')) return;
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
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Liên hệ</h1>
          <p className="text-slate-500 text-sm">{meta.total} yêu cầu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><RefreshCw className="w-5 h-5" /></button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">+ Thêm liên hệ</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          placeholder="Tìm theo họ tên, SĐT, email, nội dung, trạng thái..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <MobileCardList
          items={items}
          emptyMessage="Chưa có yêu cầu liên hệ"
          renderItem={(c, index) => (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-400">STT {(pageIndex - 1) * pageSize + index + 1}</div>
                  <h3 className="mt-1 truncate text-sm font-medium text-slate-800">{c.fullName}</h3>
                </div>
                <select value={c.status} onChange={e => changeStatus(c.id, e.target.value)}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[c.status] || 'bg-slate-100'}`}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mt-3">
                <MobileField label="SĐT">{c.phone}</MobileField>
                <MobileField label="Email">{c.email}</MobileField>
                <MobileField label="Nội dung"><span className="line-clamp-2">{c.message || 'Không có nội dung'}</span></MobileField>
                <MobileField label="Ngày">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</MobileField>
              </div>
              <MobileActions>
                <button onClick={() => openEdit(c)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">Sửa</button>
                <button onClick={() => handleDelete(c.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
              </MobileActions>
            </div>
          )}
        />
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3">STT</th>
              <th className="px-5 py-3">Họ tên</th>
              <th className="px-5 py-3">SĐT</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Nội dung</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Ngày</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {items.map((c, index) => (
              <tr key={c.id} className="text-sm hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">{(pageIndex - 1) * pageSize + index + 1}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{c.fullName}</td>
                <td className="px-5 py-3 text-slate-600">{c.phone}</td>
                <td className="px-5 py-3 text-slate-600">{c.email}</td>
                <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{c.message || 'Không có nội dung'}</td>
                <td className="px-5 py-3">
                  <select value={c.status} onChange={e => changeStatus(c.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[c.status] || 'bg-slate-100'}`}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">Sửa</button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400">Chưa có yêu cầu liên hệ</td></tr>
            )}
            </tbody>
          </table>
        </div>
        <Pagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => { setPageSize(size); setPageIndex(1); }}
        />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


