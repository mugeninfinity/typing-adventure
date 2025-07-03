// START COPYING HERE
import React from 'react';
import Badges from './Badges';
import TypingStats from './TypingStats';
import MonPage from './MonPage';
import { Camera, UserIcon } from 'lucide-react';
import * as api from './apiCall';

export default function UserProfile({ user, history, achievements, journal, onAvatarUpdate }) {
   // DEBUG 1: See what props the component receives when it renders.
    console.log("1. UserProfile Rendering. Received onAvatarUpdate:", onAvatarUpdate);
    
    // FIX: The userHistory and userJournal are now directly the props,
    // as App.js already provides the correct, filtered data.
    const userHistory = history || [];
    const userJournal = journal || [];


    // FIX: This new function handles the avatar upload process.
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // DEBUG 2: Confirm the handler is being called.
       // console.log("2. handleAvatarUpload triggered. Uploading file...");

        try {
            const uploadData = await api.uploadFile(file);
            if (uploadData.success) {
                // DEBUG 3: Confirm we are about to call the onAvatarUpdate function with the new path.
         //       console.log("3. Upload successful. Calling onAvatarUpdate with path:", uploadData.path);
                onAvatarUpdate(uploadData.path);
            }
        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert("Avatar upload failed.");
        }
    };

    // FIX: This section calculates the user's level progress for the UI.
    const xpForNextLevel = (user.trainer_level || 1) * 200; // Example formula
    const levelProgress = user.trainer_experience ? (user.trainer_experience / xpForNextLevel) * 100 : 0;

  
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
            <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                    {user.avatar_url ? (
                        <img 
                            src={user.avatar_url} 
                            alt={user.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-yellow-400 flex items-center justify-center">
                            <UserIcon className="text-gray-400" size={64} />
                        </div>
                    )}
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white" size={32} />
                        <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    </label>
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-white">{user.name}</h2>
                    <p className="text-xl text-yellow-400">Trainer Level {user.trainer_level || 1}</p>
                    <div className="w-full bg-gray-700 rounded-full h-4 my-2">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${levelProgress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-400">{user.trainer_experience || 0} / {xpForNextLevel} XP</p>
                </div>
            </div>

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