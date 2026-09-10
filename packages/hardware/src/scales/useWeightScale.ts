// packages/hardware/src/scales/useWeightScale.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { getDecoder, ScaleProtocol, ParsedWeight } from './decoders';

export interface ScaleConfig {
  protocol?: ScaleProtocol;
  baudRate?: 2400 | 4800 | 9600 | 19200 | 115200;
  stabilityWindowSize?: number;
  stabilityThresholdKg?: number;
  mockMode?: boolean;
}

export interface WeightScaleState {
  weightKg: number;
  weightMann: number;
  isStable: boolean;
  isConnected: boolean;
  portName: string | null;
  rawString: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  tare: () => void;
  zero: () => void;
}

export function useWeightScale(config: ScaleConfig = {}): WeightScaleState {
  const {
    protocol = 'yaohua_a12',
    baudRate = 9600,
    stabilityWindowSize = 3,
    stabilityThresholdKg = 0.01,
    mockMode = false
  } = config;

  const [weightKg, setWeightKg] = useState<number>(0.0);
  const [isStable, setIsStable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [portName, setPortName] = useState<string | null>(null);
  const [rawString, setRawString] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const tareOffsetRef = useRef<number>(0.0);
  const recentReadingsRef = useRef<number[]>([]);
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  const decoder = useRef(getDecoder(protocol));
  useEffect(() => {
    decoder.current = getDecoder(protocol);
  }, [protocol]);

  const processNewReading = useCallback(
    (parsed: ParsedWeight) => {
      const netWeight = Math.max(0, parsed.weightKg - tareOffsetRef.current);
      setRawString(parsed.raw);

      recentReadingsRef.current.push(netWeight);
      if (recentReadingsRef.current.length > stabilityWindowSize) {
        recentReadingsRef.current.shift();
      }

      if (recentReadingsRef.current.length >= stabilityWindowSize) {
        const max = Math.max(...recentReadingsRef.current);
        const min = Math.min(...recentReadingsRef.current);
        const stableByWindow = max - min <= stabilityThresholdKg;
        setIsStable(parsed.isStable && stableByWindow);
      } else {
        setIsStable(false);
      }

      setWeightKg(Number(netWeight.toFixed(3)));
    },
    [stabilityWindowSize, stabilityThresholdKg]
  );

  const connect = useCallback(async () => {
    setError(null);
    if (mockMode || typeof navigator === 'undefined' || !('serial' in navigator)) {
      setIsConnected(true);
      setPortName('Simulated Scale (COM1)');
      return;
    }

    try {
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate, dataBits: 8, stopBits: 1, parity: 'none' });

      portRef.current = port;
      setIsConnected(true);
      setPortName('RS-232 / USB Serial Scale');
      keepReadingRef.current = true;

      const textDecoder = new (window as any).TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/[\r\n]+/);
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim().length > 0) {
              const parsed = decoder.current.decode(line);
              if (parsed) processNewReading(parsed);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Scale connection failed');
      setIsConnected(false);
    }
  }, [baudRate, mockMode, processNewReading]);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      try { await readerRef.current.cancel(); } catch {}
      readerRef.current = null;
    }
    if (portRef.current) {
      try { await portRef.current.close(); } catch {}
      portRef.current = null;
    }
    setIsConnected(false);
    setPortName(null);
  }, []);

  const tare = useCallback(() => {
    tareOffsetRef.current = weightKg + tareOffsetRef.current;
    setWeightKg(0.0);
    setIsStable(false);
  }, [weightKg]);

  const zero = useCallback(() => {
    tareOffsetRef.current = 0.0;
    setWeightKg(0.0);
    setIsStable(false);
  }, []);

  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  return {
    weightKg,
    weightMann: Number((weightKg / 40.0).toFixed(3)),
    isStable,
    isConnected,
    portName,
    rawString,
    error,
    connect,
    disconnect,
    tare,
    zero
  };
}