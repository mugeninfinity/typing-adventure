import React, { useState, useEffect, useRef } from 'react';
import { Database, Shield, Upload, Trash2, Edit, UserPlus, Users, Settings as SettingsIcon, Award, Download, User as UserIcon } from 'lucide-react';
import { Modal } from './HelperComponents';

const CardManager = React.forwardRef(({ cards, onCardsChange }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const importFileRef = useRef(null);

    const handleNewCard = () => {
        setCurrentCard({ id: Date.now(), category: 'Uncategorized', title: '', textContent: '', image: '', video: '', audio: '', revealType: 'image' });
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
            try {
                const response = await fetch(`/api/cards/${confirmingDelete.id}`, {
                    method: 'DELETE',
                });
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Failed to delete card');
                }
                // If the API call is successful, tell the parent App component to refresh the card list
                onCardsChange(); 
                setConfirmingDelete(null);
                alert('Card deleted successfully!');
            } catch (error) {
                console.error("Error deleting card:", error);
                alert("Error deleting card. See console for details.");
            }
        }
    };

    const handleSaveCard = (e) => {
        e.preventDefault();
        const updatedCards = cards.find(c => c.id === currentCard.id) ? cards.map(c => c.id === currentCard.id ? currentCard : c) : [...cards, currentCard];
        onCardsChange(updatedCards);
        setIsEditing(false);
        setCurrentCard(null);
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
                    card.id = parseInt(card.id) || Date.now() + Math.random();
                    return card;
                });
                const updatedCards = [...cards];
                importedCards.forEach(imported => {
                    const existingIndex = updatedCards.findIndex(c => c.id == imported.id);
                    if (existingIndex > -1) {
                        updatedCards[existingIndex] = imported;
                    } else {
                        updatedCards.push(imported);
                    }
                });
                onCardsChange(updatedCards);
                alert(`${importedCards.length} cards imported successfully!`);
            } catch (error) {
                alert("Failed to import CSV. Please check the file format.");
                console.error(error);
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const MediaInput = ({ name, value, onChange }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 capitalize">{name} URL</label>
            <input type="text" placeholder={`https://${name} URL`} value={value || ''} onChange={e => onChange(name, e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" />
            <p className="text-center text-xs text-gray-500">OR</p>
            <label className="block text-sm font-medium text-gray-300">Upload {name}</label>
            <input type="file" onChange={e => e.target.files[0] && onChange(name, URL.createObjectURL(e.target.files[0]))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>
        </div>
    );

    if (isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentCard.id ? 'Edit' : 'Create'} Card</h3>
                <form onSubmit={handleSaveCard} className="space-y-4">
                    <input type="text" placeholder="Card Title" value={currentCard.title} onChange={e => setCurrentCard({...currentCard, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <input type="text" placeholder="Category" value={currentCard.category} onChange={e => setCurrentCard({...currentCard, category: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <textarea placeholder="Card Text Content" value={currentCard.textContent} onChange={e => setCurrentCard({...currentCard, textContent: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md h-32" required />
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Reveal Type</label>
                        <select value={currentCard.revealType} onChange={e => setCurrentCard({...currentCard, revealType: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md">
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
                        <p className="text-sm text-gray-300 my-2 flex-grow">{card.textContent.substring(0, 100)}...</p>
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
    const [isEditing, setIsEditing] = useState(false); const [currentAchievement, setCurrentAchievement] = useState(null); const [confirmingDelete, setConfirmingDelete] = useState(null);
    const handleNew = () => { setCurrentAchievement({ id: `custom_${Date.now()}`, title: '', description: '', icon: '??', iconType: 'emoji', type: 'wpm', value: 100 }); setIsEditing(true); };
    const handleEdit = (ach) => { setCurrentAchievement(ach); setIsEditing(true); };
    const handleDelete = (ach) => { setConfirmingDelete(ach); };
    const confirmDelete = () => { if(confirmingDelete) { onAchievementsChange(achievements.filter(a => a.id !== confirmingDelete.id)); setConfirmingDelete(null); }};
    const handleSave = (e) => { e.preventDefault(); const updated = achievements.find(a => a.id === currentAchievement.id) ? achievements.map(a => a.id === currentAchievement.id ? currentAchievement : a) : [...achievements, currentAchievement]; onAchievementsChange(updated); setIsEditing(false); setCurrentAchievement(null); };
    const achievementTypes = ['wpm', 'accuracy', 'total_cards_completed', 'total_words_typed', 'total_chars_typed', 'total_cards_day', 'total_cards_week', 'total_cards_month', 'journal_entries', 'journal_words', 'journal_chars', 'journal_entry_words', 'journal_entry_chars'];
    const IconInput = ({ value, type, onChange }) => {
        if (type === 'emoji') return <input type="text" placeholder="Icon (Emoji)" value={value} onChange={e => onChange('icon', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" required />;
        if (type === 'url') return <input type="text" placeholder="Image URL" value={value} onChange={e => onChange('icon', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" required />;
        if (type === 'upload') return <input type="file" onChange={e => e.target.files[0] && onChange('icon', URL.createObjectURL(e.target.files[0]))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>;
        return null;
    };
    if(isEditing) return (<div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentAchievement.id.startsWith('custom') ? 'Create' : 'Edit'} Achievement</h3><form onSubmit={handleSave} className="space-y-4"><input type="text" placeholder="Title" value={currentAchievement.title} onChange={e => setCurrentAchievement({...currentAchievement, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Description" value={currentAchievement.description} onChange={e => setCurrentAchievement({...currentAchievement, description: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><div><label className="block mb-2 text-sm font-medium text-gray-300">Icon Type</label><select value={currentAchievement.iconType} onChange={e => setCurrentAchievement({...currentAchievement, iconType: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md"><option value="emoji">Emoji</option><option value="url">Image URL</option><option value="upload">Upload</option></select></div><IconInput value={currentAchievement.icon} type={currentAchievement.iconType} onChange={(key, val) => setCurrentAchievement({...currentAchievement, [key]: val})} /><div><label className="block mb-2 text-sm font-medium text-gray-300">Type</label><select value={currentAchievement.type} onChange={e => setCurrentAchievement({...currentAchievement, type: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md">{achievementTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div><input type="number" placeholder="Value" value={currentAchievement.value} onChange={e => setCurrentAchievement({...currentAchievement, value: parseInt(e.target.value) || 0})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button></div></form></div>);
    return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">Achievement Manager</h2><button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Upload size={18}/> New</button></div><div className="space-y-4">{achievements.map(ach => (<div key={ach.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4">{ach.iconType === 'emoji' ? <span className="text-4xl">{ach.icon}</span> : <img src={ach.icon} alt={ach.title} className="w-12 h-12"/>}<div><h4 className="font-bold text-lg text-white">{ach.title}</h4><p className="text-sm text-gray-300">{ach.description}</p><p className="text-xs text-yellow-400">Type: {ach.type}, Value: {ach.value}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(ach)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button><button onClick={() => handleDelete(ach)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button></div></div>))}</div>{confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the achievement "{confirmingDelete.title}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}</div>);
}

const UserManager = ({ users, onUsersChange }) => {
    const [isEditing, setIsEditing] = useState(false); const [currentUser, setCurrentUser] = useState(null); const [confirmingDelete, setConfirmingDelete] = useState(null);
    const handleNew = () => { setCurrentUser({ email: '', password: '', name: '', isAdmin: false, unlockedAchievements: [] }); setIsEditing(true); };
    const handleEdit = (email) => { setCurrentUser({ email, ...users[email] }); setIsEditing(true); };
    const handleDelete = (email) => { setConfirmingDelete(email); };
    const confirmDelete = () => { if(confirmingDelete) { const updatedUsers = {...users}; delete updatedUsers[confirmingDelete]; onUsersChange(updatedUsers); setConfirmingDelete(null); }};
    const handleSave = (e) => { e.preventDefault(); const updatedUsers = {...users, [currentUser.email]: currentUser}; onUsersChange(updatedUsers); setIsEditing(false); setCurrentUser(null); };
    if(isEditing) return (<div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentUser.email ? 'Edit' : 'Create'} User</h3><form onSubmit={handleSave} className="space-y-4"><input type="email" placeholder="Email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Name" value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="password" placeholder="New Password" onChange={e => setCurrentUser({...currentUser, password: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><label className="flex items-center gap-2 text-white"><input type="checkbox" checked={currentUser.isAdmin} onChange={e => setCurrentUser({...currentUser, isAdmin: e.target.checked})} /> Is Admin?</label><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button></div></form></div>);
    return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">User Manager</h2><button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><UserPlus size={18}/> New User</button></div><div className="space-y-4">{Object.entries(users).map(([email, user]) => (<div key={email} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4"><UserIcon size={24} className={user.isAdmin ? 'text-yellow-400' : ''}/><div><h4 className="font-bold text-lg text-white">{user.name}</h4><p className="text-sm text-gray-300">{email}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(email)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button><button onClick={() => handleDelete(email)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button></div></div>))}</div>{confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete user "{confirmingDelete}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}</div>);
}

const SiteSettingsManager = ({ settings, onSettingsChange }) => {
    const [currentSettings, setCurrentSettings] = useState(settings);
    useEffect(() => { setCurrentSettings(settings) }, [settings]);
    const handleSave = (e) => { e.preventDefault(); onSettingsChange(currentSettings); alert("Settings saved!"); };
    const handleFileChange = (e, key) => { const file = e.target.files[0]; if(file) setCurrentSettings({...currentSettings, [key]: URL.createObjectURL(file)}); };
    return (<div><h2 className="text-3xl font-bold text-yellow-400 mb-6">Site Settings</h2><form onSubmit={handleSave} className="space-y-6 max-w-lg"><div className="space-y-2"><label className="block text-sm font-medium">Site Name</label><input type="text" value={currentSettings.siteName} onChange={e => setCurrentSettings({...currentSettings, siteName: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /></div><div className="space-y-2"><label className="block text-sm font-medium">Correct Keystroke Sound URL</label><input type="text" value={currentSettings.correctSound} onChange={e => setCurrentSettings({...currentSettings, correctSound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><input type="file" onChange={e => handleFileChange(e, 'correctSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div><div className="space-y-2"><label className="block text-sm font-medium">Incorrect Keystroke Sound URL</label><input type="text" value={currentSettings.incorrectSound} onChange={e => setCurrentSettings({...currentSettings, incorrectSound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><input type="file" onChange={e => handleFileChange(e, 'incorrectSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div><button type="submit" className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save Settings</button></form></div>);
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

    return (<div className="flex min-h-screen"><aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0"><nav className="space-y-2"><button onClick={() => setView('cards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'cards' && 'bg-yellow-400 text-gray-900'}`}><Shield size={20}/>Cards</button><button onClick={() => setView('users')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'users' && 'bg-yellow-400 text-gray-900'}`}><Users size={20}/>Users</button><button onClick={() => setView('achievements')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'achievements' && 'bg-yellow-400 text-gray-900'}`}><Award size={20}/>Achievements</button><button onClick={() => setView('site')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'site' && 'bg-yellow-400 text-gray-900'}`}><SettingsIcon size={20}/>Site Settings</button></nav></aside><main className="flex-1 p-8 overflow-y-auto">{view === 'cards' && <CardManager ref={childRef} cards={cards} onCardsChange={onCardsChange} />}{view === 'users' && <UserManager users={users} onUsersChange={onUsersChange} />}{view === 'achievements' && <AchievementManager achievements={achievements} onAchievementsChange={onAchievementsChange}/>}{view === 'site' && <SiteSettingsManager settings={siteSettings} onSettingsChange={onSiteSettingsChange} />}</main></div>);
};
