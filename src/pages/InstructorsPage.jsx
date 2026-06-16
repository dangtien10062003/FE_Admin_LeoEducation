import React, { useEffect, useState } from 'react';
import {
  createInstructor,
  deleteInstructor,
  getInstructors,
  updateInstructor,
} from '../services/api';
import { Loader2, Plus, Search, X, Edit2, Trash2 } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { MobileActions, MobileCardList, MobileField } from '../components/MobileCardList';

export const InstructorsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [form, setForm] = useState({ fullName: '', role: '', bio: '', experience: '', avatarUrl: '', rating: 5 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInstructors({ searchTerm: keyword, pageIndex, pageSize });
      setItems(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [keyword, pageIndex, pageSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, rating: parseFloat(form.rating) };
    try {
      if (editing) {
        await updateInstructor(editing.id, data);
      } else {
        await createInstructor(data);
      }
      setShowModal(false);
      setForm({ fullName: '', role: '', bio: '', experience: '', avatarUrl: '', rating: 5 });
      load();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa giáo viên này')) return;
    try {
      await deleteInstructor(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => { setEditing(null); setForm({ fullName: '', role: '', bio: '', experience: '', avatarUrl: '', rating: 5 }); setShowModal(true); };
  const openEdit = (i) => { setEditing(i); setForm({ fullName: i.fullName, role: i.role || '', bio: i.bio || '', experience: i.experience || '', avatarUrl: i.avatarUrl || '', rating: i.rating }); setShowModal(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Quản lý Giáo viên</h1><p className="text-slate-500 text-sm">{meta.total} giáo viên</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Thêm giáo viên
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          placeholder="Tìm theo tên, chuyên môn, kinh nghiệm..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <MobileCardList
            items={items}
            emptyMessage="Chưa có giáo viên"
            renderItem={(i, index) => (
              <div>
                <div className="flex items-start gap-3">
                  {i.avatarUrl ? <img src={i.avatarUrl} alt={i.fullName} className="w-11 h-11 rounded-full object-cover" /> : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex flex-shrink-0 items-center justify-center text-sm font-bold text-white">
                      {i.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-400">STT {(pageIndex - 1) * pageSize + index + 1}</div>
                    <h3 className="mt-1 truncate text-sm font-medium text-slate-800">{i.fullName}</h3>
                    {i.bio && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{i.bio}</p>}
                  </div>
                </div>
                <div className="mt-3">
                  <MobileField label="Chuyên môn">{i.role || '—'}</MobileField>
                  <MobileField label="Kinh nghiệm">{i.experience || '—'}</MobileField>
                  <MobileField label="Rating">{i.rating}</MobileField>
                </div>
                <MobileActions>
                  <button onClick={() => openEdit(i)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600"><Edit2 className="w-3.5 h-3.5" /> Sửa</button>
                  <button onClick={() => handleDelete(i.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
                </MobileActions>
              </div>
            )}
          />
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3">STT</th>
                <th className="px-5 py-3">Giáo viên</th>
                <th className="px-5 py-3">Chuyên môn</th>
                <th className="px-5 py-3">Kinh nghiệm</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Bio</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {items.map((i, index) => (
                <tr key={i.id} className="text-sm hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500">{(pageIndex - 1) * pageSize + index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {i.avatarUrl ? <img src={i.avatarUrl} alt={i.fullName} className="w-10 h-10 rounded-full object-cover" /> : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                          {i.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{i.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{i.role || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{i.experience || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{i.rating}</td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{i.bio || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(i)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(i.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-400">Chưa có giáo viên</td></tr>
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
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa giáo viên' : 'Thêm giáo viên'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Chuyên môn</label>
                  <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Kinh nghiệm</label>
                  <input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="5 năm" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
                  <input value={form.avatarUrl} onChange={e => setForm({...form, avatarUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
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


