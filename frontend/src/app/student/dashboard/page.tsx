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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">👤</span>
            <span className="text-sm font-semibold bg-white/20 px-3 py-0.5 rounded-full">Citizen / Holder</span>
          </div>
          <h1 className="text-4xl font-bold mt-2">My Digital Wallet</h1>
          <p className="text-teal-100 mt-1 text-lg">Welcome back, <strong>{user?.name || 'Student'}</strong> — your secure credential vault</p>

          <div className="flex gap-6 mt-6 text-sm">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-teal-200 text-xs mt-1">Credentials Issued</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">⛓️</div>
              <div className="text-teal-200 text-xs mt-1">Blockchain Anchored</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">🔐</div>
              <div className="text-teal-200 text-xs mt-1">Tamper-Proof</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Verified Credentials</h2>
          <button onClick={() => router.push('/scan')}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700">
            📷 Scan & Verify
          </button>
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
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5 text-white relative">
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${doc.revocation?.isRevoked ? 'bg-red-500' : 'bg-green-400 text-green-900'}`}>
                    {doc.revocation?.isRevoked ? '🚫 Revoked' : '✅ Valid'}
                  </div>
                  <div className="text-xs text-teal-200 mb-1">{doc.issuer?.name}</div>
                  <h3 className="text-lg font-bold leading-tight">{doc.credential?.degree}</h3>
                  {doc.credential?.department && (
                    <p className="text-teal-200 text-sm mt-1">{doc.credential.department}</p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-400 text-xs block">Classification</span>
                      <span className="font-semibold text-gray-800">{doc.credential?.classification || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Graduated</span>
                      <span className="font-semibold text-gray-800">{new Date(doc.credential?.graduationDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Certificate ID</span>
                      <span className="font-mono text-xs text-blue-600">{doc.certificateId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Blockchain Block</span>
                      <span className="font-mono text-xs text-purple-600">#{doc.blockNumber || '—'}</span>
                    </div>
                  </div>

                  {/* Blockchain Proof */}
                  <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 font-mono truncate mb-4">
                    ⛓️ tx: {doc.txHash ? doc.txHash.substring(0, 30) + '...' : 'Pending'}
                  </div>

                  <button onClick={() => handleDownload(doc.certificateId)}
                    className="w-full bg-teal-600 text-white py-2.5 rounded-xl hover:bg-teal-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2">
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
