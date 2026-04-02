import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';

export default function EightPuzzle() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState([]); 
  const [solved, setSolved] = useState(false);
  const [mode, setMode] = useState('manual'); 
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);

  const getGoal = (s) => {
    const goal = [];
    for (let i = 1; i < s * s; i++) goal.push(i);
    goal.push(0);
    return goal;
  };

  const shuffleBoard = () => {
    const goal = getGoal(size);
    let current = [...goal];
    // Random walk to ensure solvability
    for (let i = 0; i < 200; i++) {
        const idx = current.indexOf(0);
        const neighbors = [];
        const r = Math.floor(idx / size), c = idx % size;
        if (r > 0) neighbors.push(idx - size);
        if (r < size - 1) neighbors.push(idx + size);
        if (c > 0) neighbors.push(idx - 1);
        if (c < size - 1) neighbors.push(idx + 1);
        const move = neighbors[Math.floor(Math.random() * neighbors.length)];
        [current[idx], current[move]] = [current[move], current[idx]];
    }
    setBoard(current);
    setSolved(false);
    setAgentLogs(null);
    setIsAuto(false);
  };

  useEffect(() => {
    shuffleBoard();
  }, [size]);

  const getManhattan = (curr, targetSize) => {
    let dist = 0;
    const goal = getGoal(targetSize);
    for (let i = 0; i < curr.length; i++) {
      const val = curr[i];
      if (val !== 0) {
        const targetIdx = val - 1;
        const startR = Math.floor(i / targetSize), startC = i % targetSize;
        const endR = Math.floor(targetIdx / targetSize), endC = targetIdx % targetSize;
        dist += Math.abs(startR - endR) + Math.abs(startC - endC);
      }
    }
    return dist;
  };

  const performAgentMove = useCallback(() => {
    if (solved) {
        setIsAuto(false);
        return;
    }

    const idx = board.indexOf(0);
    const r = Math.floor(idx / size), c = idx % size;
    const moves = [];
    if (r > 0) moves.push({ to: idx - size, name: 'Up' });
    if (r < size - 1) moves.push({ to: idx + size, name: 'Down' });
    if (c > 0) moves.push({ to: idx - 1, name: 'Left' });
    if (c < size - 1) moves.push({ to: idx + 1, name: 'Right' });

    const scored = moves.map(m => {
        const nextBoard = [...board];
        [nextBoard[idx], nextBoard[m.to]] = [nextBoard[m.to], nextBoard[idx]];
        const score = getManhattan(nextBoard, size);
        return { move: m, score: -score }; 
    });

    const result = topNRandom(scored, 3);
    if (result && result.chosen) {
        console.log(`EightPuzzle agent chose move ${result.chosen.move.name}`);
        setAgentLogs({ ...result, chosen: { ...result.chosen } });
        const nextIdx = result.chosen.move.to;
        
        setBoard(prev => {
            const next = [...prev];
            const emptyIdx = next.indexOf(0);
            [next[emptyIdx], next[nextIdx]] = [next[nextIdx], next[emptyIdx]];
            return next;
        });

        // Check if solved AFTER updating board
        setTimeout(() => {
          setBoard(current => {
            if (JSON.stringify(current) === JSON.stringify(getGoal(size))) setSolved(true);
            return current;
          });
        }, 0);
    } else {
        setIsAuto(false);
    }
  }, [board, size, solved]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !solved) {
      timeout = setTimeout(() => {
        performAgentMove();
      }, size === 3 ? 400 : 250); 
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, solved, size, performAgentMove]);

  const handleTileClick = (idx) => {
    if (mode === 'agent' || solved || isAuto) return;
    const emptyIdx = board.indexOf(0);
    const r = Math.floor(idx / size), c = idx % size;
    const er = Math.floor(emptyIdx / size), ec = emptyIdx % size;
    
    if (Math.abs(r - er) + Math.abs(c - ec) === 1) {
      const nextBoard = [...board];
      [nextBoard[emptyIdx], nextBoard[idx]] = [nextBoard[idx], nextBoard[emptyIdx]];
      setBoard(nextBoard);
      if (JSON.stringify(nextBoard) === JSON.stringify(getGoal(size))) setSolved(true);
    }
  };

  const currentDist = getManhattan(board, size);
  let statusMsg = solved ? 'Puzzle Solved!' : `Current Distance: ${currentDist}`;
  let statusType = solved ? 'win' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: '24px', textAlign: 'center' }}>Sliding Puzzle</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => setMode('manual')}>
            Manual
          </button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
             Agent
          </button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-panel-border)', paddingLeft: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Level:</span>
          <button className={`btn ${size === 3 ? 'btn-secondary' : ''}`} onClick={() => setSize(3)}>3x3</button>
          <button className={`btn ${size === 4 ? 'btn-secondary' : ''}`} onClick={() => setSize(4)}>4x4</button>
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${size}, 70px)`, 
          gap: '4px',
          padding: '4px',
          background: 'var(--color-panel-border)',
          borderRadius: '8px',
          margin: '0 auto',
          width: 'fit-content'
      }}>
        {board.map((tile, idx) => (
          <button 
            key={idx} 
            className={`cell ${tile === 0 ? 'empty' : ''}`} 
            onClick={() => handleTileClick(idx)}
            disabled={tile === 0 || solved || (mode === 'agent')}
            style={{ 
              opacity: tile === 0 ? 0 : 1, 
              color: 'var(--color-link)',
              fontSize: size === 3 ? '1.5rem' : '1.2rem',
              width: '70px', height: '70px'
            }}
          >
            {tile}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn" onClick={shuffleBoard}>Shuffle & New Game</button>
      </div>

      {mode === 'agent' && (
        <AgentLogPanel 
          moveResults={agentLogs} 
          onStep={performAgentMove} 
          onAutoSolve={() => setIsAuto(true)} 
          isAuto={isAuto || solved}
        />
      )}
    </div>
  );
}
