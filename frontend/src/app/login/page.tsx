'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

        {/* Left: Branding */}
        <div className="text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl font-bold">D</div>
            <span className="text-2xl font-bold">DocuTrust</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Ethiopia's National<br/>
            <span className="text-blue-400">Document Trust</span><br/>
            Infrastructure
          </h1>
          <p className="text-slate-400 mb-8">Cryptographically secured credentials. Instant verification. Built for Digital Ethiopia 2030.</p>

          {/* Security Status Panel */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">Live System Integrity</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">Cryptography Node</div>
                    <div className="text-xs text-slate-400">Ed25519 Keys Active</div>
                  </div>
                </div>
                <span className="text-xs text-green-400 font-mono bg-green-400/10 px-2 py-1 rounded border border-green-400/20">SECURE</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">FAYDA Integration</div>
                    <div className="text-xs text-slate-400">National ID Sync</div>
                  </div>
                </div>
                <span className="text-xs text-blue-400 font-mono bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">ONLINE</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">Ledger Status</div>
                    <div className="text-xs text-slate-400">SHA-256 Anchoring</div>
                  </div>
                </div>
                <span className="text-xs text-purple-400 font-mono bg-purple-400/10 px-2 py-1 rounded border border-purple-400/20">SYNCED</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 font-mono flex flex-col gap-1">
                <span>&gt; System ready for credential issuance.</span>
                <span className="text-blue-400">&gt; Waiting for secure authentication...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Access your role-based dashboard</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Don't have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
