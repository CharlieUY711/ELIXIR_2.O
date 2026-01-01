/**
 * Script para Aplicar Optimizaciones a los Servicios
 * 
 * Este script aplica las optimizaciones calculadas directamente
 * a los archivos de configuración de los servicios.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PerformanceOptimizer, OptimizationConfig } from './optimize-performance';

interface ServiceConfig {
  name: string;
  envPath: string;
  configPath?: string;
}

class OptimizationApplier {
  private services: ServiceConfig[] = [
    {
      name: 'WhatsApp Edge',
      envPath: path.join(__dirname, '../../services/whatsapp-edge/.env'),
      configPath: path.join(__dirname, '../../services/whatsapp-edge/.env.local')
    },
    {
      name: 'Core',
      envPath: path.join(__dirname, '../../core/.env')
    }
  ];

  /**
   * Lee o crea un archivo .env y actualiza las variables optimizadas
   */
  private updateEnvFile(envPath: string, config: OptimizationConfig): void {
    let envContent = '';

    // Leer archivo existente si existe
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Actualizar o agregar variables optimizadas
    const updates: Map<string, string> = new Map([
      ['PROVIDER_TIMEOUT_MS', config.providerTimeoutMs.toString()],
      ['WAM_STORAGE_TIMEOUT_MS', config.storageTimeoutMs.toString()],
      ['WAM_TOTAL_TIMEOUT_MS', config.totalTimeoutMs.toString()],
      ['OPERATIONAL_MAX_HANDOFFS_PER_DAY', config.maxHandoffsPerDay.toString()],
      ['OPERATIONAL_MAX_CONCURRENT_USERS', config.maxConcurrentUsers.toString()],
      ['OPERATIONAL_FAILURE_THRESHOLD_PERCENT', config.failureThresholdPercent.toString()],
      ['OPERATIONAL_FAILURE_WINDOW_MS', config.failureWindowMs.toString()],
      ['NODE_OPTIONS', `--max-old-space-size=${config.nodeMaxOldSpaceSize}`]
    ]);

    // Procesar líneas existentes
    const lines = envContent.split('\n');
    const updatedLines: string[] = [];
    const processedKeys = new Set<string>();

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Saltar comentarios y líneas vacías
      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        updatedLines.push(line);
        continue;
      }

      // Buscar variables a actualizar
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        
        if (updates.has(key)) {
          // Actualizar variable existente
          updatedLines.push(`${key}=${updates.get(key)}`);
          processedKeys.add(key);
          continue;
        }
      }

      // Mantener línea original
      updatedLines.push(line);
    }

    // Agregar variables nuevas que no existían
    for (const [key, value] of updates.entries()) {
      if (!processedKeys.has(key)) {
        updatedLines.push(`${key}=${value}`);
      }
    }

    // Agregar comentario de optimización
    if (!envContent.includes('# Optimizaciones aplicadas')) {
      updatedLines.unshift('');
      updatedLines.unshift(`# Optimizaciones aplicadas: ${new Date().toISOString()}`);
    }

    // Escribir archivo actualizado
    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8');
  }

  /**
   * Aplica optimizaciones a todos los servicios
   */
  public applyToServices(dryRun: boolean = false): void {
    const optimizer = new PerformanceOptimizer();
    const config = optimizer.calculateOptimalConfig();

    console.log('🔧 Aplicando optimizaciones a los servicios...\n');

    for (const service of this.services) {
      console.log(`📦 Procesando: ${service.name}`);

      if (service.envPath) {
        const envPath = service.envPath;
        
        if (dryRun) {
          console.log(`   [DRY RUN] Actualizaría: ${envPath}`);
        } else {
          // Crear directorio si no existe
          const envDir = path.dirname(envPath);
          if (!fs.existsSync(envDir)) {
            fs.mkdirSync(envDir, { recursive: true });
          }

          this.updateEnvFile(envPath, config);
          console.log(`   ✅ Actualizado: ${envPath}`);
        }
      }

      if (service.configPath && !dryRun) {
        console.log(`   ℹ️  Config adicional: ${service.configPath}`);
      }
    }

    console.log('\n✅ Optimizaciones aplicadas exitosamente!');
    console.log('\n📝 IMPORTANTE:');
    console.log('   1. Revisar los archivos .env modificados');
    console.log('   2. Reiniciar los servicios para aplicar cambios');
    console.log('   3. Monitorear métricas después del reinicio\n');
  }
}

// Ejecución principal
if (require.main === module) {
  const applier = new OptimizationApplier();
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    console.log('🔍 MODO DRY RUN - No se realizarán cambios\n');
  }

  try {
    applier.applyToServices(dryRun);
  } catch (error) {
    console.error('❌ Error al aplicar optimizaciones:', error);
    process.exit(1);
  }
}

export { OptimizationApplier };

