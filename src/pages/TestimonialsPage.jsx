import React, { useEffect, useState } from 'react';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from '../services/api';
import { Loader2, Star, Plus, X, Edit2, Trash2 } from 'lucide-react';

export const TestimonialsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ studentName: '', jobTitle: '', content: '', rating: 5, avatarURL: '', isActive: true });

  const load = async () => {
    setLoading(true);
    try { getTestimonials().then(res => setItems(res.data || [])).catch(console.error); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, rating: parseInt(form.rating) };
    try {
      if (editing) {
        await updateTestimonial(editing.testimonialId, data);
      } else {
        await createTestimonial(data);
      }
      setShowModal(false);
      setForm({ studentName: '', jobTitle: '', content: '', rating: 5, avatarURL: '', isActive: true });
      load();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      await deleteTestimonial(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => { setEditing(null); setForm({ studentName: '', jobTitle: '', content: '', rating: 5, avatarURL: '', isActive: true }); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ studentName: t.studentName, jobTitle: t.jobTitle || '', content: t.content, rating: t.rating, avatarURL: t.avatarURL || '', isActive: t.isActive }); setShowModal(true); };

  if (loading) return <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Quản lý Đánh giá</h1><p className="text-slate-500 text-sm">{items.length} đánh giá</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Thêm đánh giá
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(t => (
          <div key={t.testimonialId} className={`bg-white rounded-xl shadow-sm border p-5 ${t.isActive ? 'border-slate-200' : 'border-red-200 opacity-60'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                {t.studentName.charAt(0)}
              </div>
              <div className="flex-1"><h3 className="font-medium text-slate-800 text-sm">{t.studentName}</h3>
                <p className="text-xs text-slate-500">{t.jobTitle || 'Học viên'}</p></div>
            </div>
            <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>
            <p className="text-sm text-slate-600 line-clamp-4">{t.content}</p>
            <p className="mt-2 text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(t)} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" /> Sửa</button>
              <button onClick={() => handleDelete(t.testimonialId)} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Xóa</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 border-dashed">Chưa có đánh giá</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa đánh giá' : 'Thêm đánh giá'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tên học viên *</label>
                <input value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nghề nghiệp</label>
                  <input value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nội dung *</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
                <input value={form.avatarURL} onChange={e => setForm({...form, avatarURL: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Hiển thị
              </label>
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
