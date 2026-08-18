'use client';

import { useState, useEffect } from 'react';
import api from '../utils/api';

interface Document {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data);
    } catch (err: any) {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  if (loading) return <p className="text-gray-600">Loading documents...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (documents.length === 0) {
    return <div className="bg-white p-6 rounded shadow-md text-gray-500">No documents found. Upload one to get started.</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Documents</h2>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc._id} className="border p-4 rounded flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-black">{doc.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{doc.description}</p>
              <div className="mt-2 text-xs text-gray-500 flex gap-4">
                <span>Status: {doc.status}</span>
                <span>Date: {new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(doc._id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
