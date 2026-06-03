'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Globe,
  Folder,
  Tag as TagIcon,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  FileText
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string; // draft, review, published, archived
  publishedAt: string | null;
  createdAt: string;
  categories: { category: Category }[] | Category[]; // depending on join structure
  tags: { tag: Tag }[] | Tag[];
}

export default function BlogDashboard() {
  const router = useRouter();
  
  // Auth state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Listing state
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // CRUD overlays/states
  const [newCatName, setNewCatName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Auth Guard and token check
  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (!localToken) {
      router.push('/');
    } else {
      setToken(localToken);
      setIsAuthorized(true);
    }
  }, [router]);

  // 2. Fetch data (posts, categories, tags)
  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const headers = { 'Authorization': `Bearer ${token}` };

      // Build query string
      const queries = [];
      queries.push(`page=${page}`);
      queries.push(`limit=10`);
      if (search) queries.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) queries.push(`status=${statusFilter}`);
      if (categoryFilter) queries.push(`categoryId=${categoryFilter}`);
      if (tagFilter) queries.push(`tagId=${tagFilter}`);
      
      const postsRes = await fetch(`${API_URL}/posts?${queries.join('&')}`, { headers });
      const postsJson = await postsRes.json();
      if (postsJson.success && postsJson.data) {
        setPosts(postsJson.data.posts || []);
        setTotalPages(postsJson.data.totalPages || 1);
        setTotalPosts(postsJson.data.total || 0);
      }

      // Categories and tags are public GET but we pass headers just in case
      const catRes = await fetch(`${API_URL}/categories`, { headers });
      const catJson = await catRes.json();
      if (catJson.success && catJson.data) {
        setCategories(catJson.data.categories || []);
      }

      const tagRes = await fetch(`${API_URL}/tags`, { headers });
      const tagJson = await tagRes.json();
      if (tagJson.success && tagJson.data) {
        setTags(tagJson.data.tags || []);
      }

    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ khi nạp dữ liệu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && token) {
      fetchData();
    }
  }, [isAuthorized, token, page, search, statusFilter, categoryFilter, tagFilter]);

  // 3. Category CRUD
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !token) return;

    try {
      setIsCreatingCat(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const slug = newCatName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, slug })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Tạo chuyên mục thành công.');
        setNewCatName('');
        // Refresh categories
        fetchData();
      } else {
        showToast(data.message || 'Lỗi tạo chuyên mục.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối mạng.', 'error');
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token || !confirm('Bạn chắc chắn muốn xóa chuyên mục này?')) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showToast('Đã xóa chuyên mục.');
        fetchData();
      } else {
        showToast(data.message || 'Không thể xóa chuyên mục.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối.', 'error');
    }
  };

  // 4. Tag CRUD
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !token) return;

    try {
      setIsCreatingTag(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const slug = newTagName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const res = await fetch(`${API_URL}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTagName, slug })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Tạo thẻ tag thành công.');
        setNewTagName('');
        fetchData();
      } else {
        showToast(data.message || 'Lỗi tạo tag.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối mạng.', 'error');
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!token || !confirm('Bạn chắc chắn muốn xóa thẻ tag này?')) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/tags/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showToast('Đã xóa thẻ tag.');
        fetchData();
      } else {
        showToast(data.message || 'Không thể xóa thẻ tag.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối.', 'error');
    }
  };

  // 5. Post Actions (Publish / Delete)
  const handlePublishPost = async (id: string) => {
    if (!token) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/posts/${id}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Xuất bản bài viết thành công.');
        fetchData();
      } else {
        showToast(data.message || 'Lỗi xuất bản bài viết.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối mạng.', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!token || !confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showToast('Đã xóa bài viết thành công.');
        fetchData();
      } else {
        showToast(data.message || 'Lỗi xóa bài viết.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối mạng.', 'error');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Đang kiểm tra quyền truy cập...</p>
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
            <h1 className="text-lg font-bold text-zinc-100">Quản lý Bài viết & Blog</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Viết bài mới, phân loại chuyên mục và tối ưu hóa SEO bài đăng</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/blog/edit/new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-300 transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Viết bài mới
        </button>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
        
        {/* Left column: Posts table (col-span-8 or 9) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề bài viết..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-zinc-900/40 border border-zinc-850 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-zinc-900/40 border border-zinc-850 rounded-xl px-3 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Trạng thái (Tất cả)</option>
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="bg-zinc-900/40 border border-zinc-850 rounded-xl px-3 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500 max-w-[160px]"
              >
                <option value="">Chuyên mục (Tất cả)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Posts List */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-zinc-500 text-sm">Đang tải danh sách bài viết...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Bài viết</th>
                      <th className="px-6 py-4">Chuyên mục / Thẻ</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4">Ngày tạo</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {posts.map((post) => {
                      // Extract categories
                      const cats = Array.isArray(post.categories) 
                        ? post.categories.map((c: any) => c.category?.name || c.name || '')
                        : [];
                      
                      // Extract tags
                      const tgs = Array.isArray(post.tags)
                        ? post.tags.map((t: any) => t.tag?.name || t.name || '')
                        : [];

                      return (
                        <tr key={post.id} className="hover:bg-zinc-900/10 transition-colors group">
                          <td className="px-6 py-5">
                            <div>
                              <div className="font-bold text-zinc-100 hover:text-indigo-400 transition-colors cursor-pointer text-sm" onClick={() => router.push(`/blog/edit/${post.id}`)}>
                                {post.title}
                              </div>
                              <div className="text-xs text-zinc-500 font-mono mt-1 font-semibold truncate max-w-[260px]">
                                /{post.slug}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1.5">
                              {cats.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {cats.map((c, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                                      <Folder className="w-2.5 h-2.5" />
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {tgs.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {tgs.map((t, i) => (
                                    <span key={i} className="text-[10px] font-semibold text-zinc-500">
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {cats.length === 0 && tgs.length === 0 && (
                                <span className="text-xs text-zinc-650">Chưa gắn phân loại</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              post.status === 'published'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-850'
                                : 'bg-amber-950/60 text-amber-400 border-amber-850'
                            }`}>
                              <div className={`w-1.2 h-1.2 rounded-full ${post.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                              {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs text-zinc-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              {post.status !== 'published' && (
                                <button
                                  onClick={() => handlePublishPost(post.id)}
                                  title="Xuất bản ngay"
                                  className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/60 hover:text-emerald-200 transition-all"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => router.push(`/blog/edit/${post.id}`)}
                                title="Chỉnh sửa bài viết"
                                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                title="Xóa bài viết"
                                className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/60 hover:bg-rose-900/60 hover:text-rose-200 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Không tìm thấy bài viết nào phù hợp.</p>
              </div>
            )}

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/10 border-t border-zinc-900">
                <span className="text-xs text-zinc-500 font-medium">
                  Hiển thị bài viết {(page - 1) * 10 + 1} - {Math.min(page * 10, totalPosts)} trên tổng số {totalPosts}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-xs text-zinc-400 font-bold px-3 py-1">
                    Trang {page} / {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Categories & Tags Management (col-span-4) */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Categories card */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4.5 h-4.5 text-indigo-400" />
                <h2 className="font-bold text-sm uppercase text-zinc-200 tracking-wider">Chuyên mục</h2>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                {categories.length}
              </span>
            </div>

            {/* Quick add category */}
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Tên chuyên mục..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isCreatingCat || !newCatName.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
              >
                {isCreatingCat ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {/* Categories list */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-900/50 bg-zinc-900/20 hover:border-zinc-800 transition-all group">
                    <div>
                      <div className="text-xs font-bold text-zinc-300">{cat.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono font-medium">/{cat.slug}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-4">Chưa có chuyên mục nào.</p>
              )}
            </div>
          </div>

          {/* Tags card */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <TagIcon className="w-4.5 h-4.5 text-indigo-400" />
                <h2 className="font-bold text-sm uppercase text-zinc-200 tracking-wider">Thẻ Tags</h2>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                {tags.length}
              </span>
            </div>

            {/* Quick add tag */}
            <form onSubmit={handleCreateTag} className="flex gap-2">
              <input
                type="text"
                placeholder="Tên thẻ tag mới..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isCreatingTag || !newTagName.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
              >
                {isCreatingTag ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {/* Tags list */}
            <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-900 bg-zinc-900/20 hover:border-zinc-805 transition-all text-xs font-semibold text-zinc-400 group">
                    <span>#{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-zinc-650 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-4 w-full">Chưa có thẻ tag nào.</p>
              )}
            </div>
          </div>

        </aside>

      </main>
    </div>
  );
}
