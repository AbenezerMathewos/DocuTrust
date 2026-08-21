'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          DocuTrust
        </Link>
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              {user && <span className="text-sm mr-4 opacity-80">Welcome, {user.name}</span>}
              {user?.role === 'holder' ? (
                <Link href="/student/dashboard" className="hover:text-blue-200 font-medium">My Wallet</Link>
              ) : user?.role === 'root_admin' ? (
                <Link href="/admin/dashboard" className="hover:text-blue-200 font-medium">Admin Panel</Link>
              ) : (
                <Link href="/dashboard" className="hover:text-blue-200 font-medium">Issuer Dashboard</Link>
              )}
              <button onClick={logout} className="hover:text-blue-200 ml-4 font-medium border border-blue-400 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link href="/register" className="hover:text-blue-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
