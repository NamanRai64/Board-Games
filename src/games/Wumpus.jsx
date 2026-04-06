import React, { useState, useCallback } from 'react';
import { StatusBanner, ResultModal } from '../components';
import { Compass, Skull, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Waves } from 'lucide-react';

export default function Wumpus() {
  const [size, setSize] = useState(4);

  // Initialize world immediately to avoid blank page
  const generateWorld = useCallback((s) => {
    const newWorld = Array(s).fill(null).map(() => Array(s).fill(null).map(() => ({ wumpus: false, pit: false, gold: false })));
    const place = (type) => {
      let x, y;
      do {
        x = Math.floor(Math.random() * s);
        y = Math.floor(Math.random() * s);
      } while ((x === 0 && y === 0) || newWorld[x][y].wumpus || newWorld[x][y].pit || newWorld[x][y].gold);
      newWorld[x][y][type] = true;
    };
    place('wumpus');
    place('gold');
    const pitCount = Math.floor(s * s * 0.15);
    for (let i = 0; i < pitCount; i++) place('pit');
    return newWorld;
  }, []);

  const [world, setWorld] = useState(() => generateWorld(4));
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [visited, setVisited] = useState({ '0,0': true });
  const [status, setStatus] = useState('playing');
  const [reason, setReason] = useState(null);

  const resetGame = useCallback((newSize) => {
    const s = newSize || size;
    if (typeof newSize === 'number') setSize(s);
    setWorld(generateWorld(s));
    setPlayer({ x: 0, y: 0 });
    setVisited({ '0,0': true });
    setStatus('playing');
    setReason(null);
  }, [size, generateWorld]);

  const getPercepts = useCallback((x, y, w = world) => {
    if (!w || !w[x] || !w[x][y]) return [];
    const pIdx = [];
    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([nx, ny]) =>
      nx >= 0 && nx < w.length && ny >= 0 && ny < w.length
    );
    if (neighbors.some(([nx, ny]) => w[nx][ny].wumpus)) pIdx.push('isStench');
    if (neighbors.some(([nx, ny]) => w[nx][ny].pit)) pIdx.push('isBreeze');
    if (neighbors.some(([nx, ny]) => w[nx][ny].gold)) pIdx.push('isGold');
    return pIdx;
  }, [world]);

  const movePlayer = (dx, dy) => {
    if (status !== 'playing') return;
    const nx = player.x + dx, ny = player.y + dy;
    if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
      setPlayer({ x: nx, y: ny });
      setVisited(prev => ({ ...prev, [`${nx},${ny}`]: true }));
      if (world[nx][ny].wumpus) {
        setStatus('lose');
        setReason('the Wumpus');
      } else if (world[nx][ny].pit) {
        setStatus('lose');
        setReason('a Bottomless Pit');
      } else if (world[nx][ny].gold) {
        setStatus('win');
      }
    }
  };

  const currentP = getPercepts(player.x, player.y, world);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="arcade-title">WUMPUS_WORLD //</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: '60px', alignItems: 'start' }}>

        {/* Left: The Board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: '16px',
            borderRadius: '4px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              gap: '4px',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              {world.map((row, x) => row.map((cell, y) => {
                const isP = player.x === x && player.y === y;
                const isV = visited[`${x},${y}`];
                const p = getPercepts(x, y, world);
                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      background: isV ? 'rgba(255, 255, 255, 0.06)' : '#0d0d0d',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    {isP && (
                      <div style={{ position: 'relative', zIndex: 5, filter: 'drop-shadow(0 0 12px orange)' }}>
                        <Compass size={size > 4 ? 24 : 36} style={{ color: 'orange' }} />
                      </div>
                    )}

                    {isV && !isP && p.includes('isStench') && (
                      <Zap size={size > 4 ? 12 : 18} style={{ color: '#ff4d4d', position: 'absolute', top: '10%', left: '10%', opacity: 0.9, filter: 'drop-shadow(0 0 5px #ff4d4d)' }} />
                    )}
                    {isV && !isP && p.includes('isBreeze') && (
                      <Waves size={size > 4 ? 12 : 18} style={{ color: '#58a6ff', position: 'absolute', top: '10%', right: '10%', opacity: 0.9, filter: 'drop-shadow(0 0 5px #58a6ff)' }} />
                    )}
                    {isV && !isP && p.includes('isGold') && (
                      <div style={{ position: 'absolute', bottom: '10%', right: '10%', fontSize: size > 4 ? '12px' : '18px', filter: 'drop-shadow(0 0 8px gold)', lineHeight: 1 }}>✨</div>
                    )}

                    {!isV && status === 'playing' && (
                      <div style={{ fontSize: '1.5rem', opacity: 0.03, fontWeight: '900', userSelect: 'none' }}>?</div>
                    )}

                    {(isV || status !== 'playing') && !isP && cell.gold && (
                      <div style={{ filter: 'drop-shadow(0 0 15px gold)', fontSize: size > 4 ? '32px' : '44px', lineHeight: 1 }}>🪙</div>
                    )}
                    {(isV || status !== 'playing') && !isP && (cell.pit || cell.wumpus) && (
                      <div style={{ filter: 'drop-shadow(0 0 15px #ff4d4d)' }}>
                        <Skull size={size > 4 ? 30 : 44} style={{ color: '#ff4d4d' }} />
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="toggle-group">
              {[4, 5, 6].map(s => (
                <button
                  key={s}
                  onClick={() => resetGame(s)}
                  className={`toggle-btn ${size === s ? 'active' : ''}`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-minimal" onClick={() => resetGame()}>[NEW_SIMULATION]</button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <StatusBanner
            status={status === 'win' ? 'win' : status === 'lose' ? 'lose' : 'thinking'}
            message={status === 'win' ? 'Victory: Gold Extracted!' : status === 'lose' ? `Fatal: Killed by ${reason}.` : 'Scanning Cavern...'}
          />

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="mono" style={{ fontSize: '0.8rem', color: '#555', marginBottom: '24px', letterSpacing: '0.2em' }}>SENSORS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PerceptRow active={currentP.includes('isStench')} color="#ff4d4d" icon={<Zap size={18} />} label="Stench (Wumpus nearby)" />
              <PerceptRow active={currentP.includes('isBreeze')} color="#58a6ff" icon={<Waves size={18} />} label="Breeze (Pit nearby)" />
              <PerceptRow active={currentP.includes('isGold')} color="#ffd700" icon={<span style={{ fontSize: '18px' }}>✨</span>} label="Glitter (Gold nearby)" />
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '4px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '24px', letterSpacing: '0.1em' }}>CONTROLS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '160px', margin: '0 auto' }}>
              <div />
              <button className="btn ctrl-btn" onClick={() => movePlayer(-1, 0)}><ChevronUp /></button>
              <div />
              <button className="btn ctrl-btn" onClick={() => movePlayer(0, -1)}><ChevronLeft /></button>
              <button className="btn ctrl-btn" onClick={() => movePlayer(1, 0)}><ChevronDown /></button>
              <button className="btn ctrl-btn" onClick={() => movePlayer(0, 1)}><ChevronRight /></button>
            </div>
          </div>
        </div>
      </div>

      <ResultModal
        status={status}
        reason={status === 'lose' ? `You were killed by ${reason}.` : 'You successfully retrieved the gold!'}
        onRestart={() => resetGame()}
      />

      <style>{`
        .ctrl-btn { width: 44px; height: 44px; padding: 0; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}

function PerceptRow({ active, color, icon, label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 16px',
      borderRadius: '16px',
      background: active ? `${color}15` : 'transparent',
      border: '1px solid',
      borderColor: active ? `${color}40` : 'transparent',
      transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: active ? 1 : 0.3
    }}>
      <div style={{ color }}>{icon}</div>
      <span style={{ fontWeight: 500, color: '#eee', fontSize: '0.95rem' }}>{label}</span>
    </div>
  );
}
