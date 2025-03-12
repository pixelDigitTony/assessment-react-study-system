import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeckById, updateDeck, addStudySession } from '../utils/localStorage';
import { CardDeck, FlashCard, StudySession } from '../types';

const MAX_LIVES = 5;

const StudyMode = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState<CardDeck | null>(null);
  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [completedCardIds, setCompletedCardIds] = useState<string[]>([]);
  const [lives, setLives] = useState(MAX_LIVES);
  
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    correctCards: 0,
    incorrectCards: 0,
  });
  
  const [error, setError] = useState<string | null>(null);

  // Load deck data and prepare cards for study
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
          setStudyCards([...updatedDeck.cards]);
          setStudyStats({
            totalCards: updatedDeck.cards.length,
            correctCards: 0,
            incorrectCards: 0,
          });
          setSessionStartTime(Date.now());
        }
      } else {
        setError('Deck not found');
      }
    }
  }, [deckId]);

  // Get current card and check for study completion
  useEffect(() => {
    // If there are no more study cards and we haven't marked the session as complete yet
    if (studyCards.length === 0 && deck && !studyComplete && studyStats.correctCards + studyStats.incorrectCards > 0) {
      endStudySession(deck.cards);
    }
  }, [studyCards, deck, studyComplete, studyStats]);

  // Safe access to current card with bounds checking
  const currentCard = studyCards.length > 0 && currentCardIndex < studyCards.length 
    ? studyCards[currentCardIndex] 
    : null;

  // Handle revealing the answer
  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  // Mark the current card as correct or incorrect and move to the next card
  const handleCardResult = (isCorrect: boolean) => {
    if (!deck || !currentCard) return;

    // Update the current card's status
    const updatedCards = [...deck.cards];
    const cardIndex = updatedCards.findIndex(card => card.id === currentCard.id);
    
    if (cardIndex === -1) {
      console.error('Card not found in deck:', currentCard.id);
      return;
    }

    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      isCorrect,
      lastStudied: Date.now(),
      timesCorrect: (updatedCards[cardIndex].timesCorrect || 0) + (isCorrect ? 1 : 0),
      timesIncorrect: (updatedCards[cardIndex].timesIncorrect || 0) + (isCorrect ? 0 : 1),
    };

    // Track completed card
    if (isCorrect && !completedCardIds.includes(currentCard.id)) {
      setCompletedCardIds(prev => [...prev, currentCard.id]);
    }

    // Handle lives system
    if (!isCorrect) {
      // Reduce lives
      const newLives = lives - 1;
      setLives(newLives);
      
      // If out of lives, end the study session
      if (newLives <= 0) {
        endStudySession(updatedCards);
        return;
      }
      
      // Put the card back at the end of the deck
      const updatedStudyCards = [...studyCards];
      updatedStudyCards.splice(currentCardIndex, 1); // Remove current card
      
      // Only add it back if we have more cards to go through first
      if (updatedStudyCards.length > 0) {
        updatedStudyCards.push(currentCard); // Add at the end
      }
      
      setStudyCards(updatedStudyCards);
    } else {
      // If correct, just remove the card from study cards
      const updatedStudyCards = [...studyCards];
      updatedStudyCards.splice(currentCardIndex, 1);
      setStudyCards(updatedStudyCards);
    }

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

    // If we're removing the last card, mark as complete now
    if (studyCards.length === 1) {
      endStudySession(updatedCards);
      return;
    }

    // Adjust current card index if needed
    if (currentCardIndex >= studyCards.length - 1) {
      setCurrentCardIndex(0);
    }
    setShowAnswer(false);
  };

  // End the study session and save stats
  const endStudySession = (updatedCards: FlashCard[]) => {
    setStudyComplete(true);
    
    // Calculate study duration in minutes and store it for stats
    const studyDuration = Math.round((Date.now() - sessionStartTime) / 60000);
    
    // Save study session stats
    if (deckId) {
      const sessionData: Omit<StudySession, 'id'> = {
        deckId,
        date: Date.now(),
        cardsStudied: studyStats.correctCards + studyStats.incorrectCards,
        correctAnswers: studyStats.correctCards,
        incorrectAnswers: studyStats.incorrectCards,
        accuracy: calculateAccuracy(studyStats.correctCards, studyStats.incorrectCards),
        completedCards: completedCardIds,
        duration: studyDuration,
      };
      
      // Update the deck with the updated cards if not already done
      if (deck) {
        const updatedDeck = {
          ...deck,
          cards: updatedCards,
          updatedAt: Date.now(),
        };
        updateDeck(updatedDeck);
      }
      
      addStudySession(sessionData);
    }
  };

  // Calculate accuracy percentage
  const calculateAccuracy = (correct: number, incorrect: number): number => {
    const total = correct + incorrect;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
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
    
    if (updatedDeck.cards.length === 0) {
      setError('This deck has no cards to study.');
      return;
    }
    
    setDeck(updatedDeck);
    updateDeck(updatedDeck);
    setStudyCards([...updatedDeck.cards]);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyComplete(false);
    setLives(MAX_LIVES);
    setCompletedCardIds([]);
    setStudyStats({
      totalCards: updatedDeck.cards.length,
      correctCards: 0,
      incorrectCards: 0,
    });
    setSessionStartTime(Date.now());
  };

  // Render lives display
  const renderLives = () => {
    const hearts = [];
    for (let i = 0; i < MAX_LIVES; i++) {
      hearts.push(
        <span key={i} className="life-icon" style={{ opacity: i < lives ? 1 : 0.3 }}>
          ❤️
        </span>
      );
    }
    return (
      <div className="lives-display">
        <span>Lives:</span> {hearts}
      </div>
    );
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

  if (!deck) {
    return <div>Loading deck...</div>;
  }

  // Important: Check for study completion first
  if (studyComplete) {
    const accuracy = calculateAccuracy(studyStats.correctCards, studyStats.incorrectCards);
    const isFailure = lives <= 0;
    
    return (
      <div className="study-complete">
        <h2>{isFailure ? 'Study Session Failed!' : 'Study Session Complete!'}</h2>
        
        {isFailure && (
          <p className="failure-message">You've run out of lives. Try again to master these cards!</p>
        )}
        
        <div className="study-stats">
          <p>Total Cards: {studyStats.totalCards}</p>
          <p>Correct: {studyStats.correctCards}</p>
          <p>Incorrect: {studyStats.incorrectCards}</p>
          <p>
            Accuracy: {accuracy}%
          </p>
          <p>
            Lives Remaining: {lives}/{MAX_LIVES}
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

  if (!currentCard) {
    return <div>Loading cards...</div>;
  }

  // Render the study card
  return (
    <div className="study-mode">
      <div className="study-header">
        <h2>Studying: {deck.name}</h2>
        {renderLives()}
        <p className="card-progress">
          Card {currentCardIndex + 1} of {studyCards.length} 
          {studyStats.correctCards > 0 && ` (${studyStats.correctCards} completed)`}
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