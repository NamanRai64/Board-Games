import React, { useState, useEffect, useCallback } from 'react';
import { AgentLogPanel, StatusBanner, SessionStats, ResultModal } from '../components';
import { Ship, User, Skull, Info, Waves } from 'lucide-react';

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

  const calculateAgentMove = useCallback(() => {
    const possible = [[1,0],[2,0],[0,1],[0,2],[1,1]];
    const scored = [];
    const side = state.boat;
    for (let [m, c] of possible) {
      const mult = side === 'left' ? -1 : 1;
      const ns = { ml: state.ml + mult * m, cl: state.cl + mult * c, mr: state.mr - mult * m, cr: state.cr - mult * c, boat: side === 'left' ? 'right' : 'left' };
      if (ns.ml >= 0 && ns.cl >= 0 && ns.mr >= 0 && ns.cr >= 0) {
        let score = (ns.mr + ns.cr);
        if (isInvalid(ns)) score = -100;
        scored.push({ move: { m, c }, score });
      }
    }
    scored.sort((a,b) => b.score - a.score);
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
      setState(s => ({ ml: s.ml + mult * m, cl: s.cl + mult * c, mr: s.mr - mult * m, cr: s.cr - mult * c, boat: nextWay }));
    } else { setStatus('lose'); setIsAuto(false); }
  }, [calculateAgentMove, status, state.boat]);

  useEffect(() => {
    let t; if (isAuto && status === 'playing') t = setTimeout(performAgentMove, 2000); // Slower AI
    return () => clearTimeout(t);
  }, [isAuto, status, performAgentMove]);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 className="arcade-title" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2.5rem' }}>River Crossing</h2>
      <SessionStats stats={stats} />
      <StatusBanner status={status === 'win' ? 'win' : status === 'lose' ? 'lose' : 'thinking'} message={status === 'win' ? 'All souls preserved!' : status === 'lose' ? 'The Balance is broken. Game Over.' : `River Crossing: ${state.boat.toUpperCase()} Side`} />

      <div className="glass-panel" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '320px', padding: '0', marginBottom: '32px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(to right, #060b14 0%, #0c1421 25%, #1e3a5f 40%, #1e3a5f 60%, #0c1421 75%, #060b14 100%)'
      }}>
        {/* Animated Water Background */}
        <div style={{ position: 'absolute', left: '25%', right: '25%', top: 0, bottom: 0, background: 'rgba(59, 130, 246, 0.1)', borderLeft: '2px solid rgba(255,255,255,0.05)', borderRight: '2px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
           <div className="water-waves" style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
             <Waves size={200} style={{ position: 'absolute', top: '10%' }} className="floating" />
             <Waves size={200} style={{ position: 'absolute', bottom: '10%', right: 0 }} className="floating-slow" />
           </div>
        </div>
        
        {/* Banks */}
        <div style={{ flex: 1, zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {Array(state.ml).fill(0).map((_, i) => <User key={i} size={28} style={{ color: 'var(--color-link)', filter: 'drop-shadow(0 0 8px var(--color-glow-link))' }} />)}
            {Array(state.cl).fill(0).map((_, i) => <Skull key={i} size={28} style={{ color: 'var(--color-alert)', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.4))' }} />)}
          </div>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.2em' }}>WEST BANK</div>
        </div>

        <div style={{ width: '40%', height: '100%', display: 'flex', justifyContent: state.boat === 'left' ? 'flex-start' : 'flex-end', padding: '0 40px', alignItems: 'center', zIndex: 2, transition: 'all 2.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)' }}>
            <Ship size={64} style={{ color: 'var(--color-warning)', filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.6))' }} className="floating" />
        </div>

        <div style={{ flex: 1, zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
             {Array(state.mr).fill(0).map((_, i) => <User key={i} size={28} style={{ color: 'var(--color-link)' }} />)}
             {Array(state.cr).fill(0).map((_, i) => <Skull key={i} size={28} style={{ color: 'var(--color-alert)' }} />)}
          </div>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.2em' }}>EAST BANK</div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        {status === 'playing' && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => move(1, 0)}>+1 User</button>
            <button className="btn" onClick={() => move(2, 0)}>+2 Users</button>
            <button className="btn" onClick={() => move(0, 1)}>+1 Skull</button>
            <button className="btn" onClick={() => move(0, 2)}>+2 Skulls</button>
            <button className="btn" onClick={() => move(1, 1)}>1 User + 1 Skull</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
           <button className="btn btn-secondary" onClick={() => setIsAuto(!isAuto)}>{isAuto ? 'Pause Drive' : 'Engage Automated Search'}</button>
           <button className="btn" onClick={() => setState({ ml: 3, cl: 3, mr: 0, cr: 0, boat: 'left' })}>Reset Simulator</button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .floating { animation: float 3s ease-in-out infinite; }
        .floating-slow { animation: float 5s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}} />
      <ResultModal 
        status={status} 
        reason={status === 'win' ? "All travelers have reached the safety of the East Bank." : "The balance of powers was lost. The mission has failed."}
        onRestart={() => { setState({ ml: 3, cl: 3, mr: 0, cr: 0, boat: 'left' }); setStatus('playing'); setIsAuto(false); }}
      />
    </div>
  );
}
