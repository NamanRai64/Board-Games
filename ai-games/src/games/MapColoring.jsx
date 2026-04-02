import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, WarningPopup } from '../components';

const LEVELS = {
  easy: {
    nodes: [
      { id: 0, x: 100, y: 50, label: 'A' },
      { id: 1, x: 250, y: 50, label: 'B' },
      { id: 2, x: 175, y: 150, label: 'C' },
      { id: 3, x: 50, y: 250, label: 'D' },
      { id: 4, x: 300, y: 250, label: 'E' },
    ],
    edges: [[0, 1], [0, 2], [1, 2], [0, 3], [2, 3], [2, 4], [1, 4], [3, 4]]
  },
  medium: {
    nodes: [
        { id: 0, x: 175, y: 30, label: '0' },
        { id: 1, x: 50, y: 100, label: '1' },
        { id: 2, x: 300, y: 100, label: '2' },
        { id: 3, x: 110, y: 180, label: '3' },
        { id: 4, x: 240, y: 180, label: '4' },
        { id: 5, x: 50, y: 260, label: '5' },
        { id: 6, x: 300, y: 260, label: '6' },
        { id: 7, x: 175, y: 260, label: '7' },
    ],
    edges: [[0,1], [0,2], [1,3], [2,4], [3,4], [3,5], [4,6], [5,7], [6,7], [1,5]]
  },
  hard: {
    nodes: [
        { id: 0, x: 175, y: 30, label: 'A' },
        { id: 1, x: 80, y: 70, label: 'B' },
        { id: 2, x: 270, y: 70, label: 'C' },
        { id: 3, x: 40, y: 150, label: 'D' },
        { id: 4, x: 310, y: 150, label: 'E' },
        { id: 5, x: 110, y: 150, label: 'F' },
        { id: 6, x: 240, y: 150, label: 'G' },
        { id: 7, x: 175, y: 210, label: 'H' },
        { id: 8, x: 80, y: 260, label: 'I' },
        { id: 9, x: 270, y: 260, label: 'J' },
        { id: 10, x: 175, y: 130, label: 'K' },
        { id: 11, x: 175, y: 280, label: 'L' }
    ],
    edges: [[0,1], [0,2], [1,3], [2,4], [3,8], [4,9], [1,5], [2,6], [5,6], [5,7], [6,7], [7,8], [7,9], [5,10], [6,10], [8,11], [9,11]]
  }
};

const COLORS = ['#58a6ff', '#238636', '#da3633', '#d29922']; // blue, green, red, yellow

export default function MapColoring() {
  const [level, setLevel] = useState('easy');
  const { nodes, edges } = LEVELS[level];
  const [board, setBoard] = useState(Array(LEVELS[level].nodes.length).fill(null)); 
  const [isP1Next, setIsP1Next] = useState(true);
  const [mode, setMode] = useState('2player'); // '2player', 'pva', 'agent'
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');

  const getNeighbors = useCallback((nId) => {
    return edges.filter(e => e.includes(nId)).map(e => e[0] === nId ? e[1] : e[0]);
  }, [edges]);

  const getValidColors = useCallback((currentBoard, nId) => {
    const neighbors = getNeighbors(nId);
    const usedColors = neighbors.map(neighborId => currentBoard[neighborId]).filter(c => c !== null);
    return [0, 1, 2, 3].filter(c => !usedColors.includes(c)); 
  }, [getNeighbors]);

  const countOptionsForNeighbor = useCallback((currentBoard, neighborId) => {
    return getValidColors(currentBoard, neighborId).length;
  }, [getValidColors]);

  const calculateAgentMoves = useCallback(() => {
    const uncolored = board.findIndex(c => c === null);
    if (uncolored === -1) return null; 

    const validColorsForNode = getValidColors(board, uncolored);
    if (validColorsForNode.length === 0) return null; 

    const scoredMoves = validColorsForNode.map(colorIdx => {
      const tempBoard = [...board];
      tempBoard[uncolored] = colorIdx;
      let score = 0;
      const neighbors = getNeighbors(uncolored);
      for (const nb of neighbors) {
        if (tempBoard[nb] === null) {
          score += countOptionsForNeighbor(tempBoard, nb);
        }
      }
      return { move: { node: uncolored, color: colorIdx }, score };
    });

    return topNRandom(scoredMoves, 5);
  }, [board, getNeighbors, getValidColors, countOptionsForNeighbor]);

  const performAgentMove = useCallback(() => {
    if (!board.includes(null)) {
      setIsAuto(false);
      return;
    }

    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const { node, color } = result.chosen.move;
      setBoard(prev => {
        const next = [...prev];
        next[node] = color;
        return next;
      });
      setIsP1Next(prev => !prev);
    } else {
      setAgentLogs({ error: "Dead End reached. No valid colors.", sorted: [] });
      setIsAuto(false);
    }
  }, [calculateAgentMoves, board]);

  const resetGame = useCallback(() => {
    setBoard(Array(LEVELS[level].nodes.length).fill(null));
    setIsP1Next(true);
    setAgentLogs(null);
    setIsAuto(false);
    setSelectedNode(null);
  }, [level]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // PVA Logic: Automatic agent turn
  useEffect(() => {
    if (mode === 'pva' && !isP1Next && board.includes(null)) {
      const timeout = setTimeout(() => performAgentMove(), 600);
      return () => clearTimeout(timeout);
    }
  }, [mode, isP1Next, board, performAgentMove]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && board.includes(null)) {
      timeout = setTimeout(() => performAgentMove(), 600);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, performAgentMove]);

  const handleNodeClick = (nId) => {
    if (mode === 'agent' || isAuto || (mode === 'pva' && !isP1Next)) return;
    if (board[nId] !== null) return; 
    setSelectedNode(nId);
  };

  const selectColor = (colorIdx) => {
    if (selectedNode === null) return;
    const valid = getValidColors(board, selectedNode);
    if (!valid.includes(colorIdx)) {
      setWarningMsg("Invalid color! Neighbor uses this already.");
      return;
    }

    setBoard(prev => {
      const next = [...prev];
      next[selectedNode] = colorIdx;
      return next;
    });
    setIsP1Next(prev => !prev);
    setSelectedNode(null);
    setAgentLogs(null);
  };

  const isComplete = !board.includes(null);
  let hasDeadEnd = false;
  if (!isComplete && board.some((val, idx) => val === null && getValidColors(board, idx).length === 0)) {
    hasDeadEnd = true;
  }

  let statusMsg = isComplete ? 'Map Colored Successfully!' :
                  hasDeadEnd ? 'Dead End! Cannot finish.' :
                  `Turn: Player ${isP1Next ? '1' : '2'}`;
  let statusType = isComplete ? 'win' : hasDeadEnd ? 'lose' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <WarningPopup message={warningMsg} onClose={() => setWarningMsg('')} />
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: '24px', textAlign: 'center' }}>Map Coloring (CSP)</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${mode === '2player' ? 'btn-primary' : ''}`} onClick={() => setMode('2player')}>PvP</button>
          <button className={`btn ${mode === 'pva' ? 'btn-primary' : ''}`} onClick={() => setMode('pva')}>vs Agent</button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>Solver</button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-panel-border)', paddingLeft: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Level:</span>
          {['easy', 'medium', 'hard'].map(l => (
             <button key={l} className={`btn ${level === l ? 'btn-secondary' : ''}`} onClick={() => setLevel(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ position: 'relative', width: '400px', height: '350px', margin: '40px auto', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-panel-border)', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {edges.map((edge, idx) => {
            const A = nodes[edge[0]];
            const B = nodes[edge[1]];
            return <line key={idx} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--color-panel-border)" strokeWidth="2" />;
          })}
        </svg>

        {nodes.map(n => {
          const isSelected = selectedNode === n.id;
          const bg = board[n.id] !== null ? COLORS[board[n.id]] : 'var(--color-bg)';
          const clickable = (board[n.id] === null && (mode === '2player' || (mode === 'pva' && isP1Next)));
          return (
            <div 
              key={n.id}
              onClick={() => handleNodeClick(n.id)}
              style={{
                position: 'absolute',
                left: n.x - 18, top: n.y - 18,
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: bg,
                border: isSelected ? '2px solid var(--color-link)' : '1px solid var(--color-panel-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: clickable ? 'pointer' : 'default',
                color: board[n.id] !== null ? '#fff' : 'var(--color-text-main)',
                fontWeight: 'bold', zIndex: 10,
                fontSize: '12px'
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>

      {(mode === '2player' || mode === 'pva') && selectedNode !== null && (
        <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '24px', backgroundColor: 'var(--color-bg)' }}>
          <h4 style={{ marginBottom: '12px' }}>Choose a color for Region {nodes[selectedNode].label}</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {COLORS.map((c, idx) => {
              const isValid = getValidColors(board, selectedNode).includes(idx);
              return (
                <button 
                  key={idx} 
                  style={{ width: '32px', height: '32px', background: c, borderRadius: '50%', opacity: isValid ? 1 : 0.15, cursor: isValid ? 'pointer' : 'not-allowed', border: isSelected ? '2px solid #fff' : 'none' }}
                  onClick={() => selectColor(idx)}
                  disabled={!isValid}
                />
              );
            })}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn" onClick={resetGame}>Restart Game</button>
      </div>

      <div style={{ width: '100%' }}>
        {(mode === 'agent' || mode === 'pva' || (mode === '2player' && agentLogs)) && (
          <AgentLogPanel 
            moveResults={agentLogs} 
            onStep={performAgentMove} 
            onAutoSolve={() => setIsAuto(true)} 
            isAuto={isAuto || isComplete || hasDeadEnd || mode === 'pva'}
          />
        )}
      </div>
    </div>
  );
}
