import React, { useState, useEffect } from 'react';
import { ComponentRegistry } from './ComponentRegistry';
import { useBuilderStore } from '../../stores/builder.store';
import { Plus, Layers, Share2, Loader2 } from 'lucide-react';

export const LeftPanel: React.FC = () => {
  const { addSection, sections } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'components' | 'reusable'>('components');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/blocks', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        setBlocks(json.success ? json.data.blocks : json.blocks || []);
      }
    } catch (err) {
      console.error('Error fetching reusable blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reusable') {
      fetchBlocks();
    }
  }, [activeTab]);

  const handleAddComponent = (type: string, defaultSettings: any) => {
    addSection(type, defaultSettings);
  };

  const handleAddReusableBlock = (block: any) => {
    const newSection = {
      id: `temp-${Date.now()}`,
      sectionType: 'reusable',
      position: sections.length,
      settingsJson: {
        reusableBlockId: block.id,
        masterType: block.type,
        masterSettings: block.settingsJson,
        blockName: block.name
      },
      isActive: true,
    };
    
    const newSections = [...sections, newSection];
    useBuilderStore.setState({
      sections: newSections,
      selectedSectionId: newSection.id
    });
  };

  return (
    <div className="w-[280px] border-r border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      
      {/* Tabs */}
      <div className="flex bg-zinc-950 p-2 border-b border-zinc-900 gap-1">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === 'components'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Thành phần</span>
        </button>
        <button
          onClick={() => setActiveTab('reusable')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === 'reusable'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Block chung</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {activeTab === 'components' ? (
          <>
            <p className="text-[10px] text-zinc-600 mb-2 leading-relaxed">
              Nhấp chọn các thành phần để thêm vào phía cuối sơ đồ trang Landing Page.
            </p>
            {Object.values(ComponentRegistry).map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.type}
                  onClick={() => handleAddComponent(comp.type, comp.defaultSettings)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-violet-500/30 hover:bg-violet-500/5 group cursor-pointer transition-all duration-300 shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-violet-400 group-hover:bg-violet-500/10 border border-zinc-900 group-hover:border-violet-500/10 transition-colors">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                        {comp.name}
                      </h4>
                      <span className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase">Section Layout</span>
                    </div>
                  </div>
                  <div className="p-1 rounded-md bg-zinc-900 text-zinc-600 group-hover:text-violet-400 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-[10px] text-zinc-600 mb-2 leading-relaxed">
              Các block dùng chung được đồng bộ nội dung trên tất cả các trang sử dụng chúng.
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : blocks.length > 0 ? (
              blocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => handleAddReusableBlock(block)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-violet-500/30 hover:bg-violet-500/5 group cursor-pointer transition-all duration-300 shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-violet-400 group-hover:bg-violet-500/10 border border-zinc-900 group-hover:border-violet-500/10 transition-colors">
                      <Share2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                        {block.name}
                      </h4>
                      <span className="text-[9px] text-violet-400 font-mono tracking-wider uppercase">{block.type} Block</span>
                    </div>
                  </div>
                  <div className="p-1 rounded-md bg-zinc-900 text-zinc-600 group-hover:text-violet-400 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                <p className="text-xs text-zinc-500">Chưa có block dùng chung.</p>
                <p className="text-[10px] text-zinc-650 mt-1 max-w-[200px] mx-auto">
                  Bạn có thể lưu bất kỳ section nào trên Canvas thành Block chung tại Bảng thuộc tính bên phải.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
