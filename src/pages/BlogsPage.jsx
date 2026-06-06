import React, { useEffect, useState } from 'react';
import { createBlog, deleteBlog, getBlogs, updateBlog } from '../services/api';
import { Loader2, Plus, X, FileText, Edit2, Trash2 } from 'lucide-react';

export const BlogsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', summary: '', content: '', imageUrl: '', author: '' });

  const load = async () => {
    setLoading(true);
    try { const res = await getBlogs(); setItems(res.data || []); } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateBlog(editing.id, form);
      } else {
        await createBlog(form);
      }
      setShowModal(false); setForm({ title: '', summary: '', content: '', imageUrl: '', author: '' }); load();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài viết này?')) return;
    try {
      await deleteBlog(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => { setEditing(null); setForm({ title: '', summary: '', content: '', imageUrl: '', author: '' }); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ title: b.title, summary: b.summary || '', content: b.content || '', imageUrl: b.imageUrl || '', author: b.author || '' }); setShowModal(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Quản lý Blog</h1><p className="text-slate-500 text-sm">{items.length} bài viết</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Viết bài
        </button>
      </div>
      {loading ? <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div> : (
        <div className="space-y-3">
          {items.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex gap-4">
              {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" /> : (
                <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><FileText className="w-8 h-8 text-slate-300" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800">{b.title}</h3>
                {b.summary && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{b.summary}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  {b.author && <span>✍️ {b.author}</span>}
                  <span>📅 {new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(b)} className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"><Edit2 className="w-3 h-3" /> Sửa</button>
                  <button onClick={() => handleDelete(b.id)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Xóa</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 border-dashed">Chưa có bài viết</div>}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa bài viết' : 'Viết bài mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tóm tắt</label>
                <textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={8} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Ảnh cover URL</label>
                  <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tác giả</label>
                  <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">{editing ? 'Cập nhật' : 'Đăng bài'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
