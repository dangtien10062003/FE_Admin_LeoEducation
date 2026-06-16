import React, { useEffect, useState } from 'react';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from '../services/api';
import { Loader2, Star, Plus, Search, X, Edit2, Trash2 } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { MobileActions, MobileCardList, MobileField } from '../components/MobileCardList';

export const TestimonialsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [form, setForm] = useState({ studentName: '', jobTitle: '', content: '', rating: 5, avatarURL: '', isActive: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTestimonials({ searchTerm: keyword, pageIndex, pageSize });
      setItems(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [keyword, pageIndex, pageSize]);

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
    if (!confirm('Xóa đánh giá này')) return;
    try {
      await deleteTestimonial(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const toggleActive = async (t) => {
    try {
      await updateTestimonial(t.testimonialId, { ...t, isActive: !t.isActive });
      load();
    } catch (e) { alert(e.message); }
  };

  const openCreate = () => { setEditing(null); setForm({ studentName: '', jobTitle: '', content: '', rating: 5, avatarURL: '', isActive: true }); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ studentName: t.studentName, jobTitle: t.jobTitle || '', content: t.content, rating: t.rating, avatarURL: t.avatarURL || '', isActive: t.isActive }); setShowModal(true); };

  if (loading) return <div className="flex justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Quản lý Đánh giá</h1><p className="text-slate-500 text-sm">{meta.total} đánh giá</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Thêm đánh giá
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          placeholder="Tìm theo học viên, nghề nghiệp, nội dung..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <MobileCardList
          items={items}
          emptyMessage="Chưa có đánh giá"
          renderItem={(t, index) => (
            <div className={t.isActive ? '' : 'opacity-60'}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex flex-shrink-0 items-center justify-center text-sm font-bold text-white">
                  {t.studentName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-400">STT {(pageIndex - 1) * pageSize + index + 1}</div>
                  <h3 className="mt-1 truncate text-sm font-medium text-slate-800">{t.studentName}</h3>
                  <div className="mt-1 flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>
                </div>
              </div>
              <div className="mt-3">
                <MobileField label="Nghề nghiệp">{t.jobTitle || 'Học viên'}</MobileField>
                <MobileField label="Nội dung"><span className="line-clamp-2">{t.content}</span></MobileField>
                <MobileField label="Trạng thái">
                  <label className="inline-flex items-center justify-end gap-2">
                    <input type="checkbox" checked={t.isActive} onChange={() => toggleActive(t)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    {t.isActive ? 'Hiển thị' : 'Đang ẩn'}
                  </label>
                </MobileField>
                <MobileField label="Ngày">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</MobileField>
              </div>
              <MobileActions>
                <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600"><Edit2 className="w-3.5 h-3.5" /> Sửa</button>
                <button onClick={() => handleDelete(t.testimonialId)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
              </MobileActions>
            </div>
          )}
        />
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3">STT</th>
              <th className="px-5 py-3">Học viên</th>
              <th className="px-5 py-3">Nghề nghiệp</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Nội dung</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Ngày</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {items.map((t, index) => (
              <tr key={t.testimonialId} className={`text-sm hover:bg-slate-50 ${t.isActive ? '' : 'opacity-60'}`}>
                <td className="px-5 py-3 text-slate-500">{(pageIndex - 1) * pageSize + index + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                      {t.studentName.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-800">{t.studentName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{t.jobTitle || 'Học viên'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>
                </td>
                <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{t.content}</td>
                <td className="px-5 py-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={t.isActive}
                      onChange={() => toggleActive(t)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    {t.isActive ? 'Hiển thị' : 'Đang ẩn'}
                  </label>
                </td>
                <td className="px-5 py-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.testimonialId)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400">Chưa có đánh giá</td></tr>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


