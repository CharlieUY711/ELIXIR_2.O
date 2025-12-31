/**
 * Implementación in-memory del Almacenamiento Temporal
 * Solo para DEV - NO para producción
 */

import { ITempStore, CreateResult, GetResult, UpdateResult, TempStoreError } from '../contracts/TempStore';
import { Handoff, HandoffStatus } from '../types/Handoff';

export class InMemoryTempStore implements ITempStore {
  private store: Map<string, Handoff> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minuto
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Iniciar limpieza periódica
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired().catch(err => {
        console.error('[TempStore] Error en limpieza automática:', err);
      });
    }, this.CLEANUP_INTERVAL_MS);
  }

  async create(handoff: Handoff): Promise<CreateResult> {
    try {
      // Validar que status sea CREATED
      if (handoff.status !== 'CREATED') {
        return {
          success: false,
          error: {
            type: 'invalid_transition',
            message: 'Handoff debe crearse con status CREATED'
          }
        };
      }

      // Validar que handoff_id no exista (atomicidad simulada)
      if (this.store.has(handoff.handoff_id)) {
        return {
          success: false,
          error: {
            type: 'duplicate_handoff_id',
            message: 'Handoff ID ya existe'
          }
        };
      }

      // Crear handoff (operación atómica simulada)
      this.store.set(handoff.handoff_id, { ...handoff });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'storage_unavailable',
          message: `Error al crear handoff: ${error}`
        }
      };
    }
  }

  async get(handoff_id: string): Promise<GetResult> {
    try {
      const handoff = this.store.get(handoff_id);
      
      if (!handoff) {
        return {
          error: {
            type: 'handoff_not_found',
            message: 'Handoff no encontrado'
          }
        };
      }

      return { handoff: { ...handoff } };
    } catch (error) {
      return {
        error: {
          type: 'storage_unavailable',
          message: `Error al consultar handoff: ${error}`
        }
      };
    }
  }

  async update(handoff_id: string, status: HandoffStatus): Promise<UpdateResult> {
    try {
      const handoff = this.store.get(handoff_id);
      
      if (!handoff) {
        return {
          success: false,
          error: {
            type: 'handoff_not_found',
            message: 'Handoff no encontrado'
          }
        };
      }

      // Validar transiciones permitidas
      const validTransitions: Record<HandoffStatus, HandoffStatus[]> = {
        CREATED: ['REDEEMED', 'EXPIRED', 'REVOKED'],
        REDEEMED: [], // No se permite transición desde REDEEMED
        EXPIRED: [],  // No se permite transición desde EXPIRED
        REVOKED: []   // No se permite transición desde REVOKED
      };

      if (!validTransitions[handoff.status].includes(status)) {
        return {
          success: false,
          error: {
            type: 'invalid_transition',
            message: `Transición no permitida: ${handoff.status} → ${status}`
          }
        };
      }

      // Actualizar estado (operación atómica simulada)
      const now = new Date().toISOString();
      const updated: Handoff = {
        ...handoff,
        status,
        ...(status === 'REDEEMED' && { redeemed_at: now }),
        ...(status === 'REVOKED' && { revoked_at: now })
      };

      this.store.set(handoff_id, updated);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'storage_unavailable',
          message: `Error al actualizar handoff: ${error}`
        }
      };
    }
  }

  async expire(handoff_id: string): Promise<UpdateResult> {
    const handoff = await this.get(handoff_id);
    
    if (!handoff.handoff || handoff.error) {
      return {
        success: false,
        error: handoff.error || {
          type: 'handoff_not_found',
          message: 'Handoff no encontrado'
        }
      };
    }

    if (handoff.handoff.status !== 'CREATED') {
      return {
        success: false,
        error: {
          type: 'invalid_transition',
          message: 'Solo handoffs CREATED pueden expirar'
        }
      };
    }

    return this.update(handoff_id, 'EXPIRED');
  }

  async cleanupExpired(): Promise<void> {
    const now = Date.now();
    const expiredIds: string[] = [];

    for (const [handoff_id, handoff] of this.store.entries()) {
      const expiresAt = new Date(handoff.expires_at).getTime();
      
      if (now >= expiresAt) {
        // Marcar como EXPIRED si aún está CREATED
        if (handoff.status === 'CREATED') {
          await this.expire(handoff_id);
        }
        // Eliminar handoffs expirados (después de TTL)
        expiredIds.push(handoff_id);
      }
    }

    // Eliminar handoffs expirados
    for (const id of expiredIds) {
      this.store.delete(id);
    }
  }

  /**
   * Detiene limpieza automática (útil para tests)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Limpia todo el almacenamiento (útil para tests)
   */
  clear(): void {
    this.store.clear();
  }
}

