import type { FC } from 'react';
import { Compass } from 'lucide-react';
import type { TradingSession } from '../types';

interface SessionSelectorProps {
  session: TradingSession;
  setSession: (val: TradingSession) => void;
}

export const SessionSelector: FC<SessionSelectorProps> = ({ session, setSession }) => {
  const sessions: { value: TradingSession; label: string; time: string }[] = [
    { value: 'Asia', label: 'Asia', time: '00:00 - 09:00 UTC' },
    { value: 'London', label: 'London', time: '08:00 - 17:00 UTC' },
    { value: 'New York', label: 'New York', time: '13:00 - 22:00 UTC' },
  ];

  return (
    <div className="glass-card p-5" id="session-selector">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <Compass size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Trading Session
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Select the current active trading window
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {sessions.map((s) => {
          const isActive = session === s.value;
          return (
            <button
              key={s.value}
              onClick={() => setSession(isActive ? '' : s.value)}
              className="p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
              style={{
                background: isActive ? 'var(--checkbox-checked-bg)' : 'var(--bg-elevated)',
                border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border-primary)'}`,
                boxShadow: isActive ? '0 0 10px rgba(37, 99, 235, 0.1)' : 'none',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                {s.label}
              </span>
              <span className="text-[8px] mt-1 text-center leading-none" style={{ color: 'var(--text-muted)' }}>
                {s.time}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
