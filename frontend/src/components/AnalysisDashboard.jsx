import React, { useEffect, useState } from 'react';
import {
    CheckCircle2, AlertTriangle,
    Thermometer, BookOpen, FileText,
    BarChart3, Zap, BrainCircuit, Hash,
    ShieldCheck, AlertOctagon, RotateCcw
} from 'lucide-react';

const AnalysisDashboard = ({ result, theme: currentTheme, onReset }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [result]);

    if (!result) return null;

    const isReal = result.label === 'REAL';
    const analysis = result.analysis || {};
    const confidence = result.confidence || 0;

    // Theme configuration based on Result + Global Theme
    const isNewspaper = currentTheme === 'newspaper';

    const resultStyles = isReal ? {
        // Real News Styles
        bg: isNewspaper ? 'bg-stone-100/90' : 'bg-slate-50/90',
        border: isNewspaper ? 'border-stone-400' : 'border-slate-300',
        text: isNewspaper ? 'text-stone-900' : 'text-slate-800',
        subText: isNewspaper ? 'text-stone-600' : 'text-slate-600',
        icon: <CheckCircle2 className={`h-8 w-8 flex-shrink-0 ${isNewspaper ? 'text-stone-800' : 'text-slate-700'}`} />,
        barFill: isNewspaper ? 'bg-stone-700' : 'bg-slate-700',
        accentBg: isNewspaper ? 'bg-white' : 'bg-slate-100',
        message: 'Likely Authentic',
        desc: 'This content aligns with patterns found in reliable news sources.'
    } : {
        // Fake News Styles
        bg: isNewspaper ? 'bg-stone-200/90' : 'bg-rose-50/90',
        border: isNewspaper ? 'border-stone-500' : 'border-rose-300',
        text: isNewspaper ? 'text-stone-900' : 'text-rose-900',
        subText: isNewspaper ? 'text-stone-700' : 'text-rose-700',
        icon: <AlertTriangle className={`h-8 w-8 flex-shrink-0 ${isNewspaper ? 'text-stone-900' : 'text-rose-500'}`} />,
        barFill: isNewspaper ? 'bg-stone-900' : 'bg-rose-500',
        accentBg: isNewspaper ? 'bg-stone-300' : 'bg-rose-100',
        message: 'Potential Fake News',
        desc: 'This content exhibits significant characteristics often associated with misinformation.'
    };

    // Semantic Color Helpers - Mapped to Pink/Grey/Yellow
    const getToneColor = (tone) => {
        if (isNewspaper) return 'text-stone-800 bg-stone-100 border-stone-300';
        if (tone === 'Aggressive / Angry') return 'text-rose-700 bg-rose-50 border-rose-200';
        if (tone === 'Alarmist / Fearful') return 'text-rose-600 bg-white border-rose-100';
        if (tone === 'Highly Emotional') return 'text-amber-700 bg-amber-50 border-amber-200';
        return 'text-slate-700 bg-white border-slate-200'; // Neutral/Calm
    };

    const getObjectivityColor = (label) => {
        if (isNewspaper && label === 'Highly Subjective/Opinionated') return 'text-stone-900 bg-stone-200 border-stone-400';
        if (label === 'Highly Subjective/Opinionated') return 'text-rose-700 bg-rose-50 border-rose-200';
        return isNewspaper ? 'text-stone-700 bg-white border-stone-200' : 'text-slate-700 bg-white border-slate-200'; // Facts
    };

    const getClickbaitColor = (score) => {
        if (isNewspaper) return 'text-stone-800 from-stone-400 to-stone-600';
        if (score > 70) return 'text-rose-700 from-rose-400 to-rose-600';
        if (score > 40) return 'text-amber-700 from-amber-300 to-amber-500';
        return 'text-slate-700 from-slate-400 to-slate-500';
    };

    // Micro-Insights Helper
    const getInsight = (type, value) => {
        switch (type) {
            case 'tone':
                if (value.includes('Angry')) return 'Uses aggressive or inflammatory language.';
                if (value.includes('Fearful')) return 'Uses alarmist language to provoke anxiety.';
                if (value.includes('Emotional')) return 'Relies heavily on emotional appeals.';
                return 'Maintains a neutral and professional tone.';
            case 'objectivity':
                if (value.includes('Subjective')) return 'Primarily opinion-based statements.';
                return 'Focuses on factual reporting.';
            case 'complexity':
                if (value.includes('Easy')) return 'Simple language, accessible to all.';
                if (value.includes('Complex')) return 'Similar to academic or legal writing.';
                return 'Standard readability for general audiences.';
            case 'topic':
                return `Categorized as ${value} patterns.`;
            default:
                return '';
        }
    };

    // Helper to inject <wbr> and &shy; for smarter breaking
    const formatValue = (val) => {
        if (typeof val !== 'string') return val;

        // Manual replacements for known long terms
        let formatted = val
            .replace('Subjective', 'Subject\u00ADive') // &shy;
            .replace('Academic/Legal', 'Academic<wbr>/Legal');

        // Allow breaking after slashes broadly if not caught above
        if (!formatted.includes('<wbr>')) {
            formatted = formatted.split('/').join('/<wbr>');
        }

        // Render HTML-like string safely (using a parser or simple split/map to avoid dangerouslySetInnerHTML if possible, 
        // but given the specific replacements, mapping parts is safer)

        // Simple parser for <wbr> and \u00AD (soft hyphen renders naturally)
        return formatted.split('<wbr>').map((part, index, arr) => (
            <React.Fragment key={index}>
                {part}
                {index < arr.length - 1 && <wbr />}
            </React.Fragment>
        ));
    };

    const MetricCard = ({ icon: Icon, label, value, subValue, colorClass, insight }) => (
        <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[180px] w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colorClass || 'bg-white/60 border-white/60 shadow-sm'}`}>
            <div className="flex items-start gap-3 w-full mb-2">
                <div className={`p-2.5 rounded-xl bg-white/80 shadow-sm flex-shrink-0 mt-0.5`}>
                    <Icon size={20} className="opacity-80" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                    <h3 className="font-semibold break-words text-balance"
                        style={{
                            fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                            fontWeight: 600,
                            lineHeight: 1.3,
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            hyphens: 'manual',
                            maxWidth: '100%'
                        }}>
                        {formatValue(value)}
                    </h3>
                </div>
            </div>

            <div className="w-full pt-3 border-t border-black/5">
                <p className="text-[0.9rem] font-medium opacity-80 leading-[1.4] break-words">
                    {insight}
                </p>
            </div>
        </div>
    );

    return (
        <div
            className={`
                mt-8 rounded-3xl border border-white/60 shadow-2xl shadow-secondary-900/10
                backdrop-blur-xl overflow-hidden transition-all duration-700 ease-out
                ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            {/* 1. Verified Badge / Summary Header */}
            <div className={`${resultStyles.bg} p-8 border-b border-white/40 text-center relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full bg-white/40 shadow-sm backdrop-blur-sm`}>
                        {isReal ? <ShieldCheck size={36} className="text-slate-600" /> : <AlertOctagon size={36} className={`${isNewspaper ? 'text-stone-900' : 'text-rose-500'}`} />}
                    </div>

                    <h2 className={`text-3xl sm:text-4xl font-bold font-heading ${resultStyles.text} tracking-tight`}>
                        {result.confidence.toFixed(0)}% Confidence
                    </h2>

                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <button
                            onClick={onReset}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white/80 hover:bg-white/40 hover:text-white transition-all shadow-sm"
                            title="Start New Analysis"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            onClick={() => {
                                const text = `Veritas Analysis Result:\nVerdict: ${result.label} (${result.confidence.toFixed(0)}%)\nSummary: ${isReal ? 'Likely Authentic' : 'Potential Fake News'}\nDetected Topic: ${analysis.topic}`;
                                navigator.clipboard.writeText(text);
                                alert("Analysis summary copied to clipboard!");
                            }}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white/80 hover:bg-white/40 hover:text-white transition-all shadow-sm"
                            title="Copy Report"
                        >
                            <FileText size={18} />
                        </button>
                    </div>

                    <p className={`text-base sm:text-lg font-medium max-w-lg mx-auto ${resultStyles.subText} opacity-90 leading-relaxed`}>
                        {isReal
                            ? "Content appears mostly neutral and informational."
                            : "Potentially misleading due to emotional wording or sensationalism."}
                    </p>
                </div>
            </div>

            {/* 2. Responsive Grid for Metrics */}
            <div className="bg-white/80 p-6 sm:p-8">
                {/* Auto-fit grid */}
                <div className="grid gap-6 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>

                    {/* Sentiment Analysis (Donut Chart) */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between min-h-[180px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
                                <Thermometer size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Sentiment</p>
                        </div>

                        <div className="flex items-center justify-center relative h-32 w-32 self-center">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                {/* Background Circle */}
                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                                {/* Sentiment Arc */}
                                <path
                                    className={`${analysis.sentiment === 'Positive' ? 'text-emerald-500' : analysis.sentiment === 'Negative' ? 'text-rose-500' : 'text-slate-400'} transition-all duration-1000 ease-out`}
                                    strokeDasharray={`${analysis.sentiment === 'Neutral' ? 33 : 66}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className={`text-sm font-bold ${analysis.sentiment === 'Positive' ? 'text-emerald-600' : analysis.sentiment === 'Negative' ? 'text-rose-600' : 'text-slate-600'}`}>
                                    {analysis.sentiment}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-400 mt-2">{analysis.objectivity}</p>
                    </div>

                    {/* Content Dimensions (Radar-like Bars) */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[180px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                                <BrainCircuit size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Dimensions</p>
                        </div>

                        <div className="flex flex-col gap-3 flex-grow justify-center">
                            {[
                                { label: 'Tone Intensity', val: analysis.tone.includes('Neutral') ? 20 : 80, color: 'bg-rose-400' },
                                { label: 'Complexity', val: analysis.reading_score > 60 ? 30 : 80, color: 'bg-indigo-400' },
                                { label: 'Bias Indicator', val: analysis.objectivity?.includes('Subjective') ? 85 : 15, color: 'bg-amber-400' },
                            ].map((item, i) => (
                                <div key={i} className="w-full">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                                        <span>{item.label}</span>
                                        <span>{item.val}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clickbait Meter */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between min-h-[180px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
                                <Zap size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Clickbait Score</p>
                                <h3 className={`text-3xl font-bold leading-tight ${getClickbaitColor(analysis.clickbait_score).split(' ')[0]}`}>
                                    {analysis.clickbait_score || 0}<span className="text-lg opacity-40 font-normal">/100</span>
                                </h3>
                            </div>
                        </div>

                        {/* Gradient Progress Bar */}
                        <div className="block w-full mt-4">
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                                <div
                                    className={`h-full absolute top-0 left-0 bg-gradient-to-r ${getClickbaitColor(analysis.clickbait_score).split(' ').slice(1).join(' ')} transition-all duration-1000 ease-out`}
                                    style={{ width: `${analysis.clickbait_score}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Higher score indicates more sensationalism.</p>
                        </div>
                    </div>

                    {/* Flagged Keywords (Spans full width if needed) */}
                    {analysis.flagged_keywords && analysis.flagged_keywords.length > 0 && (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 flex-shrink-0">
                                    <AlertTriangle size={20} strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Flagged Triggers</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysis.flagged_keywords.map((k, i) => (
                                    <div key={i} className="group relative">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-help transition-colors
                                            ${k.category === 'Aggressive' ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' :
                                                k.category === 'Fearmongering' ? 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'}`}>
                                            {k.word}
                                        </span>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                            Flagged as {k.category} language.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* 3. Updated Disclaimer */}
            <div className="bg-gray-50 p-5 text-center border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
                    This analysis highlights writing patterns and structural signals. It does not confirm accuracy or truth. Always verify with trusted sources.
                </p>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
