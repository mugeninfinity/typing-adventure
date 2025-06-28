import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';

const api = {
    getQuests: async () => (await fetch('/api/quests')).json(),
    acceptQuest: async (userId, questId) => {
        const response = await fetch('/api/user-quests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, quest_id: questId }),
        });
        return response.json();
    }
};

export default function QuestPage({ user }) {
    const [quests, setQuests] = useState([]);

    useEffect(() => {
        api.getQuests().then(setQuests);
    }, []);

    const handleAcceptQuest = async (questId) => {
        await api.acceptQuest(user.id, questId);
        alert('Quest accepted!');
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Available Quests</h2>
            <div className="space-y-4">
                {quests.map((quest) => (
                    <div key={quest.id} className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white">{quest.title}</h3>
                        <p className="text-gray-400 mt-2">{quest.description}</p>
                        <div className="mt-4">
                            <p><strong>Goal:</strong> {quest.goal} {quest.type.replace(/_/g, ' ')}</p>
                            <p><strong>Reward:</strong> ${quest.reward_money}, {quest.reward_xp_multiplier}x XP</p>
                        </div>
                        <button onClick={() => handleAcceptQuest(quest.id)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Accept Quest</button>
                    </div>
                ))}
            </div>
        </div>
    );
}