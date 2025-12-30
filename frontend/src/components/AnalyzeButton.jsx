import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const AnalyzeButton = ({ onClick, loading, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        w-full relative overflow-hidden group
        font-bold py-3.5 sm:py-4 px-6 rounded-[12px] text-base sm:text-lg tracking-wide
        transition-all duration-300 ease-out
        flex items-center justify-center space-x-3
        shadow-lg shadow-primary-600/20
        border border-transparent
        ${disabled
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border-slate-100'
                    : 'bg-primary-500 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-[3px] active:translate-y-0 text-white'
                }        
      `}
        >
            {/* Button Shine Effect */}
            {!disabled && !loading && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
            )}

            {loading ? (
                <>
                    <Loader2 className="animate-spin h-6 w-6" />
                    <span>Analyzing Content...</span>
                </>
            ) : (
                <>
                    <Sparkles className={`h-6 w-6 ${!disabled ? 'group-hover:text-primary-100 transition-colors' : ''}`} />
                    <span className="font-heading italic">Verify Authenticity</span>
                </>
            )}
        </button>
    );
};

export default AnalyzeButton;
