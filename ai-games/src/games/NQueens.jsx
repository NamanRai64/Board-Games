import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, WarningPopup } from '../components';
import { MousePointer2, Bot, Lightbulb } from 'lucide-react';

export default function NQueens() {
  const [size, setSize] = useState(8);
  const [board, setBoard] = useState([]); // Array of column indices for each row
  const [mode, setMode] = useState('manual'); 
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [hintCol, setHintCol] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');

  const isSafe = (testBoard, row, col) => {
    for (let r = 0; r < row; r++) {
      const c = testBoard[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
        return false;
      }
    }
    return true;
  };

  const getValidCols = (currentBoard, row) => {
    const valid = [];
    for (let c = 0; c < size; c++) {
      if (isSafe(currentBoard, row, c)) valid.push(c);
    }
    return valid;
  };

  const computeScore = (currentBoard, row, col) => {
    if (row === size - 1) return 100; // Winning move
    const testBoard = [...currentBoard, col];
    return getValidCols(testBoard, row + 1).length; 
  };

  const calculateAgentMoves = useCallback(() => {
    const currentRow = board.length;
    if (currentRow >= size) return null;

    const validCols = getValidCols(board, currentRow);
    const scoredMoves = validCols.map(col => ({
      move: col, 
      score: computeScore(board, currentRow, col)
    }));

    return topNRandom(scoredMoves, 5);
  }, [board, size]);

  const performAgentMove = useCallback(() => {
    if (board.length >= size) {
      setIsAuto(false);
      return;
    }

    const result = calculateAgentMoves();
    if (result && result.chosen) {
      console.log(`N-Queens agent chose column ${result.chosen.move} for row ${board.length}`);
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      setBoard(prev => [...prev, result.chosen.move]);
      setHintCol(null);
    } else {
      console.log("N-Queens agent hit dead end");
      setAgentLogs({ error: "Dead End reached. No valid moves.", sorted: [] });
      setIsAuto(false);
    }
  }, [board, size, calculateAgentMoves]);

  const provideHint = () => {
    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      setHintCol(result.chosen.move);
    } else {
      setAgentLogs({ error: "No valid moves from here.", sorted: [] });
    }
  };

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && board.length < size) {
      timeout = setTimeout(() => {
        performAgentMove();
      }, 400);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board.length, size, performAgentMove]);

  const handleCellClick = (row, col) => {
    if (mode === 'agent' || isAuto || board.length !== row) return; 
    
    if (isSafe(board, row, col)) {
      setBoard([...board, col]);
      setHintCol(null);
      setAgentLogs(null);
    } else {
      setWarningMsg("Invalid placement! Conflict detected.");
    }
  };

  const undoMove = () => {
    if (board.length > 0) {
      setBoard(board.slice(0, -1));
      setHintCol(null);
      setAgentLogs(null);
    }
  };

  const resetGame = () => {
    setBoard([]);
    setAgentLogs(null);
    setIsAuto(false);
    setHintCol(null);
  };

  const isSolved = board.length === size;
  const isDeadEnd = !isSolved && getValidCols(board, board.length).length === 0;
  
  let statusMsg = isSolved ? 'All Queens Placed Successfully!' : 
                  isDeadEnd ? 'Dead End! Must Undo.' : 
                  `Placing Queen for Row ${board.length + 1}`;
  let statusType = isSolved ? 'win' : isDeadEnd ? 'lose' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <WarningPopup message={warningMsg} onClose={() => setWarningMsg('')} />
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: '24px', textAlign: 'center' }}>N-Queens</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`} onClick={() => { setMode('manual'); setIsAuto(false); }}>
            Manual
          </button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
             Agent
          </button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-panel-border)', paddingLeft: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Size (N):</span>
          {[4, 6, 8, 10, 12].map(n => (
             <button key={n} className={`btn ${size === n ? 'btn-secondary' : ''}`} onClick={() => { setSize(n); resetGame(); }}>{n}</button>
          ))}
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${size}, minmax(30px, 40px))`, 
        gap: '2px',
        justifyContent: 'center',
        margin: '24px 0',
        backgroundColor: 'var(--color-panel-border)',
        padding: '2px',
        borderRadius: '6px',
        overflowX: 'auto'
      }}>
        {Array.from({ length: size }).map((_, r) => (
          Array.from({ length: size }).map((__, c) => {
            const isPlaced = board[r] === c;
            const isClickableRow = mode === 'manual' && r === board.length;
            const isHint = hintCol !== null && isClickableRow && c === hintCol;
            const isDark = (r + c) % 2 === 1;
            const cellSize = size > 8 ? '30px' : '40px';

            return (
              <button 
                key={`${r}-${c}`}
                style={{ 
                  width: cellSize, height: cellSize,
                  backgroundColor: isPlaced ? 'var(--color-primary)' : 
                                   isHint ? 'rgba(210, 153, 34, 0.4)' : 
                                   isDark ? 'var(--color-bg)' : 'var(--color-panel)',
                  border: isHint ? '2px solid var(--color-warning)' : '1px solid transparent',
                  cursor: isClickableRow ? 'pointer' : 'default',
                  color: isPlaced ? '#fff' : 'var(--color-link)',
                  fontWeight: 'bold',
                  fontSize: size > 8 ? '14px' : '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '2px'
                }}
                onClick={() => handleCellClick(r, c)}
                disabled={!isClickableRow}
              >
                {isPlaced ? '♛' : null}
              </button>
            )
          })
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', gap: '8px', display: 'flex', justifyContent: 'center' }}>
        <button className="btn" onClick={resetGame}>Restart</button>
        {mode === 'manual' && board.length > 0 && <button className="btn" onClick={undoMove}>Undo</button>}
        {mode === 'manual' && !isSolved && !isDeadEnd && (
          <button className="btn btn-secondary" style={{ color: 'var(--color-warning)' }} onClick={provideHint}>
            Hint
          </button>
        )}
      </div>

      {(mode === 'agent' || (mode === 'manual' && agentLogs)) && (
        <AgentLogPanel 
          moveResults={agentLogs} 
          onStep={performAgentMove} 
          onAutoSolve={() => setIsAuto(true)} 
          isAuto={isAuto || isSolved || isDeadEnd}
        />
      )}
    </div>
  );
}
