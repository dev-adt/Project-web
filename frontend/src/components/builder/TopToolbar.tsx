import React from 'react';
import { useBuilderStore } from '../../stores/builder.store';
import {
  Monitor,
  Tablet,
  Phone,
  Undo2,
  Redo2,
  Save,
  Check,
  ChevronLeft,
} from 'lucide-react';

export const TopToolbar: React.FC = () => {
  const {
    pageTitle,
    responsiveMode,
    saving,
    historyIndex,
    history,
    setResponsiveMode,
    undo,
    redo,
    saveLayout,
  } = useBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-14 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Title */}
      <div className="flex items-center gap-3">
        <a
          href="/pages"
          className="p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </a>
        <div>
          <h2 className="text-sm font-bold text-white leading-none mb-1">
            {pageTitle}
          </h2>
          <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">Visual Page Builder</span>
        </div>
      </div>

      {/* Screen Width Resizing Preview Toggles */}
      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setResponsiveMode('desktop')}
          className={`p-1.5 rounded-md transition-all ${
            responsiveMode === 'desktop'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Desktop view width"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={() => setResponsiveMode('tablet')}
          className={`p-1.5 rounded-md transition-all ${
            responsiveMode === 'tablet'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Tablet view width"
        >
          <Tablet className="h-4 w-4" />
        </button>
        <button
          onClick={() => setResponsiveMode('mobile')}
          className={`p-1.5 rounded-md transition-all ${
            responsiveMode === 'mobile'
              ? 'bg-violet-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Mobile view width"
        >
          <Phone className="h-4 w-4" />
        </button>
      </div>

      {/* History & Active Syncing Controls */}
      <div className="flex items-center gap-4">
        {/* Undo Redo */}
        <div className="flex items-center gap-0.5 border-r border-zinc-800 pr-4">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo ? 'text-zinc-300 hover:text-white hover:bg-zinc-900' : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo ? 'text-zinc-300 hover:text-white hover:bg-zinc-900' : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Sync */}
        <button
          onClick={saveLayout}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white transition-all shadow-lg shadow-violet-500/10 disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Draft</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
