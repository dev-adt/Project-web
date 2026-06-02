'use client';

import { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Plus, 
  Minus, 
  Zap, 
  X,
  FileJson
} from 'lucide-react';

interface Section {
  id: string;
  sectionType: string;
  position: number;
  settingsJson: any;
  isActive: boolean;
}

interface ModifiedSection {
  id: string;
  sectionType: string;
  isActive: boolean;
  base: {
    sectionType: string;
    isActive: boolean;
    settingsJson: any;
  };
  compare: {
    sectionType: string;
    isActive: boolean;
    settingsJson: any;
  };
}

interface ComparisonDiffProps {
  pageId: string;
  compareVersionId: string;
  onClose: () => void;
}

export default function LayoutComparisonDiff({ pageId, compareVersionId, onClose }: ComparisonDiffProps) {
  const [loading, setLoading] = useState(true);
  const [diff, setDiff] = useState<{
    added: Section[];
    removed: Section[];
    modified: ModifiedSection[];
  } | null>(null);

  const [activeInspectId, setActiveInspectId] = useState<string | null>(null);

  useEffect(() => {
    loadComparisonData();
  }, [pageId, compareVersionId]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      const res = await fetch(`${API_URL}/pages/${pageId}/versions/compare/${compareVersionId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDiff(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-900 bg-zinc-950/40 rounded-2xl backdrop-blur-md min-h-[300px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-zinc-400 font-semibold">Đang tổng hợp dữ liệu chênh lệch...</p>
      </div>
    );
  }

  if (!diff) return null;

  const totalDiffs = diff.added.length + diff.removed.length + diff.modified.length;
  const inspected = diff.modified.find((m) => m.id === activeInspectId);

  return (
    <div className="space-y-6">
      
      {/* Header bar diff overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-zinc-900 bg-zinc-950/60 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">Trình đối chiếu phiên bản (Visual Diff View)</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">So sánh phiên bản hiện tại với snapshot đã chọn</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-900 text-emerald-400">
              <Plus className="w-3 h-3" />
              {diff.added.length} Thêm mới
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-900 text-rose-400">
              <Minus className="w-3 h-3" />
              {diff.removed.length} Bị xóa
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-900 text-amber-400">
              <Zap className="w-3 h-3" />
              {diff.modified.length} Thay đổi
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {totalDiffs === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-900 rounded-2xl text-zinc-500">
          <p className="text-xs">Hai phiên bản hoàn toàn đồng bộ, không ghi nhận khác biệt nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel listings of layout diff blocks */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Added sections */}
            {diff.added.map((sec, idx) => (
              <div key={idx} className="p-4.5 rounded-xl border border-emerald-900/80 bg-emerald-950/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500" />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-900 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                    <Plus className="w-2.5 h-2.5" /> Thêm mới
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">VỊ TRÍ: {sec.position}</span>
                </div>
                <h5 className="font-bold text-sm text-emerald-300 mt-2.5 uppercase tracking-wide">Khối: {sec.sectionType.toUpperCase()}</h5>
                <p className="text-[11px] text-zinc-500 mt-1">Phần tử đã được kéo thêm vào trong phiên bản so sánh.</p>
              </div>
            ))}

            {/* Removed sections */}
            {diff.removed.map((sec, idx) => (
              <div key={idx} className="p-4.5 rounded-xl border border-rose-900/80 bg-rose-950/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-rose-500" />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-900 text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                    <Minus className="w-2.5 h-2.5" /> Bị xóa
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">VỊ TRÍ: {sec.position}</span>
                </div>
                <h5 className="font-bold text-sm text-rose-300 mt-2.5 uppercase tracking-wide">Khối: {sec.sectionType.toUpperCase()}</h5>
                <p className="text-[11px] text-zinc-500 mt-1">Phần tử đã bị gỡ bỏ khỏi phiên bản so sánh.</p>
              </div>
            ))}

            {/* Modified sections */}
            {diff.modified.map((sec, idx) => {
              const inspecting = activeInspectId === sec.id;
              return (
                <div 
                  key={idx} 
                  className={`p-4.5 rounded-xl border relative overflow-hidden transition-all ${
                    inspecting 
                      ? 'bg-amber-950/15 border-amber-500' 
                      : 'bg-amber-950/5 border-amber-900/80 hover:border-amber-700/80 cursor-pointer'
                  }`}
                  onClick={() => setActiveInspectId(sec.id)}
                >
                  <div className="absolute top-0 left-0 h-full w-1 bg-amber-500" />
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-900 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                      <Zap className="w-2.5 h-2.5 animate-pulse" /> Thay đổi cấu hình
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">KHỐI LOẠI: {sec.sectionType.toUpperCase()}</span>
                  </div>
                  <h5 className="font-bold text-sm text-amber-300 mt-2.5 uppercase tracking-wide">Phần tử bị cấu hình sai biệt</h5>
                  <p className="text-[11px] text-zinc-500 mt-1">Các thuộc tính hiển thị (JSON parameters) có sự khác biệt giữa hai bản lưu.</p>
                  
                  {!inspecting && (
                    <button
                      type="button"
                      className="text-[10px] font-bold text-indigo-400 mt-3 hover:underline"
                    >
                      Bấm xem chi tiết chênh lệch cấu hình
                    </button>
                  )}
                </div>
              );
            })}

          </div>

          {/* Right panel: Side-by-side configurations inspectors */}
          <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl backdrop-blur-md min-h-[400px]">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900 mb-4">
              <FileJson className="w-4.5 h-4.5 text-zinc-400" />
              <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Trình biên dịch Dữ liệu chi tiết</h3>
            </div>

            {inspected ? (
              <div className="space-y-4">
                <div className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-wide max-w-max uppercase font-bold">
                  {inspected.sectionType.toUpperCase()} BLOCK PROPERTIES
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Base original properties */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Bản gốc (Base)</span>
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl max-h-[300px] overflow-y-auto font-mono text-[10px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(inspected.base.settingsJson, null, 2)}
                    </div>
                  </div>

                  {/* Compared new properties */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Bản so sánh (Compare)</span>
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl max-h-[300px] overflow-y-auto font-mono text-[10px] text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(inspected.compare.settingsJson, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[280px] text-zinc-600 border border-zinc-900 border-dashed rounded-xl">
                <p className="text-xs">Bấm chọn một khối có trạng thái "Thay đổi" để phân tích chi tiết tham số chênh lệch.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
