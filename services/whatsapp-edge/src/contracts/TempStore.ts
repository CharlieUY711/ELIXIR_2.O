/**
 * Contrato del Almacenamiento Temporal
 * Mantiene estado transitorio de handoffs durante su ciclo de vida
 */

import { Handoff, HandoffStatus } from '../types/Handoff';

export interface TempStoreError {
  type: 'handoff_not_found' | 'invalid_transition' | 'storage_unavailable' | 'timeout' | 'duplicate_handoff_id';
  message: string;
}

export interface CreateResult {
  success: boolean;
  error?: TempStoreError;
}

export interface GetResult {
  handoff?: Handoff;
  error?: TempStoreError;
}

export interface UpdateResult {
  success: boolean;
  error?: TempStoreError;
}

export interface ITempStore {
  /**
   * Crea un handoff con TTL
   * @param handoff Handoff a crear (status debe ser CREATED)
   * @returns Resultado de la operación
   */
  create(handoff: Handoff): Promise<CreateResult>;

  /**
   * Consulta handoff por ID
   * @param handoff_id ID del handoff
   * @returns Handoff encontrado o error
   */
  get(handoff_id: string): Promise<GetResult>;

  /**
   * Actualiza estado de handoff
   * Solo permite transiciones válidas: CREATED → REDEEMED | EXPIRED | REVOKED
   * @param handoff_id ID del handoff
   * @param status Nuevo estado
   * @returns Resultado de la operación
   */
  update(handoff_id: string, status: HandoffStatus): Promise<UpdateResult>;

  /**
   * Marca handoff como EXPIRED
   * Solo funciona si status == CREATED
   * @param handoff_id ID del handoff
   * @returns Resultado de la operación
   */
  expire(handoff_id: string): Promise<UpdateResult>;

  /**
   * Limpia handoffs expirados
   * Debe ejecutarse periódicamente (cada 1 minuto)
   */
  cleanupExpired(): Promise<void>;
}

