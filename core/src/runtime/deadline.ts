/**
 * Deadline - Validación de expiración de solicitudes
 * 
 * Si expirado → DENY
 */

import { IClock } from './clock';
import { DeadlineExpiredError } from '../domain/errors';
import { AuthorizationRequest } from '../domain/request';

export class Deadline {
  constructor(private clock: IClock) {}

  validate(request: AuthorizationRequest): void {
    const now = this.clock.now();
    let deadline: number;

    if (request.deadline_at !== undefined) {
      deadline = request.deadline_at;
    } else if (request.deadline_ms !== undefined) {
      deadline = request.issued_at + request.deadline_ms;
    } else {
      throw new DeadlineExpiredError('Missing deadline_at or deadline_ms');
    }

    if (now > deadline) {
      throw new DeadlineExpiredError(`Request expired. Now: ${now}, Deadline: ${deadline}`);
    }
  }
}

