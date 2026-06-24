import type { FC } from 'react';
import { Layers } from 'lucide-react';
import type { KeyLevelsState } from '../types';

interface KeyLevelsProps {
  levels: KeyLevelsState;
  setLevels: (val: KeyLevelsState) => void;
}

interface LevelGroup {
  title: string;
  items: { field: keyof KeyLevelsState; label: string }[];
}

const levelGroups: LevelGroup[] = [
  {
    title: '4H Levels',
    items: [
      { field: 'demand4h', label: '4H Demand Zone' },
      { field: 'supply4h', label: '4H Supply Zone' },
      { field: 'orderBlock4h', label: '4H Order Block' },
    ],
  },
  {
    title: '1H Levels',
    items: [
      { field: 'demand1h', label: '1H Demand Zone' },
      { field: 'supply1h', label: '1H Supply Zone' },
      { field: 'orderBlock1h', label: '1H Order Block' },
    ],
  },
  {
    title: '15M Levels',
    items: [
      { field: 'demand15m', label: '15M Demand Zone' },
      { field: 'supply15m', label: '15M Supply Zone' },
      { field: 'orderBlock15m', label: '15M Order Block' },
    ],
  },
];

export const KeyLevels: FC<KeyLevelsProps> = ({ levels, setLevels }) => {
  const toggle = (field: keyof KeyLevelsState) => {
    setLevels({ ...levels, [field]: !levels[field] });
  };

  return (
    <div className="glass-card p-5 h-full" id="key-levels">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <Layers size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            High Timeframe Key Levels
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Identify relevant higher-timeframe zones
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {levelGroups.map((group) => (
          <div key={group.title}>
            <span className="text-[10px] font-bold uppercase tracking-widest mb-2.5 block" style={{ color: 'var(--text-muted)' }}>
              {group.title}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {group.items.map((item) => (
                <label
                  key={item.field}
                  className={`check-label ${levels[item.field] ? 'checked' : ''}`}
                  style={{ padding: '10px 14px' }}
                >
                  <input
                    type="checkbox"
                    checked={levels[item.field]}
                    onChange={() => toggle(item.field)}
                    className="w-4 h-4 rounded cursor-pointer accent-[var(--accent)]"
                  />
                  <span className="check-text text-xs font-semibold" style={{ color: levels[item.field] ? 'var(--checkbox-checked-text)' : 'var(--text-primary)' }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
