#!/usr/bin/env python3
"""
Análisis de Rendimiento del Sistema ELIXIR 2.0

Este script realiza un análisis exhaustivo del rendimiento del sistema, midiendo:
- Tiempo de respuesta de endpoints HTTP
- Utilización de CPU
- Uso de memoria
- Tráfico de red
- Uso de disco
- Otros parámetros clave del sistema

El análisis se ejecuta en un entorno controlado y genera informes detallados
en formato CSV y JSON para identificar posibles áreas de mejora.
"""

import time
import json
import csv
import sys
import argparse
from datetime import datetime
from typing import List, Dict, Optional
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


class PerformanceAnalyzer:
    """Analizador de rendimiento del sistema"""
    
    def __init__(self, output_dir: str = "performance_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.metrics: List[Dict] = []
        
    def get_system_metrics(self) -> Dict:
        """Recopila métricas del sistema"""
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
    
    def analyze_performance(
        self,
        iterations: int = 5,
        interval_seconds: int = 2,
        http_endpoints: Optional[List[str]] = None
    ):
        """
        Realiza el análisis de rendimiento
        
        Args:
            iterations: Número de mediciones consecutivas
            interval_seconds: Intervalo entre mediciones en segundos
            http_endpoints: Lista de URLs para medir tiempos de respuesta
        """
        print(f"Iniciando análisis de rendimiento...")
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
            
            self.metrics.append(measurement)
            print("✓")
            
            # Esperar antes de la siguiente medición (excepto en la última)
            if i < iterations - 1:
                time.sleep(interval_seconds)
        
        print(f"\nAnálisis completado. Total de mediciones: {len(self.metrics)}")
    
    def calculate_statistics(self) -> Dict:
        """Calcula estadísticas agregadas de las métricas"""
        if not self.metrics:
            return {}
        
        stats = {
            'total_measurements': len(self.metrics),
            'analysis_period': {
                'start': self.metrics[0]['timestamp'],
                'end': self.metrics[-1]['timestamp'],
            },
            'cpu': {
                'avg_usage_percent': sum(m['cpu']['usage_percent'] for m in self.metrics) / len(self.metrics),
                'max_usage_percent': max(m['cpu']['usage_percent'] for m in self.metrics),
                'min_usage_percent': min(m['cpu']['usage_percent'] for m in self.metrics),
            },
            'memory': {
                'avg_usage_percent': sum(m['memory']['usage_percent'] for m in self.metrics) / len(self.metrics),
                'avg_used_gb': sum(m['memory']['used_gb'] for m in self.metrics) / len(self.metrics),
                'max_used_gb': max(m['memory']['used_gb'] for m in self.metrics),
            },
            'disk': {
                'avg_usage_percent': sum(m['disk']['usage_percent'] for m in self.metrics) / len(self.metrics),
            },
        }
        
        # Estadísticas HTTP si hay datos
        http_times = []
        for metric in self.metrics:
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
    
    def save_json_report(self, filename: Optional[str] = None) -> Path:
        """Guarda el reporte en formato JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_analysis_report_{timestamp}.json"
        
        filepath = self.output_dir / filename
        
        report = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_measurements': len(self.metrics),
                'system_info': {
                    'platform': sys.platform,
                    'python_version': sys.version,
                }
            },
            'statistics': self.calculate_statistics(),
            'measurements': self.metrics,
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Reporte JSON guardado: {filepath}")
        return filepath
    
    def save_csv_report(self, filename: Optional[str] = None) -> Path:
        """Guarda el reporte en formato CSV"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_analysis_report_{timestamp}.csv"
        
        filepath = self.output_dir / filename
        
        if not self.metrics:
            print("No hay métricas para exportar a CSV")
            return filepath
        
        # Preparar datos para CSV (aplanar estructura anidada)
        csv_rows = []
        for metric in self.metrics:
            row = {
                'timestamp': metric['timestamp'],
                'cpu_usage_percent': metric['cpu']['usage_percent'],
                'cpu_count': metric['cpu']['count'],
                'cpu_freq_mhz': metric['cpu']['frequency_mhz'],
                'memory_total_gb': round(metric['memory']['total_gb'], 2),
                'memory_used_gb': round(metric['memory']['used_gb'], 2),
                'memory_usage_percent': metric['memory']['usage_percent'],
                'swap_used_gb': round(metric['swap']['used_gb'], 2),
                'swap_usage_percent': metric['swap']['usage_percent'],
                'disk_total_gb': round(metric['disk']['total_gb'], 2),
                'disk_used_gb': round(metric['disk']['used_gb'], 2),
                'disk_usage_percent': metric['disk']['usage_percent'],
                'network_bytes_sent': metric['network']['bytes_sent'],
                'network_bytes_recv': metric['network']['bytes_recv'],
                'process_count': metric['system']['process_count'],
            }
            
            # Agregar métricas HTTP si existen
            http_responses = metric.get('http_responses', [])
            if http_responses:
                for i, http_resp in enumerate(http_responses):
                    row[f'http_{i}_url'] = http_resp['url']
                    row[f'http_{i}_status_code'] = http_resp.get('status_code', '')
                    row[f'http_{i}_response_time_ms'] = http_resp.get('response_time_ms', '')
                    row[f'http_{i}_success'] = http_resp.get('success', False)
            else:
                row['http_0_url'] = ''
                row['http_0_status_code'] = ''
                row['http_0_response_time_ms'] = ''
                row['http_0_success'] = ''
            
            csv_rows.append(row)
        
        # Escribir CSV
        if csv_rows:
            fieldnames = csv_rows[0].keys()
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(csv_rows)
        
        print(f"Reporte CSV guardado: {filepath}")
        return filepath


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description='Análisis de rendimiento del sistema ELIXIR 2.0',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  # Análisis básico (5 mediciones, intervalo de 2 segundos)
  python scripts/performance_analysis.py

  # Análisis con más mediciones
  python scripts/performance_analysis.py --iterations 10 --interval 5

  # Análisis incluyendo endpoints HTTP
  python scripts/performance_analysis.py --endpoints http://localhost:3000/health http://localhost:3001/api/status

  # Especificar directorio de salida
  python scripts/performance_analysis.py --output-dir reports/performance
        """
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
    
    parser.add_argument(
        '--json-only',
        action='store_true',
        help='Solo generar reporte JSON (no CSV)'
    )
    
    parser.add_argument(
        '--csv-only',
        action='store_true',
        help='Solo generar reporte CSV (no JSON)'
    )
    
    args = parser.parse_args()
    
    # Validar argumentos
    if args.iterations < 1:
        print("ERROR: El número de iteraciones debe ser al menos 1")
        sys.exit(1)
    
    if args.interval < 1:
        print("ERROR: El intervalo debe ser al menos 1 segundo")
        sys.exit(1)
    
    # Crear analizador
    analyzer = PerformanceAnalyzer(output_dir=args.output_dir)
    
    # Ejecutar análisis
    try:
        analyzer.analyze_performance(
            iterations=args.iterations,
            interval_seconds=args.interval,
            http_endpoints=args.endpoints if args.endpoints else None
        )
    except KeyboardInterrupt:
        print("\n\nAnálisis interrumpido por el usuario")
        if analyzer.metrics:
            print(f"Guardando {len(analyzer.metrics)} mediciones recopiladas...")
        else:
            print("No se recopilaron métricas")
            sys.exit(0)
    except Exception as e:
        print(f"\nERROR durante el análisis: {e}")
        sys.exit(1)
    
    # Generar reportes
    if not args.csv_only:
        analyzer.save_json_report()
    
    if not args.json_only:
        analyzer.save_csv_report()
    
    # Mostrar resumen
    stats = analyzer.calculate_statistics()
    if stats:
        print("\n" + "="*60)
        print("RESUMEN DE ESTADÍSTICAS")
        print("="*60)
        print(f"CPU promedio: {stats['cpu']['avg_usage_percent']:.2f}%")
        print(f"CPU máximo: {stats['cpu']['max_usage_percent']:.2f}%")
        print(f"Memoria promedio: {stats['memory']['avg_usage_percent']:.2f}%")
        print(f"Memoria máxima usada: {stats['memory']['max_used_gb']:.2f} GB")
        if 'http' in stats:
            print(f"Tiempo de respuesta HTTP promedio: {stats['http']['avg_response_time_ms']:.2f} ms")
            print(f"Tiempo de respuesta HTTP mínimo: {stats['http']['min_response_time_ms']:.2f} ms")
            print(f"Tiempo de respuesta HTTP máximo: {stats['http']['max_response_time_ms']:.2f} ms")
        print("="*60)


if __name__ == '__main__':
    main()

