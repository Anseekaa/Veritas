import React from 'react';
import { Sun, Moon, FileText } from 'lucide-react';

const ThemeToggle = ({ theme, setTheme }) => {
    return (
        <div className="fixed top-4 right-4 z-50 bg-white/50 backdrop-blur-md border border-white/50 p-1 rounded-full flex gap-1 shadow-lg">
            <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow text-amber-500' : 'text-slate-500 hover:bg-white/50'}`}
                title="Light Mode"
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-800 shadow text-indigo-300' : 'text-slate-500 hover:bg-white/50'}`}
                title="Dark Mode"
            >
                <Moon size={18} />
            </button>
            <button
                onClick={() => setTheme('newspaper')}
                className={`p-2 rounded-full transition-all ${theme === 'newspaper' ? 'bg-[#f4ebd0] shadow text-stone-800' : 'text-slate-500 hover:bg-white/50'}`}
                title="Newspaper Mode"
            >
                <FileText size={18} />
            </button>
        </div>
    );
};

export default ThemeToggle;
