"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create the scanner instance
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    // Render it and handle success/error
    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        // Pause scanner after first successful scan
        scanner.pause(true);

        // Check if it's a valid DocuTrust URL
        try {
          const url = new URL(decodedText);
          if (url.pathname.startsWith('/verify/CERT-')) {
            // Redirect to the verification page
            router.push(url.pathname);
          } else {
            // It's a QR code, but not one of ours
            const parts = decodedText.split('/');
            const lastPart = parts[parts.length - 1];
            if (lastPart.startsWith('CERT-')) {
               router.push('/verify/' + lastPart);
            } else {
               setError("Invalid certificate QR code format.");
               scanner.resume();
            }
          }
        } catch (e) {
          // If it's not a URL, maybe it's just the ID?
          if (decodedText.startsWith('CERT-')) {
            router.push('/verify/' + decodedText);
          } else {
            setError("The scanned QR code is not a valid DocuTrust certificate.");
            scanner.resume();
          }
        }
      },
      (errorMessage) => {
        // We can ignore continuous scanning errors (e.g. no code found in frame)
      }
    );

    // Cleanup on unmount
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-lg border border-gray-100 text-center">
        <h2 className="text-2xl font-bold mb-2">Scan Certificate</h2>
        <p className="text-gray-600 mb-6">
          Point your camera at the QR code on the printed certificate to instantly verify its authenticity.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
          <div id="qr-reader" className="w-full"></div>
        </div>

        {scanResult && !error && (
          <div className="mt-4 bg-green-50 text-green-700 p-3 rounded text-sm font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            QR Code Detected! Redirecting...
          </div>
        )}
      </div>
    </div>
  );
}
