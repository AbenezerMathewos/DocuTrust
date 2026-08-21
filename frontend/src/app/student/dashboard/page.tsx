'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const fetchMyDocuments = async () => {
    try {
      // In a real app, you'd get the token from cookies or context
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/certificates/my-documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certId: string) => {
    // Construct download URL or trigger a request that returns the PDF blob
    // This assumes the backend serves PDFs via a specific route or we redirect to verification where it can be downloaded.
    alert(`Initiating secure download for ${certId}. In a full implementation, this triggers the PDF stream.`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Digital Wallet</h1>
      <p className="text-gray-600 mb-8">Access your secure, blockchain-anchored credentials.</p>

      {loading ? (
        <p>Loading your documents...</p>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">You don't have any secure documents issued yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc: any) => (
            <div key={doc._id} className="p-6 border border-teal-100 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                Verified
              </div>
              <h3 className="text-xl font-bold text-gray-800">{doc.credential.degree}</h3>
              <p className="text-gray-600 text-sm mt-1">{doc.issuer.name}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <p>Issued: {new Date(doc.createdAt).toLocaleDateString()}</p>
                <p className="mt-1 truncate" title={doc.txHash}>Blockchain Tx: {doc.txHash ? doc.txHash.substring(0, 16) + '...' : 'Pending'}</p>
              </div>
              
              <button 
                onClick={() => handleDownload(doc.certificateId)}
                className="mt-6 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Secure PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
