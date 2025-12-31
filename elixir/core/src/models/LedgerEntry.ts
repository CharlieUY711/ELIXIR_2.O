/**
 * LedgerEntry - Entrada en el libro contable de Elixir
 * 
 * Append-only: No se pueden modificar ni eliminar entradas.
 * Cada movimiento financiero genera una entrada en el ledger.
 */
export enum LedgerDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum LedgerType {
  FUNDING = 'FUNDING',
  TRANSFER = 'TRANSFER',
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  EXPIRE = 'EXPIRE'
}

export interface LedgerEntry {
  id: string; // uuid
  wallet_id: string; // uuid
  direction: LedgerDirection;
  amount: number; // integer
  type: LedgerType;
  related_wallet_id: string | null; // uuid, nullable
  reference_id: string | null; // uuid, nullable
  created_at: Date; // timestamp
}

