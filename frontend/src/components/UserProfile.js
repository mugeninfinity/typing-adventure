import React from 'react';

export default function UserProfile({ user, history, achievements, journal }) {
    const userHistory = history[user.email] || [];
    const userJournal = journal[user.email] || [];

    const dailyTypingStats = userHistory.reduce((acc, record) => {
        const date = new Date(record.timestamp).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, records: [] };
        }
        acc[date].records.push(record);
        return acc;
    }, {});

    const dailyTypingSummaries = Object.values(dailyTypingStats).map(day => {
        const totalWords = day.records.reduce((sum, r) => sum + r.wordCount, 0);
        const totalChars = day.records.reduce((sum, r) => sum + r.charCount, 0);
        const avgWpm = day.records.length > 0 ? day.records.reduce((sum, r) => sum + r.wpm, 0) / day.records.length : 0;
        const avgAcc = day.records.length > 0 ? day.records.reduce((sum, r) => sum + r.accuracy, 0) / day.records.length : 0;
        return { date: day.date, totalWords, totalChars, avgWpm: avgWpm.toFixed(0), avgAcc: avgAcc.toFixed(0), cardsCompleted: day.records.length };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const dailyJournalStats = userJournal.reduce((acc, entry) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, entries: 0, words: 0, chars: 0 };
        }
        acc[date].entries++;
        const plainText = (entry.content || '').replace(/<[^>]+>/g, '');
        const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
        acc[date].words += wordCount;
        acc[date].chars += plainText.length;
        return acc;
    }, {});
    const dailyJournalSummaries = Object.values(dailyJournalStats).sort((a,b) => new Date(b.date) - new Date(a.date));

    const getProgress = (achievement) => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const historyInTime = (duration) => userHistory.filter(h => now - h.timestamp < duration);
        const totalCardsCompleted = userHistory.length;
        const totalWordsTyped = userHistory.reduce((sum, h) => sum + h.wordCount, 0);
        const totalCharsTyped = userHistory.reduce((sum, h) => sum + h.charCount, 0);
        const journalEntries = userJournal.length;
        const journalWords = userJournal.reduce((sum, entry) => sum + ((entry.content || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length), 0);
        const journalChars = userJournal.reduce((sum, entry) => sum + (entry.content || '').replace(/<[^>]+>/g, '').length, 0);

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
            case 'journal_entry_words': current = Math.max(0, ...userJournal.map(entry => (entry.content || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length)); break;
            case 'journal_entry_chars': current = Math.max(0, ...userJournal.map(entry => (entry.content || '').replace(/<[^>]+>/g, '').length)); break;
            default: return { text: 'N/A', percent: 0};
        }
        return { text: `${current} / ${achievement.value}`, percent: (current / achievement.value) * 100 };
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Profile: {user.name}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-4">My Badges</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Unlocked</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {achievements.filter(a => user.unlockedAchievements.includes(a.id)).map(badge => (
                                    <div key={badge.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center">
                                        <div className="text-5xl h-14 w-14 mx-auto flex items-center justify-center">{badge.iconType === 'emoji' ? badge.icon : <img src={badge.icon} alt={badge.title} className="w-14 h-14 object-cover"/>}</div>
                                        <h4 className="font-bold mt-2">{badge.title}</h4>
                                        <p className="text-xs text-gray-500">{badge.description}</p>
                                    </div>
                                ))}
                                {user.unlockedAchievements.length === 0 && <p className="text-gray-500 col-span-full">No badges yet. Keep typing!</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 mt-6">Locked</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {achievements.filter(a => !user.unlockedAchievements.includes(a.id)).map(badge => { 
                                    const progress = getProgress(badge); 
                                    return (
                                        <div key={badge.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center opacity-50">
                                            <div className="text-5xl h-14 w-14 mx-auto flex items-center justify-center">{badge.iconType === 'emoji' ? badge.icon : <img src={badge.icon} alt={badge.title} className="w-14 h-14 object-cover"/>}</div>
                                            <h4 className="font-bold mt-2">{badge.title}</h4>
                                            <p className="text-xs text-gray-500">{badge.description}</p>
                                            <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                                                <div className="bg-yellow-400 h-2.5 rounded-full" style={{width: `${progress.percent}%`}}></div>
                                            </div>
                                            <p className="text-xs text-yellow-500 mt-1">{progress.text}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4">My Typing Progress</h3>
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="border-b border-gray-500"><th>Date</th><th>Words</th><th>Chars</th><th>Avg WPM</th><th>Avg Acc</th><th>Cards</th></tr></thead>
                            <tbody>{dailyTypingSummaries.map(day => (<tr key={day.date} className="border-b border-gray-700"><td>{day.date}</td><td>{day.totalWords}</td><td>{day.totalChars}</td><td>{day.avgWpm}</td><td>{day.avgAcc}%</td><td>{day.cardsCompleted}</td></tr>))}</tbody>
                        </table>
                    </div>
                    <h3 className="text-2xl font-bold my-4">My Journal Progress</h3>
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="border-b border-gray-500"><th>Date</th><th>Entries</th><th>Words</th><th>Chars</th></tr></thead>
                            <tbody>{dailyJournalSummaries.map(day => (<tr key={day.date} className="border-b border-gray-700"><td>{day.date}</td><td>{day.entries}</td><td>{day.words}</td><td>{day.chars}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
