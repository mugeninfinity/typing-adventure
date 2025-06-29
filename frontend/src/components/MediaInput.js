// START COPYING HERE
import React from 'react';

export default function MediaInput({ name, value, onChange }) {
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
                // This is the crucial part: we use the path from the server
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
            <input 
                type="text" 
                placeholder={`http://... or /uploads/...`} 
                value={value || ''} 
                onChange={e => onChange(name, e.target.value)} 
                className="w-full p-2 bg-gray-700 text-white rounded-md" 
            />
            <p className="text-center text-xs text-gray-500">OR</p>
            <label className="block text-sm font-medium text-gray-300">Upload {name}</label>
            <input 
                type="file" 
                onChange={handleFileChange} 
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
        </div>
    );
};
// END COPYING HERE