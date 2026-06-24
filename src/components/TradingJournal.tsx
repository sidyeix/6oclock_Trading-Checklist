import { useRef, useState } from 'react';
import type { FC } from 'react';
import { FileDown, Loader2, BookOpen, TrendingUp, Key, Clock, Percent, Heart, Brain } from 'lucide-react';
import type {
  MarketStructureState, KeyLevelsState, SessionConfirmationState,
  EntryConfirmationState, RiskManagementState, PsychologyState, JournalState
} from '../types';

interface TradingJournalProps {
  date: string;
  marketStructure: MarketStructureState;
  keyLevels: KeyLevelsState;
  sessionConfirmation: SessionConfirmationState;
  entryConfirmation: EntryConfirmationState;
  riskManagement: RiskManagementState;
  psychology: PsychologyState;
  journal: JournalState;
  score: number;
  psychScore: number;
  confluencesCount: number;
  isRiskReady: boolean;
  verdictLabel: string;
  isExecuted: boolean;
  executedAt: string;
}

export const TradingJournal: FC<TradingJournalProps> = ({
  date, marketStructure, keyLevels, sessionConfirmation,
  entryConfirmation, riskManagement, psychology, journal,
  score, psychScore, confluencesCount, isRiskReady,
  verdictLabel, isExecuted, executedAt
}) => {
  const journalRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Get score color
  const getScoreColor = (s: number) => {
    if (s >= 85) return '#fbbf24';
    if (s >= 70) return '#22c55e';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // Get verdict emoji
  const getVerdictEmoji = () => {
    if (score >= 85) return '🔥';
    if (score >= 70) return '✅';
    if (score >= 50) return '⚠️';
    return '❌';
  };

  // Psych state label
  const getPsychLabel = () => {
    const { fear, greed, frustration, focus, patience } = psychology;
    if (psychScore < 50 || fear >= 7 || greed >= 7 || frustration >= 7 || focus < 4 || patience < 4) {
      return { label: "Not Suitable To Trade", icon: "🔴" };
    } else if (psychScore < 75 || fear >= 5 || greed >= 5 || frustration >= 5) {
      return { label: "Caution", icon: "🟡" };
    }
    return { label: "Optimal Trading State", icon: "🟢" };
  };

  const psychState = getPsychLabel();

  // Check if journal has any data
  const hasData = marketStructure.bias4h || marketStructure.bias1h || marketStructure.bias15m ||
    Object.values(keyLevels).some(Boolean) || sessionConfirmation.sessionType ||
    entryConfirmation.entryType || Object.values(riskManagement).some(Boolean) ||
    Object.values(journal).some(v => v.length > 0);

  // Key levels that are checked
  const checkedKeyLevels = [
    { key: 'at1hKeyLevel', label: 'At 1H Key Level' },
    { key: 'at15mKeyLevel', label: 'At 15M Key Level' },
    { key: 'freshSupplyZone', label: 'Fresh Supply Zone' },
    { key: 'freshDemandZone', label: 'Fresh Demand Zone' },
    { key: 'premiumArea', label: 'Premium Area' },
    { key: 'discountArea', label: 'Discount Area' },
    { key: 'dailyHighLiquidity', label: 'Daily High Liquidity' },
    { key: 'dailyLowLiquidity', label: 'Daily Low Liquidity' },
  ].filter(item => keyLevels[item.key as keyof KeyLevelsState]);

  // Entry requirements based on type
  const getEntryRequirements = () => {
    if (entryConfirmation.entryType === 'Aggressive') {
      return [
        { label: 'Liquidity Sweep', checked: entryConfirmation.liquiditySweep },
        { label: 'Engulfing Candle', checked: entryConfirmation.engulfingCandle },
        { label: 'MSS', checked: entryConfirmation.mss },
      ];
    } else if (entryConfirmation.entryType === 'Conservative') {
      return [
        { label: 'Three Candle Formation', checked: entryConfirmation.threeCandle },
        { label: 'Retest', checked: entryConfirmation.retest },
        { label: 'Structure Shift', checked: entryConfirmation.structureShift },
      ];
    }
    return [];
  };

  // PDF export handler
  const handleDownloadPDF = async () => {
    if (!journalRef.current) return;
    setIsExporting(true);

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      const element = journalRef.current;

      // Temporarily make it visible for capture
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.display = 'block';
      element.style.width = '800px';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0c0d12',
        logging: false,
      });

      // Reset styles
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      element.style.display = 'none';
      element.style.width = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // top margin

      // First page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      // Additional pages if content overflows
      while (heightLeft > 0) {
        position = -(pdfHeight - 20) + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position + (imgHeight - heightLeft - (pdfHeight - 20)), imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      pdf.save(`6O-CJFX-Trading-Journal-${date}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Journal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
            Trading Journal
          </h2>
          <p className="text-xs text-gray-400">
            Auto-compiled session report. Download as PDF for record-keeping.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isExporting || !hasData}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            hasData
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50'
              : 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isExporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown size={14} />
              Download Journal
            </>
          )}
        </button>
      </div>

      {/* Live Preview */}
      {!hasData ? (
        <div className="glass-card p-8 border border-white/5 flex flex-col items-center justify-center text-center min-h-[300px]">
          <BookOpen className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-white mb-1">No Session Data Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            Complete your trading checklist above and the journal will auto-compile all your session data for export.
          </p>
        </div>
      ) : (
        <div className="glass-card p-6 border border-white/5 space-y-5">
          {/* Score Summary Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-lg"
                style={{ backgroundColor: getScoreColor(score) + '20', color: getScoreColor(score), border: `1px solid ${getScoreColor(score)}40` }}
              >
                {score}%
              </div>
              <div>
                <p className="text-sm font-bold text-white">{getVerdictEmoji()} {verdictLabel}</p>
                <p className="text-[10px] text-gray-400 font-mono">{date} • Confluences: {confluencesCount}</p>
              </div>
            </div>
            {isExecuted && (
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Executed</span>
                <p className="text-[10px] text-gray-500 font-mono">{executedAt}</p>
              </div>
            )}
          </div>

          {/* Market Structure Summary */}
          {(marketStructure.bias4h || marketStructure.bias1h || marketStructure.bias15m) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                <TrendingUp size={14} className="text-emerald-500" />
                Market Structure
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { tf: '4H', bias: marketStructure.bias4h, reason: marketStructure.reason4h, confirmed: marketStructure.confirm4h, screenshot: marketStructure.screenshot4h },
                  { tf: '1H', bias: marketStructure.bias1h, reason: marketStructure.reason1h, confirmed: marketStructure.confirm1h, screenshot: marketStructure.screenshot1h },
                  { tf: '15M', bias: marketStructure.bias15m, reason: marketStructure.reason15m, confirmed: marketStructure.confirm15m, screenshot: marketStructure.screenshot15m },
                ].filter(tf => tf.bias).map(tf => (
                  <div key={tf.tf} className="p-3 bg-white/3 border border-white/5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tf.tf}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        tf.bias === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' :
                        tf.bias === 'Bearish' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {tf.bias} {tf.confirmed ? '✓' : ''}
                      </span>
                    </div>
                    {tf.reason && <p className="text-[10px] text-gray-400 leading-relaxed">{tf.reason}</p>}
                    {tf.screenshot && (
                      <img src={tf.screenshot} alt={`${tf.tf} chart`} className="w-full max-h-32 object-contain rounded border border-white/5" />
                    )}
                  </div>
                ))}
              </div>
              {marketStructure.htfAlignment && (
                <p className="text-[10px] text-emerald-400 font-semibold">✓ HTF Alignment Confirmed</p>
              )}
            </div>
          )}

          {/* Key Levels */}
          {checkedKeyLevels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                <Key size={14} className="text-emerald-500" />
                Key Levels — {checkedKeyLevels.length} Confluences
              </div>
              <div className="flex flex-wrap gap-2">
                {checkedKeyLevels.map(kl => (
                  <span key={kl.key} className="text-[10px] px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
                    ✓ {kl.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Session & Entry */}
          {(sessionConfirmation.sessionType || entryConfirmation.entryType) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                <Clock size={14} className="text-emerald-500" />
                Session & Entry
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sessionConfirmation.sessionType && (
                  <div className="p-3 bg-white/3 border border-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Session Type</span>
                    <span className="text-xs text-white font-semibold">{sessionConfirmation.sessionType}</span>
                    {sessionConfirmation.sessionAligns && <span className="text-[10px] text-emerald-400 block mt-1">✓ Aligns with setup</span>}
                  </div>
                )}
                {entryConfirmation.entryType && (
                  <div className="p-3 bg-white/3 border border-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Entry Type: {entryConfirmation.entryType}</span>
                    <div className="mt-1 space-y-0.5">
                      {getEntryRequirements().map(req => (
                        <span key={req.label} className={`text-[10px] block ${req.checked ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {req.checked ? '✓' : '✗'} {req.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Risk Management */}
          {Object.values(riskManagement).some(Boolean) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                <Percent size={14} className="text-emerald-500" />
                Risk Management — {isRiskReady ? '✓ Ready' : '✗ Incomplete'}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { checked: riskManagement.riskOnePercent, label: 'Risk 1%' },
                  { checked: riskManagement.rrThreeToOne, label: 'RR ≥ 1:3' },
                  { checked: riskManagement.slDefined, label: 'SL Defined' },
                  { checked: riskManagement.tpDefined, label: 'TP Defined' },
                ].map(item => (
                  <span key={item.label} className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border ${
                    item.checked
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {item.checked ? '✓' : '✗'} {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Psychology */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Heart size={14} className="text-emerald-500" />
              Psychology — {psychScore}% {psychState.icon} {psychState.label}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: 'Fear', val: psychology.fear, danger: true },
                { label: 'Confidence', val: psychology.confidence, danger: false },
                { label: 'Patience', val: psychology.patience, danger: false },
                { label: 'Focus', val: psychology.focus, danger: false },
                { label: 'Greed', val: psychology.greed, danger: true },
                { label: 'Frustration', val: psychology.frustration, danger: true },
              ].map(e => (
                <div key={e.label} className="p-2 bg-white/3 border border-white/5 rounded-lg text-center">
                  <span className={`text-sm font-black font-mono ${e.danger ? 'text-red-400' : 'text-emerald-400'}`}>{e.val}</span>
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">{e.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { checked: psychology.emotionStable, label: 'Emotion Stable' },
                { checked: psychology.noFomo, label: 'No FOMO' },
                { checked: psychology.followingPlan, label: 'Following Plan' },
              ].map(item => (
                <span key={item.label} className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border ${
                  item.checked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/3 border-white/5 text-gray-500'
                }`}>
                  {item.checked ? '✓' : '○'} {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Thought Journal */}
          {Object.values(journal).some(v => v.length > 0) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                <Brain size={14} className="text-emerald-500" />
                Pre-Trade Thought Process
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { field: 'whatDoISee', label: 'What do I see?' },
                  { field: 'whyShouldPriceMove', label: 'Why should price move?' },
                  { field: 'whatInvalidates', label: 'What invalidates?' },
                  { field: 'whatEmotion', label: 'Current emotion?' },
                  { field: 'targetLiquidity', label: 'Target liquidity?' },
                  { field: 'whatMistake', label: 'Mistake to avoid?' },
                ].filter(item => journal[item.field as keyof JournalState]).map(item => (
                  <div key={item.field} className="p-3 bg-white/3 border border-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">{item.label}</span>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{journal[item.field as keyof JournalState]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== HIDDEN PDF RENDER TARGET ====== */}
      <div ref={journalRef} style={{ display: 'none' }}>
        <div style={{
          backgroundColor: '#0c0d12',
          color: '#e2e8f0',
          fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
          padding: '40px',
          minWidth: '760px',
        }}>
          {/* PDF Header */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '2px', fontFamily: 'monospace', margin: 0 }}>
              6O.CJFX TRADING EDGE
            </h1>
            <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700, marginTop: '4px' }}>
              Trading Session Journal
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '13px', color: '#d1d5db', fontFamily: 'monospace' }}>Date: {date}</span>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '8px',
                backgroundColor: getScoreColor(score) + '20',
                border: `1px solid ${getScoreColor(score)}40`,
                color: getScoreColor(score),
                fontWeight: 900, fontSize: '16px', fontFamily: 'monospace'
              }}>
                {score}% — {verdictLabel}
              </div>
            </div>
          </div>

          {/* PDF Market Structure */}
          {(marketStructure.bias4h || marketStructure.bias1h || marketStructure.bias15m) && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                ▸ Market Structure Analysis
              </h2>
              {[
                { tf: '4H', bias: marketStructure.bias4h, reason: marketStructure.reason4h, confirmed: marketStructure.confirm4h, screenshot: marketStructure.screenshot4h },
                { tf: '1H', bias: marketStructure.bias1h, reason: marketStructure.reason1h, confirmed: marketStructure.confirm1h, screenshot: marketStructure.screenshot1h },
                { tf: '15M', bias: marketStructure.bias15m, reason: marketStructure.reason15m, confirmed: marketStructure.confirm15m, screenshot: marketStructure.screenshot15m },
              ].filter(tf => tf.bias).map(tf => (
                <div key={tf.tf} style={{
                  padding: '12px', marginBottom: '10px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{tf.tf} Timeframe</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '4px',
                      backgroundColor: tf.bias === 'Bullish' ? 'rgba(34,197,94,0.1)' : tf.bias === 'Bearish' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: tf.bias === 'Bullish' ? '#22c55e' : tf.bias === 'Bearish' ? '#ef4444' : '#f59e0b',
                    }}>
                      {tf.bias} {tf.confirmed ? '✓' : ''}
                    </span>
                  </div>
                  {tf.reason && <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>{tf.reason}</p>}
                  {tf.screenshot && (
                    <img src={tf.screenshot} alt={`${tf.tf} chart`} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px', marginTop: '8px', border: '1px solid rgba(255,255,255,0.05)' }} />
                  )}
                </div>
              ))}
              {marketStructure.htfAlignment && (
                <p style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, margin: 0 }}>✓ HTF Alignment Confirmed</p>
              )}
            </div>
          )}

          {/* PDF Key Levels */}
          {checkedKeyLevels.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                ▸ Key Levels — {checkedKeyLevels.length} Confluences
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {checkedKeyLevels.map(kl => (
                  <span key={kl.key} style={{
                    fontSize: '11px', padding: '4px 12px', borderRadius: '6px',
                    backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#22c55e', fontWeight: 600
                  }}>
                    ✓ {kl.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PDF Session & Entry */}
          {(sessionConfirmation.sessionType || entryConfirmation.entryType) && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                ▸ Session & Entry Parameters
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                {sessionConfirmation.sessionType && (
                  <div style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Session</span>
                    <p style={{ fontSize: '12px', color: '#fff', fontWeight: 600, margin: '4px 0 0' }}>{sessionConfirmation.sessionType}</p>
                    {sessionConfirmation.sessionAligns && <p style={{ fontSize: '10px', color: '#22c55e', margin: '2px 0 0' }}>✓ Aligns</p>}
                  </div>
                )}
                {entryConfirmation.entryType && (
                  <div style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Entry: {entryConfirmation.entryType}</span>
                    <div style={{ marginTop: '4px' }}>
                      {getEntryRequirements().map(req => (
                        <p key={req.label} style={{ fontSize: '11px', color: req.checked ? '#22c55e' : '#6b7280', margin: '2px 0' }}>
                          {req.checked ? '✓' : '✗'} {req.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF Risk Management */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              ▸ Risk Management — {isRiskReady ? '✓ Ready' : '✗ Incomplete'}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { checked: riskManagement.riskOnePercent, label: 'Risk 1%' },
                { checked: riskManagement.rrThreeToOne, label: 'RR ≥ 1:3' },
                { checked: riskManagement.slDefined, label: 'SL Defined' },
                { checked: riskManagement.tpDefined, label: 'TP Defined' },
              ].map(item => (
                <span key={item.label} style={{
                  fontSize: '11px', padding: '4px 12px', borderRadius: '6px', fontWeight: 600,
                  backgroundColor: item.checked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${item.checked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: item.checked ? '#22c55e' : '#ef4444',
                }}>
                  {item.checked ? '✓' : '✗'} {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* PDF Psychology */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              ▸ Psychology — {psychScore}% {psychState.icon} {psychState.label}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[
                { label: 'Fear', val: psychology.fear, danger: true },
                { label: 'Confidence', val: psychology.confidence, danger: false },
                { label: 'Patience', val: psychology.patience, danger: false },
                { label: 'Focus', val: psychology.focus, danger: false },
                { label: 'Greed', val: psychology.greed, danger: true },
                { label: 'Frustration', val: psychology.frustration, danger: true },
              ].map(e => (
                <div key={e.label} style={{
                  padding: '8px 14px', backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', textAlign: 'center',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'monospace', color: e.danger ? '#ef4444' : '#22c55e' }}>{e.val}</span>
                  <span style={{ fontSize: '9px', color: '#6b7280', display: 'block', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>{e.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Thought Journal */}
          {Object.values(journal).some(v => v.length > 0) && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                ▸ Pre-Trade Thought Process
              </h2>
              {[
                { field: 'whatDoISee', label: 'What do I see?' },
                { field: 'whyShouldPriceMove', label: 'Why should price move?' },
                { field: 'whatInvalidates', label: 'What invalidates?' },
                { field: 'whatEmotion', label: 'Current emotion?' },
                { field: 'targetLiquidity', label: 'Target liquidity?' },
                { field: 'whatMistake', label: 'Mistake to avoid?' },
              ].filter(item => journal[item.field as keyof JournalState]).map(item => (
                <div key={item.field} style={{
                  padding: '10px', marginBottom: '8px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</span>
                  <p style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.6', margin: '4px 0 0' }}>{journal[item.field as keyof JournalState]}</p>
                </div>
              ))}
            </div>
          )}

          {/* PDF Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '24px' }}>
            <p style={{ fontSize: '9px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, textAlign: 'center', margin: 0 }}>
              6O.CJFX Trading Edge — Discipline Cockpit • Generated {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
