import React, { useState, useEffect, useRef } from 'react';
import { Database, Shield, Upload, Trash2, Edit, UserPlus, Users, Settings as SettingsIcon, Award, Download, User as UserIcon } from 'lucide-react';
import { Modal } from './HelperComponents';

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
            try {
                const response = await fetch(`/api/cards/${confirmingDelete.id}`, {
                    method: 'DELETE',
                });
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Failed to delete card');
                }
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
        onCardsChange(currentCard);
        setIsEditing(false);
        setCurrentCard(null);
    };
    
    // ... (handleExport and handleImport are unchanged)

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
                    {/* ... */}
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

    return (<div className="flex min-h-screen"><aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0"><nav className="space-y-2"><button onClick={() => setView('cards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'cards' && 'bg-yellow-400 text-gray-900'}`}><Shield size={20}/>Cards</button><button onClick={() => setView('users')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'users' && 'bg-yellow-400 text-gray-900'}`}><Users size={20}/>Users</button><button onClick={() => setView('achievements')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'achievements' && 'bg-yellow-400 text-gray-900'}`}><Award size={20}/>Achievements</button><button onClick={() => setView('site')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'site' && 'bg-yellow-400 text-gray-900'}`}><SettingsIcon size={20}/>Site Settings</button></nav></aside><main className="flex-1 p-8 overflow-y-auto">{view === 'cards' && <CardManager ref={childRef} cards={cards} onCardsChange={onCardsChange} />}{/* ... a lot of code ... */}</main></div>);
};