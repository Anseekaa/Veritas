import React, { useState, useRef, useEffect } from 'react';
import { Bot, HelpCircle, ChevronRight, MessageSquare, BookOpen, GraduationCap } from 'lucide-react';

const AssistantPanel = ({ result }) => {
    const [activeTab, setActiveTab] = useState('simple'); // simple, professional
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef(null);

    const analysis = result?.analysis || {};
    const label = result?.label;

    useEffect(() => {
        // Reset messaging on new result
        if (result) {
            setMessages([{
                type: 'bot',
                text: `I've analyzed this text. It appears to be roughly ${result?.confidence?.toFixed(0)}% ${label === 'FAKE' ? 'unreliable' : 'reliable'}. How can I help you understand this result?`
            }]);
        }
    }, [result, label]);

    const generateExplanation = (mode) => {
        let text = "";
        if (mode === 'simple') {
            text = `Basically, this article is written at a ${analysis.reading_level} level. `;
            if (analysis.clickbait_score > 50) text += "It tries to grab your attention with flashy headlines. ";
            if (analysis.tone?.includes('Angry')) text += "The author seems pretty angry or aggressive. ";
            text += `Overall, it's mostly ${analysis.sentiment?.toLowerCase()}.`;
        } else {
            text = `Analysis indicates a Flesch reading ease score of ${analysis.reading_score}, categorizing the text as ${analysis.reading_level}. `;
            text += `Linguistic markers suggest a ${analysis.objectivity} stance with ${analysis.sentiment} polarity. `;
            text += `The clickbait index is ${analysis.clickbait_score}/100, driven by ${analysis.tone} tonal patterns.`;
        }

        setMessages(prev => [
            ...prev,
            { type: 'user', text: `Explain in ${mode} terms` },
            { type: 'bot', text: text }
        ]);
    };

    const handleQuestion = (q) => {
        let answer = "";
        switch (q) {
            case 'Why is this flagged?':
                answer = label === 'FAKE'
                    ? `It was flagged because it matches patterns found in misinformation: extensive use of emotional language (${analysis.tone}), low objectivity, and high clickbait potential.`
                    : "It wasn't flagged as fake, but we still detected some bias. However, it generally follows standard reporting patterns.";
                break;
            case 'What checks should I do?':
                answer = "1. Verify the source domain. 2. Cross-check quotes with other major outlets. 3. Reverse image search any photos. 4. Check the author's other recent work.";
                break;
            case 'Show similar examples':
                answer = "Common similar patterns include: 'You won't believe what happened next', 'The secret doctors don't want you to know', or politically charged rants without sources.";
                break;
            default:
                answer = "I'm not sure about that specific detail, but check the dashboard charts for more info.";
        }

        setMessages(prev => [
            ...prev,
            { type: 'user', text: q },
            { type: 'bot', text: answer }
        ]);
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!result) return null;

    return (
        <div className="mt-8 bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl overflow-hidden shadow-xl animate-fade-in-up">
            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Verdict Assistant</h3>
                    <p className="text-xs text-indigo-600">Ask me about the analysis</p>
                </div>
            </div>

            <div className="flex flex-col h-[350px]">
                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-grow p-6 overflow-y-auto space-y-4 scroll-smooth"
                >
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="p-4 bg-white/80 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Suggested Actions</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                        <button
                            onClick={() => generateExplanation('simple')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                            <BookOpen size={14} />
                            Simple Explanation
                        </button>
                        <button
                            onClick={() => generateExplanation('professional')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                            <GraduationCap size={14} />
                            Professional Detail
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['Why is this flagged?', 'What checks should I do?', 'Show similar examples'].map(q => (
                            <button
                                key={q}
                                onClick={() => handleQuestion(q)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                            >
                                <HelpCircle size={12} />
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantPanel;
