'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InstitutionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', contactEmail: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user && user.role !== 'root_admin') { router.push('/dashboard'); return; }
    fetchInstitutions();
  }, [isAuthenticated, user]);

  const fetchInstitutions = async () => {
    try {
      const res = await api.get('/institutions');
      setInstitutions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/institutions', form);
      setMessage({ type: 'success', text: `✅ Institution "${form.name}" onboarded successfully with Ed25519 keypair generated.` });
      setForm({ name: '', code: '', contactEmail: '' });
      setShowForm(false);
      fetchInstitutions();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create institution' });
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await api.patch(`/institutions/${id}/status`);
      setMessage({ type: 'success', text: `${name} has been ${currentStatus ? 'deactivated' : 'activated'}.` });
      fetchInstitutions();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-mono text-blue-200/20 mb-2">sha256: institution... trusted... authorized...</div>
          <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-0.5 rounded-full uppercase">🏛️ Institution Management</span>
          <h1 className="text-2xl font-bold mt-2">Trusted Network Registry</h1>
          <p className="text-blue-200 text-sm mt-0.5">Onboard and manage authorized certificate-issuing institutions</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {message && (
          <div className={`text-sm rounded-xl p-4 mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-800">Registered Institutions ({institutions.length})</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            {showForm ? '✕ Cancel' : '+ Onboard New Institution'}
          </button>
        </div>

        {/* Onboarding Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">New Institution Onboarding</h3>
            <p className="text-xs text-gray-500 mb-4">A unique Ed25519 cryptographic keypair will be automatically generated for this institution.</p>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Institution Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-black focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Addis Ababa University" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Institution Code</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-black focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  placeholder="e.g. AAU" maxLength={10} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
                <input required type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-black focus:ring-2 focus:ring-blue-500"
                  placeholder="registrar@uni.edu.et" />
              </div>
              <div className="md:col-span-3">
                <button type="submit" disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                  {submitting ? 'Generating Keys & Onboarding...' : '🔐 Generate Keypair & Onboard'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Institutions Table */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading institutions...</p>
        ) : institutions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400">No institutions onboarded yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institution</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {institutions.map((inst: any) => (
                  <tr key={inst._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{inst.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-blue-600 bg-blue-50 rounded">{inst.code}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{inst.contactEmail}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inst.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {inst.isActive ? '✅ Active' : '🚫 Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(inst._id, inst.isActive, inst.name)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${inst.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {inst.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
