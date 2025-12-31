/**
 * mapper - Traducción explícita CLI input → Elixir AuthorizationRequest
 * 
 * Sin lógica adicional.
 * Sin defaults ocultos.
 */

import { NormalizedInput } from '../../core/InputNormalizer';
import * as path from 'path';

// Tipo AuthorizationRequest del core
interface AuthorizationRequest {
  request_id: string;
  subject_id: string;
  resource_id: string;
  action: string;
  issued_at: number;
  deadline_at?: number;
  deadline_ms?: number;
  context?: Record<string, unknown>;
}

export function mapToAuthorizationRequest(input: NormalizedInput): AuthorizationRequest {
  const now = Date.now();
  
  return {
    request_id: `cli-${now}-${Math.random().toString(36).substring(7)}`,
    subject_id: 'cli-user',
    resource_id: 'cli-resource',
    action: input.action,
    issued_at: now,
    deadline_ms: 5000, // 5 segundos por defecto
    context: input.context as Record<string, unknown> | undefined
  };
}

