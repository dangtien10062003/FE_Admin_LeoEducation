import React, { useEffect, useState } from 'react';
import { createBlog, deleteBlog, getBlogs, updateBlog } from '../services/api';
import { Loader2, Plus, Search, X, FileText, Edit2, Trash2 } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { MobileActions, MobileCardList, MobileField } from '../components/MobileCardList';

export const BlogsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [form, setForm] = useState({ title: '', summary: '', content: '', imageUrl: '', author: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBlogs({ searchTerm: keyword, pageIndex, pageSize });
      setItems(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [keyword, pageIndex, pageSize]);

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
    if (!confirm('Xóa bài viết này')) return;
    try {
      await deleteBlog(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => { setEditing(null); setForm({ title: '', summary: '', content: '', imageUrl: '', author: '' }); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ title: b.title, summary: b.summary || '', content: b.content || '', imageUrl: b.imageUrl || '', author: b.author || '' }); setShowModal(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Quản lý Blog</h1><p className="text-slate-500 text-sm">{meta.total} bài viết</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Viết bài
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          placeholder="Tìm theo tiêu đề, tóm tắt, tác giả..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <MobileCardList
            items={items}
            emptyMessage="Chưa có bài viết"
            renderItem={(b, index) => (
              <div>
                <div className="flex items-start gap-3">
                  {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" /> : (
                    <div className="h-14 w-14 rounded-lg bg-slate-100 flex flex-shrink-0 items-center justify-center"><FileText className="w-5 h-5 text-slate-300" /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-400">STT {(pageIndex - 1) * pageSize + index + 1}</div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">{b.title}</h3>
                  </div>
                </div>
                <div className="mt-3">
                  <MobileField label="Tóm tắt"><span className="line-clamp-2">{b.summary || '—'}</span></MobileField>
                  <MobileField label="Tác giả">{b.author || '—'}</MobileField>
                  <MobileField label="Ngày">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</MobileField>
                </div>
                <MobileActions>
                  <button onClick={() => openEdit(b)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600"><Edit2 className="w-3.5 h-3.5" /> Sửa</button>
                  <button onClick={() => handleDelete(b.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
                </MobileActions>
              </div>
            )}
          />
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3">STT</th>
                <th className="px-5 py-3">Bài viết</th>
                <th className="px-5 py-3">Tóm tắt</th>
                <th className="px-5 py-3">Tác giả</th>
                <th className="px-5 py-3">Ngày</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {items.map((b, index) => (
                <tr key={b.id} className="text-sm hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500">{(pageIndex - 1) * pageSize + index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-slate-300" /></div>
                      )}
                      <span className="font-semibold text-slate-800">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{b.summary || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{b.author || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400">Chưa có bài viết</td></tr>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


