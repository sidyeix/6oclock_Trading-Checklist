import type { FC } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, HelpCircle, CheckCircle2, Flame } from 'lucide-react';

interface ScoreEngineProps {
  score: number;
  confluencesCount: number;
}

export const ScoreEngine: FC<ScoreEngineProps> = ({ score, confluencesCount }) => {
  // Determine color theme based on score range
  let colorClass = 'text-red-500';
  let strokeColor = '#ef4444';
  let glowClass = '';
  let badgeColor = 'bg-red-500/10 border-red-500/30 text-red-400';
  
  if (score >= 85) {
    colorClass = 'text-amber-400 font-bold';
    strokeColor = '#fbbf24';
    glowClass = 'animate-glow-gold';
    badgeColor = 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-extrabold';
  } else if (score >= 70) {
    colorClass = 'text-emerald-500';
    strokeColor = '#10b981';
    glowClass = 'animate-glow-green';
    badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold';
  } else if (score >= 50) {
    colorClass = 'text-amber-500';
    strokeColor = '#fbbf24';
    badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  }

  // Verdict calculation
  const getVerdict = () => {
    if (score >= 85) {
      return {
        label: "A+ SETUP DETECTED",
        description: "Optimal conditions. Execute according to plan. Patience created this setup.",
        icon: <Flame className="w-6 h-6 text-amber-400 animate-bounce" />,
      };
    } else if (score >= 70) {
      return {
        label: "HIGH PROBABILITY SETUP",
        description: "Strong confluences. Risk-reward is favorable. You waited for confirmation.",
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      };
    } else if (score >= 50) {
      return {
        label: "WAIT FOR MORE CONFIRMATION",
        description: "Weak or conflicting confluences. Stand by for better levels or structure shifts.",
        icon: <HelpCircle className="w-6 h-6 text-amber-500 animate-pulse" />,
      };
    } else {
      return {
        label: "NO TRADE",
        description: "Discipline checkpoint: Setup parameters are absent. Protect your capital and wait.",
        icon: <AlertOctagon className="w-6 h-6 text-red-500" />,
      };
    }
  };

  const verdict = getVerdict();
  
  // SVG Ring Calculations
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass-card p-6 border relative overflow-hidden transition-all duration-500 ${glowClass || 'border-white/5'}`}>
      
      {/* Dynamic background lighting */}
      <div 
        className="absolute -top-10 -left-10 w-28 h-28 rounded-full blur-3xl opacity-10 transition-colors duration-500" 
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col items-center">
        {/* Widget Title */}
        <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 mb-5">
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Verdict Engine</span>
          <span className="text-[10px] text-gray-500 font-mono">Real-Time Scoring</span>
        </div>

        {/* Circular Progress Area */}
        <div className="relative flex items-center justify-center w-40 h-40">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-white/5"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active Ring */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <motion.span 
              className={`text-3xl font-black font-mono tracking-tight leading-none ${colorClass}`}
              animate={{ scale: [0.95, 1] }}
              transition={{ duration: 0.3 }}
            >
              {score}%
            </motion.span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">
              Quality
            </span>
          </div>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="w-full mt-4 bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: strokeColor }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Metric summary */}
        <div className="flex gap-6 w-full justify-center mt-3 text-xs text-gray-400 font-mono">
          <div>Confluences: <span className="text-white font-bold">{confluencesCount}</span></div>
          <div>•</div>
          <div>Risk state: <span className="text-white font-bold">{score >= 70 ? "Qualified" : "Pending"}</span></div>
        </div>

        {/* Large Verdict Box */}
        <div className={`w-full mt-6 p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${badgeColor}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {verdict.icon}
            <span className="text-base font-black tracking-wide">{verdict.label}</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            {verdict.description}
          </p>
        </div>
      </div>
    </div>
  );
};
