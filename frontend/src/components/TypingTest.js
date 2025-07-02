import React, { useState, useEffect, useRef } from 'react';

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

const PuzzleReveal = ({ imageSrc, progress, textLength }) => {
    const getGridSize = (len) => { if (len < 150) return 3; if (len < 300) return 4; return 5; };
    const gridSize = getGridSize(textLength);
    const numTiles = gridSize * gridSize;
    const [shuffledIndices, setShuffledIndices] = useState([]);
    const [tileTransforms, setTileTransforms] = useState([]);

    useEffect(() => {
        setShuffledIndices(Array.from(Array(numTiles).keys()).sort(() => Math.random() - 0.5));
        const transforms = Array.from({ length: numTiles }).map(() => {
            const side = Math.floor(Math.random() * 4);
            switch (side) {
                case 0: return 'translateX(-100%)';
                case 1: return 'translateX(100%)';
                case 2: return 'translateY(-100%)';
                default: return 'translateY(100%)';
            }
        });
        setTileTransforms(transforms);
    }, [imageSrc, numTiles]);

    const tilesToReveal = Math.floor((progress / 100) * numTiles);

        return (
        <div className="grid gap-0 mx-auto rounded-lg overflow-hidden shadow-2xl" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: 'clamp(300px, 90vw, 600px)', aspectRatio: '4 / 3' }}>
            {Array.from({ length: numTiles }).map((_, i) => {
                const isRevealed = shuffledIndices.slice(0, tilesToReveal).includes(i);
                return (
                    <div
                        key={i}
                        className="w-full h-full bg-gray-200 dark:bg-gray-700 transition-all duration-700 ease-in-out bg-cover bg-center" // FIX: Added bg-cover and bg-center
                        style={{
                            backgroundImage: `url(${imageSrc})`,
                            backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                            backgroundPosition: `${(i % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(i / gridSize) * (100 / (gridSize - 1))}%`,
                            opacity: isRevealed ? 1 : 0,
                            transform: isRevealed ? 'translate(0, 0)' : tileTransforms[i]
                        }}
                    ></div>
                );
            })}
        </div>
    );
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

export default function TypingTest({ card, onComplete, onSkip, onDirectEdit, settings, siteSettings, prevBest, user }) {
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const incorrectLetters = useRef([]);
  const audioCorrectRef = useRef(null);
  const audioIncorrectRef = useRef(null);
  const inputRef = useRef(null);
  const textToType = card.text_content || '';
  const wordCount = textToType.split(' ').length;
  const [lastTypedKey, setLastTypedKey] = useState('');
  const [isMistake, setIsMistake] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { 
      // DEBUG: This log will show us every time the component resets for a new card.
      console.log("TypingTest.js is re-rendering for a new card:", card.title);

      setInputValue(''); setStartTime(null); setWpm(0); setIsFinished(false); setFinalStats(null); incorrectLetters.current = []; setProgress(0); 
      const timer = setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
  }, [card.id]);

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

  const nextChar = isFinished ? '??' : textToType[inputValue.length] || '';
  
  const words = textToType.split(' ');
  const typedWords = inputValue.split(' ');
  const currentWordIndex = typedWords.length - 1;
  const mediaReveal = card.image || card.video;

  return (<div className="w-full max-w-4xl mx-auto p-4 md:p-8" onClick={() => inputRef.current && inputRef.current.focus()}><audio ref={audioCorrectRef} src={siteSettings.correct_sound} preload="auto"></audio><audio ref={audioIncorrectRef} src={siteSettings.incorrect_sound} preload="auto"></audio>
      {mediaReveal && (
          <div className="p-4 md:p-8 flex justify-center items-center cursor-pointer" onClick={onSkip}>
              <div className="transition-opacity duration-500" style={{opacity: progress / 100}}>
                  {card.reveal_type === 'puzzle' && card.image && <PuzzleReveal imageSrc={card.image} progress={progress} textLength={card.text_content.length} />}
                  
                  {/* FIX: Add 'object-cover' to prevent stretching */}
                  {(card.reveal_type === 'image' || (card.reveal_type !== 'puzzle' && card.image)) && <img src={card.image} alt={card.title} className="max-w-full max-h-[450px] rounded-lg shadow-2xl object-cover"/>}
                  {card.video && <video src={card.video} autoPlay muted loop className="max-w-full max-h-[450px] rounded-lg shadow-2xl object-cover"></video>}
              </div>
          </div>
      )}
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
    <div className="flex justify-between items-center mt-6 min-h-[40px]"><div className="flex gap-4 md:gap-8 text-xl md:text-2xl"><div><span className="text-gray-500">WPM:</span> <span className="font-bold text-gray-800 dark:text-white">{finalStats ? finalStats.wpm : wpm}</span></div></div>
    {!isFinished && <div className="flex gap-2">{user.isAdmin && <button onClick={() => onDirectEdit(card)} className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition-colors">Edit Card</button>}<button onClick={onSkip} className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">Skip Card</button></div>}</div>
    {isFinished && (<div><CompletionFeedback stats={finalStats} prevBest={prevBest} user={user} wordCount={wordCount} /><div className="text-center mt-4"><button onClick={onSkip} className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500 transition-colors">Next Card</button></div></div>)}
    </div>);
};