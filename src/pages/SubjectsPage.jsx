import React, { useEffect, useState } from 'react';
import { BookMarked, Edit2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { createSubject, deleteSubject, getSubjects, updateSubject } from '../services/api';
import { Pagination } from '../components/Pagination';
import { MobileActions, MobileCardList, MobileField } from '../components/MobileCardList';

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [form, setForm] = useState({ subjectName: '', description: '', imageUrl: '', isActive: true });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSubjects({ searchTerm: keyword, pageIndex, pageSize });
      setSubjects(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [keyword, pageIndex, pageSize]);

  const openCreate = () => {
    setEditing(null);
    setForm({ subjectName: '', description: '', imageUrl: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setForm({
      subjectName: subject.subjectName || '',
      description: subject.description || '',
      imageUrl: subject.imageUrl || '',
      isActive: subject.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateSubject(editing.subjectId, form);
      else await createSubject(form);
      setShowModal(false);
      showToast(editing ? 'Cập nhật môn học thành công' : 'Tạo môn học thành công');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa môn học này')) return;
    try {
      await deleteSubject(id);
      showToast('Xóa môn học thành công');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleActive = async (subject) => {
    try {
      await updateSubject(subject.subjectId, { isActive: !subject.isActive });
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed right-5 top-5 z-[60] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-teal-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý môn học</h1>
          <p className="text-slate-500 text-sm">{meta.total} môn học</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Thêm môn học
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          placeholder="Tìm kiếm môn học..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <MobileCardList
            items={subjects}
            emptyMessage="Chưa có môn học"
            renderItem={(subject, index) => (
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex flex-shrink-0 items-center justify-center">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-400">STT {(pageIndex - 1) * pageSize + index + 1}</div>
                    <h3 className="mt-1 truncate text-sm font-medium text-slate-800">{subject.subjectName}</h3>
                    {subject.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{subject.description}</p>}
                  </div>
                </div>
                <div className="mt-3">
                  <MobileField label="Khóa học">{subject.courseCount || 0}</MobileField>
                  <MobileField label="Trạng thái">
                    <label className="inline-flex items-center justify-end gap-2">
                      <input type="checkbox" checked={subject.isActive} onChange={() => toggleActive(subject)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      {subject.isActive ? 'Đang bật' : 'Đang tắt'}
                    </label>
                  </MobileField>
                </div>
                <MobileActions>
                  <button onClick={() => openEdit(subject)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600"><Edit2 className="w-3.5 h-3.5" /> Sửa</button>
                  <button onClick={() => handleDelete(subject.subjectId)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
                </MobileActions>
              </div>
            )}
          />
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3">STT</th>
                <th className="px-5 py-3">Môn học</th>
                <th className="px-5 py-3">Mô tả</th>
                <th className="px-5 py-3">Khóa học</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {subjects.map((subject, index) => (
                <tr key={subject.subjectId} className="text-sm hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500">{(pageIndex - 1) * pageSize + index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <BookMarked className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-800">{subject.subjectName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-sm truncate">{subject.description || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{subject.courseCount || 0}</td>
                  <td className="px-5 py-3">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={subject.isActive}
                        onChange={() => toggleActive(subject)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      {subject.isActive ? 'Đang bật' : 'Đang tắt'}
                    </label>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(subject)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(subject.subjectId)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400">Chưa có môn học</td></tr>
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
              <h3 className="text-lg font-semibold">{editing ? 'Sửa môn học' : 'Thêm môn học'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên môn học *</label>
                <input value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện URL</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Hiển thị môn học
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


