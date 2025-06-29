// START COPYING HERE
import React, { useState, useRef } from 'react';
import { Upload, Trash2, Edit, Download } from 'lucide-react';
import { Modal } from './HelperComponents';
import MediaInput from './MediaInput'; // Import the corrected media input

const MediaInput = ({ name, value, onChange }) => {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await uploadFile(file);
            if (data.success) {
                onChange(name, data.path);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file.");
        }
    };

const api = {
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
        onSave(currentCard); // Simply pass the card data up to the parent
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
                onCardsChange(importedCards);
                alert(`${importedCards.length} cards imported successfully!`);
            } catch (error) {
                alert("Failed to import CSV. Please check the file format.");
                console.error(error);
            }
        };
        reader.readAsText(file);
        e.target.value = null;
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

export default CardManager;