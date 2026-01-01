/**
 * Script de Análisis de Rendimiento - Fase 6.1
 * 
 * Este script recopila métricas clave del sistema para establecer una línea base
 * de rendimiento y guiar futuras optimizaciones.
 * 
 * Métricas recopiladas:
 * - Utilización de CPU
 * - Uso de memoria
 * - Tráfico de red
 * - Tiempos de respuesta del sistema
 */

import * as si from 'systeminformation';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface PerformanceMetrics {
  timestamp: string;
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
    nodeVersion: string;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    currentLoad: {
      avgLoad: number;
      currentLoad: number;
      currentLoadUser: number;
      currentLoadSystem: number;
      currentLoadNice: number;
      currentLoadIdle: number;
      currentLoadIowait: number;
      currentLoadIrq: number;
      currentLoadSoftirq: number;
      cores: Array<{
        load: number;
        loadUser: number;
        loadSystem: number;
        loadNice: number;
        loadIdle: number;
        loadIowait: number;
        loadIrq: number;
        loadSoftirq: number;
      }>;
    };
    cpuSpeed: {
      min: number;
      max: number;
      avg: number;
      cores: number[];
    };
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    buffers: number;
    cached: number;
    swapTotal: number;
    swapUsed: number;
    swapFree: number;
    usagePercent: number;
  };
  network: {
    interfaces: Array<{
      iface: string;
      type: string;
      ip4: string;
      ip6: string;
      mac: string;
      internal: boolean;
      speed: number;
      operstate: string;
      rx_bytes: number;
      rx_dropped: number;
      rx_errors: number;
      tx_bytes: number;
      tx_dropped: number;
      tx_errors: number;
    }>;
    stats: {
      rx_bytes: number;
      rx_dropped: number;
      rx_errors: number;
      tx_bytes: number;
      tx_dropped: number;
      tx_errors: number;
    };
  };
  disk: {
    fsSize: Array<{
      fs: string;
      type: string;
      size: number;
      used: number;
      available: number;
      use: number;
      mount: string;
    }>;
  };
  process: {
    nodeProcess: {
      pid: number;
      cpu: number;
      mem: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
      uptime: number;
    };
  };
  responseTime: {
    cpuInfo: number;
    memoryInfo: number;
    networkInfo: number;
    diskInfo: number;
    totalTime: number;
  };
}

/**
 * Mide el tiempo de ejecución de una función
 */
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const time = Number(end - start) / 1_000_000; // Convertir a milisegundos
  return { result, time };
}

/**
 * Recopila todas las métricas del sistema
 */
async function collectMetrics(): Promise<PerformanceMetrics> {
  console.log('🔍 Iniciando recopilación de métricas del sistema...\n');

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Información del sistema
  console.log('📊 Recopilando información del sistema...');
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    nodeVersion: process.version,
  };

  // Información de CPU
  console.log('⚙️  Recopilando información de CPU...');
  const { result: cpuInfo, time: cpuTime } = await measureTime(async () => {
    const [baseboard, cpu, currentLoad, cpuSpeed] = await Promise.all([
      si.baseboard().catch(() => ({ manufacturer: 'N/A', model: 'N/A' })),
      si.cpu().catch(() => ({ manufacturer: 'N/A', brand: 'N/A', cores: 0, physicalCores: 0 })),
      si.currentLoad().catch(() => ({ avgLoad: 0, currentLoad: 0, cores: [] })),
      si.cpuCurrentSpeed().catch(() => ({ min: 0, max: 0, avg: 0, cores: [] })),
    ]);

    return {
      manufacturer: cpu.manufacturer || 'N/A',
      brand: cpu.brand || 'N/A',
      cores: cpu.cores || 0,
      physicalCores: cpu.physicalCores || 0,
      currentLoad,
      cpuSpeed,
    };
  });

  // Información de memoria
  console.log('💾 Recopilando información de memoria...');
  const { result: memInfo, time: memTime } = await measureTime(async () => {
    const mem = await si.mem().catch(() => ({
      total: 0,
      free: 0,
      used: 0,
      active: 0,
      available: 0,
      buffers: 0,
      cached: 0,
      swapTotal: 0,
      swapUsed: 0,
      swapFree: 0,
    }));

    const usagePercent = mem.total > 0 
      ? ((mem.used / mem.total) * 100) 
      : 0;

    return {
      ...mem,
      usagePercent: Math.round(usagePercent * 100) / 100,
    };
  });

  // Información de red
  console.log('🌐 Recopilando información de red...');
  const { result: netInfo, time: netTime } = await measureTime(async () => {
    const [interfaces, networkStats] = await Promise.all([
      si.networkInterfaces().catch(() => []),
      si.networkStats().catch(() => []),
    ]);

    // Calcular estadísticas totales de red
    const stats = networkStats.reduce(
      (acc, stat) => ({
        rx_bytes: acc.rx_bytes + (stat.rx_bytes || 0),
        rx_dropped: acc.rx_dropped + (stat.rx_dropped || 0),
        rx_errors: acc.rx_errors + (stat.rx_errors || 0),
        tx_bytes: acc.tx_bytes + (stat.tx_bytes || 0),
        tx_dropped: acc.tx_dropped + (stat.tx_dropped || 0),
        tx_errors: acc.tx_errors + (stat.tx_errors || 0),
      }),
      { rx_bytes: 0, rx_dropped: 0, rx_errors: 0, tx_bytes: 0, tx_dropped: 0, tx_errors: 0 }
    );

    return {
      interfaces: interfaces.map((iface) => ({
        iface: iface.iface || 'N/A',
        type: iface.type || 'N/A',
        ip4: iface.ip4 || 'N/A',
        ip6: iface.ip6 || 'N/A',
        mac: iface.mac || 'N/A',
        internal: iface.internal || false,
        speed: iface.speed || 0,
        operstate: iface.operstate || 'N/A',
        rx_bytes: iface.rx_bytes || 0,
        rx_dropped: iface.rx_dropped || 0,
        rx_errors: iface.rx_errors || 0,
        tx_bytes: iface.tx_bytes || 0,
        tx_dropped: iface.tx_dropped || 0,
        tx_errors: iface.tx_errors || 0,
      })),
      stats,
    };
  });

  // Información de disco
  console.log('💿 Recopilando información de disco...');
  const { result: diskInfo, time: diskTime } = await measureTime(async () => {
    const fsSize = await si.fsSize().catch(() => []);
    return {
      fsSize: fsSize.map((fs) => ({
        fs: fs.fs || 'N/A',
        type: fs.type || 'N/A',
        size: fs.size || 0,
        used: fs.used || 0,
        available: fs.available || 0,
        use: fs.use || 0,
        mount: fs.mount || 'N/A',
      })),
    };
  });

  // Información del proceso Node.js actual
  const nodeProcess = {
    pid: process.pid,
    cpu: process.cpuUsage().user + process.cpuUsage().system,
    mem: process.memoryUsage(),
    uptime: process.uptime(),
  };

  const totalTime = Date.now() - startTime;

  const metrics: PerformanceMetrics = {
    timestamp,
    system: systemInfo,
    cpu: cpuInfo,
    memory: memInfo,
    network: netInfo,
    disk: diskInfo,
    process: {
      nodeProcess,
    },
    responseTime: {
      cpuInfo: Math.round(cpuTime * 100) / 100,
      memoryInfo: Math.round(memTime * 100) / 100,
      networkInfo: Math.round(netTime * 100) / 100,
      diskInfo: Math.round(diskTime * 100) / 100,
      totalTime,
    },
  };

  return metrics;
}

/**
 * Guarda las métricas en un archivo JSON
 */
function saveMetrics(metrics: PerformanceMetrics, outputPath: string): void {
  const outputDir = path.dirname(outputPath);
  
  // Crear directorio si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Guardar métricas en formato JSON con indentación
  fs.writeFileSync(
    outputPath,
    JSON.stringify(metrics, null, 2),
    'utf-8'
  );

  console.log(`\n✅ Métricas guardadas en: ${outputPath}`);
}

/**
 * Muestra un resumen de las métricas recopiladas
 */
function displaySummary(metrics: PerformanceMetrics): void {
  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMEN DE MÉTRICAS DE RENDIMIENTO');
  console.log('='.repeat(60));
  
  console.log(`\n🕐 Timestamp: ${metrics.timestamp}`);
  console.log(`🖥️  Sistema: ${metrics.system.platform} ${metrics.system.arch}`);
  console.log(`🏠 Hostname: ${metrics.system.hostname}`);
  console.log(`⏱️  Uptime del sistema: ${Math.round(metrics.system.uptime / 3600)} horas`);

  console.log(`\n⚙️  CPU:`);
  console.log(`   - Procesador: ${metrics.cpu.manufacturer} ${metrics.cpu.brand}`);
  console.log(`   - Núcleos: ${metrics.cpu.physicalCores} físicos, ${metrics.cpu.cores} lógicos`);
  console.log(`   - Carga actual: ${metrics.cpu.currentLoad.currentLoad.toFixed(2)}%`);
  console.log(`   - Velocidad: ${metrics.cpu.cpuSpeed.avg.toFixed(2)} MHz (promedio)`);

  console.log(`\n💾 Memoria:`);
  console.log(`   - Total: ${(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   - Usada: ${(metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   - Disponible: ${(metrics.memory.available / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   - Uso: ${metrics.memory.usagePercent.toFixed(2)}%`);

  console.log(`\n🌐 Red:`);
  console.log(`   - Interfaces activas: ${metrics.network.interfaces.length}`);
  const totalRx = (metrics.network.stats.rx_bytes / 1024 / 1024).toFixed(2);
  const totalTx = (metrics.network.stats.tx_bytes / 1024 / 1024).toFixed(2);
  console.log(`   - Tráfico total RX: ${totalRx} MB`);
  console.log(`   - Tráfico total TX: ${totalTx} MB`);

  console.log(`\n💿 Disco:`);
  metrics.disk.fsSize.forEach((fs) => {
    const sizeGB = (fs.size / 1024 / 1024 / 1024).toFixed(2);
    const usedGB = (fs.used / 1024 / 1024 / 1024).toFixed(2);
    const usePercent = fs.use.toFixed(2);
    console.log(`   - ${fs.mount}: ${usedGB} GB / ${sizeGB} GB (${usePercent}%)`);
  });

  console.log(`\n⏱️  Tiempos de respuesta:`);
  console.log(`   - CPU: ${metrics.responseTime.cpuInfo.toFixed(2)} ms`);
  console.log(`   - Memoria: ${metrics.responseTime.memoryInfo.toFixed(2)} ms`);
  console.log(`   - Red: ${metrics.responseTime.networkInfo.toFixed(2)} ms`);
  console.log(`   - Disco: ${metrics.responseTime.diskInfo.toFixed(2)} ms`);
  console.log(`   - Total: ${metrics.responseTime.totalTime} ms`);

  console.log('\n' + '='.repeat(60));
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  try {
    // Determinar la ruta de salida
    const outputPath = path.resolve(
      process.cwd(),
      'performance_analysis_report.json'
    );

    // Recopilar métricas
    const metrics = await collectMetrics();

    // Mostrar resumen
    displaySummary(metrics);

    // Guardar métricas
    saveMetrics(metrics, outputPath);

    console.log('\n✨ Análisis de rendimiento completado exitosamente.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el análisis de rendimiento:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { collectMetrics, saveMetrics, displaySummary, PerformanceMetrics };

