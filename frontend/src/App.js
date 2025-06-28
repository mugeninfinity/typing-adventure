import React, { useState, useEffect, useRef } from 'react';
import { Database, Shield, Sun, Moon, Volume2, VolumeX, Upload, Trash2, Edit, LogIn, UserPlus, User as UserIcon, Keyboard, Download, ChevronsRight, Award, Users, Settings as SettingsIcon, Home, BookOpen, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// Import all the components
import AuthScreen from './components/AuthScreen';
import TypingTest from './components/TypingTest';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import JournalPage from './components/JournalPage';
import { Tooltip } from './components/HelperComponents';

// The mock API is being replaced piece by piece
const MOCK_USERS = {
  'user@example.com': { password: 'password123', isAdmin: false, unlockedAchievements: [], name: 'User', assignedCategories: ['Science'] },
  'admin@example.com': { password: 'admin123', isAdmin: true, unlockedAchievements: [], name: 'Admin', assignedCategories: [] },
};
const initialCards = [
  { id: 1, category: 'Science', title: 'A Journey to the Sun', textContent: 'The Sun is a star at the center of the Solar System. It is a nearly perfect sphere of hot plasma. It is the most important source of energy for life on Earth!', image: 'https://placehold.co/600x450/f97316/white?text=The+Sun', video: null, audio: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2bbe64992d.mp3', revealType: 'puzzle' },
  { id: 2, category: 'Nature', title: 'The Whispering Forest', textContent: 'Ancient trees stood tall, their leaves whispering secrets to the wind.', image: 'https://placehold.co/600x450/16a34a/white?text=Forest', video: null, audio: null, revealType: 'image' },
];
const initialAchievements = [
    { id: 'wpm_50', title: 'Speedy Fingers', description: 'Reach 50 WPM on any card.', icon: '??', iconType: 'emoji', type: 'wpm', value: 50 },
    { id: 'acc_98', title: 'Perfectionist', description: 'Get 98% accuracy or higher.', icon: '??', iconType: 'emoji', type: 'accuracy', value: 98 },
    { id: 'cards_10', title: 'Dedicated Typist', description: 'Complete 10 typing cards.', icon: '??', iconType: 'emoji', type: 'total_cards_completed', value: 10 },
    { id: 'first_card', title: 'Getting Started', description: 'Complete your first card.', icon: '??', iconType: 'emoji', type: 'total_cards_completed', value: 1 },
    { id: 'journal_1', title: 'First Entry', description: 'Write your first journal entry.', icon: '??', iconType: 'emoji', type: 'journal_entries', value: 1 },
    { id: 'journal_words_100', title: 'Budding Author', description: 'Write 100 words in your journal.', icon: '??', iconType: 'emoji', type: 'journal_words', value: 100 },
];
const initialSiteSettings = {
    siteName: 'Typing Adventure',
    correctSound: 'https://www.soundjay.com/button/sounds/button-16.mp3',
    incorrectSound: 'https://www.soundjay.com/button/sounds/button-10.mp3',
};

const mockApi = {
  login: async (identifier, password) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password }),
        });
        
        return await response.json();
    } catch (error) {
        console.error("Login API call failed:", error);
        return { success: false, message: 'Could not connect to server.' };
    }
  },
  getUsers: async () => JSON.parse(localStorage.getItem('users')) || MOCK_USERS,
  saveUsers: async (users) => localStorage.setItem('users', JSON.stringify(users)),
  getCards: async () => {
    try {
        const response = await fetch('/api/cards'); // Calls our new backend endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: data };
    } catch (error) {
        console.error("Failed to fetch cards:", error);
        // Fallback to initial data if API fails
        return { success: false, data: initialCards };
    }
  },
  saveCards: async (cards) => localStorage.setItem('cards', JSON.stringify(cards)),
  getHistory: async () => JSON.parse(localStorage.getItem('typingHistory')) || {},
  saveHistory: async (history) => localStorage.setItem('typingHistory', JSON.stringify(history)),
  getAchievements: async () => JSON.parse(localStorage.getItem('achievements')) || initialAchievements,
  saveAchievements: async (achievements) => localStorage.setItem('achievements', JSON.stringify(achievements)),
  getSiteSettings: async () => JSON.parse(localStorage.getItem('siteSettings')) || initialSiteSettings,
  saveSiteSettings: async (settings) => localStorage.setItem('siteSettings', JSON.stringify(settings)),
  getJournal: async () => JSON.parse(localStorage.getItem('journal')) || {},
  saveJournal: async (journal) => localStorage.setItem('journal', JSON.stringify(journal)),
};


export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth');
  const [cards, setCards] = useState([]);
  const [typingHistory, setTypingHistory] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [journalData, setJournalData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [audioToPlay, setAudioToPlay] = useState(null);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState({ isDarkMode: true, soundEnabled: false, showKeyboard: true });
  const [notificationQueue, setNotificationQueue] = useState([]);
  const audioRef = useRef(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const fetchCards = async () => {
    const res = await mockApi.getCards();
    if (res.success) {
      setCards(res.data);
    }
  };

  useEffect(() => { document.documentElement.classList.toggle('dark', settings.isDarkMode); }, [settings.isDarkMode]);
  useEffect(() => {
    fetchCards(); // Use the new function here
   // mockApi.getCards().then(res => setCards(res.data)); 
    mockApi.getHistory().then(setTypingHistory);
    mockApi.getUsers().then(setAllUsers);
    mockApi.getAchievements().then(setAchievements);
    mockApi.getSiteSettings().then(setSiteSettings);
    mockApi.getJournal().then(setJournalData);
  }, []);
  useEffect(() => { if (audioToPlay && audioRef.current) { audioRef.current.src = audioToPlay; audioRef.current.play().catch(e => {}); setAudioToPlay(null); } }, [audioToPlay]);
  
  useEffect(() => {
    if (notificationQueue.length > 0) {
      const timer = setTimeout(() => {
        setNotificationQueue(q => q.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationQueue]);
  
  const handleLogin = (loggedInUser) => { setUser(loggedInUser); setView('category_select'); };
  const handleLogout = () => { setUser(null); setView('auth'); setSelectedCategory(null); };
  // const handleCardsChange = (updatedCards) => { setCards(updatedCards); mockApi.saveCards(updatedCards); };
  const handleCardsChange = () => {
    fetchCards(); // Change this function to simply call fetchCards
  };
  const handleUsersChange = (updatedUsers) => { setAllUsers(updatedUsers); mockApi.saveUsers(updatedUsers); };
  const handleAchievementsChange = (updatedAchievements) => { setAchievements(updatedAchievements); mockApi.saveAchievements(updatedAchievements); };
  const handleSiteSettingsChange = (updatedSettings) => { setSiteSettings(updatedSettings); mockApi.saveSiteSettings(updatedSettings); };
  const handleJournalChange = (email, entries) => { const updatedJournal = {...journalData, [email]: entries}; setJournalData(updatedJournal); mockApi.saveJournal(updatedJournal); checkAndAwardAchievements(null, user, typingHistory, updatedJournal); };
  const handleDeleteJournalEntry = (email, entryId) => {
    const userJournal = journalData[email] || [];
    const updatedJournal = {...journalData, [email]: userJournal.filter(entry => entry.id !== entryId)};
    setJournalData(updatedJournal);
    mockApi.saveJournal(updatedJournal);
  };
  const handleSelectCategory = (category) => { setSelectedCategory(category); setView('card_select'); };
  const handleSelectCard = (index) => { setCurrentCardIndex(index); setProgress(0); setView('game'); };
  const handleDirectEdit = (card) => { setCardToEdit(card); setView('admin'); };
  
  const checkAndAwardAchievements = (stats, currentUser, allHistory, allJournal) => {
    if(currentUser.isGuest) return;
    let newAchievements = [];
    const userHistory = allHistory[currentUser.email] || [];
    const userJournal = allJournal[currentUser.email] || [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const historyInTime = (duration) => userHistory.filter(h => now - h.timestamp < duration);
    const totalCardsCompleted = userHistory.length;
    const totalWordsTyped = userHistory.reduce((sum, h) => sum + h.wordCount, 0);
    const totalCharsTyped = userHistory.reduce((sum, h) => sum + h.charCount, 0);
    const journalEntries = userJournal.length;
    const journalWords = userJournal.reduce((sum, entry) => sum + (entry.content || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).length, 0);
    const journalChars = userJournal.reduce((sum, entry) => sum + (entry.content || '').replace(/<[^>]+>/g, '').length, 0);

    achievements.forEach(ach => {
        if(currentUser.unlockedAchievements.includes(ach.id)) return;
        let unlocked = false;
        switch(ach.type) {
            case 'wpm': if (stats && stats.wpm >= ach.value && stats.accuracy > 80) unlocked = true; break;
            case 'accuracy': if (stats && stats.accuracy >= ach.value) unlocked = true; break;
            case 'total_cards_completed': if (totalCardsCompleted >= ach.value) unlocked = true; break;
            case 'total_words_typed': if (totalWordsTyped >= ach.value) unlocked = true; break;
            case 'total_chars_typed': if (totalCharsTyped >= ach.value) unlocked = true; break;
            case 'total_cards_day': if (historyInTime(day).length >= ach.value) unlocked = true; break;
            case 'total_cards_week': if (historyInTime(7 * day).length >= ach.value) unlocked = true; break;
            case 'total_cards_month': if (historyInTime(30 * day).length >= ach.value) unlocked = true; break;
            case 'journal_entries': if (journalEntries >= ach.value) unlocked = true; break;
            case 'journal_words': if (journalWords >= ach.value) unlocked = true; break;
            case 'journal_chars': if (journalChars >= ach.value) unlocked = true; break;
            case 'journal_entry_words': if (userJournal.some(entry => (entry.content || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).length >= ach.value)) unlocked = true; break;
            case 'journal_entry_chars': if (userJournal.some(entry => (entry.content || '').replace(/<[^>]+>/g, '').length >= ach.value)) unlocked = true; break;
            default: break;
        }
        if(unlocked) newAchievements.push(ach);
    });

    if(newAchievements.length > 0) {
        setNotificationQueue(q => [...q, ...newAchievements]);
        const updatedUser = { ...currentUser, unlockedAchievements: [...currentUser.unlockedAchievements, ...newAchievements.map(a => a.id)]};
        setUser(updatedUser);
        const updatedUsers = {...allUsers, [updatedUser.email]: updatedUser };
        setAllUsers(updatedUsers);
        mockApi.saveUsers(updatedUsers);
    }
  }

  const handleComplete = (stats) => {
    const categoryCards = cards.filter(c => c.category === selectedCategory);
    const card = categoryCards[currentCardIndex];
    if (card.audio) { setAudioToPlay(card.audio); }
    if (user.isGuest) return; 
    const newHistory = {...typingHistory};
    const cardKey = user.email;
    const userHistory = newHistory[cardKey] || [];
    userHistory.push({ ...stats, cardId: card.id, timestamp: Date.now() });
    newHistory[cardKey] = userHistory;
    setTypingHistory(newHistory);
    mockApi.saveHistory(newHistory);
    checkAndAwardAchievements(stats, user, newHistory, journalData);
  };
  
  const toggleTheme = () => setSettings(s => ({ ...s, isDarkMode: !s.isDarkMode }));
  const toggleSound = () => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }));
  const toggleKeyboard = () => setSettings(s => ({ ...s, showKeyboard: !s.showKeyboard }));

  const renderGameView = () => {
      const categoryCards = cards.filter(c => c.category === selectedCategory);
      const card = categoryCards[currentCardIndex];
      if (!card) return <div className="p-8 text-center">No cards in this category.</div>;
      const userHistory = (typingHistory[user.email] || []).filter(h => h.cardId === card.id);
      const prevBest = userHistory.length > 0 ? userHistory.reduce((best, current) => current.wpm > best.wpm ? current : best, {wpm:0}) : null;
      
      return (<TypingTest card={card} onComplete={handleComplete} onSkip={() => setCurrentCardIndex((currentCardIndex + 1) % categoryCards.length)} onDirectEdit={handleDirectEdit} settings={settings} siteSettings={siteSettings} prevBest={prevBest} user={user} />);
  }

  const renderView = () => {
    switch(view) {
      case 'admin': return <AdminPanel cards={cards} onCardsChange={handleCardsChange} users={allUsers} onUsersChange={handleUsersChange} achievements={achievements} onAchievementsChange={handleAchievementsChange} siteSettings={siteSettings} onSiteSettingsChange={handleSiteSettingsChange} initialCardToEdit={cardToEdit} onEditDone={() => setCardToEdit(null)} />;
      case 'game': return renderGameView();
      case 'profile': return <UserProfile user={user} history={typingHistory} achievements={achievements} journal={journalData} onJournalChange={handleJournalChange} />;
      case 'journal': return <JournalPage user={user} journal={journalData} onJournalChange={handleJournalChange} onDeleteEntry={handleDeleteJournalEntry} />;
      case 'card_select': 
        const categoryCards = cards.filter(c => user.isAdmin || (user.assignedCategories && user.assignedCategories.includes(c.category)));
        if(categoryCards.length === 0 && !user.isAdmin) {
            return <div className="p-8 text-center">No categories have been assigned to you. Please contact an administrator.</div>
        }
        return (<div className="p-8"><h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Category: {selectedCategory}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{categoryCards.map((card, index) => (<div key={card.id} onClick={() => handleSelectCard(index)} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all transform hover:-translate-y-1"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{card.title}</h3><p className="text-gray-600 dark:text-gray-400 mt-2">{card.textContent.substring(0,120)}...</p></div>))}</div><button onClick={() => setView('category_select')} className="mt-8 mx-auto block text-yellow-400 hover:underline">Back to Categories</button></div>);
      case 'category_select':
        const allCategories = [...new Set(cards.map(c => c.category || 'Uncategorized'))];
        const visibleCategories = user.isAdmin ? allCategories : allCategories.filter(c => user.assignedCategories && user.assignedCategories.includes(c));
        if(visibleCategories.length === 0 && !user.isAdmin) {
            return <div className="p-8 text-center">No categories have been assigned to you. Please contact an administrator.</div>
        }
        return (<div className="p-8"><h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Choose a Category</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{visibleCategories.map(category => (<div key={category} onClick={() => handleSelectCategory(category)} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all transform hover:-translate-y-1 flex justify-between items-center"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{category}</h3><ChevronsRight className="text-yellow-400"/></div>))}</div></div>);
      default: return <AuthScreen onLogin={handleLogin} mockApi={mockApi} />;
    }
  };

  if (!user) return (<div className="dark"><main className="bg-gray-900 text-gray-200 min-h-screen"><AuthScreen onLogin={handleLogin} mockApi={mockApi}/></main></div>);

  return (
    <main className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300">
      <audio ref={audioRef} />
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {notificationQueue.map((note, index) => (
            <div key={note.id} className="bg-yellow-400 text-gray-900 p-4 rounded-lg shadow-lg animate-fade-in-up flex items-center gap-4" style={{animationDelay: `${index * 100}ms`}}>
                <div>{note.iconType === 'emoji' ? <span className="text-4xl">{note.icon}</span> : <img src={note.icon} alt={note.title} className="w-12 h-12"/>}</div>
                <div><h4 className="font-bold">Achievement Unlocked!</h4><p>{note.title}</p></div>
            </div>
        ))}
      </div>
      <header className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-4">
            <Tooltip text="Home"><button onClick={() => setView('category_select')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Home size={24} className="text-yellow-400"/></button></Tooltip>
            <h1 className="text-xl font-bold text-yellow-400">{siteSettings.siteName}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {!user.isGuest && (<Tooltip text="My Journal"><button onClick={() => setView('journal')} className={`p-2 rounded-full ${view === 'journal' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><BookOpen size={20} /></button></Tooltip>)}
          {!user.isGuest && (<Tooltip text="My Profile"><button onClick={() => setView('profile')} className={`p-2 rounded-full ${view === 'profile' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><UserIcon size={20} /></button></Tooltip>)}
          {user.isAdmin && (<Tooltip text="Admin Panel"><button onClick={() => setView('admin')} className={`p-2 rounded-full ${view === 'admin' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><Database size={20} /></button></Tooltip>)}
          <Tooltip text={settings.showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}><button onClick={toggleKeyboard} className={`p-2 rounded-full ${settings.showKeyboard ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}><Keyboard size={20} /></button></Tooltip>
          <Tooltip text={settings.soundEnabled ? 'Disable Sound' : 'Enable Sound'}><button onClick={toggleSound} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">{settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button></Tooltip>
          <Tooltip text={settings.isDarkMode ? 'Light Mode' : 'Dark Mode'}><button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">{settings.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button></Tooltip>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:block">{user.name}<button onClick={handleLogout} className="ml-2 hover:underline">(Logout)</button></div>
        </div>
      </header>
      <div className="container mx-auto">{renderView()}</div>
    </main>
  );
}
