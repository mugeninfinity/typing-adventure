// START COPYING HERE
import React, { useState, useEffect } from 'react';
import MediaInput from './MediaInput';

export default function SiteSettingsManager({ settings, onSave }) {
    const [currentSettings, setCurrentSettings] = useState(settings);

    useEffect(() => {
        setCurrentSettings(settings);
    }, [settings]);

    const handleSave = (e) => {
        e.preventDefault();
        onSave(currentSettings);
        alert("Settings saved!");
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Site Settings</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Site Name</label>
                    <input type="text" value={currentSettings.site_name} onChange={e => setCurrentSettings({...currentSettings, site_name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" />
                </div>
                <MediaInput name="correct_sound" value={currentSettings.correct_sound} onChange={(key, val) => setCurrentSettings({...currentSettings, [key]: val})} />
                <MediaInput name="incorrect_sound" value={currentSettings.incorrect_sound} onChange={(key, val) => setCurrentSettings({...currentSettings, [key]: val})} />
                
                <button type="submit" className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save Settings</button>
            </form>
        </div>
    );
};
// END COPYING HERE