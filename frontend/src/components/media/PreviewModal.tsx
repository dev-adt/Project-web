import React from 'react';
import { X, Download, Copy, Trash2, FileText, FileSpreadsheet, File } from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

interface PreviewModalProps {
  file: MediaFile | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ file, onClose, onDelete }) => {
  if (!file) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.filePath);
    alert('Public asset URL link copied successfully.');
  };

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const isExcel = file.mimeType.includes('spreadsheet') || file.mimeType.includes('xlsx');
  const isWord = file.mimeType.includes('word') || file.mimeType.includes('docx');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur flex items-center justify-center p-6 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Visual Preview Side */}
        <div className="flex-1 bg-zinc-900 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-zinc-800 aspect-video md:aspect-auto md:min-h-[400px]">
          {isImage ? (
            <img
              src={file.filePath}
              alt={file.filename}
              className="max-h-[350px] object-contain rounded-lg shadow-xl"
            />
          ) : isPdf ? (
            <div className="flex flex-col items-center gap-4 text-zinc-500">
              <FileText className="h-20 w-20 text-violet-500" />
              <span className="text-xs font-mono font-semibold">PDF DOCUMENT</span>
            </div>
          ) : isExcel ? (
            <div className="flex flex-col items-center gap-4 text-zinc-500">
              <FileSpreadsheet className="h-20 w-20 text-emerald-500" />
              <span className="text-xs font-mono font-semibold">EXCEL SPREADSHEET</span>
            </div>
          ) : isWord ? (
            <div className="flex flex-col items-center gap-4 text-zinc-500">
              <FileText className="h-20 w-20 text-blue-500" />
              <span className="text-xs font-mono font-semibold">WORD DOCUMENT</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-zinc-500">
              <File className="h-20 w-20" />
              <span className="text-xs font-mono">FILE ATTACHMENT</span>
            </div>
          )}
        </div>

        {/* Metadata Details Side */}
        <div className="w-full md:w-[320px] p-6 flex flex-col justify-between h-[400px] md:h-auto">
          {/* Top segment */}
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="overflow-hidden pr-4">
                <h3 className="text-sm font-bold text-white truncate" title={file.filename}>
                  {file.filename}
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Asset Details</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 border-t border-zinc-900 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">File Size</span>
                <span className="font-semibold text-zinc-300">{formatSize(file.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MIME Type</span>
                <span className="font-mono text-zinc-300">{file.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Upload Date</span>
                <span className="text-zinc-300">{new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex flex-col gap-2 border-t border-zinc-900 pt-4 mt-6">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-all"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Public Link</span>
            </button>
            <a
              href={file.filePath}
              download={file.filename}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </a>
            <button
              onClick={async () => {
                if (confirm('Permanently purge this asset from cloud storage?')) {
                  await onDelete(file.id);
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 transition-all mt-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Asset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
