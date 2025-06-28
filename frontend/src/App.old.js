import React, { useState, useEffect, useRef } from 'react';
import { Database, Shield, Sun, Moon, Volume2, VolumeX, Upload, Trash2, Edit, LogIn, UserPlus, User as UserIcon, Keyboard, Download, ChevronsRight, Award, Users, Settings as SettingsIcon, Home, BookOpen, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// --- MOCK DATABASE & API ---
const MOCK_USERS = {
  'user@example.com': { password: 'password123', isAdmin: false, unlockedAchievements: [], name: 'User' },
  'admin@example.com': { password: 'admin123', isAdmin: true, unlockedAchievements: [], name: 'Admin' },
};
const initialCards = [
  { id: 1, category: 'Science', title: 'A Journey to the Sun', textContent: 'The Sun is a star at the center of the Solar System. It is a nearly perfect sphere of hot plasma. It is the most important source of energy for life on Earth!', image: 'https://placehold.co/600x450/f97316/white?text=The+Sun', video: null, audio: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2bbe64992d.mp3', revealType: 'puzzle' },
  { id: 2, category: 'Nature', title: 'The Whispering Forest', textContent: 'Ancient trees stood tall, their leaves whispering secrets to the wind.', image: 'https://placehold.co/600x450/16a34a/white?text=Forest', video: null, audio: null, revealType: 'image' },
  { id: 3, category: 'Nature', title: 'Ocean Depths', textContent: 'Below the waves, a world of vibrant color and life exists. Coral reefs teem with fish of every shape and size.', video: 'https://www.w3schools.com/html/mov_bbb.mp4', image: null, audio: null, revealType: 'video'},
];
const initialAchievements = [
    { id: 'wpm_50', title: 'Speedy Fingers', description: 'Reach 50 WPM on any card.', icon: '🚀', iconType: 'emoji', type: 'wpm', value: 50 },
    { id: 'acc_98', title: 'Perfectionist', description: 'Get 98% accuracy or higher.', icon: '🎯', iconType: 'emoji', type: 'accuracy', value: 98 },
    { id: 'cards_10', title: 'Dedicated Typist', description: 'Complete 10 typing cards.', icon: '📚', iconType: 'emoji', type: 'total_cards_completed', value: 10 },
    { id: 'first_card', title: 'Getting Started', description: 'Complete your first card.', icon: '🌱', iconType: 'emoji', type: 'total_cards_completed', value: 1 },
    { id: 'journal_1', title: 'First Entry', description: 'Write your first journal entry.', icon: '✍️', iconType: 'emoji', type: 'journal_entries', value: 1 },
    { id: 'journal_words_100', title: 'Budding Author', description: 'Write 100 words in your journal.', icon: '📜', iconType: 'emoji', type: 'journal_words', value: 100 },
];
const initialSiteSettings = {
    siteName: 'Typing Adventure',
    correctSound: 'https://www.soundjay.com/button/sounds/button-16.mp3',
    incorrectSound: 'https://www.soundjay.com/button/sounds/button-10.mp3',
};

const mockApi = {
  login: async (identifier, password) => {
    const allUsers = JSON.parse(localStorage.getItem('users')) || MOCK_USERS;
    const userFound = Object.entries(allUsers).find(([email, userData]) => {
        return (email === identifier || userData.name === identifier) && userData.password === password;
    });

    if (userFound) {
        const [email, userData] = userFound;
        return { success: true, user: { email, ...userData } };
    }
    return { success: false, message: 'Invalid credentials.' };
  },
  getUsers: async () => JSON.parse(localStorage.getItem('users')) || MOCK_USERS,
  saveUsers: async (users) => localStorage.setItem('users', JSON.stringify(users)),
  getCards: async () => JSON.parse(localStorage.getItem('cards')) || initialCards,
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
// --- END MOCK ---

// --- HELPER COMPONENTS ---
const Modal = ({ children, onClose }) => ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"><div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full m-4 relative animate-fade-in-up"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none">&times;</button>{children}</div></div>);
const Tooltip = ({ text, children }) => ( <div className="relative group flex items-center">{children}<div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">{text}</div></div>);

// --- CORE APP COMPONENTS ---
const AuthScreen = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const handleGuestLogin = () => { onLogin({ name: 'Guest', isAdmin: false, isGuest: true, unlockedAchievements: [] }); };
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); const response = await mockApi.login(identifier, password); if (response.success) onLogin(response.user); else setError(response.message || 'Authentication failed.'); };
  return (<div className="w-full h-screen flex items-center justify-center bg-gray-900"><div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg"><h2 className="text-3xl font-bold text-center text-yellow-400">Welcome Back</h2><form onSubmit={handleSubmit} className="space-y-4"><input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or Username" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400" required /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400" required />{error && <p className="text-red-500 text-sm">{error}</p>}<button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500 transition-colors"><LogIn size={20}/> Login</button></form><div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-600"></div><span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span><div className="flex-grow border-t border-gray-600"></div></div><button onClick={handleGuestLogin} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-500 transition-colors"><UserIcon size={20}/> Continue as Guest</button></div></div>);
};

const CompletionFeedback = ({ stats, prevBest, user, wordCount }) => {
    const getFeedback = () => {
        if (user.isGuest) return { emoji: '🎉', message: `Great job, Guest!`, advice: 'Log in to save your progress and get personalized feedback.'};
        if (!prevBest) return { emoji: '🙂', message: `Nice one, ${user.name}! You've set your first score.`, advice: 'Try it again to see if you can beat your new record!' };
        const wpmChange = stats.wpm - prevBest.wpm;
        if (wpmChange > 5 && stats.accuracy >= 95) return { emoji: '🚀', message: `Incredible speed, ${user.name}!`, advice: 'You smashed your previous record. Amazing job!' };
        if (wpmChange > 0) return { emoji: '👍', message: `Faster than before, ${user.name}!`, advice: `You improved your WPM. Keep up the great work!` };
        if (stats.accuracy > prevBest.accuracy && stats.accuracy > 97) return { emoji: '🎯', message: `Perfect precision, ${user.name}!`, advice: 'Your accuracy is superb. Now try to increase your speed.' };
        if (stats.accuracy < 90) return { emoji: '🧐', message: `Good effort, ${user.name}!`, advice: 'Try to slow down just a bit to focus on hitting the right keys.' };
        return { emoji: '🤔', message: `So close, ${user.name}!`, advice: 'You were very close to your previous score. You can beat it next time!' };
    };
    const { emoji, message, advice } = getFeedback();
    const uniqueIncorrect = [...new Set(stats.incorrectLetters)];
    return (<div className="mt-8 text-center bg-gray-200 dark:bg-gray-800 p-6 rounded-lg animate-fade-in-up"><h3 className="text-2xl font-bold text-yellow-400">Card Complete! <span className="text-4xl ml-2">{emoji}</span></h3><p className="my-3 text-gray-800 dark:text-gray-200">{message}</p><div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-lg my-4 text-gray-800 dark:text-white"><span>WPM: <span className="font-bold">{stats.wpm}</span></span><span>Accuracy: <span className="font-bold">{stats.accuracy}%</span></span><span>Time: <span className="font-bold">{stats.timeElapsed}s</span></span><span>Words: <span className="font-bold">{wordCount}</span></span></div>{uniqueIncorrect.length > 0 && <div className="mb-4"><p className="text-sm text-gray-500">Keys to practice:</p><div className="flex justify-center flex-wrap gap-2 mt-1">{uniqueIncorrect.map((letter, i) => <span key={i} className="font-mono bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded px-2 py-1 text-lg">{letter === ' ' ? 'Space' : letter}</span>)}</div></div>}<p className="text-sm text-gray-500 italic mb-4">{advice}</p></div>);
};

const TypingTest = ({ card, onComplete, onSkip, onDirectEdit, settings, siteSettings, prevBest, user }) => {
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const incorrectLetters = useRef([]);
  const audioCorrectRef = useRef(null);
  const audioIncorrectRef = useRef(null);
  const inputRef = useRef(null);
  const textToType = card.textContent;
  const wordCount = textToType.split(' ').length;
  const [lastTypedKey, setLastTypedKey] = useState('');
  const [isMistake, setIsMistake] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { 
      setInputValue(''); setStartTime(null); setWpm(0); setIsFinished(false); setFinalStats(null); incorrectLetters.current = []; setProgress(0); 
      const timer = setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
  }, [card]);

  useEffect(() => { if(startTime && !isFinished) { const interval = setInterval(() => { const elapsedSeconds = (Date.now() - startTime) / 1000; const typedWords = inputValue.length / 5; const currentWpm = Math.round((typedWords / elapsedSeconds) * 60) || 0; setWpm(currentWpm); }, 1000); return () => clearInterval(interval); } }, [startTime, isFinished, inputValue]);
  const playSound = (soundRef) => { if(settings.soundEnabled && soundRef.current) { soundRef.current.currentTime = 0; soundRef.current.play().catch(e => {}); }};
  
  const handleInputChange = (e) => {
    if (isFinished) return;
    if (!startTime) setStartTime(Date.now());
    const value = e.target.value;
    const typedChar = value.slice(-1);
    setLastTypedKey(typedChar);
    
    const mistakeMade = value !== textToType.substring(0, value.length);
    setIsMistake(mistakeMade);

    if (value.length > inputValue.length) {
        if (!mistakeMade) playSound(audioCorrectRef);
        else { playSound(audioIncorrectRef); incorrectLetters.current.push(textToType[value.length - 1]); }
    }
    const errors = incorrectLetters.current.length;
    const totalTyped = value.length;
    const newAccuracy = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
    
    setInputValue(value);
    const currentProgress = (value.length / textToType.length) * 100;
    setProgress(currentProgress);
    if (value.length === textToType.length && !mistakeMade) {
      setIsFinished(true);
      const timeElapsed = (Date.now() - startTime) / 1000;
      const finalWPM = Math.round((wordCount) / (timeElapsed / 60)) || 0;
      const stats = { wpm: finalWPM, accuracy: newAccuracy, timeElapsed: timeElapsed.toFixed(2), incorrectLetters: incorrectLetters.current, wordCount, charCount: textToType.length };
      setFinalStats(stats);
      onComplete(stats);
    }
  };

  const nextChar = isFinished ? '🎉' : textToType[inputValue.length] || '';
  
  const words = textToType.split(' ');
  const typedWords = inputValue.split(' ');
  const currentWordIndex = typedWords.length - 1;
  const mediaReveal = card.image || card.video;

  return (<div className="w-full max-w-4xl mx-auto p-4 md:p-8" onClick={() => inputRef.current && inputRef.current.focus()}><audio ref={audioCorrectRef} src={siteSettings.correctSound} preload="auto"></audio><audio ref={audioIncorrectRef} src={siteSettings.incorrectSound} preload="auto"></audio>
    {mediaReveal && (<div className="p-4 md:p-8 flex justify-center items-center cursor-pointer" onClick={onSkip}><div className="transition-opacity duration-500" style={{opacity: progress / 100}}>{card.revealType === 'puzzle' && card.image && <PuzzleReveal imageSrc={card.image} progress={progress} textLength={card.textContent.length} />}{(card.revealType === 'image' || (card.revealType !== 'puzzle' && card.image)) && <img src={card.image} alt={card.title} className="max-w-full max-h-[450px] rounded-lg shadow-2xl"/>}{card.video && <video src={card.video} autoPlay muted loop className="max-w-full max-h-[450px] rounded-lg shadow-2xl"></video>}</div></div>)}
    <div className="mb-4 text-center"><p className="text-gray-500 dark:text-gray-400 text-sm">NEXT KEY</p><div className={`mx-auto mt-1 w-auto px-4 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-all border-4 ${isMistake ? 'border-red-500' : 'border-transparent'}`}><span className={`font-mono text-4xl font-bold text-gray-800 dark:text-gray-200`}>{isMistake ? 'Backspace' : (nextChar === ' ' ? 'Space' : nextChar)}</span></div></div>
    <div className="relative text-2xl md:text-3xl leading-relaxed bg-gray-200 dark:bg-gray-800 p-6 rounded-lg font-mono tracking-wider"><p className="select-none">{words.map((word, wordIndex) => (<React.Fragment key={wordIndex}><span className="word">{word.split('').map((char, charIndexInWord) => {
        const absoluteCharIndex = words.slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0) + charIndexInWord;
        let charClasses = 'px-0.5 rounded-sm ';
        const isCurrentWord = wordIndex === currentWordIndex && !isFinished;
        const isPastWord = wordIndex < currentWordIndex;
        
        if (isCurrentWord) {
            const typedCurrentWord = typedWords[wordIndex] || '';
            if (charIndexInWord < typedCurrentWord.length) {
                if (typedCurrentWord[charIndexInWord] === char) {
                    charClasses += 'bg-green-500/50 text-gray-800 dark:text-gray-200';
                } else {
                    charClasses += 'bg-red-500/50 text-gray-800 dark:text-gray-200';
                }
            } else {
                charClasses += 'bg-yellow-500/20 text-gray-500 dark:text-gray-400';
            }
        } else if (isPastWord) {
            const typedPastWord = typedWords[wordIndex] || '';
            if (charIndexInWord < typedPastWord.length && typedPastWord[charIndexInWord] === char) {
                charClasses += 'text-gray-400 dark:text-gray-500';
            } else {
                charClasses += 'text-red-500 underline decoration-red-600';
            }
        } else {
            charClasses += 'text-gray-500 dark:text-gray-400';
        }
        return (<span key={charIndexInWord} className={charClasses}>{char}</span>);
    })}</span>{wordIndex < words.length - 1 ? ' ' : ''}</React.Fragment>))}</p><input ref={inputRef} type="text" value={inputValue} onChange={handleInputChange} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default focus:outline-green-500 focus:outline-dashed" autoFocus disabled={isFinished} /></div>
    {settings.showKeyboard && <SimulatedKeyboard highlightKey={nextChar} mistakeKey={isMistake ? lastTypedKey : null} />}
    <div className="flex justify-between items-center mt-6 min-h-[40px]"><div className="flex gap-4 md:gap-8 text-xl md:text-2xl"><div><span className="text-gray-500">WPM:</span> <span className="font-bold text-gray-800 dark:text-white">{finalStats ? finalStats.wpm : wpm}</span></div></div>{!isFinished && <div className="flex gap-2">{user.isAdmin && <button onClick={() => onDirectEdit(card)} className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition-colors">Edit Card</button>}<button onClick={onSkip} className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">Skip Card</button></div>}</div>{isFinished && (<div><CompletionFeedback stats={finalStats} prevBest={prevBest} user={user} wordCount={wordCount} /><div className="text-center mt-4"><button onClick={onSkip} className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500 transition-colors">Next Card</button></div></div>)}</div>);
};

const PuzzleReveal = ({ imageSrc, progress, textLength }) => {
    const getGridSize = (len) => { if (len < 150) return 3; if (len < 300) return 4; return 5; };
    const gridSize = getGridSize(textLength); const numTiles = gridSize * gridSize;
    const [shuffledIndices, setShuffledIndices] = useState([]); const [tileTransforms, setTileTransforms] = useState([]);
    useEffect(() => { setShuffledIndices(Array.from(Array(numTiles).keys()).sort(() => Math.random() - 0.5)); const transforms = Array.from({ length: numTiles }).map(() => { const side = Math.floor(Math.random() * 4); switch(side) { case 0: return 'translateX(-100%)'; case 1: return 'translateX(100%)'; case 2: return 'translateY(-100%)'; default: return 'translateY(100%)'; }}); setTileTransforms(transforms); }, [imageSrc, numTiles]);
    const tilesToReveal = Math.floor((progress / 100) * numTiles);
    return (<div className="grid gap-0 mx-auto rounded-lg overflow-hidden shadow-2xl" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: 'clamp(300px, 90vw, 600px)', aspectRatio: '4 / 3' }}>{Array.from({ length: numTiles }).map((_, i) => { const isRevealed = shuffledIndices.slice(0, tilesToReveal).includes(i); return (<div key={i} className="w-full h-full bg-gray-200 dark:bg-gray-700 transition-all duration-700 ease-in-out" style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`, backgroundPosition: `${(i % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(i / gridSize) * (100 / (gridSize - 1))}%`, opacity: isRevealed ? 1 : 0, transform: isRevealed ? 'translate(0, 0)' : tileTransforms[i] }}></div>); })}</div>);
};

const SimulatedKeyboard = ({ highlightKey, mistakeKey }) => {
    const shiftSymbols = {'!':'1', '@':'2', '#':'3', '$':'4', '%':'5', '^':'6', '&':'7', '*':'8', '(':'9', ')':'0', '_':'-', '+':'+', '{':'[', '}':']', '|':'\\', ':':';', '"':'\'', '<':',', '>':'.', '?':'/'};
    const isCapital = highlightKey >= 'A' && highlightKey <= 'Z';
    const isShiftSymbol = Object.keys(shiftSymbols).includes(highlightKey);
    const highlightShift = isCapital || isShiftSymbol;
    let keyToHighlight = isCapital ? highlightKey.toLowerCase() : (isShiftSymbol ? shiftSymbols[highlightKey] : highlightKey);
    if (!isShiftSymbol && [',','.','/','\'',';','-','=','[',']'].includes(highlightKey)) keyToHighlight = highlightKey;
    const Key = ({ k, width = 'w-10', children }) => {
        const isHighlight = k.toLowerCase() === keyToHighlight || (k === 'Shift' && highlightShift);
        const isMistake = k.toLowerCase() === mistakeKey?.toLowerCase();
        const keyClass = isMistake ? 'bg-red-500 text-white font-bold' : isHighlight ? 'bg-yellow-400 text-gray-900 font-bold' : 'bg-gray-100 dark:bg-gray-600';
        return (<div className={`h-10 flex items-center justify-center font-mono rounded text-sm md:text-lg transition-colors ${width} ${keyClass}`}>{children || k.toUpperCase()}</div>);
    };
    return (<div className="mt-4 p-2 bg-gray-300 dark:bg-gray-700 rounded-lg transition-all duration-300"><div className="flex justify-center gap-1 my-1"> {['1','2','3','4','5','6','7','8','9','0', '-', '='].map(k => <Key key={k} k={k}/>)} <Key k="backspace" width="w-20">Bksp</Key> </div><div className="flex justify-center gap-1 my-1"> {['q','w','e','r','t','y','u','i','o','p', '[', ']'].map(k => <Key key={k} k={k}/>)} <Key k="enter" width="w-20">Enter</Key> </div><div className="flex justify-center gap-1 my-1"> {['a','s','d','f','g','h','j','k','l',';','\''].map(k => <Key key={k} k={k}/>)} </div><div className="flex justify-center gap-1 my-1"> <Key k="Shift" width="w-28" /> {['z','x','c','v','b','n','m',',','.','/'].map(k => <Key key={k} k={k}/>)} <Key k="Shift" width="w-28" /> </div><div className="flex justify-center gap-1 my-1"> <Key k=" " width="w-96">Space</Key> </div></div>);
};

const AdminPanel = ({ cards, onCardsChange, users, onUsersChange, achievements, onAchievementsChange, siteSettings, onSiteSettingsChange, initialCardToEdit, onEditDone }) => {
    const [view, setView] = useState('cards');
    const childRef = useRef();

    useEffect(() => {
        if (initialCardToEdit && childRef.current) {
            setView('cards');
            childRef.current.startEditing(initialCardToEdit);
            onEditDone();
        }
    }, [initialCardToEdit, onEditDone]);

    return (<div className="flex min-h-screen"><aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0"><nav className="space-y-2"><button onClick={() => setView('cards')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'cards' && 'bg-yellow-400 text-gray-900'}`}><Shield size={20}/>Cards</button><button onClick={() => setView('users')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'users' && 'bg-yellow-400 text-gray-900'}`}><Users size={20}/>Users</button><button onClick={() => setView('achievements')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'achievements' && 'bg-yellow-400 text-gray-900'}`}><Award size={20}/>Achievements</button><button onClick={() => setView('site')} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${view === 'site' && 'bg-yellow-400 text-gray-900'}`}><SettingsIcon size={20}/>Site Settings</button></nav></aside><main className="flex-1 p-8 overflow-y-auto">{view === 'cards' && <CardManager ref={childRef} cards={cards} onCardsChange={onCardsChange} />}{view === 'users' && <UserManager users={users} onUsersChange={onUsersChange} />}{view === 'achievements' && <AchievementManager achievements={achievements} onAchievementsChange={onAchievementsChange}/>}{view === 'site' && <SiteSettingsManager settings={siteSettings} onSettingsChange={onSiteSettingsChange} />}</main></div>);
};

const CardManager = React.forwardRef(({ cards, onCardsChange }, ref) => {
    const [isEditing, setIsEditing] = useState(false); const [currentCard, setCurrentCard] = useState(null); const [confirmingDelete, setConfirmingDelete] = useState(null); const importFileRef = useRef(null);
    const handleNewCard = () => { setCurrentCard({ id: Date.now(), category: 'Uncategorized', title: '', textContent: '', image: '', video: '', audio: '', revealType: 'image' }); setIsEditing(true);};
    const handleEditCard = (card) => { setCurrentCard(card); setIsEditing(true); };
    React.useImperativeHandle(ref, () => ({ startEditing: handleEditCard }));
    const handleDeleteCard = (card) => { setConfirmingDelete(card); };
    const confirmDelete = () => { if (confirmingDelete) { onCardsChange(cards.filter(c => c.id !== confirmingDelete.id)); setConfirmingDelete(null); }};
    const handleSaveCard = (e) => { e.preventDefault(); const updatedCards = cards.find(c => c.id === currentCard.id) ? cards.map(c => c.id === currentCard.id ? currentCard : c) : [...cards, currentCard]; onCardsChange(updatedCards); setIsEditing(false); setCurrentCard(null); };
    const handleExport = () => { const headers = Object.keys(cards[0] || {}); if(headers.length === 0) return; const csvRows = [headers.join(',')]; for (const card of cards) { const values = headers.map(header => { const val = card[header] === null || card[header] === undefined ? '' : card[header]; const escaped = (''+val).replace(/"/g, '""'); return `"${escaped}"`; }); csvRows.push(values.join(',')); } const csvData = csvRows.join('\n'); const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', 'typing-cards-export.csv'); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleImport = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const rows = text.split('\n').filter(row => row.trim() !== '');
                const headers = rows.shift().split(',').map(h => h.replace(/"/g, '').trim());
                const importedCards = rows.map(row => {
                    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
                    const card = headers.reduce((obj, header, index) => { obj[header] = values[index] || ''; return obj; }, {});
                    card.id = parseInt(card.id) || Date.now() + Math.random();
                    return card;
                });
                const updatedCards = [...cards];
                importedCards.forEach(imported => { const existingIndex = updatedCards.findIndex(c => c.id == imported.id); if (existingIndex > -1) updatedCards[existingIndex] = imported; else updatedCards.push(imported); });
                onCardsChange(updatedCards);
                alert(`${importedCards.length} cards imported successfully!`);
            } catch (error) { alert("Failed to import CSV. Please check the file format."); console.error(error); }
        };
        reader.readAsText(file); e.target.value = null;
    };
    const MediaInput = ({ name, value, onChange }) => (<div className="space-y-2"><label className="block text-sm font-medium text-gray-300 capitalize">{name} URL</label><input type="text" placeholder={`https://${name} URL`} value={value || ''} onChange={e => onChange(name, e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><label className="block text-sm font-medium text-gray-300">Upload {name}</label><input type="file" onChange={e => e.target.files[0] && onChange(name, URL.createObjectURL(e.target.files[0]))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div>);
    if (isEditing) return ( <div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentCard.id ? 'Edit' : 'Create'} Card</h3><form onSubmit={handleSaveCard} className="space-y-4"><input type="text" placeholder="Card Title" value={currentCard.title} onChange={e => setCurrentCard({...currentCard, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Category" value={currentCard.category} onChange={e => setCurrentCard({...currentCard, category: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><textarea placeholder="Card Text Content" value={currentCard.textContent} onChange={e => setCurrentCard({...currentCard, textContent: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md h-32" required /><div><label className="block mb-2 text-sm font-medium text-gray-300">Reveal Type</label><select value={currentCard.revealType} onChange={e => setCurrentCard({...currentCard, revealType: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md"><option value="image">Image Fade-in</option><option value="video">Video Fade-in</option><option value="puzzle">Puzzle Image</option></select></div><MediaInput name="image" value={currentCard.image} onChange={(name, val) => setCurrentCard({...currentCard, [name]: val})} /><MediaInput name="video" value={currentCard.video} onChange={(name, val) => setCurrentCard({...currentCard, [name]: val})} /><MediaInput name="audio" value={currentCard.audio} onChange={(name, val) => setCurrentCard({...currentCard, [name]: val})} /><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button></div></form></div>);
    return ( <div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">Card Manager</h2><div className="flex gap-2"><input type="file" ref={importFileRef} onChange={handleImport} className="hidden" accept=".csv" /><button onClick={() => importFileRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Upload size={18}/> Import</button><button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600"><Download size={18}/> Export</button><button onClick={handleNewCard} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Upload size={18}/> New</button></div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{cards.map(card => (<div key={card.id} className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between"><h4 className="font-bold text-lg text-white">{card.title}</h4><p className="text-gray-400 text-sm">{card.category}</p><p className="text-sm text-gray-300 my-2 flex-grow">{card.textContent.substring(0, 100)}...</p><div className="flex gap-2 mt-4"><button onClick={() => handleEditCard(card)} className="flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-gray-600 rounded-md hover:bg-gray-500"><Edit size={16}/> Edit</button><button onClick={() => handleDeleteCard(card)} className="flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-red-800 rounded-md hover:bg-red-700"><Trash2 size={16}/> Delete</button></div></div>))}</div>{confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete the card "{confirmingDelete.title}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}</div>);
});

const AchievementManager = ({achievements, onAchievementsChange}) => {
    const [isEditing, setIsEditing] = useState(false); const [currentAchievement, setCurrentAchievement] = useState(null);
    const handleNew = () => { setCurrentAchievement({ id: `custom_${Date.now()}`, title: '', description: '', icon: '🏆', iconType: 'emoji', type: 'wpm', value: 100 }); setIsEditing(true); };
    const handleEdit = (ach) => { setCurrentAchievement(ach); setIsEditing(true); };
    const handleDelete = (id) => { if(confirm('Delete this achievement?')) { onAchievementsChange(achievements.filter(a => a.id !== id)); }};
    const handleSave = (e) => { e.preventDefault(); const updated = achievements.find(a => a.id === currentAchievement.id) ? achievements.map(a => a.id === currentAchievement.id ? currentAchievement : a) : [...achievements, currentAchievement]; onAchievementsChange(updated); setIsEditing(false); setCurrentAchievement(null); };
    const achievementTypes = ['wpm', 'accuracy', 'total_cards_completed', 'total_words_typed', 'total_chars_typed', 'total_cards_day', 'total_cards_week', 'total_cards_month', 'journal_entries', 'journal_words', 'journal_chars', 'journal_entry_words', 'journal_entry_chars'];
    const IconInput = ({ value, type, onChange }) => {
        if (type === 'emoji') return <input type="text" placeholder="Icon (Emoji)" value={value} onChange={e => onChange('icon', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" required />;
        if (type === 'url') return <input type="text" placeholder="Image URL" value={value} onChange={e => onChange('icon', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md" required />;
        if (type === 'upload') return <input type="file" onChange={e => e.target.files[0] && onChange('icon', URL.createObjectURL(e.target.files[0]))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>;
        return null;
    };
    if(isEditing) return (<div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentAchievement.id.startsWith('custom') ? 'Create' : 'Edit'} Achievement</h3><form onSubmit={handleSave} className="space-y-4"><input type="text" placeholder="Title" value={currentAchievement.title} onChange={e => setCurrentAchievement({...currentAchievement, title: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Description" value={currentAchievement.description} onChange={e => setCurrentAchievement({...currentAchievement, description: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><div><label className="block mb-2 text-sm font-medium text-gray-300">Icon Type</label><select value={currentAchievement.iconType} onChange={e => setCurrentAchievement({...currentAchievement, iconType: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md"><option value="emoji">Emoji</option><option value="url">Image URL</option><option value="upload">Upload</option></select></div><IconInput value={currentAchievement.icon} type={currentAchievement.iconType} onChange={(key, val) => setCurrentAchievement({...currentAchievement, [key]: val})} /><div><label className="block mb-2 text-sm font-medium text-gray-300">Type</label><select value={currentAchievement.type} onChange={e => setCurrentAchievement({...currentAchievement, type: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md">{achievementTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div><input type="number" placeholder="Value" value={currentAchievement.value} onChange={e => setCurrentAchievement({...currentAchievement, value: parseInt(e.target.value) || 0})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button></div></form></div>);
    return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">Achievement Manager</h2><button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Upload size={18}/> New</button></div><div className="space-y-4">{achievements.map(ach => (<div key={ach.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4">{ach.iconType === 'emoji' ? <span className="text-4xl">{ach.icon}</span> : <img src={ach.icon} alt={ach.title} className="w-12 h-12"/>}<div><h4 className="font-bold text-lg text-white">{ach.title}</h4><p className="text-sm text-gray-300">{ach.description}</p><p className="text-xs text-yellow-400">Type: {ach.type}, Value: {ach.value}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(ach)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button><button onClick={() => handleDelete(ach.id)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button></div></div>))}</div></div>);
}

const UserManager = ({ users, onUsersChange }) => {
    const [isEditing, setIsEditing] = useState(false); const [currentUser, setCurrentUser] = useState(null); const [confirmingDelete, setConfirmingDelete] = useState(null);
    const handleNew = () => { setCurrentUser({ email: '', password: '', name: '', isAdmin: false, unlockedAchievements: [] }); setIsEditing(true); };
    const handleEdit = (email) => { setCurrentUser({ email, ...users[email] }); setIsEditing(true); };
    const handleDelete = (email) => { setConfirmingDelete(email); };
    const confirmDelete = () => { if(confirmingDelete) { const updatedUsers = {...users}; delete updatedUsers[confirmingDelete]; onUsersChange(updatedUsers); setConfirmingDelete(null); }};
    const handleSave = (e) => { e.preventDefault(); const updatedUsers = {...users, [currentUser.email]: currentUser}; onUsersChange(updatedUsers); setIsEditing(false); setCurrentUser(null); };
    if(isEditing) return (<div className="p-8 max-w-2xl mx-auto"><h3 className="text-2xl font-bold mb-6 text-yellow-400">{currentUser.email ? 'Edit' : 'Create'} User</h3><form onSubmit={handleSave} className="space-y-4"><input type="email" placeholder="Email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="text" placeholder="Name" value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" required /><input type="password" placeholder="New Password" onChange={e => setCurrentUser({...currentUser, password: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><label className="flex items-center gap-2 text-white"><input type="checkbox" checked={currentUser.isAdmin} onChange={e => setCurrentUser({...currentUser, isAdmin: e.target.checked})} /> Is Admin?</label><div className="flex gap-4"><button type="submit" className="flex-1 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-600 rounded-md">Cancel</button></div></form></div>);
    return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-yellow-400">User Manager</h2><button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><UserPlus size={18}/> New User</button></div><div className="space-y-4">{Object.entries(users).map(([email, user]) => (<div key={email} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4"><UserIcon size={24} className={user.isAdmin ? 'text-yellow-400' : ''}/><div><h4 className="font-bold text-lg text-white">{user.name}</h4><p className="text-sm text-gray-300">{email}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(email)} className="p-2 bg-gray-600 rounded-md"><Edit size={16}/></button><button onClick={() => handleDelete(email)} className="p-2 bg-red-800 rounded-md"><Trash2 size={16}/></button></div></div>))}</div>{confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)}><div className="text-center"><h3 className="text-2xl text-white mb-4">Are you sure?</h3><p className="text-gray-300 mb-6">Do you really want to delete user "{confirmingDelete}"?</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmingDelete(null)} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button><button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Delete</button></div></div></Modal>}</div>);
}

const SiteSettingsManager = ({ settings, onSettingsChange }) => {
    const [currentSettings, setCurrentSettings] = useState(settings);
    useEffect(() => { setCurrentSettings(settings) }, [settings]);
    const handleSave = (e) => { e.preventDefault(); onSettingsChange(currentSettings); alert("Settings saved!"); };
    const handleFileChange = (e, key) => { const file = e.target.files[0]; if(file) setCurrentSettings({...currentSettings, [key]: URL.createObjectURL(file)}); };
    return (<div><h2 className="text-3xl font-bold text-yellow-400 mb-6">Site Settings</h2><form onSubmit={handleSave} className="space-y-6 max-w-lg"><div className="space-y-2"><label className="block text-sm font-medium">Site Name</label><input type="text" value={currentSettings.siteName} onChange={e => setCurrentSettings({...currentSettings, siteName: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /></div><div className="space-y-2"><label className="block text-sm font-medium">Correct Keystroke Sound URL</label><input type="text" value={currentSettings.correctSound} onChange={e => setCurrentSettings({...currentSettings, correctSound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><input type="file" onChange={e => handleFileChange(e, 'correctSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div><div className="space-y-2"><label className="block text-sm font-medium">Incorrect Keystroke Sound URL</label><input type="text" value={currentSettings.incorrectSound} onChange={e => setCurrentSettings({...currentSettings, incorrectSound: e.target.value})} className="w-full p-2 bg-gray-700 text-white rounded-md" /><p className="text-center text-xs text-gray-500">OR</p><input type="file" onChange={e => handleFileChange(e, 'incorrectSound')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/></div><button type="submit" className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save Settings</button></form></div>);
};

const UserProfile = ({ user, history, achievements, journal, onJournalChange }) => {
    const userHistory = history[user.email] || [];
    const userJournal = journal[user.email] || [];
    const [editingEntry, setEditingEntry] = useState(null);

    const handleSaveJournal = (entry) => {
        let updatedJournal;
        const existing = userJournal.find(j => j.id === entry.id);
        if (existing) {
            updatedJournal = userJournal.map(j => j.id === entry.id ? entry : j);
        } else {
            updatedJournal = [...userJournal, entry];
        }
        onJournalChange(user.email, updatedJournal);
        setEditingEntry(null);
    };

    const dailyStats = userHistory.reduce((acc, record) => { const date = new Date(record.timestamp).toLocaleDateString(); if (!acc[date]) { acc[date] = { date, records: [] }; } acc[date].records.push(record); return acc; }, {});
    const dailySummaries = Object.values(dailyStats).map(day => { const totalWords = day.records.reduce((sum, r) => sum + r.wordCount, 0); const totalChars = day.records.reduce((sum, r) => sum + r.charCount, 0); const avgWpm = day.records.reduce((sum, r) => sum + r.wpm, 0) / day.records.length; const avgAcc = day.records.reduce((sum, r) => sum + r.accuracy, 0) / day.records.length; return { date: day.date, totalWords, totalChars, avgWpm: avgWpm.toFixed(0), avgAcc: avgAcc.toFixed(0), cardsCompleted: day.records.length }; }).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const getProgress = (achievement) => {
        const now = Date.now(); const day = 24 * 60 * 60 * 1000;
        const historyInTime = (duration) => userHistory.filter(h => now - h.timestamp < duration);
        const totalCardsCompleted = userHistory.length;
        const totalWordsTyped = userHistory.reduce((sum, h) => sum + h.wordCount, 0);
        const totalCharsTyped = userHistory.reduce((sum, h) => sum + h.charCount, 0);
        let current = 0;
        switch(achievement.type) {
            case 'total_cards_completed': current = totalCardsCompleted; break;
            case 'total_words_typed': current = totalWordsTyped; break;
            case 'total_chars_typed': current = totalCharsTyped; break;
            case 'total_cards_day': current = historyInTime(day).length; break;
            case 'total_cards_week': current = historyInTime(7 * day).length; break;
            case 'total_cards_month': current = historyInTime(30 * day).length; break;
            default: return { text: 'Complete a card', percent: 0};
        }
        return { text: `${current} / ${achievement.value}`, percent: (current / achievement.value) * 100 };
    };

    return (<div className="p-8"><h2 className="text-3xl font-bold text-yellow-400 mb-8">Profile: {user.name}</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div><h3 className="text-2xl font-bold mb-4">My Badges</h3><div className="space-y-4"><div><h4 className="font-semibold text-lg mb-2">Unlocked</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{achievements.filter(a => user.unlockedAchievements.includes(a.id)).map(badge => (<div key={badge.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center"><div className="text-5xl h-14 w-14 mx-auto flex items-center justify-center">{badge.iconType === 'emoji' ? badge.icon : <img src={badge.icon} alt={badge.title} className="w-14 h-14 object-cover"/>}</div><h4 className="font-bold mt-2">{badge.title}</h4><p className="text-xs text-gray-500">{badge.description}</p></div>))}{user.unlockedAchievements.length === 0 && <p className="text-gray-500 col-span-full">No badges yet. Keep typing!</p>}</div></div><div><h4 className="font-semibold text-lg mb-2 mt-6">Locked</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{achievements.filter(a => !user.unlockedAchievements.includes(a.id)).map(badge => { const progress = getProgress(badge); return (<div key={badge.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center opacity-50"><div className="text-5xl h-14 w-14 mx-auto flex items-center justify-center">{badge.iconType === 'emoji' ? badge.icon : <img src={badge.icon} alt={badge.title} className="w-14 h-14 object-cover"/>}</div><h4 className="font-bold mt-2">{badge.title}</h4><p className="text-xs text-gray-500">{badge.description}</p><div className="w-full bg-gray-600 rounded-full h-2.5 mt-2"><div className="bg-yellow-400 h-2.5 rounded-full" style={{width: `${progress.percent}%`}}></div></div><p className="text-xs text-yellow-500 mt-1">{progress.text}</p></div>)})}</div></div></div></div><div><h3 className="text-2xl font-bold mb-4">My Typing Progress</h3><div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-gray-500"><th>Date</th><th>Words</th><th>Chars</th><th>Avg WPM</th><th>Avg Acc</th><th>Cards</th></tr></thead><tbody>{dailySummaries.map(day => (<tr key={day.date} className="border-b border-gray-700"><td>{day.date}</td><td>{day.totalWords}</td><td>{day.totalChars}</td><td>{day.avgWpm}</td><td>{day.avgAcc}%</td><td>{day.cardsCompleted}</td></tr>))}</tbody></table></div><h3 className="text-2xl font-bold my-4">My Journal Progress</h3><div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-gray-500"><th>Date</th><th>Entries</th><th>Words</th><th>Chars</th></tr></thead><tbody>{Object.values(userJournal.reduce((acc, entry) => { const date = new Date(entry.timestamp).toLocaleDateString(); if(!acc[date]) acc[date] = { date, entries: 0, words: 0, chars: 0 }; acc[date].entries++; const plainText = entry.content.replace(/<[^>]+>/g, ''); acc[date].words += plainText.trim().split(/\s+/).length; acc[date].chars += plainText.length; return acc; }, {})).sort((a,b) => new Date(b.date) - new Date(a.date)).map(day => (<tr key={day.date} className="border-b border-gray-700"><td>{day.date}</td><td>{day.entries}</td><td>{day.words}</td><td>{day.chars}</td></tr>))}</tbody></table></div></div></div></div>)
}

const JournalEditor = ({ entry, onSave, onClose }) => {
    const editorRef = useRef(null);
    const [content, setContent] = useState(entry.content);
    const handleSave = () => { onSave({...entry, content: editorRef.current.innerHTML}); };
    const handleFormat = (command) => { document.execCommand(command, false, null); editorRef.current.focus(); };

    return (<Modal onClose={onClose}>
        <h3 className="text-xl font-bold mb-4 text-white">Journal Entry</h3>
        <div className="bg-gray-900 rounded-t-lg p-2 flex gap-2">
            <button onClick={() => handleFormat('bold')} className="p-2 hover:bg-gray-700 rounded-md"><Bold size={16}/></button>
            <button onClick={() => handleFormat('italic')} className="p-2 hover:bg-gray-700 rounded-md"><Italic size={16}/></button>
            <button onClick={() => handleFormat('underline')} className="p-2 hover:bg-gray-700 rounded-md"><Underline size={16}/></button>
            <button onClick={() => handleFormat('justifyLeft')} className="p-2 hover:bg-gray-700 rounded-md"><AlignLeft size={16}/></button>
            <button onClick={() => handleFormat('justifyCenter')} className="p-2 hover:bg-gray-700 rounded-md"><AlignCenter size={16}/></button>
            <button onClick={() => handleFormat('justifyRight')} className="p-2 hover:bg-gray-700 rounded-md"><AlignRight size={16}/></button>
        </div>
        <div ref={editorRef} contentEditable={true} dangerouslySetInnerHTML={{ __html: content }} className="w-full h-64 p-2 bg-gray-700 text-white rounded-b-md focus:outline-none" placeholder="Start writing..."></div>
        <div className="flex justify-end gap-4 mt-4">
            <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-md">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md">Save</button>
        </div>
    </Modal>);
};

const JournalPage = ({ user, journal, onJournalChange }) => {
    const userJournal = journal[user.email] || [];
    const [editingEntry, setEditingEntry] = useState(null);

    const handleSaveJournal = (entry) => {
        let updatedJournal;
        const existing = userJournal.find(j => j.id === entry.id);
        if (existing) {
            updatedJournal = userJournal.map(j => j.id === entry.id ? entry : j);
        } else {
            updatedJournal = [...userJournal, entry];
        }
        onJournalChange(user.email, updatedJournal);
        setEditingEntry(null);
    };
    return (<div className="p-8"><div className="flex justify-between items-center mb-4"><h2 className="text-3xl font-bold text-yellow-400">My Journal</h2><button onClick={() => setEditingEntry({id: Date.now(), timestamp: Date.now(), content: ''})} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500"><Edit size={16}/> New Entry</button></div><div className="space-y-4">{userJournal.sort((a,b) => b.timestamp - a.timestamp).map(entry => (<div key={entry.id} onClick={() => setEditingEntry(entry)} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-md cursor-pointer"><p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p><div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }}></div></div>))}</div>{editingEntry && <JournalEditor entry={editingEntry} onSave={handleSaveJournal} onClose={() => setEditingEntry(null)}/>}</div>);
}

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

  useEffect(() => { document.documentElement.classList.toggle('dark', settings.isDarkMode); }, [settings.isDarkMode]);
  useEffect(() => {
    mockApi.getCards().then(res => res.success && setCards(res.data)); 
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
  const handleCardsChange = (updatedCards) => { setCards(updatedCards); mockApi.saveCards(updatedCards); };
  const handleUsersChange = (updatedUsers) => { setAllUsers(updatedUsers); mockApi.saveUsers(updatedUsers); };
  const handleAchievementsChange = (updatedAchievements) => { setAchievements(updatedAchievements); mockApi.saveAchievements(updatedAchievements); };
  const handleSiteSettingsChange = (updatedSettings) => { setSiteSettings(updatedSettings); mockApi.saveSiteSettings(updatedSettings); };
  const handleJournalChange = (email, entries) => { const updatedJournal = {...journalData, [email]: entries}; setJournalData(updatedJournal); mockApi.saveJournal(updatedJournal); checkAndAwardAchievements(null, user, typingHistory, updatedJournal); };
  const handleSelectCategory = (category) => { setSelectedCategory(category); setView('card_select'); };
  const handleSelectCard = (index) => { setCurrentCardIndex(index); setProgress(0); setView('game'); };
  
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
      
      return (<TypingTest card={card} onComplete={handleComplete} onSkip={() => setCurrentCardIndex((currentCardIndex + 1) % categoryCards.length)} onDirectEdit={(c) => {setView('admin');}} settings={settings} siteSettings={siteSettings} onProgress={setProgress} prevBest={prevBest} user={user} />);
  }

  const renderView = () => {
    switch(view) {
      case 'admin': return <AdminPanel cards={cards} onCardsChange={handleCardsChange} users={allUsers} onUsersChange={handleUsersChange} achievements={achievements} onAchievementsChange={handleAchievementsChange} siteSettings={siteSettings} onSiteSettingsChange={handleSiteSettingsChange} />;
      case 'game': return renderGameView();
      case 'profile': return <UserProfile user={user} history={typingHistory} achievements={achievements} journal={journalData} onJournalChange={handleJournalChange} />;
      case 'journal': return <JournalPage user={user} journal={journalData} onJournalChange={handleJournalChange} />;
      case 'card_select': 
        const categoryCards = cards.filter(c => c.category === selectedCategory);
        return (<div className="p-8"><h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Category: {selectedCategory}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{categoryCards.map((card, index) => (<div key={card.id} onClick={() => handleSelectCard(index)} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all transform hover:-translate-y-1"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{card.title}</h3><p className="text-gray-600 dark:text-gray-400 mt-2">{card.textContent.substring(0,120)}...</p></div>))}</div><button onClick={() => setView('category_select')} className="mt-8 mx-auto block text-yellow-400 hover:underline">Back to Categories</button></div>);
      case 'category_select':
        const categories = [...new Set(cards.map(c => c.category || 'Uncategorized'))];
        return (<div className="p-8"><h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Choose a Category</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{categories.map(category => (<div key={category} onClick={() => handleSelectCategory(category)} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all transform hover:-translate-y-1 flex justify-between items-center"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{category}</h3><ChevronsRight className="text-yellow-400"/></div>))}</div></div>);
      default: return <AuthScreen onLogin={handleLogin} />;
    }
  };

  if (!user) return (<div className="dark"><main className="bg-gray-900 text-gray-200 min-h-screen"><AuthScreen onLogin={handleLogin} /></main></div>);

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
