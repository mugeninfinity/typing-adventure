// START COPYING HERE
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Users, Award, Settings as SettingsIcon, Bone, ClipboardList, Gift } from 'lucide-react';

// Import all manager components
import CardManager from './CardManager';
import UserManager from './UserManager';
import AchievementManager from './AchievementManager';
import SiteSettingsManager from './SiteSettingsManager';
import MonManager from './MonManager';
import QuestManager from './QuestManager';
import RewardManager from './RewardManager';

export default function AdminPanel({
  cards, onSaveCard, onDeleteCard,
  users, onUsersChange,
  achievements, onAchievementsChange,
  siteSettings, onSiteSettingsChange,
  monTypes, onSaveMonType, onDeleteMonType, // Receive new props
  initialCardToEdit, onEditDone
}) {
    const [view, setView] = useState('cards');
    const childRef = useRef();

    useEffect(() => {
        if (initialCardToEdit && childRef.current?.startEditing) {
            setView('cards');
            childRef.current.startEditing(initialCardToEdit);
            onEditDone();
        }
    }, [initialCardToEdit, onEditDone]);

    const renderManager = () => {
        switch (view) {
            case 'cards':
                return <CardManager ref={childRef} cards={cards} onSaveCard={onSaveCard} onDeleteCard={onDeleteCard} />;
            case 'users':
                return <UserManager users={users} onUsersChange={onUsersChange} />;
            case 'achievements':
                return <AchievementManager achievements={achievements} onAchievementsChange={onAchievementsChange} />;
            case 'site':
                return <SiteSettingsManager settings={siteSettings} onSettingsChange={onSiteSettingsChange} />;
            case 'mons':
                return <MonManager />;
            case 'quests':
                return <QuestManager />;
            case 'rewards':
                return <RewardManager />;
            default:
                return <CardManager ref={childRef} cards={cards} onSaveCard={onSaveCard} onDeleteCard={onDeleteCard} />;
                            case 'mons':
                return <MonManager 
                    monTypes={monTypes} 
                    onSave={onSaveMonType} 
                    onDelete={onDeleteMonType} 
                />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0">
                <nav className="space-y-2">
                    <button onClick={() => setView('cards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'cards' ? 'bg-yellow-400 text-gray-900' : ''}`}><Shield size={20}/>Cards</button>
                    <button onClick={() => setView('users')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'users' ? 'bg-yellow-400 text-gray-900' : ''}`}><Users size={20}/>Users</button>
                    <button onClick={() => setView('achievements')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'achievements' && 'bg-yellow-400 text-gray-900'}`}><Award size={20}/>Achievements</button>
                    <button onClick={() => setView('mons')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'mons' && 'bg-yellow-400 text-gray-900'}`}><Bone size={20}/>Mons</button>
                    <button onClick={() => setView('quests')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'quests' && 'bg-yellow-400 text-gray-900'}`}><ClipboardList size={20}/>Quests</button>
                    <button onClick={() => setView('rewards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'rewards' && 'bg-yellow-400 text-gray-900'}`}><Gift size={20}/>Rewards</button>
                    <button onClick={() => setView('site')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'site' && 'bg-yellow-400 text-gray-900'}`}><SettingsIcon size={20}/>Site Settings</button>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{renderManager()}</main>
        </div>
    );
};
// END COPYING HERE