import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const ResultCard = ({ result }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [result]);

    if (!result) return null;

    const isReal = result.label === 'REAL';

    // Theme configuration based on result
    const theme = isReal ? {
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-500',
        text: 'text-emerald-800',
        subText: 'text-emerald-700',
        icon: <CheckCircle2 className="h-8 w-8 text-emerald-600 flex-shrink-0" />,
        barBg: 'bg-emerald-200',
        barFill: 'bg-emerald-500',
        message: 'Likely Authentic',
        desc: 'This content aligns with patterns found in reliable news sources.'
    } : {
        bg: 'bg-primary-50/80',
        border: 'border-primary-400',
        text: 'text-primary-800',
        subText: 'text-primary-700',
        icon: <AlertTriangle className="h-8 w-8 text-primary-500 flex-shrink-0" />,
        barBg: 'bg-primary-200',
        barFill: 'bg-primary-500',
        message: 'Potential Fake News',
        desc: 'This content exhibits significant characteristics often associated with misinformation or clickbait.'
    };

    return (
        <div
            className={`
        mt-8 rounded-2xl border-l-[6px] p-6 shadow-xl shadow-secondary-900/5
        transform transition-all duration-700 ease-out backdrop-blur-sm
        ${theme.bg} ${theme.border}
        ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className={`text-2xl font-bold font-heading flex items-center gap-3 ${theme.text} mb-1`}>
                        {theme.icon}
                        {theme.message}
                    </h3>
                    <p className={`text-sm font-medium ${theme.subText} ml-11 opacity-90`}>
                        {theme.desc}
                    </p>
                </div>
                <div className="bg-white/60 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-500 uppercase tracking-wider backdrop-blur-sm">
                    AI Analysis
                </div>
            </div>

            {/* Confidence Meter */}
            <div className="ml-11">
                <div className="flex justify-between items-end mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${theme.subText}`}>Confidence Score</span>
                    <span className={`text-3xl font-black ${theme.text}`}>
                        {result.confidence.toFixed(1)}%
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className={`h-3 w-full rounded-full ${theme.barBg} overflow-hidden`}>
                    {/* Animated Fill */}
                    <div
                        className={`h-full rounded-full ${theme.barFill} shadow-sm transition-all duration-1000 ease-out`}
                        style={{ width: animate ? `${result.confidence}%` : '0%' }}
                    />
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                        This score indicates the model's certainty based on linguistic patterns, sentiment, and writing style.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
