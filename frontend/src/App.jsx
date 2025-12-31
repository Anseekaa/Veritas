import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Header from './components/Header'
import NewsInput from './components/NewsInput'
import UrlScanner from './components/UrlScanner'
import LiveEditor from './components/LiveEditor'
import AnalyzeButton from './components/AnalyzeButton'
import AnalysisDashboard from './components/AnalysisDashboard'
import AssistantPanel from './components/AssistantPanel'
import HistoryPanel from './components/HistoryPanel'
import ThemeToggle from './components/ThemeToggle'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [theme, setTheme] = useState('light')

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('analysis_history')
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch (e) { }
    }
  }, [])

  // Save history on change
  useEffect(() => {
    localStorage.setItem('analysis_history', JSON.stringify(history))
  }, [history])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (text.trim() && !loading) handlePredict();
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [text, loading])

  const addToHistory = (txt, res) => {
    const newItem = {
      id: Date.now(),
      text: txt,
      result: res,
      timestamp: Date.now()
    }
    setHistory(prev => [newItem, ...prev].slice(0, 10)) // Keep last 10
  }

  const handlePredict = async (inputText = text) => {
    if (!inputText.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Sending request to backend...");
      console.log("Sending request to backend...");
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      })

      console.log("Response received:", response.status);

      if (!response.ok) {
        throw new Error('Failed to get prediction')
      }

      const data = await response.json()
      console.log("Data received:", data);
      setResult(data)
      addToHistory(inputText, data)
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Expanded list of diverse sample texts
  const sampleTexts = [
    "Breaking: Secret alien city discovered under Times Square! Government confirms contact with extraterrestrials in shocking press conference.", // Fake (Sensational/Clickbait)
    "The Federal Reserve announced a 0.25% interest rate hike today, aimed at curbing inflation while maintaining economic stability.", // Real (Finance)
    "Shocking report: Drinking water from a garden hose increases IQ by 50 points! Doctors are baffled.", // Fake (Health/Clickbait)
    "NASA's James Webb Space Telescope captures stunning new details of the Pillars of Creation, revealing previously unseen stars.", // Real (Science)
    "Celebrity admits to being a time traveler from the year 3000, warns of impending robot uprising next Tuesday.", // Fake (Entertainment/Absurd)
    "New study published in Nature suggests that global deforestation rates have slowed down by 15% over the last decade.", // Real (Environment)
    "Government to ban all forms of pizza by 2026 to force citizens to eat more broccoli, says leaked memo.", // Fake (Politics/Alarmist)
    "Local city council approves finalized budget plan for new downtown park and recreation center, set to open in 2025.", // Real (Local News)
    "You won't believe this one weird trick that makes car insurance companies hate you! Save $1000s instantly.", // Fake (Clickbait/Scam)
    "The World Health Organization declares the recent outbreak effectively contained, thanking international cooperation efforts.", // Real (Health)
  ];

  const handleSample = () => {
    // Pick a random sample different from the current one
    let newText;
    do {
      const randomIndex = Math.floor(Math.random() * sampleTexts.length);
      newText = sampleTexts[randomIndex];
    } while (newText === text && sampleTexts.length > 1);

    setText(newText);
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-500
        ${theme === 'newspaper' ? 'bg-gray-50 font-heading text-gray-900' :
          theme === 'dark' ? 'bg-slate-900 font-sans text-slate-100' :
            'font-sans text-slate-800'}
      `}
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: '500px auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top center',
        backgroundAttachment: 'fixed',
      }}
    >
      <ThemeToggle theme={theme} setTheme={setTheme} />

      {/* Specific Background Overlay for Transparency & Tint */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500
        ${theme === 'newspaper' ? 'bg-white/70 mix-blend-hard-light' :
          theme === 'dark' ? 'bg-slate-950/90' :
            'bg-[rgba(255,240,245,0.55)] backdrop-blur-[1px]'}
      `}></div>

      <div className="w-full max-w-[700px] relative z-10 animate-fade-in-up flex flex-col gap-8">
        {/* Header Component (Self-contained glass card) */}
        <Header onReset={handleReset} />

        {/* Form Card */}
        <div className="bg-gradient-to-b from-white/65 to-white/35 backdrop-blur-md rounded-3xl shadow-xl shadow-secondary-900/5 p-6 sm:p-10 border border-white/50">
          {result ? (
            <LiveEditor
              initialText={text}
              result={result}
              onAnalyze={(newText) => {
                setText(newText);
                return handlePredict(newText);
              }}
            />
          ) : (
            <>
              <NewsInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
              />

              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-secondary-200 flex-grow"></div>
                <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">OR</span>
                <div className="h-px bg-secondary-200 flex-grow"></div>
              </div>

              <UrlScanner onScan={(scannedText) => setText(scannedText)} disabled={loading} />

              <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
                <AnalyzeButton
                  onClick={() => handlePredict()}
                  loading={loading}
                  disabled={!text.trim() || loading}
                />

                <button
                  onClick={handleSample}
                  disabled={loading}
                  className="text-sm font-semibold text-secondary-500 hover:text-primary-600 transition-all hover:scale-105 underline decoration-dotted underline-offset-4 py-2 px-4 whitespace-nowrap"
                >
                  Try Sample Text
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r flex items-center animate-shake">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* New Analysis Dashboard */}
          <AnalysisDashboard result={result} theme={theme} onReset={handleReset} />

          {/* Assistant Panel */}
          <AssistantPanel result={result} />

          {/* History Panel */}
          <HistoryPanel
            history={history}
            onLoad={(item) => {
              setText(item.text);
              setResult(item.result);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClear={() => setHistory([])}
          />
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          &copy; {new Date().getFullYear()} AI Verification Lab.
        </p>
      </div>
    </div>
  )
}

export default App

