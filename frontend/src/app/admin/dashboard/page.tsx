'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'blockchain'>('overview');
  const [blockchain, setBlockchain] = useState<any[]>([]);
  const [chainLoading, setChainLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user && user.role !== 'root_admin') { router.push('/dashboard'); return; }
    fetchStats();
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/audit/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchain = async () => {
    setChainLoading(true);
    try {
      const res = await api.get('/audit/blockchain');
      setBlockchain(res.data.data.slice().reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setChainLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blockchain') fetchBlockchain();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white px-8 py-10 border-b border-red-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏛️</span>
            <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full uppercase">Root Authority — INSA</span>
          </div>
          <h1 className="text-4xl font-bold mt-1">National Control Panel</h1>
          <p className="text-red-200 mt-1">Monitoring all platform activity across Ethiopia's Document Trust Network</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'overview', label: '📊 Platform Overview' },
            { key: 'blockchain', label: '⛓️ Blockchain Ledger' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.key ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                  {[
                    { icon: '📜', label: 'Total Certificates', value: stats?.totalCertificates, color: 'from-blue-600 to-blue-800' },
                    { icon: '✅', label: 'Valid', value: stats?.validCertificates, color: 'from-green-600 to-green-800' },
                    { icon: '🚫', label: 'Revoked', value: stats?.revokedCertificates, color: 'from-red-600 to-red-800' },
                    { icon: '🏛️', label: 'Active Institutions', value: `${stats?.activeInstitutions}/${stats?.totalInstitutions}`, color: 'from-purple-600 to-purple-800' },
                    { icon: '👥', label: 'Registered Users', value: stats?.totalUsers, color: 'from-teal-600 to-teal-800' },
                  ].map((card) => (
                    <div key={card.label} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5 shadow-lg`}>
                      <div className="text-3xl mb-3">{card.icon}</div>
                      <div className="text-3xl font-bold">{card.value ?? '—'}</div>
                      <div className="text-xs mt-1 opacity-70">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Live Audit Feed */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">🔐 Live Audit Feed</h3>
                    <span className="text-xs text-gray-500">Immutable — cannot be altered</span>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {stats?.recentLogs?.length === 0 ? (
                      <p className="px-6 py-8 text-center text-gray-600">No events yet.</p>
                    ) : (
                      stats?.recentLogs?.map((log: any) => (
                        <div key={log._id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors">
                          <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded ${
                            log.action === 'REVOKE' ? 'bg-red-900 text-red-300' :
                            log.action === 'ISSUE_BATCH' ? 'bg-purple-900 text-purple-300' :
                            'bg-blue-900 text-blue-300'
                          }`}>{log.action}</span>
                          <span className="text-gray-400 text-xs font-mono flex-1 truncate">{log.target}</span>
                          <span className="text-gray-500 text-xs shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Blockchain Ledger Tab */}
        {activeTab === 'blockchain' && (
          <div>
            <div className="mb-6 bg-blue-950 border border-blue-800 rounded-xl p-4 text-sm text-blue-300">
              <strong className="text-blue-200">⛓️ Simulated Local Blockchain:</strong> Every certificate hash is chained cryptographically. Each block references the previous block's hash — making any tampering mathematically impossible.
            </div>

            {chainLoading ? (
              <p className="text-gray-500">Loading ledger...</p>
            ) : (
              <div className="space-y-3">
                {blockchain.map((block) => (
                  <div key={block.index} className={`rounded-2xl border p-5 ${block.index === 0 ? 'bg-yellow-950 border-yellow-700' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${block.index === 0 ? 'bg-yellow-700 text-yellow-200' : 'bg-gray-700 text-gray-300'}`}>
                          {block.index === 0 ? '🌐 Genesis' : `Block #${block.index}`}
                        </span>
                        {block.data?.certificateId && (
                          <span className="text-xs text-blue-400 font-mono">{block.data.certificateId}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex gap-2"><span className="text-gray-500 w-32 shrink-0">Block Hash:</span><span className="text-green-400 truncate">{block.hash}</span></div>
                      <div className="flex gap-2"><span className="text-gray-500 w-32 shrink-0">Prev Hash:</span><span className="text-blue-400 truncate">{block.previousHash}</span></div>
                      {block.data?.documentHash && (
                        <div className="flex gap-2"><span className="text-gray-500 w-32 shrink-0">SHA-256 Hash:</span><span className="text-purple-400 truncate">{block.data.documentHash}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
