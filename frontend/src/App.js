import React, { useState, useEffect, useRef } from 'react';
import { Database, Shield, Sun, Moon, Volume2, VolumeX, Upload, Trash2, Edit, LogIn, UserPlus, User as UserIcon, Keyboard, Download, ChevronsRight, Award, Users, Settings as SettingsIcon, Home, BookOpen } from 'lucide-react';

// Import all the components
import AuthScreen from './components/AuthScreen';
import TypingTest from './components/TypingTest';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import JournalPage from './components/JournalPage';
import { Tooltip } from './components/HelperComponents';

const api = {
  login: async (identifier, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return response.json();
  },
  getUsers: async () => (await fetch('/api/users')).json(),
  getCards: async () => (await fetch('/api/cards')).json(),
  saveCard: async (card) => {
    const url = card.id ? `/api/cards/${card.id}` : '/api/cards';
    const method = card.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    return response.json();
  },
  deleteCard: async (id) => {
    const response = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    return response.json();
  },
  getHistory: async (userId) => (await fetch(`/api/history/${userId}`)).json(),
  saveHistory: async (history) => {
      const response = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(history),
      });
      return response.json();
  },
  getAchievements: async () => (await fetch('/api/achievements')).json(),
  saveAchievements: async (achievements) => {
    const response = await fetch('/api/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievements),
    });
    return response.json();
  },
  getJournal: async (userId) => (await fetch(`/api/journal/${userId}`)).json(),
  saveJournalEntry: async (entry) => {
    const url = entry.id ? `/api/journal/${entry.id}` : '/api/journal';
    const method = entry.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return response.json();
  },
  deleteJournalEntry: async (id) => (await fetch(`/api/journal/${id}`, { method: 'DELETE' })).json(),
  getSiteSettings: async () => (await fetch('/api/site-settings')).json(),
  saveSiteSettings: async (settings) => {
    const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    return response.json();
  },
  saveUserSettings: async (userId, settings) => {
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
    return response.json();
  },
};


export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth');
  const [cards, setCards] = useState([]);
  const [typingHistory, setTypingHistory] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [journalData, setJournalData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [audioToPlay, setAudioToPlay] = useState(null);
  const [settings, setSettings] = useState({ 
    isDarkMode: true, 
    soundEnabled: false, 
    showKeyboard: true 
  });
  const [notificationQueue, setNotificationQueue] = useState([]);
  const audioRef = useRef(null);
  const [cardToEdit, setCardToEdit] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        setUser(foundUser);
        setView('category_select');
    }
  }, []);

  const fetchData = async () => {
    try {
        setCards(await api.getCards());
        setAchievements(await api.getAchievements());
        setSiteSettings(await api.getSiteSettings());
        if (user && !user.isGuest) {
            setTypingHistory(await api.getHistory(user.id));
            setJournalData(await api.getJournal(user.id));
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.isDarkMode);
    if (user && !user.isGuest) {
      // Debounce this in a real app to avoid too many API calls
      api.saveUserSettings(user.id, settings);
    }
  }, [settings, user]);

  useEffect(() => {
    if (user && user.settings) {
      setSettings(currentSettings => ({...currentSettings, ...user.settings}));
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (audioToPlay && audioRef.current) {
      audioRef.current.src = audioToPlay;
      audioRef.current.play().catch(() => {});
      setAudioToPlay(null);
    }
  }, [audioToPlay]);

  useEffect(() => {
    if (notificationQueue.length > 0) {
      const timer = setTimeout(() => {
        setNotificationQueue((q) => q.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationQueue]);

  const handleLogin = (data) => {
    if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setView('category_select');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setView('auth');
    setSelectedCategory(null);
  };
  
  const handleCardsChange = (newCards) => {
    if (Array.isArray(newCards)) {
        Promise.all(newCards.map(api.saveCard)).then(fetchData);
    } else {
        api.saveCard(newCards).then(fetchData);
    }
  };
  
  const handleAchievementsChange = (newAchievements) => {
    api.saveAchievements(newAchievements).then(fetchData);
  };
  
  const handleSiteSettingsChange = (newSiteSettings) => {
      api.saveSiteSettings(newSiteSettings).then(fetchData);
  };

  const handleComplete = (stats) => {
    const categoryCards = cards.filter((c) => c.category === selectedCategory);
    const card = categoryCards[currentCardIndex];
    if (card.audio) {
      setAudioToPlay(card.audio);
    }
    if (user.isGuest) return;
    
    const newHistoryRecord = {
        userId: user.id,
        cardId: card.id,
        ...stats,
    };
    api.saveHistory(newHistoryRecord).then(() => {
        api.getHistory(user.id).then(setTypingHistory);
        // checkAndAwardAchievements(stats);
    });
  };
  
  const renderGameView = () => {
    const categoryCards = cards.filter((c) => c.category === selectedCategory);
    const card = categoryCards[currentCardIndex];
    if (!card) return <div className="p-8 text-center">No cards in this category.</div>;
    
    const userHistory = typingHistory.filter((h) => h.card_id === card.id);
    const prevBest = userHistory.length > 0 ? userHistory.reduce((best, current) => (current.wpm > best.wpm ? current : best), { wpm: 0 }) : null;

    return (
      <TypingTest
        card={card}
        onComplete={handleComplete}
        onSkip={() => setCurrentCardIndex((currentCardIndex + 1) % categoryCards.length)}
        onDirectEdit={(c) => setCardToEdit(c)}
        settings={settings}
        siteSettings={siteSettings}
        prevBest={prevBest}
        user={user}
      />
    );
  };
  
  const renderView = () => {
    if (!user) {
        return <AuthScreen onLogin={handleLogin} mockApi={api} />;
    }

    switch(view) {
      case 'admin': return <AdminPanel cards={cards} onCardsChange={handleCardsChange} users={allUsers} onUsersChange={() => api.getUsers().then(setAllUsers)} achievements={achievements} onAchievementsChange={handleAchievementsChange} siteSettings={siteSettings} onSiteSettingsChange={handleSiteSettingsChange} initialCardToEdit={cardToEdit} onEditDone={() => setCardToEdit(null)} />;
      case 'game': return renderGameView();
      case 'profile': return <UserProfile user={user} history={typingHistory} achievements={achievements} journal={journalData} />;
      case 'journal': return <JournalPage user={user} journal={journalData} onJournalChange={(updatedEntry) => { api.saveJournalEntry(updatedEntry).then(() => api.getJournal(user.id).then(setJournalData)) }} onDeleteEntry={(entryId) => { api.deleteJournalEntry(entryId).then(() => api.getJournal(user.id).then(setJournalData)); }} />;
      case 'card_select': 
        const categoryCards = cards.filter(c => user.isAdmin || (user.assigned_categories && user.assigned_categories.includes(c.category)));
        if(categoryCards.length === 0 && !user.isAdmin) {
            return <div className="p-8 text-center">No categories have been assigned to you. Please contact an administrator.</div>
        }
        return (<div className="p-8"><h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Category: {selectedCategory}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{categoryCards.map((card, index) => (<div key={card.id} onClick={() => {setCurrentCardIndex(index); setView('game')}} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all transform hover:-translate-y-1"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{card.title}</h3><p className="text-gray-600 dark:text-gray-400 mt-2">{card.text_content.substring(0,120)}...</p></div>))}</div><button onClick={() => setView('category_select')} className="mt-8 mx-auto block text-yellow-400 hover:underline">Back to Categories</button></div>);
      case 'category_select':
        const allCategories = [...new Set(cards.map(c => c.category || 'Uncategorized'))];
        const visibleCategories = user.isAdmin ? allCategories : allCategories.filter(c => user.assigned_categories && user.assigned_categories.includes(c));
        if(visibleCategories.length === 0 && !user.isAdmin) {
            return <div className="p-8 text-center">No categories have been assigned to you. Please contact an administrator.</div>
        }
        return (<div className="p-8"><h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Choose a Category</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{visibleCategories.map(category => (<div key={category} onClick={() => {setSelectedCategory(category); setView('card_select')}} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all transform hover:-translate-y-1 flex justify-between items-center"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{category}</h3><ChevronsRight className="text-yellow-400"/></div>))}</div></div>);
      default: return <AuthScreen onLogin={handleLogin} mockApi={api} />;
    }
  };


  return (
    <main className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300">
      <audio ref={audioRef} />
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {notificationQueue.map((note, index) => (
            <div key={note.id} className="bg-yellow-400 text-gray-900 p-4 rounded-lg shadow-lg animate-fade-in-up flex items-center gap-4" style={{animationDelay: `${index * 100}ms`}}>
                <div>{note.icon_type === 'emoji' ? <span className="text-4xl">{note.icon}</span> : <img src={note.icon} alt={note.title} className="w-12 h-12"/>}</div>
                <div><h4 className="font-bold">Achievement Unlocked!</h4><p>{note.title}</p></div>
            </div>
        ))}
      </div>
      {user && <header className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-4">
            <Tooltip text="Home"><button onClick={() => setView('category_select')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Home size={24} className="text-yellow-400"/></button></Tooltip>
            <h1 className="text-xl font-bold text-yellow-400">{siteSettings.site_name}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {!user.isGuest && (<Tooltip text="My Journal"><button onClick={() => setView('journal')} className={`p-2 rounded-full ${view === 'journal' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><BookOpen size={20} /></button></Tooltip>)}
          {!user.isGuest && (<Tooltip text="My Profile"><button onClick={() => setView('profile')} className={`p-2 rounded-full ${view === 'profile' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><UserIcon size={20} /></button></Tooltip>)}
          {user.isAdmin && (<Tooltip text="Admin Panel"><button onClick={() => setView('admin')} className={`p-2 rounded-full ${view === 'admin' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><Database size={20} /></button></Tooltip>)}
            <Tooltip text={settings.showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}><button onClick={() => setSettings(s => ({...s, showKeyboard: !s.showKeyboard}))} className={`p-2 rounded-full ${settings.showKeyboard ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><Keyboard size={20} /></button></Tooltip>
  <Tooltip text={settings.soundEnabled ? 'Disable Sound' : 'Enable Sound'}><button onClick={() => setSettings(s => ({...s, soundEnabled: !s.soundEnabled}))} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">{settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button></Tooltip>
  <Tooltip text={settings.isDarkMode ? 'Light Mode' : 'Dark Mode'}><button onClick={() => setSettings(s => ({...s, isDarkMode: !s.isDarkMode}))} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">{settings.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button></Tooltip>          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:block">{user.name}<button onClick={handleLogout} className="ml-2 hover:underline">(Logout)</button></div>
        </div>
      </header>}
      <div className="container mx-auto">{renderView()}</div>
    </main>
  );
}