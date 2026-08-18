'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleUploadSuccess = () => {
    setRefreshKey(old => old + 1);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="md:col-span-2">
          <DocumentList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
