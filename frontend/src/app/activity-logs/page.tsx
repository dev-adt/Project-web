'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  Calendar,
  Search,
  User,
  Shield,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';

interface LogEntry {
  id: string;
  userId: string | null;
  action: string;
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  } | null;
}

export default function ActivityLogsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchAction, setSearchAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLogs = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build Query params
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });
      if (searchAction) queryParams.append('action', searchAction);
      if (selectedUser) queryParams.append('userId', selectedUser);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const res = await fetch(`${API_URL}/activity-logs?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Bạn không có quyền truy cập nhật ký hoạt động này. Vui lòng đăng nhập quyền Admin.');
        }
        throw new Error(`Yêu cầu thất bại với mã lỗi ${res.status}`);
      }

      const json = await res.json();
      // Response model: { logs: [], total: number, page: number, limit: number, totalPages: number }
      if (json.success && json.data) {
        const payload = json.data;
        setLogs(payload.logs || []);
        setTotal(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
      } else {
        setLogs(json.logs || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setSearchAction('');
    setSelectedUser('');
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchLogs(1), 0);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-zinc-400 text-sm font-medium tracking-wide">Đang tải nhật ký hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] min-h-screen flex flex-col selection:bg-violet-500 selection:text-white pb-16">
      {/* Header Banner */}
      <header className="border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all shadow-md active:scale-95"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold tracking-wider uppercase border border-violet-500/20">
                  Audit logs
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-1">Nhật Ký Hoạt Động Hệ Thống</h1>
            </div>
          </div>
          <button
            onClick={() => fetchLogs(page, true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-750 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-violet-400' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/60 text-rose-300 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="font-semibold block sm:inline mr-1">Lỗi truy xuất:</span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => fetchLogs(1)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-850 text-rose-100 text-xs font-bold transition-all shadow-md"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Filters Panel */}
        <section className="rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Thao tác (Action)</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Ví dụ: login, page, block"
                  value={searchAction}
                  onChange={(e) => setSearchAction(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Từ Ngày (Start Date)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Đến Ngày (End Date)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="lg:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 active:scale-98 transition-all"
              >
                <span>Tìm kiếm</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/35 text-zinc-450 hover:text-zinc-200 hover:border-zinc-700 transition-all text-xs font-bold"
              >
                Xóa lọc
              </button>
            </div>
          </form>
        </section>

        {/* Logs Table */}
        <section className="rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-violet-400" />
              <span>Nhật ký Kiểm toán (Tổng: {total} bản ghi)</span>
            </h3>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-550 space-y-3">
              <Terminal className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium">Không tìm thấy bản ghi hoạt động nào phù hợp.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-zinc-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-450 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Thời gian</th>
                      <th className="px-4 py-3">Người vận hành</th>
                      <th className="px-4 py-3">Hành động</th>
                      <th className="px-4 py-3">Chi tiết thay đổi</th>
                      <th className="px-4 py-3">Địa chỉ IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/70">
                    {logs.map((log) => {
                      const userDisplay = log.user 
                        ? `${log.user.fullName} (${log.user.email})` 
                        : 'Hệ thống / Guest';
                      
                      let actionColor = 'bg-zinc-900 text-zinc-400 border-zinc-800';
                      if (log.action.includes('login') || log.action.includes('auth')) {
                        actionColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      } else if (log.action.includes('delete')) {
                        actionColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                      } else if (log.action.includes('create') || log.action.includes('add')) {
                        actionColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      } else if (log.action.includes('update') || log.action.includes('edit')) {
                        actionColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      }

                      return (
                        <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-zinc-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 font-medium">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-zinc-600" />
                              {userDisplay}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${actionColor}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 max-w-[320px] truncate" title={log.details}>
                            {log.details}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-zinc-500">
                            {log.ipAddress || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
                  <span>Hiển thị {logs.length} / {total} bản ghi</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => fetchLogs(page - 1)}
                      className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-zinc-400">Trang {page} / {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => fetchLogs(page + 1)}
                      className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
