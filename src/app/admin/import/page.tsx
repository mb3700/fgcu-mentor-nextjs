'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import type { ImportedMentor } from '@/types';

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportedMentor[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setParsing(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await fetch('/api/import', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      setPreview(data.mentors || []);
    } else {
      setError(data.error || 'Failed to parse file');
    }
    setParsing(false);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/import?confirm=true', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      alert(`Successfully imported ${data.imported} mentors!`);
      router.push('/admin/mentors');
    } else {
      setError(data.error || 'Import failed');
    }
    setImporting(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      handleFileSelect(droppedFile);
    } else {
      setError('Please upload an Excel file (.xlsx or .xls)');
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Import Mentors</h1>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="glass-card rounded-2xl p-8 shadow-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-fgcu-blue/30 transition-colors mb-6"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {file ? (
          <p className="text-sm font-medium text-fgcu-blue">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Drop your Excel file here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">Supports .xlsx and .xls files (Monday.com export format)</p>
          </>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mb-6">{error}</div>
      )}

      {parsing && (
        <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && !parsing && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-fgcu-blue">{preview.length}</span> mentors parsed from file
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setPreview([]); setFile(null); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 bg-fgcu-green hover:bg-fgcu-green-light disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                {importing ? 'Importing...' : `Import ${preview.length} Mentors`}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">#</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">Title</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">Company</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">Programs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((m, i) => (
                    <tr key={i} className={!m.name ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{m.name || '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{m.title || '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{m.businessName || '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{m.email || '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{m.programs.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-red-500 mt-3">
            Warning: Importing will replace all existing mentor data.
          </p>
        </>
      )}
    </div>
  );
}
