'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, 
  Settings, 
  Sparkles, 
  ArrowLeft,
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  AlertCircle,
  Code
} from 'lucide-react';

interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow?: string[];
}

export default function SeoDashboardPage() {
  const router = useRouter();

  // Loading & tab states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots' | 'schema'>('sitemap');

  // Sitemap state
  const [sitemapLinks, setSitemapLinks] = useState<Array<{ url: string; lastmod: string }>>([]);
  
  // Robots state
  const [robotsRules, setRobotsRules] = useState<RobotsRule[]>([]);
  const [robotsSitemap, setRobotsSitemap] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleUnauthorized = (status: number) => {
    if (status === 401 || status === 403) {
      alert('Vui lòng đăng nhập bằng quyền Admin hoặc Editor để thực hiện thao tác này.');
      router.push('/');
    }
  };

  // Load SEO details
  useEffect(() => {
    async function loadSeoData() {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

        // 1. Fetch Sitemap Lists
        const sitemapRes = await fetch(`${API_URL}/seo/sitemap`, {
          headers: getHeaders(),
        });
        if (sitemapRes.status === 401 || sitemapRes.status === 403) {
          handleUnauthorized(sitemapRes.status);
          return;
        }
        const sitemapJson = await sitemapRes.json();
        if (sitemapJson.success && sitemapJson.data) {
          setSitemapLinks(sitemapJson.data.links || []);
        }

        // 2. Fetch Robots configurations
        const robotsRes = await fetch(`${API_URL}/seo/robots`, {
          headers: getHeaders(),
        });
        const robotsJson = await robotsRes.json();
        if (robotsJson.success && robotsJson.data) {
          setRobotsRules(robotsJson.data.rules || []);
          setRobotsSitemap(robotsJson.data.sitemap || '');
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi truy xuất cấu hình SEO từ máy chủ.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadSeoData();
  }, []);

  // Handle saving Robots rules
  const handleSaveRobots = async () => {
    try {
      setSaving(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

      const res = await fetch(`${API_URL}/seo/robots`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          rules: robotsRules,
          sitemap: robotsSitemap
        })
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized(res.status);
        return;
      }

      const json = await res.json();
      if (json.success) {
        showToast('Đã cập nhật quy tắc Robots.txt thành công!');
        setRobotsRules(json.data.rules || []);
        setRobotsSitemap(json.data.sitemap || '');
      } else {
        showToast(json.message || 'Lỗi cập nhật cấu hình.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Đã xảy ra lỗi kết nối.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addRobotsRule = () => {
    const newRule: RobotsRule = {
      userAgent: '*',
      disallow: ['/admin', '/api/v1/auth'],
      allow: ['/']
    };
    setRobotsRules([...robotsRules, newRule]);
  };

  const removeRobotsRule = (index: number) => {
    setRobotsRules(robotsRules.filter((_, i) => i !== index));
  };

  const updateRuleUserAgent = (index: number, val: string) => {
    const updated = [...robotsRules];
    updated[index].userAgent = val;
    setRobotsRules(updated);
  };

  const updateRuleDisallows = (index: number, val: string) => {
    const updated = [...robotsRules];
    updated[index].disallow = val.split(',').map((p) => p.trim()).filter(Boolean);
    setRobotsRules(updated);
  };

  const updateRuleAllows = (index: number, val: string) => {
    const updated = [...robotsRules];
    updated[index].allow = val.split(',').map((p) => p.trim()).filter(Boolean);
    setRobotsRules(updated);
  };

  // Compile virtual robots.txt text output
  const compileVirtualRobotsTxt = (): string => {
    const lines: string[] = [];
    robotsRules.forEach((rule) => {
      lines.push(`User-agent: ${rule.userAgent}`);
      rule.disallow.forEach((path) => lines.push(`Disallow: ${path}`));
      rule.allow?.forEach((path) => lines.push(`Allow: ${path}`));
      lines.push(''); // spacing row
    });
    if (robotsSitemap) {
      lines.push(`Sitemap: ${robotsSitemap}`);
    }
    return lines.join('\n');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-medium">Đang tải không gian quản trị SEO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Toast alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-2xl animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/80 border-rose-800 text-rose-300'
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Workspace Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Bảng điều khiển SEO Manager</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Hệ thống tối ưu hóa định mục chỉ số Sitemap & Robots.txt</p>
          </div>
        </div>

        {/* Dynamic Tab selections */}
        <div className="flex gap-1 p-1 bg-zinc-900/40 border border-zinc-850 rounded-xl">
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'sitemap'
                ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Sơ đồ Sitemap.xml
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'robots'
                ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Quy tắc Robots.txt
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'schema'
                ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Schema JSON-LD
          </button>
        </div>
      </header>

      {/* Main dashboard frame */}
      <main className="max-w-[1600px] mx-auto p-6 lg:p-8">
        
        {/* Sitemap Tab */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/10 border border-zinc-900/60 p-4.5 rounded-2xl backdrop-blur-md">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Trạng thái tệp sitemap.xml</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-indigo-400">{sitemapLinks.length}</span>
                  <span className="text-xs text-zinc-400 font-semibold">đường dẫn được lập chỉ mục động</span>
                </div>
              </div>
              
              <button
                onClick={() => window.open('/sitemap.xml', '_blank')}
                className="flex items-center gap-2 px-5 py-3 border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 text-xs font-bold rounded-xl transition-all duration-200"
              >
                <Search className="w-4 h-4 text-indigo-400" />
                Mở tệp Live Sitemap
              </button>
            </div>

            {/* Sitemap Grid list links */}
            <div className="border border-zinc-900 bg-zinc-950/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="p-4 select-none">Đường dẫn tích hợp (URL)</th>
                      <th className="p-4 select-none min-w-[200px]">Cập nhật lần cuối (Lastmod)</th>
                      <th className="p-4 select-none min-w-[120px]">Tần suất quét</th>
                      <th className="p-4 select-none min-w-[100px]">Mức ưu tiên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                    {sitemapLinks.length > 0 ? (
                      sitemapLinks.map((link, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-4 font-mono font-semibold text-zinc-200 truncate max-w-[400px]">
                            {link.url}
                          </td>
                          <td className="p-4 text-zinc-400">
                            {new Date(link.lastmod).toLocaleString('vi-VN')}
                          </td>
                          <td className="p-4 font-semibold text-emerald-400">weekly</td>
                          <td className="p-4 font-semibold text-indigo-400">
                            {link.url.endsWith('/') ? '1.0' : '0.8'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-zinc-500">
                          Chưa có chỉ mục sitemap nào được tổng hợp từ API.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Robots.txt Tab */}
        {activeTab === 'robots' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Robots editor */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 border border-zinc-900 bg-zinc-950/40 backdrop-blur-md rounded-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4.5 h-4.5 text-zinc-400" />
                    <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Cấu hình Robots Rules</h3>
                  </div>
                  <button
                    onClick={addRobotsRule}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 text-[11px] font-bold transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm bộ quy tắc
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5 uppercase">Đường dẫn Sơ đồ chính (Sitemap Link)</label>
                    <input
                      type="text"
                      value={robotsSitemap}
                      onChange={(e) => setRobotsSitemap(e.target.value)}
                      className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                    {robotsRules.map((rule, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-3 relative group">
                        
                        <button
                          onClick={() => removeRobotsRule(idx)}
                          className="absolute top-3 right-3 p-1.5 rounded bg-zinc-850 hover:bg-rose-950/30 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                          <div>
                            <label className="block text-[10px] text-zinc-500 font-bold mb-1 uppercase">User-Agent</label>
                            <input
                              type="text"
                              value={rule.userAgent}
                              onChange={(e) => updateRuleUserAgent(idx, e.target.value)}
                              className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-zinc-500 font-bold mb-1 uppercase">Chặn quét (Disallow - phân cách bởi dấu phẩy)</label>
                            <input
                              type="text"
                              value={rule.disallow.join(', ')}
                              onChange={(e) => updateRuleDisallows(idx, e.target.value)}
                              className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-250 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-500 font-bold mb-1 uppercase">Cho phép quét (Allow - phân cách bởi dấu phẩy)</label>
                          <input
                            type="text"
                            value={rule.allow?.join(', ') || ''}
                            onChange={(e) => updateRuleAllows(idx, e.target.value)}
                            className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-250 focus:outline-none font-mono"
                            placeholder="/"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    onClick={handleSaveRobots}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition-all duration-300 disabled:opacity-40 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu cấu hình Robots.txt
                  </button>
                </div>
              </div>
            </div>

            {/* Virtual file robots.txt live preview output */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Xem trước Robots.txt đầu ra</h3>
              </div>
              
              <div className="p-6 border border-zinc-900 bg-zinc-950 rounded-2xl shadow-xl min-h-[350px]">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">http://localhost/robots.txt</span>
                  <button 
                    onClick={() => window.open('/robots.txt', '_blank')}
                    className="text-[10px] font-bold text-indigo-400 hover:underline"
                  >
                    Xem Live File
                  </button>
                </div>
                
                <pre className="font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-indigo-500/40">
                  {compileVirtualRobotsTxt()}
                </pre>
              </div>
            </div>

          </div>
        )}

        {/* Schema JSON-LD Tab */}
        {activeTab === 'schema' && (
          <div className="space-y-6">
            <div className="p-6 border border-zinc-900 bg-zinc-950/40 backdrop-blur-md rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                <Code className="w-4.5 h-4.5 text-zinc-400" />
                <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Cấu trúc dữ liệu có cấu trúc (Schema Markup JSON-LD)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                  <p>
                    Structured Data (Dữ liệu cấu trúc) giúp các công cụ tìm kiếm hiểu rõ hơn về ngữ nghĩa và các đối tượng thực tế trên trang web của bạn (Sản phẩm, Bài viết, Đánh giá, Tổ chức, Người dùng, Địa điểm kinh doanh LocalBusiness,...).
                  </p>
                  <p>
                    Hệ thống tự động biên dịch và bơm cấu trúc mã **JSON-LD** này dưới dạng thẻ script gắn trực tiếp vào mã nguồn HTML phía máy chủ (SSR), tối ưu điểm số SEO và tạo các Rich Snippets hiển thị nổi bật trên Google.
                  </p>
                  
                  <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                      <AlertCircle className="w-4 h-4 text-indigo-400" />
                      Mẹo tối ưu Schema:
                    </div>
                    <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1.5 leading-relaxed">
                      <li>Bật biểu mẫu tự động Schema khi lưu thiết kế trang hoặc blog.</li>
                      <li>Khai báo canonicalURL khớp với địa chỉ xuất bản thực tế.</li>
                      <li>Hình ảnh OG Image cấu hình đầy đủ kích thước tối ưu mạng xã hội.</li>
                    </ul>
                  </div>
                </div>

                {/* Example of Organization / Website Schema JSON format */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Cấu trúc khuôn mẫu JSON-LD tiêu chuẩn</span>
                  <div className="p-5 border border-zinc-900 bg-zinc-950 rounded-2xl shadow-xl">
                    <pre className="font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto selection:bg-emerald-500/20">
{`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Landing Platform",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
