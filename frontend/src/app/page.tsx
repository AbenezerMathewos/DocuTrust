"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [certId, setCertId] = useState("");
  const [lang, setLang] = useState<"en" | "am">("en");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      router.push(`/verify/${certId.trim()}`);
    }
  };

  const content = {
    en: {
      subtitle: "Digital Ethiopia 2025 — National Trust Infrastructure",
      title1: "The End of",
      titleHighlight: "Document Fraud",
      title2: "in Ethiopia",
      description: "DocuTrust uses SHA-256 cryptography and blockchain anchoring to issue tamper-proof certificates. Verify any document in exactly one second.",
      signIn: "Sign In to Dashboard →",
      createAccount: "Create Account",
      placeholder: "Enter Certificate ID (e.g. CERT-HU-...)",
      verifyBtn: "Verify Now",
      step1Title: "Institution Issues",
      step1Desc: "Universities upload graduate data. DocuTrust auto-generates a SHA-256 fingerprinted, Ed25519-signed PDF and anchors its hash to a blockchain block.",
      step2Title: "Citizen Owns",
      step2Desc: "The graduate logs into their secure Citizen Wallet. They can download their tamper-proof PDF anytime, from anywhere — even on a rural 3G connection.",
      step3Title: "Employer Verifies",
      step3Desc: "The employer scans the QR code on the document. The system mathematically verifies the hash in 1 second — no phone calls, no emails, no waiting.",
      stat1: "Verification Time",
      stat2: "Cryptographic Standard",
      stat3: "Tamper Detection"
    },
    am: {
      subtitle: "ዲጂታል ኢትዮጵያ 2025 — አገራዊ የዕምነት መሠረተ ልማት",
      title1: "በኢትዮጵያ",
      titleHighlight: "የሰነድ ማጭበርበር",
      title2: "ማክተሚያ",
      description: "DocuTrust የSHA-256 ክሪፕቶግራፊ እና ብሎክቼይን ቴክኖሎጂን በመጠቀም የማይጭበረበሩ ሰነዶችን ያዘጋጃል። ማንኛውንም ሰነድ በአንድ ሴኮንድ ውስጥ ያረጋግጡ።",
      signIn: "ወደ ዳሽቦርድ ይግቡ →",
      createAccount: "አካውንት ይፍጠሩ",
      placeholder: "የሰነድ መለያ ያስገቡ (ለምሳሌ CERT-HU-...)",
      verifyBtn: "አሁን አረጋግጥ",
      step1Title: "ተቋማት ያዘጋጃሉ",
      step1Desc: "ዩኒቨርሲቲዎች የተመራቂዎችን መረጃ ያስገባሉ። ሲስተሙ በEd25519 የተፈረመና SHA-256 ማረጋገጫ ያለው PDF አዘጋጅቶ ብሎክቼይን ላይ ያስቀምጣል።",
      step2Title: "ዜጎች የራሳቸው ያደርጋሉ",
      step2Desc: "ተመራቂው ወደ ዜጋ ዋሌት በመግባት የማይጭበረበረውን ሰነድ በማንኛውም ጊዜና ቦታ ማውረድ ይችላል።",
      step3Title: "ቀጣሪዎች ያረጋግጣሉ",
      step3Desc: "ቀጣሪው በሰነዱ ላይ ያለውን QR ኮድ ስካን ሲያደርግ፣ ሲስተሙ በ1 ሴኮንድ ውስጥ ትክክለኛነቱን በሂሳባዊ ስሌት ያረጋግጣል።",
      stat1: "የማረጋገጫ ጊዜ",
      stat2: "ክሪፕቶግራፊክ ስታንዳርድ",
      stat3: "የማጭበርበር መከላከያ"
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pb-16 relative">
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-6 flex bg-slate-800/50 rounded-lg p-1 border border-slate-700">
        <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
        <button onClick={() => setLang('am')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'am' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>አማ</button>
      </div>

      {/* Hash Ticker */}
      <div className="overflow-hidden whitespace-nowrap text-xs font-mono text-blue-300/10 py-2 border-b border-blue-900/30 select-none mt-12 md:mt-0">
        <span>sha256: a3f8b2c1d9e4f7a0b5c2d8e1f6a3b9c4... VERIFIED... block#1 → block#2 → block#3... sha256: f0a7b4c8d5e2f9a0b6c3d7e4f1a8b5c2... AUTHENTIC... Ed25519 signature: valid... &nbsp;&nbsp;&nbsp;</span>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          {t.subtitle}
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          {t.title1}<br />
          <span className="text-blue-400">{t.titleHighlight}</span><br />
          {t.title2}
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          {t.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm">
            {t.signIn}
          </Link>
          <Link href="/register" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm border border-white/20">
            {t.createAccount}
          </Link>
        </div>

        {/* Verification Bar */}
        <div className="max-w-xl mx-auto bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-sm mb-20 shadow-2xl">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder={t.placeholder}
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="flex-1 bg-white/10 border-none rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
              {t.verifyBtn}
            </button>
          </form>
        </div>

        {/* 3-Step Visual */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            {
              step: '01',
              icon: '🏛️',
              title: t.step1Title,
              desc: t.step1Desc,
              color: 'border-blue-500/30'
            },
            {
              step: '02',
              icon: '👤',
              title: t.step2Title,
              desc: t.step2Desc,
              color: 'border-purple-500/30'
            },
            {
              step: '03',
              icon: '✅',
              title: t.step3Title,
              desc: t.step3Desc,
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
            { value: '1 sec', label: t.stat1 },
            { value: 'SHA-256', label: t.stat2 },
            { value: '100%', label: t.stat3 },
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
