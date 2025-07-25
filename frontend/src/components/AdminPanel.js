// START COPYING HERE
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Users, Award, Tag, Settings as SettingsIcon, Bone, ClipboardList, Gift } from 'lucide-react';

// Import all manager components
import CardManager from './CardManager';
import UserManager from './UserManager';
import AchievementManager from './AchievementManager';
import SiteSettingsManager from './SiteSettingsManager';
// import MonManager from './MonManager';
import PokedexManager from './PokedexManager';
import UserMonManager from './UserMonManager';
import QuestManager from './QuestManager';
import RewardManager from './RewardManager';

export default function AdminPanel({
  cards, onSaveCard, onDeleteCard,
  users, onUsersChange,
  achievements, onSaveAchievements,
  siteSettings, onSiteSettingsChange,
  monTypes, onSaveMonType, onDeleteMonType,
  allMons, onDeleteUserMon,
  activeView, onNavigate,
  initialCardToEdit, onEditDone
}) {
    const childRef = useRef();

    useEffect(() => {
        if (initialCardToEdit && childRef.current?.startEditing) {
            onNavigate('cards');
            childRef.current.startEditing(initialCardToEdit);
            onEditDone();
        }
    }, [initialCardToEdit, onEditDone, onNavigate]);

    const renderManager = () => {
        switch (activeView) {
            case 'cards':
                // Pass the correct props down to CardManager
                return <CardManager ref={childRef} cards={cards} onSave={onSaveCard} onDelete={onDeleteCard} />;
            case 'users':
                // FIX: Pass the `cards` prop down to the UserManager
                return <UserManager users={users} onSave={onUsersChange} allCards={cards} />;
            case 'achievements':
                // FIX: The onAchievementsChange prop is now correctly passed to the AchievementManager
                // We rename it to "onSave" for consistency within the child component.
                return <AchievementManager achievements={achievements} onSave={onSaveAchievements} />;
            case 'site':
                return <SiteSettingsManager settings={siteSettings} onSave={onSiteSettingsChange} />;
            case 'pokedex':
                return <PokedexManager monTypes={monTypes} onSave={onSaveMonType} onDelete={onDeleteMonType} />;
            case 'user_mons':
                return <UserMonManager allMons={allMons} onDelete={onDeleteUserMon} />;
            case 'quests':
                return <QuestManager />;
            case 'rewards':
                return <RewardManager />;
            default:
                return <CardManager ref={childRef} cards={cards} onSave={onSaveCard} onDelete={onDeleteCard} />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0">
                <nav className="space-y-2">
                    <button onClick={() => onNavigate('cards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'cards' ? 'bg-yellow-400 text-gray-900' : ''}`}><Shield size={20}/>Cards</button>
                    <button onClick={() => onNavigate('users')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'users' ? 'bg-yellow-400 text-gray-900' : ''}`}><Users size={20}/>Users</button>
                    <button onClick={() => onNavigate('achievements')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'achievements' && 'bg-yellow-400 text-gray-900'}`}><Award size={20}/>Achievements</button>
                    <button onClick={() => onNavigate('pokedex')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'pokedex' ? 'bg-yellow-400 text-gray-900' : ''}`}><Tag size={20}/>Pokedex</button>
                    <button onClick={() => onNavigate('user_mons')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'user_mons' && 'bg-yellow-400 text-gray-900'}`}><Bone size={20}/>User Mons</button>                    
                    <button onClick={() => onNavigate('quests')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'quests' && 'bg-yellow-400 text-gray-900'}`}><ClipboardList size={20}/>Quests</button>
                    <button onClick={() => onNavigate('rewards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'rewards' && 'bg-yellow-400 text-gray-900'}`}><Gift size={20}/>Rewards</button>
                    <button onClick={() => onNavigate('site')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${activeView === 'site' && 'bg-yellow-400 text-gray-900'}`}><SettingsIcon size={20}/>Site Settings</button>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{renderManager()}</main>
        </div>
    );
};
// END COPYING HERE