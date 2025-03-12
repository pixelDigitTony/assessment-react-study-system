export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  lastStudied?: number; // timestamp
  isCorrect?: boolean;
  timesCorrect?: number; // number of times answered correctly
  timesIncorrect?: number; // number of times answered incorrectly
}

export interface CardDeck {
  id: string;
  name: string;
  description: string;
  cards: FlashCard[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  category?: string; // optional category for organization
}

export interface StudyStats {
  deckId: string;
  totalCards: number;
  correctCards: number;
  incorrectCards: number;
  lastStudied: number; // timestamp
  accuracy: number; // percentage
}

export interface StudySession {
  id: string;
  deckId: string;
  date: number; // timestamp
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // percentage
  completedCards: string[]; // array of card IDs completed in this session
  duration?: number; // duration in minutes (optional for backward compatibility)
}

export interface UserStats {
  totalStudySessions: number;
  totalCardsStudied: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  averageAccuracy: number;
  studyTime: number; // total time spent studying in minutes
  lastStudySession: number; // timestamp
  studySessions: string[]; // array of session IDs
} 