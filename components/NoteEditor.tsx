import React, { useState } from 'react';
import { Note } from '../types';
import { Eye, FileText, Edit2, Calendar, Image as ImageIcon } from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, newText: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate }) => {
  const [showImage, setShowImage] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 leading-tight">{note.title}</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                <Calendar size={10} />
                {new Date(note.createdAt).toLocaleString()}
            </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
                onClick={() => setShowImage(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${!showImage ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <FileText size={14} />
                <span>Text</span>
            </button>
            <button
                onClick={() => setShowImage(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${showImage ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <ImageIcon size={14} />
                <span>Original</span>
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative">
        {showImage ? (
           <div className="w-full h-full p-8 flex items-start justify-center bg-slate-50/50">
              <img 
                src={note.imageUrl} 
                alt="Original Note" 
                className="max-w-full max-h-full rounded-xl shadow-lg border border-slate-200 object-contain"
              />
           </div>
        ) : (
            <div className="max-w-3xl mx-auto p-8 md:p-12 h-full">
                <textarea
                    className="w-full h-full resize-none outline-none text-slate-700 text-lg leading-relaxed bg-transparent placeholder-slate-300 font-serif"
                    value={note.extractedText}
                    onChange={(e) => onUpdate(note.id, e.target.value)}
                    placeholder="Start typing or extracting text..."
                    spellCheck={false}
                />
            </div>
        )}
      </div>
    </div>
  );
};