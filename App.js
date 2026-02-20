import { 
    sTierItems, charactersDB, ballsDB, passivesDB, 
    characterDuos, metaBuilds, evolutions, passiveEvolutions 
} from './data.js';

const { useState, useEffect, useMemo } = React;

// Helper to get image
const getImg = (name, list) => {
    const n = name.trim().toLowerCase();
    const found = list.find(i => i.name.trim().toLowerCase() === n);
    return found ? found.img : null;
};

// --- COMPONENTS ---

const ItemCard = ({ item, isOwned, onClick }) => {
    const isSTier = sTierItems.includes(item.name);
    return (
        <div onClick={onClick} className={`game-panel p-2 flex items-center gap-3 cursor-pointer transition-all ${isOwned ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-800 opacity-90'}`}>
            <div className="w-10 h-10 border border-slate-600 bg-black flex items-center justify-center overflow-hidden shrink-0 relative">
                {item.img ? <img src={item.img} className="w-full h-full object-contain" /> : <div className="text-xs">{item.name[0]}</div>}
                {isSTier && <div className="absolute top-0 right-0 bg-red-600 text-[8px] text-white px-1 font-bold">S</div>}
            </div>
            <div className="leading-none min-w-0">
                <div className={`text-lg truncate ${isOwned ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.name} {isSTier && <span className="text-red-500 text-xs">🔥</span>}
                </div>
                {isOwned && <div className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest">OWNED</div>}
            </div>
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState("builder");
    const [metaSubTab, setMetaSubTab] = useState("duos");
    const [selectedChars, setSelectedChars] = useState([]); 
    const [inventory, setInventory] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [foundIds, setFoundIds] = useState(() => {
        const saved = localStorage.getItem('ballpit_found');
        return saved ? JSON.parse(saved) : [];
    });

    // Save Progress
    useEffect(() => {
        localStorage.setItem('ballpit_found', JSON.stringify(foundIds));
    }, [foundIds]);

    // Character Selection Logic
    useEffect(() => {
        let startBalls = selectedChars.map(c => c.ball).filter(Boolean);
        setInventory(prev => {
            const newInv = [...prev];
            startBalls.forEach(b => { if(!newInv.includes(b)) newInv.push(b); });
            return newInv;
        });
    }, [selectedChars]);

    const toggleInventory = (name) => {
        setInventory(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

    const toggleChar = (char) => {
        if (selectedChars.find(c => c.name === char.name)) {
            setSelectedChars(prev => prev.filter(c => c.name !== char.name));
        } else {
            if (selectedChars.length < 2) setSelectedChars(prev => [...prev, char]);
            else setSelectedChars(prev => [prev[1], char]);
        }
    };

    const applyMetaBuild = (build) => {
        const charBalls = selectedChars.map(c => c.ball).filter(Boolean);
        const allItems = [...build.core, ...build.support];
        const newInv = [...new Set([...charBalls, ...allItems])];
        setInventory(newInv);
        setActiveTab('builder');
    };

    const applyDuo = (duo) => {
        const charObjs = duo.chars.map(name => charactersDB.find(c => c.name === name)).filter(Boolean);
        setSelectedChars(charObjs);
        setActiveTab('builder');
    }

    // Recommendation Logic
    const recommendations = useMemo(() => {
        const allEvolutions = [...evolutions, ...passiveEvolutions];
        const results = [];

        allEvolutions.forEach(evo => {
            if (inventory.includes(evo.name)) return; 

            const ownedIngredients = evo.ingredients.filter(ing => 
                inventory.some(invItem => 
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

            if (status !== "none") {
                results.push({ ...evo, status, missing, ownedCount: ownedIngredients.length });
            }
        });

        return results.sort((a, b) => {
            if (a.status === 'ready' && b.status !== 'ready') return -1;
            if (a.status !== 'ready' && b.status === 'ready') return 1;
            return 0;
        });
    }, [inventory]);

    const filteredBalls = ballsDB.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPassives = passivesDB.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="max-w-xl mx-auto min-h-screen pb-20 relative z-10">
            
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/95 border-b-2 border-slate-800 px-3 py-2 shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        BALL<span className="text-white">x</span>PIT
                    </h1>
                    <div className="flex gap-1" onClick={() => setActiveTab('chars')}>
                        {selectedChars.map(c => (
                            <div key={c.name} className="w-8 h-8 rounded border border-cyan-500 overflow-hidden">
                                <img src={c.img} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {selectedChars.length === 0 && <div className="text-xs text-slate-600 self-center border border-slate-800 px-1 rounded cursor-pointer">SELECT CHAR</div>}
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
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3">
                
                {/* --- CHARACTERS TAB --- */}
                {activeTab === 'chars' && (
                    <div className="space-y-3">
                        <div className="text-center text-sm text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                            Select up to 2 characters to fuse their starting balls.
                        </div>
                        <div className="grid gap-2">
                            {charactersDB.map(char => {
                                const isSelected = selectedChars.find(c => c.name === char.name);
                                return (
                                    <div 
                                        key={char.name}
                                        onClick={() => toggleChar(char)}
                                        className={`game-panel p-2 flex gap-3 cursor-pointer transition-all ${isSelected ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-800'}`}
                                    >
                                        <div className="w-14 h-14 bg-black border border-slate-700 shrink-0">
                                            <img src={char.img} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className={`text-xl leading-none ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>{char.name}</h3>
                                            <div className="text-xs text-purple-400 mb-1 font-bold">Starts with: {char.ball}</div>
                                            <p className="text-xs text-slate-500 leading-tight">{char.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* --- WIKI TAB --- */}
                {activeTab === 'wiki' && (
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Search items..." 
                            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded font-mono focus:border-cyan-400 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        
                        {filteredBalls.length > 0 && (
                            <div>
                                <h2 className="text-purple-400 text-sm uppercase tracking-widest mb-2 border-b border-purple-900/50">Balls & Evolutions</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredBalls.map(item => (
                                        <ItemCard 
                                            key={item.name} 
                                            item={item} 
                                            isOwned={inventory.includes(item.name)} 
                                            onClick={() => toggleInventory(item.name)} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {filteredPassives.length > 0 && (
                            <div>
                                <h2 className="text-emerald-400 text-sm uppercase tracking-widest mb-2 border-b border-emerald-900/50">Passives</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredPassives.map(item => (
                                        <ItemCard key={item.name} item={item} isOwned={inventory.includes(item.name)} onClick={() => toggleInventory(item.name)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- BUILDER TAB --- */}
                {activeTab === 'builder' && (
                    <div className="space-y-4">
                        <div className="game-panel p-2 relative">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs text-slate-500 uppercase">Run Inventory ({inventory.length})</h3>
                                <button onClick={() => setInventory([])} className="text-[10px] text-red-400 border border-red-900 bg-red-900/20 px-2 py-0.5 rounded hover:bg-red-900/40">RESET RUN</button>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {inventory.length === 0 && <span className="text-slate-700 text-sm italic py-2">Add items from Wiki or Meta tabs...</span>}
                                {inventory.map(i => (
                                    <button key={i} onClick={() => toggleInventory(i)} className="bg-slate-800 text-slate-300 px-2 py-1 text-xs border border-slate-600 rounded flex items-center gap-1 hover:border-red-500">
                                        {i} <span className="text-slate-500">x</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 my-4">
                            <div className="h-px bg-slate-800 flex-1"></div>
                            <h3 className="text-neon-gold uppercase tracking-widest text-center glow-text-gold">Next Steps</h3>
                            <div className="h-px bg-slate-800 flex-1"></div>
                        </div>
                        
                        {recommendations.length === 0 ? (
                            <div className="text-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded">
                                No synergies found.<br/>Check the Wiki or Meta tab!
                            </div>
                        ) : (
                            <div className="grid gap-3 pb-10">
                                {recommendations.map(evo => {
                                    const isReady = evo.status === 'ready';
                                    const isSTier = sTierItems.includes(evo.name);
                                    const img = getImg(evo.name, [...ballsDB, ...passivesDB]);
                                    
                                    return (
                                        <div key={evo.name} className={`game-panel p-3 flex gap-3 relative transition-all ${isReady ? 'reco-pulse bg-yellow-900/10 order-first' : 'border-slate-800 opacity-75'}`}>
                                            <div className="w-14 h-14 bg-black border border-slate-600 shrink-0 relative">
                                                {img ? <img src={img} className="w-full h-full object-contain" /> : <div className="flex h-full items-center justify-center text-xl">?</div>}
                                                {isSTier && <div className="absolute top-0 right-0 bg-red-600 text-[8px] text-white px-1 font-bold">S</div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-lg leading-none ${isReady ? 'text-neon-gold glow-text-gold' : 'text-slate-300'}`}>
                                                        {evo.name} {isSTier && <span className="text-red-500 text-xs">🔥</span>}
                                                    </h4>
                                                    {isReady && <span className="text-[10px] bg-yellow-600 text-black font-bold px-1 rounded animate-pulse">CRAFT NOW</span>}
                                                </div>
                                                <div className="text-xs text-cyan-600 font-mono my-1 truncate">{evo.logic}</div>
                                                
                                                {evo.missing && evo.missing.length > 0 && (
                                                    <div className="text-xs text-red-400 bg-red-900/10 px-1 rounded inline-block mb-1">
                                                        Find: {evo.missing.join(" or ")}
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-500 leading-tight">{evo.desc}</p>
                                            </div>
                                            {isReady && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleInventory(evo.name); }}
                                                    className="absolute bottom-2 right-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-emerald-500"
                                                >
                                                    I MADE THIS
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
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
                                    <div key={idx} onClick={() => applyDuo(duo)} className="game-panel p-3 cursor-pointer hover:bg-slate-800 group">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="text-lg text-purple-400 group-hover:glow-text-purple transition-all">{duo.name}</h3>
                                            <span className="text-xs bg-slate-700 px-1 rounded h-fit">{duo.tag}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex gap-1">
                                                {duo.chars.map(c => (
                                                    <div key={c} className="w-10 h-10 border border-slate-600 bg-black overflow-hidden relative">
                                                        <img src={charactersDB.find(x => x.name === c).img} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-[12px] text-slate-500 italic leading-tight flex-1">{duo.desc}</div>
                                        </div>
                                        <button className="w-full bg-cyan-900/40 border border-cyan-700 text-cyan-400 text-xs py-1 hover:bg-cyan-900/60">LOAD DUO</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {metaSubTab === 'builds' && (
                            <div className="grid gap-3">
                                {metaBuilds.map((build, idx) => (
                                    <div key={idx} onClick={() => applyMetaBuild(build)} className="game-panel p-3 cursor-pointer hover:bg-slate-800 group">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg text-emerald-400 group-hover:glow-text-cyan transition-all">{build.name}</h3>
                                                <span className="text-[10px] bg-slate-700 px-1 rounded uppercase">{build.tag}</span>
                                            </div>
                                            <span className="text-[10px] bg-emerald-700 px-1 rounded">LOAD</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{build.desc}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {build.core.map(i => (
                                                <span key={i} className={`text-[10px] px-1 rounded border ${inventory.includes(i) ? 'bg-emerald-900/30 border-emerald-600 text-emerald-400' : 'bg-black border-red-900 text-red-300'}`}>{i}</span>
                                            ))}
                                            {build.support.map(i => (
                                                <span key={i} className={`text-[10px] px-1 rounded border ${inventory.includes(i) ? 'bg-emerald-900/30 border-emerald-600 text-emerald-400' : 'bg-black border-slate-700 text-slate-600'}`}>{i}</span>
                                            ))}
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

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
