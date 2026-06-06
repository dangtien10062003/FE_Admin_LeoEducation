import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, getSubjects } from '../services/api';
import { formatDisplayCode } from '../utils/displayCode';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    courseName: '',
    description: '',
    subjectId: '',
    price: '',
    instructorId: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCourses({ keyword, limit: 100 });
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [keyword]);

  useEffect(() => {
    getSubjects()
      .then(res => setSubjects(res.data || []))
      .catch(console.error);
  }, []);

  const resetForm = () => setForm({
    courseName: '',
    description: '',
    subjectId: '',
    price: '',
    instructorId: '',
  });

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      courseName: course.courseName || '',
      description: course.description || '',
      subjectId: course.subjectId || '',
      price: course.price || '',
      instructorId: course.instructorId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      courseName: form.courseName,
      description: form.description,
      subjectId: form.subjectId ? parseInt(form.subjectId) : null,
      price: form.price ? parseFloat(form.price) : null,
      instructorId: form.instructorId ? parseInt(form.instructorId) : null,
    };

    try {
      if (editing) await updateCourse(editing.courseId, data);
      else await createCourse(data);
      setShowModal(false);
      showToast(editing ? 'Cập nhật khóa học thành công' : 'Tạo khóa học thành công');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa khóa học này?')) return;
    try {
      await deleteCourse(id);
      showToast('Xóa khóa học thành công');
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý khóa học</h1>
          <p className="text-slate-500 text-sm">{courses.length} khóa học</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Thêm khóa học
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Mã khóa học</th>
                <th className="px-5 py-3">Tên khóa học</th>
                <th className="px-5 py-3">Môn học</th>
                <th className="px-5 py-3">Giá</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map(course => (
                <tr key={course.courseId} className="text-sm hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500 font-mono">{formatDisplayCode('KH', course.courseId)}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{course.courseName}</td>
                  <td className="px-5 py-3 text-slate-600">{course.subject?.subjectName || 'Chưa chọn'}</td>
                  <td className="px-5 py-3 text-slate-600">{course.price ? `${course.price.toLocaleString()}đ` : 'Liên hệ'}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(course.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(course)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(course.courseId)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-400">Không có khóa học</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa khóa học' : 'Thêm khóa học'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên khóa học *</label>
                <input
                  value={form.courseName}
                  onChange={e => setForm({ ...form, courseName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                <select
                  value={form.subjectId}
                  onChange={e => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Chọn môn học</option>
                  {subjects.map(subject => (
                    <option key={subject.subjectId} value={subject.subjectId}>{subject.subjectName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã giáo viên nội bộ</label>
                  <input
                    type="number"
                    value={form.instructorId}
                    onChange={e => setForm({ ...form, instructorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

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
