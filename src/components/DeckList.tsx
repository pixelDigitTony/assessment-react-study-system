import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDecks, deleteDeck } from '../utils/localStorage';
import { CardDeck } from '../types';

const DeckList = () => {
  const [decks, setDecks] = useState<CardDeck[]>([]);

  // Load decks from localStorage when the component mounts
  useEffect(() => {
    setDecks(getDecks());
  }, []);

  // Handle deck deletion
  const handleDeleteDeck = (id: string) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(id);
      setDecks(getDecks());
    }
  };

  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>Your Flashcard Decks</h2>
        <Link to="/create-deck" className="btn btn-primary">Create New Deck</Link>
      </div>

      {decks.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any flashcard decks yet.</p>
          <Link to="/create-deck" className="btn btn-primary">Create Your First Deck</Link>
        </div>
      ) : (
        <div className="grid">
          {decks.map(deck => (
            <div key={deck.id} className="card">
              <h3 className="card-title">{deck.name}</h3>
              <p className="card-description">{deck.description}</p>
              <p>{deck.cards.length} cards</p>
              <div className="card-actions">
                <Link to={`/deck/${deck.id}`} className="btn btn-primary">View Deck</Link>
                <Link to={`/study/${deck.id}`} className="btn btn-success">Study</Link>
                <Link to={`/edit-deck/${deck.id}`} className="btn btn-secondary">Edit</Link>
                <button 
                  onClick={() => handleDeleteDeck(deck.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckList; 