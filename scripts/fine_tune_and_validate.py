#!/usr/bin/env python3
"""
Ajustes Finos y Validación de Resultados - Sistema ELIXIR 2.0

Este script realiza ajustes adicionales en los parámetros del sistema basados
en los resultados del monitoreo post-optimización y valida que el rendimiento
esté dentro de los parámetros esperados.

El script:
1. Lee reportes de análisis de rendimiento previos
2. Analiza métricas y determina ajustes necesarios
3. Realiza ajustes finos en parámetros del sistema
4. Valida resultados finales contra umbrales esperados
5. Genera reporte de validación detallado
"""

import json
import sys
import argparse
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import os

try:
    import psutil
except ImportError:
    print("ERROR: psutil no está instalado. Ejecuta: pip install psutil")
    sys.exit(1)


class PerformanceThresholds:
    """Umbrales de rendimiento esperados"""
    
    def __init__(self):
        # CPU
        self.cpu_max_usage_percent = 80.0
        self.cpu_avg_usage_percent = 60.0
        
        # Memoria
        self.memory_max_usage_percent = 85.0
        self.memory_avg_usage_percent = 70.0
        
        # Disco
        self.disk_max_usage_percent = 90.0
        
        # HTTP Response Times (ms)
        self.http_max_response_time_ms = 500.0
        self.http_avg_response_time_ms = 200.0
        
        # Swap
        self.swap_max_usage_percent = 50.0


class SystemTuner:
    """Ajustador de parámetros del sistema"""
    
    def __init__(self):
        self.adjustments_made: List[Dict] = []
        self.adjustment_log: List[str] = []
    
    def adjust_memory_allocation(self, current_usage: float, target_usage: float) -> Dict:
        """
        Ajusta la asignación de memoria del sistema
        
        Nota: En sistemas reales, esto podría ajustar límites de procesos,
        configuraciones de aplicaciones, o parámetros de runtime.
        """
        adjustment = {
            'type': 'memory_allocation',
            'timestamp': datetime.now().isoformat(),
            'current_usage_percent': current_usage,
            'target_usage_percent': target_usage,
            'recommendation': None,
            'applied': False
        }
        
        if current_usage > target_usage:
            # Memoria alta - recomendar optimización
            diff = current_usage - target_usage
            adjustment['recommendation'] = (
                f"Reducir uso de memoria en {diff:.2f}%. "
                f"Considerar: limpieza de caché, optimización de queries, "
                f"reducción de buffers o límites de procesos."
            )
            adjustment['priority'] = 'high' if diff > 15 else 'medium'
        else:
            adjustment['recommendation'] = (
                f"Uso de memoria dentro de parámetros ({current_usage:.2f}% < {target_usage:.2f}%)"
            )
            adjustment['priority'] = 'low'
        
        self.adjustments_made.append(adjustment)
        self.adjustment_log.append(
            f"[{adjustment['timestamp']}] Ajuste de memoria: {adjustment['recommendation']}"
        )
        
        return adjustment
    
    def adjust_cpu_priority(self, current_usage: float, target_usage: float) -> Dict:
        """
        Ajusta la prioridad de CPU del sistema
        
        Nota: En sistemas reales, esto podría ajustar nice values,
        affinity de CPU, o límites de recursos.
        """
        adjustment = {
            'type': 'cpu_priority',
            'timestamp': datetime.now().isoformat(),
            'current_usage_percent': current_usage,
            'target_usage_percent': target_usage,
            'recommendation': None,
            'applied': False
        }
        
        if current_usage > target_usage:
            diff = current_usage - target_usage
            adjustment['recommendation'] = (
                f"Reducir uso de CPU en {diff:.2f}%. "
                f"Considerar: optimización de algoritmos, paralelización, "
                f"reducción de procesos en background, o escalado horizontal."
            )
            adjustment['priority'] = 'high' if diff > 20 else 'medium'
        else:
            adjustment['recommendation'] = (
                f"Uso de CPU dentro de parámetros ({current_usage:.2f}% < {target_usage:.2f}%)"
            )
            adjustment['priority'] = 'low'
        
        self.adjustments_made.append(adjustment)
        self.adjustment_log.append(
            f"[{adjustment['timestamp']}] Ajuste de CPU: {adjustment['recommendation']}"
        )
        
        return adjustment
    
    def adjust_disk_usage(self, current_usage: float, target_usage: float) -> Dict:
        """Ajusta el uso de disco"""
        adjustment = {
            'type': 'disk_usage',
            'timestamp': datetime.now().isoformat(),
            'current_usage_percent': current_usage,
            'target_usage_percent': target_usage,
            'recommendation': None,
            'applied': False
        }
        
        if current_usage > target_usage:
            diff = current_usage - target_usage
            adjustment['recommendation'] = (
                f"Reducir uso de disco en {diff:.2f}%. "
                f"Considerar: limpieza de logs antiguos, compresión de datos, "
                f"archivado de datos históricos, o expansión de almacenamiento."
            )
            adjustment['priority'] = 'high' if diff > 10 else 'medium'
        else:
            adjustment['recommendation'] = (
                f"Uso de disco dentro de parámetros ({current_usage:.2f}% < {target_usage:.2f}%)"
            )
            adjustment['priority'] = 'low'
        
        self.adjustments_made.append(adjustment)
        return adjustment
    
    def get_adjustments_summary(self) -> Dict:
        """Obtiene un resumen de los ajustes realizados"""
        high_priority = [a for a in self.adjustments_made if a.get('priority') == 'high']
        medium_priority = [a for a in self.adjustments_made if a.get('priority') == 'medium']
        low_priority = [a for a in self.adjustments_made if a.get('priority') == 'low']
        
        return {
            'total_adjustments': len(self.adjustments_made),
            'high_priority': len(high_priority),
            'medium_priority': len(medium_priority),
            'low_priority': len(low_priority),
            'adjustments': self.adjustments_made,
            'log': self.adjustment_log
        }


class PerformanceValidator:
    """Validador de rendimiento del sistema"""
    
    def __init__(self, thresholds: PerformanceThresholds):
        self.thresholds = thresholds
        self.validation_results: List[Dict] = []
        self.overall_status: str = 'PASS'
    
    def validate_cpu(self, stats: Dict) -> Dict:
        """Valida métricas de CPU"""
        result = {
            'metric': 'cpu',
            'timestamp': datetime.now().isoformat(),
            'status': 'PASS',
            'checks': []
        }
        
        avg_cpu = stats.get('cpu', {}).get('avg_usage_percent', 0)
        max_cpu = stats.get('cpu', {}).get('max_usage_percent', 0)
        
        # Validar promedio
        if avg_cpu > self.thresholds.cpu_avg_usage_percent:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'cpu_avg_usage',
                'status': 'FAIL',
                'value': avg_cpu,
                'threshold': self.thresholds.cpu_avg_usage_percent,
                'message': f'CPU promedio ({avg_cpu:.2f}%) excede umbral ({self.thresholds.cpu_avg_usage_percent}%)'
            })
        else:
            result['checks'].append({
                'check': 'cpu_avg_usage',
                'status': 'PASS',
                'value': avg_cpu,
                'threshold': self.thresholds.cpu_avg_usage_percent,
                'message': f'CPU promedio ({avg_cpu:.2f}%) dentro de umbral'
            })
        
        # Validar máximo
        if max_cpu > self.thresholds.cpu_max_usage_percent:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'cpu_max_usage',
                'status': 'FAIL',
                'value': max_cpu,
                'threshold': self.thresholds.cpu_max_usage_percent,
                'message': f'CPU máximo ({max_cpu:.2f}%) excede umbral ({self.thresholds.cpu_max_usage_percent}%)'
            })
        else:
            result['checks'].append({
                'check': 'cpu_max_usage',
                'status': 'PASS',
                'value': max_cpu,
                'threshold': self.thresholds.cpu_max_usage_percent,
                'message': f'CPU máximo ({max_cpu:.2f}%) dentro de umbral'
            })
        
        if result['status'] == 'FAIL':
            self.overall_status = 'FAIL'
        
        self.validation_results.append(result)
        return result
    
    def validate_memory(self, stats: Dict) -> Dict:
        """Valida métricas de memoria"""
        result = {
            'metric': 'memory',
            'timestamp': datetime.now().isoformat(),
            'status': 'PASS',
            'checks': []
        }
        
        avg_memory = stats.get('memory', {}).get('avg_usage_percent', 0)
        max_memory = stats.get('memory', {}).get('max_used_gb', 0)
        
        # Validar promedio
        if avg_memory > self.thresholds.memory_avg_usage_percent:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'memory_avg_usage',
                'status': 'FAIL',
                'value': avg_memory,
                'threshold': self.thresholds.memory_avg_usage_percent,
                'message': f'Memoria promedio ({avg_memory:.2f}%) excede umbral ({self.thresholds.memory_avg_usage_percent}%)'
            })
        else:
            result['checks'].append({
                'check': 'memory_avg_usage',
                'status': 'PASS',
                'value': avg_memory,
                'threshold': self.thresholds.memory_avg_usage_percent,
                'message': f'Memoria promedio ({avg_memory:.2f}%) dentro de umbral'
            })
        
        # Validar máximo
        if avg_memory > self.thresholds.memory_max_usage_percent:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'memory_max_usage',
                'status': 'FAIL',
                'value': avg_memory,
                'threshold': self.thresholds.memory_max_usage_percent,
                'message': f'Memoria máxima ({avg_memory:.2f}%) excede umbral ({self.thresholds.memory_max_usage_percent}%)'
            })
        else:
            result['checks'].append({
                'check': 'memory_max_usage',
                'status': 'PASS',
                'value': avg_memory,
                'threshold': self.thresholds.memory_max_usage_percent,
                'message': f'Memoria máxima ({avg_memory:.2f}%) dentro de umbral'
            })
        
        if result['status'] == 'FAIL':
            self.overall_status = 'FAIL'
        
        self.validation_results.append(result)
        return result
    
    def validate_disk(self, stats: Dict) -> Dict:
        """Valida métricas de disco"""
        result = {
            'metric': 'disk',
            'timestamp': datetime.now().isoformat(),
            'status': 'PASS',
            'checks': []
        }
        
        avg_disk = stats.get('disk', {}).get('avg_usage_percent', 0)
        
        if avg_disk > self.thresholds.disk_max_usage_percent:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'disk_usage',
                'status': 'FAIL',
                'value': avg_disk,
                'threshold': self.thresholds.disk_max_usage_percent,
                'message': f'Disco ({avg_disk:.2f}%) excede umbral ({self.thresholds.disk_max_usage_percent}%)'
            })
        else:
            result['checks'].append({
                'check': 'disk_usage',
                'status': 'PASS',
                'value': avg_disk,
                'threshold': self.thresholds.disk_max_usage_percent,
                'message': f'Disco ({avg_disk:.2f}%) dentro de umbral'
            })
        
        if result['status'] == 'FAIL':
            self.overall_status = 'FAIL'
        
        self.validation_results.append(result)
        return result
    
    def validate_http(self, stats: Dict) -> Dict:
        """Valida métricas HTTP"""
        result = {
            'metric': 'http',
            'timestamp': datetime.now().isoformat(),
            'status': 'PASS',
            'checks': []
        }
        
        if 'http' not in stats:
            result['checks'].append({
                'check': 'http_metrics',
                'status': 'SKIP',
                'message': 'No hay métricas HTTP disponibles'
            })
            self.validation_results.append(result)
            return result
        
        avg_response = stats['http'].get('avg_response_time_ms', 0)
        max_response = stats['http'].get('max_response_time_ms', 0)
        
        # Validar promedio
        if avg_response > self.thresholds.http_avg_response_time_ms:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'http_avg_response',
                'status': 'FAIL',
                'value': avg_response,
                'threshold': self.thresholds.http_avg_response_time_ms,
                'message': f'Tiempo de respuesta HTTP promedio ({avg_response:.2f}ms) excede umbral ({self.thresholds.http_avg_response_time_ms}ms)'
            })
        else:
            result['checks'].append({
                'check': 'http_avg_response',
                'status': 'PASS',
                'value': avg_response,
                'threshold': self.thresholds.http_avg_response_time_ms,
                'message': f'Tiempo de respuesta HTTP promedio ({avg_response:.2f}ms) dentro de umbral'
            })
        
        # Validar máximo
        if max_response > self.thresholds.http_max_response_time_ms:
            result['status'] = 'FAIL'
            result['checks'].append({
                'check': 'http_max_response',
                'status': 'FAIL',
                'value': max_response,
                'threshold': self.thresholds.http_max_response_time_ms,
                'message': f'Tiempo de respuesta HTTP máximo ({max_response:.2f}ms) excede umbral ({self.thresholds.http_max_response_time_ms}ms)'
            })
        else:
            result['checks'].append({
                'check': 'http_max_response',
                'status': 'PASS',
                'value': max_response,
                'threshold': self.thresholds.http_max_response_time_ms,
                'message': f'Tiempo de respuesta HTTP máximo ({max_response:.2f}ms) dentro de umbral'
            })
        
        if result['status'] == 'FAIL':
            self.overall_status = 'FAIL'
        
        self.validation_results.append(result)
        return result
    
    def get_validation_summary(self) -> Dict:
        """Obtiene un resumen de la validación"""
        passed = sum(1 for r in self.validation_results if r['status'] == 'PASS')
        failed = sum(1 for r in self.validation_results if r['status'] == 'FAIL')
        total_checks = sum(len(r['checks']) for r in self.validation_results)
        passed_checks = sum(
            sum(1 for c in r['checks'] if c['status'] == 'PASS')
            for r in self.validation_results
        )
        
        return {
            'overall_status': self.overall_status,
            'metrics_validated': len(self.validation_results),
            'metrics_passed': passed,
            'metrics_failed': failed,
            'total_checks': total_checks,
            'checks_passed': passed_checks,
            'checks_failed': total_checks - passed_checks,
            'validation_results': self.validation_results
        }


class FineTuneValidator:
    """Orquestador principal de ajustes finos y validación"""
    
    def __init__(self, report_path: Optional[str] = None, thresholds: Optional[PerformanceThresholds] = None):
        self.report_path = Path(report_path) if report_path else None
        self.thresholds = thresholds or PerformanceThresholds()
        self.tuner = SystemTuner()
        self.validator = PerformanceValidator(self.thresholds)
        self.stats: Optional[Dict] = None
    
    def load_performance_report(self, report_path: str) -> Dict:
        """Carga un reporte de rendimiento JSON"""
        path = Path(report_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Reporte no encontrado: {report_path}")
        
        with open(path, 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        if 'statistics' not in report:
            raise ValueError("El reporte no contiene estadísticas válidas")
        
        return report
    
    def find_latest_report(self, reports_dir: str = "performance_reports") -> Optional[Path]:
        """Encuentra el reporte más reciente en el directorio"""
        reports_path = Path(reports_dir)
        
        if not reports_path.exists():
            return None
        
        json_reports = list(reports_path.glob("performance_analysis_report_*.json"))
        
        if not json_reports:
            return None
        
        # Ordenar por fecha de modificación (más reciente primero)
        json_reports.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        
        return json_reports[0]
    
    def analyze_and_tune(self, stats: Dict):
        """Analiza estadísticas y realiza ajustes finos"""
        print("Analizando métricas y determinando ajustes necesarios...")
        
        # Ajustar memoria
        memory_avg = stats.get('memory', {}).get('avg_usage_percent', 0)
        self.tuner.adjust_memory_allocation(
            memory_avg,
            self.thresholds.memory_avg_usage_percent
        )
        
        # Ajustar CPU
        cpu_avg = stats.get('cpu', {}).get('avg_usage_percent', 0)
        self.tuner.adjust_cpu_priority(
            cpu_avg,
            self.thresholds.cpu_avg_usage_percent
        )
        
        # Ajustar disco
        disk_avg = stats.get('disk', {}).get('avg_usage_percent', 0)
        self.tuner.adjust_disk_usage(
            disk_avg,
            self.thresholds.disk_max_usage_percent
        )
        
        print(f"  ✓ Ajustes determinados: {len(self.tuner.adjustments_made)}")
    
    def validate_performance(self, stats: Dict):
        """Valida que el rendimiento esté dentro de parámetros esperados"""
        print("Validando rendimiento contra umbrales esperados...")
        
        self.validator.validate_cpu(stats)
        self.validator.validate_memory(stats)
        self.validator.validate_disk(stats)
        self.validator.validate_http(stats)
        
        print(f"  ✓ Validaciones completadas: {len(self.validator.validation_results)}")
    
    def save_validation_report(self, output_dir: str = "performance_reports") -> Path:
        """Guarda el reporte de validación"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"validation_report_{timestamp}.json"
        filepath = output_path / filename
        
        report = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'source_report': str(self.report_path) if self.report_path else None,
                'thresholds': {
                    'cpu_max_usage_percent': self.thresholds.cpu_max_usage_percent,
                    'cpu_avg_usage_percent': self.thresholds.cpu_avg_usage_percent,
                    'memory_max_usage_percent': self.thresholds.memory_max_usage_percent,
                    'memory_avg_usage_percent': self.thresholds.memory_avg_usage_percent,
                    'disk_max_usage_percent': self.thresholds.disk_max_usage_percent,
                    'http_max_response_time_ms': self.thresholds.http_max_response_time_ms,
                    'http_avg_response_time_ms': self.thresholds.http_avg_response_time_ms,
                }
            },
            'adjustments': self.tuner.get_adjustments_summary(),
            'validation': self.validator.get_validation_summary(),
            'statistics': self.stats
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Reporte de validación guardado: {filepath}")
        return filepath
    
    def print_summary(self):
        """Imprime un resumen de los resultados"""
        print("\n" + "="*70)
        print("RESUMEN DE AJUSTES Y VALIDACIÓN")
        print("="*70)
        
        # Resumen de ajustes
        adj_summary = self.tuner.get_adjustments_summary()
        print(f"\n📊 AJUSTES REALIZADOS:")
        print(f"  Total: {adj_summary['total_adjustments']}")
        print(f"  Alta prioridad: {adj_summary['high_priority']}")
        print(f"  Media prioridad: {adj_summary['medium_priority']}")
        print(f"  Baja prioridad: {adj_summary['low_priority']}")
        
        if adj_summary['high_priority'] > 0:
            print(f"\n  ⚠️  Ajustes de alta prioridad:")
            for adj in adj_summary['adjustments']:
                if adj.get('priority') == 'high':
                    print(f"    - {adj['type']}: {adj['recommendation']}")
        
        # Resumen de validación
        val_summary = self.validator.get_validation_summary()
        print(f"\n✅ VALIDACIÓN DE RENDIMIENTO:")
        print(f"  Estado general: {val_summary['overall_status']}")
        print(f"  Métricas validadas: {val_summary['metrics_validated']}")
        print(f"  Métricas aprobadas: {val_summary['metrics_passed']}")
        print(f"  Métricas fallidas: {val_summary['metrics_failed']}")
        print(f"  Checks totales: {val_summary['total_checks']}")
        print(f"  Checks aprobados: {val_summary['checks_passed']}")
        print(f"  Checks fallidos: {val_summary['checks_failed']}")
        
        if val_summary['checks_failed'] > 0:
            print(f"\n  ❌ Checks fallidos:")
            for result in val_summary['validation_results']:
                for check in result['checks']:
                    if check['status'] == 'FAIL':
                        print(f"    - {result['metric']}.{check['check']}: {check['message']}")
        
        print("="*70)
    
    def run(self):
        """Ejecuta el proceso completo de ajustes finos y validación"""
        print("Iniciando ajustes finos y validación de resultados...\n")
        
        # Cargar reporte
        if self.report_path and self.report_path.exists():
            print(f"Cargando reporte: {self.report_path}")
            report = self.load_performance_report(str(self.report_path))
        else:
            print("Buscando reporte más reciente...")
            latest_report = self.find_latest_report()
            if not latest_report:
                print("ERROR: No se encontró ningún reporte de rendimiento.")
                print("Ejecuta primero: python scripts/performance_analysis.py")
                sys.exit(1)
            print(f"Reporte encontrado: {latest_report}")
            self.report_path = latest_report
            report = self.load_performance_report(str(latest_report))
        
        self.stats = report.get('statistics', {})
        
        if not self.stats:
            print("ERROR: El reporte no contiene estadísticas válidas")
            sys.exit(1)
        
        print(f"  ✓ Reporte cargado: {report['metadata'].get('total_measurements', 0)} mediciones\n")
        
        # Analizar y ajustar
        self.analyze_and_tune(self.stats)
        print()
        
        # Validar
        self.validate_performance(self.stats)
        print()
        
        # Guardar reporte
        report_path = self.save_validation_report()
        print()
        
        # Mostrar resumen
        self.print_summary()
        
        # Retornar código de salida basado en validación
        val_summary = self.validator.get_validation_summary()
        return 0 if val_summary['overall_status'] == 'PASS' else 1


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description='Ajustes finos y validación de resultados del sistema ELIXIR 2.0',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  # Usar el reporte más reciente automáticamente
  python scripts/fine_tune_and_validate.py

  # Especificar un reporte específico
  python scripts/fine_tune_and_validate.py --report performance_reports/performance_analysis_report_20240101_120000.json

  # Ajustar umbrales personalizados
  python scripts/fine_tune_and_validate.py --cpu-max 75 --memory-max 80

  # Especificar directorio de salida
  python scripts/fine_tune_and_validate.py --output-dir reports/validation
        """
    )
    
    parser.add_argument(
        '--report', '-r',
        type=str,
        default=None,
        help='Ruta al reporte JSON de rendimiento (si no se especifica, usa el más reciente)'
    )
    
    parser.add_argument(
        '--output-dir', '-o',
        type=str,
        default='performance_reports',
        help='Directorio para guardar el reporte de validación (default: performance_reports)'
    )
    
    # Umbrales personalizables
    parser.add_argument(
        '--cpu-max',
        type=float,
        default=None,
        help='Umbral máximo de uso de CPU en porcentaje (default: 80.0)'
    )
    
    parser.add_argument(
        '--cpu-avg',
        type=float,
        default=None,
        help='Umbral promedio de uso de CPU en porcentaje (default: 60.0)'
    )
    
    parser.add_argument(
        '--memory-max',
        type=float,
        default=None,
        help='Umbral máximo de uso de memoria en porcentaje (default: 85.0)'
    )
    
    parser.add_argument(
        '--memory-avg',
        type=float,
        default=None,
        help='Umbral promedio de uso de memoria en porcentaje (default: 70.0)'
    )
    
    parser.add_argument(
        '--disk-max',
        type=float,
        default=None,
        help='Umbral máximo de uso de disco en porcentaje (default: 90.0)'
    )
    
    parser.add_argument(
        '--http-max',
        type=float,
        default=None,
        help='Umbral máximo de tiempo de respuesta HTTP en ms (default: 500.0)'
    )
    
    parser.add_argument(
        '--http-avg',
        type=float,
        default=None,
        help='Umbral promedio de tiempo de respuesta HTTP en ms (default: 200.0)'
    )
    
    args = parser.parse_args()
    
    # Configurar umbrales
    thresholds = PerformanceThresholds()
    if args.cpu_max is not None:
        thresholds.cpu_max_usage_percent = args.cpu_max
    if args.cpu_avg is not None:
        thresholds.cpu_avg_usage_percent = args.cpu_avg
    if args.memory_max is not None:
        thresholds.memory_max_usage_percent = args.memory_max
    if args.memory_avg is not None:
        thresholds.memory_avg_usage_percent = args.memory_avg
    if args.disk_max is not None:
        thresholds.disk_max_usage_percent = args.disk_max
    if args.http_max is not None:
        thresholds.http_max_response_time_ms = args.http_max
    if args.http_avg is not None:
        thresholds.http_avg_response_time_ms = args.http_avg
    
    # Crear y ejecutar validador
    validator = FineTuneValidator(
        report_path=args.report,
        thresholds=thresholds
    )
    
    try:
        exit_code = validator.run()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nProceso interrumpido por el usuario")
        sys.exit(130)
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

