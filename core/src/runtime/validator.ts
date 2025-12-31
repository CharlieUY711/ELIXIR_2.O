/**
 * Validator - Validación estricta de AuthorizationRequest
 * 
 * Valida:
 * - Tipos
 * - Tamaños máximos
 * - Tamaño total del payload
 * 
 * Si falla → DENY
 */

import { AuthorizationRequest } from '../domain/request';
import { ValidationError } from '../domain/errors';

const MAX_STRING_LENGTH = 256;
const MAX_CONTEXT_SIZE = 1024; // bytes aproximados
const MAX_PAYLOAD_SIZE = 2048; // bytes aproximados

export class Validator {
  validate(request: unknown): AuthorizationRequest {
    if (!request || typeof request !== 'object') {
      throw new ValidationError('Request must be an object');
    }

    const req = request as Record<string, unknown>;

    // Validar request_id
    if (!req.request_id || typeof req.request_id !== 'string') {
      throw new ValidationError('Missing or invalid request_id');
    }
    if (req.request_id.length > MAX_STRING_LENGTH) {
      throw new ValidationError('request_id exceeds maximum length');
    }

    // Validar subject_id
    if (!req.subject_id || typeof req.subject_id !== 'string') {
      throw new ValidationError('Missing or invalid subject_id');
    }
    if (req.subject_id.length > MAX_STRING_LENGTH) {
      throw new ValidationError('subject_id exceeds maximum length');
    }

    // Validar resource_id
    if (!req.resource_id || typeof req.resource_id !== 'string') {
      throw new ValidationError('Missing or invalid resource_id');
    }
    if (req.resource_id.length > MAX_STRING_LENGTH) {
      throw new ValidationError('resource_id exceeds maximum length');
    }

    // Validar action
    if (!req.action || typeof req.action !== 'string') {
      throw new ValidationError('Missing or invalid action');
    }
    if (req.action.length > MAX_STRING_LENGTH) {
      throw new ValidationError('action exceeds maximum length');
    }

    // Validar issued_at
    if (typeof req.issued_at !== 'number' || req.issued_at <= 0) {
      throw new ValidationError('Missing or invalid issued_at');
    }

    // Validar deadline (debe tener deadline_at o deadline_ms)
    if (req.deadline_at === undefined && req.deadline_ms === undefined) {
      throw new ValidationError('Missing deadline_at or deadline_ms');
    }
    if (req.deadline_at !== undefined && typeof req.deadline_at !== 'number') {
      throw new ValidationError('Invalid deadline_at');
    }
    if (req.deadline_ms !== undefined && typeof req.deadline_ms !== 'number') {
      throw new ValidationError('Invalid deadline_ms');
    }

    // Validar context (opcional)
    if (req.context !== undefined) {
      if (typeof req.context !== 'object' || req.context === null || Array.isArray(req.context)) {
        throw new ValidationError('Invalid context: must be an object');
      }
      
      // Validar tamaño del context
      const contextStr = JSON.stringify(req.context);
      if (contextStr.length > MAX_CONTEXT_SIZE) {
        throw new ValidationError('context exceeds maximum size');
      }
    }

    // Validar tamaño total del payload
    const payloadStr = JSON.stringify(req);
    if (payloadStr.length > MAX_PAYLOAD_SIZE) {
      throw new ValidationError('Request payload exceeds maximum size');
    }

    return {
      request_id: req.request_id,
      subject_id: req.subject_id,
      resource_id: req.resource_id,
      action: req.action,
      issued_at: req.issued_at,
      deadline_at: req.deadline_at as number | undefined,
      deadline_ms: req.deadline_ms as number | undefined,
      context: req.context as Record<string, unknown> | undefined
    };
  }
}

