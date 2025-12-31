/**
 * Errores internos del Elixir Core
 * 
 * Todos los errores se tratan como DENY.
 * No se exponen fuera del Core.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DeadlineExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeadlineExpiredError';
  }
}

export class InternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalError';
  }
}

