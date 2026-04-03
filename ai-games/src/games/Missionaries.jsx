import React, { useState, useEffect, useCallback } from 'react';
import { AgentLogPanel, StatusBanner, SessionStats } from '../components';
import { Ship, User, Skull } from 'lucide-react';

export default function Missionaries() {
  const [state, setState] = useState({ ml: 3, cl: 3, mr: 0, cr: 0, boat: 'left' });
  const [status, setStatus] = useState('playing');
  const [log, setLog] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const isInvalid = (s) => {
    if ((s.cl > s.ml && s.ml > 0) || (s.cr > s.mr && s.mr > 0)) return true;
    return false;
  };

  const checkStatus = useCallback((s) => {
    if (s.mr === 3 && s.cr === 3) return 'win';
    if (isInvalid(s)) return 'lose';
    return 'playing';
  }, []);

  useEffect(() => {
    const res = checkStatus(state);
    if (res !== 'playing') {
      setStatus(res);
      if (res === 'win') setStats(p => ({ ...p, wins: p.wins + 1 }));
      else setStats(p => ({ ...p, losses: p.losses + 1 }));
    }
  }, [state, checkStatus]);

  const move = (m, c) => {
    if (status !== 'playing' || isAuto) return;
    const nextWay = state.boat === 'left' ? 'right' : 'left';
    const mult = state.boat === 'left' ? -1 : 1;
    const newState = {
      ml: state.ml + mult * m,
      cl: state.cl + mult * c,
      mr: state.mr - mult * m,
      cr: state.cr - mult * c,
      boat: nextWay
    };
    if (newState.ml < 0 || newState.cl < 0 || newState.mr < 0 || newState.cr < 0) return;
    setHistory([...history, state]);
    setState(newState);
  };

  const getHeuristic = (s) => (s.mr + s.cr); // Higher is better

  const calculateAgentMove = useCallback(() => {
    const possible = [
      [1, 0], [2, 0], [0, 1], [0, 2], [1, 1]
    ];
    const scored = [];
    const side = state.boat;
    
    for (let [m, c] of possible) {
      const mult = side === 'left' ? -1 : 1;
      const ns = {
        ml: state.ml + mult * m,
        cl: state.cl + mult * c,
        mr: state.mr - mult * m,
        cr: state.cr - mult * c,
        boat: side === 'left' ? 'right' : 'left'
      };
      if (ns.ml >= 0 && ns.cl >= 0 && ns.mr >= 0 && ns.cr >= 0) {
        let score = getHeuristic(ns);
        if (isInvalid(ns)) score = -100;
        scored.push({ move: { m, c }, score });
      }
    }
    
    scored.sort((a, b) => b.score - a.score);
    return { chosen: scored[0], sorted: scored };
  }, [state]);

  const performAgentMove = useCallback(() => {
    if (status !== 'playing') return;
    const res = calculateAgentMove();
    if (res.chosen && res.chosen.score > -50) {
      setLog(res);
      const { m, c } = res.chosen.move;
      const nextWay = state.boat === 'left' ? 'right' : 'left';
      const mult = state.boat === 'left' ? -1 : 1;
      setState(s => ({
        ml: s.ml + mult * m,
        cl: s.cl + mult * c,
        mr: s.mr - mult * m,
        cr: s.cr - mult * c,
        boat: nextWay
      }));
    } else {
      setStatus('lose');
      setIsAuto(false);
    }
  }, [calculateAgentMove, status, state.boat]);

  useEffect(() => {
    let t;
    if (isAuto && status === 'playing') t = setTimeout(performAgentMove, 1000);
    return () => clearTimeout(t);
  }, [isAuto, status, performAgentMove]);

  const reset = () => {
    setState({ ml: 3, cl: 3, mr: 0, cr: 0, boat: 'left' });
    setStatus('playing');
    setHistory([]);
    setLog(null);
    setIsAuto(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>Missionaries & Cannibals</h2>
      <SessionStats stats={stats} />
      
      <StatusBanner 
        status={status === 'win' ? 'win' : status === 'lose' ? 'lose' : 'thinking'} 
        message={status === 'win' ? 'All souls preserved!' : status === 'lose' ? 'The Balance is broken. Game Over.' : `River Crossing: ${state.boat.toUpperCase()} Side`} 
      />

      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '240px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        {/* River */}
        <div style={{ position: 'absolute', left: '30%', right: '30%', top: 0, bottom: 0, background: 'rgba(59, 130, 246, 0.05)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', zIndex: 0 }} />
        
        {/* Left Side */}
        <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array(state.ml).fill(0).map((_, i) => <User key={i} size={24} style={{ color: 'var(--color-link)' }} />)}
            {Array(state.cl).fill(0).map((_, i) => <Skull key={i} size={24} style={{ color: 'var(--color-alert)' }} />)}
          </div>
          <div className="mono" style={{ fontSize: '0.7rem', marginTop: '10px' }}>WEST BANK</div>
        </div>

        {/* Boat Area */}
        <div style={{ width: '40%', display: 'flex', justifyContent: state.boat === 'left' ? 'flex-start' : 'flex-end', padding: '0 20px', zIndex: 2, transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <Ship size={48} style={{ color: 'var(--color-warning)', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))' }} />
        </div>

        {/* Right Side */}
        <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
             {Array(state.mr).fill(0).map((_, i) => <User key={i} size={24} style={{ color: 'var(--color-link)' }} />)}
             {Array(state.cr).fill(0).map((_, i) => <Skull key={i} size={24} style={{ color: 'var(--color-alert)' }} />)}
          </div>
          <div className="mono" style={{ fontSize: '0.7rem', marginTop: '10px' }}>EAST BANK</div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        {status === 'playing' && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => move(1, 0)}>1 Missionary</button>
            <button className="btn" onClick={() => move(2, 0)}>2 Missionaries</button>
            <button className="btn" onClick={() => move(0, 1)}>1 Cannibal</button>
            <button className="btn" onClick={() => move(0, 2)}>2 Cannibals</button>
            <button className="btn" onClick={() => move(1, 1)}>1 of Each</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
           <button className="btn btn-secondary" onClick={() => setIsAuto(!isAuto)}>{isAuto ? 'Pause AI' : 'Solve with AI'}</button>
           <button className="btn" onClick={reset}>Reset Timeline</button>
        </div>
      </div>

      <AgentLogPanel moveResults={log} isAuto={isAuto} title="State Space Heuristic Log" />
    </div>
  );
}
