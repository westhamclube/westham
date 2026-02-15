'use client';

import { useRef, useState } from 'react';

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  currentUrl,
  onUpload,
  label = 'Imagem',
  className = '',
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem (JPG, PNG, etc.)');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
        >
          {uploading ? 'Enviando...' : currentUrl ? 'Trocar imagem' : 'Escolher arquivo'}
        </button>
        {currentUrl && (
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

