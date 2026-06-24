import type { FC } from 'react';
import { MapPin } from 'lucide-react';
import type { DailyPrepState } from '../types';

interface DailyPreparationProps {
  prep: DailyPrepState;
  setPrep: (val: DailyPrepState) => void;
}

export const DailyPreparation: FC<DailyPreparationProps> = ({ prep, setPrep }) => {
  const update = (fields: Partial<DailyPrepState>) => {
    setPrep({ ...prep, ...fields });
  };

  return (
    <div className="glass-card glass-card-hover p-6" id="daily-preparation">
      <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <MapPin size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Daily Market Preparation
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Reminders for chart preparation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          className={`check-label ${prep.pdhMarked ? 'checked' : ''}`}
        >
          <input
            type="checkbox"
            checked={prep.pdhMarked}
            onChange={(e) => update({ pdhMarked: e.target.checked })}
            className="w-4 h-4 rounded cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex flex-col">
            <span className="check-text text-xs font-semibold" style={{ color: prep.pdhMarked ? 'var(--checkbox-checked-text)' : 'var(--text-primary)' }}>
              Previous Daily High (PDH)
            </span>
            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Marked on chart
            </span>
          </div>
        </label>

        <label
          className={`check-label ${prep.pdlMarked ? 'checked' : ''}`}
        >
          <input
            type="checkbox"
            checked={prep.pdlMarked}
            onChange={(e) => update({ pdlMarked: e.target.checked })}
            className="w-4 h-4 rounded cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex flex-col">
            <span className="check-text text-xs font-semibold" style={{ color: prep.pdlMarked ? 'var(--checkbox-checked-text)' : 'var(--text-primary)' }}>
              Previous Daily Low (PDL)
            </span>
            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Marked on chart
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};
