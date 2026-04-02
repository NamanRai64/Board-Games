import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';
import { MousePointer2, Bot, Lightbulb } from 'lucide-react';

const SIZE = 4;

function generateWorld() {
  const pits = [];
  for (let i = 0; i < 3; i++) {
    let r, c;
    do {
      r = Math.floor(Math.random() * SIZE);
      c = Math.floor(Math.random() * SIZE);
    } while ((r === 0 && c === 0) || pits.find(p => p.r === r && p.c === c));
    pits.push({ r, c });
  }

  let wumpus;
  do {
    wumpus = { r: Math.floor(Math.random() * SIZE), c: Math.floor(Math.random() * SIZE) };
  } while ((wumpus.r === 0 && wumpus.c === 0) || pits.find(p => p.r === wumpus.r && p.c === wumpus.c));

  let gold;
  do {
    gold = { r: Math.floor(Math.random() * SIZE), c: Math.floor(Math.random() * SIZE) };
  } while (
    (gold.r === 0 && gold.c === 0) ||
    pits.find(p => p.r === gold.r && p.c === gold.c) || 
    (wumpus.r === gold.r && wumpus.c === gold.c)
  );

  return { pits, wumpus, gold };
}

export default function Wumpus() {
  const [world, setWorld] = useState(null);
  const [pos, setPos] = useState({ r: 0, c: 0 }); // start top-left
  const [visited, setVisited] = useState([{ r: 0, c: 0 }]);
  const [mode, setMode] = useState('manual'); // 'manual' or 'agent'
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [status, setStatus] = useState(null); // 'win', 'lose-pit', 'lose-wumpus'
  const [hintMove, setHintMove] = useState(null);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setWorld(generateWorld());
    setPos({ r: 0, c: 0 });
    setVisited([{ r: 0, c: 0 }]);
    setStatus(null);
    setAgentLogs(null);
    setIsAuto(false);
    setHintMove(null);
  };

  const getSensors = (r, c) => {
    if (!world) return {};
    let stench = false;
    let breeze = false;
    
    // Check adjacents for Wumpus
    if (Math.abs(world.wumpus.r - r) + Math.abs(world.wumpus.c - c) === 1) stench = true;
    
    // Check adjacents for Pits
    for (let p of world.pits) {
      if (Math.abs(p.r - r) + Math.abs(p.c - c) === 1) breeze = true;
    }
    
    return { stench, breeze, glitter: world.gold.r === r && world.gold.c === c };
  };

  const isVisited = (r, c) => visited.some(v => v.r === r && v.c === c);

  const calculateAgentMoves = useCallback(() => {
    if (!world || status) return null;

    const { stench, breeze } = getSensors(pos.r, pos.c);
    const moves = [
      { r: pos.r - 1, c: pos.c, dir: 'Up' },
      { r: pos.r + 1, c: pos.c, dir: 'Down' },
      { r: pos.r, c: pos.c - 1, dir: 'Left' },
      { r: pos.r, c: pos.c + 1, dir: 'Right' },
    ];

    const validMoves = moves.filter(m => m.r >= 0 && m.r < SIZE && m.c >= 0 && m.c < SIZE);
    const scoredMoves = validMoves.map(m => {
      let score = 0;
      if (isVisited(m.r, m.c)) {
        score = -1;
      } else {
        score = 50; // Unvisited
        if (breeze) score -= 1000;
        if (stench) score -= 20;
      }
      return { move: m, score };
    });

    return topNRandom(scoredMoves, 5); // top valid logical choices
  }, [pos, world, status, visited]);

  const applyMove = (r, c) => {
    setPos({ r, c });
    if (!isVisited(r, c)) setVisited(prev => [...prev, { r, c }]);
    setHintMove(null);

    // Check game over
    if (world.wumpus.r === r && world.wumpus.c === c) {
      setStatus('lose-wumpus');
      setIsAuto(false);
    } else if (world.pits.find(p => p.r === r && p.c === c)) {
      setStatus('lose-pit');
      setIsAuto(false);
    } else if (world.gold.r === r && world.gold.c === c) {
      setStatus('win');
      setIsAuto(false);
    }
  };

  const performAgentMove = useCallback(() => {
    if (status) return;
    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      applyMove(result.chosen.move.r, result.chosen.move.c);
    } else {
      setIsAuto(false);
    }
  }, [calculateAgentMoves, status]);

  const provideHint = () => {
    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      setHintMove(result.chosen.move);
    } else {
      setAgentLogs({ error: "No valid moves.", sorted: [] });
    }
  };

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !status) {
      timeout = setTimeout(() => performAgentMove(), 600);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, status, performAgentMove]);

  const handleCellClick = (r, c) => {
    if (mode === 'agent' || isAuto || status) return;
    // Check if adjacent
    if (Math.abs(r - pos.r) + Math.abs(c - pos.c) === 1) {
      applyMove(r, c);
      setAgentLogs(null);
    }
  };

  if (!world) return null;

  let statusMsg = 'Exploring...';
  let statusType = 'thinking';
  if (status === 'win') { statusMsg = 'You found the GOLD! Win!'; statusType = 'win'; }
  if (status === 'lose-wumpus') { statusMsg = 'Eaten by Wumpus! Lose!'; statusType = 'lose'; }
  if (status === 'lose-pit') { statusMsg = 'Fell in a Pit! Lose!'; statusType = 'lose'; }

  const currentSensors = getSensors(pos.r, pos.c);

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Wumpus World</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => { setMode('manual'); setIsAuto(false); }}>
          <MousePointer2 size={18} className="inline-icon" /> Manual
        </button>
        <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
          <Bot size={18} className="inline-icon" /> Agent Solve
        </button>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${SIZE}, 60px)`, 
          gridTemplateRows: `repeat(${SIZE}, 60px)`,
          gap: '4px',
          background: 'var(--color-panel-border)',
          padding: '4px', borderRadius: '8px'
        }}>
          {Array.from({ length: SIZE }).map((_, r) => (
            Array.from({ length: SIZE }).map((__, c) => {
              const isHero = pos.r === r && pos.c === c;
              const hasVisited = isVisited(r, c);
              const isAdjacent = Math.abs(r - pos.r) + Math.abs(c - pos.c) === 1;
              const Clickable = mode === 'manual' && isAdjacent && !status;
              const IsHint = hintMove && hintMove.r === r && hintMove.c === c;

              // What's really there (for Dev/Agent but we only show if visited or over)
              const hasWumpus = world.wumpus.r === r && world.wumpus.c === c;
              const hasPit = world.pits.find(p => p.r === r && p.c === c);
              const hasGold = world.gold.r === r && world.gold.c === c;

              let display = '';
              if (hasVisited || status) {
                if (hasWumpus) display = '👹';
                else if (hasPit) display = '🕳️';
                else if (hasGold) display = '💰';
              }
              if (isHero) display = '🤠'; // Hero overrides others

              return (
                <button 
                  key={`${r}-${c}`}
                  style={{ 
                    width: '60px', height: '60px',
                    backgroundColor: hasVisited ? 'var(--color-bg)' : '#333',
                    border: IsHint ? '3px solid var(--color-accent)' : '1px solid #111',
                    cursor: Clickable ? 'pointer' : 'default',
                    fontSize: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: Clickable ? '0 0 5px rgba(255,255,255,0.2)' : 'none'
                  }}
                  onClick={() => handleCellClick(r, c)}
                  disabled={!Clickable}
                >
                  {display}
                </button>
              )
            })
          ))}
        </div>

        <div className="glass-panel" style={{ width: '200px' }}>
          <h4 style={{ color: 'var(--color-text-main)', marginBottom: '10px' }}>Sensors (Current Pos)</h4>
          <div style={{ color: currentSensors.stench ? 'var(--color-alert)' : 'var(--color-text-muted)' }}>Stench: {currentSensors.stench ? 'YES' : 'NO'}</div>
          <div style={{ color: currentSensors.breeze ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>Breeze: {currentSensors.breeze ? 'YES' : 'NO'}</div>
          <div style={{ color: currentSensors.glitter ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>Glitter: {currentSensors.glitter ? 'YES' : 'NO'}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={resetGame}>Restart</button>
        {mode === 'manual' && !status && (
          <button className="btn btn-primary" onClick={provideHint}>
            <Lightbulb size={18} className="inline-icon" /> Hint
          </button>
        )}
      </div>

      <div style={{ width: '100%' }}>
        {(mode === 'agent' || (mode === 'manual' && agentLogs)) && (
          <AgentLogPanel 
            moveResults={agentLogs} 
            onStep={performAgentMove} 
            onAutoSolve={() => setIsAuto(true)} 
            isAuto={isAuto || !!status}
          />
        )}
      </div>
    </div>
  );
}
