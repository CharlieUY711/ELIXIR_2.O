/**
 * Reservation - Reserva de saldo entre wallets
 * 
 * Representa una reserva temporal de saldo de una wallet hacia otra.
 */
export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Reservation {
  id: string; // uuid
  from_wallet_id: string; // uuid
  to_wallet_id: string; // uuid
  amount: number; // integer
  status: ReservationStatus;
  created_at: Date; // timestamp
  expires_at: Date | null; // timestamp, nullable
}

