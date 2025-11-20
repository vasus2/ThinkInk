import React, { useState, useEffect } from 'react';
import { Note, ViewMode } from './types';
import { Sidebar } from './components/Sidebar';
import { NoteUploader } from './components/NoteUploader';
import { NoteEditor } from './components/NoteEditor';
import { AIAssistant } from './components/AIAssistant';
import { recognizeText } from './services/ocrService';
import { saveNote, getNotes, deleteNote, getNoteById } from './services/storageService';
import { generateTitle } from './services/geminiService';
import { Menu, Key, Loader2 } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check for API Key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for environments where aistudio is not available.
        // We assume true here to allow local development if env vars are set manually,
        // but in the hosted environment this branch won't be taken.
        setHasApiKey(true); 
      }
    };
    checkApiKey();
  }, []);

  // Load notes only after we confirm we can render the app
  useEffect(() => {
    if (hasApiKey) {
        setNotes(getNotes());
    }
  }, [hasApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // Mitigate race condition by optimistically updating state
            setHasApiKey(true);
        } catch (error) {
            console.error("Failed to select key:", error);
        }
    }
  };

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const imageUrl = URL.createObjectURL(file);
      const text = await recognizeText(file, (p) => setProgress(p));
      
      let title = "New Note";
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        imageUrl,
        extractedText: text,
        createdAt: Date.now(),
      };

      saveNote(newNote);
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
      
      generateTitle(text).then(aiTitle => {
          const updatedNote = { ...newNote, title: aiTitle };
          saveNote(updatedNote);
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      });

    } catch (error) {
      alert("Failed to process image.");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleNoteUpdate = (id: string, newText: string) => {
    const note = getNoteById(id);
    if (note) {
      const updatedNote = { ...note, extractedText: newText };
      saveNote(updatedNote);
      setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
    }
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this note?")) {
        deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNoteId === id) {
            setSelectedNoteId(null);
        }
    }
  };

  // Loading State
  if (hasApiKey === null) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
    );
  }

  // API Key Selection Screen
  if (!hasApiKey) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Key className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to ThinkInk</h1>
                <p className="text-slate-600 mb-8">
                    To enable AI-powered insights and OCR processing, please connect your Google Gemini API Key.
                </p>
                
                <button 
                    onClick={handleSelectKey}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]"
                >
                    <Key size={20} />
                    Connect API Key
                </button>

                <div className="text-xs text-slate-400 mt-6">
                    <p>Your API key is used securely by the application.</p>
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="underline hover:text-indigo-600 mt-1 inline-block"
                    >
                        Get an API Key (Billing Documentation)
                    </a>
                </div>
            </div>
        </div>
    );
  }

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
        <button 
            className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            <Menu size={20} />
        </button>

      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative z-30 h-full`}>
        <Sidebar
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={(id) => {
                setSelectedNoteId(id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onCreateNew={() => setSelectedNoteId(null)}
            onDeleteNote={handleDelete}
        />
      </div>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full">
        {selectedNote ? (
          <>
            <NoteEditor
              note={selectedNote}
              onUpdate={handleNoteUpdate}
            />
            <AIAssistant 
                contextText={selectedNote.extractedText} 
                isOpen={isAIOpen}
                onToggle={() => setIsAIOpen(!isAIOpen)}
            />
          </>
        ) : (
          <NoteUploader
            onFileSelected={handleFileSelected}
            isProcessing={isProcessing}
            progress={progress}
          />
        )}
      </main>
    </div>
  );
}