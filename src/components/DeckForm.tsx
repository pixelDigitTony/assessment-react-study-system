import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getDeckById, addDeck, updateDeck, getDecks } from '../utils/localStorage';
import { CardDeck } from '../types';

const DeckForm = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(deckId);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: string;
  }>({
    name: '',
    description: '',
    category: '',
  });

  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load deck data if in edit mode and extract existing categories
  useEffect(() => {
    // Get all existing categories from decks
    const decks = getDecks();
    const categories = [...new Set(decks.map(deck => deck.category).filter(Boolean) as string[])];
    setExistingCategories(categories);

    if (isEditMode && deckId) {
      const deck = getDeckById(deckId);
      if (deck) {
        setFormData({
          name: deck.name,
          description: deck.description,
          category: deck.category || '',
        });
      } else {
        setError('Deck not found');
      }
    }
  }, [isEditMode, deckId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // If "Add New Category" is selected
    if (name === 'category' && value === 'new') {
      setShowNewCategoryInput(true);
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory(e.target.value);
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setExistingCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        category: newCategory,
      }));
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      setError('Deck name is required');
      return;
    }

    // Create or update deck
    const timestamp = Date.now();
    const finalCategory = showNewCategoryInput ? newCategory : formData.category;

    if (isEditMode && deckId) {
      // Update existing deck
      const existingDeck = getDeckById(deckId);
      if (existingDeck) {
        const updatedDeck: CardDeck = {
          ...existingDeck,
          name: formData.name,
          description: formData.description,
          category: finalCategory,
          updatedAt: timestamp,
        };
        updateDeck(updatedDeck);
        navigate(`/deck/${deckId}`);
      }
    } else {
      // Create new deck
      const newDeck: CardDeck = {
        id: uuidv4(),
        name: formData.name,
        description: formData.description,
        category: finalCategory,
        cards: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      addDeck(newDeck);
      navigate('/');
    }
  };

  return (
    <div className="deck-form">
      <h2>{isEditMode ? 'Edit Deck' : 'Create New Deck'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Deck Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter a name for your deck"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter a description for your deck"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">-- Select Category --</option>
            {existingCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
            <option value="new">+ Add New Category</option>
          </select>
        </div>

        {showNewCategoryInput && (
          <div className="form-group new-category-input">
            <label htmlFor="newCategory" className="form-label">New Category Name</label>
            <div className="input-with-button">
              <input
                type="text"
                id="newCategory"
                value={newCategory}
                onChange={handleNewCategoryChange}
                className="form-input"
                placeholder="Enter new category name"
              />
              <button 
                type="button"
                onClick={handleAddNewCategory}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Deck' : 'Create Deck'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeckForm; 