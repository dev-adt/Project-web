'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Settings, 
  Sparkles, 
  Eye, 
  Database,
  Globe,
  Check
} from 'lucide-react';
import FormDesigner, { FormField } from '@/components/forms/FormDesigner';
import FormRenderer from '@/components/forms/FormRenderer';
import SubmissionsDashboard from '@/components/forms/SubmissionsDashboard';

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string;
  settingsJson?: any;
  fields: FormField[];
}

export default function FormWorkspacePage({ params }: { params: Promise<{ formId: string }> }) {
  const router = useRouter();
  const { formId } = use(params);

  // Core loading states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'designer' | 'renderer' | 'submissions'>('designer');
  const [form, setForm] = useState<Form | null>(null);

  // Settings & update states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsTotal, setSubmissionsTotal] = useState(0);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch form configuration
  useEffect(() => {
    async function loadForm() {
      if (!formId || formId === 'new') {
        // Initialize an empty form template for creation
        setForm({
          id: 'new',
          name: 'Biểu mẫu chưa đặt tên',
          slug: 'bieu-mau-moi',
          description: 'Mô tả biểu mẫu của bạn',
          fields: [],
          settingsJson: { submitText: 'Gửi liên hệ', successMessage: 'Cảm ơn bạn đã liên hệ!' }
        });
        setName('Biểu mẫu chưa đặt tên');
        setSlug('bieu-mau-moi');
        setDescription('Mô tả biểu mẫu của bạn');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
        const res = await fetch(`${API_URL}/forms/${formId}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          const f: Form = json.data;
          setForm(f);
          setName(f.name);
          setSlug(f.slug);
          setDescription(f.description || '');
        } else {
          showToast(json.message || 'Lỗi tải biểu mẫu.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi kết nối máy chủ.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId]);

  // Load submissions dynamically upon tab activation
  useEffect(() => {
    if (activeTab === 'submissions' && form && form.id !== 'new') {
      loadSubmissionsData(submissionsPage);
    }
  }, [activeTab, form, submissionsPage]);

  const loadSubmissionsData = async (targetPage: number) => {
    if (!form) return;
    try {
      setLoadingSubmissions(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/submissions/form/${form.id}?page=${targetPage}&limit=10`);
      const json = await res.json();

      if (json.success && json.data) {
        setSubmissions(json.data.submissions || []);
        setSubmissionsTotal(json.data.total || 0);
        setSubmissionsPage(json.data.page || 1);
        setSubmissionsTotalPages(json.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách phản hồi.', 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Handle saving fields layout
  const handleSaveFields = async (updatedFields: FormField[], updatedSettings: any) => {
    if (!form) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      
      // 1. Create form first if new template
      let currentFormId = form.id;
      if (currentFormId === 'new') {
        const createRes = await fetch(`${API_URL}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            slug,
            description,
            settingsJson: updatedSettings
          })
        });
        const createJson = await createRes.json();
        if (createJson.success && createJson.data?.id) {
          currentFormId = createJson.data.id;
          router.push(`/forms/${currentFormId}`);
        } else {
          showToast(createJson.message || 'Lỗi khởi tạo biểu mẫu.', 'error');
          return;
        }
      }

      // 2. Overwrite and sync fields array layout
      const res = await fetch(`${API_URL}/forms/${currentFormId}/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: updatedFields })
      });
      const json = await res.json();

      // 3. Save standard settings parameters
      await fetch(`${API_URL}/forms/${currentFormId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          settingsJson: updatedSettings
        })
      });

      if (json.success) {
        showToast('Đã đồng bộ và lưu cấu hình thiết kế thành công!');
        setForm(json.data);
      } else {
        showToast(json.message || 'Lỗi lưu các trường nhập liệu.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Xảy ra lỗi kết nối.', 'error');
    }
  };

  if (loading || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-medium">Đang khởi tạo không gian thiết kế...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Toast Notification */}
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

      {/* Top Workspace Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 truncate max-w-[280px]">
              {name || 'Biểu mẫu chưa đặt tên'}
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Trình dựng thiết kế biểu mẫu tương thích Elementor</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 p-1 bg-zinc-900/40 border border-zinc-850 rounded-xl">
          <button
            onClick={() => setActiveTab('designer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'designer'
                ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Thiết kế bộ khung
          </button>
          <button
            onClick={() => setActiveTab('renderer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'renderer'
                ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            Trực quan xem thử
          </button>
          {form.id !== 'new' && (
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'submissions'
                  ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Database className="w-4 h-4" />
              Lượt phản hồi
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-[1600px] mx-auto p-6 lg:p-8">
        
        {activeTab === 'designer' && (
          <div className="space-y-6">
            
            {/* Form metadata panel */}
            <div className="p-6 border border-zinc-900 bg-zinc-950/40 backdrop-blur-md rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                <Settings className="w-4.5 h-4.5 text-zinc-400" />
                <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Thuộc tính khuôn mẫu</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tên biểu mẫu</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (form.id === 'new') {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="Nhập tên biểu mẫu..."
                    className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Đường dẫn tĩnh (Slug)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="kebab-case-slug"
                    className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Mô tả tóm tắt</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả công dụng..."
                    className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Custom designer workspace element */}
            <FormDesigner 
              fields={form.fields} 
              onSave={handleSaveFields} 
              formSettings={form.settingsJson} 
            />
          </div>
        )}

        {activeTab === 'renderer' && (
          <div className="max-w-xl mx-auto py-8">
            <FormRenderer form={form} />
          </div>
        )}

        {activeTab === 'submissions' && form.id !== 'new' && (
          <div>
            {loadingSubmissions ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs">Đang truy xuất phản hồi...</p>
              </div>
            ) : (
              <SubmissionsDashboard
                formId={form.id}
                submissions={submissions}
                fields={form.fields}
                total={submissionsTotal}
                page={submissionsPage}
                totalPages={submissionsTotalPages}
                onPageChange={setSubmissionsPage}
              />
            )}
          </div>
        )}

      </main>

    </div>
  );
}
