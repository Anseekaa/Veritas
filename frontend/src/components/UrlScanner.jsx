import React, { useState } from 'react';
import { Link, Loader2 } from 'lucide-react';

const UrlScanner = ({ onScan, disabled }) => {
    const [url, setUrl] = useState('');
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        setScanning(true);
        setError(null);
        try {
            const response = await fetch('/scan-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to scan URL');
            }

            const data = await response.json();
            onScan(data.text);
            setUrl(''); // Clear after success
        } catch (err) {
            setError(err.message);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="mb-6">
            <form onSubmit={handleScan} className="flex gap-2 relative">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Link className="h-4 w-4" />
                    </div>
                    <input
                        type="url"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm shadow-sm placeholder:text-slate-400 text-slate-900"
                        placeholder="Or paste a URL to analyze..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={disabled || scanning}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!url.trim() || disabled || scanning}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium text-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                    {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan'}
                </button>
            </form>
            {error && (
                <p className="text-xs text-red-500 mt-2 ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default UrlScanner;
