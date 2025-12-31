/**
 * Decision CLI - Entry point
 * 
 * Conecta CLI → adapter → engine
 * Manejo de errores: cualquier error => imprimir DENY
 * No logs adicionales
 */

import { parseArgs } from './cli/parseArgs';
import { run } from './cli/run';

async function main() {
  try {
    // Obtener argumentos (saltar node y script)
    const args = process.argv.slice(2);
    const parsedArgs = parseArgs(args);
    
    await run(parsedArgs);
  } catch (error) {
    // Cualquier error => imprimir DENY
    console.log('DENY');
    process.exit(1);
  }
}

main();
