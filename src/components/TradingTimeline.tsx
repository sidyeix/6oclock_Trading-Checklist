import { useState } from 'react';
import type { FC } from 'react';
import { Clock, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { TimelineEntry } from '../types';

interface TradingTimelineProps {
  entries: TimelineEntry[];
  setEntries: (val: TimelineEntry[]) => void;
}

export const TradingTimeline: FC<TradingTimelineProps> = ({ entries, setEntries }) => {
  const [newNote, setNewNote] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [useAutoTimestamp, setUseAutoTimestamp] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editTime, setEditTime] = useState('');

  const generateId = () => `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const addEntry = () => {
    if (!newNote.trim()) return;

    const timestamp = useAutoTimestamp
      ? formatTime(new Date())
      : manualTime || formatTime(new Date());

    const entry: TimelineEntry = {
      id: generateId(),
      timestamp,
      note: newNote.trim(),
      isAutoTimestamp: useAutoTimestamp,
    };

    // Insert sorted chronologically
    const updated = [...entries, entry].sort((a, b) => {
      // Parse time strings for sorting
      const parseTime = (t: string) => {
        const d = new Date();
        const parts = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (parts) {
          let h = parseInt(parts[1]);
          const m = parseInt(parts[2]);
          const ampm = parts[3].toUpperCase();
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          d.setHours(h, m, 0, 0);
        }
        return d.getTime();
      };
      return parseTime(a.timestamp) - parseTime(b.timestamp);
    });

    setEntries(updated);
    setNewNote('');
    setManualTime('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const startEdit = (entry: TimelineEntry) => {
    setEditingId(entry.id);
    setEditNote(entry.note);
    setEditTime(entry.timestamp);
  };

  const saveEdit = () => {
    if (!editingId || !editNote.trim()) return;
    setEntries(
      entries.map(e =>
        e.id === editingId
          ? { ...e, note: editNote.trim(), timestamp: editTime || e.timestamp }
          : e
      )
    );
    setEditingId(null);
    setEditNote('');
    setEditTime('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNote('');
    setEditTime('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addEntry();
    }
  };

  return (
    <div className="glass-card glass-card-hover p-6" id="trading-timeline">
      <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <Clock size={16} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Trading Timeline Journal
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Timestamped notes — your primary journaling workspace
          </p>
        </div>
        {entries.length > 0 && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Add New Entry */}
      <div
        className="p-4 rounded-xl mb-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          {/* Timestamp Control */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAutoTimestamp}
                onChange={(e) => setUseAutoTimestamp(e.target.checked)}
                className="w-3.5 h-3.5 rounded cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                Auto time
              </span>
            </label>

            {!useAutoTimestamp && (
              <input
                type="text"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                placeholder="e.g. 03:00 PM"
                className="text-xs px-3 py-1.5 rounded-lg w-32 focus:outline-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's happening in the market right now?"
            className="flex-1 text-xs px-4 py-3 rounded-xl focus:outline-none"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={addEntry}
            disabled={!newNote.trim()}
            className="px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: newNote.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
              color: newNote.trim() ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${newNote.trim() ? 'var(--accent)' : 'var(--border-primary)'}`,
              opacity: newNote.trim() ? 1 : 0.6,
            }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Timeline Display */}
      {entries.length === 0 ? (
        <div className="py-12 text-center">
          <Clock size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.4 }} />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            No timeline entries yet. Add your first note above.
          </p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="relative flex gap-4 animate-fadeIn" style={{ paddingBottom: idx < entries.length - 1 ? '0' : '0' }}>
              {/* Timeline connector */}
              <div className="flex flex-col items-center pt-1">
                <div className="timeline-dot" />
                {idx < entries.length - 1 && (
                  <div className="flex-1 w-0.5 mt-1" style={{ background: 'var(--border-primary)', minHeight: '24px' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4" style={{ minWidth: 0 }}>
                {editingId === entry.id ? (
                  /* Edit Mode */
                  <div
                    className="p-3 rounded-xl animate-fadeIn"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-active)' }}
                  >
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="text-[11px] font-mono px-2 py-1 rounded-lg w-28 focus:outline-none"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      className="w-full text-xs px-3 py-2 rounded-lg mb-2 focus:outline-none"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <button onClick={saveEdit} className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                        <Check size={10} /> Save
                      </button>
                      <button onClick={cancelEdit} className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        <X size={10} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="group">
                    <div className="flex items-start justify-between gap-2">
                      <div style={{ minWidth: 0 }}>
                        <span className="text-sm font-mono font-bold block mb-1 tabular-nums" style={{ color: 'var(--accent)' }}>
                          {entry.timestamp}
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {entry.note}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 rounded-lg cursor-pointer transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 rounded-lg cursor-pointer transition-colors hover:text-red-400"
                          style={{ color: 'var(--text-muted)' }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
