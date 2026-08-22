'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Link from 'next/link';

const ROLES = [
  { value: 'holder', label: '👤 Citizen / Student', desc: 'Receive and store your verified credentials' },
  { value: 'issuer', label: '🎓 University / Institution', desc: 'Issue and manage official certificates' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('holder');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password, role, studentId: role === 'holder' ? studentId : undefined });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-xs font-mono text-blue-400/40 mb-3 tracking-widest">sha256: a3f8b2c1d9e4f7a0b5c2...</div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join Ethiopia's Document Trust Network</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">I am registering as:</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`text-left border-2 rounded-xl p-3 transition-all ${role === r.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-semibold text-sm text-gray-800">{r.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="your@email.com" />
            </div>
            {role === 'holder' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="e.g. STU-12345" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="Min 6 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Creating account...' : `Register as ${role === 'holder' ? 'Citizen' : 'Institution'} →`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
