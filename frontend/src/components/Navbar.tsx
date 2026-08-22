'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'holder') return { href: '/student/dashboard', label: 'My Wallet' };
    if (user?.role === 'root_admin') return { href: '/admin/dashboard', label: 'Admin Panel' };
    return { href: '/dashboard', label: 'Dashboard' };
  };

  const dashLink = getDashboardLink();

  return (
    <nav className="bg-blue-700 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold flex items-center gap-2">
          <span className="bg-white/20 rounded-lg w-7 h-7 flex items-center justify-center text-sm font-black">D</span>
          DocuTrust
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              {user && (
                <span className="text-blue-200 text-xs hidden md:block">
                  {user.name} · <span className="font-mono text-blue-300">{user.role}</span>
                </span>
              )}
              <Link href={dashLink.href} className="hover:text-blue-200 font-medium transition-colors">
                {dashLink.label}
              </Link>
              {user?.role === 'root_admin' && (
                <Link href="/admin/institutions" className="hover:text-blue-200 font-medium transition-colors">
                  Institutions
                </Link>
              )}
              <Link href="/profile" className="hover:text-blue-200 font-medium transition-colors">
                ⚙️ Profile
              </Link>
              <button onClick={logout}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors border border-white/20 text-xs">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/verify/demo" className="hover:text-blue-200 transition-colors">
                Verify
              </Link>
              <Link href="/login" className="hover:text-blue-200 transition-colors font-medium">
                Login
              </Link>
              <Link href="/register"
                className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold transition-colors text-xs">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
