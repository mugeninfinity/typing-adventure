import React, { useState, useEffect } from 'react';
import { Gift, Trash2, Edit } from 'lucide-react';
import { Modal } from './HelperComponents';

const api = {
    getRewards: async () => (await fetch('/api/rewards')).json(),
    saveReward: async (reward) => {
        const url = reward.id ? `/api/rewards/${reward.id}` : '/api/rewards';
        const method = reward.id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reward),
        });
        return response.json();
    },
    deleteReward: async (id) => {
        await fetch(`/api/rewards/${id}`, { method: 'DELETE' });
    },
    getUserRewards: async () => (await fetch('/api/user-rewards')).json(),
    updateUserRewardStatus: async (id, status) => {
        const response = await fetch(`/api/user-rewards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        return response.json();
    }
};

export default function RewardManager() {
    const [rewards, setRewards] = useState([]);
    const [userRewards, setUserRewards] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentReward, setCurrentReward] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const fetchData = async () => {
        setRewards(await api.getRewards());
        setUserRewards(await api.getUserRewards());
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleNew = () => {
        setCurrentReward({ id: null, name: '', description: '', cost: 100 });
        setIsEditing(true);
    };

    const handleEdit = (reward) => {
        setCurrentReward(reward);
        setIsEditing(true);
    };

    const handleDelete = (reward) => {
        setConfirmingDelete(reward);
    };

    const confirmDelete = async () => {
        if (confirmingDelete) {
            await api.deleteReward(confirmingDelete.id);
            await fetchData();
            setConfirmingDelete(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        await api.saveReward(currentReward);
        await fetchData();
        setIsEditing(false);
        setCurrentReward(null);
    };
    
    const handleStatusChange = async (userRewardId, newStatus) => {
        await api.updateUserRewardStatus(userRewardId, newStatus);
        await fetchData();
    };

    if (isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">
                    {currentReward.id ? 'Edit' : 'Create'} Reward
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Name" value={currentReward.name} onChange={(e) => setCurrentReward({ ...currentReward, name: e.target.value })} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <textarea placeholder="Description" value={currentReward.description} onChange={(e) => setCurrentReward({ ...currentReward, description: e.target.value })} className="w-full p-2 bg-gray-700 text-white rounded-md h-24" required />
                    <input type="number" placeholder="Cost" value={currentReward.cost} onChange={(e) => setCurrentReward({ ...currentReward, cost: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-400">Reward Manager</h2>
                <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">
                    <Gift size={18}/> New Reward
                </button>
            </div>
            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Available Rewards</h3>
                <div className="space-y-4">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-lg text-white">{reward.name}</h4>
                                <p className="text-sm text-gray-300">{reward.description}</p>
                                <p className="text-xs text-yellow-400">Cost: ${reward.cost}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(reward)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(reward)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-semibold mb-4">User Reward Requests</h3>
                <div className="space-y-4">
                    {userRewards.map(ur => (
                        <div key={ur.id} className="bg-gray-800 p-4 rounded-lg">
                           <p><strong>{ur.user_name}</strong> requested <strong>{ur.reward_name}</strong> on {new Date(ur.requested_at).toLocaleDateString()}</p>
                           <div className="flex gap-2 mt-2">
                               <button onClick={() => handleStatusChange(ur.id, 'approved')} className={`px-2 py-1 text-xs rounded-md ${ur.status === 'approved' ? 'bg-green-600' : 'bg-gray-600'}`}>Approve</button>
                               <button onClick={() => handleStatusChange(ur.id, 'denied')} className={`px-2 py-1 text-xs rounded-md ${ur.status === 'denied' ? 'bg-red-600' : 'bg-gray-600'}`}>Deny</button>
                               <button onClick={() => handleStatusChange(ur.id, 'redeemed')} className={`px-2 py-1 text-xs rounded-md ${ur.status === 'redeemed' ? 'bg-blue-600' : 'bg-gray-600'}`}>Redeem</button>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the reward "{confirmingDelete.name}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}