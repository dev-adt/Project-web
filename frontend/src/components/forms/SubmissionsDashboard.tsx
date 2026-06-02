'use client';

import { 
  Download, 
  Calendar, 
  Monitor, 
  MapPin, 
  HelpCircle,
  Database
} from 'lucide-react';
import { FormField } from './FormDesigner';

interface Submission {
  id: string;
  ipAddress: string;
  userAgent: string;
  submittedAt: string;
  values: Record<string, string>;
}

interface SubmissionsDashboardProps {
  formId: string;
  submissions: Submission[];
  fields: FormField[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SubmissionsDashboard({
  formId,
  submissions,
  fields,
  total,
  page,
  totalPages,
  onPageChange,
}: SubmissionsDashboardProps) {

  const handleExport = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
    // Trigger download by opening export attachment in a new browser context
    window.open(`${API_URL}/submissions/form/${formId}/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/10 border border-zinc-900/60 p-4.5 rounded-2xl backdrop-blur-md">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tổng quan thông số</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-indigo-400">{total}</span>
            <span className="text-xs text-zinc-400 font-semibold">lượt phản hồi biểu mẫu</span>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={submissions.length === 0}
          className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100 text-xs font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:hover:bg-zinc-900 shadow-md"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          Xuất dữ liệu (.CSV)
        </button>
      </div>

      {/* Main Submissions dynamic grid */}
      <div className="border border-zinc-900 bg-zinc-950/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-4 select-none min-w-[160px]">Thời gian gửi</th>
                <th className="p-4 select-none min-w-[120px]">Địa chỉ IP</th>
                <th className="p-4 select-none min-w-[180px]">Thiết bị / Agent</th>
                
                {/* Dynamically build field headers matching custom form fields */}
                {fields.map((field) => (
                  <th key={field.id} className="p-4 select-none min-w-[150px]">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-semibold text-zinc-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {sub.ipAddress || 'Unknown'}
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-zinc-400" title={sub.userAgent}>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span className="truncate">{sub.userAgent || 'Unknown'}</span>
                      </div>
                    </td>

                    {/* Render matching values inside table rows dynamic columns */}
                    {fields.map((field) => {
                      // Match value using ID or field Label
                      const val = sub.values[field.id || ''] || sub.values[field.label] || '';
                      return (
                        <td key={field.id} className="p-4 truncate max-w-[220px]" title={val}>
                          {val ? (
                            <span className="font-medium text-zinc-200">{val}</span>
                          ) : (
                            <span className="text-zinc-650 font-mono italic">null</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3 + fields.length} className="p-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Database className="w-8 h-8 opacity-30 text-zinc-400" />
                      <p className="text-xs">Chưa nhận được phản hồi dữ liệu nào cho biểu mẫu này.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4.5 bg-zinc-900/10 border-t border-zinc-900 text-xs">
            <span className="text-zinc-400">
              Trang <strong className="text-zinc-200 font-semibold">{page}</strong> trên <strong className="text-zinc-200 font-semibold">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-zinc-800 transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-zinc-800 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
