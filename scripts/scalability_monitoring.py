#!/usr/bin/env python3
"""
Script de Monitoreo Exhaustivo de Escalabilidad - Fase 7.1
Recopila métricas detalladas de recursos del sistema para evaluación de escalabilidad.
"""

import json
import time
import sys
import argparse
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

try:
    import psutil
except ImportError:
    print("Error: psutil no está instalado. Ejecuta: pip install psutil")
    sys.exit(1)


class ScalabilityMonitor:
    """Monitor exhaustivo de recursos del sistema para evaluación de escalabilidad"""

    def __init__(self, output_dir: str = "scalability_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.metrics_history: List[Dict] = []

    def collect_system_metrics(self) -> Dict:
        """Recopila métricas del sistema operativo"""
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        disk = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        network = psutil.net_io_counters()
        
        boot_time = psutil.boot_time()
        uptime = time.time() - boot_time
        
        return {
            'timestamp': datetime.now().isoformat(),
            'system': {
                'platform': sys.platform,
                'hostname': psutil.os.uname().nodename if hasattr(psutil.os, 'uname') else 'unknown',
                'uptime_seconds': uptime,
                'boot_time': datetime.fromtimestamp(boot_time).isoformat(),
            },
            'cpu': {
                'usage_percent': cpu_percent,
                'count_physical': psutil.cpu_count(logical=False),
                'count_logical': cpu_count,
                'frequency_mhz': cpu_freq.current if cpu_freq else None,
                'frequency_min_mhz': cpu_freq.min if cpu_freq else None,
                'frequency_max_mhz': cpu_freq.max if cpu_freq else None,
                'per_cpu_percent': psutil.cpu_percent(interval=0.1, percpu=True),
            },
            'memory': {
                'total_gb': memory.total / (1024**3),
                'available_gb': memory.available / (1024**3),
                'used_gb': memory.used / (1024**3),
                'percent': memory.percent,
                'cached_gb': getattr(memory, 'cached', 0) / (1024**3),
                'buffers_gb': getattr(memory, 'buffers', 0) / (1024**3),
            },
            'swap': {
                'total_gb': swap.total / (1024**3),
                'used_gb': swap.used / (1024**3),
                'free_gb': swap.free / (1024**3),
                'percent': swap.percent,
            },
            'disk': {
                'total_gb': disk.total / (1024**3),
                'used_gb': disk.used / (1024**3),
                'free_gb': disk.free / (1024**3),
                'percent': disk.percent,
                'read_bytes': disk_io.read_bytes if disk_io else 0,
                'write_bytes': disk_io.write_bytes if disk_io else 0,
                'read_count': disk_io.read_count if disk_io else 0,
                'write_count': disk_io.write_count if disk_io else 0,
            },
            'network': {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv,
                'errin': network.errin,
                'errout': network.errout,
                'dropin': network.dropin,
                'dropout': network.dropout,
            },
        }

    def collect_process_metrics(self, process_name: Optional[str] = None) -> List[Dict]:
        """Recopila métricas de procesos específicos o todos los procesos"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'memory_info', 'num_threads', 'status', 'create_time']):
            try:
                pinfo = proc.info
                
                # Filtrar por nombre si se especifica
                if process_name and process_name.lower() not in pinfo['name'].lower():
                    continue
                
                # Obtener información adicional
                try:
                    memory_info = proc.memory_info()
                    cpu_times = proc.cpu_times()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
                
                processes.append({
                    'pid': pinfo['pid'],
                    'name': pinfo['name'],
                    'cpu_percent': pinfo['cpu_percent'],
                    'memory_percent': pinfo['memory_percent'],
                    'memory_rss_mb': memory_info.rss / (1024**2),
                    'memory_vms_mb': memory_info.vms / (1024**2),
                    'num_threads': pinfo['num_threads'],
                    'status': pinfo['status'],
                    'create_time': datetime.fromtimestamp(pinfo['create_time']).isoformat(),
                    'cpu_times_user': cpu_times.user,
                    'cpu_times_system': cpu_times.system,
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        return processes

    def collect_nodejs_metrics(self) -> List[Dict]:
        """Recopila métricas específicas de procesos Node.js"""
        return self.collect_process_metrics('node')

    def monitor_continuous(
        self,
        duration_seconds: int = 300,
        interval_seconds: int = 5,
        process_filter: Optional[str] = None
    ) -> Dict:
        """
        Monitoreo continuo durante un período de tiempo
        
        Args:
            duration_seconds: Duración total del monitoreo en segundos
            interval_seconds: Intervalo entre mediciones en segundos
            process_filter: Nombre de proceso para filtrar (opcional)
        """
        print(f"Iniciando monitoreo continuo...")
        print(f"  - Duración: {duration_seconds} segundos")
        print(f"  - Intervalo: {interval_seconds} segundos")
        print(f"  - Filtro de proceso: {process_filter or 'Todos'}")
        print()
        
        start_time = time.time()
        iteration = 0
        
        while time.time() - start_time < duration_seconds:
            iteration += 1
            elapsed = time.time() - start_time
            remaining = duration_seconds - elapsed
            
            print(f"Iteración {iteration} - Tiempo transcurrido: {elapsed:.1f}s / {duration_seconds}s (Restante: {remaining:.1f}s)", end=" ", flush=True)
            
            # Recopilar métricas
            system_metrics = self.collect_system_metrics()
            
            # Recopilar métricas de procesos
            if process_filter:
                processes = self.collect_process_metrics(process_filter)
            else:
                processes = self.collect_nodejs_metrics()
            
            measurement = {
                **system_metrics,
                'processes': processes,
                'iteration': iteration,
                'elapsed_seconds': elapsed,
            }
            
            self.metrics_history.append(measurement)
            print("✓")
            
            # Esperar antes de la siguiente medición
            if remaining > interval_seconds:
                time.sleep(interval_seconds)
            else:
                time.sleep(max(0, remaining))
        
        print(f"\nMonitoreo completado. Total de mediciones: {len(self.metrics_history)}")
        
        return self.generate_report()

    def generate_report(self) -> Dict:
        """Genera reporte agregado de todas las métricas recopiladas"""
        if not self.metrics_history:
            return {}
        
        # Calcular estadísticas agregadas
        cpu_values = [m['cpu']['usage_percent'] for m in self.metrics_history]
        memory_values = [m['memory']['percent'] for m in self.metrics_history]
        memory_used_gb = [m['memory']['used_gb'] for m in self.metrics_history]
        
        # Estadísticas de procesos
        all_processes = {}
        for measurement in self.metrics_history:
            for proc in measurement.get('processes', []):
                proc_name = proc['name']
                if proc_name not in all_processes:
                    all_processes[proc_name] = {
                        'name': proc_name,
                        'cpu_percent_values': [],
                        'memory_percent_values': [],
                        'memory_rss_mb_values': [],
                        'count': 0,
                    }
                all_processes[proc_name]['cpu_percent_values'].append(proc.get('cpu_percent', 0))
                all_processes[proc_name]['memory_percent_values'].append(proc.get('memory_percent', 0))
                all_processes[proc_name]['memory_rss_mb_values'].append(proc.get('memory_rss_mb', 0))
                all_processes[proc_name]['count'] += 1
        
        # Calcular estadísticas por proceso
        process_stats = {}
        for proc_name, proc_data in all_processes.items():
            cpu_vals = [v for v in proc_data['cpu_percent_values'] if v is not None]
            mem_vals = [v for v in proc_data['memory_percent_values'] if v is not None]
            rss_vals = [v for v in proc_data['memory_rss_mb_values'] if v is not None]
            
            process_stats[proc_name] = {
                'count': proc_data['count'],
                'cpu': {
                    'avg_percent': sum(cpu_vals) / len(cpu_vals) if cpu_vals else 0,
                    'max_percent': max(cpu_vals) if cpu_vals else 0,
                    'min_percent': min(cpu_vals) if cpu_vals else 0,
                },
                'memory': {
                    'avg_percent': sum(mem_vals) / len(mem_vals) if mem_vals else 0,
                    'max_percent': max(mem_vals) if mem_vals else 0,
                    'min_percent': min(mem_vals) if mem_vals else 0,
                    'avg_rss_mb': sum(rss_vals) / len(rss_vals) if rss_vals else 0,
                    'max_rss_mb': max(rss_vals) if rss_vals else 0,
                },
            }
        
        report = {
            'metadata': {
                'report_type': 'scalability_monitoring',
                'phase': '7.1',
                'generated_at': datetime.now().isoformat(),
                'total_measurements': len(self.metrics_history),
                'duration_seconds': self.metrics_history[-1]['elapsed_seconds'] if self.metrics_history else 0,
            },
            'summary': {
                'cpu': {
                    'avg_percent': sum(cpu_values) / len(cpu_values) if cpu_values else 0,
                    'max_percent': max(cpu_values) if cpu_values else 0,
                    'min_percent': min(cpu_values) if cpu_values else 0,
                },
                'memory': {
                    'avg_percent': sum(memory_values) / len(memory_values) if memory_values else 0,
                    'max_percent': max(memory_values) if memory_values else 0,
                    'min_percent': min(memory_values) if memory_values else 0,
                    'avg_used_gb': sum(memory_used_gb) / len(memory_used_gb) if memory_used_gb else 0,
                    'max_used_gb': max(memory_used_gb) if memory_used_gb else 0,
                },
            },
            'processes': process_stats,
            'measurements': self.metrics_history,
        }
        
        return report

    def save_report(self, report: Dict, filename: Optional[str] = None) -> Path:
        """Guarda el reporte en un archivo JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"scalability_monitoring_{timestamp}.json"
        
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\nReporte guardado en: {filepath}")
        return filepath

    def print_summary(self, report: Dict):
        """Imprime un resumen del reporte en consola"""
        if not report:
            print("No hay datos para mostrar")
            return
        
        summary = report.get('summary', {})
        metadata = report.get('metadata', {})
        
        print("\n" + "="*60)
        print("RESUMEN DE MONITOREO DE ESCALABILIDAD")
        print("="*60)
        print(f"Total de mediciones: {metadata.get('total_measurements', 0)}")
        print(f"Duración: {metadata.get('duration_seconds', 0):.1f} segundos")
        print()
        
        cpu = summary.get('cpu', {})
        print("CPU:")
        print(f"  Promedio: {cpu.get('avg_percent', 0):.2f}%")
        print(f"  Máximo: {cpu.get('max_percent', 0):.2f}%")
        print(f"  Mínimo: {cpu.get('min_percent', 0):.2f}%")
        print()
        
        memory = summary.get('memory', {})
        print("Memoria:")
        print(f"  Uso promedio: {memory.get('avg_percent', 0):.2f}%")
        print(f"  Uso máximo: {memory.get('max_percent', 0):.2f}%")
        print(f"  Uso promedio: {memory.get('avg_used_gb', 0):.2f} GB")
        print(f"  Uso máximo: {memory.get('max_used_gb', 0):.2f} GB")
        print()
        
        processes = report.get('processes', {})
        if processes:
            print("Procesos más consumidores de recursos:")
            # Ordenar por CPU promedio
            sorted_procs = sorted(
                processes.items(),
                key=lambda x: x[1].get('cpu', {}).get('avg_percent', 0),
                reverse=True
            )[:10]
            
            for proc_name, proc_stats in sorted_procs:
                cpu_avg = proc_stats.get('cpu', {}).get('avg_percent', 0)
                mem_avg = proc_stats.get('memory', {}).get('avg_percent', 0)
                mem_rss = proc_stats.get('memory', {}).get('avg_rss_mb', 0)
                print(f"  {proc_name}:")
                print(f"    CPU: {cpu_avg:.2f}% | Memoria: {mem_avg:.2f}% ({mem_rss:.2f} MB)")
        
        print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description='Monitoreo exhaustivo de escalabilidad - Fase 7.1'
    )
    parser.add_argument(
        '--duration',
        type=int,
        default=300,
        help='Duración del monitoreo en segundos (default: 300)'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=5,
        help='Intervalo entre mediciones en segundos (default: 5)'
    )
    parser.add_argument(
        '--process-filter',
        type=str,
        default=None,
        help='Filtrar procesos por nombre (default: todos)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='scalability_reports',
        help='Directorio para guardar reportes (default: scalability_reports)'
    )
    parser.add_argument(
        '--output-file',
        type=str,
        default=None,
        help='Nombre del archivo de salida (default: auto-generado)'
    )
    
    args = parser.parse_args()
    
    monitor = ScalabilityMonitor(output_dir=args.output_dir)
    
    try:
        report = monitor.monitor_continuous(
            duration_seconds=args.duration,
            interval_seconds=args.interval,
            process_filter=args.process_filter
        )
        
        filepath = monitor.save_report(report, args.output_file)
        monitor.print_summary(report)
        
        print(f"\n✓ Monitoreo completado exitosamente")
        print(f"  Reporte guardado en: {filepath}")
        
    except KeyboardInterrupt:
        print("\n\nMonitoreo interrumpido por el usuario")
        if monitor.metrics_history:
            print("Generando reporte con datos recopilados hasta ahora...")
            report = monitor.generate_report()
            filepath = monitor.save_report(report, args.output_file)
            monitor.print_summary(report)
            print(f"\nReporte parcial guardado en: {filepath}")
    except Exception as e:
        print(f"\nError durante el monitoreo: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

