import React, { useEffect } from 'react';
import { Bot, User, BrainCircuit, Play, FastForward, Info, AlertTriangle } from 'lucide-react';



export function StatusBanner({ status, message }) {
  if (!status) return null;

  let typeClass = '';
  if (status === 'win') typeClass = 'win';
  if (status === 'lose') typeClass = 'lose';
  if (status === 'thinking') typeClass = 'thinking';

  return (
    <div className={`glass-panel status-banner ${typeClass}`} style={{
      textAlign: 'left',
      marginBottom: '20px',
      fontWeight: '600',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      borderLeftWidth: '6px',
      gap: '12px'
    }}>
      {status === 'thinking' ? <BrainCircuit size={20} className="spin" style={{ color: 'var(--color-warning)' }} /> : null}
      <span style={{ fontSize: '1rem', letterSpacing: '0.01em' }}>{message}</span>
    </div>
  );
}

export function SessionStats({ stats }) {
  if (!stats) return null;
  return (
    <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Wins</div>
        <div style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '700' }}>{stats.wins}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Losses</div>
        <div style={{ color: 'var(--color-alert)', fontSize: '1.25rem', fontWeight: '700' }}>{stats.losses}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Draws</div>
        <div style={{ color: 'var(--color-link)', fontSize: '1.25rem', fontWeight: '700' }}>{stats.draws}</div>
      </div>
    </div>
  );
}

// Custom Warning Popup to replace window.alert
export function WarningPopup({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="custom-popup">
      <AlertTriangle size={20} />
      <span>{message}</span>
    </div>
  );
}

export function AgentLogPanel({ moveResults, onStep, onAutoSolve, isAuto, title = "Agent Analysis" }) {
  if (!moveResults) return null;

  const showControls = onStep && onAutoSolve;

  return (
    <div className="glass-panel" style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-main)', fontSize: '1rem', margin: 0 }}>
          <Bot size={20} className={isAuto === 'pva' ? 'spin' : ''} />
          {title}
        </h3>
        {isAuto === 'pva' && <span className="mono" style={{ color: 'var(--color-link)', fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>LIVE_THINKING</span>}
      </div>

      {showControls && !isAuto.toString().includes('pva') && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn" onClick={onStep} disabled={isAuto} title="Calculate and take 1 move">
            <Play size={16} /> Step
          </button>
          <button className="btn btn-primary" onClick={onAutoSolve} disabled={isAuto}>
            <FastForward size={16} /> Auto-Solve
          </button>
        </div>
      )}

      <div style={{
        background: 'rgba(0,0,0,0.4)',
        padding: '16px',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        maxHeight: '220px',
        overflowY: 'auto'
      }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em' }}>AI DECISION MATRIX</div>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const mStr = JSON.stringify(m.move);
          const chosenStr = JSON.stringify(moveResults.chosen?.move);
          const isChosen = mStr === chosenStr;

          let color = 'rgba(255,255,255,0.4)';
          let fontWeight = '400';
          let background = 'transparent';
          if (isChosen) {
            color = '#fff';
            fontWeight = '600';
            background = 'rgba(16, 185, 129, 0.1)';
          }

          return (
            <div key={idx} style={{
              color,
              fontWeight,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 10px',
              fontFamily: 'var(--mono)',
              fontSize: '0.8rem',
              borderRadius: '6px',
              marginBottom: '2px',
              backgroundColor: background,
              border: isChosen ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
            }}>
              <span>{isChosen ? '→ ' : '  '}{mStr}</span>
              <span>{m.score.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ResultModal({ status, reason, onRestart }) {
  if (status !== 'win' && status !== 'lose' && status !== 'draw') return null;

  const config = {
    win: {
      title: "VICTORY ACHIEVED",
      message: reason || "You've successfully mastered this simulation.",
      icon: "🏆",
      color: "#ffca28",
      glow: "rgba(255, 202, 40, 0.3)"
    },
    lose: {
      title: "SIMULATION FAILED",
      message: reason || "The objective was not met. Tactical retreat required.",
      icon: "😢",
      color: "#ff5252",
      glow: "rgba(255, 82, 82, 0.3)"
    },
    draw: {
      title: "STALEMATE",
      message: "An equally matched encounter. Balanced outcome.",
      icon: "🤝",
      color: "#4dabf5",
      glow: "rgba(77, 171, 245, 0.3)"
    }
  };

  const current = config[status];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: '#0f0f0f',
        border: `1px solid ${current.color}40`,
        padding: '60px 40px',
        borderRadius: '32px',
        textAlign: 'center',
        width: '90%',
        maxWidth: '450px',
        boxShadow: `0 30px 100px ${current.glow}`,
        animation: 'modalSlideUp 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: `radial-gradient(circle, ${current.color}20 0%, transparent 50%)`,
          animation: 'rotateGlow 10s linear infinite'
        }} />

        <div style={{ fontSize: '90px', marginBottom: '32px', filter: `drop-shadow(0 0 20px ${current.color})`, animation: 'bounceIcon 2s ease-in-out infinite' }}>
          {current.icon}
        </div>

        <h2 className="arcade-title" style={{ color: current.color, fontSize: '2.2rem', marginBottom: '16px', letterSpacing: '0.05em' }}>
          {current.title}
        </h2>

        <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6', fontWeight: 500 }}>
          {current.message}
        </p>

        <button
          className="btn btn-primary"
          onClick={onRestart}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '1.1rem',
            background: current.color,
            borderColor: current.color,
            color: '#000',
            fontWeight: '700',
            boxShadow: `0 10px 30px ${current.color}40`
          }}
        >
          {status === 'win' ? 'ENTER NEXT LEVEL' : 'RETRY SIMULATION'}
        </button>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalSlideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          @keyframes rotateGlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes bounceIcon { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.05); } }
        `}} />
      </div>
    </div>
  );
}
