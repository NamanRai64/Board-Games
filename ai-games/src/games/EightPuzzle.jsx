import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, SessionStats, ResultModal } from '../components';

export default function EightPuzzle() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState([]); 
  const [solved, setSolved] = useState(false);
  const [mode, setMode] = useState('manual'); 
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [prevMoveIdx, setPrevMoveIdx] = useState(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const getGoal = useCallback((s) => {
    const goal = [];
    for (let i = 1; i < s * s; i++) goal.push(i);
    goal.push(0);
    return goal;
  }, []);

  const shuffleBoard = () => {
    const goal = getGoal(size);
    let current = [...goal];
    for (let i = 0; i < (size === 3 ? 100 : 200); i++) {
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
    setPrevMoveIdx(null);
  };

  useEffect(() => {
    shuffleBoard();
  }, [size]);

  useEffect(() => {
    if (solved) setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
  }, [solved]);

  const getHeuristic = useCallback((curr, targetSize) => {
    let dist = 0;
    const goal = getGoal(targetSize);
    for (let i = 0; i < curr.length; i++) {
      const val = curr[i];
      if (val !== 0) {
        const targetIdx = val - 1;
        const startR = Math.floor(i / targetSize), startC = i % targetSize;
        const endR = Math.floor(targetIdx / targetSize), endC = targetIdx % targetSize;
        dist += Math.abs(startR - endR) + Math.abs(startC - endC);
        if (startR === endR) {
          for (let j = i + 1; j < (startR + 1) * targetSize; j++) {
            const val2 = curr[j];
            if (val2 !== 0) {
              const targetIdx2 = val2 - 1;
              const endR2 = Math.floor(targetIdx2 / targetSize);
              if (endR2 === startR && targetIdx > targetIdx2) dist += 1;
            }
          }
        }
      }
    }
    return dist;
  }, [getGoal]);

  const performAgentMove = useCallback(() => {
    if (solved) { setIsAuto(false); return; }
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
        let score = getHeuristic(nextBoard, size);
        if (m.to === prevMoveIdx) score += 20;
        return { move: m, score: -score }; 
    });

    const result = topNRandom(scored, 3);
    if (result && result.chosen) {
        setAgentLogs({ ...result, chosen: { ...result.chosen } });
        const emptyIdxBefore = idx;
        const nextTargetIdx = result.chosen.move.to;
        setBoard(prev => {
            const next = [...prev];
            const emptyIdx = next.indexOf(0);
            [next[emptyIdx], next[nextTargetIdx]] = [next[nextTargetIdx], next[emptyIdx]];
            return next;
        });
        setPrevMoveIdx(emptyIdxBefore);
        setTimeout(() => {
          setBoard(current => {
            if (JSON.stringify(current) === JSON.stringify(getGoal(size))) setSolved(true);
            return current;
          });
        }, 0);
    } else {
        setIsAuto(false);
    }
  }, [board, size, solved, getHeuristic, getGoal, prevMoveIdx]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !solved) {
      timeout = setTimeout(() => performAgentMove(), size === 3 ? 400 : 250); 
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, solved, size, performAgentMove]);

  const handleTileClick = (idx) => {
    if (mode === 'agent' || solved || isAuto) return;
    const emptyIdx = board.indexOf(0);
    const r = Math.floor(idx / size), c = idx % size;
    const er = Math.floor(emptyIdx / size), ec = emptyIdx % size;
    if (Math.abs(r - er) + Math.abs(c - ec) === 1) {
      setBoard(prev => {
        const next = [...prev];
        [next[emptyIdx], next[idx]] = [next[idx], next[emptyIdx]];
        if (JSON.stringify(next) === JSON.stringify(getGoal(size))) setSolved(true);
        return next;
      });
      setPrevMoveIdx(null);
    }
  };

  const currentDist = getHeuristic(board, size);
  let statusMsg = solved ? 'Matrix Balanced! (Solved)' : `Heuristic Potential: ${currentDist}`;
  let statusType = solved ? 'win' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>8-Puzzle</h2>
      
      <SessionStats stats={stats} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => setMode('manual')}>Manual</button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>AI Solver</button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '16px', display: 'flex', gap: '10px' }}>
          <button className={`btn ${size === 3 ? 'btn-secondary' : ''}`} onClick={() => setSize(3)}>3x3</button>
          <button className={`btn ${size === 4 ? 'btn-secondary' : ''}`} onClick={() => setSize(4)}>4x4</button>
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${size}, 70px)`, 
        width: `${size * 78}px`,
        gap: '8px', 
        padding: '12px', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: '16px', 
        border: '1px solid var(--color-border)', 
        margin: '0 auto', 
        justifyContent: 'center'
      }}>
        {board.map((tile, idx) => (
          <button 
            key={idx} 
            className={`cell ${tile === 0 ? 'empty' : ''}`} 
            onClick={() => handleTileClick(idx)} 
            disabled={tile === 0 || solved || isAuto} 
            style={{ 
              opacity: tile === 0 ? 0 : 1, 
              color: 'var(--color-link)', 
              fontSize: '1.8rem', 
              width: '70px',
              height: '70px',
              background: 'rgba(59, 130, 246, 0.05)', 
              fontWeight: 700 
            }}>
            {tile}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button className="btn" style={{ padding: '12px 32px' }} onClick={shuffleBoard}>Shuffle Reality</button>
      </div>

      {mode === 'agent' && (
        <AgentLogPanel moveResults={agentLogs} onStep={performAgentMove} onAutoSolve={() => setIsAuto(true)} isAuto={isAuto || solved} title="Entropy Reduction Matrix" />
      )}
      <ResultModal 
        status={solved ? 'win' : null} 
        reason="The entropy has been neutralized. Grid aligned."
        onRestart={shuffleBoard}
      />
    </div>
  );
}
