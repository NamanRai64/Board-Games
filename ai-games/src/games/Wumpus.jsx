import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, SessionStats } from '../components';
import { Compass, Lightbulb, Map, Skull, Zap } from 'lucide-react';

export default function Wumpus() {
  const [size, setSize] = useState(4);
  const [world, setWorld] = useState(null);
  const [player, setPlayer] = useState({ x: 0, y: 0, dir: 0 }); // 0:R, 1:D, 2:L, 3:U
  const [visited, setVisited] = useState({});
  const [status, setStatus] = useState('playing'); // playing, win, lose
  const [mode, setMode] = useState('manual');
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const generateWorld = useCallback((s) => {
    const newWorld = Array(s).fill(null).map(() => Array(s).fill(null).map(() => ({ wumpus: false, pit: false, gold: false })));
    const place = (type) => {
      let x, y;
      do { x = Math.floor(Math.random() * s); y = Math.floor(Math.random() * s); } while ((x === 0 && y === 0) || newWorld[x][y][type]);
      newWorld[x][y][type] = true;
    };
    place('wumpus');
    place('gold');
    for (let i = 0; i < Math.floor(s * s * 0.15); i++) place('pit');
    return newWorld;
  }, []);

  const resetGame = () => {
    const newWorld = generateWorld(size);
    setWorld(newWorld);
    setPlayer({ x: 0, y: 0, dir: 0 });
    setVisited({ '0,0': true });
    setStatus('playing');
    setAgentLogs(null);
    setIsAuto(false);
  };

  useEffect(() => { resetGame(); }, [size]);
  
  useEffect(() => {
    if (status === 'win') setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
    else if (status === 'lose') setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
  }, [status]);

  const getPercepts = (x, y) => {
    if (!world) return [];
    const p = [];
    if (world[x][y].gold) p.push('Glitter');
    const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([nx, ny]) => nx >=0 && nx < size && ny >= 0 && ny < size);
    if (neighbors.some(([nx, ny]) => world[nx][ny].wumpus)) p.push('Stench');
    if (neighbors.some(([nx, ny]) => world[nx][ny].pit)) p.push('Breeze');
    return p;
  };

  const movePlayer = (dx, dy) => {
    if (status !== 'playing') return;
    const nx = player.x + dx, ny = player.y + dy;
    if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
      setPlayer(prev => ({ ...prev, x: nx, y: ny }));
      setVisited(prev => ({ ...prev, [`${nx},${ny}`]: true }));
      if (world[nx][ny].wumpus || world[nx][ny].pit) setStatus('lose');
      if (world[nx][ny].gold) setStatus('win');
    }
  };

  const calculateAgentMoves = useCallback(() => {
    const dirMap = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const scoredMoves = dirMap.map((d, idx) => {
      const nx = player.x + d[0], ny = player.y + d[1];
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) return { move: idx, score: -1000 };
      let score = 0;
      if (!visited[`${nx},${ny}`]) score += 50; 
      const percepts = getPercepts(player.x, player.y);
      if (percepts.includes('Stench') || percepts.includes('Breeze')) score -= 200;
      return { move: { dx: d[0], dy: d[1], dir: idx }, score };
    });
    return topNRandom(scoredMoves, 5);
  }, [player, world, size, visited]);

  const performAgentMove = useCallback(() => {
    if (status !== 'playing') { setIsAuto(false); return; }
    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const { dx, dy } = result.chosen.move;
      movePlayer(dx, dy);
    }
  }, [calculateAgentMoves, status]);

  const provideHint = () => {
    const result = calculateAgentMoves();
    if (result && result.chosen) setAgentLogs({ ...result, manualHint: true });
  };

  useEffect(() => {
    let t;
    if (mode === 'agent' && isAuto && status === 'playing') t = setTimeout(performAgentMove, 400);
    return () => clearTimeout(t);
  }, [mode, isAuto, status, performAgentMove]);

  if (!world) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>Wumpus</h2>
      
      <SessionStats stats={stats} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => setMode('manual')}>Manual Exploration</button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>Agent Drive</button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '16px', display: 'flex', gap: '8px' }}>
          {[4, 6, 8].map(s => <button key={s} className={`btn ${size === s ? 'btn-secondary' : ''}`} onClick={() => setSize(s)}>{s}x{s}</button>)}
        </div>
      </div>

      <StatusBanner status={status === 'win' ? 'win' : status === 'lose' ? 'lose' : 'thinking'} message={status === 'win' ? 'The Treasure is Ours!' : status === 'lose' ? 'Consumed by the Shadows...' : `Sensors: ${getPercepts(player.x, player.y).join(', ') || 'Silent'}`} />

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--color-border)', margin: '0 auto', padding: '16px', width: 'fit-content' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 60px)`, gap: '4px' }}>
          {world.map((row, x) => row.map((cell, y) => {
            const isPlayer = player.x === x && player.y === y;
            const isVisited = visited[`${x},${y}`];
            const p = getPercepts(x, y);
            const showContent = isVisited || status !== 'playing';
            return (
              <div key={`${x}-${y}`} className={`cell ${isPlayer ? 'active' : ''}`} style={{ width: '60px', height: '60px', position: 'relative', fontSize: '1.2rem', overflow: 'hidden' }}>
                {isPlayer && <Compass size={24} style={{ color: 'var(--color-link)', filter: 'drop-shadow(0 0 8px var(--color-glow-link))' }} />}
                {!isVisited && status === 'playing' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={14} style={{ opacity: 0.2 }} /></div>}
                {showContent && !isPlayer && cell.gold && <Zap size={24} style={{ color: 'var(--color-warning)' }} />}
                {showContent && !isPlayer && cell.pit && <Skull size={24} style={{ color: 'var(--color-alert)' }} />}
                {showContent && !isPlayer && cell.wumpus && <Bot size={24} style={{ color: 'var(--color-alert)' }} />}
              </div>
            );
          }))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        {status === 'playing' && mode === 'manual' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <button className="btn" onClick={() => movePlayer(-1, 0)}>Up</button>
            <button className="btn" onClick={() => movePlayer(1, 0)}>Down</button>
            <button className="btn" onClick={() => movePlayer(0, -1)}>Left</button>
            <button className="btn" onClick={() => movePlayer(0, 1)}>Right</button>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button className="btn" onClick={resetGame}>Format Cavern</button>
          {status === 'playing' && <button className="btn btn-secondary" onClick={provideHint}><Lightbulb size={16} /> Hint</button>}
        </div>
      </div>

      {mode === 'agent' && (
        <AgentLogPanel moveResults={agentLogs} onStep={performAgentMove} onAutoSolve={() => setIsAuto(true)} isAuto={isAuto || status !== 'playing'} title="Inference Decision Matrix" />
      )}
    </div>
  );
}
