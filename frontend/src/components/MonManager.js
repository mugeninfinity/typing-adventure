// START COPYING HERE
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Bone } from 'lucide-react';
import { Modal } from './HelperComponents';
import MediaInput from './MediaInput';

export default function MonManager({ monTypes, onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentMonType, setCurrentMonType] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleNew = () => {
        setCurrentMonType({
            name: '',
            image_url: '',
            evolution_stage: 'first',
            evolves_at_level: 10,
            next_evolution_id: null
        });
        setIsEditing(true);
    };

    const handleEdit = (monType) => {
        setCurrentMonType(monType);
        setIsEditing(true);
    };

    const handleDelete = (monType) => {
        setConfirmingDelete(monType);
    };

    const confirmDelete = () => {
        if (confirmingDelete) {
            onDelete(confirmingDelete.id); // Call prop
            setConfirmingDelete(null);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(currentMonType); // Call prop
        setIsEditing(false);
        setCurrentMonType(null);
    };

    if (isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">
                    {currentMonType.id ? 'Edit' : 'Create'} Mon Type
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={currentMonType.name}
                        onChange={(e) => setCurrentMonType({ ...currentMonType, name: e.target.value })}
                        className="w-full p-2 bg-gray-700 text-white rounded-md"
                        required
                    />
                    
                    <MediaInput name="image_url" value={currentMonType.image_url} onChange={(key, val) => setCurrentMonType({...currentMonType, [key]: val})} />

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Evolution Stage</label>
                        <select
                            value={currentMonType.evolution_stage}
                            onChange={(e) => setCurrentMonType({ ...currentMonType, evolution_stage: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md"
                        >
                            <option value="first">First</option>
                            <option value="second">Second</option>
                            <option value="final">Final</option>
                        </select>
                    </div>
                    <input
                        type="number"
                        placeholder="Evolves at Level"
                        value={currentMonType.evolves_at_level || ''}
                        onChange={(e) => setCurrentMonType({ ...currentMonType, evolves_at_level: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full p-2 bg-gray-700 text-white rounded-md"
                    />
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Next Evolution</label>
                        <select
                            value={currentMonType.next_evolution_id || ''}
                            onChange={(e) => setCurrentMonType({ ...currentMonType, next_evolution_id: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md"
                        >
                            <option value="">None</option>
                            {monTypes.filter(mt => mt.id !== currentMonType.id).map(mt => (
                                <option key={mt.id} value={mt.id}>{mt.name}</option>
                            ))}
                        </select>
                    </div>
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
                <h2 className="text-3xl font-bold text-yellow-400">Mon Manager</h2>
                <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">
                    <Bone size={18}/> New Mon Type
                </button>
            </div>
            <div className="space-y-4">
                {monTypes.map((mon) => (
                    <div key={mon.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={mon.image_url} alt={mon.name} className="w-16 h-16 bg-gray-800 rounded-md" />
                            <div>
                                <h4 className="font-bold text-lg text-white">{mon.name}</h4>
                                <p className="text-sm text-gray-300">Stage: {mon.evolution_stage}</p>
                                <p className="text-xs text-yellow-400">Evolves at: Level {mon.evolves_at_level || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(mon)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(mon)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete "{confirmingDelete.name}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}
// END COPYING HERE