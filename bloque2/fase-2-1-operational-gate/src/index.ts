/**
 * Entrypoint del Gate de Existencia Operativa
 * FASE 2.1 - BLOQUE 2
 */

export { OperationalExistenceGate } from './gate/OperationalExistenceGate';
export { GateDecision } from './domain/GateDecision';
export { GateRequest } from './domain/GateRequest';
export { SystemState, SystemOperationalState } from './domain/SystemState';
export { IUserValidator, UserValidationResult } from './contracts/IUserValidator';
export { ISystemStateProvider } from './contracts/ISystemStateProvider';
export { IKillSwitchProvider, KillSwitchState } from './contracts/IKillSwitchProvider';

