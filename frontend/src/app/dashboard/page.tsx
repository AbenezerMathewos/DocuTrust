"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"single" | "batch" | "history" | "audit">("single");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Form States
  const [singleForm, setSingleForm] = useState({
    recipientName: "",
    studentId: "",
    institutionCode: "HU", // Defaulting to our dummy for now
    degree: "",
    department: "",
    classification: "",
    graduationDate: ""
  });
  
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  // Note: We disabled redirecting for the demo so you don't have to log in if you don't want to.
  // In production, uncomment the auth redirect:
  // useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchCertificates();
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchCertificates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/certificates?institutionCode=HU");
      setCertificates(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/audit");
      setAuditLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post("http://localhost:5000/api/certificates/issue", singleForm, {
        responseType: "blob"
      });

      // Trigger file download in browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${singleForm.recipientName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setMessage({ type: "success", text: "Certificate issued and downloaded successfully!" });
      setSingleForm({ ...singleForm, recipientName: "", studentId: "", degree: "", department: "", classification: "", graduationDate: "" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to issue certificate." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("institutionCode", "HU");
    formData.append("file", csvFile);

    try {
      const response = await axios.post("http://localhost:5000/api/certificates/batch-issue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob"
      });

      // Trigger ZIP download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Batch_Certificates_HU.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setMessage({ type: "success", text: "Batch processing complete! ZIP downloaded." });
      setCsvFile(null);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to process batch CSV." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (certificateId: string) => {
    const reason = window.prompt("Enter reason for revocation (e.g. Academic Misconduct):");
    if (reason === null) return; // User cancelled

    try {
      await axios.put(`http://localhost:5000/api/certificates/revoke/${certificateId}`, { reason });
      setMessage({ type: "success", text: `Certificate ${certificateId} has been revoked.` });
      fetchCertificates(); // Refresh table
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to revoke certificate." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registrar Dashboard</h1>
          <p className="text-gray-500">Manage, issue, and track certificates for Hawassa University (HU)</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded mb-6 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "single" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Single Issuance
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "batch" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Batch Issuance (CSV)
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          History / Logs
        </button>
      </div>

      {/* Single Issuance Tab */}
      {activeTab === "single" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Issue Single Certificate</h2>
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input required type="text" value={singleForm.recipientName} onChange={(e) => setSingleForm({...singleForm, recipientName: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input required type="text" value={singleForm.studentId} onChange={(e) => setSingleForm({...singleForm, studentId: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. ID-12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree Title</label>
              <input required type="text" value={singleForm.degree} onChange={(e) => setSingleForm({...singleForm, degree: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Bachelor of Science in Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input required type="text" value={singleForm.department} onChange={(e) => setSingleForm({...singleForm, department: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classification / Honors</label>
              <input type="text" value={singleForm.classification} onChange={(e) => setSingleForm({...singleForm, classification: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. First Class (Optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
              <input required type="date" value={singleForm.graduationDate} onChange={(e) => setSingleForm({...singleForm, graduationDate: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            
            <div className="md:col-span-2 pt-4 border-t">
              <button disabled={isSubmitting} type="submit" className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50">
                {isSubmitting ? "Generating & Signing..." : "Cryptographically Sign & Issue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Issuance Tab */}
      {activeTab === "batch" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Batch Issue (CSV)</h2>
          <form onSubmit={handleBatchSubmit}>
            <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center mb-6">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-gray-600 mb-2">Upload a CSV file containing student records.</p>
              <p className="text-xs text-gray-400 mb-4">Required columns: recipientName, studentId, degree, department, classification, graduationDate (YYYY-MM-DD)</p>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                className="mx-auto block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
            </div>
            
            <button disabled={!csvFile || isSubmitting} type="submit" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Processing Batch..." : "Upload & Generate ZIP"}
            </button>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No certificates issued yet.</td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{cert.certificateId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.recipient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.credential.degree}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cert.revocation?.isRevoked ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Revoked</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Valid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!cert.revocation?.isRevoked && (
                        <button 
                          onClick={() => handleRevoke(cert.certificateId)}
                          className="text-red-600 hover:text-red-900 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
