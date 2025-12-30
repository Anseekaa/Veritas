import React from 'react';
import { History, Clock, ArrowRight, Trash2 } from 'lucide-react';

const HistoryPanel = ({ history, onLoad, onClear }) => {
    if (!history || history.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2 text-slate-600">
                    <History size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Generic History ({history.length})</h3>
                </div>
                <button
                    onClick={onClear}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    <Trash2 size={12} />
                    Clear
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {history.map((item, index) => (
                    <div
                        key={item.id || index}
                        onClick={() => onLoad(item)}
                        className="bg-white/40 border border-white/60 p-4 rounded-xl cursor-pointer hover:bg-white/80 hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${item.result.label === 'FAKE' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                {item.result.label}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2 font-medium mb-2">
                            {item.text}
                        </p>
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                                Reload <ArrowRight size={12} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
