import { Note } from '../types';

const STORAGE_KEY = 'thinkink_notes';

export const saveNote = (note: Note): void => {
  const notes = getNotes();
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const getNotes = (): Note[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteNote = (id: string): void => {
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const getNoteById = (id: string): Note | undefined => {
  return getNotes().find(n => n.id === id);
};