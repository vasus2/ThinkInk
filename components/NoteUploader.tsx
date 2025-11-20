import React, { useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface NoteUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  progress: number;
}

export const NoteUploader: React.FC<NoteUploaderProps> = ({ 
  onFileSelected, 
  isProcessing,
  progress 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isProcessing) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelected(e.dataTransfer.files[0]);
      }
    },
    [onFileSelected, isProcessing]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className={`
          relative w-full max-w-2xl aspect-video rounded-2xl border-3 border-dashed 
          flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
          ${
            isProcessing
              ? 'bg-indigo-50 border-indigo-300'
              : 'bg-white border-slate-300 hover:border-indigo-400 hover:bg-slate-50 hover:shadow-lg'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-indigo-900">Digitizing your note...</h3>
            <p className="text-indigo-600 mt-2">Extracting text via Tesseract OCR</p>
            <div className="w-64 h-2 bg-indigo-200 rounded-full mt-6 overflow-hidden">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%`}}
                />
            </div>
            <span className="text-xs text-indigo-500 mt-2 font-mono">{Math.round(progress)}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-6 group">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload Handwritten Note</h3>
            <p className="text-slate-500 max-w-md mb-8 text-lg">
              Drag & drop your JPG/PNG file here, or click to browse.
              We'll convert your handwriting into digital text instantly.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    <span>JPG/PNG supported</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span>Secure Client-side Processing</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};