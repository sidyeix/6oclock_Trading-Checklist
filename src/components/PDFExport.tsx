import { useRef, useState } from 'react';
import type { FC, ChangeEvent } from 'react';
import { FileDown, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import type {
  MarketStructureState, KeyLevelsState, ExecutionParamsState,
  TimelineEntry, TradeScreenshots, DailyPrepState, NonNegotiablesState
} from '../types';

interface PDFExportProps {
  date: string;
  dailyPrep: DailyPrepState;
  marketStructure: MarketStructureState;
  keyLevels: KeyLevelsState;
  executionParams: ExecutionParamsState;
  timelineEntries: TimelineEntry[];
  screenshots: TradeScreenshots;
  setScreenshots: (val: TradeScreenshots) => void;
  session: string;
  nonNegotiables: NonNegotiablesState;
  verdictText: string;
}

export const PDFExport: FC<PDFExportProps> = ({
  date, dailyPrep: _dailyPrep, marketStructure, keyLevels, executionParams,
  timelineEntries, screenshots, setScreenshots, session, nonNegotiables, verdictText
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const htfInputRef = useRef<HTMLInputElement>(null);
  const entryInputRef = useRef<HTMLInputElement>(null);

  // Handle screenshot upload with compression
  const handleUpload = (field: 'htfScreenshot' | 'entryScreenshot', e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setScreenshots({ ...screenshots, [field]: compressed });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Check if there's any data worth exporting
  const hasData = marketStructure.bias4h || marketStructure.bias1h || marketStructure.bias15m ||
    Object.values(keyLevels).some(Boolean) || Object.values(executionParams).some(Boolean) ||
    timelineEntries.length > 0 || screenshots.htfScreenshot || screenshots.entryScreenshot || session ||
    Object.values(nonNegotiables).some(Boolean);

  // Key level labels
  const getCheckedLevels = () => {
    const map: Record<string, string> = {
      demand4h: '4H Demand', supply4h: '4H Supply', orderBlock4h: '4H OB',
      demand1h: '1H Demand', supply1h: '1H Supply', orderBlock1h: '1H OB',
      demand15m: '15M Demand', supply15m: '15M Supply', orderBlock15m: '15M OB',
    };
    return Object.entries(keyLevels)
      .filter(([, v]) => v)
      .map(([k]) => map[k] || k);
  };

  // PDF Export
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      const el = pdfRef.current;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.top = '0';
      el.style.display = 'block';
      el.style.width = '800px';

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.display = 'none';
      el.style.width = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const imgW = pdfW - 16;
      const imgH = (canvas.height * imgW) / canvas.width;

      pdf.addImage(imgData, 'PNG', 8, 8, imgW, imgH);
      pdf.save(`6O-CJFX-Journal-${date}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const checkedLevels = getCheckedLevels();
  
  const checkedExecAggressive = [
    executionParams.liquiditySweep && 'Liquidity Sweep',
    executionParams.engulfingCandle && 'Engulfing Candle',
    executionParams.candleClosed && 'Candle Closed',
  ].filter(Boolean);

  const checkedExecConservative = [
    executionParams.chochFormed && 'LTF CHoCH Formed',
    executionParams.retestEntry && 'Retest of FVG / OB',
    executionParams.riskEntry && 'Confirmation Entry',
  ].filter(Boolean);

  const checkedNonNegotiables = [
    nonNegotiables.htfAlignment && 'HTF Alignment',
    nonNegotiables.liquiditySwept && 'Liquidity Pool Swept',
    nonNegotiables.rrValid && 'R:R Ratio Valid',
  ].filter(Boolean);

  return (
    <div className="glass-card p-6" id="pdf-export">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            PDF Export
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Upload screenshots and export a one-page trade review
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || !hasData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: hasData ? 'var(--accent-muted)' : 'var(--bg-elevated)',
            border: `1px solid ${hasData ? 'var(--border-active)' : 'var(--border-primary)'}`,
            color: hasData ? 'var(--accent)' : 'var(--text-muted)',
            opacity: hasData ? 1 : 0.5,
          }}
        >
          {isExporting ? (
            <><Loader2 size={14} className="animate-spin" /> Generating...</>
          ) : (
            <><FileDown size={14} /> Download PDF</>
          )}
        </button>
      </div>

      {/* Screenshot Uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* HTF Screenshot */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Section 1 — Trade Setup (4H / 1H)
          </span>
          <input ref={htfInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('htfScreenshot', e)} />
          {screenshots.htfScreenshot ? (
            <div className="relative group rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
              <img src={screenshots.htfScreenshot} alt="HTF chart" className="w-full max-h-48 object-contain" style={{ background: 'var(--bg-input)' }} />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => htfInputRef.current?.click()} className="p-1.5 rounded-lg text-[10px] font-bold cursor-pointer" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
                  <Upload size={12} />
                </button>
                <button onClick={() => setScreenshots({ ...screenshots, htfScreenshot: '' })} className="p-1.5 rounded-lg cursor-pointer bg-red-500/80 hover:bg-red-500 text-white">
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="screenshot-upload" onClick={() => htfInputRef.current?.click()}>
              <ImageIcon size={20} />
              <span className="text-xs font-medium">Upload 4H or 1H Screenshot</span>
              <span className="text-[10px]">Higher timeframe context</span>
            </div>
          )}
        </div>

        {/* Entry Screenshot */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Section 2 — Entry Confirmation (15M / 5M)
          </span>
          <input ref={entryInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('entryScreenshot', e)} />
          {screenshots.entryScreenshot ? (
            <div className="relative group rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
              <img src={screenshots.entryScreenshot} alt="Entry chart" className="w-full max-h-48 object-contain" style={{ background: 'var(--bg-input)' }} />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => entryInputRef.current?.click()} className="p-1.5 rounded-lg text-[10px] font-bold cursor-pointer" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
                  <Upload size={12} />
                </button>
                <button onClick={() => setScreenshots({ ...screenshots, entryScreenshot: '' })} className="p-1.5 rounded-lg cursor-pointer bg-red-500/80 hover:bg-red-500 text-white">
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="screenshot-upload" onClick={() => entryInputRef.current?.click()}>
              <ImageIcon size={20} />
              <span className="text-xs font-medium">Upload 15M or 5M Screenshot</span>
              <span className="text-[10px]">Execution confirmation</span>
            </div>
          )}
        </div>
      </div>

      {/* ====== HIDDEN PDF RENDER TARGET ====== */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        <div style={{
          backgroundColor: '#ffffff',
          color: '#111827',
          fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
          padding: '36px 40px',
          minWidth: '760px',
        }}>
          {/* PDF Header */}
          <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '1px', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                6O.CJFX TRADING JOURNAL
              </h1>
              <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginTop: '2px' }}>
                Trade Review Sheet {session && `• ${session} Session`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {verdictText && (
                <span style={{
                  fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                  padding: '3px 8px', borderRadius: '4px',
                  backgroundColor: verdictText.includes('Bullish') ? '#dcfce7' : verdictText.includes('Bearish') ? '#fee2e2' : '#fef3c7',
                  color: verdictText.includes('Bullish') ? '#166534' : verdictText.includes('Bearish') ? '#991b1b' : '#92400e',
                }}>
                  {verdictText}
                </span>
              )}
              <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'monospace', fontWeight: 600 }}>
                {date}
              </span>
            </div>
          </div>

          {/* Screenshots Row */}
          {(screenshots.htfScreenshot || screenshots.entryScreenshot) && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {screenshots.htfScreenshot && (
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                    Trade Setup (HTF)
                  </span>
                  <img src={screenshots.htfScreenshot} alt="HTF" style={{
                    width: '100%', maxHeight: '220px', objectFit: 'contain',
                    borderRadius: '6px', border: '1px solid #e5e7eb',
                  }} />
                </div>
              )}
              {screenshots.entryScreenshot && (
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                    Entry Confirmation (LTF)
                  </span>
                  <img src={screenshots.entryScreenshot} alt="Entry" style={{
                    width: '100%', maxHeight: '220px', objectFit: 'contain',
                    borderRadius: '6px', border: '1px solid #e5e7eb',
                  }} />
                </div>
              )}
            </div>
          )}

          {/* Summary Row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {/* Market Structure */}
            {(marketStructure.bias4h || marketStructure.bias1h || marketStructure.bias15m) && (
              <div style={{ flex: 1, padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Market Structure</span>
                <div style={{ marginTop: '8px' }}>
                  {[
                    { label: '4H', bias: marketStructure.bias4h },
                    { label: '1H', bias: marketStructure.bias1h },
                    { label: '15M', bias: marketStructure.bias15m },
                  ].filter(t => t.bias).map(t => (
                    <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{t.label}</span>
                      <span style={{
                        fontWeight: 700, fontSize: '9px', padding: '1px 6px', borderRadius: '4px',
                        backgroundColor: t.bias === 'Bullish' ? '#dcfce7' : t.bias === 'Bearish' ? '#fee2e2' : '#fef3c7',
                        color: t.bias === 'Bullish' ? '#166534' : t.bias === 'Bearish' ? '#991b1b' : '#92400e',
                      }}>
                        {t.bias}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Negotiables */}
            {checkedNonNegotiables.length > 0 && (
              <div style={{ flex: 1, padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Non-Negotiables</span>
                <div style={{ marginTop: '8px' }}>
                  {checkedNonNegotiables.map(c => (
                    <p key={c as string} style={{ fontSize: '10px', color: '#166534', fontWeight: 600, margin: '3px 0' }}>
                      ✓ {c}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Key Levels */}
            {checkedLevels.length > 0 && (
              <div style={{ flex: 1, padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Key Levels</span>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {checkedLevels.map(l => (
                    <span key={l} style={{
                      fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                      background: '#dbeafe', color: '#1e40af', fontWeight: 600,
                      alignSelf: 'flex-start'
                    }}>
                      ✓ {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Execution (Aggressive & Conservative) */}
            {(checkedExecAggressive.length > 0 || checkedExecConservative.length > 0) && (
              <div style={{ flex: 1.2, padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Execution Confirmations</span>
                <div style={{ marginTop: '6px' }}>
                  {checkedExecAggressive.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Aggressive</span>
                      {checkedExecAggressive.map(c => (
                        <p key={c as string} style={{ fontSize: '9px', color: '#111827', fontWeight: 600, margin: '2px 0' }}>
                          ✓ {c}
                        </p>
                      ))}
                    </div>
                  )}
                  {checkedExecConservative.length > 0 && (
                    <div>
                      <span style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Conservative</span>
                      {checkedExecConservative.map(c => (
                        <p key={c as string} style={{ fontSize: '9px', color: '#111827', fontWeight: 600, margin: '2px 0' }}>
                          ✓ {c}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timeline Notes */}
          {timelineEntries.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
                Trading Timeline
              </span>
              <div style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: '14px' }}>
                {timelineEntries.map((entry) => (
                  <div key={entry.id} style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                      {entry.timestamp}
                    </span>
                    <span style={{ fontSize: '11px', color: '#374151', marginLeft: '8px' }}>
                      — {entry.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '16px' }}>
            <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, textAlign: 'center', margin: 0 }}>
              6O.CJFX Trading Journal • Generated {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
