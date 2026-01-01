#!/usr/bin/env python3
"""
Identificación de Cuellos de Botella en el Sistema ELIXIR 2.0

Este script realiza un análisis de rendimiento para identificar cuellos de botella
en el sistema, monitoreando procesos, CPU, memoria, disco y red en tiempo real.
Detecta procesos con alto consumo de recursos y genera un informe detallado con
métricas y sugerencias de optimización.
"""

import time
import json
import sys
import argparse
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
from collections import defaultdict

try:
    import psutil
except ImportError:
    print("ERROR: psutil no está instalado. Ejecuta: pip install psutil")
    sys.exit(1)


class BottleneckAnalyzer:
    """Analizador de cuellos de botella del sistema"""
    
    def __init__(
        self,
        cpu_threshold: float = 80.0,
        memory_threshold: float = 80.0,
        disk_threshold: float = 80.0
    ):
        self.cpu_threshold = cpu_threshold
        self.memory_threshold = memory_threshold
        self.disk_threshold = disk_threshold
        self.samples: List[Dict] = []
        self.process_history: Dict[int, List[Dict]] = defaultdict(list)
        
    def get_cpu_metrics(self) -> Dict:
        """Recopila métricas de CPU"""
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_per_core = psutil.cpu_percent(interval=0.1, percpu=True)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        cpu_load = psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None
        
        return {
            'global_percent': cpu_percent,
            'per_core': cpu_per_core,
            'core_count': cpu_count,
            'frequency_mhz': cpu_freq.current if cpu_freq else None,
            'load_average': list(cpu_load) if cpu_load else None,
            'is_bottleneck': cpu_percent >= self.cpu_threshold,
        }
    
    def get_memory_metrics(self) -> Dict:
        """Recopila métricas de memoria"""
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'total_gb': memory.total / (1024**3),
            'available_gb': memory.available / (1024**3),
            'used_gb': memory.used / (1024**3),
            'usage_percent': memory.percent,
            'cached_gb': getattr(memory, 'cached', 0) / (1024**3),
            'swap_total_gb': swap.total / (1024**3),
            'swap_used_gb': swap.used / (1024**3),
            'swap_usage_percent': swap.percent,
            'is_bottleneck': memory.percent >= self.memory_threshold,
        }
    
    def get_disk_metrics(self) -> List[Dict]:
        """Recopila métricas de disco por partición"""
        disk_partitions = psutil.disk_partitions()
        disk_metrics = []
        
        for partition in disk_partitions:
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                disk_metrics.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'fstype': partition.fstype,
                    'total_gb': usage.total / (1024**3),
                    'used_gb': usage.used / (1024**3),
                    'free_gb': usage.free / (1024**3),
                    'usage_percent': usage.percent,
                    'is_bottleneck': usage.percent >= self.disk_threshold,
                })
            except PermissionError:
                # Ignorar particiones sin permisos
                continue
        
        return disk_metrics
    
    def get_network_metrics(self) -> Dict:
        """Recopila métricas de red"""
        net_io = psutil.net_io_counters()
        net_connections = len(psutil.net_connections(kind='inet'))
        
        return {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'packets_sent': net_io.packets_sent,
            'packets_recv': net_io.packets_recv,
            'errin': net_io.errin,
            'errout': net_io.errout,
            'dropin': net_io.dropin,
            'dropout': net_io.dropout,
            'active_connections': net_connections,
        }
    
    def get_process_metrics(self) -> List[Dict]:
        """Recopila métricas de procesos"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 
                                        'memory_info', 'num_threads', 'status', 'create_time']):
            try:
                proc_info = proc.info
                memory_info = proc_info.get('memory_info')
                
                process_data = {
                    'pid': proc_info['pid'],
                    'name': proc_info['name'],
                    'cpu_percent': proc_info.get('cpu_percent', 0),
                    'memory_percent': proc_info.get('memory_percent', 0),
                    'memory_rss_mb': (memory_info.rss / (1024**2)) if memory_info else 0,
                    'memory_vms_mb': (memory_info.vms / (1024**2)) if memory_info else 0,
                    'num_threads': proc_info.get('num_threads', 0),
                    'status': proc_info.get('status', 'unknown'),
                    'create_time': datetime.fromtimestamp(proc_info.get('create_time', 0)).isoformat() if proc_info.get('create_time') else None,
                }
                
                processes.append(process_data)
                
                # Guardar historial del proceso
                self.process_history[proc_info['pid']].append({
                    'timestamp': datetime.now().isoformat(),
                    'cpu_percent': process_data['cpu_percent'],
                    'memory_percent': process_data['memory_percent'],
                    'memory_rss_mb': process_data['memory_rss_mb'],
                })
                
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        # Ordenar por CPU y luego por memoria
        processes.sort(key=lambda x: (x['cpu_percent'], x['memory_percent']), reverse=True)
        
        return processes
    
    def collect_sample(self) -> Dict:
        """Recopila una muestra completa del sistema"""
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu': self.get_cpu_metrics(),
            'memory': self.get_memory_metrics(),
            'disk': self.get_disk_metrics(),
            'network': self.get_network_metrics(),
            'processes': self.get_process_metrics(),
        }
    
    def analyze(
        self,
        duration: float = 60.0,
        interval: float = 1.0
    ):
        """
        Realiza el análisis de cuellos de botella
        
        Args:
            duration: Duración del análisis en segundos
            interval: Intervalo entre muestras en segundos
        """
        print(f"Iniciando análisis de cuellos de botella...")
        print(f"  - Duración: {duration} segundos")
        print(f"  - Intervalo: {interval} segundos")
        print(f"  - Umbrales: CPU={self.cpu_threshold}%, Memoria={self.memory_threshold}%, Disco={self.disk_threshold}%")
        print()
        
        start_time = time.time()
        sample_count = 0
        
        try:
            while (time.time() - start_time) < duration:
                print(f"Muestra {sample_count + 1}...", end=" ", flush=True)
                sample = self.collect_sample()
                self.samples.append(sample)
                sample_count += 1
                print("✓")
                
                # Esperar antes de la siguiente muestra
                elapsed = time.time() - start_time
                remaining = duration - elapsed
                if remaining > 0 and remaining < interval:
                    time.sleep(remaining)
                elif remaining > 0:
                    time.sleep(interval)
                else:
                    break
                    
        except KeyboardInterrupt:
            print("\n\nAnálisis interrumpido por el usuario")
        
        print(f"\nAnálisis completado. Total de muestras: {len(self.samples)}")
    
    def identify_bottlenecks(self) -> Dict:
        """Identifica cuellos de botella basado en las muestras recopiladas"""
        if not self.samples:
            return {}
        
        bottlenecks = {
            'cpu_bottlenecks': [],
            'memory_bottlenecks': [],
            'disk_bottlenecks': [],
            'top_processes_cpu': [],
            'top_processes_memory': [],
            'network_issues': [],
        }
        
        # Analizar CPU
        cpu_values = [s['cpu']['global_percent'] for s in self.samples]
        avg_cpu = sum(cpu_values) / len(cpu_values) if cpu_values else 0
        max_cpu = max(cpu_values) if cpu_values else 0
        cpu_bottleneck_count = sum(1 for v in cpu_values if v >= self.cpu_threshold)
        
        if avg_cpu >= self.cpu_threshold or cpu_bottleneck_count > len(cpu_values) * 0.5:
            bottlenecks['cpu_bottlenecks'].append({
                'severity': 'high' if avg_cpu >= 90 else 'medium',
                'average_percent': round(avg_cpu, 2),
                'max_percent': round(max_cpu, 2),
                'bottleneck_samples': cpu_bottleneck_count,
                'total_samples': len(cpu_values),
            })
        
        # Analizar memoria
        memory_values = [s['memory']['usage_percent'] for s in self.samples]
        avg_memory = sum(memory_values) / len(memory_values) if memory_values else 0
        max_memory = max(memory_values) if memory_values else 0
        memory_bottleneck_count = sum(1 for v in memory_values if v >= self.memory_threshold)
        
        if avg_memory >= self.memory_threshold or memory_bottleneck_count > len(memory_values) * 0.5:
            bottlenecks['memory_bottlenecks'].append({
                'severity': 'high' if avg_memory >= 90 else 'medium',
                'average_percent': round(avg_memory, 2),
                'max_percent': round(max_memory, 2),
                'bottleneck_samples': memory_bottleneck_count,
                'total_samples': len(memory_values),
            })
        
        # Analizar disco
        for sample in self.samples:
            for disk in sample['disk']:
                if disk['is_bottleneck']:
                    bottlenecks['disk_bottlenecks'].append({
                        'device': disk['device'],
                        'mountpoint': disk['mountpoint'],
                        'usage_percent': disk['usage_percent'],
                        'free_gb': round(disk['free_gb'], 2),
                    })
        
        # Identificar procesos con mayor consumo
        process_cpu_usage = defaultdict(list)
        process_memory_usage = defaultdict(list)
        
        for sample in self.samples:
            for proc in sample['processes'][:20]:  # Top 20 procesos
                process_cpu_usage[proc['name']].append(proc['cpu_percent'])
                process_memory_usage[proc['name']].append(proc['memory_percent'])
        
        # Top procesos por CPU
        for proc_name, cpu_values in sorted(
            process_cpu_usage.items(),
            key=lambda x: sum(x[1]) / len(x[1]) if x[1] else 0,
            reverse=True
        )[:10]:
            avg_cpu = sum(cpu_values) / len(cpu_values) if cpu_values else 0
            if avg_cpu > 1.0:  # Solo procesos con más del 1% de CPU
                bottlenecks['top_processes_cpu'].append({
                    'name': proc_name,
                    'average_cpu_percent': round(avg_cpu, 2),
                    'max_cpu_percent': round(max(cpu_values), 2),
                })
        
        # Top procesos por memoria
        for proc_name, mem_values in sorted(
            process_memory_usage.items(),
            key=lambda x: sum(x[1]) / len(x[1]) if x[1] else 0,
            reverse=True
        )[:10]:
            avg_mem = sum(mem_values) / len(mem_values) if mem_values else 0
            if avg_mem > 1.0:  # Solo procesos con más del 1% de memoria
                bottlenecks['top_processes_memory'].append({
                    'name': proc_name,
                    'average_memory_percent': round(avg_mem, 2),
                    'max_memory_percent': round(max(mem_values), 2),
                })
        
        # Analizar problemas de red
        for sample in self.samples:
            net = sample['network']
            if net['errin'] > 0 or net['errout'] > 0 or net['dropin'] > 0 or net['dropout'] > 0:
                bottlenecks['network_issues'].append({
                    'timestamp': sample['timestamp'],
                    'errors_in': net['errin'],
                    'errors_out': net['errout'],
                    'drops_in': net['dropin'],
                    'drops_out': net['dropout'],
                })
        
        return bottlenecks
    
    def generate_recommendations(self, bottlenecks: Dict) -> List[str]:
        """Genera recomendaciones basadas en los cuellos de botella identificados"""
        recommendations = []
        
        if bottlenecks.get('cpu_bottlenecks'):
            cpu_bottleneck = bottlenecks['cpu_bottlenecks'][0]
            recommendations.append(
                f"⚠️  CPU: Uso promedio {cpu_bottleneck['average_percent']}% "
                f"(máximo {cpu_bottleneck['max_percent']}%). "
                f"Considera optimizar procesos con alto consumo de CPU o escalar recursos."
            )
        
        if bottlenecks.get('memory_bottlenecks'):
            mem_bottleneck = bottlenecks['memory_bottlenecks'][0]
            recommendations.append(
                f"⚠️  Memoria: Uso promedio {mem_bottleneck['average_percent']}% "
                f"(máximo {mem_bottleneck['max_percent']}%). "
                f"Considera revisar procesos con alto consumo de memoria o aumentar RAM."
            )
        
        if bottlenecks.get('disk_bottlenecks'):
            for disk in bottlenecks['disk_bottlenecks']:
                recommendations.append(
                    f"⚠️  Disco: {disk['device']} ({disk['mountpoint']}) "
                    f"con {disk['usage_percent']}% de uso. "
                    f"Solo {disk['free_gb']} GB libres. Considera limpiar espacio o expandir almacenamiento."
                )
        
        if bottlenecks.get('top_processes_cpu'):
            top_proc = bottlenecks['top_processes_cpu'][0]
            recommendations.append(
                f"💡 Proceso con mayor consumo de CPU: {top_proc['name']} "
                f"({top_proc['average_cpu_percent']}% promedio). "
                f"Revisa si este proceso puede ser optimizado."
            )
        
        if bottlenecks.get('top_processes_memory'):
            top_proc = bottlenecks['top_processes_memory'][0]
            recommendations.append(
                f"💡 Proceso con mayor consumo de memoria: {top_proc['name']} "
                f"({top_proc['average_memory_percent']}% promedio). "
                f"Revisa si este proceso puede ser optimizado o tiene memory leaks."
            )
        
        if bottlenecks.get('network_issues'):
            recommendations.append(
                f"⚠️  Problemas de red detectados: errores o drops en paquetes. "
                f"Revisa la configuración de red y la carga del sistema."
            )
        
        if not recommendations:
            recommendations.append("✅ No se detectaron cuellos de botella significativos según los umbrales configurados.")
        
        return recommendations
    
    def save_report(self, filename: str = "bottleneck_report.json") -> Path:
        """Guarda el informe completo en formato JSON"""
        bottlenecks = self.identify_bottlenecks()
        recommendations = self.generate_recommendations(bottlenecks)
        
        report = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_samples': len(self.samples),
                'analysis_duration_seconds': (
                    (datetime.fromisoformat(self.samples[-1]['timestamp']) - 
                     datetime.fromisoformat(self.samples[0]['timestamp'])).total_seconds()
                    if len(self.samples) > 1 else 0
                ),
                'thresholds': {
                    'cpu_percent': self.cpu_threshold,
                    'memory_percent': self.memory_threshold,
                    'disk_percent': self.disk_threshold,
                },
                'system_info': {
                    'platform': sys.platform,
                    'python_version': sys.version,
                }
            },
            'bottlenecks': bottlenecks,
            'recommendations': recommendations,
            'samples': self.samples,
        }
        
        filepath = Path(filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Informe guardado: {filepath}")
        return filepath


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description='Identificación de cuellos de botella en el sistema ELIXIR 2.0',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  # Análisis básico (60 segundos, muestras cada 1 segundo)
  python scripts/identify_bottlenecks.py

  # Análisis de 5 minutos con muestras cada 2 segundos
  python scripts/identify_bottlenecks.py --duracion 300 --intervalo 2

  # Con umbrales personalizados
  python scripts/identify_bottlenecks.py --umbral-cpu 70 --umbral-memoria 75

  # Especificar archivo de salida
  python scripts/identify_bottlenecks.py --salida mi_reporte.json
        """
    )
    
    parser.add_argument(
        '--intervalo', '-i',
        type=float,
        default=1.0,
        help='Intervalo en segundos entre muestras (default: 1.0)'
    )
    
    parser.add_argument(
        '--duracion', '-d',
        type=float,
        default=60.0,
        help='Duración del análisis en segundos (default: 60.0)'
    )
    
    parser.add_argument(
        '--salida', '-o',
        type=str,
        default='bottleneck_report.json',
        help='Archivo de salida para el informe JSON (default: bottleneck_report.json)'
    )
    
    parser.add_argument(
        '--umbral-cpu',
        type=float,
        default=80.0,
        help='Umbral de CPU para considerar cuello de botella %% (default: 80.0)'
    )
    
    parser.add_argument(
        '--umbral-memoria',
        type=float,
        default=80.0,
        help='Umbral de memoria para considerar cuello de botella %% (default: 80.0)'
    )
    
    parser.add_argument(
        '--umbral-disco',
        type=float,
        default=80.0,
        help='Umbral de disco para considerar cuello de botella %% (default: 80.0)'
    )
    
    args = parser.parse_args()
    
    # Validar argumentos
    if args.duracion < 1:
        print("ERROR: La duración debe ser al menos 1 segundo")
        sys.exit(1)
    
    if args.intervalo < 0.1:
        print("ERROR: El intervalo debe ser al menos 0.1 segundos")
        sys.exit(1)
    
    if not (0 < args.umbral_cpu <= 100):
        print("ERROR: El umbral de CPU debe estar entre 0 y 100")
        sys.exit(1)
    
    if not (0 < args.umbral_memoria <= 100):
        print("ERROR: El umbral de memoria debe estar entre 0 y 100")
        sys.exit(1)
    
    if not (0 < args.umbral_disco <= 100):
        print("ERROR: El umbral de disco debe estar entre 0 y 100")
        sys.exit(1)
    
    # Crear analizador
    analyzer = BottleneckAnalyzer(
        cpu_threshold=args.umbral_cpu,
        memory_threshold=args.umbral_memoria,
        disk_threshold=args.umbral_disco
    )
    
    # Ejecutar análisis
    try:
        analyzer.analyze(
            duration=args.duracion,
            interval=args.intervalo
        )
    except Exception as e:
        print(f"\nERROR durante el análisis: {e}")
        sys.exit(1)
    
    if not analyzer.samples:
        print("ERROR: No se recopilaron muestras")
        sys.exit(1)
    
    # Generar informe
    analyzer.save_report(filename=args.salida)
    
    # Mostrar resumen
    bottlenecks = analyzer.identify_bottlenecks()
    recommendations = analyzer.generate_recommendations(bottlenecks)
    
    print("\n" + "="*60)
    print("RESUMEN DE CUELLOS DE BOTELLA")
    print("="*60)
    
    for recommendation in recommendations:
        print(recommendation)
    
    print("\n" + "="*60)
    print("DETALLES")
    print("="*60)
    
    if bottlenecks.get('top_processes_cpu'):
        print("\nTop 5 procesos por CPU:")
        for i, proc in enumerate(bottlenecks['top_processes_cpu'][:5], 1):
            print(f"  {i}. {proc['name']}: {proc['average_cpu_percent']}% (máx: {proc['max_cpu_percent']}%)")
    
    if bottlenecks.get('top_processes_memory'):
        print("\nTop 5 procesos por memoria:")
        for i, proc in enumerate(bottlenecks['top_processes_memory'][:5], 1):
            print(f"  {i}. {proc['name']}: {proc['average_memory_percent']}% (máx: {proc['max_memory_percent']}%)")
    
    print("="*60)


if __name__ == '__main__':
    main()
