import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wand2, Check } from 'lucide-react';
import debounce from 'lodash.debounce';

const LiveEditor = ({ initialText, onAnalyze, result }) => {
    const [text, setText] = useState(initialText);
    const [autoAnalyze, setAutoAnalyze] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Debounced analysis function
    const debouncedAnalyze = useCallback(
        debounce((newText) => {
            if (newText.trim()) {
                setIsAnalyzing(true);
                onAnalyze(newText).finally(() => setIsAnalyzing(false));
            }
        }, 1000),
        [onAnalyze]
    );

    useEffect(() => {
        if (autoAnalyze && text !== initialText) {
            debouncedAnalyze(text);
        }
        return () => debouncedAnalyze.cancel();
    }, [text, autoAnalyze, debouncedAnalyze, initialText]);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleRewrite = (type) => {
        let newText = text;
        if (type === 'neutral') {
            // Simple heuristic to remove sensation
            newText = newText.replace(/!+/g, '.').replace(/BREAKING:/gi, '').replace(/SHOCKING:/gi, '');
        } else if (type === 'formal') {
            // Capitalize first letters, remove slang (mock)
            newText = newText.replace(/\b(wanna)\b/gi, 'want to').replace(/\b(gonna)\b/gi, 'going to');
        } else if (type === 'de-clickbait') {
            newText = newText.replace(/You won't believe/gi, 'It is surprising').replace(/destroys/gi, 'criticizes');
        }
        setText(newText);
    };

    return (
        <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-lg animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary-500" />
                    Live Editor
                </h3>

                <div className="flex items-center gap-2 bg-white/60 p-1.5 rounded-full border border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 px-2">Auto-Analyze</span>
                    <button
                        onClick={() => setAutoAnalyze(!autoAnalyze)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${autoAnalyze ? 'bg-primary-500' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoAnalyze ? 'translate-x-4' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="relative group">
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    className="w-full p-4 border border-slate-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-h-[200px] text-slate-900 leading-relaxed resize-y transition-all"
                />
                {isAnalyzing && (
                    <div className="absolute top-2 right-2">
                        <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-xs font-semibold text-slate-500 w-full mb-1 uppercase tracking-wide">Quick Rewrites:</p>
                <button onClick={() => handleRewrite('neutral')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors font-medium">
                    Neutral Tone
                </button>
                <button onClick={() => handleRewrite('de-clickbait')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors font-medium">
                    Less Clickbait
                </button>
                <button onClick={() => handleRewrite('formal')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors font-medium">
                    More Formal
                </button>
            </div>
        </div>
    );
};

export default LiveEditor;
