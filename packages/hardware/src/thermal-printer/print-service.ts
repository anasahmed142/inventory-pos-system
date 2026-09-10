// packages/hardware/src/thermal-printer/print-service.ts
import { EscPosBuilder } from './escpos-builder';

export class PrintService {
  public static async printReceipt(elementId: string): Promise<void> {
    const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isDesktop) {
      const { invoke } = await import('@tauri-apps/api/core');
      const builder = new EscPosBuilder();
      builder.text('Thermal Print Dispatch').feed(2).cut();
      await invoke('print_raw_thermal', { bytes: Array.from(builder.toUint8Array()) });
    } else {
      window.print();
    }
  }
}