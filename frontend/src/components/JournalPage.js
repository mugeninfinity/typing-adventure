import React, { useState, useRef } from 'react';
import { Edit, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { Modal } from './HelperComponents';

const JournalEditor = ({ entry, onSave, onClose }) => {
    const editorRef = useRef(null);
    
    const handleSave = () => {
        const plainText = editorRef.current.innerText || '';
        const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
        const charCount = plainText.length;
        onSave({...entry, content: editorRef.current.innerHTML, word_count: wordCount, char_count: charCount });
    };

    const handleFormat = (command) => { 
        document.execCommand(command, false, null); 
        editorRef.current.focus(); 
    };

    return (<Modal onClose={onClose}>
        <h3 className="text-xl font-bold mb-4 text-white">Journal Entry</h3>
        <div className="bg-gray-900 rounded-t-lg p-2 flex gap-2">
            <button onClick={() => handleFormat('bold')} className="p-2 hover:bg-gray-700 rounded-md"><Bold size={16}/></button>
            <button onClick={() => handleFormat('italic')} className="p-2 hover:bg-gray-700 rounded-md"><Italic size={16}/></button>
            <button onClick={() => handleFormat('underline')} className="p-2 hover:bg-gray-700 rounded-md"><Underline size={16}/></button>
            <button onClick={() => handleFormat('justifyLeft')} className="p-2 hover:bg-gray-700 rounded-md"><AlignLeft size={16}/></button>
            <button onClick={() => handleFormat('justifyCenter')} className="p-2 hover:bg-gray-700 rounded-md"><AlignCenter size={16}/></button>
            <button onClick={() => handleFormat('justifyRight')} className="p-2 hover:bg-gray-700 rounded-md"><AlignRight size={16}/></button>
        </div>
        <div ref={editorRef} contentEditable={true} dangerouslySetInnerHTML={{ __html: entry.content }} className="w-full h-64 p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-b-md focus:outline-none" placeholder="Start writing..."></div>
        <div className="flex justify-end gap-4 mt-4">
            <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button>
        </div>
    </Modal>);
};

export default function JournalPage({ user, journal, onJournalChange, onDeleteEntry }) {
    const [editingEntry, setEditingEntry] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleSaveJournal = (entry) => {
        onJournalChange(entry);
        setEditingEntry(null);
    };
    
    const handleDeleteClick = (e, entry) => {
        e.stopPropagation(); // Prevent opening the edit modal
        setConfirmingDelete(entry);
    };

    const confirmDelete = () => {
        if (confirmingDelete) {
            onDeleteEntry(confirmingDelete.id);
            setConfirmingDelete(null);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-yellow-400">My Journal</h2>
                <button onClick={() => setEditingEntry({id: null, content: '', word_count: 0, char_count: 0, user_id: user.id})} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">
                    <Edit size={16}/> New Entry
                </button>
            </div>
            <div className="space-y-4">
                {journal.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(entry => {
                    const plainText = (entry.content || '').replace(/<[^>]+>/g, '');
                    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
                    const charCount = plainText.length;
                    return (
                        <div key={entry.id} onClick={() => setEditingEntry(entry)} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-md cursor-pointer">
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }}></div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                <span>{new Date(entry.timestamp).toLocaleString()} | {wordCount} {wordCount === 1 ? 'word' : 'words'} | {charCount} {charCount === 1 ? 'character' : 'characters'}</span>
                                <button onClick={(e) => handleDeleteClick(e, entry)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {editingEntry && <JournalEditor entry={editingEntry} onSave={handleSaveJournal} onClose={() => setEditingEntry(null)}/>}
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete this journal entry?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}