'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Eye, 
  ArrowLeft, 
  Users, 
  PieChart, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  Loader2,
  MousePointerClick,
  FileText
} from 'lucide-react';

interface DailyStat {
  date: string;
  views: number;
  leads: number;
}

interface TopPage {
  title: string;
  slug: string;
  count: number;
}

interface AnalyticsOverview {
  totalViews: number;
  totalLeads: number;
  conversionRate: number;
  topPages: TopPage[];
  trafficSources: Record<string, number>;
  dailyStats: DailyStat[];
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setErrorMsg(null);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      
      // Retrieve auth token from localStorage if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/analytics/overview`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Bạn không có quyền truy cập dữ liệu phân tích này. Vui lòng đăng nhập.');
        }
        throw new Error(`Yêu cầu thất bại với mã lỗi ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setData(json); // Fallback if response isn't wrapped in standard envelope
      }
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-zinc-400 text-sm font-medium tracking-wide">Đang tải báo cáo phân tích...</p>
      </div>
    );
  }

  // Fallback defaults if API fails or yields empty
  const totalViews = data?.totalViews ?? 0;
  const totalLeads = data?.totalLeads ?? 0;
  const conversionRate = data?.conversionRate ?? 0;
  const topPages = data?.topPages ?? [];
  const trafficSources = data?.trafficSources ?? {};
  const dailyStats = data?.dailyStats ?? [];

  // Calculate sum of traffic source values to get percentages
  const totalSourceCount = Object.values(trafficSources).reduce((a, b) => a + b, 0) || 1;

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
                  Analytics Control
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-1">Bảng Điều Khiển Phân Tích</h1>
            </div>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
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
              <span className="font-semibold block sm:inline mr-1">Lỗi tải dữ liệu:</span>
              <span>{errorMsg}</span>
            </div>
            <button 
              onClick={() => fetchAnalytics()}
              className="px-3.5 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-850 text-rose-100 text-xs font-bold transition-all shadow-md"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* 1. KPIs Summary Metrics */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Page Views */}
          <div className="relative rounded-2xl border border-zinc-850 bg-gradient-to-br from-zinc-900/40 via-zinc-950 to-zinc-900/40 p-6 shadow-xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.06),transparent_50%)]" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/15 group-hover:scale-105 transition-transform duration-300">
                <Eye className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                +12%
              </span>
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Lượt Xem Trang (Views)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{totalViews.toLocaleString('vi-VN')}</h2>
              <span className="text-xs text-zinc-500 font-mono">lượt xem</span>
            </div>
            <p className="text-xs text-zinc-550 mt-4 border-t border-zinc-900 pt-3 leading-relaxed">
              Tổng lượng truy cập của toàn bộ các trang landing page được ghi nhận trực tiếp.
            </p>
          </div>

          {/* Card 2: Leads Log */}
          <div className="relative rounded-2xl border border-zinc-850 bg-gradient-to-br from-zinc-900/40 via-zinc-950 to-zinc-900/40 p-6 shadow-xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_50%)]" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/15 group-hover:scale-105 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                +8.4%
              </span>
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Khách Hàng Tiềm Năng (Leads)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{totalLeads.toLocaleString('vi-VN')}</h2>
              <span className="text-xs text-zinc-500 font-mono">biểu mẫu</span>
            </div>
            <p className="text-xs text-zinc-550 mt-4 border-t border-zinc-900 pt-3 leading-relaxed">
              Số lượng dữ liệu được nộp về thông qua Form Builder từ các khách hàng liên hệ.
            </p>
          </div>

          {/* Card 3: Conversion Ratio */}
          <div className="relative rounded-2xl border border-zinc-850 bg-gradient-to-br from-zinc-900/40 via-zinc-950 to-zinc-900/40 p-6 shadow-xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/15 group-hover:scale-105 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Mục tiêu: 5%
              </span>
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Tỷ Lệ Chuyển Đổi (CR)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{conversionRate}%</h2>
              <span className="text-xs text-zinc-550 font-mono">leads / views</span>
            </div>
            <p className="text-xs text-zinc-550 mt-4 border-t border-zinc-900 pt-3 leading-relaxed">
              Tỷ lệ phần trăm lượt xem trang dẫn đến hoạt động gửi biểu mẫu thông tin liên hệ.
            </p>
          </div>
        </section>

        {/* 2. Visual Graphs and Lists */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Top Pages Board - 7 columns */}
          <section className="lg:col-span-7 rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-4">
                <MousePointerClick className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Xếp Hạng Trang Được Xem Nhiều Nhất</h3>
              </div>

              {topPages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500 space-y-2">
                  <FileText className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-medium">Chưa ghi nhận hoạt động xem trang nào.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {topPages.map((page, index) => {
                    // Maximum count to scale the bar lengths relatively
                    const maxCount = Math.max(...topPages.map(p => p.count), 1);
                    const pctWidth = (page.count / maxCount) * 100;

                    return (
                      <div key={index} className="space-y-1.5 group">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-zinc-550 w-5">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <span className="font-semibold text-zinc-200 group-hover:text-violet-300 transition-colors">
                                {page.title}
                              </span>
                              <span className="block text-[11px] font-mono text-zinc-550 mt-0.5">
                                slug: /{page.slug === 'unknown' ? 'ẩn_danh' : page.slug}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-zinc-300 font-mono text-xs">{page.count} lượt xem</span>
                        </div>
                        {/* Custom progress visual bar */}
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full group-hover:from-violet-500 group-hover:to-indigo-400 transition-all duration-500" 
                            style={{ width: `${pctWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-zinc-900 pt-4 flex items-center justify-between text-xs text-zinc-500">
              <span>Được tính theo dữ liệu lịch sử</span>
              <span>Tổng số: {topPages.length} trang có hoạt động</span>
            </div>
          </section>

          {/* Traffic Sources - 5 columns */}
          <section className="lg:col-span-5 rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-4">
                <PieChart className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Nguồn Lưu Lượng Truy Cập</h3>
              </div>

              {Object.keys(trafficSources).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500 space-y-2">
                  <PieChart className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-medium">Chưa thu thập đủ dữ liệu nguồn.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(trafficSources).map(([sourceName, count], index) => {
                    const pct = Number(((count / totalSourceCount) * 100).toFixed(1));
                    
                    // Assign harmonized unique palette classes per source index
                    const colors = [
                      { text: 'text-violet-400', bar: 'bg-violet-500' },
                      { text: 'text-emerald-400', bar: 'bg-emerald-500' },
                      { text: 'text-blue-400', bar: 'bg-blue-500' },
                      { text: 'text-amber-400', bar: 'bg-amber-500' }
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={sourceName} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300">{sourceName}</span>
                          <span className={`font-bold font-mono ${color.text}`}>{pct}% ({count})</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-zinc-900 pt-4 text-xs text-zinc-500 italic">
              Nhận diện và phân loại dựa trên HTTP Referer Header trong phiên truy cập của người dùng.
            </div>
          </section>
        </div>

        {/* 3. Daily Analytics Log - 7 Days History Table */}
        <section className="rounded-2xl border border-zinc-850 bg-zinc-950 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-4">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Nhật Ký Phân Tích 7 Ngày Gần Nhất</h3>
          </div>

          {dailyStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 space-y-2">
              <Calendar className="w-10 h-10 opacity-40" />
              <p className="text-sm font-medium">Không tìm thấy bản ghi thống kê theo ngày nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-855 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Lượt Xem (Views)</th>
                    <th className="py-3 px-4">Khách Liên Hệ (Leads)</th>
                    <th className="py-3 px-4 text-right">Tỷ Lệ Chuyển Đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-sm">
                  {dailyStats.map((stat, idx) => {
                    const dailyCr = stat.views > 0 ? Number(((stat.leads / stat.views) * 100).toFixed(1)) : 0;
                    
                    return (
                      <tr key={idx} className="hover:bg-zinc-900/20 transition-colors group">
                        <td className="py-3.5 px-4 font-semibold text-zinc-300 font-mono group-hover:text-white">
                          {stat.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-200 font-bold">{stat.views}</span>
                            <div className="hidden sm:flex h-1 bg-zinc-900 rounded-full w-24 overflow-hidden">
                              <div 
                                className="h-full bg-violet-600 rounded-full" 
                                style={{ width: `${Math.min(stat.views, 100)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-200 font-bold">{stat.leads}</span>
                            <div className="hidden sm:flex h-1 bg-zinc-900 rounded-full w-24 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.min(stat.leads * 10, 100)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                            dailyCr > 10 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : dailyCr > 0 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-zinc-900 text-zinc-550'
                          }`}>
                            {dailyCr}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
