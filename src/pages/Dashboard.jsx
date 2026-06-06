import React, { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, MessageSquare, GraduationCap, Star, FileText, Loader2, TrendingUp } from 'lucide-react';
import { getStats } from '../services/api';
import { formatDisplayCode } from '../utils/displayCode';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Không thể tải dữ liệu</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <p className="text-xs text-gray-400">Hãy đảm bảo backend đang chạy trên http://localhost:5000</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống LeoEducation</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4 text-teal-500" />
          <span>Cập nhật realtime</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Khóa học" value={stats?.totalCourses || 0} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={ClipboardList} label="Đăng ký" value={stats?.totalRegistrations || 0} color="text-teal-600" bgColor="bg-teal-50" />
        <StatCard icon={MessageSquare} label="Liên hệ mới" value={stats?.newContacts || 0} color="text-orange-600" bgColor="bg-orange-50" />
        <StatCard icon={GraduationCap} label="Giáo viên" value={stats?.totalInstructors || 0} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard icon={Star} label="Đánh giá" value={stats?.totalTestimonials || 0} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard icon={FileText} label="Bài viết" value={stats?.totalBlogs || 0} color="text-pink-600" bgColor="bg-pink-50" />
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Đăng ký gần đây</h2>
          <span className="text-xs text-gray-400">{stats?.recentRegistrations?.length || 0} bản ghi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">Họ tên</th>
                <th className="px-5 py-3">SĐT</th>
                <th className="px-5 py-3">Khóa học</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentRegistrations?.length > 0 ? stats.recentRegistrations.map(r => (
                <tr key={r.registrationId} className="text-sm hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.fullName}</td>
                  <td className="px-5 py-3 text-gray-600">{r.phone}</td>
                  <td className="px-5 py-3 text-gray-600">{r.courseName || formatDisplayCode('KH', r.courseId)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <ClipboardList className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">Chưa có đăng ký</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    'Mới': 'bg-blue-100 text-blue-700', 'New': 'bg-blue-100 text-blue-700',
    'Processing': 'bg-yellow-100 text-yellow-700', 'Resolved': 'bg-green-100 text-green-700',
    'Pending': 'bg-yellow-100 text-yellow-700', 'Approved': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700', 'Đã gọi': 'bg-purple-100 text-purple-700',
    'Đã nhập học': 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};
