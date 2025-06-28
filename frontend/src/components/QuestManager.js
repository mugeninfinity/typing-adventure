import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, ClipboardList } from 'lucide-react';
import { Modal } from './HelperComponents';

const api = {
    getQuests: async () => (await fetch('/api/quests')).json(),
    saveQuest: async (quest) => {
        const url = quest.id ? `/api/quests/${quest.id}` : '/api/quests';
        const method = quest.id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quest),
        });
        return response.json();
    },
    deleteQuest: async (id) => {
        await fetch(`/api/quests/${id}`, { method: 'DELETE' });
    },
};

export default function QuestManager() {
    const [quests, setQuests] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuest, setCurrentQuest] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const fetchQuests = async () => {
        const questData = await api.getQuests();
        setQuests(questData);
    };

    useEffect(() => {
        fetchQuests();
    }, []);

    const handleNew = () => {
        setCurrentQuest({
            id: null,
            title: '',
            description: '',
            type: 'total_cards_completed',
            goal: 1,
            reward_money: 10,
            reward_xp_multiplier: 1.5,
        });
        setIsEditing(true);
    };

    const handleEdit = (quest) => {
        setCurrentQuest(quest);
        setIsEditing(true);
    };

    const handleDelete = (quest) => {
        setConfirmingDelete(quest);
    };

    const confirmDelete = async () => {
        if (confirmingDelete) {
            await api.deleteQuest(confirmingDelete.id);
            await fetchQuests();
            setConfirmingDelete(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        await api.saveQuest(currentQuest);
        await fetchQuests();
        setIsEditing(false);
        setCurrentQuest(null);
    };
    
    const questTypes = ['wpm', 'accuracy', 'total_cards_completed', 'total_words_typed', 'total_chars_typed', 'total_cards_day', 'total_cards_week', 'total_cards_month', 'journal_entries', 'journal_words', 'journal_chars', 'journal_entry_words', 'journal_entry_chars'];

    if (isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">
                    {currentQuest.id ? 'Edit' : 'Create'} Quest
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Title" value={currentQuest.title} onChange={(e) => setCurrentQuest({ ...currentQuest, title: e.target.value })} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <textarea placeholder="Description" value={currentQuest.description} onChange={(e) => setCurrentQuest({ ...currentQuest, description: e.target.value })} className="w-full p-2 bg-gray-700 text-white rounded-md h-24" required />
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Quest Type</label>
                        <select value={currentQuest.type} onChange={(e) => setCurrentQuest({ ...currentQuest, type: e.target.value })} className="w-full p-2 bg-gray-700 text-white rounded-md">
                            {questTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <input type="number" placeholder="Goal" value={currentQuest.goal} onChange={(e) => setCurrentQuest({ ...currentQuest, goal: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <input type="number" placeholder="Reward Money" value={currentQuest.reward_money} onChange={(e) => setCurrentQuest({ ...currentQuest, reward_money: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <input type="number" step="0.1" placeholder="XP Multiplier" value={currentQuest.reward_xp_multiplier} onChange={(e) => setCurrentQuest({ ...currentQuest, reward_xp_multiplier: parseFloat(e.target.value) || 0 })} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
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
                <h2 className="text-3xl font-bold text-yellow-400">Quest Manager</h2>
                <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">
                    <ClipboardList size={18}/> New Quest
                </button>
            </div>
            <div className="space-y-4">
                {quests.map((quest) => (
                    <div key={quest.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-lg text-white">{quest.title}</h4>
                            <p className="text-sm text-gray-300">{quest.description}</p>
                            <p className="text-xs text-yellow-400">Type: {quest.type}, Goal: {quest.goal}, Reward: ${quest.reward_money}, XP x{quest.reward_xp_multiplier}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(quest)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(quest)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the quest "{confirmingDelete.title}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}