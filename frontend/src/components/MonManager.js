// START COPYING HERE
import React, { useState } from 'react';
import { Upload, Trash2, Edit, Bone, Download } from 'lucide-react';
import { Modal } from './HelperComponents';
import * as api from './apiCall';
import MediaInput from './MediaInput';

export default function MonManager({ monTypes: initialMonTypes, onSave, onDelete }) {
    const [monTypes, setMonTypes] = useState(initialMonTypes);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMonType, setCurrentMonType] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const importFileRef = React.useRef(null);
    
    React.useEffect(() => {
        setMonTypes(initialMonTypes);
    }, [initialMonTypes]);

    const handleNew = () => {
        setCurrentMonType({ name: '', image_url: '', evolution_stage: 'first', evolves_at_level: null, next_evolution_id: null });
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
            onDelete(confirmingDelete.id);
            setConfirmingDelete(null);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(currentMonType);
        setIsEditing(false);
        setCurrentMonType(null);
    };

        const handleExport = () => {
        const headers = ['id', 'name', 'image_url', 'evolution_stage', 'evolves_at_level', 'next_evolution_id'];
        const csvRows = [headers.join(',')];
        for (const mon of monTypes) {
            const values = headers.map(header => {
                const val = mon[header] === null || mon[header] === undefined ? '' : mon[header];
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
        link.setAttribute('download', 'mon-types-export.csv');
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
                const importedMonTypes = rows.map(row => {
                    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
                    const monType = headers.reduce((obj, header, index) => {
                        obj[header] = values[index] || '';
                        return obj;
                    }, {});
                    return monType;
                });
                onSave(importedMonTypes);
                alert(`${importedMonTypes.length} Mon Types imported successfully!`);
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
                <h2 className="text-3xl font-bold text-yellow-400">Mon Type Manager</h2>
                <div className="flex gap-2">
                    <input type="file" ref={importFileRef} onChange={handleImport} className="hidden" accept=".csv" />
                    <button onClick={() => importFileRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Upload size={18}/> Import</button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Download size={18}/> Export</button>
                    <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">
                        <Bone size={18}/> New Mon Type
                    </button>
                </div>
            </div>
            
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-500">
                        <th>Image</th>
                        <th>Name</th>
                        <th>Stage</th>
                        <th>Evolves At</th>
                        <th>Evolves Into</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(monTypes || []).map((mon) => (
                        <tr key={mon.id} className="border-b border-gray-700">
                            <td><img src={mon.image_url} alt={mon.name} className="w-12 h-12 bg-gray-800 rounded-md" /></td>
                            <td className="py-2">{mon.name}</td>
                            <td>{mon.evolution_stage}</td>
                            <td>{mon.evolves_at_level || 'N/A'}</td>
                            <td>{monTypes.find(mt => mt.id === mon.next_evolution_id)?.name || 'None'}</td>
                            <td>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(mon)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(mon)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete "{confirmingDelete.name}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}
// END COPYING HERE