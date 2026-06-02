'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  GitCompare, 
  Plus, 
  X, 
  Calendar, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface PageVersion {
  id: string;
  versionNumber: number;
  changeNote?: string;
  createdAt: string;
}

interface VersionHistoryPanelProps {
  pageId: string;
  onClose: () => void;
  onRestore: (versionId: string) => Promise<void>;
  onCompare: (versionId: string) => void;
  activeCompareId: string | null;
}

export default function VersionHistoryPanel({
  pageId,
  onClose,
  onRestore,
  onCompare,
  activeCompareId,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [changeNote, setChangeNote] = useState('');
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    loadVersionHistory();
  }, [pageId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/pages/${pageId}/versions`);
      const json = await res.json();
      if (json.success) {
        setVersions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load version logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeNote.trim()) return;

    try {
      setCreatingSnapshot(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/pages/${pageId}/versions/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeNote })
      });
      const json = await res.json();
      if (json.success) {
        setChangeNote('');
        loadVersionHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleTriggerRestore = async (versionId: string) => {
    try {
      setRestoringId(versionId);
      await onRestore(versionId);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-900 w-80 shadow-2xl relative z-30">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4.5 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Lịch sử phiên bản</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Take Snapshot Form */}
      <form onSubmit={handleCreateSnapshot} className="p-4 border-b border-zinc-900 space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Chụp ảnh thiết kế hiện tại</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="Ghi chú thay đổi (ví dụ: Thay đổi nút CTA)"
            className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
            required
          />
          <button
            type="submit"
            disabled={creatingSnapshot}
            className="px-3 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
          >
            {creatingSnapshot ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Plus className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </form>

      {/* 2. Version logs listings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-500 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px]">Đang tải lịch sử...</span>
          </div>
        ) : versions.length > 0 ? (
          versions.map((ver) => {
            const isComparing = activeCompareId === ver.id;
            return (
              <div 
                key={ver.id} 
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  isComparing 
                    ? 'bg-indigo-500/10 border-indigo-500/30' 
                    : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Phiên bản #{ver.versionNumber}</span>
                  <span className="text-[10px] text-zinc-500 font-medium font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ver.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-2 flex items-start gap-1.5 leading-normal">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-zinc-600 flex-shrink-0" />
                  <span>{ver.changeNote || 'Không có mô tả.'}</span>
                </p>

                {/* Quick actions buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-900">
                  <button
                    onClick={() => onCompare(ver.id)}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                      isComparing
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                    }`}
                  >
                    <GitCompare className="w-3 h-3 text-indigo-400" />
                    {isComparing ? 'Đang so sánh' : 'So sánh'}
                  </button>

                  <button
                    onClick={() => handleTriggerRestore(ver.id)}
                    disabled={restoringId !== null}
                    className="flex items-center justify-center gap-1.5 flex-1 py-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 text-[10px] font-bold rounded-lg transition-all disabled:opacity-40"
                  >
                    {restoringId === ver.id ? (
                      <div className="w-3 h-3 border border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <RotateCcw className="w-3 h-3 text-indigo-400" />
                    )}
                    Khôi phục
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-zinc-600 text-center py-10">Chưa ghi nhận phiên bản lịch sử nào.</p>
        )}
      </div>
    </div>
  );
}
