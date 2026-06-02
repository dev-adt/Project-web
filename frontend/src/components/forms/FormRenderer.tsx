'use client';

import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { FormField } from './FormDesigner';

interface FormRendererProps {
  form: {
    id: string;
    name: string;
    slug: string;
    fields: FormField[];
    settingsJson?: {
      submitText?: string;
      successMessage?: string;
    };
  };
}

export default function FormRenderer({ form }: FormRendererProps) {
  const fields = form.fields || [];
  const settings = form.settingsJson || { submitText: 'Gửi liên hệ', successMessage: 'Cảm ơn bạn đã liên hệ!' };

  // Form Inputs State
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, val: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    // Clear specific field validation error upon update
    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldId]: file }));
      // Automatically store filename as input value to submit reference
      handleInputChange(fieldId, file.name);
    } else {
      setFiles((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
      handleInputChange(fieldId, '');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const val = formData[field.id || ''] || '';
      
      // 1. Required Check
      if (field.required && !val.trim()) {
        newErrors[field.id || ''] = `Trường ${field.label} không được để trống.`;
        return;
      }

      // 2. Email Formatting Check
      if (field.fieldType === 'email' && val.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          newErrors[field.id || ''] = 'Định dạng email không hợp lệ.';
        }
      }

      // 3. Phone Formatting Check
      if (field.fieldType === 'phone' && val.trim()) {
        const phoneRegex = /^[0-9+ \-()]{8,15}$/;
        if (!phoneRegex.test(val.trim())) {
          newErrors[field.id || ''] = 'Số điện thoại không hợp lệ.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

      // Construct values array payload matching backend SubmitFormDto schema
      const payloadValues = fields.map((field) => ({
        fieldId: field.id || '',
        value: formData[field.id || ''] || ''
      }));

      const res = await fetch(`${API_URL}/submissions/slug/${form.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: payloadValues })
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setFormData({});
        setFiles({});
      } else {
        setErrorMsg(json.message || 'Lỗi gửi thông tin biểu mẫu.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-emerald-900 bg-emerald-950/20 text-emerald-300 backdrop-blur-sm text-center max-w-md mx-auto space-y-3 shadow-xl">
        <CheckCircle className="w-12 h-12 text-emerald-400" />
        <h3 className="font-bold text-lg">Gửi biểu mẫu thành công!</h3>
        <p className="text-sm opacity-80 leading-relaxed">{settings.successMessage || 'Cảm ơn bạn đã liên hệ!'}</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold transition-colors"
        >
          Gửi biểu mẫu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm shadow-xl">
      <h3 className="font-bold text-base text-zinc-200 border-b border-zinc-900 pb-3">{form.name}</h3>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {fields.map((field) => {
        const fieldId = field.id || '';
        const hasError = !!errors[fieldId];

        return (
          <div key={fieldId} className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400">
              {field.label}
              {field.required && <span className="text-indigo-400 ml-1">*</span>}
            </label>

            {field.fieldType === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder}
                value={formData[fieldId] || ''}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                className={`w-full bg-zinc-900/40 border rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors ${
                  hasError ? 'border-rose-900/80 focus:border-rose-500' : 'border-zinc-850/60'
                }`}
              />
            )}

            {field.fieldType === 'email' && (
              <input
                type="email"
                placeholder={field.placeholder}
                value={formData[fieldId] || ''}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                className={`w-full bg-zinc-900/40 border rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors ${
                  hasError ? 'border-rose-900/80 focus:border-rose-500' : 'border-zinc-850/60'
                }`}
              />
            )}

            {field.fieldType === 'phone' && (
              <input
                type="tel"
                placeholder={field.placeholder}
                value={formData[fieldId] || ''}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                className={`w-full bg-zinc-900/40 border rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors ${
                  hasError ? 'border-rose-900/80 focus:border-rose-500' : 'border-zinc-850/60'
                }`}
              />
            )}

            {field.fieldType === 'select' && (
              <div className="relative">
                <select
                  value={formData[fieldId] || ''}
                  onChange={(e) => handleInputChange(fieldId, e.target.value)}
                  className={`w-full bg-zinc-900/40 border rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none ${
                    hasError ? 'border-rose-900/80' : 'border-zinc-850/60'
                  }`}
                >
                  <option value="" className="bg-zinc-950 text-zinc-500">-- Chọn tùy chọn --</option>
                  {field.settingsJson?.options?.map((opt, idx) => (
                    <option key={idx} value={opt} className="bg-zinc-950 text-zinc-200">{opt}</option>
                  ))}
                </select>
              </div>
            )}

            {field.fieldType === 'radio' && (
              <div className="space-y-2 pt-1">
                {field.settingsJson?.options?.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300">
                    <input
                      type="radio"
                      name={fieldId}
                      value={opt}
                      checked={formData[fieldId] === opt}
                      onChange={() => handleInputChange(fieldId, opt)}
                      className="w-4 h-4 accent-indigo-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {field.fieldType === 'checkbox' && (
              <div className="space-y-2 pt-1">
                {field.settingsJson?.options?.map((opt, idx) => {
                  const currentVals = formData[fieldId]?.split(',').filter(Boolean) || [];
                  const active = currentVals.includes(opt);
                  
                  const handleToggle = () => {
                    const next = active 
                      ? currentVals.filter((v) => v !== opt) 
                      : [...currentVals, opt];
                    handleInputChange(fieldId, next.join(','));
                  };

                  return (
                    <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={handleToggle}
                        className="w-4 h-4 accent-indigo-500 rounded"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {field.fieldType === 'file' && (
              <div className="relative">
                <input
                  type="file"
                  id={`file-${fieldId}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(fieldId, file);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor={`file-${fieldId}`}
                  className={`flex items-center gap-2.5 w-full p-4 rounded-xl border border-dashed text-zinc-400 cursor-pointer hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/20 transition-all ${
                    hasError ? 'border-rose-900/80 text-rose-400' : 'border-zinc-850/60'
                  }`}
                >
                  <Upload className="w-4.5 h-4.5" />
                  <span className="text-xs truncate">
                    {files[fieldId]?.name || `Chọn tệp tin... (tối đa ${field.settingsJson?.maxSizeMb || 10}MB)`}
                  </span>
                </label>
              </div>
            )}

            {hasError && (
              <p className="text-[10px] text-rose-400 font-medium px-0.5">{errors[fieldId]}</p>
            )}
          </div>
        );
      })}

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-40"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            settings.submitText || 'Gửi liên hệ'
          )}
        </button>
      </div>
    </form>
  );
}
