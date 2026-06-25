import type { FC } from 'react';
import { Gauge } from 'lucide-react';
import type { BiasOption, MarketStructureState, VerdictOption } from '../types';

interface VerdictStats {
  label: VerdictOption;
  percent: number;
  bullish: number;
  bearish: number;
  range: number;
  total: number;
}

interface VerdictPanelProps {
  marketStructure: MarketStructureState;
  stats: VerdictStats;
  activeVerdict: VerdictOption;
  compact?: boolean;
}

const biasRows = [
  { label: '4H Bias', valueKey: 'bias4h' as const },
  { label: '1H Bias', valueKey: 'bias1h' as const },
  { label: '15M Bias', valueKey: 'bias15m' as const },
];

const biasClass = (bias: BiasOption | VerdictOption) => {
  if (bias === 'Bullish') return 'bias-chip-bullish';
  if (bias === 'Bearish') return 'bias-chip-bearish';
  if (bias === 'Range') return 'bias-chip-range';
  if (bias === 'No Trade') return 'bias-chip-danger';
  return '';
};

const actionLabel = (verdict: VerdictOption) => {
  if (verdict === 'Bullish') return 'Look for Long Positions';
  if (verdict === 'Bearish') return 'Look for Short Positions';
  if (verdict === 'Range' || verdict === 'No Trade') return 'No Trade - Ranging';
  return 'Awaiting Bias';
};

export const VerdictPanel: FC<VerdictPanelProps> = ({
  marketStructure,
  stats,
  activeVerdict,
  compact = false,
}) => {
  const activeLabel = actionLabel(activeVerdict);
  const automaticLabel = stats.label || 'Awaiting Bias';

  return (
    <div className={`glass-card ${compact ? 'p-3' : 'p-5'}`} id={compact ? 'verdict-panel-compact' : 'verdict-panel'}>
      <div
        className={`flex items-center gap-3 ${compact ? 'pb-2 mb-2' : 'pb-3 mb-4'}`}
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="section-badge">
          <Gauge size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Current Verdict Rule
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Automatic read from timeframe alignment
          </p>
        </div>
      </div>

      <div className="verdict-summary">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
            Active Verdict
          </span>
          <span className={`bias-chip ${biasClass(activeVerdict)}`}>
            {activeLabel}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
            Automatic
          </span>
          <span className={`verdict-percent-text ${biasClass(stats.label)}`}>
            {stats.total ? `${stats.percent}% ${automaticLabel}` : automaticLabel}
          </span>
        </div>
      </div>

      <div className="verdict-bias-grid mt-3">
        {biasRows.map((row) => {
          const bias = marketStructure[row.valueKey];
          return (
            <div key={row.valueKey} className="verdict-bias-column">
              <span>{row.label.replace(' Bias', '')}</span>
              <span className={`bias-chip ${biasClass(bias)}`}>
                {bias || 'Unset'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
