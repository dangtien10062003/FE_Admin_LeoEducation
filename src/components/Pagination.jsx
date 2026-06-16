import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ pageIndex, pageSize, total, totalPages, onPageChange, onPageSizeChange }) => {
  const safeTotalPages = Math.max(totalPages || Math.ceil((total || 0) / pageSize) || 1, 1);
  const currentPage = Math.min(Math.max(pageIndex || 1, 1), safeTotalPages);
  const start = total ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, total || 0);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div>
        Hiển thị <span className="font-medium text-slate-800">{start}</span>-<span className="font-medium text-slate-800">{end}</span> / <span className="font-medium text-slate-800">{total || 0}</span> dòng
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size} / trang</option>)}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center text-sm">
          {currentPage} / {safeTotalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
