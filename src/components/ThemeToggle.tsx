import type { FC } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        color: 'var(--text-secondary)',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="transition-transform duration-300" />
      ) : (
        <Moon size={16} className="transition-transform duration-300" />
      )}
    </button>
  );
};
