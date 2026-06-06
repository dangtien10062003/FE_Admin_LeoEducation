import React, { useEffect, useState } from 'react';
import {
  createInstructor,
  deleteInstructor,
  getInstructors,
  updateInstructor,
} from '../services/api';
import { Loader2, Plus, X, Edit2, Trash2 } from 'lucide-react';

export const InstructorsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fullName: '', role: '', bio: '', experience: '', avatarUrl: '', rating: 5 });

  const load = async () => {
    setLoading(true);
    try { const res = await getInstructors(); setItems(res.data || []); } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

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
    if (!confirm('Xóa giáo viên này?')) return;
    try {
      await deleteInstructor(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => { setEditing(null); setForm({ fullName: '', role: '', bio: '', experience: '', avatarUrl: '', rating: 5 }); setShowModal(true); };
  const openEdit = (i) => { setEditing(i); setForm({ fullName: i.fullName, role: i.role || '', bio: i.bio || '', experience: i.experience || '', avatarUrl: i.avatarUrl || '', rating: i.rating }); setShowModal(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Quản lý Giáo viên</h1><p className="text-slate-500 text-sm">{items.length} giáo viên</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Thêm giáo viên
        </button>
      </div>
      {loading ? <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(i => (
            <div key={i.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                {i.avatarUrl ? <img src={i.avatarUrl} alt={i.fullName} className="w-12 h-12 rounded-full object-cover" /> : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                    {i.fullName.charAt(0)}
                  </div>
                )}
                <div className="flex-1"><h3 className="font-semibold text-slate-800">{i.fullName}</h3><p className="text-sm text-slate-500">{i.role}</p></div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                {i.experience && <span>📅 {i.experience}</span>}
                <span>⭐ {i.rating}</span>
              </div>
              {i.bio && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{i.bio}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(i)} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" /> Sửa</button>
                <button onClick={() => handleDelete(i.id)} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Xóa</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-full bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">Chưa có giáo viên</div>}
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
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Chuyên môn</label>
                  <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Kinh nghiệm</label>
                  <input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="5 năm" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
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
