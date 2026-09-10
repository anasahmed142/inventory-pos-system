// packages/hardware/src/thermal-printer/escpos-builder.ts
export type TextAlignment = 'left' | 'center' | 'right';

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  public init(): this {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  public align(alignment: TextAlignment): this {
    const alignMap = { left: 0, center: 1, right: 2 };
    this.buffer.push(0x1b, 0x61, alignMap[alignment]);
    return this;
  }

  public bold(enabled: boolean): this {
    this.buffer.push(0x1b, 0x45, enabled ? 1 : 0);
    return this;
  }

  public feed(lines = 1): this {
    for (let i = 0; i < lines; i++) this.buffer.push(0x0a);
    return this;
  }

  public divider(char = '-', width = 48): this {
    this.text(char.repeat(width));
    this.feed(1);
    return this;
  }

  public text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.buffer.push(code < 128 ? code : 0x3f);
    }
    return this;
  }

  public cut(partial = false): this {
    this.feed(3);
    this.buffer.push(0x1d, 0x56, partial ? 0x01 : 0x00);
    return this;
  }

  public openCashDrawer(): this {
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    return this;
  }

  public appendRaw(bytes: Uint8Array | number[]): this {
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}