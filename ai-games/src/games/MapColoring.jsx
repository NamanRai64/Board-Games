import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, WarningPopup, SessionStats, ResultModal } from '../components';
import MAP_LEVELS from './mapLevels';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b']; // blue, emerald, rose, amber

export default function MapColoring() {
  const [level, setLevel] = useState('easy');
  const [currentLevelData, setCurrentLevelData] = useState(MAP_LEVELS.easy[0]);
  const { nodes, edges } = currentLevelData;
  const [board, setBoard] = useState(Array(nodes.length).fill(null)); 
  const [isP1Next, setIsP1Next] = useState(true);
  const [mode, setMode] = useState('2player'); 
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

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
    if (!board.includes(null)) { setIsAuto(false); return; }
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
      setAgentLogs({ error: "Dead End reached. Potential Conflict.", sorted: [] });
      setIsAuto(false);
    }
  }, [calculateAgentMoves, board]);

  const resetGame = useCallback(() => {
    const sets = MAP_LEVELS[level];
    const randIdx = Math.floor(Math.random() * sets.length);
    const newLevelData = sets[randIdx];
    setCurrentLevelData(newLevelData);
    setBoard(Array(newLevelData.nodes.length).fill(null));
    setIsP1Next(true);
    setAgentLogs(null);
    setIsAuto(false);
    setSelectedNode(null);
  }, [level]);

  useEffect(() => { resetGame(); }, [level]);

  useEffect(() => {
    if (!board.includes(null) && board.length > 0) setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
  }, [board]);

  useEffect(() => {
    if (mode === 'pva' && !isP1Next && board.includes(null)) {
      const timeout = setTimeout(() => performAgentMove(), 600);
      return () => clearTimeout(timeout);
    }
  }, [mode, isP1Next, board, performAgentMove]);

  useEffect(() => {
    let t;
    if (mode === 'agent' && isAuto && board.includes(null)) t = setTimeout(() => performAgentMove(), 600);
    return () => clearTimeout(t);
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
      setWarningMsg("Collision Alert! Neighbor uses this frequency.");
      return;
    }
    setBoard(prev => {
      const next = [...prev];
      next[selectedNode] = colorIdx;
      return next;
    });
    setIsP1Next(prev => !prev);
    setSelectedNode(null);
  };

  const isComplete = !board.includes(null);
  const hasDeadEnd = !isComplete && board.some((val, idx) => val === null && getValidColors(board, idx).length === 0);

  const statusMsg = isComplete ? 'Matrix Harmonized! (Solved)' : hasDeadEnd ? 'System Critical: Conflict State' : `Turn: Player ${isP1Next ? '1' : '2'}`;
  const statusType = isComplete ? 'win' : hasDeadEnd ? 'lose' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <WarningPopup message={warningMsg} onClose={() => setWarningMsg('')} />
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>Map Coloring</h2>
      
      <SessionStats stats={stats} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${mode === '2player' ? 'btn-primary' : ''}`} onClick={() => setMode('2player')}>PvP</button>
          <button className={`btn ${mode === 'pva' ? 'btn-primary' : ''}`} onClick={() => setMode('pva')}>vs Agent</button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>Solver</button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '16px', display: 'flex', gap: '10px' }}>
          {['easy', 'medium', 'hard'].map(l => <button key={l} className={`btn ${level === l ? 'btn-secondary' : ''}`} onClick={() => setLevel(l)}>{l.toUpperCase()}</button>)}
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="glass-panel" style={{ 
        position: 'relative', 
        width: '350px', 
        height: '340px', 
        margin: '40px auto', 
        overflow: 'hidden', 
        padding: 0,
        background: 'rgba(0,0,0,0.2)'
      }}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {edges.map((edge, idx) => {
            const A = nodes[edge[0]], B = nodes[edge[1]];
            return <line key={idx} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--color-border)" strokeWidth="2" strokeOpacity="0.4" />;
          })}
        </svg>
        {nodes.map(n => {
          const isSelected = selectedNode === n.id;
          const bg = board[n.id] !== null ? COLORS[board[n.id]] : 'rgba(255,255,255,0.03)';
          const active = (board[n.id] === null && (mode === '2player' || (mode === 'pva' && isP1Next)));
          return (
            <div key={n.id} onClick={() => handleNodeClick(n.id)} style={{ position: 'absolute', left: n.x - 20, top: n.y - 20, width: '40px', height: '40px', borderRadius: '50%', background: bg, border: isSelected ? '2px solid var(--color-link)' : '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: active ? 'pointer' : 'default', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 10, boxShadow: board[n.id] !== null ? `0 0 15px ${bg}88` : 'none' }}>
              <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: board[n.id] !== null ? '#fff' : 'var(--color-text-muted)' }}>{n.label}</span>
            </div>
          );
        })}
      </div>

      {(mode === '2player' || mode === 'pva') && selectedNode !== null && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Harmonize Region {nodes[selectedNode].label}</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {COLORS.map((c, idx) => {
              const valid = getValidColors(board, selectedNode).includes(idx);
              return <button key={idx} style={{ width: '42px', height: '42px', background: c, borderRadius: '50%', opacity: valid ? 1 : 0.1, cursor: valid ? 'pointer' : 'not-allowed', border: 'none', boxShadow: valid ? `0 0 10px ${c}55` : 'none' }} className={valid ? 'color-dot-active' : ''} onClick={() => selectColor(idx)} disabled={!valid} />;
            })}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button className="btn" style={{ padding: '12px 32px' }} onClick={resetGame}>Restart Session</button>
      </div>

      {(mode === 'agent' || mode === 'pva') && (
        <AgentLogPanel moveResults={agentLogs} onStep={performAgentMove} onAutoSolve={() => setIsAuto(true)} isAuto={mode === 'pva' ? 'pva' : isAuto || isComplete || hasDeadEnd} title="Constraint Propagation Log" />
      )}
      <ResultModal 
        status={isComplete ? 'win' : hasDeadEnd ? 'lose' : null} 
        reason={isComplete ? "All regions have been harmonized without conflict." : "A frequency collision has occurred. The matrix is unstable."}
        onRestart={resetGame}
      />
    </div>
  );
}
