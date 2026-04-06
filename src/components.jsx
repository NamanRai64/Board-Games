import React, { useEffect } from 'react';
import { Bot, User, BrainCircuit, Play, FastForward, Info, AlertTriangle } from 'lucide-react';



export function StatusBanner({ status, message }) {
  if (!status) return null;
  return (
    <div className={`status-text ${status}`} style={{ marginBottom: '16px' }}>
      {message} {status === 'thinking' && '...'}
    </div>
  );
}

export function SessionStats({ stats }) {
  if (!stats) return null;
  return (
    <div className="mono" style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
      <span>W: <span style={{ color: 'var(--color-primary)' }}>{stats.wins}</span></span>
      <span>L: <span style={{ color: 'var(--color-alert)' }}>{stats.losses}</span></span>
      <span>D: <span style={{ color: 'var(--color-link)' }}>{stats.draws}</span></span>
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
    <div style={{ padding: '8px', border: '1px solid var(--color-warning)', color: 'var(--color-warning)', fontSize: '0.85rem', marginBottom: '16px' }}>
      {message}
    </div>
  );
}

export function AgentLogPanel({ moveResults, isAuto, title = "Agent Analysis" }) {
  if (!moveResults) return null;

  return (
    <div className="terminal-panel" style={{ marginTop: '24px' }}>
      <div className="terminal-header">
        {title.toUpperCase()} {isAuto === 'pva' && <span style={{ color: 'var(--color-warning)' }}>[THINKING...]</span>}
      </div>

      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const mStr = JSON.stringify(m.move);
          const chosenStr = JSON.stringify(moveResults.chosen?.move);
          const isChosen = mStr === chosenStr;

          return (
            <div key={idx} className={`terminal-row ${isChosen ? 'chosen' : ''}`}>
              <span>{isChosen ? '> ' : '  '}{mStr}</span>
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

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.85)'
    }}>
      <div style={{
        background: '#000',
        border: '1px solid var(--color-border)',
        padding: '32px',
        textAlign: 'center',
        width: '90%',
        maxWidth: '400px'
      }}>

        <h2 className="mono" style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>
          [{status.toUpperCase()}]
        </h2>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          {reason}
        </p>

        <button
          className="btn"
          onClick={onRestart}
          style={{ width: '100%' }}
        >
          RESET
        </button>
      </div>
    </div>
  );
}
