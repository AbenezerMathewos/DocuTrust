"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface VerificationResult {
  status: 'AUTHENTIC' | 'TAMPERED' | 'NOT_FOUND' | 'REVOKED' | 'ISSUER_INACTIVE';
  message: string;
  data?: {
    certificateId: string;
    recipientName: string;
    degree: string;
    institution: string;
    graduationDate: string;
  };
}

export default function VerifyPage() {
  const params = useParams();
  const certificateId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!certificateId) return;

    const verifyCertificate = async () => {
      try {
        // Use environment variable in production, fallback to dynamic hostname for dev testing
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api');
          
        const res = await axios.get(`${apiBaseUrl}/certificates/verify/${certificateId}`);
        setResult(res.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setResult(err.response.data);
        } else {
          setError("Failed to connect to the verification server.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verifying mathematical signature...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md w-full text-center border border-red-200">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!result || result.status === 'NOT_FOUND') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-gray-50 text-gray-700 p-8 rounded-xl max-w-md w-full text-center border border-gray-200 shadow-sm">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
          <p>We could not find a certificate matching ID: <br/><span className="font-mono bg-gray-200 px-2 py-1 rounded text-sm mt-2 inline-block">{certificateId}</span></p>
        </div>
      </div>
    );
  }

  if (result.status === 'TAMPERED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-red-50 text-red-700 p-8 rounded-xl max-w-md w-full text-center border-2 border-red-500 shadow-lg">
          <svg className="w-20 h-20 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-3xl font-black mb-2 tracking-tight">TAMPERED</h2>
          <p className="font-medium text-red-600">{result.message}</p>
          <p className="text-sm mt-4 text-red-500">The cryptographic signature does not match the data. This document is a forgery.</p>
        </div>
      </div>
    );
  }

  if (result.status === 'REVOKED' || result.status === 'ISSUER_INACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-yellow-50 text-yellow-800 p-8 rounded-xl max-w-md w-full text-center border-2 border-yellow-400 shadow-lg">
          <svg className="w-20 h-20 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-3xl font-black mb-2 tracking-tight">{result.status}</h2>
          <p className="font-medium">{result.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="bg-white p-8 rounded-2xl max-w-lg w-full border-t-8 border-t-green-500 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-green-700 tracking-tight mb-1">AUTHENTIC</h2>
          <p className="text-green-600 font-medium">{result.message}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Student Name</p>
            <p className="text-lg font-semibold text-gray-900">{result.data?.recipientName}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Degree</p>
            <p className="text-lg font-semibold text-gray-900">{result.data?.degree}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Institution</p>
              <p className="font-semibold text-gray-900">{result.data?.institution}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Graduation Date</p>
              <p className="font-semibold text-gray-900">{result.data?.graduationDate}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Certificate ID: <span className="font-mono">{result.data?.certificateId}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cryptographically secured by Ed25519
          </p>
        </div>
      </div>
    </div>
  );
}
