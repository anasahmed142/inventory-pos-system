// packages/hardware/src/scales/decoders.ts
export interface ParsedWeight {
  weightKg: number;
  isStable: boolean;
  unit: 'kg' | 'g' | 'mann';
  raw: string;
}

export type ScaleProtocol = 'yaohua_a12' | 'cas_toledo' | 'generic_ascii';

export interface IScaleDecoder {
  decode(buffer: string): ParsedWeight | null;
}

export class YaohuaA12Decoder implements IScaleDecoder {
  decode(buffer: string): ParsedWeight | null {
    const frameMatch = buffer.match(/(ST|US),(GS|NT),([+-]?\d+\.?\d*)\s*(kg|g)?/i);
    if (frameMatch) {
      const isStable = frameMatch[1].toUpperCase() === 'ST';
      const weightVal = parseFloat(frameMatch[3]);
      const rawUnit = (frameMatch[4] || 'kg').toLowerCase();
      const weightKg = rawUnit === 'g' ? weightVal / 1000 : weightVal;
      return { weightKg: Number(weightKg.toFixed(3)), isStable, unit: 'kg', raw: buffer.trim() };
    }

    const stxMatch = buffer.match(/\x02([+-]?\d{1,6}\.?\d{0,3})\x03/);
    if (stxMatch) {
      const weightVal = parseFloat(stxMatch[1]);
      return { weightKg: Number(weightVal.toFixed(3)), isStable: true, unit: 'kg', raw: buffer.trim() };
    }
    return null;
  }
}

export class CasToledoDecoder implements IScaleDecoder {
  decode(buffer: string): ParsedWeight | null {
    const match = buffer.match(/(ST|US),(GS|NT),\s*([+-]?\d+\.?\d*),(kg|g)/i);
    if (match) {
      const isStable = match[1].toUpperCase() === 'ST';
      const weightVal = parseFloat(match[3]);
      const unit = match[4].toLowerCase();
      const weightKg = unit === 'g' ? weightVal / 1000 : weightVal;
      return { weightKg: Number(weightKg.toFixed(3)), isStable, unit: 'kg', raw: buffer.trim() };
    }
    return null;
  }
}

export class GenericAsciiDecoder implements IScaleDecoder {
  decode(buffer: string): ParsedWeight | null {
    const match = buffer.match(/([+-]?\d+\.?\d{1,3})\s*(kg|g|mann)?/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = (match[2] || 'kg').toLowerCase();
      let weightKg = val;
      if (unit === 'g') weightKg = val / 1000;
      if (unit === 'mann') weightKg = val * 40;
      return { weightKg: Number(weightKg.toFixed(3)), isStable: true, unit: 'kg', raw: buffer.trim() };
    }
    return null;
  }
}

export function getDecoder(protocol: ScaleProtocol): IScaleDecoder {
  switch (protocol) {
    case 'yaohua_a12': return new YaohuaA12Decoder();
    case 'cas_toledo': return new CasToledoDecoder();
    default: return new GenericAsciiDecoder();
  }
}