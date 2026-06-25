import type { FC } from 'react';
import { Compass, Crosshair } from 'lucide-react';
import type { ExecutionModel, ExecutionParamsState, TradingSession } from '../types';

interface ExecutionParamsProps {
  params: ExecutionParamsState;
  setParams: (val: ExecutionParamsState) => void;
  session: TradingSession;
  setSession: (val: TradingSession) => void;
}

const sessions: { value: TradingSession; label: string; time: string }[] = [
  { value: '', label: 'Select session', time: '' },
  { value: 'Asia', label: 'Asia', time: '00:00 - 09:00 UTC' },
  { value: 'London', label: 'London', time: '08:00 - 17:00 UTC' },
  { value: 'New York', label: 'New York', time: '13:00 - 22:00 UTC' },
];

const modelOptions: { value: ExecutionModel; label: string }[] = [
  { value: '', label: 'Select execution model' },
  { value: 'Aggressive', label: 'Aggressive Model' },
  { value: 'Conservative', label: 'Conservative Model' },
];

const aggressiveChecks = [
  {
    field: 'liquiditySweep' as const,
    label: 'Liquidity Sweep',
    desc: 'Sweep of inducement or previous highs/lows',
  },
  {
    field: 'engulfingCandle' as const,
    label: 'Engulfing Candle',
    desc: 'Bullish or bearish engulfing candle formed',
  },
  {
    field: 'candleClosed' as const,
    label: 'Candle Closed',
    desc: 'Candle closed above/below swept level',
  },
];

const conservativeChecks = [
  {
    field: 'chochFormed' as const,
    label: 'LTF CHoCH Formed',
    desc: 'Change of character on 15M or 5M timeframe',
  },
  {
    field: 'retestEntry' as const,
    label: 'Retest of FVG / OB',
    desc: 'Price retested the fair value gap or order block',
  },
  {
    field: 'riskEntry' as const,
    label: 'Confirmation Entry',
    desc: 'Confirmation/risk entry criteria satisfied',
  },
];

export const ExecutionParams: FC<ExecutionParamsProps> = ({ params, setParams, session, setSession }) => {
  const setModel = (model: ExecutionModel) => {
    setParams({
      model,
      liquiditySweep: false,
      engulfingCandle: false,
      candleClosed: false,
      chochFormed: false,
      retestEntry: false,
      riskEntry: false,
    });
  };

  const toggle = (field: keyof Omit<ExecutionParamsState, 'model'>) => {
    setParams({ ...params, [field]: !params[field] });
  };

  const activeChecks = params.model === 'Aggressive'
    ? aggressiveChecks
    : params.model === 'Conservative'
      ? conservativeChecks
      : [];

  return (
    <div className="glass-card p-5" id="execution-params">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <Crosshair size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Trading Session & Execution
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Select the session, then reveal the active model confirmations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <label className="block p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
            <Compass size={13} />
            Trading Session
          </span>
          <select
            value={session}
            onChange={(event) => setSession(event.target.value as TradingSession)}
            className="select-control"
            aria-label="Trading Session"
          >
            {sessions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.time ? `${item.label} (${item.time})` : item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            Execution Model
          </span>
          <select
            value={params.model}
            onChange={(event) => setModel(event.target.value as ExecutionModel)}
            className="select-control"
            aria-label="Execution Model"
          >
            {modelOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {params.model ? (
        <div className="animate-slideDown">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            {params.model} Entry Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {activeChecks.map((item) => {
              const checked = params[item.field];
              return (
                <label
                  key={item.field}
                  className={`check-label flex items-start gap-3 cursor-pointer ${checked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.field)}
                    className="sr-only"
                  />
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center transition-all mt-0.5 flex-shrink-0"
                    style={{
                      border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--text-muted)'}`,
                      background: checked ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="text-xs font-semibold block check-text" style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <span className="text-[9px] block leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.desc}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}
        >
          Choose Aggressive or Conservative to show the matching execution checklist.
        </div>
      )}
    </div>
  );
};
