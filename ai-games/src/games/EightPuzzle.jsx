import React, { useState, useEffect } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';
import { MousePointer2, Bot } from 'lucide-react';

const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export default function EightPuzzle() {
  const [board, setBoard] = useState([...SOLVED_STATE]); // Start solved, then user can shuffle or we start shuffled
  const [mode, setMode] = useState('manual'); // 'manual' or 'agent'
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);

  // Helper to shuffle board
  const getGoal = (s) => {
    const goal = [];
    for (let i = 1; i < s * s; i++) goal.push(i);
    goal.push(0);
    return goal;
  };

  const shuffleBoard = () => {
    const goal = getGoal(size);
    let current = [...goal];
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

  const performAgentMove = () => {
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
        const score = getManhattan(nextBoard, size); // lower is better
        return { move: m, score: -score }; // negate to make higher better for topNRandom
    });

    const result = topNRandom(scored, 3);
    if (result && result.chosen) {
        setAgentLogs({ ...result, chosen: { ...result.chosen, move: result.chosen.move.name } });
        const nextBoard = [...board];
        const nextIdx = result.chosen.move.to;
        [nextBoard[idx], nextBoard[nextIdx]] = [nextBoard[nextIdx], nextBoard[idx]];
        setBoard(nextBoard);
        if (JSON.stringify(nextBoard) === JSON.stringify(getGoal(size))) {
            setSolved(true);
            setIsAuto(false);
        }
    } else {
        setIsAuto(false);
    }
  };

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !solved) {
      timeout = setTimeout(() => {
        performAgentMove();
      }, 300); // Faster for 8-puzzle
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board]);

  const handleTileClick = (idx) => {
    if (mode === 'agent' || solved || isAuto) return;
    const emptyIdx = board.indexOf(0);
    const validMoves = getValidMoves(board);
    if (validMoves.includes(idx)) {
      setBoard(applyMove(board, idx));
    }
  };

  const solved = isSolved(board);
  const statusMsg = solved ? 'Puzzle Solved!' : 'In Progress';
  const statusType = solved ? 'win' : '';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: '24px', textAlign: 'center' }}>8-Puzzle</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => setMode('manual')}>
          <MousePointer2 size={16} /> Manual
        </button>
        <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
          <Bot size={16} /> Agent Solve
        </button>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="board-grid" style={{ gridTemplateColumns: 'repeat(3, 80px)', width: 'fit-content' }}>
        {board.map((tile, idx) => (
          <button 
            key={idx} 
            className={`cell ${tile === 0 ? 'empty' : ''}`} 
            onClick={() => handleTileClick(idx)}
            disabled={tile === 0 || solved || (mode === 'agent')}
            style={{ 
              opacity: tile === 0 ? 0 : 1, 
              color: 'var(--color-link)',
              fontSize: '1.5rem'
            }}
          >
            {tile}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn" onClick={shuffleBoard}>Shuffle Board</button>
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
