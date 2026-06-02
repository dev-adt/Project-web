'use client';

import React, { use, useEffect, useState } from 'react';
import { useBuilderStore } from '../../../stores/builder.store';
import { TopToolbar } from '../../../components/builder/TopToolbar';
import { LeftPanel } from '../../../components/builder/LeftPanel';
import { Canvas } from '../../../components/builder/Canvas';
import { RightPanel } from '../../../components/builder/RightPanel';
import { Loader2, History as HistoryIcon, Check, AlertCircle } from 'lucide-react';
import VersionHistoryPanel from '../../../components/builder/VersionHistoryPanel';
import LayoutComparisonDiff from '../../../components/builder/LayoutComparisonDiff';

interface BuilderPageProps {
  params: Promise<{ pageId: string }>;
}

export default function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const { loadPage, pageId: activePageId, saving } = useBuilderStore();

  // Version Control system cockpit states
  const [showHistory, setShowHistory] = useState(false);
  const [activeCompareId, setActiveCompareId] = useState<string | null>(null);
  
  // Local toast alerts state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (pageId) {
      loadPage(pageId);
    }
  }, [pageId, loadPage]);

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/pages/${pageId}/versions/${versionId}/restore`, {
        method: 'POST'
      });
      const json = await res.json();
      
      if (json.success) {
        // Re-arrange and load reinstated layout sections in Zustand store
        await loadPage(pageId);
        showToast('Khôi phục phiên bản bài viết thành công!');
        setShowHistory(false);
        setActiveCompareId(null);
      } else {
        showToast(json.message || 'Lỗi khôi phục phiên bản.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Đã xảy ra lỗi kết nối.', 'error');
    }
  };

  // Loading indicator for workspace bootstrap
  if (activePageId !== pageId) {
    return (
      <div className="flex-1 bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center min-h-screen select-none gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <p className="text-sm text-zinc-500 font-mono tracking-wider uppercase">Loading Workspace Layout...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] flex flex-col h-screen select-none overflow-hidden select-none relative">
      
      {/* Dynamic Toast feedback */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-2xl ${
          toast.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/80 border-rose-800 text-rose-300'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Controls Toolbar */}
      <TopToolbar />

      {/* Editor Panels Layout */}
      <div className="flex flex-1 flex-row overflow-hidden relative">
        {/* Left Component Library */}
        <LeftPanel />

        {/* Center Canvas Preview Board */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950/30">
          <Canvas />
          
          {/* Floating history toggle button on canvas */}
          {!showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="absolute top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white shadow-2xl transition-all duration-200 text-xs font-semibold backdrop-blur-sm transform active:scale-95"
            >
              <HistoryIcon className="w-3.5 h-3.5 text-indigo-400" />
              Lịch sử bản lưu
            </button>
          )}

          {/* Bottom Diff comparison overlay */}
          {activeCompareId && (
            <div className="absolute bottom-0 left-0 right-0 z-40 p-6 bg-zinc-950/98 border-t border-zinc-900 max-h-[350px] overflow-y-auto backdrop-blur-md">
              <LayoutComparisonDiff 
                pageId={pageId} 
                compareVersionId={activeCompareId} 
                onClose={() => setActiveCompareId(null)} 
              />
            </div>
          )}
        </div>

        {/* Right Settings Inspector */}
        {!showHistory ? (
          <RightPanel />
        ) : (
          <VersionHistoryPanel
            pageId={pageId}
            onClose={() => {
              setShowHistory(false);
              setActiveCompareId(null);
            }}
            onRestore={handleRestoreVersion}
            onCompare={(vId) => setActiveCompareId(vId === activeCompareId ? null : vId)}
            activeCompareId={activeCompareId}
          />
        )}
      </div>
    </div>
  );
}
