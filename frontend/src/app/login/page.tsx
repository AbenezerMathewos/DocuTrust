'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Link from 'next/link';

const DEMO_ACCOUNTS = [
  { label: '🏛️ INSA Admin', email: 'admin@insa.gov.et', password: 'password123', color: 'bg-red-50 border-red-200 hover:border-red-400', badge: 'bg-red-100 text-red-700' },
  { label: '🎓 University', email: 'aau@university.edu.et', password: 'password123', color: 'bg-blue-50 border-blue-200 hover:border-blue-400', badge: 'bg-blue-100 text-blue-700' },
  { label: '👤 Student', email: 'student@gmail.com', password: 'password123', color: 'bg-teal-50 border-teal-200 hover:border-teal-400', badge: 'bg-teal-100 text-teal-700' },
];

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

  const quickLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
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
          <p className="text-slate-400 mb-8">Cryptographically secured credentials. Instant verification. Built for Digital Ethiopia 2025.</p>

          {/* Demo Accounts */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">Quick Demo Login</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email} onClick={() => quickLogin(acc)}
                  className={`w-full text-left border rounded-xl p-3 transition-all ${acc.color} flex justify-between items-center`}>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${acc.badge} mr-2`}>{acc.label}</span>
                    <span className="text-xs text-gray-600">{acc.email}</span>
                  </div>
                  <span className="text-xs text-gray-400">password123</span>
                </button>
              ))}
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
