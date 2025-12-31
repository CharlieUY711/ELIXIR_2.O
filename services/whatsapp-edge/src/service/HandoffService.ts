/**
 * Servicio para creación de handoffs
 * El Chat llama a este servicio para crear handoffs autorizados
 */

import { ITempStore } from '../contracts/TempStore';
import { IObservability } from '../contracts/Observability';
import { CreateHandoffRequest, CreateHandoffResponse } from '../types/Handoff';
import { v4 as uuidv4 } from 'uuid';

export class HandoffService {
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos
  private readonly BASE_URL: string;

  constructor(
    private tempStore: ITempStore,
    private observability: IObservability,
    baseUrl: string = 'http://localhost:3002'
  ) {
    this.BASE_URL = baseUrl;
  }

  async createHandoff(request: CreateHandoffRequest): Promise<CreateHandoffResponse> {
    // Validar campos requeridos
    if (!request.session_id || !request.user_ref || !request.model_ref) {
      throw new Error('Campos requeridos: session_id, user_ref, model_ref');
    }

    // Generar handoff_id único (UUID v4)
    const handoff_id = uuidv4();
    const now = new Date();
    const expires_at = new Date(now.getTime() + this.TTL_MS);

    // Crear handoff
    const handoff = {
      handoff_id,
      session_id: request.session_id,
      user_ref: request.user_ref,
      model_ref: request.model_ref,
      status: 'CREATED' as const,
      created_at: now.toISOString(),
      expires_at: expires_at.toISOString()
    };

    const createResult = await this.tempStore.create(handoff);

    if (!createResult.success) {
      throw new Error(`Error al crear handoff: ${createResult.error?.message}`);
    }

    // Registrar evento
    this.observability.recordEvent({
      type: 'handoff_created',
      handoff_id,
      session_id: request.session_id,
      timestamp: now.toISOString()
    });

    // Generar URL del handoff
    const handoff_url = `${this.BASE_URL}/resolve/${handoff_id}`;

    return {
      handoff_id,
      handoff_url
    };
  }
}

