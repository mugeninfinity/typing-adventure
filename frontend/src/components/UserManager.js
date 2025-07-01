// START COPYING HERE
import React, { useState } from 'react';
import { UserPlus, Edit, Trash2, Tag, User as UserIcon } from 'lucide-react';
import { Modal } from './HelperComponents';

const AssignCategoryModal = ({ user, allCards, onSave, onClose }) => {
    const allCategories = [...new Set((allCards || []).map(c => c.category || 'Uncategorized'))];
    const [assignedCategories, setAssignedCategories] = useState(user.assigned_categories || []);

    const handleToggleCategory = (category) => {
        setAssignedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSave = () => {
        const updatedUser = { ...user, assigned_categories: assignedCategories };
        
        console.log("1. UserManager: Saving category assignments for user:", updatedUser);
        console.log("2. UserManager Save: Sending this user object up:", updatedUser);


        // FIX: This line was passing the original user object.
        // It now correctly passes the `updatedUser` object with the new categories.
        onSave(updatedUser);
        
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <h3 className="text-xl font-bold mb-4 text-white">Assign Categories to {user.name}</h3>
            <div className="space-y-2">
                {allCategories.map(category => (
                    <label key={category} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700">
                        <input
                            type="checkbox"
                            checked={assignedCategories.includes(category)}
                            onChange={() => handleToggleCategory(category)}
                            className="h-4 w-4 rounded bg-gray-600 text-yellow-400 focus:ring-yellow-500"
                        />
                        <span>{category}</span>
                    </label>
                ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save Assignments</button>
            </div>
        </Modal>
    );
};

export default function UserManager({ users, onSave, allCards }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleNew = () => {
        setCurrentUser({ email: '', password: '', name: '', is_admin: false, assigned_categories: [] });
        setIsEditing(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditing(true);
    };
    
    const handleAssign = (user) => {
        setCurrentUser(user);
        setIsAssigning(true);
    };

    const handleDelete = (user) => {
        setConfirmingDelete(user);
    };

    const confirmDelete = () => {
        if(confirmingDelete) {
            onSave({ ...confirmingDelete, toDelete: true });
            setConfirmingDelete(null);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(currentUser);
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
                {(users || []).map((user) => (
                    <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <UserIcon size={24} className={user.is_admin ? 'text-yellow-400' : ''}/>
                            <div>
                                <h4 className="font-bold text-lg text-white">{user.name}</h4>
                                <p className="text-sm text-gray-300">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* FIX: New button to assign categories */}
                            <button onClick={() => handleAssign(user)} className="p-2 bg-blue-600 rounded-md" title="Assign Categories"><Tag size={16}/></button>
                            <button onClick={() => handleEdit(user)} className="p-2 bg-gray-600 rounded-md" title="Edit User"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(user)} className="p-2 bg-red-800 rounded-md" title="Delete User"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}>{/* ... */}</Modal>}
            {/* FIX: Pass the `allCards` prop to the modal */}
            {isAssigning && <AssignCategoryModal user={currentUser} allCards={allCards} onSave={onSave} onClose={() => setIsAssigning(false)} />}

            </div>
    );
}
// END COPYING HERE