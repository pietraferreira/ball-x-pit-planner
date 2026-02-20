import { 
    sTierItems, charactersDB, ballsDB, passivesDB, 
    characterDuos, metaBuilds, evolutions, passiveEvolutions 
} from './data.js';

const { useState, useEffect, useMemo } = React;

// --- HELPERS ---
const getImg = (name, list) => {
    const n = name.trim().toLowerCase();
    const found = list.find(i => i.name.trim().toLowerCase() === n);
    return found ? found.img : null;
};

// --- COMPONENT: ITEM CARD (Dual State) ---
const ItemCard = ({ item, isFound, isInRun, onToggleFound, onToggleRun }) => {
    return (
        <div 
            className={`game-panel p-2 flex items-center gap-2 transition-all relative group
            ${isInRun ? 'border-l-4 border-l-cyan-400 bg-cyan-900/20' : 'border-slate-800'}
            ${!isFound ? 'opacity-80 grayscale-[0.5]' : ''}`}
        >
            {/* Click Main Body to Add to Run */}
            <div 
                className="flex-1 flex items-center gap-3 cursor-pointer"
                onClick={onToggleRun}
            >
                <div className="w-10 h-10 border border-slate-600 bg-black flex items-center justify-center overflow-hidden shrink-0 relative">
                    {item.img ? <img src={item.img} className="w-full h-full object-contain" /> : <div className="text-xs">{item.name[0]}</div>}
                    {!isFound && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] text-slate-400">???</div>}
                </div>
                <div className="leading-none min-w-0">
                    <div className={`text-lg truncate ${isInRun ? 'text-cyan-400' : isFound ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.name}
                    </div>
                    {isInRun && <div className="text-[10px] text-cyan-500 font-bold tracking-widest">ACTIVE RUN</div>}
                </div>
            </div>

            {/* Encyclopedia Toggle (Right Side) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleFound(); }}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors
                ${isFound ? 'border-emerald-600 bg-emerald-900/30 text-emerald-400' : 'border-slate-700 text-slate-600 hover:border-slate-500'}`}
                title="Toggle 'Found in Encyclopedia'"
            >
                {isFound ? '📖' : '🔒'}
            </button>
        </div>
    );
};

// --- COMPONENT: RECOMMENDATION CARD ---
const RecoCard = ({ evo, isReady, isNewDiscovery, missing, onCraft }) => {
    const allItems = [...ballsDB, ...passivesDB];
    const img = getImg(evo.name, allItems);

    let borderClass = "border-slate-700 opacity-60";
    if (isReady && isNewDiscovery) borderClass = "discovery-glow bg-purple-900/20 order-1"; // Top Priority
    else if (isReady) borderClass = "status-ready bg-yellow-900/10 order-2"; 
    else if (isNewDiscovery) borderClass = "border-purple-900/50 order-3"; // Potential Discovery

    return (
        <div className={`game-panel p-3 flex gap-3 relative transition-all ${borderClass}`}>
            <div className="w-14 h-14 bg-black border border-slate-600 shrink-0 relative">
                {img ? <img src={img} className="w-full h-full object-contain" /> : <div className="text-xl">?</div>}
                {isNewDiscovery && <div className="absolute -top-2 -left-2 text-xl animate-bounce">✨</div>}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className={`text-lg leading-none ${isNewDiscovery ? 'text-neon-purple glow-text-purple' : 'text-slate-300'}`}>
                        {evo.name}
                    </h4>
                    {isReady && <span className={`text-[10px] font-bold px-1 rounded ${isNewDiscovery ? 'bg-purple-600 text-white' : 'bg-yellow-600 text-black'}`}>
                        {isNewDiscovery ? "DISCOVER NOW!" : "CRAFT"}
                    </span>}
                </div>
                
                <div className="text-xs text-slate-500 font-mono my-1 truncate">{evo.logic}</div>
                
                {missing && missing.length > 0 && (
                    <div className="text-xs text-red-400 bg-red-900/10 px-1 rounded inline-block mb-1">
                        Find: <span className="text-slate-300">{missing.join(" or ")}</span>
                    </div>
                )}
            </div>

            {isReady && (
                <button 
                    onClick={onCraft}
                    className="absolute bottom-2 right-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-emerald-500"
                >
                    CRAFT
                </button>
            )}
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState("builder");
    const [metaSubTab, setMetaSubTab] = useState("duos");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedChars, setSelectedChars] = useState([]);

    // --- STATE MANAGEMENT ---
    
    // 1. Encyclopedia (Permanent)
    const [foundIds, setFoundIds] = useState(() => {
        const saved = localStorage.getItem('ballpit_found');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. Active Run (Temporary/Session)
    const [activeRun, setActiveRun] = useState(() => {
        const saved = localStorage.getItem('ballpit_run');
        return saved ? JSON.parse(saved) : [];
    });

    // Save Effects
    useEffect(() => { localStorage.setItem('ballpit_found', JSON.stringify(foundIds)); }, [foundIds]);
    useEffect(() => { localStorage.setItem('ballpit_run', JSON.stringify(activeRun)); }, [activeRun]);

    // --- ACTIONS ---

    const toggleFound = (name) => {
        setFoundIds(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

    const toggleRun = (name) => {
        // If adding to run, ensure it's also marked as "Found" in Encyclopedia
        if (!activeRun.includes(name) && !foundIds.includes(name)) {
            toggleFound(name);
        }
        setActiveRun(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

    const resetRun = () => setActiveRun([]);

    const toggleChar = (char) => {
        let newChars = [...selectedChars];
        if (newChars.find(c => c.name === char.name)) {
            newChars = newChars.filter(c => c.name !== char.name);
        } else {
            if (newChars.length < 2) newChars.push(char);
            else newChars = [newChars[1], char];
        }
        setSelectedChars(newChars);
        
        // Auto-add starting balls to Active Run
        const startBalls = newChars.map(c => c.ball).filter(Boolean);
        setActiveRun(prev => {
            const combined = new Set([...prev, ...startBalls]);
            return Array.from(combined);
        });
    };

    // --- SMART LOGIC ---

    const recommendations = useMemo(() => {
        const allEvolutions = [...evolutions, ...passiveEvolutions];
        const results = [];

        allEvolutions.forEach(evo => {
            // Skip if we already have this item in our CURRENT run
            if (activeRun.includes(evo.name)) return;

            const ownedIngredients = evo.ingredients.filter(ing => 
                activeRun.some(invItem => 
                    invItem.toLowerCase() === ing.toLowerCase() || 
                    (ing.includes("Laser") && invItem.includes("Laser"))
                )
            );

            let status = "none";
            let missing = [];

            if (ownedIngredients.length >= 2) {
                status = "ready";
            } else if (ownedIngredients.length >= 1) {
                status = "potential";
                missing = evo.ingredients.filter(i => !ownedIngredients.includes(i));
            }

            // Is this a new discovery for the Encyclopedia?
            const isNewDiscovery = !foundIds.includes(evo.name);

            if (status !== "none") {
                results.push({ ...evo, status, missing, isNewDiscovery });
            }
        });

        // SORTING HIERARCHY:
        // 1. Ready to Craft & NEW (Discovery)
        // 2. Ready to Craft (Already Known)
        // 3. Potential & NEW
        // 4. Potential (Already Known)
        return results.sort((a, b) => {
            if (a.status === 'ready' && b.status !== 'ready') return -1;
            if (b.status === 'ready' && a.status !== 'ready') return 1;
            if (a.isNewDiscovery && !b.isNewDiscovery) return -1;
            if (b.isNewDiscovery && !a.isNewDiscovery) return 1;
            return 0;
        });
    }, [activeRun, foundIds]);

    const filteredBalls = ballsDB.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPassives = passivesDB.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // --- RENDER ---

    return (
        <div className="max-w-xl mx-auto min-h-screen pb-24 relative z-10">
            
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/95 border-b-2 border-slate-800 px-3 py-2 shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        BALL<span className="text-white">x</span>PIT
                    </h1>
                    <div className="flex gap-1 cursor-pointer" onClick={() => setActiveTab('chars')}>
                        {selectedChars.map(c => (
                            <div key={c.name} className="w-8 h-8 rounded border border-cyan-500 overflow-hidden">
                                <img src={c.img} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {selectedChars.length === 0 && <span className="text-xs text-slate-500 border border-slate-800 px-2 rounded">PICK CHAR</span>}
                    </div>
                </div>

                <div className="flex gap-2">
                    {['builder', 'wiki', 'chars', 'meta'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1 text-lg uppercase tracking-widest border-b-2 transition-colors ${
                                activeTab === tab 
                                ? 'border-cyan-400 text-cyan-400 glow-text-cyan bg-cyan-900/10' 
                                : 'border-transparent text-slate-600 hover:text-slate-400'
                            }`}
                        >
                            {tab === 'builder' ? (recommendations.some(r => r.isNewDiscovery && r.status==='ready') ? '✨ BUILD' : 'BUILD') : tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3">
                
                {/* --- CHARACTERS TAB --- */}
                {activeTab === 'chars' && (
                    <div className="grid gap-2">
                        {charactersDB.map(char => (
                            <div 
                                key={char.name}
                                onClick={() => toggleChar(char)}
                                className={`game-panel p-2 flex gap-3 cursor-pointer transition-all ${selectedChars.find(c => c.name === char.name) ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-800'}`}
                            >
                                <div className="w-14 h-14 bg-black border border-slate-700 shrink-0">
                                    <img src={char.img} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="text-xl leading-none text-slate-200">{char.name}</h3>
                                    <div className="text-xs text-purple-400">Starts: {char.ball}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- WIKI TAB (Dual State Manager) --- */}
                {activeTab === 'wiki' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Search Database..." 
                                className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded font-mono focus:border-cyan-400 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                            TAP CARD = ADD TO RUN &nbsp;|&nbsp; 📖 = MARK DISCOVERED
                        </div>

                        {filteredBalls.length > 0 && (
                            <div>
                                <h2 className="text-purple-400 text-sm uppercase tracking-widest mb-2 border-b border-purple-900/50">Balls</h2>
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredBalls.map(item => (
                                        <ItemCard 
                                            key={item.name} item={item} 
                                            isFound={foundIds.includes(item.name)}
                                            isInRun={activeRun.includes(item.name)}
                                            onToggleFound={() => toggleFound(item.name)}
                                            onToggleRun={() => toggleRun(item.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {filteredPassives.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-emerald-400 text-sm uppercase tracking-widest mb-2 border-b border-emerald-900/50">Passives</h2>
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredPassives.map(item => (
                                        <ItemCard 
                                            key={item.name} item={item} 
                                            isFound={foundIds.includes(item.name)}
                                            isInRun={activeRun.includes(item.name)}
                                            onToggleFound={() => toggleFound(item.name)}
                                            onToggleRun={() => toggleRun(item.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- BUILDER TAB (Discovery Engine) --- */}
                {activeTab === 'builder' && (
                    <div className="space-y-4">
                        {/* Run Inventory */}
                        <div className="game-panel p-2">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs text-cyan-400 uppercase">Active Run ({activeRun.length})</h3>
                                <button onClick={resetRun} className="text-[10px] text-red-400 border border-red-900 px-2 py-0.5 rounded hover:bg-red-900/20">RESET</button>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {activeRun.length === 0 && <span className="text-slate-600 text-sm italic p-2">Select items in Wiki...</span>}
                                {activeRun.map(i => (
                                    <button key={i} onClick={() => toggleRun(i)} className="bg-slate-800 text-slate-300 px-2 py-1 text-xs border border-slate-600 rounded hover:border-red-500">
                                        {i}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Smart Recommendations */}
                        <div className="flex items-center gap-2 my-4">
                            <div className="h-px bg-slate-800 flex-1"></div>
                            <h3 className="text-neon-gold uppercase tracking-widest text-center glow-text-gold">Fusion Lab</h3>
                            <div className="h-px bg-slate-800 flex-1"></div>
                        </div>
                        
                        {recommendations.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded">
                                <p className="text-slate-500 mb-2">No possible fusions found.</p>
                                <button onClick={() => setActiveTab('wiki')} className="text-cyan-400 underline">Add more items</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 pb-20">
                                {recommendations.map(evo => (
                                    <RecoCard 
                                        key={evo.name} 
                                        evo={evo} 
                                        isReady={evo.status === 'ready'}
                                        isNewDiscovery={evo.isNewDiscovery}
                                        missing={evo.missing}
                                        onCraft={() => toggleRun(evo.name)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- META TAB --- */}
                {activeTab === 'meta' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-4 bg-slate-900 p-1 rounded">
                            <button onClick={()=>setMetaSubTab('duos')} className={`flex-1 py-1 rounded text-sm ${metaSubTab==='duos' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>🛡️ DUOS</button>
                            <button onClick={()=>setMetaSubTab('builds')} className={`flex-1 py-1 rounded text-sm ${metaSubTab==='builds' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>⚔️ BUILDS</button>
                        </div>

                        {metaSubTab === 'duos' && (
                            <div className="grid gap-3">
                                {characterDuos.map((duo, idx) => (
                                    <div key={idx} onClick={() => {
                                        let chars = duo.chars.map(n => charactersDB.find(c=>c.name===n)).filter(Boolean);
                                        setSelectedChars(chars);
                                        setActiveTab('builder');
                                    }} className="game-panel p-3 cursor-pointer hover:bg-slate-800">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="text-lg text-purple-400">{duo.name}</h3>
                                            <span className="text-[10px] bg-slate-700 px-1 rounded h-fit text-slate-300">{duo.tag}</span>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <div className="flex -space-x-2">
                                                {duo.chars.map(c => (
                                                    <img key={c} src={charactersDB.find(x=>x.name===c).img} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-black" />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 italic leading-tight">{duo.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {metaSubTab === 'builds' && (
                            <div className="grid gap-3">
                                {metaBuilds.map((build, idx) => (
                                    <div key={idx} className="game-panel p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg text-emerald-400">{build.name}</h3>
                                            <button onClick={() => {
                                                const items = [...build.core, ...build.support];
                                                // Keep char balls, add these
                                                const currentCharBalls = selectedChars.map(c=>c.ball).filter(Boolean);
                                                const newRun = Array.from(new Set([...currentCharBalls, ...items]));
                                                setActiveRun(newRun);
                                                setActiveTab('builder');
                                            }} className="text-[10px] bg-emerald-800 px-2 py-1 rounded hover:bg-emerald-600">LOAD</button>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3">{build.desc}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {build.core.map(i => <span key={i} className="text-[10px] bg-emerald-900/40 text-emerald-300 px-1 rounded border border-emerald-800">{i}</span>)}
                                            {build.support.map(i => <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded border border-slate-700">{i}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
