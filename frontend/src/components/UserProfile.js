import React from 'react';
import Badges from './Badges';
import TypingStats from './TypingStats';
import MonPage from './MonPage';

export default function UserProfile({ user, history, achievements, journal }) {
    
    const getProgress = (achievement) => {
        // This function will need to be updated to use the new dynamic achievement system
        // For now, it will return dummy data.
        return { text: 'N/A', percent: 0 };
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Profile: {user.name}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <MonPage user={user} />
                    <div className="mt-8">
                        <Badges achievements={achievements} unlockedAchievements={user.unlocked_achievements} getProgress={getProgress} />
                    </div>
                </div>
                <div>
                    <TypingStats history={history} journal={journal} />
                </div>
            </div>
        </div>
    );
}