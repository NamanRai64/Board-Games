import React, { useState, useEffect, useCallback } from 'react';
import { AgentLogPanel, StatusBanner, SessionStats } from '../components';
import { Compass, Lightbulb, Map, Skull, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Wumpus() {
  const [size, setSize] = useState(4);
  const [world, setWorld] = useState(null);
  const [player, setPlayer] = useState({ x: 0, y: 0, dir: 0 }); 
  const [visited, setVisited] = useState({});
  const [status, setStatus] = useState('playing'); 
  const [mode, setMode] = useState('manual');
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const generateWorld = useCallback((s) => {
    const newWorld = Array(s).fill(null).map(() => Array(s).fill(null).map(() => ({ wumpus: false, pit: false, gold: false })));
    const place = (type) => {
      let x, y; do { x = Math.floor(Math.random() * s); y = Math.floor(Math.random() * s); } while ((x === 0 && y === 0) || newWorld[x][y][type]);
      newWorld[x][y][type] = true;
    };
    place('wumpus'); place('gold');
    for (let i = 0; i < Math.floor(s * s * 0.15); i++) place('pit');
    return newWorld;
  }, []);

  const resetGame = () => {
    setWorld(generateWorld(size));
    setPlayer({ x: 0, y: 0, dir: 0 });
    setVisited({ '0,0': true });
    setStatus('playing');
    setAgentLogs(null);
    setIsAuto(false);
  };

  useEffect(() => { resetGame(); }, [size]);
  useEffect(() => {
    if (status === 'win') setStats(p => ({ ...p, wins: p.wins + 1 }));
    else if (status === 'lose') setStats(p => ({ ...p, losses: p.losses + 1 }));
  }, [status]);

  const getPercepts = useCallback((x, y) => {
    if (!world || !world[x] || !world[x][y]) return [];
    const pIdx = [];
    if (world[x][y].gold) pIdx.push('isGold');
    const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([nx, ny]) => nx >=0 && nx < size && ny >= 0 && ny < size);
    if (neighbors.some(([nx, ny]) => world[nx][ny].wumpus)) pIdx.push('isStench');
    if (neighbors.some(([nx, ny]) => world[nx][ny].pit)) pIdx.push('isBreeze');
    return pIdx;
  }, [world, size]);

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

  if (!world) return null;
  const currentP = getPercepts(player.x, player.y);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: '#ccc' }}>
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>Wumpus World</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left: The Board */}
        <div style={{ background: '#0a0a0a', border: '2px solid #333', padding: '20px', borderRadius: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: '1px', background: '#333', border: '1px solid #333' }}>
            {world.map((row, x) => row.map((cell, y) => {
              const isP = player.x === x && player.y === y;
              const isV = visited[`${x},${y}`];
              const p = getPercepts(x, y);
              return (
                <div key={`${x}-${y}`} style={{ width: '80px', height: '80px', background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isP && <Compass size={32} style={{ color: 'orange' }} />}
                  {isV && !isP && p.includes('isBreeze') && <Waves size={20} style={{ color: '#58a6ff', position: 'absolute', top: 5, right: 5 }} />}
                  {isV && !isP && p.includes('isStench') && <Zap size={20} style={{ color: '#da3633', position: 'absolute', top: 5, left: 5 }} />}
                  {!isV && status === 'playing' && <div style={{ fontSize: '2rem', opacity: 0.1, pointerEvents: 'none' }}>M</div>}
                  {(isV || status !== 'playing') && !isP && cell.gold && <Zap size={40} style={{ color: 'gold' }} />}
                  {(isV || status !== 'playing') && !isP && (cell.pit || cell.wumpus) && <Skull size={40} style={{ color: '#da3633' }} />}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right: Info Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Sensors */}
          <div style={{ background: '#0e0e0e', padding: '24px', borderRadius: '4px', border: '1px solid #222' }}>
            <div className="mono" style={{ fontSize: '0.9rem', color: '#888', marginBottom: '16px', letterSpacing: '0.1em' }}>SENSORS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: currentP.includes('isStench') ? 1 : 0.2 }}>
                <Zap size={18} style={{ color: '#da3633' }} /> <span>Stench</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: currentP.includes('isBreeze') ? 1 : 0.2 }}>
                <Waves size={18} style={{ color: '#58a6ff' }} /> <span>Breeze</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: currentP.includes('isGold') ? 1 : 0.2 }}>
                <Zap size={18} style={{ color: 'gold' }} /> <span>Glitter</span>
              </div>
            </div>
          </div>

          {/* Movement */}
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '0.9rem', color: '#888', marginBottom: '20px', letterSpacing: '0.1em' }}>MOVEMENT</div>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 40px 40px', gridTemplateRows: '40px 40px', gap: '8px', justifyContent: 'center' }}>
              <div />
              <button className="btn" style={{ padding: 0 }} onClick={() => movePlayer(-1, 0)}><ChevronUp /></button>
              <div />
              <button className="btn" style={{ padding: 0 }} onClick={() => movePlayer(0, -1)}><ChevronLeft /></button>
              <button className="btn" style={{ padding: 0 }} onClick={() => movePlayer(1, 0)}><ChevronDown /></button>
              <button className="btn" style={{ padding: 0 }} onClick={() => movePlayer(0, 1)}><ChevronRight /></button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn" onClick={resetGame} style={{ background: '#222', borderColor: '#444' }}>RESPAWN</button>
            <button className="btn btn-primary" onClick={resetGame}>RESTART</button>
          </div>
          
          <StatusBanner status={status === 'win' ? 'win' : status === 'lose' ? 'lose' : 'thinking'} message={status === 'win' ? 'Victory: Gold Extracted!' : status === 'lose' ? 'Fatal: Simulation Ended.' : 'Scanning Cavern...'} />
        </div>
      </div>
    </div>
  );
}
