import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookMarked,
  BookOpen,
  ClipboardList,
  MessageSquare,
  GraduationCap,
  Star,
  FileText,
  School,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/subjects', label: 'Môn học', icon: BookMarked },
  { path: '/courses', label: 'Khóa học', icon: BookOpen },
  { path: '/registrations', label: 'Đăng ký', icon: ClipboardList },
  { path: '/contacts', label: 'Liên hệ', icon: MessageSquare },
  { path: '/instructors', label: 'Giáo viên', icon: GraduationCap },
  { path: '/testimonials', label: 'Đánh giá', icon: Star },
  { path: '/blogs', label: 'Blog', icon: FileText },
];

export const Sidebar = ({ activePage }) => {
  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white h-full shadow-xl flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
          <School className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-wide">LeoEducation</h2>
          <p className="text-[11px] text-slate-400">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = activePage === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <p className="text-xs text-slate-500 text-center">© 2026 LeoEducation</p>
      </div>
    </aside>
  );
};
