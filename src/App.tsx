import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { initializeStorage } from './utils/localStorage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';
import DeckList from './components/DeckList';
import DeckForm from './components/DeckForm';
import Deck from './components/Deck';
import StudyMode from './components/StudyMode';
import Stats from './components/Stats';

// Theme toggle component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

// Main App component
function AppContent() {
  // Initialize local storage with demo data if it's the first visit
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Flash Card Study System</h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/create-deck" className="nav-link">Create Deck</Link>
            <Link to="/stats" className="nav-link">Stats</Link>
            <ThemeToggle />
          </nav>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<DeckList />} />
            <Route path="/create-deck" element={<DeckForm />} />
            <Route path="/edit-deck/:deckId" element={<DeckForm />} />
            <Route path="/deck/:deckId" element={<Deck />} />
            <Route path="/study/:deckId" element={<StudyMode />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Flash Card Study System - {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

// Wrap the app with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
