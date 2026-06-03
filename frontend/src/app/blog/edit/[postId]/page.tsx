'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Eye, 
  Settings, 
  Search, 
  Share2, 
  Check, 
  Folder, 
  Tag as TagIcon,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import TiptapEditor from '@/components/blog/TiptapEditor';

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
  content: string;
  featuredImage: string;
  status: string;
  categories: Category[];
  tags: Tag[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

export default function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const router = useRouter();
  const { postId } = use(params);

  // Core State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');

  // Blog Fields State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // SEO Fields State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImage, setOgImage] = useState('');

  // Registry Options
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch registers and post data
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        // 1. Fetch Categories
        const catRes = await fetch(`${API_URL}/categories`, { headers });
        const catJson = await catRes.json();
        if (catJson.success && catJson.data) {
          setCategories(catJson.data.categories || []);
        }

        // 2. Fetch Tags
        const tagRes = await fetch(`${API_URL}/tags`, { headers });
        const tagJson = await tagRes.json();
        if (tagJson.success && tagJson.data) {
          setTags(tagJson.data.tags || []);
        }

        // 3. Fetch Post Details (If not creating new)
        if (postId && postId !== 'new') {
          const postRes = await fetch(`${API_URL}/posts/${postId}`, { headers });
          const postJson = await postRes.json();
          if (postJson.success && postJson.data) {
            const p: Post = postJson.data;
            setTitle(p.title || '');
            setSlug(p.slug || '');
            setExcerpt(p.excerpt || '');
            setContent(p.content || '');
            setFeaturedImage(p.featuredImage || '');
            setStatus(p.status || 'draft');
            setSelectedCategories(p.categories?.map((c) => c.id) || []);
            setSelectedTags(p.tags?.map((t) => t.id) || []);

            // SEO Metadata
            if (p.seo) {
              setMetaTitle(p.seo.metaTitle || '');
              setMetaDescription(p.seo.metaDescription || '');
              setOgImage(p.seo.ogImage || '');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load blog workspace data:', err);
        showToast('Không thể kết nối đến máy chủ hệ thống.', 'error');
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, [postId]);

  // Handle Save
  const handleSave = async (isPublishing = false) => {
    try {
      if (isPublishing) setPublishing(true);
      else setSaving(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const payload = {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status: isPublishing ? 'published' : status,
        categoryIds: selectedCategories,
        tagIds: selectedTags,
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          ogImage: ogImage || featuredImage,
        },
      };

      let res;
      if (postId === 'new') {
        res = await fetch(`${API_URL}/posts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/posts/${postId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(isPublishing ? 'Bài viết đã được xuất bản thành công!' : 'Đã lưu cấu hình bài viết thành công.');
        if (isPublishing) setStatus('published');
        if (postId === 'new' && json.data?.id) {
          router.push(`/blog/edit/${json.data.id}`);
        }
      } else {
        showToast(json.message || 'Lỗi lưu thông tin bài viết.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Đã xảy ra lỗi kết nối.', 'error');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-medium">Đang tải không gian soạn thảo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Toast */}
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

      {/* Header Workspace */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-100 truncate max-w-[280px]">
                {title || 'Bài viết chưa đặt tên'}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                status === 'published' 
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-850' 
                  : 'bg-amber-950/60 text-amber-400 border-amber-850'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Không gian thiết kế Blog & SEO</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900/80 disabled:opacity-40 transition-all duration-200 font-semibold text-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu bản nháp
          </button>
          
          <button
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 disabled:opacity-40 transition-all duration-300 transform active:scale-[0.98]"
          >
            {publishing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Globe className="w-4 h-4" />
            )}
            Xuất bản bài viết
          </button>
        </div>
      </header>

      {/* Workspace Content */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
        
        {/* Left Side: Editor & Article Properties */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-zinc-900/40 border border-zinc-850 rounded-xl max-w-max">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'content'
                  ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Nội dung chính
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-zinc-850 text-indigo-400 shadow-md border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Thuộc tính & SEO
            </button>
          </div>

          {activeTab === 'content' ? (
            <div className="space-y-6">
              {/* Meta Inputs Header */}
              <div className="space-y-4 p-6 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Tiêu đề bài viết</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      // Auto slug generation if not edited
                      if (postId === 'new') {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="Nhập tiêu đề ấn tượng..."
                    className="w-full bg-zinc-900/50 border border-zinc-850 rounded-xl px-4.5 py-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="kebab-case-slug"
                      className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Đường dẫn Banner đại diện</label>
                    <input
                      type="text"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="uploads/featured-banner.jpg"
                      className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Tóm tắt ngắn (Excerpt)</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Mô tả tóm tắt ngắn gọn nội dung của bài viết trong 1-2 câu..."
                    className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm min-h-[80px]"
                  />
                </div>
              </div>

              {/* Tiptap Block Editor */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trình biên tập nội dung</label>
                <TiptapEditor content={content} onChange={setContent} />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sidebar content expanded in Main view for better user experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Categories Inspector */}
                <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Folder className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-bold text-zinc-200 text-sm tracking-wide uppercase">Chuyên mục</h3>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                    {categories.length > 0 ? (
                      categories.map((cat) => {
                        const active = selectedCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                              active
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                                : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-805'
                            }`}
                          >
                            <span className="text-sm font-semibold">{cat.name}</span>
                            {active && <Check className="w-4 h-4 text-indigo-400" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-500">Chưa có chuyên mục được định nghĩa.</p>
                    )}
                  </div>
                </div>

                {/* Tags Inspector */}
                <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TagIcon className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-bold text-zinc-200 text-sm tracking-wide uppercase">Nhãn bài viết</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => {
                        const active = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                              active
                                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                                : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-805'
                            }`}
                          >
                            #{tag.name}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-500">Chưa có thẻ nhãn được định nghĩa.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* SEO metadata inspector */}
              <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-zinc-200 text-sm tracking-wide uppercase">Tùy biến SEO Metadata</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title || "SEO Meta Title (Mặc định lấy tiêu đề bài viết)"}
                      className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={excerpt || "SEO Meta Description (Mặc định lấy phần tóm tắt ngắn)"}
                      className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors text-sm min-h-[90px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">OG Image URL</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder={featuredImage || "Đường dẫn hình ảnh đại diện mạng xã hội"}
                      className="w-full bg-zinc-900/30 border border-zinc-850 rounded-xl px-4 py-2.5 text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </section>

        {/* Right Side: Collapsible SEO & Sharing Card Previews */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Header Preview */}
          <div className="flex items-center gap-2 p-2 border-b border-zinc-900">
            <Eye className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Xem trước hiển thị (Live Preview)</h3>
          </div>

          {/* Google Search Result Preview Card */}
          <div className="p-5 border border-zinc-900 bg-zinc-950/50 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 font-semibold tracking-wider uppercase">Google Search Card</span>
            </div>
            
            <div className="space-y-1 mt-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-zinc-400 font-bold border border-zinc-800">
                  G
                </div>
                <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[240px]">
                  http://localhost/blog/{slug || 'post-slug'}
                </span>
              </div>
              
              <h4 className="text-indigo-400 font-medium text-base hover:underline leading-snug truncate max-w-full">
                {metaTitle || title || 'Tiêu đề hiển thị kết quả tìm kiếm'}
              </h4>
              
              <p className="text-xs text-zinc-400 leading-normal line-clamp-2">
                {metaDescription || excerpt || 'Hãy điền thông tin tóm tắt bài viết hoặc mô tả meta để xem trước dòng hiển thị kết quả tìm kiếm của bạn trực tiếp tại đây...'}
              </p>
            </div>
          </div>

          {/* Facebook/Meta Social Share Card Preview */}
          <div className="p-5 border border-zinc-900 bg-zinc-950/50 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Share2 className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 font-semibold tracking-wider uppercase">Facebook Card Preview</span>
            </div>

            <div className="border border-zinc-850 rounded-xl overflow-hidden mt-3 shadow-lg bg-zinc-900/20">
              <div className="aspect-video w-full bg-zinc-900 flex items-center justify-center text-zinc-700 relative overflow-hidden border-b border-zinc-850">
                {ogImage || featuredImage ? (
                  <img 
                    src={ogImage || featuredImage} 
                    alt="Social Share" 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-40 text-zinc-500" />
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Không có hình ảnh</span>
                  </div>
                )}
              </div>
              <div className="p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">LOCALHOST</span>
                <h5 className="font-bold text-zinc-200 text-sm leading-tight line-clamp-1">
                  {metaTitle || title || 'Tiêu đề thẻ OG bài viết'}
                </h5>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {metaDescription || excerpt || 'Phần mô tả ngắn gọn chi tiết cấu hình OG meta tags.'}
                </p>
              </div>
            </div>
          </div>

        </aside>

      </main>
    </div>
  );
}
