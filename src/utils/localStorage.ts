import { CardDeck, StudySession, UserStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

// LocalStorage Keys
const DECKS_KEY = 'flashcard-decks';
const FIRST_VISIT_KEY = 'flashcard-first-visit';
const USER_STATS_KEY = 'flashcard-user-stats';
const STUDY_SESSIONS_KEY = 'flashcard-study-sessions';

// Demo data for first-time users
const demoDecks: CardDeck[] = [
  {
    id: 'demo-1',
    name: 'JavaScript Basics',
    description: 'Basic concepts in JavaScript programming language',
    category: 'Programming',
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
    category: 'Programming',
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

// Default user stats
const defaultUserStats: UserStats = {
  totalStudySessions: 0,
  totalCardsStudied: 0,
  totalCorrectAnswers: 0,
  totalIncorrectAnswers: 0,
  averageAccuracy: 0,
  studyTime: 0,
  lastStudySession: 0,
  studySessions: [],
};

// Check if it's first visit and initialize with demo data if needed
export const initializeStorage = (): void => {
  const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) === null;
  
  if (isFirstVisit) {
    localStorage.setItem(DECKS_KEY, JSON.stringify(demoDecks));
    localStorage.setItem(FIRST_VISIT_KEY, 'false');
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(defaultUserStats));
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify([]));
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

// Get user stats
export const getUserStats = (): UserStats => {
  const statsJSON = localStorage.getItem(USER_STATS_KEY);
  return statsJSON ? JSON.parse(statsJSON) : defaultUserStats;
};

// Save user stats
export const saveUserStats = (stats: UserStats): void => {
  localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
};

// Get study sessions
export const getStudySessions = (): StudySession[] => {
  const sessionsJSON = localStorage.getItem(STUDY_SESSIONS_KEY);
  return sessionsJSON ? JSON.parse(sessionsJSON) : [];
};

// Save study sessions
export const saveStudySessions = (sessions: StudySession[]): void => {
  localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sessions));
};

// Add a new study session
export const addStudySession = (session: Omit<StudySession, 'id'>): StudySession => {
  const newSession: StudySession = {
    ...session,
    id: uuidv4(),
  };
  
  const sessions = getStudySessions();
  saveStudySessions([...sessions, newSession]);
  
  // Update user stats
  const userStats = getUserStats();
  const updatedStats: UserStats = {
    ...userStats,
    totalStudySessions: userStats.totalStudySessions + 1,
    totalCardsStudied: userStats.totalCardsStudied + session.cardsStudied,
    totalCorrectAnswers: userStats.totalCorrectAnswers + session.correctAnswers,
    totalIncorrectAnswers: userStats.totalIncorrectAnswers + session.incorrectAnswers,
    averageAccuracy: calculateAverageAccuracy(userStats, session),
    lastStudySession: session.date,
    studySessions: [...userStats.studySessions, newSession.id],
  };
  
  saveUserStats(updatedStats);
  
  return newSession;
};

// Helper function to calculate average accuracy
const calculateAverageAccuracy = (
  userStats: UserStats, 
  newSession: Omit<StudySession, 'id'>
): number => {
  const totalAnswers = userStats.totalCorrectAnswers + userStats.totalIncorrectAnswers + 
    newSession.correctAnswers + newSession.incorrectAnswers;
  
  if (totalAnswers === 0) return 0;
  
  const totalCorrect = userStats.totalCorrectAnswers + newSession.correctAnswers;
  return Math.round((totalCorrect / totalAnswers) * 100);
}; 