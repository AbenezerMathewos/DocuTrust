'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchain = async () => {
    setChainLoading(true);
    try {
      const res = await api.get('/audit/blockchain');
      setBlockchain(res.data.data.slice().reverse()); // Newest first
    } catch (err) {
      console.error('Failed to fetch blockchain', err);
    } finally {
      setChainLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blockchain') fetchBlockchain();
  }, [activeTab]);

  const statCards = stats ? [
    { label: 'Total Certificates Issued', value: stats.totalCertificates, color: 'bg-blue-600', icon: '📜' },
    { label: 'Valid Certificates', value: stats.validCertificates, color: 'bg-green-600', icon: '✅' },
    { label: 'Revoked Certificates', value: stats.revokedCertificates, color: 'bg-red-500', icon: '🚫' },
    { label: 'Active Institutions', value: `${stats.activeInstitutions} / ${stats.totalInstitutions}`, color: 'bg-purple-600', icon: '🏛️' },
    { label: 'Registered Users', value: stats.totalUsers, color: 'bg-teal-600', icon: '👥' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Root Authority</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">INSA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">National Admin Control Panel</h1>
          <p className="text-gray-500 mt-1">Monitor all platform activity, institutions, and blockchain integrity.</p>
        </div>
        <Link href="/admin/institutions" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
          Manage Institutions →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          📊 Overview
        </button>
        <button onClick={() => setActiveTab('blockchain')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'blockchain' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          ⛓️ Blockchain Ledger
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {loading ? (
            <p className="text-gray-500">Loading platform statistics...</p>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                {statCards.map((card) => (
                  <div key={card.label} className={`${card.color} text-white rounded-xl p-5 shadow-sm`}>
                    <div className="text-3xl mb-2">{card.icon}</div>
                    <div className="text-3xl font-bold">{card.value}</div>
                    <div className="text-xs mt-1 opacity-80">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Audit Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>🔐</span> Live Audit Feed (Last 10 Events)
                  </h3>
                  <span className="text-xs text-gray-400">Immutable — cannot be altered or deleted</span>
                </div>
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Target</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actor</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats?.recentLogs?.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No events yet.</td></tr>
                    ) : (
                      stats?.recentLogs?.map((log: any) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              log.action === 'REVOKE' ? 'bg-red-100 text-red-700' :
                              log.action === 'ISSUE_BATCH' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{log.action}</span>
                          </td>
                          <td className="px-5 py-3 text-xs font-mono text-gray-700 truncate max-w-[150px]">{log.target}</td>
                          <td className="px-5 py-3 text-sm text-gray-700">{log.actor}</td>
                          <td className="px-5 py-3 text-xs text-gray-500">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Blockchain Ledger Tab */}
      {activeTab === 'blockchain' && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <strong>⛓️ Local Blockchain Simulation:</strong> Every certificate hash is anchored to this cryptographic chain. Each block links to the previous block's hash, making tampering mathematically detectable.
          </div>

          {chainLoading ? (
            <p className="text-gray-500">Loading blockchain ledger...</p>
          ) : (
            <div className="space-y-3">
              {blockchain.map((block, idx) => (
                <div key={block.index} className={`rounded-xl border p-5 shadow-sm ${block.index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${block.index === 0 ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {block.index === 0 ? '🌐 Genesis Block' : `Block #${block.index}`}
                      </span>
                      {block.data?.certificateId && (
                        <span className="text-xs text-gray-500 font-mono">{block.data.certificateId}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(block.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs font-mono">
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-28 shrink-0">Block Hash:</span>
                      <span className="text-green-700 truncate">{block.hash}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-28 shrink-0">Previous Hash:</span>
                      <span className="text-blue-600 truncate">{block.previousHash}</span>
                    </div>
                    {block.data?.documentHash && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-28 shrink-0">Doc Hash (SHA-256):</span>
                        <span className="text-purple-700 truncate">{block.data.documentHash}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
