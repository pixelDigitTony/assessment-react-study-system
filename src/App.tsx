import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { initializeStorage } from './utils/localStorage';
import './App.css';
import DeckList from './components/DeckList';
import DeckForm from './components/DeckForm';
import Deck from './components/Deck';
import StudyMode from './components/StudyMode';

function App() {
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
          </nav>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<DeckList />} />
            <Route path="/create-deck" element={<DeckForm />} />
            <Route path="/edit-deck/:deckId" element={<DeckForm />} />
            <Route path="/deck/:deckId" element={<Deck />} />
            <Route path="/study/:deckId" element={<StudyMode />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Flash Card Study System - {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
