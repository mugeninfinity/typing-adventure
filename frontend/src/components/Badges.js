import React from 'react';

export default function Badges({ achievements, unlockedAchievements, getProgress }) {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">My Badges</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-lg mb-2">Unlocked</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {achievements.filter(a => unlockedAchievements.includes(a.id)).map(badge => (
                            <div key={badge.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center">
                                <div className="text-5xl h-14 w-14 mx-auto flex items-center justify-center">{badge.icon_type === 'emoji' ? badge.icon : <img src={badge.icon} alt={badge.title} className="w-14 h-14 object-cover"/>}</div>
                                <h4 className="font-bold mt-2">{badge.title}</h4>
                                <p className="text-xs text-gray-500">{badge.description}</p>
                            </div>
                        ))}
                        {unlockedAchievements.length === 0 && <p className="text-gray-500 col-span-full">No badges yet. Keep typing!</p>}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2 mt-6">Locked</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {achievements.filter(a => !unlockedAchievements.includes(a.id)).map(badge => { 
                            const progress = getProgress(badge); 
                            return (
                                <div key={badge.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center opacity-50">
                                    <div className="text-5xl h-14 w-14 mx-auto flex items-center justify-center">{badge.icon_type === 'emoji' ? badge.icon : <img src={badge.icon} alt={badge.title} className="w-14 h-14 object-cover"/>}</div>
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
    );
}