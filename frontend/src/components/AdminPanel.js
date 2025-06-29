// START COPYING HERE
import React, { useState, useEffect, useRef } from 'react';
import { Database, Shield, Upload, Trash2, Edit, UserPlus, Users, Settings as SettingsIcon, Award, Download, User as UserIcon, Bone, ClipboardList, Gift } from 'lucide-react';
import { Modal } from './HelperComponents';
import MonManager from './MonManager';
import QuestManager from './QuestManager';
import RewardManager from './RewardManager';

const api = {
    getUsers: async () => (await fetch('/api/users')).json(),
    saveUser: async (user) => {
        const url = user.id ? `/api/users/${user.id}` : '/api/users';
        const method = user.id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        return response.json();
    },
    deleteUser: async (id) => {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
    },
    getCards: async () => (await fetch('/api/cards')).json(),
    saveCard: async (card) => {
        const url = card.id ? `/api/cards/${card.id}` : '/api/cards';
        const method = card.id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card),
        });
        return response.json();
    },
    deleteCard: async (id) => {
        await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    },
    getAchievements: async () => (await fetch('/api/achievements')).json(),
    saveAchievements: async (achievements) => {
        const response = await fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(achievements),
        });
        return response.json();
    },
    getSiteSettings: async () => (await fetch('/api/site-settings')).json(),
    saveSiteSettings: async (settings) => {
        const response = await fetch('/api/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        return response.json();
    }
};

const CardManager = React.forwardRef(({ cards, onCardsChange }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const importFileRef = useRef(null);

    const handleNewCard = () => {
        setCurrentCard({ id: null, category: 'Uncategorized', title: '', text_content: '', image: '', video: '', audio: '', reveal_type: 'image' });
        setIsEditing(true);
    };

    const handleEditCard = (card) => {
        setCurrentCard(card);
        setIsEditing(true);
    };

    React.useImperativeHandle(ref, () => ({
        startEditing: handleEditCard,
    }));

    const handleDeleteCard = (card) => {
        setConfirmingDelete(card);
    };

    const confirmDelete = async () => {
        if (confirmingDelete) {
            await api.deleteCard(confirmingDelete.id);
            onCardsChange();
            setConfirmingDelete(null);
        }
    };

    const handleSaveCard = (e) => {
        e.preventDefault();
        // FIX: Directly call the API to save the card, then trigger a refresh
        api.saveCard(currentCard).then(() => {
            onCardsChange(); // This re-fetches all cards from the backend
            setIsEditing(false);
            setCurrentCard(null);
        });
    };
    
    const handleExport = () => {
        const headers = Object.keys(cards[0] || {});
        if (headers.length === 0) return;
        const csvRows = [headers.join(',')];
        for (const card of cards) {
            const values = headers.map(header => {
                const val = card[header] === null || card[header] === undefined ? '' : card[header];
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'typing-cards-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                const importedCards = rows.map(row => {
                    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
                    const card = headers.reduce((obj, header, index) => {
                        obj[header] = values[index] || '';
                        return obj;
                    }, {});
                    return card;
                });
                Promise.all(importedCards.map(api.saveCard)).then(onCardsChange);
                alert(`${importedCards.length} cards imported successfully!`);
            } catch (error) {
                alert("Failed to import CSV. Please check the file format.");
                console.error(error);
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };


    const MediaInput = ({ name, value, onChange }) => {
        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('media', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                if (data.success) {
                    onChange(name, data.path);
                } else {
                    throw new Error(data.error || 'File upload failed');
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                alert("Error uploading file. See console for details.");
            }
        };

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 capitalize">{name} URL</label>
                <input type="text" placeholder={`http://... or /uploads/...`} value={value || ''} onChange={e => onChange(name, e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" />
                <p className="text-center text-xs text-gray-500">OR</p>
                <label className="block text-sm font-medium text-gray-300">Upload {name}</label>
                <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>
            </div>
        );
    };

    if (isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentCard.id ? 'Edit' : 'Create'} Card</h3>
                <form onSubmit={handleSaveCard} className="space-y-4">
                    <input type="text" placeholder="Card Title" value={currentCard.title} onChange={e => setCurrentCard({...currentCard, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <input type="text" placeholder="Category" value={currentCard.category} onChange={e => setCurrentCard({...currentCard, category: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <textarea placeholder="Card Text Content" value={currentCard.text_content} onChange={e => setCurrentCard({...currentCard, text_content: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md h-32" required />
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Reveal Type</label>
                        <select value={currentCard.reveal_type} onChange={e => setCurrentCard({...currentCard, reveal_type: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md">
                            <option value="image">Image Fade-in</option>
                            <option value="video">Video Fade-in</option>
                            <option value="puzzle">Puzzle Image</option>
                        </select>
                    </div>
                    <MediaInput name="image" value={currentCard.image} onChange={(name, val) => setCurrentCard({...currentCard, [name]: val})} />
                    <MediaInput name="video" value={currentCard.video} onChange={(name, val) => setCurrentCard({...currentCard, [name]: val})} />
                    <MediaInput name="audio" value={currentCard.audio} onChange={(name, val) => setCurrentCard({...currentCard, [name]: val})} />
                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-400">Card Manager</h2>
                <div className="flex gap-2">
                    <input type="file" ref={importFileRef} onChange={handleImport} className="hidden" accept=".csv" />
                    <button onClick={() => importFileRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Upload size={18}/> Import</button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Download size={18}/> Export</button>
                    <button onClick={handleNewCard} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Upload size={18}/> New</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.id} className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between">
                        <h4 className="font-bold text-lg text-white">{card.title}</h4>
                        <p className="text-gray-400 text-sm">{card.category}</p>
                        <p className="text-sm text-gray-300 my-2 flex-grow">{card.text_content.substring(0, 100)}...</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => handleEditCard(card)} className="flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-gray-600 rounded-md hover:bg-gray-500"><Edit size={16}/> Edit</button>
                            <button onClick={() => handleDeleteCard(card)} className="flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-red-800 rounded-md hover:bg-red-700"><Trash2 size={16}/> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the card "{confirmingDelete.title}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
});

const AchievementManager = ({achievements, onAchievementsChange}) => {
    const [isEditing, setIsEditing] = useState(false); const [currentAchievement, setCurrentAchievement] = useState(null); const [confirmingDelete, setConfirmingDelete] = useState(null); const importFileRef = useRef(null);
    const handleNew = () => { setCurrentAchievement({ id: `custom_${Date.now()}`, title: '', description: '', icon: '??', icon_type: 'emoji', type: 'wpm', value: 100 }); setIsEditing(true); };
    const handleEdit = (ach) => { setCurrentAchievement(ach); setIsEditing(true); };
    const handleDelete = (ach) => { setConfirmingDelete(ach); };
    const confirmDelete = () => { if(confirmingDelete) { onAchievementsChange(achievements.filter(a => a.id !== confirmingDelete.id)); setConfirmingDelete(null); }};
    const handleSave = (e) => { e.preventDefault(); const updated = achievements.find(a => a.id === currentAchievement.id) ? achievements.map(a => a.id === currentAchievement.id ? currentAchievement : a) : [...achievements, currentAchievement]; onAchievementsChange(updated); setIsEditing(false); setCurrentAchievement(null); };
    const handleExport = () => {
        const headers = Object.keys(achievements[0] || {});
        if (headers.length === 0) return;
        const csvRows = [headers.join(',')];
        for (const achievement of achievements) {
            const values = headers.map(header => {
                const val = achievement[header] === null || achievement[header] === undefined ? '' : achievement[header];
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'achievements-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                onAchievementsChange(importedAchievements);
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
    const IconInput = ({ value, type, onChange }) => {
        if (type === 'emoji') return <input type="text" placeholder="Icon (Emoji)" value={value} onChange={e => onChange('icon', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" required />;
        if (type === 'url') return <input type="text" placeholder="Image URL" value={value} onChange={e => onChange('icon', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" required />;
        if (type === 'upload') return <input type="file" onChange={e => e.target.files[0] && onChange('icon', URL.createObjectURL(e.target.files[0]))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>;
        return null;
    };
    if(isEditing) return (<div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentAchievement.id.startsWith('custom') ? 'Create' : 'Edit'} Achievement</h3><form onSubmit={handleSave} className="space-y-4"><input type="text" placeholder="Title" value={currentAchievement.title} onChange={e => setCurrentAchievement({...currentAchievement, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Description" value={currentAchievement.description} onChange={e => setCurrentAchievement({...currentAchievement, description: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><div><label className="block mb-2 text-sm font-medium text-gray-300">Icon Type</label><select value={currentAchievement.icon_type} onChange={e => setCurrentAchievement({...currentAchievement, icon_type: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md"><option value="emoji">Emoji</option><option value="url">Image URL</option><option value="upload">Upload</option></select></div><IconInput value={currentAchievement.icon} type={currentAchievement.icon_type} onChange={(key, val) => setCurrentAchievement({...currentAchievement, [key]: val})} /><div><label className="block mb-2 text-sm font-medium text-gray-300">Type</label><select value={currentAchievement.type} onChange={e => setCurrentAchievement({...currentAchievement, type: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md">{achievementTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div><input type="number" placeholder="Value" value={currentAchievement.value} onChange={e => setCurrentAchievement({...currentAchievement, value: parseInt(e.target.value) || 0})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button></div></form></div>);
    return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">Achievement Manager</h2><div className="flex gap-2"><input type="file" ref={importFileRef} onChange={handleImport} className="hidden" accept=".csv" /><button onClick={() => importFileRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Upload size={18}/> Import</button><button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Download size={18}/> Export</button><button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Award size={18}/> New</button></div></div><div className="space-y-4">{achievements.map(ach => (<div key={ach.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4">{ach.icon_type === 'emoji' ? <span className="text-4xl">{ach.icon}</span> : <img src={ach.icon} alt={ach.title} className="w-12 h-12"/>}<div><h4 className="font-bold text-lg text-white">{ach.title}</h4><p className="text-sm text-gray-300">{ach.description}</p><p className="text-xs text-yellow-400">Type: {ach.type}, Value: {ach.value}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(ach)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button><button onClick={() => handleDelete(ach)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button></div></div>))}</div>{confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the achievement "{confirmingDelete.title}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}</div>);
}

const UserManager = ({ users, onUsersChange }) => {
    const [isEditing, setIsEditing] = useState(false); const [currentUser, setCurrentUser] = useState(null); const [confirmingDelete, setConfirmingDelete] = useState(null);
    const handleNew = () => { setCurrentUser({ email: '', password: '', name: '', is_admin: false, unlocked_achievements: [], assigned_categories: [] }); setIsEditing(true); };
    const handleEdit = (user) => { setCurrentUser(user); setIsEditing(true); };
    const handleDelete = (user) => { setConfirmingDelete(user); };
    const confirmDelete = () => { if(confirmingDelete) { onUsersChange({ ...confirmingDelete, toDelete: true }); setConfirmingDelete(null); }};
    const handleSave = (e) => { e.preventDefault(); onUsersChange(currentUser); setIsEditing(false); setCurrentUser(null); };
    if(isEditing) return (<div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentUser.id ? 'Edit' : 'Create'} User</h3><form onSubmit={handleSave} className="space-y-4"><input type="email" placeholder="Email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Name" value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="password" placeholder="New Password" onChange={e => setCurrentUser({...currentUser, password: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><label className="flex items-center gap-2 text-white"><input type="checkbox" checked={currentUser.is_admin} onChange={e => setCurrentUser({...currentUser, is_admin: e.target.checked})} /> Is Admin?</label><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button></div></form></div>);
    return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">User Manager</h2><button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><UserPlus size={18}/> New User</button></div><div className="space-y-4">{users.map((user) => (<div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4"><UserIcon size={24} className={user.is_admin ? 'text-yellow-400' : ''}/><div><h4 className="font-bold text-lg text-white">{user.name}</h4><p className="text-sm text-gray-300">{user.email}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(user)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button><button onClick={() => handleDelete(user)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button></div></div>))}</div>{confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete user "{confirmingDelete.name}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}</div>);
}

const SiteSettingsManager = ({ settings, onSettingsChange }) => {
    const [currentSettings, setCurrentSettings] = useState(settings);
    useEffect(() => { setCurrentSettings(settings) }, [settings]);
    const handleSave = (e) => { e.preventDefault(); onSettingsChange(currentSettings); alert("Settings saved!"); };
    const handleFileChange = (e, key) => { const file = e.target.files[0]; if(file) setCurrentSettings({...currentSettings, [key]: URL.createObjectURL(file)}); };
    return (<div><h2 className="text-3xl font-bold text-yellow-400 mb-6">Site Settings</h2><form onSubmit={handleSave} className="space-y-6 max-w-lg"><div className="space-y-2"><label className="block text-sm font-medium">Site Name</label><input type="text" value={currentSettings.site_name} onChange={e => setCurrentSettings({...currentSettings, site_name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /></div><div className="space-y-2"><label className="block text-sm font-medium">Correct Keystroke Sound URL</label><input type="text" value={currentSettings.correct_sound} onChange={e => setCurrentSettings({...currentSettings, correct_sound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><input type="file" onChange={e => handleFileChange(e, 'correctSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div><div className="space-y-2"><label className="block text-sm font-medium">Incorrect Keystroke Sound URL</label><input type="text" value={currentSettings.incorrect_sound} onChange={e => setCurrentSettings({...currentSettings, incorrect_sound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><input type="file" onChange={e => handleFileChange(e, 'incorrectSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div><button type="submit" className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save Settings</button></form></div>);
};


export default function AdminPanel({ cards, onCardsChange, users, onUsersChange, achievements, onAchievementsChange, siteSettings, onSiteSettingsChange, initialCardToEdit, onEditDone }) {
    const [view, setView] = useState('cards');
    const childRef = useRef();

    useEffect(() => {
        if (initialCardToEdit && childRef.current) {
            setView('cards');
            childRef.current.startEditing(initialCardToEdit);
            onEditDone();
        }
    }, [initialCardToEdit, onEditDone]);
    
    const renderManager = () => {
        switch (view) {
            case 'cards':
                return <CardManager ref={childRef} cards={cards} onCardsChange={onCardsChange} />;
            case 'users':
                return <UserManager users={users} onUsersChange={onUsersChange} />;
 // FIX: The onAchievementsChange prop is now correctly passed to the AchievementManager
 case 'achievements':
    return <AchievementManager achievements={achievements} onAchievementsChange={onAchievementsChange} />;
            case 'site':
                return <SiteSettingsManager settings={siteSettings} onSettingsChange={onSiteSettingsChange} />;
            case 'mons':
                return <MonManager />;
            case 'quests':
                return <QuestManager />;
            case 'rewards':
                return <RewardManager />;
            default:
                return <CardManager ref={childRef} cards={cards} onCardsChange={onCardsChange} />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0">
                <nav className="space-y-2">
                    <button onClick={() => setView('cards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'cards' ? 'bg-yellow-400 text-gray-900' : ''}`}><Shield size={20}/>Cards</button>
                    <button onClick={() => setView('users')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'users' && 'bg-yellow-400 text-gray-900'}`}><Users size={20}/>Users</button>
                    <button onClick={() => setView('achievements')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'achievements' && 'bg-yellow-400 text-gray-900'}`}><Award size={20}/>Achievements</button>
                    <button onClick={() => setView('mons')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'mons' && 'bg-yellow-400 text-gray-900'}`}><Bone size={20}/>Mons</button>
                    <button onClick={() => setView('quests')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'quests' && 'bg-yellow-400 text-gray-900'}`}><ClipboardList size={20}/>Quests</button>
                    <button onClick={() => setView('rewards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'rewards' && 'bg-yellow-400 text-gray-900'}`}><Gift size={20}/>Rewards</button>
                    <button onClick={() => setView('site')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'site' && 'bg-yellow-400 text-gray-900'}`}><SettingsIcon size={20}/>Site Settings</button>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{renderManager()}</main>
        </div>
    );
};
// END COPYING HERE