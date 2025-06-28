import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';

const api = {
    getRewards: async () => (await fetch('/api/rewards')).json(),
    redeemReward: async (userId, rewardId) => {
        const response = await fetch('/api/user-rewards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, reward_id: rewardId }),
        });
        return response.json();
    }
};

export default function RewardPage({ user }) {
    const [rewards, setRewards] = useState([]);

    useEffect(() => {
        api.getRewards().then(setRewards);
    }, []);

    const handleRedeemReward = async (rewardId) => {
        await api.redeemReward(user.id, rewardId);
        alert('Reward redeemed! An admin will review your request.');
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Available Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                    <div key={reward.id} className="bg-gray-800 rounded-lg p-6 text-center">
                        <Gift size={48} className="mx-auto text-yellow-400 mb-4" />
                        <h3 className="text-2xl font-bold text-white">{reward.name}</h3>
                        <p className="text-gray-400 mt-2">{reward.description}</p>
                        <p className="text-lg font-bold text-green-500 mt-4">${reward.cost}</p>
                        <button onClick={() => handleRedeemReward(reward.id)} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">Redeem</button>
                    </div>
                ))}
            </div>
        </div>
    );
}