// START COPYING HERE
import React from 'react';
import Badges from './Badges';
import TypingStats from './TypingStats';
import MonPage from './MonPage';

export default function UserProfile({ user, history, achievements, journal }) {
    
    // FIX: The userHistory and userJournal are now directly the props,
    // as App.js already provides the correct, filtered data.
    const userHistory = history || [];
    const userJournal = journal || [];

    const getProgress = (achievement) => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const historyInTime = (duration) => userHistory.filter(h => now - new Date(h.timestamp).getTime() < duration);
        
        const totalCardsCompleted = userHistory.length;
        const totalWordsTyped = userHistory.reduce((sum, h) => sum + h.word_count, 0);
        const totalCharsTyped = userHistory.reduce((sum, h) => sum + h.char_count, 0);
        const journalEntries = userJournal.length;
        const journalWords = userJournal.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
        const journalChars = userJournal.reduce((sum, entry) => sum + (entry.char_count || 0), 0);

        let current = 0;
        switch(achievement.type) {
            case 'total_cards_completed': current = totalCardsCompleted; break;
            case 'total_words_typed': current = totalWordsTyped; break;
            case 'total_chars_typed': current = totalCharsTyped; break;
            case 'total_cards_day': current = historyInTime(day).length; break;
            case 'total_cards_week': current = historyInTime(7 * day).length; break;
            case 'total_cards_month': current = historyInTime(30 * day).length; break;
            case 'journal_entries': current = journalEntries; break;
            case 'journal_words': current = journalWords; break;
            case 'journal_chars': current = journalChars; break;
            case 'journal_entry_words': current = Math.max(0, ...userJournal.map(entry => entry.word_count || 0)); break;
            case 'journal_entry_chars': current = Math.max(0, ...userJournal.map(entry => entry.char_count || 0)); break;
            default: return { text: 'N/A', percent: 0};
        }
        return { text: `${current} / ${achievement.value}`, percent: (current / achievement.value) * 100 };
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Profile: {user.name}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <MonPage user={user} />
                    <div className="mt-8">
                        <Badges achievements={achievements} unlockedAchievements={user.unlocked_achievements || []} getProgress={getProgress} />
                    </div>
                </div>
                <div>
                    <TypingStats history={userHistory} journal={userJournal} />
                </div>
            </div>
        </div>
    );
}
// END COPYING HERE