import type { FC } from 'react';
import { Crosshair } from 'lucide-react';
import type { ExecutionParamsState } from '../types';

interface ExecutionParamsProps {
  params: ExecutionParamsState;
  setParams: (val: ExecutionParamsState) => void;
}

export const ExecutionParams: FC<ExecutionParamsProps> = ({ params, setParams }) => {
  const toggle = (field: keyof ExecutionParamsState) => {
    setParams({ ...params, [field]: !params[field] });
  };

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

  return (
    <div className="glass-card p-5 h-full" id="execution-params">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <Crosshair size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Execution Parameters
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Manual model entry confirmations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aggressive Entry Model */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Aggressive Entry Model
          </h3>
          <div className="space-y-2">
            {aggressiveChecks.map((item) => {
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
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center transition-all mt-0.5"
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
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold block check-text" style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <span className="text-[9px] block leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Conservative Entry Model */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Conservative Entry Model
          </h3>
          <div className="space-y-2">
            {conservativeChecks.map((item) => {
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
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center transition-all mt-0.5"
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
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold block check-text" style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <span className="text-[9px] block leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
