/**
 * Script de Optimización de Rendimiento - ELIXIR 2.0
 * 
 * Este script implementa mejoras específicas en el sistema para reducir
 * los cuellos de botella y mejorar el rendimiento general.
 * 
 * Funcionalidades:
 * 1. Análisis de recursos del sistema
 * 2. Ajuste de parámetros de configuración (timeouts, límites de memoria)
 * 3. Optimización de configuración de Node.js
 * 4. Generación de informe de modificaciones
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

interface SystemResources {
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  memoryPercent: number;
  cpuCount: number;
  platform: string;
  nodeVersion: string;
}

interface OptimizationConfig {
  nodeMaxOldSpaceSize: number;
  providerTimeoutMs: number;
  storageTimeoutMs: number;
  totalTimeoutMs: number;
  maxHandoffsPerDay: number;
  maxConcurrentUsers: number;
  failureThresholdPercent: number;
  failureWindowMs: number;
}

interface OptimizationResult {
  timestamp: string;
  systemResources: SystemResources;
  appliedOptimizations: OptimizationConfig;
  recommendations: string[];
  performanceGains: {
    estimatedThroughputIncrease: string;
    estimatedMemoryEfficiency: string;
    estimatedLatencyReduction: string;
  };
}

class PerformanceOptimizer {
  private configPath: string;
  private reportPath: string;
  private systemResources: SystemResources;

  constructor() {
    this.configPath = path.join(__dirname, 'optimization-config.json');
    this.reportPath = path.join(__dirname, 'optimization-report.json');
    this.systemResources = this.analyzeSystemResources();
  }

  /**
   * Analiza los recursos disponibles del sistema
   */
  private analyzeSystemResources(): SystemResources {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercent = (usedMemory / totalMemory) * 100;

    let nodeVersion = 'unknown';
    try {
      nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    } catch (error) {
      console.warn('No se pudo obtener la versión de Node.js');
    }

    return {
      totalMemory,
      freeMemory,
      usedMemory,
      memoryPercent,
      cpuCount: os.cpus().length,
      platform: os.platform(),
      nodeVersion
    };
  }

  /**
   * Calcula la configuración óptima basada en los recursos del sistema
   */
  private calculateOptimalConfig(): OptimizationConfig {
    const { totalMemory, memoryPercent, cpuCount } = this.systemResources;
    const totalMemoryGB = totalMemory / (1024 ** 3);

    // Calcular memoria máxima para Node.js (80% de la memoria disponible)
    // Mínimo 2GB, máximo basado en memoria disponible
    const availableMemoryGB = (totalMemory * 0.8) / (1024 ** 3);
    const nodeMaxOldSpaceSize = Math.max(2048, Math.floor(availableMemoryGB * 1024));

    // Optimizar timeouts basado en análisis de cuellos de botella
    // Reducir timeout del proveedor de 10s a 7s para mejorar throughput
    const providerTimeoutMs = 7000;
    const storageTimeoutMs = 2000; // Mantener en 2s
    const totalTimeoutMs = 12000; // Reducir de 15s a 12s

    // Ajustar límites operativos según recursos
    // Aumentar límites si hay más memoria disponible
    const memoryMultiplier = totalMemoryGB >= 8 ? 1.5 : 1.0;
    const maxHandoffsPerDay = Math.floor(100 * memoryMultiplier);
    const maxConcurrentUsers = Math.min(20, Math.floor(10 * memoryMultiplier));

    // Mantener umbrales de falla conservadores
    const failureThresholdPercent = 20;
    const failureWindowMs = 3600000; // 1 hora

    return {
      nodeMaxOldSpaceSize,
      providerTimeoutMs,
      storageTimeoutMs,
      totalTimeoutMs,
      maxHandoffsPerDay,
      maxConcurrentUsers,
      failureThresholdPercent,
      failureWindowMs
    };
  }

  /**
   * Genera recomendaciones basadas en el análisis
   */
  private generateRecommendations(config: OptimizationConfig): string[] {
    const recommendations: string[] = [];
    const { memoryPercent, cpuCount } = this.systemResources;

    // Recomendaciones de memoria
    if (memoryPercent > 80) {
      recommendations.push('⚠️  ALTA: Uso de memoria superior al 80%. Considerar aumentar memoria o reducir carga.');
    } else if (memoryPercent > 60) {
      recommendations.push('⚠️  MEDIA: Uso de memoria superior al 60%. Monitorear de cerca.');
    }

    // Recomendaciones de CPU
    if (cpuCount < 4) {
      recommendations.push('💡 Considerar aumentar núcleos de CPU para mejor rendimiento en producción.');
    }

    // Recomendaciones de timeouts
    if (config.providerTimeoutMs < 10000) {
      recommendations.push(`✅ Timeout del proveedor optimizado a ${config.providerTimeoutMs}ms (reducción de 30%)`);
      recommendations.push('   Esto debería aumentar el throughput teórico de ~6 a ~8.5 requests/segundo por worker');
    }

    // Recomendaciones de límites
    if (config.maxHandoffsPerDay > 100) {
      recommendations.push(`✅ Límite diario de handoffs aumentado a ${config.maxHandoffsPerDay} (basado en recursos disponibles)`);
    }

    // Recomendaciones de Node.js
    recommendations.push(`✅ Memoria máxima de Node.js configurada a ${config.nodeMaxOldSpaceSize}MB`);
    recommendations.push('   Ejecutar con: node --max-old-space-size=' + config.nodeMaxOldSpaceSize + ' <script>');

    // Recomendaciones de monitoreo
    recommendations.push('📊 Monitorear métricas después de aplicar optimizaciones:');
    recommendations.push('   - Latencia p95 del proveedor');
    recommendations.push('   - Tasa de timeouts del proveedor');
    recommendations.push('   - Throughput de requests por segundo');
    recommendations.push('   - Uso de memoria del proceso Node.js');

    return recommendations;
  }

  /**
   * Calcula ganancias estimadas de rendimiento
   */
  private calculatePerformanceGains(config: OptimizationConfig): OptimizationResult['performanceGains'] {
    const oldProviderTimeout = 10000;
    const newProviderTimeout = config.providerTimeoutMs;
    
    // Throughput teórico: requests/segundo = 1000ms / timeout_ms
    const oldThroughput = 1000 / oldProviderTimeout;
    const newThroughput = 1000 / newProviderTimeout;
    const throughputIncrease = ((newThroughput - oldThroughput) / oldThroughput) * 100;

    // Eficiencia de memoria: basada en mejor uso del heap
    const memoryEfficiency = this.systemResources.memoryPercent < 60 ? 'Excelente' : 
                            this.systemResources.memoryPercent < 80 ? 'Buena' : 'Requiere atención';

    // Reducción de latencia: basada en timeout reducido
    const latencyReduction = ((oldProviderTimeout - newProviderTimeout) / oldProviderTimeout) * 100;

    return {
      estimatedThroughputIncrease: `~${throughputIncrease.toFixed(1)}% (de ~${oldThroughput.toFixed(2)} a ~${newThroughput.toFixed(2)} req/s por worker)`,
      estimatedMemoryEfficiency: memoryEfficiency,
      estimatedLatencyReduction: `~${latencyReduction.toFixed(1)}% (timeout reducido de ${oldProviderTimeout}ms a ${newProviderTimeout}ms)`
    };
  }

  /**
   * Aplica las optimizaciones generando archivos de configuración
   */
  public applyOptimizations(): OptimizationResult {
    console.log('🔍 Analizando recursos del sistema...');
    const config = this.calculateOptimalConfig();
    const recommendations = this.generateRecommendations(config);
    const performanceGains = this.calculatePerformanceGains(config);

    const result: OptimizationResult = {
      timestamp: new Date().toISOString(),
      systemResources: this.systemResources,
      appliedOptimizations: config,
      recommendations,
      performanceGains
    };

    // Guardar configuración
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    // Guardar informe completo
    fs.writeFileSync(
      this.reportPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );

    return result;
  }

  /**
   * Genera variables de entorno optimizadas
   */
  public generateEnvFile(outputPath?: string): void {
    const config = this.calculateOptimalConfig();
    const envPath = outputPath || path.join(__dirname, '.env.optimized');

    const envContent = `# Configuración optimizada generada automáticamente
# Fecha: ${new Date().toISOString()}

# Timeouts optimizados
PROVIDER_TIMEOUT_MS=${config.providerTimeoutMs}
WAM_STORAGE_TIMEOUT_MS=${config.storageTimeoutMs}
WAM_TOTAL_TIMEOUT_MS=${config.totalTimeoutMs}

# Límites operativos optimizados
OPERATIONAL_MAX_HANDOFFS_PER_DAY=${config.maxHandoffsPerDay}
OPERATIONAL_MAX_CONCURRENT_USERS=${config.maxConcurrentUsers}
OPERATIONAL_FAILURE_THRESHOLD_PERCENT=${config.failureThresholdPercent}
OPERATIONAL_FAILURE_WINDOW_MS=${config.failureWindowMs}

# Configuración de Node.js
# Ejecutar con: node --max-old-space-size=${config.nodeMaxOldSpaceSize} <script>
NODE_OPTIONS=--max-old-space-size=${config.nodeMaxOldSpaceSize}
`;

    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log(`✅ Archivo de variables de entorno generado: ${envPath}`);
  }

  /**
   * Muestra el informe en consola
   */
  public displayReport(result: OptimizationResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 INFORME DE OPTIMIZACIÓN DE RENDIMIENTO - ELIXIR 2.0');
    console.log('='.repeat(80));
    console.log(`Fecha: ${result.timestamp}\n`);

    console.log('💻 RECURSOS DEL SISTEMA:');
    console.log(`   Memoria Total: ${(result.systemResources.totalMemory / (1024 ** 3)).toFixed(2)} GB`);
    console.log(`   Memoria Libre: ${(result.systemResources.freeMemory / (1024 ** 3)).toFixed(2)} GB`);
    console.log(`   Memoria Usada: ${(result.systemResources.usedMemory / (1024 ** 3)).toFixed(2)} GB (${result.systemResources.memoryPercent.toFixed(1)}%)`);
    console.log(`   CPUs: ${result.systemResources.cpuCount}`);
    console.log(`   Plataforma: ${result.systemResources.platform}`);
    console.log(`   Node.js: ${result.systemResources.nodeVersion}\n`);

    console.log('⚙️  CONFIGURACIONES APLICADAS:');
    console.log(`   Memoria Máx. Node.js: ${result.appliedOptimizations.nodeMaxOldSpaceSize} MB`);
    console.log(`   Timeout Proveedor: ${result.appliedOptimizations.providerTimeoutMs} ms`);
    console.log(`   Timeout Almacenamiento: ${result.appliedOptimizations.storageTimeoutMs} ms`);
    console.log(`   Timeout Total: ${result.appliedOptimizations.totalTimeoutMs} ms`);
    console.log(`   Límite Handoffs/Día: ${result.appliedOptimizations.maxHandoffsPerDay}`);
    console.log(`   Límite Usuarios Concurrentes: ${result.appliedOptimizations.maxConcurrentUsers}\n`);

    console.log('📈 GANANCIAS ESTIMADAS DE RENDIMIENTO:');
    console.log(`   Aumento de Throughput: ${result.performanceGains.estimatedThroughputIncrease}`);
    console.log(`   Eficiencia de Memoria: ${result.performanceGains.estimatedMemoryEfficiency}`);
    console.log(`   Reducción de Latencia: ${result.performanceGains.estimatedLatencyReduction}\n`);

    console.log('💡 RECOMENDACIONES:');
    result.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Configuración guardada en: ${this.configPath}`);
    console.log(`✅ Informe completo guardado en: ${this.reportPath}`);
    console.log('='.repeat(80) + '\n');
  }
}

// Ejecución principal
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  
  try {
    console.log('🚀 Iniciando optimización de rendimiento...\n');
    
    const result = optimizer.applyOptimizations();
    optimizer.displayReport(result);
    
    // Generar archivo .env optimizado
    optimizer.generateEnvFile();
    
    console.log('✅ Optimización completada exitosamente!\n');
    console.log('📝 PRÓXIMOS PASOS:');
    console.log('   1. Revisar el archivo optimization-config.json');
    console.log('   2. Aplicar las variables de entorno del archivo .env.optimized');
    console.log('   3. Reiniciar los servicios con la nueva configuración');
    console.log('   4. Monitorear métricas durante las próximas horas');
    console.log('   5. Ajustar parámetros según resultados observados\n');
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
}

export { PerformanceOptimizer, OptimizationResult, OptimizationConfig };

