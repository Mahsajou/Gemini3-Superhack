
import React, { useRef, useState } from 'react';

interface Props {
  onUpload: (base64: string) => void;
}

export const VideoUploader: React.FC<Props> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative h-64 border-2 border-dashed rounded-3xl transition-all duration-200 flex flex-col items-center justify-center space-y-4 px-6 text-center ${
        dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={handleChange}
      />
      
      <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <div>
        <p className="text-zinc-200 font-medium">
          {fileName ? `Ready: ${fileName}` : 'Drop your 3s video here'}
        </p>
        <p className="text-zinc-500 text-sm mt-1">MP4, MOV supported. Max 50MB.</p>
      </div>
      
      <button 
        onClick={() => inputRef.current?.click()}
        className="px-6 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
      >
        Select File
      </button>
    </div>
  );
};
