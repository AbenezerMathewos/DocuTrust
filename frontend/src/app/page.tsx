import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

      {/* Hash Ticker */}
      <div className="overflow-hidden whitespace-nowrap text-xs font-mono text-blue-300/10 py-2 border-b border-blue-900/30 select-none">
        <span>sha256: a3f8b2c1d9e4f7a0b5c2d8e1f6a3b9c4... VERIFIED... block#1 → block#2 → block#3... sha256: f0a7b4c8d5e2f9a0b6c3d7e4f1a8b5c2... AUTHENTIC... Ed25519 signature: valid... &nbsp;&nbsp;&nbsp;</span>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Digital Ethiopia 2025 — National Trust Infrastructure
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          The End of<br />
          <span className="text-blue-400">Document Fraud</span><br />
          in Ethiopia
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          DocuTrust uses <strong className="text-slate-300">SHA-256 cryptography</strong> and <strong className="text-slate-300">blockchain anchoring</strong> to issue tamper-proof certificates. Verify any document in exactly <strong className="text-blue-400">one second</strong>.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm">
            Sign In to Dashboard →
          </Link>
          <Link href="/register" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm border border-white/20">
            Create Account
          </Link>
        </div>

        {/* 3-Step Visual */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          {[
            {
              step: '01',
              icon: '🏛️',
              title: 'Institution Issues',
              desc: 'Universities upload graduate data. DocuTrust auto-generates a SHA-256 fingerprinted, Ed25519-signed PDF and anchors its hash to a blockchain block.',
              color: 'border-blue-500/30'
            },
            {
              step: '02',
              icon: '👤',
              title: 'Citizen Owns',
              desc: 'The graduate logs into their secure Citizen Wallet. They can download their tamper-proof PDF anytime, from anywhere — even on a rural 3G connection.',
              color: 'border-purple-500/30'
            },
            {
              step: '03',
              icon: '✅',
              title: 'Employer Verifies',
              desc: 'The employer scans the QR code on the document. The system mathematically verifies the hash in 1 second — no phone calls, no emails, no waiting.',
              color: 'border-green-500/30'
            }
          ].map((item) => (
            <div key={item.step} className={`bg-white/5 border ${item.color} rounded-2xl p-6 backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xs font-mono text-blue-400 font-bold">STEP {item.step}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 mt-16 py-8 border-t border-white/10">
          {[
            { value: '1 sec', label: 'Verification Time' },
            { value: 'SHA-256', label: 'Cryptographic Standard' },
            { value: '100%', label: 'Tamper Detection' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-blue-400">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
