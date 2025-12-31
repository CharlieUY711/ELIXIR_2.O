/**
 * Wallet - Entidad que representa una billetera en Elixir
 * 
 * Elixir gestiona saldo, no servicios.
 * Cada wallet pertenece a un owner (USER, MODEL o SYSTEM).
 */
export enum OwnerType {
  USER = 'USER',
  MODEL = 'MODEL',
  SYSTEM = 'SYSTEM'
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface Wallet {
  id: string; // uuid
  owner_type: OwnerType;
  owner_id: string; // uuid
  balance: number; // integer
  balance_reserved: number; // integer
  status: WalletStatus;
  created_at: Date; // timestamp
  updated_at: Date; // timestamp
}

