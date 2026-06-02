'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  Search,
  Upload,
  Plus,
  Grid,
  List as ListIcon,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  Trash2,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { PreviewModal } from '../../components/media/PreviewModal';

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
}

interface FileItem {
  id: string;
  folderId: string | null;
  filename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export default function MediaExplorer() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | 'root'>('root');
  const [folderPath, setFolderPath] = useState<FolderItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Load directories and files
  const loadMedia = async () => {
    try {
      const parentQuery = currentFolderId === 'root' ? '' : `?parentId=${currentFolderId}`;
      const folderRes = await fetch(`/api/v1/media/folders${parentQuery}`);
      if (folderRes.ok) {
        const folderData = await folderRes.json();
        setFolders(folderData.data || []);
      }

      const fileQuery = currentFolderId === 'root' ? '?folderId=root' : `?folderId=${currentFolderId}`;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const fileRes = await fetch(`/api/v1/media${fileQuery}${searchParam}`);
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        setFiles(fileData.data || []);
      }
    } catch (err) {
      console.error('Error fetching S3 assets:', err);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [currentFolderId, search]);

  const handleCreateFolder = async () => {
    const name = prompt('Enter new folder directory name:');
    if (!name) return;

    try {
      const res = await fetch('/api/v1/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: currentFolderId === 'root' ? undefined : currentFolderId,
        }),
      });

      if (res.ok) {
        loadMedia();
      } else {
        alert('Failed to register directory.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolderId !== 'root') {
      formData.append('folderId', currentFolderId);
    }

    try {
      setUploading(true);
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      setUploading(false);
      if (res.ok) {
        loadMedia();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'File size limits <= 20MB or unsupported mime type.');
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/media/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadMedia();
      } else {
        alert('Failed to delete asset.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFolderEnter = (folder: FolderItem) => {
    setFolderPath([...folderPath, folder]);
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setFolderPath([]);
      setCurrentFolderId('root');
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4 backdrop-blur bg-[#09090b]/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">HealthAlliance</h1>
              <p className="text-[10px] text-zinc-500 font-mono">OBJECT CLOUD STORAGE MANAGER</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-950 border border-zinc-800 p-4 rounded-xl shadow-lg">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Search static media files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-all shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Create Folder</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white transition-all shadow-lg shadow-violet-500/10 cursor-pointer">
              {uploading ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </>
              )}
              <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>

            {/* View Modes */}
            <div className="flex items-center border border-zinc-800 rounded-lg p-1 bg-zinc-900 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'grid' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid view"
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="List view"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <button onClick={() => handleBreadcrumbClick(-1)} className="hover:text-white transition-colors">
            Root Storage
          </button>
          {folderPath.map((folder, idx) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`hover:text-white transition-colors ${
                  idx === folderPath.length - 1 ? 'text-zinc-300 pointer-events-none' : ''
                }`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Folder items & Files list board */}
        {folders.length === 0 && files.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col items-center justify-center p-20 text-center transition-all bg-zinc-950 shadow-inner">
            <span className="text-3xl mb-4">📂</span>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Directory is empty
            </h3>
            <p className="text-xs text-zinc-600 mt-2 max-w-xs leading-relaxed">
              Create a sub-folder directory or select upload to fill this cloud storage.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {/* Render sub-folders */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onDoubleClick={() => handleFolderEnter(folder)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-violet-500/25 cursor-pointer flex flex-col gap-3 group transition-all shadow-md hover:-translate-y-0.5 duration-300"
              >
                <div className="p-3 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-violet-400 border border-zinc-900 w-fit transition-colors">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white truncate">
                    {folder.name}
                  </h4>
                  <span className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase">Directory</span>
                </div>
              </div>
            ))}

            {/* Render files */}
            {files.map((file) => {
              const isImage = file.mimeType.startsWith('image/');
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 hover:border-violet-500/25 cursor-pointer flex flex-col gap-3 group overflow-hidden transition-all shadow-md hover:-translate-y-0.5 duration-300"
                >
                  <div className="aspect-video bg-zinc-900 border-b border-zinc-900 flex items-center justify-center text-zinc-600 overflow-hidden relative">
                    {isImage ? (
                      <img src={file.filePath} alt={file.filename} className="object-cover w-full h-full" />
                    ) : file.mimeType === 'application/pdf' ? (
                      <FileText className="h-8 w-8 text-violet-500" />
                    ) : file.mimeType.includes('spreadsheet') || file.mimeType.includes('xlsx') ? (
                      <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                    ) : (
                      <File className="h-8 w-8" />
                    )}
                  </div>
                  <div className="p-3 overflow-hidden">
                    <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white truncate" title={file.filename}>
                      {file.filename}
                    </h4>
                    <span className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase">{formatSize(file.fileSize)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List Mode Table display */
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg select-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Filename</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Size</th>
                  <th className="px-6 py-3.5">Date Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {/* Folders */}
                {folders.map((folder) => (
                  <tr
                    key={folder.id}
                    onDoubleClick={() => handleFolderEnter(folder)}
                    className="hover:bg-zinc-900/20 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-3 font-bold text-zinc-300 group-hover:text-white transition-colors">
                      <Folder className="h-4.5 w-4.5 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                      <span>{folder.name}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-mono text-[10px] uppercase">Folder Directory</td>
                    <td className="px-6 py-4 text-zinc-600">--</td>
                    <td className="px-6 py-4 text-zinc-600">--</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="h-4 w-4 ml-auto text-zinc-700 group-hover:text-white" />
                    </td>
                  </tr>
                ))}

                {/* Files */}
                {files.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="hover:bg-zinc-900/20 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-zinc-300 group-hover:text-white transition-colors truncate max-w-xs">
                      <div className="flex items-center gap-3">
                        {file.mimeType.startsWith('image/') ? (
                          <ImageIcon className="h-4.5 w-4.5 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                        ) : (
                          <File className="h-4.5 w-4.5 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                        )}
                        <span className="truncate">{file.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-[10px] truncate max-w-[120px]">{file.mimeType}</td>
                    <td className="px-6 py-4 text-zinc-400">{formatSize(file.fileSize)}</td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={file.filePath}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                          title="Open public link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Delete S3 asset?')) handleDeleteFile(file.id);
                          }}
                          className="p-1 rounded hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Floating Preview Overlay Modal */}
      <PreviewModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDeleteFile}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-6 bg-zinc-950 text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © 2026 HealthAlliance Object Storage. Designed for secure high-scale assets distribution.
          </p>
        </div>
      </footer>
    </div>
  );
}
