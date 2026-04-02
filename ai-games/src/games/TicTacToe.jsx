import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';

export default function TicTacToe() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(Array(size * size).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('2player'); // '2player', 'pva', or 'agent'
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);

  const calculateWinner = useCallback((squares) => {
    const lines = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) row.push(i*size + j);
        lines.push(row);
    }
    for (let i = 0; i < size; i++) {
        const col = [];
        for (let j = 0; j < size; j++) col.push(j*size + i);
        lines.push(col);
    }
    const d1 = [];
    for (let i = 0; i < size; i++) d1.push(i*size + i);
    lines.push(d1);
    const d2 = [];
    for (let i = 0; i < size; i++) d2.push(i*size + (size - 1 - i));
    lines.push(d2);

    for (let line of lines) {
      const first = squares[line[0]];
      if (first && line.every(idx => squares[idx] === first)) return first;
    }
    return squares.includes(null) ? null : 'Draw';
  }, [size]);

  const minimax = useCallback((squares, depth, isMaximizing, playerChar) => {
    const result = calculateWinner(squares);
    const depthLimit = size === 3 ? 10 : 4; // Improved for 4x4 but kept balanced

    if (result === playerChar) return 10 - depth;
    if (result === (playerChar === 'X' ? 'O' : 'X')) return depth - 10;
    if (result === 'Draw' || depth >= depthLimit) return 0;

    const availableIndices = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i of availableIndices) {
        squares[i] = playerChar;
        let score = minimax(squares, depth + 1, false, playerChar);
        squares[i] = null;
        bestScore = Math.max(bestScore, score);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      const opponentChar = playerChar === 'X' ? 'O' : 'X';
      for (let i of availableIndices) {
        squares[i] = opponentChar;
        let score = minimax(squares, depth + 1, true, playerChar);
        squares[i] = null;
        bestScore = Math.min(bestScore, score);
      }
      return bestScore;
    }
  }, [size, calculateWinner]);

  const performAgentMove = useCallback(() => {
    const gameWinner = calculateWinner(board);
    if (gameWinner) {
      setIsAuto(false);
      return;
    }

    const currentPlayer = isXNext ? 'X' : 'O';
    const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    
    // EXHAUSTIVE Search: Test all available moves in sample (all of them if small enough)
    // For 4x4, we now test almost all empty spaces to avoid "random" behavior
    const sampleSize = size === 3 ? 9 : 14; 
    const sample = empty.sort(() => Math.random() - 0.5).slice(0, sampleSize);

    let scoredMoves = [];
    for (let i of sample) {
      const newBoard = [...board];
      newBoard[i] = currentPlayer;
      let score = minimax(newBoard, 0, false, currentPlayer);
      scoredMoves.push({ move: i, score });
    }

    const result = topNRandom(scoredMoves, 5); 
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const moveIdx = result.chosen.move;
      setBoard(prev => {
        const next = [...prev];
        next[moveIdx] = currentPlayer;
        return next;
      });
      setIsXNext(prev => !prev);
    } else {
      setIsAuto(false);
    }
  }, [board, isXNext, size, calculateWinner, minimax]);

  const winner = calculateWinner(board);

  useEffect(() => {
    resetGame();
  }, [size]);

  useEffect(() => {
    if (mode === 'pva' && !isXNext && !winner) {
      const timeout = setTimeout(() => performAgentMove(), 600);
      return () => clearTimeout(timeout);
    }
  }, [mode, isXNext, winner, board, performAgentMove]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !winner) {
      timeout = setTimeout(() => performAgentMove(), 600);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, winner, performAgentMove]);

  const handleCellClick = (index) => {
    if (board[index] || winner || (mode === 'agent' && isAuto)) return;
    if (mode === 'pva' && !isXNext) return;
    setBoard(prev => {
      const next = [...prev];
      next[index] = isXNext ? 'X' : 'O';
      return next;
    });
    setIsXNext(prev => !prev);
  };

  const resetGame = () => {
    setBoard(Array(size * size).fill(null));
    setIsXNext(true);
    setAgentLogs(null);
    setIsAuto(false);
  };

  let statusMsg = winner ? (winner === 'Draw' ? 'Game Over: Draw!' : `Winner: ${winner}`) : `Next player: ${isXNext ? 'X' : 'O'}`;
  let statusType = winner ? (winner === 'Draw' ? 'thinking' : 'win') : '';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: '24px', textAlign: 'center' }}>Tic-Tac-Toe</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${mode === '2player' ? 'btn-primary' : ''}`} onClick={() => setMode('2player')}>PvP</button>
          <button className={`btn ${mode === 'pva' ? 'btn-primary' : ''}`} onClick={() => setMode('pva')}>vs Agent</button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>Solver</button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-panel-border)', paddingLeft: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Level:</span>
          <button key="3x3" className={`btn ${size === 3 ? 'btn-secondary' : ''}`} onClick={() => setSize(3)}>3x3</button>
          <button key="4x4" className={`btn ${size === 4 ? 'btn-secondary' : ''}`} onClick={() => setSize(4)}>4x4</button>
        </div>
      </div>
      <StatusBanner status={statusType} message={statusMsg} />
      <div className="board-grid" style={{ gridTemplateColumns: `repeat(${size}, 80px)`, width: 'fit-content' }}>
        {board.map((cell, idx) => (
          <button key={idx} className={`cell ${cell ? 'active' : ''}`} onClick={() => handleCellClick(idx)} disabled={!!winner || (mode === 'agent' && isAuto) || (mode === 'pva' && !isXNext)} style={{ fontSize: size === 3 ? '2rem' : '1.5rem', width: '80px', height: '80px' }}>
            {cell === 'X' ? <span style={{ color: 'var(--color-link)' }}>X</span> : cell === 'O' ? <span style={{ color: 'var(--color-alert)' }}>O</span> : null}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn" onClick={resetGame}>Restart Game</button>
      </div>
      {(mode === 'agent' || mode === 'pva') && (
        <AgentLogPanel moveResults={agentLogs} onStep={performAgentMove} onAutoSolve={() => setIsAuto(true)} isAuto={isAuto || !!winner || mode === 'pva'} title={mode === 'pva' ? "Agent's Strategy" : "Optimal Solver"} />
      )}
    </div>
  );
}
