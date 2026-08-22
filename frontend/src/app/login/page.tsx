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

          {/* Cryptographic Visual */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float {
              0%, 100% { transform: translateY(0) scale(1.05); }
              50% { transform: translateY(-8px) scale(1.08); }
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scan {
              animation: scan 4s linear infinite;
            }
          `}} />
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 group aspect-square md:aspect-[4/5] lg:aspect-square">
            {/* Dynamic Overlay */}
            <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay animate-pulse z-10 pointer-events-none"></div>
            
            {/* Cryptographic Laser Scanner */}
            <div className="absolute left-0 right-0 h-1 bg-blue-400/50 blur-[1px] shadow-[0_0_15px_3px_rgba(59,130,246,0.6)] z-15 animate-scan pointer-events-none"></div>

            {/* Country Watermark Overlay */}
            <div className="absolute top-6 left-6 z-20 flex flex-col pointer-events-none select-none">
              <span className="text-3xl md:text-4xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] opacity-90">Ethiopia</span>
              <span className="text-2xl md:text-3xl font-bold text-blue-400 tracking-wider drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] opacity-90">ኢትዮጲያ</span>
            </div>

            <img 
              src="/crypto_lock.jpg" 
              alt="Cryptographic Security Matrix" 
              className="w-full h-full object-cover animate-float opacity-90"
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-20">
              <div className="text-xs text-blue-300 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                SHA-256 ENCRYPTION ACTIVE
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
