'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Download,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileSpreadsheet,
  FileText,
  User,
  Activity,
  Globe
} from 'lucide-react';

interface FormField {
  id: string;
  fieldType: string;
  label: string;
  placeholder: string | null;
  required: boolean;
}

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  _count?: {
    submissions: number;
  };
}

interface Submission {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  submittedAt: string;
  values: Record<string, string>;
}

export default function FormsDashboard() {
  const router = useRouter();

  // Auth checks
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Forms listing
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  // Submissions state
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionFields, setSubmissionFields] = useState<FormField[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotal, setSubTotal] = useState(0);

  // Form creation DTO values
  const [newFormName, setNewFormName] = useState('');
  const [newFormSlug, setNewFormSlug] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth Guard
  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (!localToken) {
      router.push('/');
    } else {
      setToken(localToken);
      setIsAuthorized(true);
    }
  }, [router]);

  // Load Forms List
  const fetchForms = async () => {
    if (!token) return;
    try {
      setLoadingForms(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/forms?page=1&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        // Envelope: { success: true, data: { forms: [...] } }
        setForms(json.success ? json.data.forms : json.forms || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể nạp danh sách biểu mẫu.', 'error');
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && token) {
      fetchForms();
    }
  }, [isAuthorized, token]);

  // Load Submissions
  const fetchSubmissions = async (formId: string, pageNum: number) => {
    if (!token) return;
    try {
      setLoadingSubmissions(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/submissions/form/${formId}?page=${pageNum}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.success ? json.data : json;
        setSubmissions(data.submissions || []);
        setSubmissionFields(data.fields || []);
        setSubTotalPages(data.totalPages || 1);
        setSubTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi nạp phản hồi biểu mẫu.', 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSelectForm = (form: FormTemplate) => {
    setSelectedForm(form);
    setSubPage(1);
    fetchSubmissions(form.id, 1);
  };

  const handleSubPageChange = (pageNum: number) => {
    if (!selectedForm) return;
    setSubPage(pageNum);
    fetchSubmissions(selectedForm.id, pageNum);
  };

  // Form Template CRUD
  const handleNameChange = (val: string) => {
    setNewFormName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setNewFormSlug(generatedSlug);
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim() || !newFormSlug.trim() || !token) return;

    try {
      setIsCreatingForm(true);
      setCreateError('');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFormName,
          slug: newFormSlug,
          description: newFormDesc
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Tạo biểu mẫu thành công.');
        setIsCreateModalOpen(false);
        setNewFormName('');
        setNewFormSlug('');
        setNewFormDesc('');
        fetchForms();
        // Redirect to form elements editor
        const createdForm = data.data;
        router.push(`/forms/${createdForm.id}`);
      } else {
        setCreateError(data.message || 'Lỗi khởi tạo biểu mẫu.');
      }
    } catch (err) {
      setCreateError('Lỗi kết nối máy chủ.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleDeleteForm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !confirm('Bạn chắc chắn muốn xóa biểu mẫu này và toàn bộ phản hồi liên quan?')) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/forms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showToast('Đã xóa biểu mẫu thành công.');
        if (selectedForm?.id === id) {
          setSelectedForm(null);
          setSubmissions([]);
        }
        fetchForms();
      } else {
        showToast(data.message || 'Lỗi xóa biểu mẫu.', 'error');
      }
    } catch (err) {
      showToast('Lỗi mạng khi xóa.', 'error');
    }
  };

  // Secure CSV Blob Downloader
  const handleExportCSV = async (formId: string, slug: string) => {
    if (!token) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/submissions/form/${formId}/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}-submissions.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast('Tải dữ liệu CSV thành công.');
      } else {
        showToast('Không thể xuất tệp CSV.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải tệp tin.', 'error');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Toast */}
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

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Quản lý Biểu mẫu & Form</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Xây dựng biểu mẫu tùy biến Elementor và xem danh sách phản hồi dữ liệu khách hàng</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-300 transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tạo Form mới
        </button>
      </header>

      {/* Main Layout Grid */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
        
        {/* Left Column: Forms List (col-span-4) */}
        <section className="lg:col-span-4 space-y-6">
          <div className="p-4 border border-zinc-900 rounded-2xl bg-zinc-950/40 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-900 pb-2">
              Danh sách Biểu mẫu hiện tại
            </h3>

            {loadingForms ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                <p className="text-xs text-zinc-500">Đang tải biểu mẫu...</p>
              </div>
            ) : forms.length > 0 ? (
              <div className="space-y-3">
                {forms.map((form) => {
                  const isActive = selectedForm?.id === form.id;
                  return (
                    <div
                      key={form.id}
                      onClick={() => handleSelectForm(form)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-left relative group ${
                        isActive
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-zinc-900/30 border-zinc-905 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start pr-12">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{form.name}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono font-medium block mt-1">/{form.slug}</span>
                        </div>
                      </div>
                      
                      {/* Form Details Metrics */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-900/40 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-zinc-650" />
                          Phản hồi: {form._count?.submissions || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-650" />
                          {new Date(form.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      {/* Hover Controls */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/forms/${form.id}`);
                          }}
                          title="Cấu hình trường"
                          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteForm(form.id, e)}
                          title="Xóa form"
                          className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-450 hover:text-rose-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">Chưa có biểu mẫu nào được tạo.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Submissions Explorer (col-span-8) */}
        <section className="lg:col-span-8">
          {selectedForm ? (
            <div className="p-6 border border-zinc-900 rounded-2xl bg-zinc-950/40 backdrop-blur-sm space-y-6">
              
              {/* Explorer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                    <span>Phản hồi: {selectedForm.name}</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Đường dẫn nhận request: /api/v1/submissions/slug/{selectedForm.slug}/submit</p>
                </div>
                
                <button
                  onClick={() => handleExportCSV(selectedForm.id, selectedForm.slug)}
                  className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all font-semibold text-sm self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  Xuất dữ liệu CSV
                </button>
              </div>

              {/* Submissions Table Render */}
              {loadingSubmissions ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                  <p className="text-zinc-500 text-sm">Đang nạp phản hồi biểu mẫu...</p>
                </div>
              ) : submissions.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-450 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Thời gian</th>
                          <th className="px-4 py-3">IP Address</th>
                          {submissionFields.map((field) => (
                            <th key={field.id} className="px-4 py-3">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-zinc-900/10">
                            <td className="px-4 py-3.5 text-zinc-400 font-medium">
                              {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-3.5 text-zinc-500 font-mono">
                              {sub.ipAddress || '-'}
                            </td>
                            {submissionFields.map((field) => (
                              <td key={field.id} className="px-4 py-3.5 text-zinc-200">
                                {sub.values[field.id] || sub.values[field.label] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  {subTotalPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
                      <span>Hiển thị 10 / {subTotal} phản hồi</span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={subPage === 1}
                          onClick={() => handleSubPageChange(subPage - 1)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 disabled:opacity-30 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-zinc-400">Trang {subPage} / {subTotalPages}</span>
                        <button
                          disabled={subPage === subTotalPages}
                          onClick={() => handleSubPageChange(subPage + 1)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 disabled:opacity-30 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  <FileText className="w-12 h-12 mx-auto opacity-35 mb-3" />
                  <p className="text-sm">Chưa nhận được lượt gửi phản hồi nào từ biểu mẫu này.</p>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[300px] border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-zinc-950/10">
              <FileSpreadsheet className="w-12 h-12 text-zinc-700 opacity-50 mb-3" />
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Submissions Explorer</h3>
              <p className="text-xs text-zinc-600 mt-2 max-w-xs leading-relaxed">
                Chọn bất kỳ biểu mẫu nào ở danh sách bên trái để truy xuất và khám phá danh sách lượt gửi thông tin.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#09090b] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">Khởi tạo Biểu mẫu mới</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleCreateForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Tên biểu mẫu
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Form Tư vấn Sức khỏe"
                  value={newFormName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Đường dẫn thu thập (Slug)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: form-tu-van-suc-khoe"
                  value={newFormSlug}
                  onChange={(e) => setNewFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  Mô tả ngắn
                </label>
                <textarea
                  placeholder="Form dùng cho việc thu thập thông tin đăng ký..."
                  value={newFormDesc}
                  onChange={(e) => setNewFormDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors min-h-[80px]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingForm}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-500/10"
                >
                  {isCreatingForm ? (
                    <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Khởi tạo Form</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
