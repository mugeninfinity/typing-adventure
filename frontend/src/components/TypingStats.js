import React from 'react';

export default function TypingStats({ history, journal }) {
    const dailyTypingStats = history.reduce((acc, record) => {
        const date = new Date(record.timestamp).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, records: [] };
        }
        acc[date].records.push(record);
        return acc;
    }, {});

    const dailyTypingSummaries = Object.values(dailyTypingStats).map(day => {
        const totalWords = day.records.reduce((sum, r) => sum + r.word_count, 0);
        const totalChars = day.records.reduce((sum, r) => sum + r.char_count, 0);
        const avgWpm = day.records.length > 0 ? day.records.reduce((sum, r) => sum + r.wpm, 0) / day.records.length : 0;
        const avgAcc = day.records.length > 0 ? day.records.reduce((sum, r) => sum + r.accuracy, 0) / day.records.length : 0;
        return { date: day.date, totalWords, totalChars, avgWpm: avgWpm.toFixed(0), avgAcc: avgAcc.toFixed(0), cardsCompleted: day.records.length };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const dailyJournalStats = journal.reduce((acc, entry) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, entries: 0, words: 0, chars: 0 };
        }
        acc[date].entries++;
        acc[date].words += entry.word_count;
        acc[date].chars += entry.char_count;
        return acc;
    }, {});
    const dailyJournalSummaries = Object.values(dailyJournalStats).sort((a,b) => new Date(b.date) - new Date(a.date));

    return (
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
    );
}