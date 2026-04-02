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
  const shuffleBoard = () => {
    let newBoard = [...SOLVED_STATE];
    // random valid walk
    let emptyIdx = 8;
    for (let i = 0; i < 100; i++) {
      const moves = getValidMoves(newBoard);
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      newBoard = applyMove(newBoard, randomMove);
    }
    setBoard(newBoard);
    setIsAuto(false);
    setAgentLogs(null);
  };

  const isSolved = (currentBoard) => {
    return currentBoard.every((val, idx) => val === SOLVED_STATE[idx]);
  };

  const getValidMoves = (currentBoard) => {
    const emptyIdx = currentBoard.indexOf(0);
    const validMoves = [];
    const row = Math.floor(emptyIdx / 3);
    const col = emptyIdx % 3;

    if (row > 0) validMoves.push(emptyIdx - 3); // Up
    if (row < 2) validMoves.push(emptyIdx + 3); // Down
    if (col > 0) validMoves.push(emptyIdx - 1); // Left
    if (col < 2) validMoves.push(emptyIdx + 1); // Right
    return validMoves;
  };

  const applyMove = (currentBoard, targetIdx) => {
    const emptyIdx = currentBoard.indexOf(0);
    const newBoard = [...currentBoard];
    newBoard[emptyIdx] = newBoard[targetIdx];
    newBoard[targetIdx] = 0;
    return newBoard;
  };

  // Manhattan Distance Heuristic
  const computeManhattan = (currentBoard) => {
    let distance = 0;
    for (let i = 0; i < 9; i++) {
      const tile = currentBoard[i];
      if (tile !== 0) {
        const targetIdx = tile - 1;
        const currentX = i % 3;
        const currentY = Math.floor(i / 3);
        const targetX = targetIdx % 3;
        const targetY = Math.floor(targetIdx / 3);
        distance += Math.abs(currentX - targetX) + Math.abs(currentY - targetY);
      }
    }
    return distance;
  };

  const performAgentMove = () => {
    if (isSolved(board)) {
      setIsAuto(false);
      return;
    }

    const validMoves = getValidMoves(board);
    const scoredMoves = validMoves.map(moveIdx => {
      const nextBoard = applyMove(board, moveIdx);
      const h = computeManhattan(nextBoard);
      // We want to minimize H, so we maximize -H
      return { move: moveIdx, score: -h };
    });

    const result = topNRandom(scoredMoves, 5); // Take top N (up to 4 really since only 4 moves)
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const nextBoard = applyMove(board, result.chosen.move);
      setBoard(nextBoard);
    } else {
      setIsAuto(false);
    }
  };

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !isSolved(board)) {
      timeout = setTimeout(() => {
        performAgentMove();
      }, 300); // Faster for 8-puzzle
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board]);

  const handleTileClick = (idx) => {
    if (mode === 'agent' || isSolved(board) || isAuto) return;
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
      <h2 style={{ color: 'var(--color-accent)', marginBottom: '20px', textAlign: 'center' }}>8-Puzzle</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => setMode('manual')}>
          <MousePointer2 size={18} className="inline-icon" /> Manual
        </button>
        <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
          <Bot size={18} className="inline-icon" /> Agent Solve
        </button>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="board-grid" style={{ gridTemplateColumns: 'repeat(3, 80px)', gridTemplateRows: 'repeat(3, 80px)', width: 'fit-content' }}>
        {board.map((tile, idx) => (
          <button 
            key={idx} 
            className={`cell ${tile === 0 ? 'empty' : 'active'}`} 
            onClick={() => handleTileClick(idx)}
            disabled={tile === 0 || solved || (mode === 'agent')}
            style={{ opacity: tile === 0 ? 0 : 1 }}
          >
            {tile}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={shuffleBoard}>Shuffle Board</button>
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
