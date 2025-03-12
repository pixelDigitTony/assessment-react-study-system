import { CardDeck } from '../types';

// LocalStorage Keys
const DECKS_KEY = 'flashcard-decks';
const FIRST_VISIT_KEY = 'flashcard-first-visit';

// Demo data for first-time users
const demoDecks: CardDeck[] = [
  {
    id: 'demo-1',
    name: 'JavaScript Basics',
    description: 'Basic concepts in JavaScript programming language',
    cards: [
      { id: 'js-1', question: 'What is JavaScript?', answer: 'JavaScript is a programming language that enables interactive web pages and is an essential part of web applications.' },
      { id: 'js-2', question: 'What is a closure in JavaScript?', answer: 'A closure is a function that has access to its own scope, the outer function scope, and the global scope.' },
      { id: 'js-3', question: 'What is the difference between let and var?', answer: 'let is block-scoped, while var is function-scoped. let was introduced in ES6.' },
      { id: 'js-4', question: 'What is a Promise?', answer: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation.' },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'demo-2',
    name: 'React Fundamentals',
    description: 'Essential React concepts and hooks',
    cards: [
      { id: 'react-1', question: 'What is JSX?', answer: 'JSX is a syntax extension for JavaScript that looks similar to HTML and is used with React to describe what the UI should look like.' },
      { id: 'react-2', question: 'What are React Hooks?', answer: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components.' },
      { id: 'react-3', question: 'What is the useState hook?', answer: 'useState is a Hook that lets you add React state to function components.' },
      { id: 'react-4', question: 'What is the useEffect hook?', answer: 'useEffect is a hook that lets you perform side effects in function components, similar to componentDidMount and componentDidUpdate.' },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Check if it's first visit and initialize with demo data if needed
export const initializeStorage = (): void => {
  const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) === null;
  
  if (isFirstVisit) {
    localStorage.setItem(DECKS_KEY, JSON.stringify(demoDecks));
    localStorage.setItem(FIRST_VISIT_KEY, 'false');
  }
};

// Get all decks from local storage
export const getDecks = (): CardDeck[] => {
  const decksJSON = localStorage.getItem(DECKS_KEY);
  return decksJSON ? JSON.parse(decksJSON) : [];
};

// Save all decks to local storage
export const saveDecks = (decks: CardDeck[]): void => {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
};

// Get a specific deck by ID
export const getDeckById = (id: string): CardDeck | undefined => {
  const decks = getDecks();
  return decks.find(deck => deck.id === id);
};

// Add a new deck
export const addDeck = (deck: CardDeck): void => {
  const decks = getDecks();
  saveDecks([...decks, deck]);
};

// Update an existing deck
export const updateDeck = (updatedDeck: CardDeck): void => {
  const decks = getDecks();
  const updatedDecks = decks.map(deck => 
    deck.id === updatedDeck.id ? updatedDeck : deck
  );
  saveDecks(updatedDecks);
};

// Delete a deck
export const deleteDeck = (id: string): void => {
  const decks = getDecks();
  const filteredDecks = decks.filter(deck => deck.id !== id);
  saveDecks(filteredDecks);
}; 