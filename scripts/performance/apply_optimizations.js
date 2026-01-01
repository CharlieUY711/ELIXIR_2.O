#!/usr/bin/env node
/**
 * Script de Aplicación de Optimizaciones de Rendimiento
 * Fase 6.3: Implementación de Mejoras de Rendimiento
 * 
 * Este script aplica las optimizaciones configuradas en optimization_config.json
 * a los procesos del sistema ELIXIR 2.0
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(__dirname, 'optimization_config.json');

/**
 * Lee la configuración de optimización
 */
function loadConfig() {
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Error al cargar configuración:', error.message);
    process.exit(1);
  }
}

/**
 * Aplica optimizaciones de Node.js mediante variables de entorno
 */
function applyNodeJSOptimizations(config) {
  const nodeOpts = [];
  const optimizations = config.optimizations.nodejs;

  // Configuración de memoria
  if (optimizations.memory.max_old_space_size) {
    nodeOpts.push(`--max-old-space-size=${optimizations.memory.max_old_space_size}`);
  }

  // Exponer GC para control manual
  if (optimizations.gc.expose_gc) {
    nodeOpts.push('--expose-gc');
  }

  // Optimizaciones V8
  if (optimizations.v8.max_semi_space_size) {
    nodeOpts.push(`--max-semi-space-size=${optimizations.v8.max_semi_space_size}`);
  }

  return nodeOpts.join(' ');
}

/**
 * Genera recomendaciones de prioridad de proceso según el sistema operativo
 */
function getProcessPriorityRecommendations(config) {
  const platform = os.platform();
  const recommendations = [];

  if (platform === 'win32') {
    recommendations.push({
      platform: 'Windows',
      command: 'wmic process where name="node.exe" CALL setpriority "high priority"',
      description: 'Establece prioridad alta para procesos Node.js en Windows',
      note: 'Requiere permisos de administrador'
    });
  } else if (platform === 'linux' || platform === 'darwin') {
    recommendations.push({
      platform: 'Linux/macOS',
      command: 'nice -n -10 node <script>',
      description: 'Ejecuta proceso con prioridad alta usando nice',
      note: 'Valores negativos requieren permisos de root'
    });
  }

  return recommendations;
}

/**
 * Genera script de configuración para el sistema
 */
function generateSystemConfigScript(config) {
  const platform = os.platform();
  const script = {
    windows: generateWindowsScript(config),
    unix: generateUnixScript(config)
  };

  return script[platform === 'win32' ? 'windows' : 'unix'];
}

function generateWindowsScript(config) {
  return `@echo off
REM Script de optimización de rendimiento para Windows
REM Fase 6.3: Implementación de Mejoras de Rendimiento

echo Aplicando optimizaciones de rendimiento...

REM Configurar variables de entorno para Node.js
set NODE_OPTIONS=${applyNodeJSOptimizations(config)}

REM Ajustar prioridad de procesos Node.js
echo Configurando prioridad de procesos...
wmic process where name="node.exe" CALL setpriority "high priority" 2>nul

echo Optimizaciones aplicadas.
echo NODE_OPTIONS=%NODE_OPTIONS%
`;
}

function generateUnixScript(config) {
  return `#!/bin/bash
# Script de optimización de rendimiento para Linux/macOS
# Fase 6.3: Implementación de Mejoras de Rendimiento

echo "Aplicando optimizaciones de rendimiento..."

# Configurar variables de entorno para Node.js
export NODE_OPTIONS="${applyNodeJSOptimizations(config)}"

# Ajustar límites del sistema (requiere permisos)
if [ "$EUID" -eq 0 ]; then
    echo "Configurando límites del sistema..."
    ulimit -n 65536  # Aumentar límite de archivos abiertos
    ulimit -u 32768  # Aumentar límite de procesos
fi

echo "Optimizaciones aplicadas."
echo "NODE_OPTIONS=$NODE_OPTIONS"
`;
}

/**
 * Función principal
 */
function main() {
  console.log('=== Aplicación de Optimizaciones de Rendimiento ===\n');
  console.log('Fase 6.3: Implementación de Mejoras de Rendimiento\n');

  const config = loadConfig();
  console.log('Configuración cargada:', config.description);
  console.log('Versión:', config.version);
  console.log('');

  // Mostrar optimizaciones de Node.js
  const nodeOpts = applyNodeJSOptimizations(config);
  console.log('Optimizaciones de Node.js:');
  console.log('NODE_OPTIONS:', nodeOpts);
  console.log('');

  // Mostrar recomendaciones de prioridad
  const priorityRecs = getProcessPriorityRecommendations(config);
  if (priorityRecs.length > 0) {
    console.log('Recomendaciones de prioridad de proceso:');
    priorityRecs.forEach(rec => {
      console.log(`  [${rec.platform}] ${rec.description}`);
      console.log(`    Comando: ${rec.command}`);
      console.log(`    Nota: ${rec.note}`);
    });
    console.log('');
  }

  // Generar scripts de configuración
  const systemScript = generateSystemConfigScript(config);
  const scriptPath = path.join(__dirname, `apply_optimizations_${os.platform() === 'win32' ? 'windows.bat' : 'unix.sh'}`);
  
  try {
    fs.writeFileSync(scriptPath, systemScript, { mode: 0o755 });
    console.log(`Script de configuración generado: ${scriptPath}`);
  } catch (error) {
    console.error('Error al generar script:', error.message);
  }

  console.log('\n=== Optimizaciones listas para aplicar ===');
  console.log('Ejecuta el script generado con permisos apropiados para aplicar las optimizaciones al sistema.');
}

if (require.main === module) {
  main();
}

module.exports = {
  loadConfig,
  applyNodeJSOptimizations,
  getProcessPriorityRecommendations,
  generateSystemConfigScript
};

