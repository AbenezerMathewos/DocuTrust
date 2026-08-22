'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Simulated scrolling hash string for visual effect
const HashTicker = () => {
  const hash = 'a3f8b2c1d9e4f7a0b5c2d8e1f6a3b9c4d7e0f5a2b8c5d1e9f3a6b0c7d4e8f2a5b1c9d6e3f0a7b4c8d5e2f9a0b6c3d7e4f1a8b5c2d9e6f3a0';
  return (
    <div className="overflow-hidden whitespace-nowrap text-xs font-mono text-blue-300/30 py-1 select-none">
      <span className="inline-block animate-marquee">{hash.repeat(4)}</span>
    </div>
  );
};

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

  const statCards = stats ? [
    { icon: '📜', label: 'Total Issued', value: stats.totalCertificates ?? 0, sub: 'certificates on network', color: 'border-blue-500 bg-blue-50' },
    { icon: '✅', label: 'Valid & Active', value: stats.validCertificates ?? 0, sub: 'cryptographically intact', color: 'border-green-500 bg-green-50' },
    { icon: '🚫', label: 'Revoked', value: stats.revokedCertificates ?? 0, sub: 'invalidated by issuers', color: 'border-red-500 bg-red-50' },
    { icon: '🏛️', label: 'Institutions', value: `${stats.activeInstitutions ?? 0} / ${stats.totalInstitutions ?? 0}`, sub: 'active / total', color: 'border-purple-500 bg-purple-50' },
    { icon: '👥', label: 'Users', value: stats.totalUsers ?? 0, sub: 'registered on platform', color: 'border-teal-500 bg-teal-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header — Blue consistent theme */}
      <div className="bg-blue-700 text-white px-6 py-8 relative overflow-hidden">
        <HashTicker />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🏛️</span>
            <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-0.5 rounded-full uppercase">Root Authority — INSA</span>
          </div>
          <h1 className="text-2xl font-bold mt-1">National Control Panel</h1>
          <p className="text-blue-200 text-sm mt-1">Monitoring Ethiopia's Document Trust Network</p>
          <HashTicker />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'blockchain', label: '⛓️ Blockchain Ledger' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading statistics...</p>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  {statCards.map((card) => (
                    <div key={card.label} className={`bg-white rounded-xl border-l-4 ${card.color} p-4 shadow-sm`}>
                      <div className="text-xl mb-1">{card.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                      <div className="text-xs font-semibold text-gray-700 mt-0.5">{card.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Audit Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">🔐 Immutable Audit Feed <span className="text-xs text-gray-400 font-normal">(last 10 events)</span></h3>
                    <span className="text-xs font-mono text-blue-400">SHA-256 secured</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {!stats?.recentLogs?.length ? (
                      <p className="px-5 py-8 text-center text-sm text-gray-400">No events recorded yet.</p>
                    ) : (
                      stats.recentLogs.map((log: any) => (
                        <div key={log._id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 text-sm">
                          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${
                            log.action === 'REVOKE' ? 'bg-red-100 text-red-700' :
                            log.action === 'ISSUE_BATCH' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{log.action}</span>
                          <span className="text-gray-500 font-mono text-xs flex-1 truncate">{log.target}</span>
                          <span className="text-gray-400 text-xs shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && (
          <div>
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <strong>⛓️ Local Blockchain Simulation:</strong> Each certificate's SHA-256 hash is anchored into a block. Every block references the previous block's hash — making tampering mathematically impossible.
            </div>
            {chainLoading ? (
              <p className="text-sm text-gray-500">Loading ledger...</p>
            ) : (
              <div className="space-y-3">
                {blockchain.map((block) => (
                  <div key={block.index} className={`rounded-xl border p-4 bg-white shadow-sm ${block.index === 0 ? 'border-yellow-300' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${block.index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {block.index === 0 ? '🌐 Genesis Block' : `Block #${block.index}`}
                        </span>
                        {block.data?.certificateId && (
                          <span className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{block.data.certificateId}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono bg-gray-50 rounded-lg p-3">
                      <div className="flex gap-2"><span className="text-gray-400 w-28 shrink-0">Block Hash:</span><span className="text-green-600 truncate">{block.hash}</span></div>
                      <div className="flex gap-2"><span className="text-gray-400 w-28 shrink-0">Prev Hash:</span><span className="text-blue-500 truncate">{block.previousHash}</span></div>
                      {block.data?.documentHash && (
                        <div className="flex gap-2"><span className="text-gray-400 w-28 shrink-0">Doc SHA-256:</span><span className="text-purple-600 truncate">{block.data.documentHash}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; display: inline-block; min-width: 200%; }
      `}</style>
    </div>
  );
}
