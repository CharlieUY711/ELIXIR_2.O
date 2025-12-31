/**
 * parseArgs - Parseo simple de argumentos del CLI
 * 
 * command: authorize
 * adapter: elixir
 * flags: --action=XXX
 * 
 * No usar librerías externas.
 */

export interface ParsedArgs {
  command: string;
  adapter: string;
  action: string;
}

export function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    command: '',
    adapter: '',
    action: ''
  };

  // Parsear command (primer argumento)
  if (args.length > 0) {
    parsed.command = args[0];
  }

  // Parsear adapter (segundo argumento)
  if (args.length > 1) {
    parsed.adapter = args[1];
  }

  // Parsear flags --action=XXX
  for (const arg of args) {
    if (arg.startsWith('--action=')) {
      parsed.action = arg.substring('--action='.length);
    }
  }

  return parsed;
}

