import type { FC } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const NonNegotiables: FC = () => {
  const rules = [
    { text: "Risk 1% Per Trade", desc: "Protect capital above all else." },
    { text: "Maximum 1 Trade Per Day", desc: "Quality over quantity. One shot." },
    { text: "Maximum 1 Loss Per Day", desc: "No exception. Close terminal on loss." },
    { text: "Minimum 1:3 Risk Reward", desc: "Let math work in your favor." },
    { text: "Target Opposing Supply/Demand", desc: "Objective targets based on structure." },
    { text: "No Revenge Trading", desc: "Market does not owe you anything." },
    { text: "No FOMO Entries", desc: "Missing a trade is free. Chasing is expensive." },
    { text: "Trade Only During Planned Session", desc: "Outside hours = random noise." }
  ];

  return (
    <div className="glass-card p-5 border border-amber-500/10 relative overflow-hidden flex flex-col h-full">
      {/* Absolute background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wider uppercase">Non-Negotiables</h2>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mt-0.5">Prop-Firm Discipline</p>
        </div>
      </div>

      {/* Rules list */}
      <div className="flex-1 space-y-3.5">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex gap-3 items-start group">
            <span className="text-emerald-500 mt-0.5 select-none font-bold text-sm bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                {rule.text}
              </p>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-0.5 font-light leading-normal">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Discipline Footer */}
      <div className="mt-5 p-3 bg-white/3 border border-white/5 rounded-lg flex items-center gap-2">
        <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
        <span className="text-[10px] text-gray-400 font-medium leading-relaxed">
          Violating a non-negotiable constitutes an instant discipline failure. Log off immediately.
        </span>
      </div>
    </div>
  );
};
