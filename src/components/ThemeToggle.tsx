import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../lib/store';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Cambiar tema"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}