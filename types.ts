
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  title: string;
  uploadDate: string;
  file: File; // Store the raw File object directly (Blob)
  mimeType: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Note {
  id: string;
  documentId: string;
  title: string;
  content: string; // Markdown content
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  documentId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string; // Term or Question
  back: string;  // Definition or Answer
}

export interface FlashcardSet {
  id: string;
  documentId: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  NOTES = 'NOTES',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS',
}

export interface AppState {
  user: User | null;
  currentView: AppView;
  activeDocumentId: string | null;
}
