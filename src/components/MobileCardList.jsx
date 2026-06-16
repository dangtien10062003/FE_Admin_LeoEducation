import React from 'react';

export const MobileCardList = ({ items, emptyMessage, renderItem }) => {
  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {items.length > 0 ? (
        items.map((item, index) => {
          const itemKey = [
            item.id,
            item.courseId,
            item.subjectId,
            item.registrationId,
            item.contactId,
            item.instructorId,
            item.testimonialId,
          ].filter(Boolean).join('-') || 'item';

          return (
            <div key={`${itemKey}-${index}`} className="p-4 text-sm">
              {renderItem(item, index)}
            </div>
          );
        })
      ) : (
        <div className="px-5 py-12 text-center text-sm text-slate-400">{emptyMessage}</div>
      )}
    </div>
  );
};

export const MobileField = ({ label, children }) => (
  <div className="grid grid-cols-[96px_1fr] gap-3 py-1.5 text-sm">
    <span className="text-slate-500">{label}</span>
    <div className="min-w-0 text-right text-slate-600">{children}</div>
  </div>
);

export const MobileActions = ({ children }) => (
  <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
    {children}
  </div>
);
