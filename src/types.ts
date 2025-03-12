export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  lastStudied?: number; // timestamp
  isCorrect?: boolean;
}

export interface CardDeck {
  id: string;
  name: string;
  description: string;
  cards: FlashCard[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface StudyStats {
  deckId: string;
  totalCards: number;
  correctCards: number;
  incorrectCards: number;
  lastStudied: number; // timestamp
} 