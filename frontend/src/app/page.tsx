'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Database,
  Cpu,
  Server,
  Workflow,
  Flame,
  CheckCircle,
  HelpCircle,
  Lock,
  Unlock,
  LogOut,
  LogIn,
  Plus,
  ChevronRight,
  User,
  Shield,
  FileText,
  Trash2,
  HardDrive,
  BarChart2,
  Puzzle,
  Globe,
  Settings,
  BookOpen,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'active' | 'loading' | 'error';
  port: string;
  description: string;
  icon: React.ComponentType<any>;
  details: string;
}

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  userRoles: Array<{ role: { name: string } }>;
}

export default function Home() {
  const router = useRouter();
  
  // Platform Status
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'checking' | 'error'>('checking');
  const [dbConnection, setDbConnection] = useState<'up' | 'down' | 'loading'>('loading');

  // Auth Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Pages Hub State
  const [pages, setPages] = useState<PageItem[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Modals Toggle State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Login Form Values
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Create Page Form Values
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/v1/templates', {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.success ? data.data.templates : data.templates;
        setTemplates(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Check backend integration status
  const checkHealth = async () => {
    try {
      const response = await fetch('/api/v1/health');
      if (response.ok) {
        const data = await response.json();
        // Envelope: { success: true, data: { status: 'ok', services: { database: 'up' } } }
        if (data.success && data.data.status === 'ok') {
          setHealthStatus('healthy');
          setDbConnection('up');
          return;
        }
      }
      setHealthStatus('error');
      setDbConnection('down');
    } catch (err) {
      setHealthStatus('error');
      setDbConnection('down');
    }
  };

  // Fetch active user profile details
  const fetchProfileAndData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
    if (!token) {
      setIsLoggedIn(false);
      setUserProfile(null);
      setPages([]);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: getHeaders(),
      });
      if (res.ok) {
        const profileData = await res.json();
        // Envelope check
        const profile = profileData.success ? profileData.data : profileData;
        setUserProfile(profile);
        setIsLoggedIn(true);
        
        // Fetch pages list
        fetchPages();
        fetchTemplates();
      } else {
        // Token stale or invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Fetch created landing pages
  const fetchPages = async () => {
    try {
      setPagesLoading(true);
      const res = await fetch('/api/v1/pages', {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.success ? data.data : data;
        setPages(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchProfileAndData();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      setIsSubmittingLogin(false);

      if (res.ok) {
        const payload = data.success ? data.data : data;
        localStorage.setItem('token', payload.accessToken);
        if (payload.refreshToken) {
          localStorage.setItem('refreshToken', payload.refreshToken);
        }
        setIsLoginOpen(false);
        fetchProfileAndData();
      } else {
        setLoginError(data.message || 'Mật khẩu hoặc tài khoản không đúng.');
      }
    } catch (err) {
      setIsSubmittingLogin(false);
      setLoginError('Không thể kết nối đến máy chủ.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserProfile(null);
    setPages([]);
  };

  const handleCreatePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!pageTitle.trim()) {
      setCreateError('Vui lòng nhập tiêu đề trang.');
      return;
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(pageSlug)) {
      setCreateError('Slug chỉ chứa chữ thường, số và ký tự gạch nối (kebab-case).');
      return;
    }

    try {
      setIsCreatingPage(true);
      const url = selectedTemplateId
        ? `/api/v1/templates/${selectedTemplateId}/create-page`
        : '/api/v1/pages';

      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: pageTitle, slug: pageSlug }),
      });

      const data = await res.json();
      setIsCreatingPage(false);

      if (res.ok) {
        const createdPage = data.success ? data.data : data;
        setIsCreateOpen(false);
        setPageTitle('');
        setPageSlug('');
        setSelectedTemplateId('');
        // Redirect directly into the visual page builder editor
        router.push(`/builder/${createdPage.id}`);
      } else {
        setCreateError(data.message || 'Không thể tạo trang. Slug có thể đã bị trùng.');
      }
    } catch (err) {
      setIsCreatingPage(false);
      setCreateError('Lỗi kết nối khi tạo trang.');
    }
  };

  // Helper auto-slug generator
  const handleTitleChange = (val: string) => {
    setPageTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accent marks
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .trim()
      .replace(/\s+/g, '-'); // replace spaces with hyphens
    setPageSlug(generatedSlug);
  };

  const services: ServiceStatus[] = [
    {
      name: 'Nginx Gateway',
      status: 'active',
      port: '80',
      description: 'Reverse proxy and gateway manager forwarding all public routes.',
      icon: Workflow,
      details: 'Gzip compression enabled. Exposes NextJS (/), NestJS (/api/v1), and Swagger documentation (/swagger).',
    },
    {
      name: 'NextJS Frontend',
      status: 'active',
      port: '3000',
      description: 'Dynamic UI application with tailwind routing, server components and zustand.',
      icon: Layers,
      details: 'NextJS 15.0+ and React 19 architecture with TailwindCSS standard theme modules.',
    },
    {
      name: 'NestJS Backend',
      status: healthStatus === 'healthy' ? 'active' : healthStatus === 'error' ? 'error' : 'loading',
      port: '4000',
      description: 'Modular modular architecture utilizing standard exception filter & response wrappers.',
      icon: Cpu,
      details: 'Modular backend incorporating NestJS Config, Prisma, and Swagger configurations.',
    },
    {
      name: 'PostgreSQL Database',
      status: dbConnection === 'up' ? 'active' : dbConnection === 'down' ? 'error' : 'loading',
      port: '5432',
      description: 'Relational data model persisted using Docker volumes.',
      icon: Database,
      details: 'Connected via Prisma ORM. Auto-migration setups configured for table schemas.',
    },
    {
      name: 'Redis Cache',
      status: 'active',
      port: '6379',
      description: 'Key-value memory layer used for caching, queues, and rate-limiting.',
      icon: Flame,
      details: 'Integrated seamlessly inside the multi-container docker compose configuration.',
    },
    {
      name: 'MinIO Object Storage',
      status: 'active',
      port: '9000 / 9001',
      description: 'Local S3-compatible cloud storage holding media assets.',
      icon: Server,
      details: 'Auto-initialization bucket service mounts 4 default paths: media, uploads, exports, backups.',
    },
  ];

  const adminRoles = userProfile?.userRoles?.map((ur) => ur.role.name) || [];
  const userDisplayRole = adminRoles.includes('ADMIN') ? 'System Admin' : adminRoles.includes('EDITOR') ? 'Editor' : 'User';

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-violet-500 selection:text-white min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#09090b]/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">HealthAlliance</h1>
              <p className="text-[10px] text-zinc-500 font-mono">PLATFORM ENGINE v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${healthStatus === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${healthStatus === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-xs font-semibold text-zinc-300">
                {healthStatus === 'healthy' ? 'All services online' : 'Platform Initializing'}
              </span>
            </div>

            {/* Auth Session Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 border-l border-zinc-800 pl-6">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-850 border border-zinc-700 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold leading-none">{userProfile?.fullName}</p>
                    <p className="text-[9px] text-violet-400 font-semibold font-mono leading-none mt-1 uppercase">{userDisplayRole}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                  title="Logout Session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-all active:scale-95 shadow"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Đăng nhập Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full grid gap-12">
        {/* Banner Section */}
        <section className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent_40%)]" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <CheckCircle className="h-3 w-3" /> System Integration Active
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
              Headless CMS & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
                Visual Landing Page Builder
              </span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8 leading-relaxed">
              Hệ thống SaaS quản lý Landing Page thương mại hoàn chỉnh. Cho phép tự do biên tập, kéo thả thiết kế, quản lý tài nguyên lưu trữ đám mây S3, phân tích lưu lượng chuyển đổi và nạp plugins dịch vụ.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/swagger"
                target="_blank"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-750 text-white transition-all shadow-lg shadow-violet-500/20"
              >
                Inspect OpenAPI Docs
              </a>
              <a
                href="/health"
                target="_blank"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-all"
              >
                View Health API
              </a>
            </div>
          </div>
        </section>

        {/* Dashboard Tools Hub */}
        <section className="grid gap-8 lg:grid-cols-3">
          
          {/* Landing Pages List Hub */}
          <div className="lg:col-span-2 border border-zinc-800 bg-zinc-950 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-violet-400" />
                    Danh sách Landing Pages
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Quản lý và kích hoạt giao diện kéo thả thiết kế</p>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo trang mới</span>
                  </button>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-zinc-900/20">
                  <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Yêu cầu đăng nhập</h4>
                  <p className="text-xs text-zinc-600 mt-2 max-w-xs leading-relaxed">
                    Bạn cần đăng nhập tài khoản quản trị để hiển thị danh sách trang và khởi động Visual Builder.
                  </p>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 transition-colors"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              ) : pagesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <span className="h-6 w-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500">Đang tải danh sách trang...</p>
                </div>
              ) : pages.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-zinc-900/20">
                  <p className="text-2xl mb-2">📄</p>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Chưa có trang nào</h4>
                  <p className="text-xs text-zinc-600 mt-1">Nhấp vào nút phía trên để tạo trang landing page đầu tiên.</p>
                </div>
              ) : (
                <div className="border border-zinc-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/30 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                        <th className="px-4 py-3">Tên Trang</th>
                        <th className="px-4 py-3">Slug (Đường dẫn)</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {pages.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-zinc-200">{p.title}</td>
                          <td className="px-4 py-3.5 text-zinc-500 font-mono">/{p.slug}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            }`}>
                              {p.status === 'published' ? 'Đã chạy' : 'Bản nháp'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => router.push(`/builder/${p.id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                            >
                              <span>Thiết kế</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="border-t border-zinc-900 pt-4 mt-6 flex justify-between items-center text-[10px] text-zinc-500">
              <span>Đã kết nối cơ sở dữ liệu Postgres</span>
              <span>Tổng số: {pages.length} trang</span>
            </div>
          </div>

          {/* Quick Action Navigation Panels */}
          <div className="space-y-6">
            <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Shield className="h-4.5 w-4.5 text-violet-400" />
                Phân hệ Quản trị
              </h3>
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                Truy cập các trung tâm quản lý tài nguyên và kết nối dịch vụ mở rộng bên thứ ba.
              </p>

              <div className="grid gap-3">
                {/* Media Link */}
                <button
                  onClick={() => router.push('/media')}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-850 text-zinc-400 group-hover:text-violet-400 transition-colors">
                      <HardDrive className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white">Thư viện Media</h4>
                      <p className="text-[10px] text-zinc-500">Quản lý tệp tin MinIO S3</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </button>

                {/* Plugins Link */}
                <button
                  onClick={() => router.push('/plugins')}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-850 text-zinc-400 group-hover:text-violet-400 transition-colors">
                      <Puzzle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white">Kho Tiện ích (Plugins)</h4>
                      <p className="text-[10px] text-zinc-500">AI Assistant, CRM, Email</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </button>

                {/* SEO Link */}
                <button
                  onClick={() => router.push('/seo')}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-850 text-zinc-400 group-hover:text-violet-400 transition-colors">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white">Cấu hình SEO</h4>
                      <p className="text-[10px] text-zinc-500">Sitemap, Robots, Meta tags</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </button>

                {/* Analytics Link */}
                <button
                  onClick={() => router.push('/analytics')}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-850 text-zinc-400 group-hover:text-violet-400 transition-colors">
                      <BarChart2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white">Báo cáo Analytics</h4>
                      <p className="text-[10px] text-zinc-500">Biểu mẫu và phễu chuyển đổi</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </button>

                {/* Blog Link */}
                <button
                  onClick={() => router.push('/blog')}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-850 text-zinc-400 group-hover:text-violet-400 transition-colors">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white">Hệ thống Blog</h4>
                      <p className="text-[10px] text-zinc-500">Quản lý bài viết, chuyên mục, tags</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Status Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const IconComponent = svc.icon;
            return (
              <div
                key={svc.name}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between transition-all hover:border-zinc-700 group hover:-translate-y-1 duration-300 shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-violet-400 group-hover:bg-violet-500/5 transition-all border border-zinc-800 group-hover:border-violet-500/10">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        svc.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : svc.status === 'loading'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {svc.status === 'active' ? 'Online' : svc.status === 'loading' ? 'Verifying' : 'Offline'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mb-3">INTERNAL PORT: {svc.port}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{svc.description}</p>
                </div>
                <div className="mt-auto border-t border-zinc-900 pt-4 text-xs text-zinc-500 italic leading-snug">
                  {svc.details}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#09090b] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">Đăng nhập Admin Portal</h3>
              </div>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
              >
                Đóng
              </button>
            </div>

            {loginError && (
              <div className="bg-rose-950/20 border border-rose-900 rounded-xl p-3 text-xs text-rose-400">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Tài khoản Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-500/10"
                >
                  {isSubmittingLogin ? (
                    <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                  <span>Đăng nhập</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#09090b] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">Khởi tạo Landing Page mới</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
              >
                Đóng
              </button>
            </div>

            {createError && (
              <div className="bg-rose-950/20 border border-rose-900 rounded-xl p-3 text-xs text-rose-400">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreatePageSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Tiêu đề trang
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trang Chủ Chiến Dịch"
                  value={pageTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: trang-chu-chien-dich"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  required
                />
                <span className="text-[10px] text-zinc-500 block leading-tight mt-1">
                  Đường dẫn URL công khai sẽ có dạng: http://adtweb.edunow.today/{pageSlug || 'slug'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Mẫu Giao Diện (Template)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">Trang trống (Blank Page)</option>
                  {templates.map((temp) => (
                    <option key={temp.id} value={temp.id}>
                      {temp.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-500 block leading-tight mt-1">
                  Chọn một mẫu để khởi tạo nhanh cấu trúc các Section mẫu.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingPage}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-500/10"
                >
                  {isCreatingPage ? (
                    <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Bắt đầu thiết kế</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-6 bg-zinc-950 text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © 2026 HealthAlliance Platform. Designed for commercial-scale landing page creation.
          </p>
          <div className="flex gap-6 text-xs font-medium">
            <span className="text-zinc-400">Phase 1: Foundation</span>
            <span className="text-zinc-400">Phase 2: Auth & RBAC</span>
            <span className="text-zinc-400">Phase 3: CMS & Builder Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
