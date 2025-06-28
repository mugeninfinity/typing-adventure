import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SiteSettingsManager({ settings, onSettingsChange }) {
    const [currentSettings, setCurrentSettings] = useState(settings);

    useEffect(() => {
        setCurrentSettings(settings);
    }, [settings]);

    const handleSave = (e) => {
        e.preventDefault();
        onSettingsChange(currentSettings);
        alert("Settings saved!");
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if(file) {
            setCurrentSettings({...currentSettings, [key]: URL.createObjectURL(file)});
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Site Settings</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Site Name</label>
                    <input type="text" value={currentSettings.site_name} onChange={e => setCurrentSettings({...currentSettings, site_name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Correct Keystroke Sound URL</label>
                    <input type="text" value={currentSettings.correct_sound} onChange={e => setCurrentSettings({...currentSettings, correct_sound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" />
                    <p className="text-center text-xs text-gray-500">OR</p>
                    <input type="file" onChange={e => handleFileChange(e, 'correctSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Incorrect Keystroke Sound URL</label>
                    <input type="text" value={currentSettings.incorrect_sound} onChange={e => setCurrentSettings({...currentSettings, incorrect_sound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" />
                    <p className="text-center text-xs text-gray-500">OR</p>
                    <input type="file" onChange={e => handleFileChange(e, 'incorrectSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>
                </div>
                <button type="submit" className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save Settings</button>
            </form>
        </div>
    );
};