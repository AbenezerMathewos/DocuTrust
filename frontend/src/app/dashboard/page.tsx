"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "history" | "audit">("single");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Form States
  const [singleForm, setSingleForm] = useState({
    recipientName: "",
    recipientEmail: "",
    studentId: "",
    institutionCode: "",
    degree: "",
    department: "",
    classification: "",
    graduationDate: "",
    expiresAt: ""
  });
  
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => { 
    if (!isAuthenticated) router.push('/login'); 
    fetchInstitutions();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchCertificates();
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, page, search, singleForm.institutionCode]);

  const fetchInstitutions = async () => {
    try {
      const res = await api.get("/institutions");
      setInstitutions(res.data);
      if (res.data.length > 0) {
        setSingleForm(prev => ({ ...prev, institutionCode: res.data[0].code }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await api.get(`/certificates?institutionCode=${singleForm.institutionCode}&search=${search}&page=${page}&limit=10`);
      setCertificates(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get("/audit");
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
      const response = await api.post("/certificates/issue", singleForm, {
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
      setSingleForm({ ...singleForm, recipientName: "", recipientEmail: "", studentId: "", degree: "", department: "", classification: "", graduationDate: "", expiresAt: "" });
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
    formData.append("institutionCode", singleForm.institutionCode);
    formData.append("file", csvFile);

    try {
      const response = await api.post("/certificates/batch-issue", formData, {
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
      await api.put(`/certificates/revoke/${certificateId}`, { reason });
      setMessage({ type: "success", text: `Certificate ${certificateId} has been revoked.` });
      fetchCertificates(); // Refresh table
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to revoke certificate." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Styled Blue Header */}
      <div className="bg-blue-700 text-white rounded-2xl px-6 py-5 mb-6 overflow-hidden relative">
        <div className="text-xs font-mono text-blue-200/20 whitespace-nowrap overflow-hidden mb-2 select-none">
          a3f8b2c1d9e4f7a0b5c2d8e1f6a3b9c4d7e0f5a2b8c5d1e9f3... sha256 ... verify ... sign ...
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-0.5 rounded-full uppercase">🎓 Issuer Portal</span>
        </div>
        <h1 className="text-xl font-bold">Registrar Dashboard</h1>
        <p className="text-blue-200 text-sm mt-0.5">Issue and manage cryptographically signed certificates</p>
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
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "audit" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Audit Trail
        </button>
      </div>

      {/* Single Issuance Tab */}
      {activeTab === "single" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Issue Single Certificate</h2>
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <select required value={singleForm.institutionCode} onChange={(e) => setSingleForm({...singleForm, institutionCode: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                {institutions.map(inst => (
                  <option key={inst.code} value={inst.code}>{inst.name} ({inst.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input required type="text" value={singleForm.recipientName} onChange={(e) => setSingleForm({...singleForm, recipientName: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Email (Optional)</label>
              <input type="email" value={singleForm.recipientEmail} onChange={(e) => setSingleForm({...singleForm, recipientEmail: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. student@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Optional)</label>
              <input type="text" value={singleForm.studentId} onChange={(e) => setSingleForm({...singleForm, studentId: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. ID-12345" />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
              <input type="date" value={singleForm.expiresAt} onChange={(e) => setSingleForm({...singleForm, expiresAt: e.target.value})} className="w-full border-gray-300 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
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

      {/* Audit Trail Tab */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">System Audit Trail</h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Immutable cryptographic ledger
            </span>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No audit events logged yet.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded ${
                        log.action === 'REVOKE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{log.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.actor}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
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
