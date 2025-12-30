import React from 'react';
import { Sparkles } from 'lucide-react';

const Header = ({ onReset }) => {
    return (
        <div
            onClick={onReset}
            className="flex flex-col items-center justify-center py-10 sm:py-16 relative z-10 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            title="Go to Home"
        >
            <div className="relative mb-8 group">
                {/* Logo Image */}
                <img
                    src="/logo.svg"
                    alt="App Logo"
                    className="w-20 h-20 p-3.5 rounded-3xl bg-white/55 backdrop-blur-md shadow-sm border border-white/40 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Decorative Elements */}
                <div className="absolute -top-3 -right-3">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-rose-200 opacity-75"></div>
                        <div className="relative bg-white/80 p-1.5 rounded-full shadow-sm border border-rose-100 text-rose-400">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 tracking-tight font-heading">
                Veritas
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl text-center font-medium leading-relaxed px-4">
                Advanced AI-powered authenticity verification for the digital age.
            </p>
        </div>
    );
};

export default Header;
