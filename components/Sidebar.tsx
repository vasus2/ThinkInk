import React from 'react';
import { Note } from '../types';
import { Plus, FileText, Clock, Trash2, Search } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNew: () => void;
  onDeleteNote: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNew,
  onDeleteNote,
}) => {
  return (
    <div className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 h-full flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 mb-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <span className="font-serif italic">T</span>
          </div>
          ThinkInk
        </div>
        
        <button
          onClick={onCreateNew}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Note
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
            <input 
                type="text" 
                placeholder="Search notes..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {notes.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400">
            <p className="text-sm">No notes yet.</p>
            <p className="text-xs mt-1">Upload a handwritten page to get started.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`group relative flex flex-col p-3 rounded-lg cursor-pointer transition-all border ${
                selectedNoteId === note.id
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="flex items-start justify-between">
                <h3 className={`font-medium text-sm truncate pr-4 ${selectedNoteId === note.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {note.title || 'Untitled Note'}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 h-8">
                {note.extractedText.substring(0, 60) || "No text extracted"}
              </p>
              
              <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                <Clock size={10} />
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
        <span>User: Demo User</span>
        <span>v1.0.0 MVP</span>
      </div>
    </div>
  );
};