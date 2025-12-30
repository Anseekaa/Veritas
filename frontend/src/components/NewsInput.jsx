import React, { useState } from 'react';

const NewsInput = ({ value, onChange, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const text = event.target.result;
                    onChange({ target: { value: text } });
                };
                reader.readAsText(file);
            }
        } else {
            const text = e.dataTransfer.getData('text');
            if (text) {
                onChange({ target: { value: text } });
            }
        }
    };

    const handlePaste = (e) => {
        // Optional: Trigger auto-analyze logic via parent if needed
    };

    return (
        <div className="mb-8 relative group">
            <div className="flex justify-between items-end mb-2 ml-1">
                <label
                    htmlFor="news-content"
                    className="block text-sm font-semibold text-slate-700 uppercase tracking-wide opacity-80"
                >
                    News Content
                </label>
                <span className="text-xs text-slate-400 font-medium italic">
                    Paste text, drop a .txt file, or use URL below
                </span>
            </div>

            <div
                className={`relative transition-all duration-300 ${isDragging ? 'scale-[1.02]' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="absolute inset-0 z-10 bg-primary-500/10 backdrop-blur-sm border-2 border-dashed border-primary-500 rounded-2xl flex items-center justify-center pointer-events-none animate-pulse">
                        <span className="text-primary-700 font-bold text-lg bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                            Drop text file here
                        </span>
                    </div>
                )}

                <textarea
                    id="news-content"
                    className={`w-full p-[18px] border transition-all duration-300 ease-out rounded-2xl min-h-[220px] resize-y shadow-sm hover:shadow-md text-slate-900 placeholder:text-slate-400 text-sm sm:text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed font-sans selection:bg-primary-100 selection:text-primary-900 ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white/80 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                        }`}
                    placeholder="Paste the news article text, drag & drop a .txt file, or type here..."
                    value={value}
                    onChange={onChange}
                    onPaste={handlePaste}
                    disabled={disabled}
                    aria-label="News content input"
                />

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-primary-200 rounded-tr-xl pointer-events-none group-focus-within:border-primary-500 transition-colors duration-300"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-slate-200 rounded-bl-xl pointer-events-none group-focus-within:border-secondary-500 transition-colors duration-300"></div>
            </div>
            <div className="flex justify-end mt-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${value.length > 0 ? 'bg-slate-100 text-slate-600' : 'text-slate-400'}`}>
                    {value.length} chars
                </span>
            </div>
        </div>
    );
};

export default NewsInput;
