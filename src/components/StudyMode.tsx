import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeckById, updateDeck } from '../utils/localStorage';
import { CardDeck, FlashCard } from '../types';

const StudyMode = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<CardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    correctCards: 0,
    incorrectCards: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Load deck data
  useEffect(() => {
    if (deckId) {
      const foundDeck = getDeckById(deckId);
      if (foundDeck) {
        if (foundDeck.cards.length === 0) {
          setError('This deck has no cards to study.');
        } else {
          // Reset all card stats for a new study session
          const updatedDeck = {
            ...foundDeck,
            cards: foundDeck.cards.map(card => ({
              ...card,
              isCorrect: undefined,
            })),
          };
          setDeck(updatedDeck);
          setStudyStats({
            totalCards: updatedDeck.cards.length,
            correctCards: 0,
            incorrectCards: 0,
          });
        }
      } else {
        setError('Deck not found');
      }
    }
  }, [deckId]);

  // Get current card
  const currentCard = deck?.cards[currentCardIndex];

  // Handle revealing the answer
  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  // Mark the current card as correct or incorrect and move to the next card
  const handleCardResult = (isCorrect: boolean) => {
    if (!deck || !currentCard) return;

    // Update the current card's status
    const updatedCards = [...deck.cards];
    updatedCards[currentCardIndex] = {
      ...updatedCards[currentCardIndex],
      isCorrect,
      lastStudied: Date.now(),
    };

    // Update stats
    const newStats = {
      ...studyStats,
      correctCards: isCorrect 
        ? studyStats.correctCards + 1 
        : studyStats.correctCards,
      incorrectCards: !isCorrect 
        ? studyStats.incorrectCards + 1 
        : studyStats.incorrectCards,
    };

    setStudyStats(newStats);

    // Update deck in state and localStorage
    const updatedDeck = {
      ...deck,
      cards: updatedCards,
      updatedAt: Date.now(),
    };
    setDeck(updatedDeck);
    updateDeck(updatedDeck);

    // Check if we've reached the end of the deck
    if (currentCardIndex === deck.cards.length - 1) {
      setStudyComplete(true);
    } else {
      // Move to the next card
      setCurrentCardIndex(prevIndex => prevIndex + 1);
      setShowAnswer(false);
    }
  };

  // Restart the study session
  const handleRestartStudy = () => {
    if (!deck) return;
    
    // Reset all card stats
    const updatedDeck = {
      ...deck,
      cards: deck.cards.map(card => ({
        ...card,
        isCorrect: undefined,
      })),
    };
    
    setDeck(updatedDeck);
    updateDeck(updatedDeck);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyComplete(false);
    setStudyStats({
      totalCards: updatedDeck.cards.length,
      correctCards: 0,
      incorrectCards: 0,
    });
  };

  if (error) {
    return (
      <div className="study-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!deck || !currentCard) {
    return <div>Loading...</div>;
  }

  // Render study complete screen
  if (studyComplete) {
    return (
      <div className="study-complete">
        <h2>Study Session Complete!</h2>
        <div className="study-stats">
          <p>Total Cards: {studyStats.totalCards}</p>
          <p>Correct: {studyStats.correctCards}</p>
          <p>Incorrect: {studyStats.incorrectCards}</p>
          <p>
            Accuracy: {Math.round((studyStats.correctCards / studyStats.totalCards) * 100)}%
          </p>
        </div>
        <div className="study-actions">
          <button onClick={handleRestartStudy} className="btn btn-primary">
            Study Again
          </button>
          <button onClick={() => navigate(`/deck/${deck.id}`)} className="btn btn-secondary">
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  // Render the study card
  return (
    <div className="study-mode">
      <div className="study-header">
        <h2>Studying: {deck.name}</h2>
        <p className="card-progress">
          Card {currentCardIndex + 1} of {deck.cards.length}
        </p>
      </div>

      <div className="flashcard card">
        <div className="flashcard-content">
          {!showAnswer ? (
            <div className="question-side">
              <h3>Question:</h3>
              <p>{currentCard.question}</p>
              <button
                onClick={handleRevealAnswer}
                className="btn btn-primary"
              >
                Show Answer
              </button>
            </div>
          ) : (
            <div className="answer-side">
              <h3>Question:</h3>
              <p>{currentCard.question}</p>
              <h3>Answer:</h3>
              <p>{currentCard.answer}</p>
              <div className="flashcard-actions">
                <p>How well did you know this?</p>
                <button
                  onClick={() => handleCardResult(true)}
                  className="btn btn-success"
                >
                  Correct
                </button>
                <button
                  onClick={() => handleCardResult(false)}
                  className="btn btn-danger"
                >
                  Incorrect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="study-navigation">
        <button onClick={() => navigate(`/deck/${deck.id}`)} className="btn btn-secondary">
          Exit Study
        </button>
      </div>
    </div>
  );
};

export default StudyMode; 