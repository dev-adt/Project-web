import React, { useState } from 'react';
import { useBuilderStore } from '../../stores/builder.store';
import { ComponentRegistry } from './ComponentRegistry';
import { Settings, Sliders, Trash2, Plus, ArrowUp, ArrowDown, Share2, Sparkles, Loader2 } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { sections, selectedSectionId, updateSectionSettings, removeSection } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [savingBlock, setSavingBlock] = useState(false);

  // AI assistant states
  const [aiActiveKey, setAiActiveKey] = useState<string | null>(null);
  const [aiTab, setAiTab] = useState<'rewrite' | 'translate' | 'generate'>('rewrite');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'professional' | 'creative' | 'shorten' | 'expand'>('professional');
  const [aiLang, setAiLang] = useState('English');
  const [aiRunning, setAiRunning] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const selectedSection = sections.find((sec) => sec.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <div className="w-[300px] border-l border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center p-6 text-center select-none">
        <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 mb-4">
          <Settings className="h-6 w-6" />
        </div>
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Inspector</h4>
        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
          Select any section in the canvas workspace to modify dynamic properties.
        </p>
      </div>
    );
  }

  const isReusable = selectedSection.sectionType === 'reusable';
  
  const definition = isReusable
    ? ComponentRegistry[selectedSection.settingsJson?.masterType]
    : ComponentRegistry[selectedSection.sectionType];

  const settings = isReusable
    ? selectedSection.settingsJson?.masterSettings || {}
    : selectedSection.settingsJson;

  if (!definition) {
    return (
      <div className="w-[300px] border-l border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center p-6 text-center select-none">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Không có định nghĩa</h4>
        <p className="text-xs text-zinc-600 mt-2 leading-relaxed font-semibold">
          Không tìm thấy định nghĩa cấu trúc cho section này.
        </p>
      </div>
    );
  }

  const handleFieldChange = async (key: string, value: any) => {
    if (isReusable) {
      // 1. Update state locally
      const updatedMasterSettings = {
        ...settings,
        [key]: value,
      };
      
      updateSectionSettings(selectedSection.id, {
        masterSettings: updatedMasterSettings,
      });

      // 2. Sync to backend reusable block API
      const token = localStorage.getItem('token');
      const blockId = selectedSection.settingsJson?.reusableBlockId;
      if (token && blockId) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
          await fetch(`${API_URL}/blocks/${blockId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              settingsJson: updatedMasterSettings
            })
          });
        } catch (err) {
          console.error('Failed to sync reusable block:', err);
        }
      }
    } else {
      updateSectionSettings(selectedSection.id, { [key]: value });
    }
  };

  const handleAiAction = async (key: string, currentValue: string) => {
    setAiRunning(true);
    setAiError(null);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      let endpoint = '';
      let body: any = {};

      if (aiTab === 'rewrite') {
        endpoint = '/ai/rewrite';
        body = { text: currentValue || '', style: aiStyle };
      } else if (aiTab === 'translate') {
        endpoint = '/ai/translate';
        body = { text: currentValue || '', targetLang: aiLang };
      } else {
        endpoint = '/ai/generate';
        body = { prompt: aiPrompt, context: selectedSection.settingsJson?.title || '' };
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ máy chủ AI. Vui lòng kiểm tra lại quyền hạn hoặc cấu hình.');
      }

      const data = await res.json();
      if (data.success && data.text) {
        handleFieldChange(key, data.text);
        setAiActiveKey(null);
        setAiPrompt('');
      } else {
        throw new Error(data.message || 'Không thể xử lý nội dung bằng AI.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi mạng khi kết nối AI.');
    } finally {
      setAiRunning(false);
    }
  };

  const handleSaveAsReusable = async () => {
    const name = prompt('Nhập tên cho Block dùng chung mới này (ví dụ: Header chính):');
    if (!name || !name.trim()) return;

    try {
      setSavingBlock(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
      
      const res = await fetch(`${API_URL}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: name.trim(),
          type: selectedSection.sectionType,
          settingsJson: selectedSection.settingsJson
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const newBlock = data.data;
        const updatedSections = sections.map(sec => {
          if (sec.id === selectedSection.id) {
            return {
              ...sec,
              sectionType: 'reusable',
              settingsJson: {
                reusableBlockId: newBlock.id,
                masterType: selectedSection.sectionType,
                masterSettings: selectedSection.settingsJson,
                blockName: name.trim()
              }
            };
          }
          return sec;
        });
        
        useBuilderStore.setState({ sections: updatedSections });
        alert('Đã lưu thành Block dùng chung thành công!');
      } else {
        alert(data.message || 'Lỗi tạo block dùng chung.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi lưu block.');
    } finally {
      setSavingBlock(false);
    }
  };

  // Helper to handle list array items
  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...(settings.items || [])];
    items[index] = { ...items[index], [field]: value };
    handleFieldChange('items', items);
  };

  const handleAddItem = (defaultObj: any) => {
    const items = [...(settings.items || []), defaultObj];
    handleFieldChange('items', items);
  };

  const handleRemoveItem = (index: number) => {
    const items = (settings.items || []).filter((_: any, idx: number) => idx !== index);
    handleFieldChange('items', items);
  };


  return (
    <div className="w-[300px] border-l border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Header Info */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-white leading-none mb-1">
            {definition.name}
          </h3>
          <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">Section Properties</span>
        </div>
        <button
          onClick={() => removeSection(selectedSection.id)}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 border border-zinc-900 hover:border-rose-500/20 transition-all"
          title="Delete Section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs Toggles */}
      <div className="flex bg-zinc-950 p-2 border-b border-zinc-900 gap-1">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === 'content'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Content</span>
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === 'style'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Style</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {activeTab === 'content' ? (
          <>
            {/* Reusable warning / save action */}
            {isReusable ? (
              <div className="bg-violet-950/20 border border-violet-900/50 rounded-xl p-3 text-[11px] text-violet-400 leading-relaxed mb-1">
                ✨ <strong>Block dùng chung (Shared Block)</strong>
                <p className="mt-1 opacity-80">Thay đổi sẽ đồng bộ trên toàn bộ tất cả trang sử dụng block này.</p>
              </div>
            ) : (
              <button
                onClick={handleSaveAsReusable}
                disabled={savingBlock}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 font-bold text-xs transition-all duration-200 mb-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                {savingBlock ? 'Đang lưu block...' : 'Lưu thành Block dùng chung'}
              </button>
            )}

            {/* Render direct input fields */}
            {Object.entries(definition.fields.content).map(([key, field]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{field.label}</label>
                  {(field.type === 'text' || field.type === 'textarea') && (
                    <button
                      onClick={() => {
                        setAiActiveKey(aiActiveKey === key ? null : key);
                        setAiError(null);
                      }}
                      className={`p-1 rounded flex items-center gap-1 text-[9px] font-bold uppercase transition-all ${
                        aiActiveKey === key
                          ? 'bg-violet-600 text-white shadow shadow-violet-500/25'
                          : 'bg-zinc-900 text-zinc-400 hover:text-violet-400 hover:bg-violet-600/10 border border-zinc-800'
                      }`}
                      title="AI content assistant"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>AI</span>
                    </button>
                  )}
                </div>

                {aiActiveKey === key && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-3 mt-1 shadow-lg">
                    <div className="flex bg-zinc-950 p-1 rounded-lg gap-1 border border-zinc-850">
                      {(['rewrite', 'translate', 'generate'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setAiTab(tab);
                            setAiError(null);
                          }}
                          className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                            aiTab === tab
                              ? 'bg-zinc-800 text-white'
                              : 'text-zinc-550 hover:text-zinc-350'
                          }`}
                        >
                          {tab === 'rewrite' ? 'Sửa' : tab === 'translate' ? 'Dịch' : 'Tạo'}
                        </button>
                      ))}
                    </div>

                    {aiError && (
                      <p className="text-[10px] text-rose-400 leading-tight bg-rose-950/20 border border-rose-900/60 rounded px-2 py-1">
                        {aiError}
                      </p>
                    )}

                    {aiTab === 'rewrite' && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Chọn phong cách:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['professional', 'creative', 'shorten', 'expand'] as const).map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setAiStyle(style)}
                              className={`py-1 rounded text-[9px] font-bold border transition-all ${
                                aiStyle === style
                                  ? 'bg-violet-600/10 border-violet-500 text-violet-400 font-extrabold'
                                  : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              {style === 'professional' ? '💼 Chuyên nghiệp' : style === 'creative' ? '✨ Sáng tạo' : style === 'shorten' ? '🔍 Rút gọn' : '📝 Kéo dài'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiTab === 'translate' && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Ngôn ngữ đích:</span>
                        <select
                          value={aiLang}
                          onChange={(e) => setAiLang(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 outline-none"
                        >
                          <option value="English">English (Tiếng Anh)</option>
                          <option value="Japanese">Japanese (Tiếng Nhật)</option>
                          <option value="Korean">Korean (Tiếng Hàn)</option>
                          <option value="French">French (Tiếng Pháp)</option>
                          <option value="Chinese">Chinese (Tiếng Trung)</option>
                        </select>
                      </div>
                    )}

                    {aiTab === 'generate' && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Mô tả yêu cầu:</span>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Ví dụ: Viết một câu slogan cho dịch vụ y tế công nghệ cao..."
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-[11px] text-white outline-none focus:border-violet-500 min-h-[50px] resize-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAiAction(key, settings[key] || '')}
                        disabled={aiRunning || (aiTab === 'generate' && !aiPrompt.trim())}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-[10px] font-bold shadow transition-all active:scale-95"
                      >
                        {aiRunning ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{aiRunning ? 'Đang gọi AI...' : 'Áp dụng'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAiActiveKey(null);
                          setAiError(null);
                        }}
                        className="px-2 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {field.type === 'textarea' ? (
                  <textarea
                    value={settings[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-lg p-2.5 text-xs text-white placeholder-zinc-700 outline-none transition-all resize-none min-h-[80px]"
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={settings[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-lg px-2.5 py-2 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            {/* List Array Editors for complex components */}
            {selectedSection.sectionType === 'features' && (
              <div className="flex flex-col gap-3.5 border-t border-zinc-900 pt-4 mt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Features Grid Items</h4>
                  <button
                    onClick={() => handleAddItem({ title: 'New Feature', description: 'Description', icon: 'Brain' })}
                    className="p-1 rounded bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/15"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {(settings.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2 relative group/item">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-semibold w-[85%]"
                      placeholder="Title"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 resize-none min-h-[40px]"
                      placeholder="Description"
                    />
                    <select
                      value={item.icon}
                      onChange={(e) => handleItemChange(idx, 'icon', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-400 outline-none"
                    >
                      {['Brain', 'GitMerge', 'Clock', 'Activity', 'Heart', 'Shield'].map((icName) => (
                        <option key={icName} value={icName}>{icName}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {selectedSection.sectionType === 'faq' && (
              <div className="flex flex-col gap-3.5 border-t border-zinc-900 pt-4 mt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Accordions List</h4>
                  <button
                    onClick={() => handleAddItem({ question: 'New Question?', answer: 'Answer content' })}
                    className="p-1 rounded bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/15"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {(settings.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2 relative group/item">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => handleItemChange(idx, 'question', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-semibold w-[85%]"
                      placeholder="Question"
                    />
                    <textarea
                      value={item.answer}
                      onChange={(e) => handleItemChange(idx, 'answer', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 resize-none min-h-[60px]"
                      placeholder="Answer"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedSection.sectionType === 'gallery' && (
              <div className="flex flex-col gap-3.5 border-t border-zinc-900 pt-4 mt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gallery Slides</h4>
                  <button
                    onClick={() => handleAddItem({ url: '', caption: 'Caption' })}
                    className="p-1 rounded bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/15"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {(settings.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2 relative group/item">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleItemChange(idx, 'url', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white w-[85%]"
                      placeholder="Image URL"
                    />
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => handleItemChange(idx, 'caption', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300"
                      placeholder="Caption"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Render style options */}
            {Object.entries(definition.fields.style).map(([key, field]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{field.label}</label>
                  {field.type === 'number' && (
                    <span className="text-[10px] font-mono text-zinc-500">{settings[key] || 0}px</span>
                  )}
                </div>
                {field.type === 'select' ? (
                  <select
                    value={settings[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-lg px-2.5 py-2 text-xs text-white outline-none transition-all"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    value={settings[key] || 0}
                    onChange={(e) => handleFieldChange(key, parseInt(e.target.value, 10))}
                    className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-violet-600 outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                    <input
                      type="color"
                      value={settings[key] || '#000000'}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="h-7 w-7 rounded border-0 outline-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings[key] || ''}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="bg-transparent text-xs text-white font-mono w-24 outline-none border-0"
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
