#!/usr/bin/env python3
"""
Monitoreo Post-Optimización del Sistema ELIXIR 2.0

Este script realiza un monitoreo post-optimización para verificar si las mejoras
implementadas están funcionando correctamente. Compara las métricas actuales con
las métricas previas (antes de la optimización) y genera un reporte detallado
de la comparación.

Instrucciones:
1. Monitorear el sistema durante un período de tiempo específico para confirmar
   que las mejoras han tenido el efecto deseado.
2. Comparar las métricas actuales con las del análisis previo.
"""

import time
import json
import sys
import argparse
from datetime import datetime
from typing import Dict, Optional, List
from pathlib import Path

try:
    import psutil
except ImportError:
    print("ERROR: psutil no está instalado. Ejecuta: pip install psutil requests")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests no está instalado. Ejecuta: pip install psutil requests")
    sys.exit(1)


class PostOptimizationMonitor:
    """Monitor post-optimización para comparar métricas antes/después"""
    
    def __init__(self, output_dir: str = "performance_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.previous_metrics: Optional[Dict] = None
        self.new_metrics: List[Dict] = []
        
    def load_previous_metrics(self, filepath: str) -> Dict:
        """
        Carga las métricas previas desde un archivo JSON generado por
        performance_analysis.py
        
        Args:
            filepath: Ruta al archivo JSON con métricas previas
            
        Returns:
            Diccionario con las métricas previas
        """
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"No se encontró el archivo: {filepath}")
        
        print(f"Cargando métricas previas desde: {filepath}")
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraer estadísticas y metadata
        self.previous_metrics = {
            'metadata': data.get('metadata', {}),
            'statistics': data.get('statistics', {}),
            'measurements': data.get('measurements', []),
        }
        
        print(f"  ✓ Cargadas {len(self.previous_metrics['measurements'])} mediciones previas")
        if 'statistics' in self.previous_metrics and self.previous_metrics['statistics']:
            print(f"  ✓ Estadísticas previas disponibles")
        
        return self.previous_metrics
    
    def get_system_metrics(self) -> Dict:
        """
        Recopila métricas actuales del sistema
        (mismo formato que performance_analysis.py)
        """
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        disk = psutil.disk_usage('/')
        
        # Métricas de red
        net_io = psutil.net_io_counters()
        
        # Procesos activos
        process_count = len(psutil.pids())
        
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu': {
                'usage_percent': cpu_percent,
                'count': cpu_count,
                'frequency_mhz': cpu_freq.current if cpu_freq else None,
                'frequency_min_mhz': cpu_freq.min if cpu_freq else None,
                'frequency_max_mhz': cpu_freq.max if cpu_freq else None,
            },
            'memory': {
                'total_gb': memory.total / (1024**3),
                'available_gb': memory.available / (1024**3),
                'used_gb': memory.used / (1024**3),
                'usage_percent': memory.percent,
                'cached_gb': getattr(memory, 'cached', 0) / (1024**3),
            },
            'swap': {
                'total_gb': swap.total / (1024**3),
                'used_gb': swap.used / (1024**3),
                'usage_percent': swap.percent,
            },
            'disk': {
                'total_gb': disk.total / (1024**3),
                'used_gb': disk.used / (1024**3),
                'free_gb': disk.free / (1024**3),
                'usage_percent': disk.percent,
            },
            'network': {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv,
                'errin': net_io.errin,
                'errout': net_io.errout,
                'dropin': net_io.dropin,
                'dropout': net_io.dropout,
            },
            'system': {
                'process_count': process_count,
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat(),
            }
        }
    
    def measure_http_response_time(self, url: str, timeout: int = 5) -> Optional[Dict]:
        """Mide el tiempo de respuesta de un endpoint HTTP"""
        try:
            start_time = time.time()
            response = requests.get(url, timeout=timeout)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convertir a milisegundos
            
            return {
                'url': url,
                'status_code': response.status_code,
                'response_time_ms': round(response_time, 2),
                'success': 200 <= response.status_code < 300,
                'content_length': len(response.content),
            }
        except requests.exceptions.Timeout:
            return {
                'url': url,
                'status_code': None,
                'response_time_ms': None,
                'success': False,
                'error': 'timeout',
            }
        except requests.exceptions.ConnectionError:
            return {
                'url': url,
                'status_code': None,
                'response_time_ms': None,
                'success': False,
                'error': 'connection_error',
            }
        except Exception as e:
            return {
                'url': url,
                'status_code': None,
                'response_time_ms': None,
                'success': False,
                'error': str(e),
            }
    
    def monitor_performance(
        self,
        iterations: int = 5,
        interval_seconds: int = 2,
        http_endpoints: Optional[List[str]] = None
    ):
        """
        Realiza el monitoreo de rendimiento post-optimización
        
        Args:
            iterations: Número de mediciones consecutivas
            interval_seconds: Intervalo entre mediciones en segundos
            http_endpoints: Lista de URLs para medir tiempos de respuesta
        """
        print(f"Iniciando monitoreo post-optimización...")
        print(f"  - Iteraciones: {iterations}")
        print(f"  - Intervalo: {interval_seconds} segundos")
        print(f"  - Endpoints HTTP: {len(http_endpoints) if http_endpoints else 0}")
        print()
        
        http_endpoints = http_endpoints or []
        
        for i in range(iterations):
            print(f"Medición {i + 1}/{iterations}...", end=" ", flush=True)
            
            # Métricas del sistema
            system_metrics = self.get_system_metrics()
            
            # Métricas HTTP si hay endpoints configurados
            http_metrics = []
            if http_endpoints:
                for endpoint in http_endpoints:
                    http_metric = self.measure_http_response_time(endpoint)
                    if http_metric:
                        http_metrics.append(http_metric)
            
            # Combinar métricas
            measurement = {
                **system_metrics,
                'http_responses': http_metrics,
            }
            
            self.new_metrics.append(measurement)
            print("✓")
            
            # Esperar antes de la siguiente medición (excepto en la última)
            if i < iterations - 1:
                time.sleep(interval_seconds)
        
        print(f"\nMonitoreo completado. Total de mediciones: {len(self.new_metrics)}")
    
    def calculate_new_statistics(self) -> Dict:
        """Calcula estadísticas agregadas de las nuevas métricas"""
        if not self.new_metrics:
            return {}
        
        stats = {
            'total_measurements': len(self.new_metrics),
            'analysis_period': {
                'start': self.new_metrics[0]['timestamp'],
                'end': self.new_metrics[-1]['timestamp'],
            },
            'cpu': {
                'avg_usage_percent': sum(m['cpu']['usage_percent'] for m in self.new_metrics) / len(self.new_metrics),
                'max_usage_percent': max(m['cpu']['usage_percent'] for m in self.new_metrics),
                'min_usage_percent': min(m['cpu']['usage_percent'] for m in self.new_metrics),
            },
            'memory': {
                'avg_usage_percent': sum(m['memory']['usage_percent'] for m in self.new_metrics) / len(self.new_metrics),
                'avg_used_gb': sum(m['memory']['used_gb'] for m in self.new_metrics) / len(self.new_metrics),
                'max_used_gb': max(m['memory']['used_gb'] for m in self.new_metrics),
            },
            'disk': {
                'avg_usage_percent': sum(m['disk']['usage_percent'] for m in self.new_metrics) / len(self.new_metrics),
            },
        }
        
        # Estadísticas HTTP si hay datos
        http_times = []
        for metric in self.new_metrics:
            for http_resp in metric.get('http_responses', []):
                if http_resp.get('response_time_ms') is not None:
                    http_times.append(http_resp['response_time_ms'])
        
        if http_times:
            stats['http'] = {
                'avg_response_time_ms': sum(http_times) / len(http_times),
                'min_response_time_ms': min(http_times),
                'max_response_time_ms': max(http_times),
                'total_requests': len(http_times),
            }
        
        return stats
    
    def compare_metrics(self, previous_metrics: Dict, new_metrics_stats: Dict) -> Dict:
        """
        Compara las métricas previas con las nuevas y calcula las diferencias
        
        Args:
            previous_metrics: Diccionario con métricas previas
            new_metrics_stats: Diccionario con estadísticas de nuevas métricas
            
        Returns:
            Diccionario con la comparación detallada
        """
        if not previous_metrics or 'statistics' not in previous_metrics:
            return {
                'error': 'No hay métricas previas disponibles para comparar',
                'new_statistics': new_metrics_stats
            }
        
        prev_stats = previous_metrics.get('statistics', {})
        comparison = {
            'comparison_timestamp': datetime.now().isoformat(),
            'previous_analysis': {
                'generated_at': previous_metrics.get('metadata', {}).get('generated_at', 'unknown'),
                'total_measurements': prev_stats.get('total_measurements', 0),
            },
            'new_analysis': {
                'generated_at': datetime.now().isoformat(),
                'total_measurements': new_metrics_stats.get('total_measurements', 0),
            },
            'improvements': {},
            'regressions': {},
            'unchanged': {},
            'detailed_comparison': {}
        }
        
        # Comparar CPU
        if 'cpu' in prev_stats and 'cpu' in new_metrics_stats:
            prev_cpu = prev_stats['cpu']
            new_cpu = new_metrics_stats['cpu']
            
            cpu_avg_diff = new_cpu.get('avg_usage_percent', 0) - prev_cpu.get('avg_usage_percent', 0)
            cpu_max_diff = new_cpu.get('max_usage_percent', 0) - prev_cpu.get('max_usage_percent', 0)
            
            comparison['detailed_comparison']['cpu'] = {
                'avg_usage_percent': {
                    'previous': prev_cpu.get('avg_usage_percent', 0),
                    'new': new_cpu.get('avg_usage_percent', 0),
                    'difference': round(cpu_avg_diff, 2),
                    'percent_change': round((cpu_avg_diff / prev_cpu.get('avg_usage_percent', 1)) * 100, 2) if prev_cpu.get('avg_usage_percent', 0) > 0 else 0,
                },
                'max_usage_percent': {
                    'previous': prev_cpu.get('max_usage_percent', 0),
                    'new': new_cpu.get('max_usage_percent', 0),
                    'difference': round(cpu_max_diff, 2),
                }
            }
            
            # Mejora si el uso de CPU disminuyó
            if cpu_avg_diff < -1:  # Al menos 1% de mejora
                comparison['improvements']['cpu_avg_usage'] = {
                    'metric': 'CPU promedio',
                    'previous': round(prev_cpu.get('avg_usage_percent', 0), 2),
                    'new': round(new_cpu.get('avg_usage_percent', 0), 2),
                    'improvement': f"{abs(cpu_avg_diff):.2f}% menos uso",
                }
            elif cpu_avg_diff > 1:  # Regresión si aumentó más de 1%
                comparison['regressions']['cpu_avg_usage'] = {
                    'metric': 'CPU promedio',
                    'previous': round(prev_cpu.get('avg_usage_percent', 0), 2),
                    'new': round(new_cpu.get('avg_usage_percent', 0), 2),
                    'regression': f"{cpu_avg_diff:.2f}% más uso",
                }
            else:
                comparison['unchanged']['cpu_avg_usage'] = {
                    'metric': 'CPU promedio',
                    'value': round(new_cpu.get('avg_usage_percent', 0), 2),
                }
        
        # Comparar Memoria
        if 'memory' in prev_stats and 'memory' in new_metrics_stats:
            prev_mem = prev_stats['memory']
            new_mem = new_metrics_stats['memory']
            
            mem_avg_diff = new_mem.get('avg_usage_percent', 0) - prev_mem.get('avg_usage_percent', 0)
            mem_used_diff = new_mem.get('avg_used_gb', 0) - prev_mem.get('avg_used_gb', 0)
            
            comparison['detailed_comparison']['memory'] = {
                'avg_usage_percent': {
                    'previous': prev_mem.get('avg_usage_percent', 0),
                    'new': new_mem.get('avg_usage_percent', 0),
                    'difference': round(mem_avg_diff, 2),
                    'percent_change': round((mem_avg_diff / prev_mem.get('avg_usage_percent', 1)) * 100, 2) if prev_mem.get('avg_usage_percent', 0) > 0 else 0,
                },
                'avg_used_gb': {
                    'previous': round(prev_mem.get('avg_used_gb', 0), 2),
                    'new': round(new_mem.get('avg_used_gb', 0), 2),
                    'difference': round(mem_used_diff, 2),
                }
            }
            
            if mem_avg_diff < -1:
                comparison['improvements']['memory_avg_usage'] = {
                    'metric': 'Memoria promedio',
                    'previous': round(prev_mem.get('avg_usage_percent', 0), 2),
                    'new': round(new_mem.get('avg_usage_percent', 0), 2),
                    'improvement': f"{abs(mem_avg_diff):.2f}% menos uso",
                }
            elif mem_avg_diff > 1:
                comparison['regressions']['memory_avg_usage'] = {
                    'metric': 'Memoria promedio',
                    'previous': round(prev_mem.get('avg_usage_percent', 0), 2),
                    'new': round(new_mem.get('avg_usage_percent', 0), 2),
                    'regression': f"{mem_avg_diff:.2f}% más uso",
                }
            else:
                comparison['unchanged']['memory_avg_usage'] = {
                    'metric': 'Memoria promedio',
                    'value': round(new_mem.get('avg_usage_percent', 0), 2),
                }
        
        # Comparar HTTP (tiempo de respuesta)
        if 'http' in prev_stats and 'http' in new_metrics_stats:
            prev_http = prev_stats['http']
            new_http = new_metrics_stats['http']
            
            http_avg_diff = new_http.get('avg_response_time_ms', 0) - prev_http.get('avg_response_time_ms', 0)
            
            comparison['detailed_comparison']['http'] = {
                'avg_response_time_ms': {
                    'previous': prev_http.get('avg_response_time_ms', 0),
                    'new': new_http.get('avg_response_time_ms', 0),
                    'difference': round(http_avg_diff, 2),
                    'percent_change': round((http_avg_diff / prev_http.get('avg_response_time_ms', 1)) * 100, 2) if prev_http.get('avg_response_time_ms', 0) > 0 else 0,
                },
                'min_response_time_ms': {
                    'previous': prev_http.get('min_response_time_ms', 0),
                    'new': new_http.get('min_response_time_ms', 0),
                },
                'max_response_time_ms': {
                    'previous': prev_http.get('max_response_time_ms', 0),
                    'new': new_http.get('max_response_time_ms', 0),
                }
            }
            
            # Mejora si el tiempo de respuesta disminuyó (más rápido)
            if http_avg_diff < -10:  # Al menos 10ms de mejora
                comparison['improvements']['http_response_time'] = {
                    'metric': 'Tiempo de respuesta HTTP promedio',
                    'previous': round(prev_http.get('avg_response_time_ms', 0), 2),
                    'new': round(new_http.get('avg_response_time_ms', 0), 2),
                    'improvement': f"{abs(http_avg_diff):.2f}ms más rápido",
                }
            elif http_avg_diff > 10:  # Regresión si aumentó más de 10ms
                comparison['regressions']['http_response_time'] = {
                    'metric': 'Tiempo de respuesta HTTP promedio',
                    'previous': round(prev_http.get('avg_response_time_ms', 0), 2),
                    'new': round(new_http.get('avg_response_time_ms', 0), 2),
                    'regression': f"{http_avg_diff:.2f}ms más lento",
                }
            else:
                comparison['unchanged']['http_response_time'] = {
                    'metric': 'Tiempo de respuesta HTTP promedio',
                    'value': round(new_http.get('avg_response_time_ms', 0), 2),
                }
        
        # Comparar Disco
        if 'disk' in prev_stats and 'disk' in new_metrics_stats:
            prev_disk = prev_stats['disk']
            new_disk = new_metrics_stats['disk']
            
            disk_avg_diff = new_disk.get('avg_usage_percent', 0) - prev_disk.get('avg_usage_percent', 0)
            
            comparison['detailed_comparison']['disk'] = {
                'avg_usage_percent': {
                    'previous': prev_disk.get('avg_usage_percent', 0),
                    'new': new_disk.get('avg_usage_percent', 0),
                    'difference': round(disk_avg_diff, 2),
                }
            }
        
        return comparison
    
    def save_comparison_report(self, comparison: Dict, filename: Optional[str] = None) -> Path:
        """Guarda el reporte de comparación en formato JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"post_optimization_report_{timestamp}.json"
        
        filepath = self.output_dir / filename
        
        report = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'report_type': 'post_optimization_comparison',
                'system_info': {
                    'platform': sys.platform,
                    'python_version': sys.version,
                }
            },
            'comparison': comparison,
            'new_measurements': self.new_metrics,
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Reporte de comparación guardado: {filepath}")
        return filepath
    
    def print_summary(self, comparison: Dict):
        """Imprime un resumen de la comparación en consola"""
        print("\n" + "="*70)
        print("RESUMEN DE COMPARACIÓN POST-OPTIMIZACIÓN")
        print("="*70)
        
        if 'error' in comparison:
            print(f"⚠ {comparison['error']}")
            return
        
        # Mejoras
        improvements = comparison.get('improvements', {})
        if improvements:
            print("\n✅ MEJORAS DETECTADAS:")
            for key, value in improvements.items():
                print(f"  • {value['metric']}:")
                print(f"    - Antes: {value['previous']}")
                print(f"    - Ahora: {value['new']}")
                print(f"    - Mejora: {value['improvement']}")
        else:
            print("\n✅ No se detectaron mejoras significativas")
        
        # Regresiones
        regressions = comparison.get('regressions', {})
        if regressions:
            print("\n⚠️  REGRESIONES DETECTADAS:")
            for key, value in regressions.items():
                print(f"  • {value['metric']}:")
                print(f"    - Antes: {value['previous']}")
                print(f"    - Ahora: {value['new']}")
                print(f"    - Regresión: {value['regression']}")
        else:
            print("\n✅ No se detectaron regresiones")
        
        # Sin cambios
        unchanged = comparison.get('unchanged', {})
        if unchanged:
            print("\n➡️  SIN CAMBIOS SIGNIFICATIVOS:")
            for key, value in unchanged.items():
                print(f"  • {value['metric']}: {value['value']}")
        
        # Comparación detallada
        detailed = comparison.get('detailed_comparison', {})
        if detailed:
            print("\n" + "-"*70)
            print("COMPARACIÓN DETALLADA:")
            print("-"*70)
            
            if 'cpu' in detailed:
                cpu = detailed['cpu']['avg_usage_percent']
                print(f"\nCPU Promedio:")
                print(f"  Antes: {cpu['previous']:.2f}%")
                print(f"  Ahora: {cpu['new']:.2f}%")
                print(f"  Diferencia: {cpu['difference']:+.2f}% ({cpu['percent_change']:+.2f}%)")
            
            if 'memory' in detailed:
                mem = detailed['memory']['avg_usage_percent']
                print(f"\nMemoria Promedio:")
                print(f"  Antes: {mem['previous']:.2f}%")
                print(f"  Ahora: {mem['new']:.2f}%")
                print(f"  Diferencia: {mem['difference']:+.2f}% ({mem['percent_change']:+.2f}%)")
            
            if 'http' in detailed:
                http = detailed['http']['avg_response_time_ms']
                print(f"\nTiempo de Respuesta HTTP Promedio:")
                print(f"  Antes: {http['previous']:.2f} ms")
                print(f"  Ahora: {http['new']:.2f} ms")
                print(f"  Diferencia: {http['difference']:+.2f} ms ({http['percent_change']:+.2f}%)")
        
        print("\n" + "="*70)


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description='Monitoreo post-optimización del sistema ELIXIR 2.0',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  # Monitoreo básico comparando con métricas previas
  python scripts/post_optimization_monitor.py --previous-metrics performance_reports/performance_analysis_report_20240101_120000.json

  # Monitoreo con más mediciones y endpoints HTTP
  python scripts/post_optimization_monitor.py --previous-metrics report.json --iterations 10 --interval 5 --endpoints http://localhost:3000/health

  # Especificar directorio de salida
  python scripts/post_optimization_monitor.py --previous-metrics report.json --output-dir reports/post_optimization
        """
    )
    
    parser.add_argument(
        '--previous-metrics', '-p',
        type=str,
        required=True,
        help='Ruta al archivo JSON con métricas previas (generado por performance_analysis.py)'
    )
    
    parser.add_argument(
        '--iterations', '-i',
        type=int,
        default=5,
        help='Número de mediciones consecutivas (default: 5)'
    )
    
    parser.add_argument(
        '--interval', '-t',
        type=int,
        default=2,
        help='Intervalo entre mediciones en segundos (default: 2)'
    )
    
    parser.add_argument(
        '--endpoints', '-e',
        nargs='+',
        default=[],
        help='URLs de endpoints HTTP para medir tiempos de respuesta'
    )
    
    parser.add_argument(
        '--output-dir', '-o',
        type=str,
        default='performance_reports',
        help='Directorio para guardar los reportes (default: performance_reports)'
    )
    
    args = parser.parse_args()
    
    # Validar argumentos
    if args.iterations < 1:
        print("ERROR: El número de iteraciones debe ser al menos 1")
        sys.exit(1)
    
    if args.interval < 1:
        print("ERROR: El intervalo debe ser al menos 1 segundo")
        sys.exit(1)
    
    # Crear monitor
    monitor = PostOptimizationMonitor(output_dir=args.output_dir)
    
    # Cargar métricas previas
    try:
        monitor.load_previous_metrics(args.previous_metrics)
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: El archivo JSON no es válido: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR al cargar métricas previas: {e}")
        sys.exit(1)
    
    # Ejecutar monitoreo
    try:
        monitor.monitor_performance(
            iterations=args.iterations,
            interval_seconds=args.interval,
            http_endpoints=args.endpoints if args.endpoints else None
        )
    except KeyboardInterrupt:
        print("\n\nMonitoreo interrumpido por el usuario")
        if monitor.new_metrics:
            print(f"Guardando {len(monitor.new_metrics)} mediciones recopiladas...")
        else:
            print("No se recopilaron métricas")
            sys.exit(0)
    except Exception as e:
        print(f"\nERROR durante el monitoreo: {e}")
        sys.exit(1)
    
    # Calcular estadísticas y comparar
    new_stats = monitor.calculate_new_statistics()
    comparison = monitor.compare_metrics(monitor.previous_metrics, new_stats)
    
    # Guardar reporte
    monitor.save_comparison_report(comparison)
    
    # Mostrar resumen
    monitor.print_summary(comparison)


if __name__ == '__main__':
    main()

