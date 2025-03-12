import { useState, useEffect } from 'react';
import { getUserStats, getStudySessions, getDecks } from '../utils/localStorage';
import { UserStats, StudySession, CardDeck } from '../types';

const Stats = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<Array<StudySession & { deckName: string }>>([]);
  const [decks, setDecks] = useState<CardDeck[]>([]);
  
  useEffect(() => {
    // Load user stats
    const stats = getUserStats();
    setUserStats(stats);
    
    // Load decks for reference
    const allDecks = getDecks();
    setDecks(allDecks);
    
    // Load recent study sessions
    const allSessions = getStudySessions();
    const sortedSessions = [...allSessions]
      .sort((a, b) => b.date - a.date) // Sort by most recent
      .slice(0, 5); // Get only 5 most recent sessions
    
    // Add deck name to each session
    const sessionsWithDeckName = sortedSessions.map(session => {
      const deck = allDecks.find(d => d.id === session.deckId);
      return {
        ...session,
        deckName: deck ? deck.name : 'Unknown Deck'
      };
    });
    
    setRecentSessions(sessionsWithDeckName);
  }, []);

  if (!userStats) {
    return <div>Loading stats...</div>;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="stats-container">
      <h2>Your Study Statistics</h2>
      
      <div className="progress-stats">
        <div className="stat-item">
          <p className="stat-value">{userStats.totalStudySessions}</p>
          <p className="stat-label">Study Sessions</p>
        </div>
        <div className="stat-item">
          <p className="stat-value">{userStats.totalCardsStudied}</p>
          <p className="stat-label">Cards Studied</p>
        </div>
        <div className="stat-item">
          <p className="stat-value">{userStats.averageAccuracy}%</p>
          <p className="stat-label">Average Accuracy</p>
        </div>
        <div className="stat-item">
          <p className="stat-value">{formatDuration(userStats.studyTime)}</p>
          <p className="stat-label">Total Study Time</p>
        </div>
      </div>

      {userStats.lastStudySession > 0 && (
        <p className="last-session">
          Last studied: {formatDate(userStats.lastStudySession)}
        </p>
      )}

      <h3>Recent Study Sessions</h3>
      {recentSessions.length === 0 ? (
        <p>No study sessions yet. Start studying to see your progress!</p>
      ) : (
        <div className="recent-sessions">
          {recentSessions.map(session => (
            <div key={session.id} className="session-card card">
              <h4>{session.deckName}</h4>
              <p className="session-date">{formatDate(session.date)}</p>
              <div className="session-stats">
                <div>
                  <strong>Cards:</strong> {session.cardsStudied}
                </div>
                <div>
                  <strong>Accuracy:</strong> {session.accuracy}%
                </div>
                <div>
                  <strong>Correct:</strong> {session.correctAnswers}
                </div>
                <div>
                  <strong>Incorrect:</strong> {session.incorrectAnswers}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>Decks Progress</h3>
      <div className="decks-progress">
        {decks.map(deck => {
          const deckSessions = getStudySessions().filter(s => s.deckId === deck.id);
          const totalCards = deck.cards.length;
          const studiedCards = new Set(
            deckSessions.flatMap(s => s.completedCards)
          ).size;
          const progressPercentage = totalCards > 0 
            ? Math.round((studiedCards / totalCards) * 100) 
            : 0;
          
          return (
            <div key={deck.id} className="deck-progress card">
              <h4>{deck.name}</h4>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p>{progressPercentage}% complete ({studiedCards}/{totalCards} cards)</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stats; 