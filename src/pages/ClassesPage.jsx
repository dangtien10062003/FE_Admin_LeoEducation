import React, { useEffect, useMemo, useState } from 'react';
import {
  createClass,
  deleteClass,
  getClassAvailableStudents,
  getClassById,
  getClasses,
  getCourses,
  getInstructors,
  getSubjects,
  updateClass,
} from '../services/api';
import { CalendarDays, Edit2, Loader2, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { MobileActions, MobileCardList, MobileField } from '../components/MobileCardList';

const emptyForm = {
  className: '',
  courseId: '',
  subjectId: '',
  instructorId: '',
  startDate: '',
  endDate: '',
  status: 'Active',
  note: '',
  registrationIds: [],
};

const statusColors = {
  'Đang dạy': 'bg-green-100 text-green-700',
  'Sắp mở': 'bg-blue-100 text-blue-700',
  'Đã kết thúc': 'bg-slate-100 text-slate-600',
};

const formatDateInput = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '—';

export const ClassesPage = () => {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getClasses({ searchTerm: keyword, pageIndex, pageSize });
      setItems(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [keyword, pageIndex, pageSize]);

  useEffect(() => {
    Promise.all([
      getCourses({ pageSize: 100 }),
      getSubjects({ pageSize: 100 }),
      getInstructors({ pageSize: 100 }),
    ]).then(([courseRes, subjectRes, instructorRes]) => {
      setCourses(courseRes.data || []);
      setSubjects(subjectRes.data || []);
      setInstructors(instructorRes.data || []);
    }).catch(console.error);
  }, []);

  const selectedCourse = useMemo(
    () => courses.find(c => c.courseId === Number(form.courseId)),
    [courses, form.courseId],
  );

  const loadAvailableStudents = async (courseId, classId) => {
    if (!courseId) {
      setAvailableStudents([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const res = await getClassAvailableStudents({ courseId, classId });
      setAvailableStudents(res.data || []);
    } catch (e) {
      console.error(e);
      setAvailableStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (!showModal) return;
    loadAvailableStudents(form.courseId, editing?.classId);
  }, [showModal, form.courseId, editing?.classId]);

  const setCourse = (courseId) => {
    const course = courses.find(c => c.courseId === Number(courseId));
    setForm({
      ...form,
      courseId,
      subjectId: course?.subjectId || '',
      instructorId: course?.instructorId || '',
      registrationIds: [],
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = async (item) => {
    try {
      const res = await getClassById(item.classId);
      const data = res.data;
      setEditing(data);
      setForm({
        className: data.className || '',
        courseId: data.courseId || '',
        subjectId: data.subjectId || '',
        instructorId: data.instructorId || '',
        startDate: formatDateInput(data.startDate),
        endDate: formatDateInput(data.endDate),
        status: data.status || 'Active',
        note: data.note || '',
        registrationIds: (data.students || []).map(s => s.registrationId),
      });
      setShowModal(true);
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleStudent = (id) => {
    const student = availableStudents.find(item => item.registrationId === id);
    const alreadySelected = form.registrationIds.includes(id);
    if (!alreadySelected && student && !student.canAdd) return;

    setForm(current => ({
      ...current,
      registrationIds: current.registrationIds.includes(id)
        ? current.registrationIds.filter(item => item !== id)
        : [...current.registrationIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      courseId: Number(form.courseId),
      subjectId: form.subjectId ? Number(form.subjectId) : null,
      instructorId: form.instructorId ? Number(form.instructorId) : null,
    };

    try {
      if (editing) await updateClass(editing.classId, payload);
      else await createClass(payload);
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa lớp học này')) return;
    try {
      await deleteClass(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý lớp học</h1>
          <p className="text-slate-500 text-sm">{meta.total} lớp học</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Thêm lớp học
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          placeholder="Tìm theo lớp, khóa học, môn học, giáo viên..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? (
        <div className="flex h-48 justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <MobileCardList
            items={items}
            emptyMessage="Chưa có lớp học"
            renderItem={(item, index) => (
              <div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-400">STT {(pageIndex - 1) * pageSize + index + 1}</div>
                    <h3 className="mt-1 truncate text-sm font-medium text-slate-800">{item.className}</h3>
                  </div>
                </div>
                <div className="mt-3">
                  <MobileField label="Khóa học">{item.courseName}</MobileField>
                  <MobileField label="Môn học">{item.subjectName || 'Chưa chọn'}</MobileField>
                  <MobileField label="Giáo viên">{item.instructorName || 'Chưa chọn'}</MobileField>
                  <MobileField label="Thời gian">{formatDate(item.startDate)} - {formatDate(item.endDate)}</MobileField>
                  <MobileField label="Học sinh">{item.studentCount || 0}</MobileField>
                </div>
                <MobileActions>
                  <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600"><Edit2 className="h-3.5 w-3.5" /> Sửa</button>
                  <button onClick={() => handleDelete(item.classId)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 className="h-3.5 w-3.5" /> Xóa</button>
                </MobileActions>
              </div>
            )}
          />
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">STT</th>
                  <th className="px-5 py-3">Lớp học</th>
                  <th className="px-5 py-3">Khóa học</th>
                  <th className="px-5 py-3">Môn học</th>
                  <th className="px-5 py-3">Giáo viên</th>
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Học sinh</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.classId} className="text-sm hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-500">{(pageIndex - 1) * pageSize + index + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{item.className}</td>
                    <td className="px-5 py-3 text-slate-600">{item.courseName}</td>
                    <td className="px-5 py-3 text-slate-600">{item.subjectName || 'Chưa chọn'}</td>
                    <td className="px-5 py-3 text-slate-600">{item.instructorName || 'Chưa chọn'}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(item.startDate)} - {formatDate(item.endDate)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.teachingStatus] || 'bg-slate-100 text-slate-600'}`}>
                        {item.teachingStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{item.studentCount || 0}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(item)} className="rounded p-1.5 text-slate-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item.classId)} className="rounded p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="9" className="px-5 py-12 text-center text-slate-400">Chưa có lớp học</td></tr>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa lớp học' : 'Thêm lớp học'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên lớp *</label>
                <input value={form.className} onChange={e => setForm({...form, className: e.target.value})} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Khóa học *</label>
                  <select value={form.courseId} onChange={e => setCourse(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Chọn khóa học</option>
                    {courses.map(course => <option key={course.courseId} value={course.courseId}>{course.courseName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Môn học</label>
                  <select value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Theo khóa học</option>
                    {subjects.map(subject => <option key={subject.subjectId} value={subject.subjectId}>{subject.subjectName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giáo viên</label>
                  <select value={form.instructorId} onChange={e => setForm({...form, instructorId: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Theo khóa học</option>
                    {instructors.map(instructor => <option key={instructor.id} value={instructor.id}>{instructor.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái quản trị</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ngày bắt đầu *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ngày kết thúc *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} rows={2} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div className="rounded-lg border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-800">Học sinh trong lớp</h4>
                    <p className="text-xs text-slate-500">
                      {selectedCourse ? `Đang lọc theo khóa học: ${selectedCourse.courseName}` : 'Chọn khóa học để lọc học sinh đăng ký'}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-teal-600">{form.registrationIds.length} đã chọn</span>
                </div>
                <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center px-4 py-8 text-sm text-slate-400">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải học sinh
                    </div>
                  ) : availableStudents.length > 0 ? availableStudents.map(student => {
                    const checked = form.registrationIds.includes(student.registrationId);
                    const disabled = !checked && !student.canAdd;

                    return (
                      <label key={student.registrationId} className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 ${disabled ? 'opacity-60' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleStudent(student.registrationId)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-slate-700">{student.fullName}</span>
                          <span className="block truncate text-xs text-slate-500">{student.phone} {student.email ? `- ${student.email}` : ''}</span>
                          {student.assignedClassName && (
                            <span className="block truncate text-xs text-slate-400">Lớp hiện tại: {student.assignedClassName}</span>
                          )}
                        </span>
                        <span className="flex flex-col items-end gap-1 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${student.enrollmentStatus === 'Đã ghi danh' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {student.enrollmentStatus}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${student.classAssignmentStatus === 'Chờ xếp lớp' || student.classAssignmentStatus === 'Đã trong lớp này' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {student.classAssignmentStatus}
                          </span>
                        </span>
                      </label>
                    );
                  }) : (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">Chưa có học sinh đăng ký khóa này</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                  <CalendarDays className="h-4 w-4" /> {editing ? 'Cập nhật' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
