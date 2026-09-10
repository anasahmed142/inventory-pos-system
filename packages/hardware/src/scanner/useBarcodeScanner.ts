// packages/hardware/src/scanner/useBarcodeScanner.ts
import { useEffect, useRef } from 'react';

export interface ScannerConfig {
  maxInterKeyDelayMs?: number;
  minBarcodeLength?: number;
  terminatorKeys?: string[];
  prefixStripRegex?: RegExp;
  suffixStripRegex?: RegExp;
  enabled?: boolean;
}

export function useBarcodeScanner(
  onScan: (barcode: string) => void,
  config: ScannerConfig = {}
): void {
  const {
    maxInterKeyDelayMs = 35,
    minBarcodeLength = 3,
    terminatorKeys = ['Enter'],
    prefixStripRegex = /^~/,
    suffixStripRegex = /[\r\n\t]+$/,
    enabled = true
  } = config;

  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'TEXTAREA' || target.getAttribute('data-ignore-scanner') === 'true')) {
        return;
      }

      const now = performance.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (terminatorKeys.includes(event.key)) {
        if (bufferRef.current.length >= minBarcodeLength) {
          event.preventDefault();
          let sanitizedBarcode = bufferRef.current;
          if (prefixStripRegex) sanitizedBarcode = sanitizedBarcode.replace(prefixStripRegex, '');
          if (suffixStripRegex) sanitizedBarcode = sanitizedBarcode.replace(suffixStripRegex, '');
          onScan(sanitizedBarcode.trim());
        }
        bufferRef.current = '';
        return;
      }

      if (event.key.length > 1) return;

      if (timeDiff > maxInterKeyDelayMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      bufferRef.current += event.key;
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onScan, maxInterKeyDelayMs, minBarcodeLength, terminatorKeys, prefixStripRegex, suffixStripRegex, enabled]);
}