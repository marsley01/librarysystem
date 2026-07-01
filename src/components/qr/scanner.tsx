'use client';

import { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
  onScan: (value: string) => void;
  onError?: (error: string) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function startScanning() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        if (!mounted || !containerRef.current) return;

        const scanner = new Html5Qrcode('qr-scanner');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (!scannedRef.current) {
              scannedRef.current = true;
              onScan(decodedText);
              scanner.stop().catch(() => {});
            }
          },
          () => {} // ignore non-qr frames
        );

        setScanning(true);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        const msg = err?.message || 'Camera access failed';
        setError(msg);
        onError?.(msg);
      }
    }

    startScanning();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan, onError]);

  const retry = () => {
    scannedRef.current = false;
    setError(null);
    setScanning(false);
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {}).then(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-3">
      <div
        id="qr-scanner"
        ref={containerRef}
        className="rounded-xl overflow-hidden bg-black aspect-square max-w-sm mx-auto"
      />

      {error && (
        <div className="text-center space-y-2">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-muted-fg">
            Make sure you have granted camera permissions.
            You can also search for the book manually below.
          </p>
          <button
            onClick={retry}
            className="text-xs text-accent hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {scanning && !error && (
        <p className="text-center text-xs text-muted-fg">
          Point camera at the book&apos;s QR code
        </p>
      )}
    </div>
  );
}
