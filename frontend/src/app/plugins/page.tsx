'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Puzzle,
  Settings,
  Power,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bot,
  Workflow,
  Mail,
  Sparkles,
  Sliders
} from 'lucide-react';

interface PluginField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  required?: boolean;
}

interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  fields: PluginField[];
}

export default function PluginsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Configuration Modal State
  const [activePlugin, setActivePlugin] = useState<Plugin | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

      // Attach local auth token if present
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/plugins`, { method: 'GET', headers });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const json = await res.json();
      // Handle wrapped envelope or direct array
      if (json.success && Array.isArray(json.data)) {
        setPlugins(json.data);
      } else if (Array.isArray(json)) {
        setPlugins(json);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể đồng bộ danh sách plugin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleToggleEnable = async (plugin: Plugin) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const endpoint = plugin.enabled ? 'disable' : 'enable';
      const res = await fetch(`${API_URL}/plugins/${plugin.id}/${endpoint}`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) throw new Error('Toggle request failed');

      showToast(`Đã ${plugin.enabled ? 'vô hiệu hóa' : 'kích hoạt'} plugin ${plugin.name} thành công.`);
      
      // Update local state
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, enabled: !p.enabled } : p))
      );
    } catch (err) {
      console.error(err);
      showToast('Thao tác kích hoạt plugin thất bại.', 'error');
    }
  };

  const handleOpenConfig = async (plugin: Plugin) => {
    try {
      setActivePlugin(plugin);
      setSettingsLoading(true);
      setSettingsValues({});

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/plugins/${plugin.id}/settings`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) throw new Error('Failed to load plugin settings');

      const data = await res.json();
      const loadedValues: Record<string, string> = {};
      
      // Populate defaults or loaded values
      plugin.fields.forEach((field) => {
        loadedValues[field.key] = data[field.key] ?? field.defaultValue ?? '';
      });

      setSettingsValues(loadedValues);
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải cấu hình cài đặt của plugin.', 'error');
      setActivePlugin(null);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlugin) return;

    try {
      setSavingSettings(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/plugins/${activePlugin.id}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ settings: settingsValues }),
      });

      if (!res.ok) throw new Error('Save settings failed');

      showToast(`Đã lưu cấu hình plugin ${activePlugin.name} thành công!`);
      setActivePlugin(null);
    } catch (err) {
      console.error(err);
      showToast('Không thể lưu cấu hình plugin.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettingsValues((prev) => ({ ...prev, [key]: value }));
  };

  // Helper mapping icon component by slug name
  const getPluginIcon = (slug: string) => {
    switch (slug) {
      case 'dify':
        return <Bot className="w-6 h-6 text-violet-400" />;
      case 'crm':
        return <Workflow className="w-6 h-6 text-emerald-400" />;
      case 'email':
        return <Mail className="w-6 h-6 text-blue-400" />;
      default:
        return <Puzzle className="w-6 h-6 text-zinc-400" />;
    }
  };

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] min-h-screen flex flex-col selection:bg-violet-500 selection:text-white pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-900 text-emerald-350 backdrop-blur-md'
            : 'bg-rose-950/40 border-rose-900 text-rose-350 backdrop-blur-md'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
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
              <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold tracking-wider uppercase border border-violet-500/20">
                Core Extension
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-1">Kho Tiện Ích & Plugins</h1>
            </div>
          </div>
          <button
            onClick={fetchPlugins}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-750 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới danh sách</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
        {/* Banner Section */}
        <section className="relative rounded-2xl overflow-hidden border border-zinc-850 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.05),transparent_40%)]" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-5">
              <Sparkles className="h-3 w-3" /> Plugin Marketplace v1.0
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 text-white leading-tight">
              Tích Hợp Tiện Ích Thông Minh
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Mở rộng sức mạnh cho Landing Page của bạn bằng cách dễ dàng kích hoạt các kết nối bên thứ ba như hệ thống chatbot Dify AI, HubSpot CRM, Mailchimp marketing và đồng bộ dữ liệu chỉ trong vài bước đơn giản.
            </p>
          </div>
        </section>

        {/* Dynamic Plugin Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-zinc-500 text-xs font-medium">Đang tải danh sách plugin...</p>
          </div>
        ) : plugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-850 rounded-2xl bg-zinc-950/20 text-zinc-500 space-y-3">
            <Puzzle className="w-12 h-12 opacity-30" />
            <p className="text-sm font-semibold">Chưa tìm thấy plugin nào được đăng ký trong hệ thống.</p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className="relative rounded-2xl border border-zinc-850 bg-zinc-950 p-6 flex flex-col justify-between hover:border-zinc-750 group hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:scale-105 transition-transform duration-300">
                      {getPluginIcon(plugin.slug)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                        v{plugin.version}
                      </span>
                      <button
                        onClick={() => handleToggleEnable(plugin)}
                        className={`p-2 rounded-lg border transition-all active:scale-95 ${
                          plugin.enabled
                            ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title={plugin.enabled ? 'Vô hiệu hóa extension' : 'Kích hoạt extension'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                    {plugin.name}
                  </h3>
                  <p className="text-xs text-zinc-450 leading-relaxed mb-6">
                    {plugin.description}
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-4 mt-auto flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    plugin.enabled 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${plugin.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-650'}`} />
                    {plugin.enabled ? 'Đã kích hoạt' : 'Đang tắt'}
                  </span>
                  
                  <button
                    onClick={() => handleOpenConfig(plugin)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95 shadow-md"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Cấu hình</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Configuration Modal */}
        {activePlugin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#09090b] p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-violet-400" />
                  <h3 className="text-base font-bold text-white">Cấu Hình Cài Đặt - {activePlugin.name}</h3>
                </div>
                <button
                  onClick={() => setActivePlugin(null)}
                  className="text-zinc-550 hover:text-white transition-colors text-sm font-semibold"
                >
                  Đóng
                </button>
              </div>

              {settingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  <p className="text-zinc-500 text-xs">Đang tải cấu hình cài đặt...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  {activePlugin.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
                        {field.label}
                        {field.required && <span className="text-violet-400 ml-1">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={settingsValues[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                          required={field.required}
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt} className="bg-zinc-950">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'password' ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={settingsValues[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors"
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-zinc-850 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePlugin(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                      {savingSettings ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Lưu cấu hình</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
