'use client';

import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Settings, 
  Type, 
  Mail, 
  Phone, 
  List, 
  CheckSquare, 
  CircleDot, 
  Upload,
  AlignLeft,
  Sparkles
} from 'lucide-react';

export interface FormField {
  id?: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  position: number;
  settingsJson?: {
    options?: string[];
    allowedTypes?: string[];
    maxSizeMb?: number;
  };
}

interface FormDesignerProps {
  fields: FormField[];
  onSave: (fields: FormField[], settings: any) => void;
  formSettings: any;
}

export default function FormDesigner({ fields: initialFields, onSave, formSettings }: FormDesignerProps) {
  const [fields, setFields] = useState<FormField[]>(
    initialFields.length > 0 
      ? [...initialFields].sort((a, b) => a.position - b.position) 
      : []
  );
  const [settings, setSettings] = useState(formSettings || { submitText: 'Gửi liên hệ', successMessage: 'Cảm ơn bạn đã liên hệ!' });
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);

  const fieldTypes = [
    { type: 'text', label: 'Văn bản (Text)', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'phone', label: 'Số điện thoại', icon: Phone },
    { type: 'select', label: 'Hộp chọn (Select)', icon: List },
    { type: 'radio', label: 'Nút chọn một (Radio)', icon: CircleDot },
    { type: 'checkbox', label: 'Chọn nhiều (Checkbox)', icon: CheckSquare },
    { type: 'file', label: 'Tải tệp lên (File)', icon: Upload },
  ];

  const addField = (type: string) => {
    const defaultLabel = fieldTypes.find(t => t.type === type)?.label.split(' ')[0] || 'Trường mới';
    const newField: FormField = {
      fieldType: type,
      label: `${defaultLabel} ${fields.length + 1}`,
      placeholder: `Nhập giá trị...`,
      required: false,
      position: fields.length,
      settingsJson: type === 'select' || type === 'radio' || type === 'checkbox'
        ? { options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C'] }
        : type === 'file'
        ? { allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'], maxSizeMb: 10 }
        : {}
    };

    const updated = [...fields, newField];
    setFields(updated);
    setSelectedFieldIdx(updated.length - 1);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, position: i }));
    setFields(updated);
    setSelectedFieldIdx(null);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    // Reset positions
    const finalFields = updated.map((f, i) => ({ ...f, position: i }));
    setFields(finalFields);
    setSelectedFieldIdx(newIndex);
  };

  const updateFieldProperty = (property: keyof FormField, value: any) => {
    if (selectedFieldIdx === null) return;
    const updated = [...fields];
    updated[selectedFieldIdx] = {
      ...updated[selectedFieldIdx],
      [property]: value
    };
    setFields(updated);
  };

  const updateFieldSettings = (key: string, value: any) => {
    if (selectedFieldIdx === null) return;
    const updated = [...fields];
    const currentSettings = updated[selectedFieldIdx].settingsJson || {};
    updated[selectedFieldIdx] = {
      ...updated[selectedFieldIdx],
      settingsJson: {
        ...currentSettings,
        [key]: value
      }
    };
    setFields(updated);
  };

  const activeField = selectedFieldIdx !== null ? fields[selectedFieldIdx] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
      
      {/* 1. Left Sidebar Elements Selector */}
      <div className="lg:col-span-3 space-y-6 bg-zinc-900/25 border border-zinc-900/60 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-3">Thêm trường dữ liệu</h3>
          <div className="grid grid-cols-1 gap-2">
            {fieldTypes.map((ft) => {
              const Icon = ft.icon;
              return (
                <button
                  key={ft.type}
                  onClick={() => addField(ft.type)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-200 text-left text-zinc-300 hover:text-zinc-100 group"
                >
                  <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{ft.label}</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-5">
          <h3 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-3">Cấu hình biểu mẫu</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5">Nút gửi (Submit text)</label>
              <input
                type="text"
                value={settings.submitText}
                onChange={(e) => setSettings({ ...settings, submitText: e.target.value })}
                className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5">Thông báo thành công</label>
              <input
                type="text"
                value={settings.successMessage}
                onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => onSave(fields, settings)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all duration-300"
        >
          Lưu thiết kế biểu mẫu
        </button>
      </div>

      {/* 2. Middle Live Preview Canvas */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Khung thiết kế (Live Canvas)</h3>
        </div>

        <div className="min-h-[480px] p-6 border border-zinc-900/60 bg-zinc-950/30 rounded-2xl backdrop-blur-sm space-y-4">
          {fields.length > 0 ? (
            fields.map((field, idx) => {
              const active = selectedFieldIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFieldIdx(idx)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                    active 
                      ? 'bg-zinc-900/50 border-indigo-500/40 shadow-lg shadow-indigo-600/5' 
                      : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  {/* Actions overlay */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveField(idx, 'up'); }}
                      disabled={idx === 0}
                      className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveField(idx, 'down'); }}
                      disabled={idx === fields.length - 1}
                      className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeField(idx); }}
                      className="p-1 rounded bg-zinc-850 hover:bg-rose-950/30 text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pr-20 pointer-events-none">
                    <label className="block text-xs font-bold text-zinc-300">
                      {field.label}
                      {field.required && <span className="text-indigo-400 ml-1">*</span>}
                    </label>

                    {field.fieldType === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full bg-zinc-950/40 border border-zinc-850/60 rounded-lg px-3 py-2 text-xs text-zinc-400"
                        disabled
                      />
                    )}

                    {field.fieldType === 'email' && (
                      <input
                        type="email"
                        placeholder={field.placeholder}
                        className="w-full bg-zinc-950/40 border border-zinc-850/60 rounded-lg px-3 py-2 text-xs text-zinc-400"
                        disabled
                      />
                    )}

                    {field.fieldType === 'phone' && (
                      <input
                        type="tel"
                        placeholder={field.placeholder}
                        className="w-full bg-zinc-950/40 border border-zinc-850/60 rounded-lg px-3 py-2 text-xs text-zinc-400"
                        disabled
                      />
                    )}

                    {field.fieldType === 'select' && (
                      <select className="w-full bg-zinc-950/40 border border-zinc-850/60 rounded-lg px-3 py-2 text-xs text-zinc-400 appearance-none" disabled>
                        {field.settingsJson?.options?.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        )) || <option>Không có tùy chọn</option>}
                      </select>
                    )}

                    {field.fieldType === 'radio' && (
                      <div className="space-y-1.5 pt-1">
                        {field.settingsJson?.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="radio" className="w-3.5 h-3.5 accent-indigo-500" disabled />
                            <span className="text-xs text-zinc-400">{opt}</span>
                          </div>
                        )) || <span className="text-xs text-zinc-500">Không có tùy chọn</span>}
                      </div>
                    )}

                    {field.fieldType === 'checkbox' && (
                      <div className="space-y-1.5 pt-1">
                        {field.settingsJson?.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-500 rounded" disabled />
                            <span className="text-xs text-zinc-400">{opt}</span>
                          </div>
                        )) || <span className="text-xs text-zinc-500">Không có tùy chọn</span>}
                      </div>
                    )}

                    {field.fieldType === 'file' && (
                      <div className="flex items-center gap-2 w-full p-3 rounded-lg border border-zinc-850/60 bg-zinc-900/10 border-dashed text-zinc-500">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs">Chọn tệp tải lên... ({field.settingsJson?.maxSizeMb || 10}MB tối đa)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 space-y-2">
              <AlignLeft className="w-10 h-10 opacity-30" />
              <p className="text-xs">Bấm các phần tử ở thanh trái để thêm trường vào biểu mẫu.</p>
            </div>
          )}

          {fields.length > 0 && (
            <div className="pt-4 border-t border-zinc-900">
              <button
                type="button"
                className="w-full py-2.5 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 text-indigo-300 font-bold text-xs pointer-events-none"
              >
                {settings.submitText || 'Gửi liên hệ'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Sidebar Properties Editor */}
      <div className="lg:col-span-4 bg-zinc-900/25 border border-zinc-900/60 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-900 mb-4">
          <Settings className="w-4.5 h-4.5 text-zinc-400" />
          <h3 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Cấu hình trường dữ liệu</h3>
        </div>

        {activeField ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-500 font-semibold mb-1.5 uppercase">Loại phần tử</label>
              <div className="px-3 py-2 bg-zinc-900/50 rounded-lg text-xs font-mono text-zinc-400 border border-zinc-850">
                {activeField.fieldType.toUpperCase()}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5">Nhãn trường dữ liệu (Label)</label>
              <input
                type="text"
                value={activeField.label}
                onChange={(e) => updateFieldProperty('label', e.target.value)}
                className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {['text', 'email', 'phone'].includes(activeField.fieldType) && (
              <div>
                <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5">Gợi ý giữ chỗ (Placeholder)</label>
                <input
                  type="text"
                  value={activeField.placeholder || ''}
                  onChange={(e) => updateFieldProperty('placeholder', e.target.value)}
                  className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={activeField.required || false}
                  onChange={(e) => updateFieldProperty('required', e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-500 rounded"
                />
                <span className="text-xs text-zinc-300 font-semibold">Trường bắt buộc nhập</span>
              </label>
            </div>

            {['select', 'radio', 'checkbox'].includes(activeField.fieldType) && (
              <div className="border-t border-zinc-900 pt-4 mt-4">
                <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5">Danh sách tùy chọn (Phân cách bởi dấu phẩy)</label>
                <textarea
                  value={activeField.settingsJson?.options?.join(', ') || ''}
                  onChange={(e) => {
                    const opts = e.target.value.split(',').map((o) => o.trim()).filter(Boolean);
                    updateFieldSettings('options', opts);
                  }}
                  className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 min-h-[80px] leading-relaxed"
                  placeholder="Lựa chọn A, Lựa chọn B, Lựa chọn C"
                />
              </div>
            )}

            {activeField.fieldType === 'file' && (
              <div className="border-t border-zinc-900 pt-4 mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-semibold mb-1.5">Giới hạn dung lượng (MB)</label>
                  <input
                    type="number"
                    value={activeField.settingsJson?.maxSizeMb || 10}
                    onChange={(e) => updateFieldSettings('maxSizeMb', parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950/40 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-zinc-600 border border-zinc-900 border-dashed rounded-xl">
            <p className="text-xs">Bấm chọn một trường trên canvas để bắt đầu tùy biến.</p>
          </div>
        )}
      </div>

    </div>
  );
}
