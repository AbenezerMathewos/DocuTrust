'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, login, token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user) {
      setName(user.name || '');
      setStudentId(user.studentId || '');
    }
  }, [isAuthenticated, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/certificates/me', { name, studentId });
      // Update local user in context
      const updatedUser = { ...user, name: res.data.data.name, studentId: res.data.data.studentId };
      login(token!, updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs font-mono text-blue-200/20 mb-2">sha256: profile... identity... verified...</div>
          <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-0.5 rounded-full uppercase">⚙️ My Profile</span>
          <h1 className="text-2xl font-bold mt-2">Account Settings</h1>
          <p className="text-blue-200 text-sm mt-0.5">Update your personal details and student ID</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Account Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Email</p>
            <p className="text-sm font-semibold text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1 mt-3">Role</p>
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
              user?.role === 'root_admin' ? 'bg-red-100 text-red-700' :
              user?.role === 'issuer' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>{user?.role}</span>
          </div>

          {message && (
            <div className={`text-sm rounded-lg p-3 mb-5 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
            </div>
            {user?.role === 'holder' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="e.g. STU-12345" />
                <p className="text-xs text-gray-400 mt-1">Your student ID links your account to certificates issued by your institution.</p>
              </div>
            )}
            <button type="submit" disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
