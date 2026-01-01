@echo off
REM Script de optimización de rendimiento para Windows
REM Fase 6.3: Implementación de Mejoras de Rendimiento

echo Aplicando optimizaciones de rendimiento...

REM Configurar variables de entorno para Node.js
set NODE_OPTIONS=--max-old-space-size=4096 --expose-gc --max-semi-space-size=64

REM Ajustar prioridad de procesos Node.js
echo Configurando prioridad de procesos...
wmic process where name="node.exe" CALL setpriority "high priority" 2>nul

echo Optimizaciones aplicadas.
echo NODE_OPTIONS=%NODE_OPTIONS%
