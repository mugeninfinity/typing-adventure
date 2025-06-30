// START COPYING HERE
import React, { useState, useRef } from 'react';
import { Upload, Trash2, Edit, Download, Award } from 'lucide-react';
import { Modal } from './HelperComponents';
import MediaInput from './MediaInput';

export default function AchievementManager({achievements, onAchievementsChange}) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentAchievement, setCurrentAchievement] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const importFileRef = useRef(null);
    
    const handleNew = () => {
        setCurrentAchievement({ id: `custom_${Date.now()}`, title: '', description: '', icon: '??', icon_type: 'emoji', type: 'wpm', value: 100 });
        setIsEditing(true);
    };

    const handleEdit = (ach) => {
        setCurrentAchievement(ach);
        setIsEditing(true);
    };

    const handleDelete = (ach) => {
        setConfirmingDelete(ach);
    };

    const confirmDelete = () => {
        if(confirmingDelete) {
            const updatedAchievements = achievements.filter(a => a.id !== confirmingDelete.id);
            // This now calls the function passed down from App.js
            onAchievementsChange(updatedAchievements);
            setConfirmingDelete(null);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        const updated = achievements.find(a => a.id === currentAchievement.id) 
            ? achievements.map(a => a.id === currentAchievement.id ? currentAchievement : a)
            : [...achievements, currentAchievement];
        
        // This now calls the function passed down from App.js
        onAchievementsChange(updated);
        setIsEditing(false);
        setCurrentAchievement(null);
    };

    const handleExport = () => {
        // This function is correct and remains unchanged
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const rows = text.split('\n').filter(row => row.trim() !== '');
                const headers = rows.shift().split(',').map(h => h.replace(/"/g, '').trim());
                const importedAchievements = rows.map(row => {
                    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
                    const achievement = headers.reduce((obj, header, index) => {
                        obj[header] = values[index] || '';
                        return obj;
                    }, {});
                    return achievement;
                });
                onAchievementsChange([...achievements, ...importedAchievements]);
                alert(`${importedAchievements.length} achievements imported successfully!`);
            } catch (error) {
                alert("Failed to import CSV. Please check the file format.");
                console.error(error);
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const achievementTypes = ['wpm', 'accuracy', 'total_cards_completed', 'total_words_typed', 'total_chars_typed', 'total_cards_day', 'total_cards_week', 'total_cards_month', 'journal_entries', 'journal_words', 'journal_chars', 'journal_entry_words', 'journal_entry_chars'];

    if(isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentAchievement.id.startsWith('custom') ? 'Create' : 'Edit'} Achievement</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Title" value={currentAchievement.title} onChange={e => setCurrentAchievement({...currentAchievement, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <textarea placeholder="Description" value={currentAchievement.description} onChange={e => setCurrentAchievement({...currentAchievement, description: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md h-24" required />
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Icon Type</label>
                        <select value={currentAchievement.icon_type} onChange={e => setCurrentAchievement({...currentAchievement, icon_type: e.target.value, icon: ''})} className="w-full p-2 bg-gray-700 text-white rounded-md">
                            <option value="emoji">Emoji</option>
                            <option value="url">Image URL</option>
                            <option value="upload">Upload</option>
                        </select>
                    </div>

                    {currentAchievement.icon_type === 'upload' && (
                        <MediaInput name="icon" value={currentAchievement.icon} onChange={(key, val) => setCurrentAchievement({...currentAchievement, [key]: val})} />
                    )}
                    {currentAchievement.icon_type === 'url' && (
                         <input type="text" placeholder="Image URL" value={currentAchievement.icon} onChange={e => setCurrentAchievement({...currentAchievement, icon: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    )}
                     {currentAchievement.icon_type === 'emoji' && (
                         <input type="text" placeholder="Icon (Emoji)" value={currentAchievement.icon} onChange={e => setCurrentAchievement({...currentAchievement, icon: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    )}

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Type</label>
                        <select value={currentAchievement.type} onChange={e => setCurrentAchievement({...currentAchievement, type: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md">
                            {achievementTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <input type="number" placeholder="Value" value={currentAchievement.value} onChange={e => setCurrentAchievement({...currentAchievement, value: parseInt(e.target.value) || 0})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button>
                    </div>
                </form>
            </div>
        );
    }
    
    // ... (The rest of the component's JSX remains the same)

// END COPYING HERE
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-400">Achievement Manager</h2>
                <div className="flex gap-2">
                    <input type="file" ref={importFileRef} onChange={handleImport} className="hidden" accept=".csv" />
                    <button onClick={() => importFileRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Upload size={18}/> Import</button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Download size={18}/> Export</button>
                    <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Award size={18}/> New</button>
                </div>
            </div>
            <div className="space-y-4">
                {achievements.map(ach => (
                    <div key={ach.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {ach.icon_type === 'emoji' ? <span className="text-4xl">{ach.icon}</span> : <img src={ach.icon} alt={ach.title} className="w-12 h-12"/>}
                            <div>
                                <h4 className="font-bold text-lg text-white">{ach.title}</h4>
                                <p className="text-sm text-gray-300">{ach.description}</p>
                                <p className="text-xs text-yellow-400">Type: {ach.type}, Value: {ach.value}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(ach)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(ach)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the achievement "{confirmingDelete.title}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}
// END COPYING HERE