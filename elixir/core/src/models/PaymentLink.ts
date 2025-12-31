/**
 * PaymentLink - Enlace de pago generado por Elixir
 * 
 * Representa un enlace de pago asociado a una wallet de modelo.
 */
export enum PaymentLinkStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface PaymentLink {
  id: string; // uuid
  model_wallet_id: string; // uuid
  amount: number; // integer
  status: PaymentLinkStatus;
  expires_at: Date | null; // timestamp, nullable
  created_at: Date; // timestamp
}

