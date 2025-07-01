// START COPYING HERE
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './HelperComponents';

export default function UserMonManager({ allMons, onDelete }) {
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleDelete = (mon) => {
        setConfirmingDelete(mon);
    };

    const confirmDelete = () => {
        if (confirmingDelete) {
            onDelete(confirmingDelete.id);
            setConfirmingDelete(null);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">All Collected Mons</h2>
            <div className="space-y-4">
                {(allMons || []).map((mon) => (
                    <div key={`user-mon-${mon.id}`} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={mon.image_url} alt={mon.mon_name} className="w-16 h-16 bg-gray-700 rounded-md" />
                            <div>
                                <h4 className="font-bold text-lg text-white">{mon.mon_name}</h4>
                                <p className="text-sm text-gray-300">Owner: {mon.user_name}</p>
                                <p className="text-xs text-yellow-400">Level: {mon.level} | XP: {mon.experience}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(mon)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete this {confirmingDelete.mon_name} belonging to {confirmingDelete.user_name}?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}
// END COPYING HERE