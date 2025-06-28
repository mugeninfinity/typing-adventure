import React, { useState } from 'react';
import { UserPlus, Edit, Trash2, User as UserIcon } from 'lucide-react';
import { Modal } from './HelperComponents';

export default function UserManager({ users, onUsersChange }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleNew = () => {
        setCurrentUser({ email: '', password: '', name: '', is_admin: false, unlocked_achievements: [], assigned_categories: [] });
        setIsEditing(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditing(true);
    };

    const handleDelete = (user) => {
        setConfirmingDelete(user);
    };

    const confirmDelete = () => {
        if(confirmingDelete) {
            onUsersChange({ ...confirmingDelete, toDelete: true });
            setConfirmingDelete(null);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onUsersChange(currentUser);
        setIsEditing(false);
        setCurrentUser(null);
    };

    if(isEditing) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentUser.id ? 'Edit' : 'Create'} User</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="email" placeholder="Email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <input type="text" placeholder="Name" value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required />
                    <input type="password" placeholder="New Password" onChange={e => setCurrentUser({...currentUser, password: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" />
                    <label className="flex items-center gap-2 text-white">
                        <input type="checkbox" checked={currentUser.is_admin} onChange={e => setCurrentUser({...currentUser, is_admin: e.target.checked})} /> Is Admin?
                    </label>
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
                <h2 className="text-3xl font-bold text-yellow-400">User Manager</h2>
                <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><UserPlus size={18}/> New User</button>
            </div>
            <div className="space-y-4">
                {users.map((user) => (
                    <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <UserIcon size={24} className={user.is_admin ? 'text-yellow-400' : ''}/>
                            <div>
                                <h4 className="font-bold text-lg text-white">{user.name}</h4>
                                <p className="text-sm text-gray-300">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(user)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(user)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete user "{confirmingDelete.name}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}
        </div>
    );
}