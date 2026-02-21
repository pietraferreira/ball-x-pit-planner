import { 
    sTierItems, charactersDB, ballsDB, passivesDB, 
    characterDuos, metaBuilds, evolutions, passiveEvolutions 
} from './data.js';

const { useState, useEffect, useMemo } = React;

// --- HELPERS ---
const getImg = (name, list) => {
    if (name.startsWith("Fused:")) return null; 
    const n = name.trim().toLowerCase();
    const found = list.find(i => i.name.trim().toLowerCase() === n);
    return found ? found.img : null;
};

// --- COMPONENT: QUICK ADD MODAL ---
const QuickAddModal = ({ onClose, onAdd }) => {
    const [tab, setTab] = useState("base"); // base, passive, evolved

    // Filter Logic
    const baseBallsList = useMemo(() => ballsDB.filter(b => !evolutions.find(e => e.name === b.name)), []);
    const evolvedBallsList = useMemo(() => ballsDB.filter(b => evolutions.find(e => e.name === b.name)), []);
    
    const currentList = tab === 'base' ? baseBallsList : tab === 'passive' ? passivesDB : evolvedBallsList;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col p-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <h2 className="text-xl text-white tracking-widest">QUICK ADD</h2>
                <button onClick={onClose} className="text-2xl text-slate-400 p-2">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setTab('base')} className={`flex-1 py-3 text-lg font-bold rounded border ${tab === 'base' ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>BALLS</button>
                <button onClick={() => setTab('passive')} className={`flex-1 py-3 text-lg font-bold rounded border ${tab === 'passive' ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>PASSIVE</button>
                <button onClick={() => setTab('evolved')} className={`flex-1 py-3 text-lg font-bold rounded border ${tab === 'evolved' ? 'bg-purple-600/30 border-purple-400 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>EVO</button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-4 gap-3 pb-10">
                    {currentList.map(item => (
                        <button 
                            key={item.name}
                            onClick={() => { onAdd(item.name); onClose(); }}
                            className="aspect-square bg-slate-900 border border-slate-700 rounded-lg flex flex-col items-center justify-center p-1 active:scale-95 active:border-white transition-all"
                        >
                            <img src={item.img} className="w-full h-full object-contain pointer-events-none" />
                        </button>
                    ))}
                </div>
            </div>
            <div className="text-center text-xs text-slate-500 mt-2 uppercase tracking-widest">Tap icon to add & close</div>
        </div>
    );
};

// --- COMPONENT: RECOMMENDATION CARD ---
const RecoCard = ({ evo, isReady, isNewDiscovery, missing, onCraft }) => {
    const allItems = [...ballsDB, ...passivesDB];
    const img = getImg(evo.name, allItems);

    let borderClass = "border-slate-700 opacity-60";
    if (isReady && isNewDiscovery) borderClass = "discovery-glow bg-purple-900/20 order-1";
    else if (isReady) borderClass = "status-ready bg-yellow-900/10 order-2"; 
    else if (isNewDiscovery) borderClass = "border-purple-900/50 order-3";

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

// --- COMPONENT: ITEM CARD (Wiki) ---
const ItemCard = ({ item, isFound, isInRun, onToggleFound, onToggleRun }) => {
    return (
        <div 
            className={`game-panel p-2 flex items-center gap-2 transition-all relative group
            ${isInRun ? 'border-l-4 border-l-cyan-400 bg-cyan-900/20' : 'border-slate-800'}
            ${!isFound ? 'opacity-80 grayscale-[0.5]' : ''}`}
        >
            <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={onToggleRun}>
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
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleFound(); }}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors
                ${isFound ? 'border-emerald-600 bg-emerald-900/30 text-emerald-400' : 'border-slate-700 text-slate-600 hover:border-slate-500'}`}
            >
                {isFound ? '📖' : '🔒'}
            </button>
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState("builder");
    const [metaSubTab, setMetaSubTab] = useState("duos");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedChars, setSelectedChars] = useState([]);
    const [fusionSelection, setFusionSelection] = useState([]); 
    const [showQuickAdd, setShowQuickAdd] = useState(false); // NEW STATE

    // --- STATE MANAGEMENT ---
    const [foundIds, setFoundIds] = useState(() => {
        const saved = localStorage.getItem('ballpit_found');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeRun, setActiveRun] = useState(() => {
        const saved = localStorage.getItem('ballpit_run');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('ballpit_found', JSON.stringify(foundIds)); }, [foundIds]);
    useEffect(() => { localStorage.setItem('ballpit_run', JSON.stringify(activeRun)); }, [activeRun]);

    // --- SMART ACTIONS ---

    const toggleFound = (name) => {
        setFoundIds(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

    const addToRun = (name) => {
        if (!foundIds.includes(name)) toggleFound(name);
        setActiveRun(prev => [...prev, name]);
    };

    const removeFromRun = (index) => {
        setActiveRun(prev => prev.filter((_, i) => i !== index));
        if (fusionSelection.includes(index)) {
            setFusionSelection(prev => prev.filter(i => i !== index));
        }
    };

    const craftEvolution = (evo) => {
        let newRun = [...activeRun];
        let ingredientsNeeded = [...evo.ingredients];
        let indicesToRemove = [];
        let canCraft = true;

        ingredientsNeeded.forEach(ing => {
            let index = newRun.findIndex((item, idx) => 
                !indicesToRemove.includes(idx) && (
                    item === ing || (ing.includes("Laser") && item.includes("Laser"))
                )
            );
            if (index !== -1) indicesToRemove.push(index);
            else canCraft = false;
        });

        if (canCraft) {
            newRun = newRun.filter((_, idx) => !indicesToRemove.includes(idx));
            newRun.push(evo.name);
            if (!foundIds.includes(evo.name)) toggleFound(evo.name);
            setActiveRun(newRun);
            setFusionSelection([]); 
        } else {
            alert("Missing ingredients!");
        }
    };

    const toggleFusionSelect = (index) => {
        if (fusionSelection.includes(index)) {
            setFusionSelection(prev => prev.filter(i => i !== index));
        } else {
            if (fusionSelection.length < 2) setFusionSelection(prev => [...prev, index]);
        }
    };

    const fuseItems = () => {
        if (fusionSelection.length !== 2) return;
        const item1 = activeRun[fusionSelection[0]];
        const item2 = activeRun[fusionSelection[1]];
        const fusedName = `Fused: ${item1} x ${item2}`;
        let newRun = activeRun.filter((_, idx) => !fusionSelection.includes(idx));
        newRun.push(fusedName);
        setActiveRun(newRun);
        setFusionSelection([]);
    };

    const resetRun = () => {
        setActiveRun([]);
        setFusionSelection([]);
    };

    const toggleChar = (char) => {
        let newChars = [...selectedChars];
        if (newChars.find(c => c.name === char.name)) {
            newChars = newChars.filter(c => c.name !== char.name);
        } else {
            if (newChars.length < 2) newChars.push(char);
            else newChars = [newChars[1], char];
        }
        setSelectedChars(newChars);
        if (char.ball) setActiveRun(prev => [...prev, char.ball]);
    };

    const applyMetaBuild = (build) => {
        const items = [...build.core, ...build.support];
        setActiveRun(items); 
        setActiveTab('builder');
    };

    // --- LOGIC ---

    const recommendations = useMemo(() => {
        const allEvolutions = [...evolutions, ...passiveEvolutions];
        const results = [];

        allEvolutions.forEach(evo => {
            let availableRun = [...activeRun]; 
            let foundCount = 0;

            evo.ingredients.forEach(ing => {
                const idx = availableRun.findIndex(item => 
                    item === ing || (ing.includes("Laser") && item.includes("Laser"))
                );
                if (idx !== -1) {
                    foundCount++;
                    availableRun.splice(idx, 1);
                }
            });

            let status = "none";
            let missing = [];

            if (foundCount >= evo.ingredients.length) {
                status = "ready";
            } else if (foundCount >= 1) {
                status = "potential";
                missing = evo.ingredients.filter(ing => !activeRun.includes(ing)); 
            }

            const isNewDiscovery = !foundIds.includes(evo.name);

            if (status !== "none") {
                results.push({ ...evo, status, missing, isNewDiscovery });
            }
        });

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
            
            {/* QUICK ADD MODAL */}
            {showQuickAdd && (
                <QuickAddModal onClose={() => setShowQuickAdd(false)} onAdd={addToRun} />
            )}

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

                {/* --- WIKI TAB --- */}
                {activeTab === 'wiki' && (
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Search Database..." 
                            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded font-mono focus:border-cyan-400 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        
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
                                            onToggleRun={() => addToRun(item.name)}
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
                                            onToggleRun={() => addToRun(item.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- BUILDER TAB --- */}
                {activeTab === 'builder' && (
                    <div className="space-y-4">
                        
                        {/* Run Inventory Panel */}
                        <div className="game-panel p-2">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs text-cyan-400 uppercase">INVENTORY ({activeRun.length})</h3>
                                {fusionSelection.length === 2 ? (
                                    <button onClick={fuseItems} className="text-[10px] bg-purple-600 text-white font-bold px-3 py-1 rounded animate-pulse">
                                        ⚡ FUSE SELECTED ⚡
                                    </button>
                                ) : (
                                    <button onClick={resetRun} className="text-[10px] text-red-400 border border-red-900 px-2 py-0.5 rounded hover:bg-red-900/20">RESET</button>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {activeRun.length === 0 && <span className="text-slate-600 text-sm italic p-2">Use Quick Add (+)</span>}
                                {activeRun.map((item, idx) => {
                                    const isSelected = fusionSelection.includes(idx);
                                    return (
                                        <button 
                                            key={`${item}-${idx}`} 
                                            onClick={() => toggleFusionSelect(idx)}
                                            className={`
                                                relative px-2 py-1 text-xs border rounded transition-all
                                                ${isSelected 
                                                    ? 'bg-purple-900/50 border-purple-400 text-purple-200 ring-1 ring-purple-400' 
                                                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'}
                                            `}
                                        >
                                            {item}
                                            <span 
                                                onClick={(e) => { e.stopPropagation(); removeFromRun(idx); }}
                                                className="ml-2 text-slate-500 hover:text-red-400 font-bold"
                                            >×</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recommendation List */}
                        {recommendations.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded">
                                <p className="text-slate-500 mb-2">Ready to draft?</p>
                                <button onClick={() => setShowQuickAdd(true)} className="text-cyan-400 underline">Add Items</button>
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
                                        onCraft={() => craftEvolution(evo)}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* FLOATING ACTION BUTTON (Speed Draft) */}
                        <button 
                            onClick={() => setShowQuickAdd(true)}
                            className="fixed bottom-6 right-6 w-16 h-16 bg-cyan-500 text-black rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center text-4xl font-bold active:scale-95 transition-transform z-50 border-4 border-black"
                        >
                            +
                        </button>
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
                                                    <img key={c} src={charactersDB.find(x=>x.name===c)?.img} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-black object-cover" />
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
                                    <div key={idx} onClick={() => applyMetaBuild(build)} className="game-panel p-3 cursor-pointer hover:bg-slate-800 group">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg text-emerald-400 group-hover:glow-text-cyan transition-all">{build.name}</h3>
                                            <span className="text-[10px] bg-slate-700 px-1 rounded uppercase">{build.tag}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{build.desc}</p>
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
