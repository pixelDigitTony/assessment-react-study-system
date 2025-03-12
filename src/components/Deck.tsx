import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getDeckById, updateDeck } from '../utils/localStorage';
import { CardDeck, FlashCard } from '../types';

const Deck = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<CardDeck | null>(null);
  const [newCard, setNewCard] = useState<{ question: string; answer: string }>({
    question: '',
    answer: '',
  });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load deck data
  useEffect(() => {
    if (deckId) {
      const foundDeck = getDeckById(deckId);
      if (foundDeck) {
        setDeck(foundDeck);
      } else {
        setError('Deck not found');
      }
    }
  }, [deckId]);

  // Handle card form input changes
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingCardId) {
      // Editing existing card
      setDeck(prevDeck => {
        if (!prevDeck) return null;
        const updatedCards = prevDeck.cards.map(card => 
          card.id === editingCardId ? { ...card, [name]: value } : card
        );
        return { ...prevDeck, cards: updatedCards };
      });
    } else {
      // New card
      setNewCard(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Start editing a card
  const handleStartEditing = (cardId: string) => {
    setEditingCardId(cardId);
    setIsAddingCard(false);
  };

  // Cancel editing or adding a card
  const handleCancelEdit = () => {
    setEditingCardId(null);
    setIsAddingCard(false);
    setNewCard({ question: '', answer: '' });
    // Reload the deck to revert any unsaved changes
    if (deckId) {
      const foundDeck = getDeckById(deckId);
      if (foundDeck) {
        setDeck(foundDeck);
      }
    }
  };

  // Save edited card
  const handleSaveEdit = () => {
    if (!deck || !editingCardId) return;
    
    const editedCard = deck.cards.find(card => card.id === editingCardId);
    if (!editedCard) return;
    
    if (!editedCard.question.trim() || !editedCard.answer.trim()) {
      setError('Both question and answer are required');
      return;
    }
    
    const updatedDeck = {
      ...deck,
      updatedAt: Date.now(),
    };
    
    updateDeck(updatedDeck);
    setEditingCardId(null);
    setError(null);
  };

  // Add new card
  const handleAddCard = () => {
    if (!deck) return;
    
    if (!newCard.question.trim() || !newCard.answer.trim()) {
      setError('Both question and answer are required');
      return;
    }
    
    const newFlashCard: FlashCard = {
      id: uuidv4(),
      question: newCard.question,
      answer: newCard.answer,
    };
    
    const updatedDeck: CardDeck = {
      ...deck,
      cards: [...deck.cards, newFlashCard],
      updatedAt: Date.now(),
    };
    
    updateDeck(updatedDeck);
    setDeck(updatedDeck);
    setNewCard({ question: '', answer: '' });
    setIsAddingCard(false);
    setError(null);
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    if (!deck) return;
    
    if (window.confirm('Are you sure you want to delete this card?')) {
      const updatedDeck: CardDeck = {
        ...deck,
        cards: deck.cards.filter(card => card.id !== cardId),
        updatedAt: Date.now(),
      };
      
      updateDeck(updatedDeck);
      setDeck(updatedDeck);
      if (editingCardId === cardId) {
        setEditingCardId(null);
      }
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="deck-details">
      <div className="deck-header">
        <h2>{deck.name}</h2>
        <p className="deck-description">{deck.description}</p>
        <div className="deck-actions">
          <Link to={`/study/${deck.id}`} className="btn btn-primary">Study Deck</Link>
          <Link to={`/edit-deck/${deck.id}`} className="btn btn-secondary">Edit Deck</Link>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
        </div>
      </div>

      <div className="cards-section">
        <div className="cards-header">
          <h3>Flashcards ({deck.cards.length})</h3>
          {!isAddingCard && !editingCardId && (
            <button 
              onClick={() => setIsAddingCard(true)}
              className="btn btn-primary"
            >
              Add Card
            </button>
          )}
        </div>

        {isAddingCard && (
          <div className="card-form card">
            <h4>Add New Card</h4>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="question" className="form-label">Question</label>
              <textarea
                id="question"
                name="question"
                value={newCard.question}
                onChange={handleCardInputChange}
                className="form-textarea"
                placeholder="Enter the question"
              />
            </div>
            <div className="form-group">
              <label htmlFor="answer" className="form-label">Answer</label>
              <textarea
                id="answer"
                name="answer"
                value={newCard.answer}
                onChange={handleCardInputChange}
                className="form-textarea"
                placeholder="Enter the answer"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleAddCard} className="btn btn-primary">Save Card</button>
              <button onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        <div className="cards-list">
          {deck.cards.length === 0 && !isAddingCard ? (
            <div className="empty-state">
              <p>This deck doesn't have any cards yet.</p>
              <button 
                onClick={() => setIsAddingCard(true)}
                className="btn btn-primary"
              >
                Add Your First Card
              </button>
            </div>
          ) : (
            deck.cards.map(card => (
              <div key={card.id} className="card">
                {editingCardId === card.id ? (
                  // Edit mode
                  <div className="card-form">
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                      <label htmlFor={`edit-question-${card.id}`} className="form-label">Question</label>
                      <textarea
                        id={`edit-question-${card.id}`}
                        name="question"
                        value={card.question}
                        onChange={handleCardInputChange}
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`edit-answer-${card.id}`} className="form-label">Answer</label>
                      <textarea
                        id={`edit-answer-${card.id}`}
                        name="answer"
                        value={card.answer}
                        onChange={handleCardInputChange}
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-actions">
                      <button onClick={handleSaveEdit} className="btn btn-primary">Save</button>
                      <button onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <h4>Question:</h4>
                    <p>{card.question}</p>
                    <h4>Answer:</h4>
                    <p>{card.answer}</p>
                    <div className="card-actions">
                      <button 
                        onClick={() => handleStartEditing(card.id)}
                        className="btn btn-secondary"
                        disabled={!!editingCardId}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="btn btn-danger"
                        disabled={!!editingCardId}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Deck; 