#!/usr/bin/env python3
"""
Script para comparar reportes de rendimiento antes y después de optimizaciones

Este script toma dos reportes JSON generados por performance_analysis.py y genera
un reporte de comparación que puede ser usado para completar post_optimization_report.json
"""

import json
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Any


def load_report(filepath: str) -> Dict[str, Any]:
    """Carga un reporte JSON de rendimiento"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: No se encontró el archivo: {filepath}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: El archivo {filepath} no es un JSON válido: {e}")
        sys.exit(1)


def extract_statistics(report: Dict[str, Any]) -> Dict[str, Any]:
    """Extrae las estadísticas de un reporte de rendimiento"""
    stats = report.get('statistics', {})
    
    return {
        'cpu': {
            'avg_usage_percent': stats.get('cpu', {}).get('avg_usage_percent'),
            'max_usage_percent': stats.get('cpu', {}).get('max_usage_percent'),
            'min_usage_percent': stats.get('cpu', {}).get('min_usage_percent'),
        },
        'memory': {
            'avg_usage_percent': stats.get('memory', {}).get('avg_usage_percent'),
            'avg_used_gb': stats.get('memory', {}).get('avg_used_gb'),
            'max_used_gb': stats.get('memory', {}).get('max_used_gb'),
        },
        'disk': {
            'avg_usage_percent': stats.get('disk', {}).get('avg_usage_percent'),
        },
        'http': stats.get('http', {}),
        'system': {
            'total_measurements': stats.get('total_measurements'),
        }
    }


def calculate_improvement(before: Optional[float], after: Optional[float], 
                         direction: str = 'decrease') -> Optional[float]:
    """
    Calcula el porcentaje de mejora entre dos valores
    
    Args:
        before: Valor antes de la optimización
        after: Valor después de la optimización
        direction: 'decrease' para métricas que mejoran al disminuir (CPU, memoria, tiempo)
                   'increase' para métricas que mejoran al aumentar (throughput, éxito)
    
    Returns:
        Porcentaje de mejora (positivo = mejora, negativo = empeoramiento)
    """
    if before is None or after is None:
        return None
    
    if before == 0:
        return None
    
    if direction == 'decrease':
        # Para métricas que mejoran al disminuir (CPU, memoria, tiempo de respuesta)
        improvement = ((before - after) / before) * 100
    else:
        # Para métricas que mejoran al aumentar (throughput, tasa de éxito)
        improvement = ((after - before) / before) * 100
    
    return round(improvement, 2)


def compare_reports(before_report: Dict, after_report: Dict) -> Dict[str, Any]:
    """Compara dos reportes y calcula las mejoras"""
    before_stats = extract_statistics(before_report)
    after_stats = extract_statistics(after_report)
    
    improvements = {
        'cpu': {
            'usage_reduction_percent': calculate_improvement(
                before_stats['cpu']['avg_usage_percent'],
                after_stats['cpu']['avg_usage_percent'],
                'decrease'
            ),
            'improvement_direction': 'decrease',
            'status': 'completed' if before_stats['cpu']['avg_usage_percent'] is not None else 'pending'
        },
        'memory': {
            'usage_reduction_percent': calculate_improvement(
                before_stats['memory']['avg_usage_percent'],
                after_stats['memory']['avg_usage_percent'],
                'decrease'
            ),
            'memory_saved_gb': None,
            'improvement_direction': 'decrease',
            'status': 'completed' if before_stats['memory']['avg_usage_percent'] is not None else 'pending'
        },
        'http': {
            'response_time_improvement_percent': calculate_improvement(
                before_stats['http'].get('avg_response_time_ms'),
                after_stats['http'].get('avg_response_time_ms'),
                'decrease'
            ),
            'response_time_reduction_ms': None,
            'improvement_direction': 'decrease',
            'status': 'completed' if before_stats['http'].get('avg_response_time_ms') is not None else 'pending'
        }
    }
    
    # Calcular memoria ahorrada
    if (before_stats['memory']['avg_used_gb'] is not None and 
        after_stats['memory']['avg_used_gb'] is not None):
        improvements['memory']['memory_saved_gb'] = round(
            before_stats['memory']['avg_used_gb'] - after_stats['memory']['avg_used_gb'],
            2
        )
    
    # Calcular reducción de tiempo de respuesta HTTP
    if (before_stats['http'].get('avg_response_time_ms') is not None and 
        after_stats['http'].get('avg_response_time_ms') is not None):
        improvements['http']['response_time_reduction_ms'] = round(
            before_stats['http']['avg_response_time_ms'] - after_stats['http']['avg_response_time_ms'],
            2
        )
    
    # Determinar efectividad general
    cpu_improvement = improvements['cpu']['usage_reduction_percent']
    memory_improvement = improvements['memory']['usage_reduction_percent']
    http_improvement = improvements['http']['response_time_improvement_percent']
    
    improvements_count = sum([
        1 if cpu_improvement and cpu_improvement > 0 else 0,
        1 if memory_improvement and memory_improvement > 0 else 0,
        1 if http_improvement and http_improvement > 0 else 0,
    ])
    
    if improvements_count == 3:
        effectiveness = "excelente"
    elif improvements_count == 2:
        effectiveness = "buena"
    elif improvements_count == 1:
        effectiveness = "moderada"
    else:
        effectiveness = "limitada"
    
    improvements['overall'] = {
        'optimization_effectiveness': effectiveness,
        'key_improvements': [],
        'areas_requiring_attention': [],
        'recommendations': []
    }
    
    # Identificar mejoras clave
    if cpu_improvement and cpu_improvement > 5:
        improvements['overall']['key_improvements'].append(
            f"Reducción de uso de CPU: {cpu_improvement:.2f}%"
        )
    elif cpu_improvement and cpu_improvement < -5:
        improvements['overall']['areas_requiring_attention'].append(
            f"Aumento de uso de CPU: {abs(cpu_improvement):.2f}% (requiere atención)"
        )
    
    if memory_improvement and memory_improvement > 5:
        improvements['overall']['key_improvements'].append(
            f"Reducción de uso de memoria: {memory_improvement:.2f}%"
        )
    elif memory_improvement and memory_improvement < -5:
        improvements['overall']['areas_requiring_attention'].append(
            f"Aumento de uso de memoria: {abs(memory_improvement):.2f}% (requiere atención)"
        )
    
    if http_improvement and http_improvement > 10:
        improvements['overall']['key_improvements'].append(
            f"Mejora en tiempo de respuesta HTTP: {http_improvement:.2f}%"
        )
    elif http_improvement and http_improvement < -10:
        improvements['overall']['areas_requiring_attention'].append(
            f"Degradación en tiempo de respuesta HTTP: {abs(http_improvement):.2f}% (requiere atención)"
        )
    
    return {
        'before': {
            'baseline_date': before_report.get('metadata', {}).get('generated_at', ''),
            'metrics': before_stats,
            'source_report': Path(before_report.get('metadata', {}).get('generated_at', 'unknown')).name
        },
        'after': {
            'baseline_date': after_report.get('metadata', {}).get('generated_at', ''),
            'metrics': after_stats,
            'source_report': Path(after_report.get('metadata', {}).get('generated_at', 'unknown')).name
        },
        'improvements': improvements
    }


def generate_post_optimization_report(comparison: Dict, output_path: str):
    """Genera un reporte post-optimización completo"""
    report = {
        'metadata': {
            'report_type': 'post_optimization_comparison',
            'generated_at': datetime.now().isoformat(),
            'phase': '6.4',
            'description': 'Comparación de métricas de rendimiento antes y después de las optimizaciones implementadas',
            'optimization_date': comparison['after']['baseline_date'],
            'monitoring_period_days': 7
        },
        'comparison': {
            'before_optimization': {
                'baseline_date': comparison['before']['baseline_date'],
                'metrics': comparison['before']['metrics'],
                'source_report': comparison['before']['source_report']
            },
            'after_optimization': {
                'baseline_date': comparison['after']['baseline_date'],
                'metrics': comparison['after']['metrics'],
                'source_report': comparison['after']['source_report']
            }
        },
        'improvements': comparison['improvements'],
        'analysis': {
            'summary': f"Comparación realizada el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}. "
                      f"Efectividad de optimización: {comparison['improvements']['overall']['optimization_effectiveness']}.",
            'methodology': {
                'baseline_measurement': 'Métricas recopiladas antes de implementar optimizaciones',
                'post_optimization_measurement': 'Métricas recopiladas después de implementar optimizaciones y período de estabilización',
                'comparison_window': 'Mismo período del día, condiciones similares de carga',
                'statistical_significance': 'Se recomienda múltiples mediciones para validar mejoras'
            },
            'findings': comparison['improvements']['overall']['key_improvements'],
            'conclusions': f"Las optimizaciones han mostrado una efectividad {comparison['improvements']['overall']['optimization_effectiveness']}. "
                         f"Se identificaron {len(comparison['improvements']['overall']['key_improvements'])} mejoras clave y "
                         f"{len(comparison['improvements']['overall']['areas_requiring_attention'])} áreas que requieren atención."
        },
        'next_steps': [
            'Validar que las mejoras son estadísticamente significativas con más mediciones',
            'Monitorear el sistema en producción para confirmar mejoras sostenidas',
            'Documentar hallazgos y conclusiones',
            'Identificar áreas adicionales de optimización si es necesario'
        ]
    }
    
    # Agregar recomendaciones basadas en los hallazgos
    if comparison['improvements']['overall']['areas_requiring_attention']:
        report['analysis']['next_steps'].insert(0, 
            'Revisar áreas que requieren atención identificadas en el análisis'
        )
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Reporte post-optimización generado: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Compara reportes de rendimiento antes y después de optimizaciones',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  # Comparar dos reportes y generar post_optimization_report.json
  python scripts/compare_performance_reports.py \\
    --before performance_reports/report_before.json \\
    --after performance_reports/report_after.json \\
    --output scripts/performance/post_optimization_report.json

  # Solo mostrar comparación en consola
  python scripts/compare_performance_reports.py \\
    --before performance_reports/report_before.json \\
    --after performance_reports/report_after.json \\
    --console-only
        """
    )
    
    parser.add_argument(
        '--before', '-b',
        type=str,
        required=True,
        help='Ruta al reporte JSON antes de la optimización'
    )
    
    parser.add_argument(
        '--after', '-a',
        type=str,
        required=True,
        help='Ruta al reporte JSON después de la optimización'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='scripts/performance/post_optimization_report.json',
        help='Ruta de salida para el reporte post-optimización (default: scripts/performance/post_optimization_report.json)'
    )
    
    parser.add_argument(
        '--console-only',
        action='store_true',
        help='Solo mostrar comparación en consola, no generar archivo'
    )
    
    args = parser.parse_args()
    
    # Cargar reportes
    print("Cargando reportes...")
    before_report = load_report(args.before)
    after_report = load_report(args.after)
    
    # Comparar
    print("Comparando reportes...")
    comparison = compare_reports(before_report, after_report)
    
    # Mostrar resumen en consola
    print("\n" + "="*60)
    print("RESUMEN DE COMPARACIÓN")
    print("="*60)
    
    print("\n📊 ANTES DE OPTIMIZACIÓN:")
    before_stats = comparison['before']['metrics']
    if before_stats['cpu']['avg_usage_percent']:
        print(f"  CPU promedio: {before_stats['cpu']['avg_usage_percent']:.2f}%")
    if before_stats['memory']['avg_usage_percent']:
        print(f"  Memoria promedio: {before_stats['memory']['avg_usage_percent']:.2f}%")
    if before_stats['http'].get('avg_response_time_ms'):
        print(f"  Tiempo de respuesta HTTP: {before_stats['http']['avg_response_time_ms']:.2f} ms")
    
    print("\n📊 DESPUÉS DE OPTIMIZACIÓN:")
    after_stats = comparison['after']['metrics']
    if after_stats['cpu']['avg_usage_percent']:
        print(f"  CPU promedio: {after_stats['cpu']['avg_usage_percent']:.2f}%")
    if after_stats['memory']['avg_usage_percent']:
        print(f"  Memoria promedio: {after_stats['memory']['avg_usage_percent']:.2f}%")
    if after_stats['http'].get('avg_response_time_ms'):
        print(f"  Tiempo de respuesta HTTP: {after_stats['http']['avg_response_time_ms']:.2f} ms")
    
    print("\n✨ MEJORAS:")
    improvements = comparison['improvements']
    if improvements['cpu']['usage_reduction_percent'] is not None:
        cpu_imp = improvements['cpu']['usage_reduction_percent']
        symbol = "✓" if cpu_imp > 0 else "✗"
        print(f"  {symbol} CPU: {cpu_imp:+.2f}%")
    
    if improvements['memory']['usage_reduction_percent'] is not None:
        mem_imp = improvements['memory']['usage_reduction_percent']
        symbol = "✓" if mem_imp > 0 else "✗"
        print(f"  {symbol} Memoria: {mem_imp:+.2f}%")
        if improvements['memory']['memory_saved_gb']:
            print(f"    Memoria ahorrada: {improvements['memory']['memory_saved_gb']:.2f} GB")
    
    if improvements['http']['response_time_improvement_percent'] is not None:
        http_imp = improvements['http']['response_time_improvement_percent']
        symbol = "✓" if http_imp > 0 else "✗"
        print(f"  {symbol} Tiempo de respuesta HTTP: {http_imp:+.2f}%")
        if improvements['http']['response_time_reduction_ms']:
            print(f"    Reducción: {improvements['http']['response_time_reduction_ms']:.2f} ms")
    
    print(f"\n📈 Efectividad general: {improvements['overall']['optimization_effectiveness']}")
    
    if improvements['overall']['key_improvements']:
        print("\n✅ Mejoras clave:")
        for improvement in improvements['overall']['key_improvements']:
            print(f"  • {improvement}")
    
    if improvements['overall']['areas_requiring_attention']:
        print("\n⚠️  Áreas que requieren atención:")
        for area in improvements['overall']['areas_requiring_attention']:
            print(f"  • {area}")
    
    print("="*60 + "\n")
    
    # Generar archivo si no es solo consola
    if not args.console_only:
        generate_post_optimization_report(comparison, args.output)
        print(f"\n✨ Comparación completada exitosamente.\n")


if __name__ == '__main__':
    main()

