'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchMyDocuments();
  }, [isAuthenticated]);

  const fetchMyDocuments = async () => {
    try {
      const res = await api.get('/certificates/my-documents');
      setDocuments(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certId: string) => {
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Download feature coming soon. Your certificate is securely stored in the system.');
    }
  };

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({ faydaId: '', institutionCode: 'HU', studentId: '', graduationYear: '' });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimMessage(null);
    try {
      const res = await api.post('/certificates/claim', claimForm);
      setClaimMessage({ type: 'success', text: res.data.message });
      fetchMyDocuments(); // Refresh wallet
      setTimeout(() => setShowClaimModal(false), 2000);
    } catch (error: any) {
      setClaimMessage({ type: 'error', text: error.response?.data?.message || 'Failed to claim document' });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Claim Legacy Document</h2>
            <p className="text-gray-500 text-sm mb-4">Link a historical university record to your wallet using your FAYDA FAN.</p>
            
            {claimMessage && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${claimMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {claimMessage.text}
              </div>
            )}

            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">FAYDA FAN (12+ digits)</label>
                <input required type="text" placeholder="e.g. 123456789012" value={claimForm.faydaId} onChange={e => setClaimForm({...claimForm, faydaId: e.target.value})} className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">University Code</label>
                <select required value={claimForm.institutionCode} onChange={e => setClaimForm({...claimForm, institutionCode: e.target.value})} className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="HU">Hawassa University (HU)</option>
                  <option value="AAU">Addis Ababa University (AAU)</option>
                  <option value="JU">Jimma University (JU)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Old Student ID</label>
                <input required type="text" placeholder="e.g. UGR/1234/98" value={claimForm.studentId} onChange={e => setClaimForm({...claimForm, studentId: e.target.value})} className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Graduation Year</label>
                <input required type="text" placeholder="e.g. 2005" value={claimForm.graduationYear} onChange={e => setClaimForm({...claimForm, graduationYear: e.target.value})} className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowClaimModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-bold">Cancel</button>
                <button type="submit" disabled={claimLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold flex justify-center items-center">
                  {claimLoading ? 'Verifying...' : 'Claim Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header — Blue consistent theme */}
      <div className="bg-blue-700 text-white px-6 py-8 relative overflow-hidden">
        <div className="text-xs font-mono text-blue-200/20 whitespace-nowrap overflow-hidden mb-2 select-none">
          sha256: a3f8b2...c9d6e3 | block#42 | verified | sha256: f0a7b4c8d5e2f9a0b6c3 ...
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-0.5 rounded-full uppercase">👤 Citizen Wallet</span>
          </div>
          <h1 className="text-2xl font-bold mt-1">My Digital Credentials</h1>
          <p className="text-blue-200 text-sm mt-0.5">Welcome back, <strong>{user?.name || 'Student'}</strong> — your tamper-proof documents</p>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold">{documents.length}</div>
              <div className="text-blue-200 text-xs">Credentials</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold">⛓️</div>
              <div className="text-blue-200 text-xs">Blockchain Anchored</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold">🔐</div>
              <div className="text-blue-200 text-xs">SHA-256 Secured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-800">Your Verified Credentials</h2>
          <div className="flex gap-3">
            <button onClick={() => setShowClaimModal(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
              🔍 Claim Legacy Document
            </button>
            <button onClick={() => router.push('/scan')}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
              📷 Scan & Verify
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading your credentials...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700">No Credentials Yet</h3>
            <p className="text-gray-400 mt-2 text-sm">Your university hasn't issued any digital certificates to your account yet.<br/>Contact your institution's registrar office.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {documents.map((doc: any) => (
              <div key={doc._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white relative">
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${doc.revocation?.isRevoked ? 'bg-red-500 text-white' : 'bg-green-400 text-green-900'}`}>
                    {doc.revocation?.isRevoked ? '🚫 Revoked' : '✅ Valid'}
                  </div>
                  <div className="text-xs text-blue-200 mb-0.5">{doc.issuer?.name}</div>
                  <h3 className="text-base font-bold leading-tight">{doc.credential?.degree}</h3>
                  {doc.credential?.department && (
                    <p className="text-blue-200 text-xs mt-0.5">{doc.credential.department}</p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-400 block">Classification</span>
                      <span className="font-semibold text-gray-800">{doc.credential?.classification || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Graduated</span>
                      <span className="font-semibold text-gray-800">{new Date(doc.credential?.graduationDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Certificate ID</span>
                      <span className="font-mono text-xs text-blue-600">{doc.certificateId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Block #</span>
                      <span className="font-mono text-xs text-purple-600">{doc.blockNumber ?? '—'}</span>
                    </div>
                  </div>

                  {/* Blockchain Proof */}
                  <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-400 font-mono truncate mb-3">
                    ⛓️ {doc.txHash ? doc.txHash.substring(0, 32) + '...' : 'Pending'}
                  </div>

                  <button onClick={() => handleDownload(doc.certificateId)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs flex items-center justify-center gap-2">
                    ⬇️ Download Secure PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
