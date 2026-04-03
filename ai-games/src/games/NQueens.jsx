import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, WarningPopup, SessionStats } from '../components';
import { MousePointer2, Bot, Lightbulb } from 'lucide-react';

export default function NQueens() {
  const [size, setSize] = useState(4);
  const [board, setBoard] = useState(Array(size).fill(null)); 
  const [mode, setMode] = useState('manual');
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  useEffect(() => { resetGame(); }, [size]);
  
  const isValid = (squares, row, col) => {
    for (let i = 0; i < row; i++) {
        const prevCol = squares[i];
        if (prevCol === col) return false;
        if (Math.abs(prevCol - col) === Math.abs(i - row)) return false;
    }
    return true;
  };

  const getValidCols = (squares, row) => {
    const valid = [];
    for (let c = 0; c < size; c++) {
        if (isValid(squares, row, c)) valid.push(c);
    }
    return valid;
  };

  const calculateAgentMoves = useCallback(() => {
    const row = board.findIndex(v => v === null);
    if (row === -1) return null;

    const validCols = getValidCols(board, row);
    if (validCols.length === 0) return { error: "No safe columns remaining in this state.", sorted: [] };

    const scoredMoves = validCols.map(col => {
      const testBoard = [...board];
      testBoard[row] = col;
      // Heuristic: LCV - Pick column that leaves most future rows options
      let score = 0;
      if (row < size - 1) score = getValidCols(testBoard, row + 1).length; 
      return { move: { row, col }, score };
    });

    return topNRandom(scoredMoves, 5);
  }, [board, size]);

  const performAgentMove = useCallback(() => {
    if (!board.includes(null)) { setIsAuto(false); return; }
    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const { row, col } = result.chosen.move;
      setBoard(prev => {
        const next = [...prev];
        next[row] = col;
        return next;
      });
    } else {
      setWarningMsg("AI reached a conflict state. Backtrack needed.");
      setIsAuto(false);
    }
  }, [calculateAgentMoves, board]);

  useEffect(() => {
    if (!board.includes(null) && board.length > 0) setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
  }, [board]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && board.includes(null)) {
      timeout = setTimeout(() => performAgentMove(), 400);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, performAgentMove]);

  const handleCellClick = (row, col) => {
    if (mode === 'agent' || isAuto) return;
    const firstEmptyRow = board.findIndex(v => v === null);
    if (row !== firstEmptyRow) {
        setWarningMsg(`Must place in row ${firstEmptyRow}!`);
        return;
    }
    if (!isValid(board, row, col)) {
        setWarningMsg("Collision! Safe zones only.");
        return;
    }
    setBoard(prev => {
      const next = [...prev];
      next[row] = col;
      return next;
    });
    setAgentLogs(null);
  };

  const resetGame = () => {
    setBoard(Array(size).fill(null));
    setAgentLogs(null);
    setIsAuto(false);
  };

  const undoMove = () => {
    setBoard(prev => {
      const next = [...prev];
      const last = next.findLastIndex(v => v !== null);
      if (last !== -1) next[last] = null;
      return next;
    });
    setAgentLogs(null);
    setIsAuto(false);
  };

  const provideHint = () => {
    const result = calculateAgentMoves();
    if (result && result.chosen) {
        setAgentLogs({ ...result, manualHint: true });
    } else {
        setWarningMsg("No safe moves found in current path.");
    }
  };

  const isComplete = !board.includes(null);
  const statusMsg = isComplete ? 'Alignment Success! (Solved)' : `Symmetry Nodes: ${board.filter(v => v !== null).length}/${size}`;
  const statusType = isComplete ? 'win' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <WarningPopup message={warningMsg} onClose={() => setWarningMsg('')} />
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>N-Queens</h2>
      
      <SessionStats stats={stats} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => setMode('manual')}>Manual</button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>AI Solver</button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '16px', display: 'flex', gap: '10px' }}>
          {[4, 6, 8, 12].map(n => (
            <button key={n} className={`btn ${size === n ? 'btn-secondary' : ''}`} onClick={() => setSize(n)}>{n}x{n}</button>
          ))}
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="board-grid" style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 50px)`, 
        width: `${size * 55}px`, 
        margin: '32px auto',
        padding: '10px',
        gap: '4px',
        justifyContent: 'center'
      }}>
        {Array(size * size).fill(null).map((_, i) => {
          const r = Math.floor(i / size), c = i % size;
          const isQueen = board[r] === c;
          const isCheck = (r + c) % 2 === 0;
          return (
            <button key={i} className="cell" onClick={() => handleCellClick(r, c)} style={{ 
              background: isQueen ? 'rgba(59, 130, 246, 0.2)' : (isCheck ? 'rgba(255,255,255,0.03)' : 'transparent'), 
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)'
            }} disabled={isAuto || mode === 'agent'}>
              {isQueen && <Bot size={28} style={{ color: 'var(--color-link)', filter: 'drop-shadow(0 0 8px var(--color-glow-link))' }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button className="btn" onClick={undoMove}>Backtrack</button>
        <button className="btn btn-secondary" onClick={provideHint}><Lightbulb size={16} /> Hint</button>
        <button className="btn" onClick={resetGame}>Format Matrix</button>
      </div>

      {mode === 'agent' && (
        <AgentLogPanel moveResults={agentLogs} onStep={performAgentMove} onAutoSolve={() => setIsAuto(true)} isAuto={isAuto || isComplete} title="Least Constraining Matrix" />
      )}
    </div>
  );
}
