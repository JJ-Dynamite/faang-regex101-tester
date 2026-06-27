'use client';

import { useState } from 'react';

export default function Home() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState('g');

  const commonPatterns = [
    { name: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    { name: 'URL', pattern: '^https?://[^\\s]+$' },
    { name: 'Phone', pattern: '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$' },
    { name: 'IP Address', pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$' },
  ];

  const handleTest = async () => {
    if (!pattern || !testString) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, test_string: testString, flags }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🔢</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Regex101 Tester
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Instantly test any regular expression</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <label className="block text-sm font-semibold text-emerald-400 mb-2">Regular Expression</label>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xl">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-emerald-400 text-xl">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="w-12 px-2 py-3 bg-slate-700 border border-slate-600 rounded-xl text-emerald-400 text-center font-mono"
                placeholder="gi"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <label className="block text-sm font-semibold text-emerald-400 mb-2">Test String</label>
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter test string..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
          <button
            onClick={handleTest}
            disabled={!pattern || !testString || loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🧪 Test Regex'}
          </button>
        </div>

        {result && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-emerald-400">Result</h3>
              <span className={`px-4 py-2 rounded-full font-semibold ${
                result.is_valid 
                  ? 'bg-green-500/20 text-green-400 border border-green-500'
                  : 'bg-red-500/20 text-red-400 border border-red-500'
              }`}>
                {result.is_valid ? 'Valid Pattern' : 'Invalid Pattern'}
              </span>
            </div>
            
            <div className="mb-4 p-4 bg-slate-700/30 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Explanation</p>
              <p className="text-gray-200">{result.explanation}</p>
            </div>

            {result.matches?.length > 0 && (
              <div>
                <h4 className="font-semibold text-emerald-400 mb-3">Matches ({result.matches.length})</h4>
                <div className="space-y-2">
                  {result.matches.map((match: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="font-mono text-emerald-400">{match.value}</span>
                      <span className="text-gray-400 text-sm">Position: {match.start}-{match.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.test_string && (
              <div className="mt-4 p-4 bg-slate-900 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Highlighted Matches:</p>
                <p className="font-mono text-gray-200">
                  {result.test_string.split('').map((char: string, i: number) => {
                    const isMatch = result.matches?.some((m: any) => i >= m.start && i < m.end);
                    return (
                      <span key={i} className={isMatch ? 'bg-emerald-500/30 text-emerald-300 px-0.5 rounded' : ''}>
                        {char}
                      </span>
                    );
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Common Patterns</h3>
          <div className="grid grid-cols-2 gap-3">
            {commonPatterns.map((cp, i) => (
              <button
                key={i}
                onClick={() => { setPattern(cp.pattern); setTestString('test@example.com'); }}
                className="p-3 bg-slate-700/30 rounded-lg text-left hover:bg-slate-700/50 transition-colors"
              >
                <p className="font-semibold text-sm text-emerald-400">{cp.name}</p>
                <p className="text-xs text-gray-500 font-mono truncate">{cp.pattern}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
