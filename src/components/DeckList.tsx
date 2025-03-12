import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDecks, deleteDeck } from '../utils/localStorage';
import { CardDeck } from '../types';

const DeckList = () => {
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<CardDeck[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Load decks from localStorage when the component mounts
  useEffect(() => {
    const loadedDecks = getDecks();
    setDecks(loadedDecks);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(loadedDecks
      .map(deck => deck.category)
      .filter(category => category) as string[])];
    
    setCategories(uniqueCategories);
  }, []);

  // Filter decks when selection changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDecks(decks);
    } else {
      setFilteredDecks(decks.filter(deck => deck.category === selectedCategory));
    }
  }, [selectedCategory, decks]);

  // Handle deck deletion
  const handleDeleteDeck = (id: string) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(id);
      const updatedDecks = getDecks();
      setDecks(updatedDecks);
      
      // Update categories list if needed
      const uniqueCategories = [...new Set(updatedDecks
        .map(deck => deck.category)
        .filter(category => category) as string[])];
      
      setCategories(uniqueCategories);
    }
  };

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  // Group decks by category for display
  const renderDecksByCategory = () => {
    if (selectedCategory !== 'all') {
      // If a specific category is selected, just render those decks
      return (
        <div className="category-section">
          <h3 className="category-title">{selectedCategory}</h3>
          <div className="grid">
            {renderDeckCards(filteredDecks)}
          </div>
        </div>
      );
    }

    // For "All" category, group by category
    const decksByCategory: Record<string, CardDeck[]> = {};
    
    // Group for decks with no category
    const uncategorizedDecks = filteredDecks.filter(deck => !deck.category);
    
    // Group decks by their categories
    filteredDecks.forEach(deck => {
      if (deck.category) {
        if (!decksByCategory[deck.category]) {
          decksByCategory[deck.category] = [];
        }
        decksByCategory[deck.category].push(deck);
      }
    });

    return (
      <>
        {/* Render each category */}
        {Object.entries(decksByCategory).map(([category, categoryDecks]) => (
          <div key={category} className="category-section">
            <h3 className="category-title">{category}</h3>
            <div className="grid">
              {renderDeckCards(categoryDecks)}
            </div>
          </div>
        ))}
        
        {/* Render uncategorized decks */}
        {uncategorizedDecks.length > 0 && (
          <div className="category-section">
            <h3 className="category-title">Uncategorized</h3>
            <div className="grid">
              {renderDeckCards(uncategorizedDecks)}
            </div>
          </div>
        )}
      </>
    );
  };

  // Helper to render deck cards
  const renderDeckCards = (decksToRender: CardDeck[]) => {
    return decksToRender.map(deck => (
      <div key={deck.id} className="card">
        <h3 className="card-title">{deck.name}</h3>
        {deck.category && <span className="deck-category-tag">{deck.category}</span>}
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
    ));
  };

  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>Your Flashcard Decks</h2>
        <div className="deck-list-actions">
          <div className="category-filter">
            <label htmlFor="category-select">Filter by Category:</label>
            <select 
              id="category-select" 
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="form-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <Link to="/create-deck" className="btn btn-primary">Create New Deck</Link>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any flashcard decks yet.</p>
          <Link to="/create-deck" className="btn btn-primary">Create Your First Deck</Link>
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="empty-state">
          <p>No decks found in this category.</p>
          <button 
            onClick={() => setSelectedCategory('all')} 
            className="btn btn-secondary"
          >
            Show All Categories
          </button>
        </div>
      ) : (
        <div className="decks-by-category">
          {renderDecksByCategory()}
        </div>
      )}
    </div>
  );
};

export default DeckList; 