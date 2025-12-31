/**
 * Implementación simulada del Sender (NOOP)
 * Solo para DEV - NO envía nada real
 */

import { ISender, SendRequest, SendResult } from '../contracts/Sender';

export class NoopSender implements ISender {
  async send(request: SendRequest): Promise<SendResult> {
    // Simulación: no envía nada real
    // En producción, aquí se haría la llamada real al proveedor de WhatsApp
    
    const timestamp = new Date().toISOString();
    
    // Simular éxito siempre (para DEV)
    return {
      success: true,
      timestamp
    };
  }
}

