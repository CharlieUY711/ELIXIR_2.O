#!/usr/bin/env python3
"""
Script de Análisis Comparativo de Resultados de Escalabilidad - Fase 7.4
Compara resultados de diferentes pruebas de escalabilidad y genera
recomendaciones de ajustes de infraestructura.
"""

import json
import sys
import argparse
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
import statistics


class ScalabilityResultsComparator:
    """Compara y analiza resultados de pruebas de escalabilidad"""

    def __init__(self):
        self.reports: List[Dict] = []

    def load_report(self, filepath: str) -> Dict:
        """Carga un reporte desde un archivo JSON"""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Archivo no encontrado: {filepath}")
        
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def extract_metrics(self, report: Dict) -> Dict:
        """Extrae métricas clave de un reporte"""
        metrics = {
            'report_type': report.get('metadata', {}).get('report_type', 'unknown'),
            'timestamp': report.get('metadata', {}).get('generated_at', ''),
            'scenarios': [],
        }
        
        # Manejar diferentes tipos de reportes
        if 'scenarios' in report:
            for scenario in report['scenarios']:
                stats = scenario.get('statistics', {})
                config = scenario.get('scenario_config', {}) or scenario.get('scenario', {})
                
                scenario_metrics = {
                    'name': scenario.get('scenario_name', 'unknown'),
                    'users': config.get('num_users', 0),
                    'total_requests': stats.get('total_requests', 0),
                    'success_rate': stats.get('success_rate', 0),
                    'failed_requests': stats.get('failed_requests', 0),
                }
                
                if 'response_time' in stats:
                    rt = stats['response_time']
                    scenario_metrics['latency'] = {
                        'avg_ms': rt.get('avg_ms', 0),
                        'p50_ms': rt.get('p50_ms', 0),
                        'p95_ms': rt.get('p95_ms', 0),
                        'p99_ms': rt.get('p99_ms', 0),
                    }
                
                if 'throughput' in stats:
                    scenario_metrics['throughput'] = stats['throughput'].get('requests_per_second', 0)
                
                metrics['scenarios'].append(scenario_metrics)
        
        # Manejar reportes de pruebas progresivas
        elif 'test_results' in report:
            for test_result in report['test_results']:
                stats = test_result.get('statistics', {})
                config = test_result.get('config', {})
                
                test_metrics = {
                    'name': test_result.get('test_name', 'unknown'),
                    'users': config.get('num_users', 0),
                    'total_requests': stats.get('total_requests', 0),
                    'success_rate': stats.get('success_rate', 0),
                    'failed_requests': stats.get('failed_requests', 0),
                }
                
                if 'response_time' in stats:
                    rt = stats['response_time']
                    test_metrics['latency'] = {
                        'avg_ms': rt.get('avg_ms', 0),
                        'p50_ms': rt.get('p50_ms', 0),
                        'p95_ms': rt.get('p95_ms', 0),
                        'p99_ms': rt.get('p99_ms', 0),
                    }
                
                if 'throughput' in stats:
                    test_metrics['throughput'] = stats['throughput'].get('requests_per_second', 0)
                
                metrics['scenarios'].append(test_metrics)
        
        return metrics

    def compare_reports(self, reports: List[Dict]) -> Dict:
        """Compara múltiples reportes y genera análisis"""
        if len(reports) < 2:
            return {
                'error': 'Se requieren al menos 2 reportes para comparar'
            }
        
        extracted_metrics = [self.extract_metrics(r) for r in reports]
        
        comparison = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_reports': len(reports),
                'report_types': [m['report_type'] for m in extracted_metrics],
            },
            'comparison': {},
            'recommendations': [],
        }
        
        # Comparar métricas por número de usuarios
        user_levels = {}
        for metrics in extracted_metrics:
            for scenario in metrics['scenarios']:
                users = scenario['users']
                if users not in user_levels:
                    user_levels[users] = []
                user_levels[users].append(scenario)
        
        # Análisis por nivel de usuarios
        comparison_by_users = {}
        for users, scenarios in user_levels.items():
            if len(scenarios) >= 2:
                success_rates = [s['success_rate'] for s in scenarios]
                avg_latencies = [s.get('latency', {}).get('p95_ms', 0) for s in scenarios if 'latency' in s]
                throughputs = [s.get('throughput', 0) for s in scenarios if 'throughput' in s]
                
                comparison_by_users[users] = {
                    'success_rate': {
                        'min': min(success_rates),
                        'max': max(success_rates),
                        'avg': statistics.mean(success_rates),
                        'stdev': statistics.stdev(success_rates) if len(success_rates) > 1 else 0,
                    },
                    'latency_p95': {
                        'min': min(avg_latencies) if avg_latencies else 0,
                        'max': max(avg_latencies) if avg_latencies else 0,
                        'avg': statistics.mean(avg_latencies) if avg_latencies else 0,
                    },
                    'throughput': {
                        'min': min(throughputs) if throughputs else 0,
                        'max': max(throughputs) if throughputs else 0,
                        'avg': statistics.mean(throughputs) if throughputs else 0,
                    },
                }
        
        comparison['comparison'] = comparison_by_users
        
        # Generar recomendaciones
        recommendations = self.generate_recommendations(extracted_metrics, comparison_by_users)
        comparison['recommendations'] = recommendations
        
        return comparison

    def generate_recommendations(
        self,
        extracted_metrics: List[Dict],
        comparison_by_users: Dict
    ) -> List[Dict]:
        """Genera recomendaciones basadas en el análisis comparativo"""
        recommendations = []
        
        # Analizar tendencias de rendimiento
        user_levels = sorted(comparison_by_users.keys())
        
        if len(user_levels) >= 2:
            # Analizar degradación de rendimiento
            first_level = comparison_by_users[user_levels[0]]
            last_level = comparison_by_users[user_levels[-1]]
            
            success_rate_degradation = first_level['success_rate']['avg'] - last_level['success_rate']['avg']
            latency_increase = last_level['latency_p95']['avg'] - first_level['latency_p95']['avg']
            
            # Recomendación 1: Degradación de tasa de éxito
            if success_rate_degradation > 5:
                recommendations.append({
                    'priority': 'HIGH',
                    'category': 'Reliability',
                    'issue': f'Degradación significativa de tasa de éxito ({success_rate_degradation:.1f}%)',
                    'description': f'La tasa de éxito cae de {first_level["success_rate"]["avg"]:.1f}% a {last_level["success_rate"]["avg"]:.1f}% al aumentar usuarios',
                    'recommendation': 'Considerar escalado horizontal o optimización de recursos críticos',
                    'actions': [
                        'Revisar logs de errores para identificar causas',
                        'Evaluar necesidad de más instancias del servicio',
                        'Optimizar código de rutas críticas',
                        'Implementar circuit breakers para servicios externos',
                    ],
                })
            
            # Recomendación 2: Aumento de latencia
            if latency_increase > 100:  # Más de 100ms de aumento
                recommendations.append({
                    'priority': 'MEDIUM',
                    'category': 'Performance',
                    'issue': f'Aumento significativo de latencia ({latency_increase:.1f}ms)',
                    'description': f'La latencia p95 aumenta de {first_level["latency_p95"]["avg"]:.1f}ms a {last_level["latency_p95"]["avg"]:.1f}ms',
                    'recommendation': 'Optimizar procesamiento o implementar caché',
                    'actions': [
                        'Identificar cuellos de botella en el código',
                        'Implementar caché de resultados frecuentes',
                        'Considerar procesamiento asíncrono',
                        'Revisar configuración de base de datos',
                    ],
                })
            
            # Recomendación 3: Punto de saturación
            for users in reversed(user_levels):
                level = comparison_by_users[users]
                if level['success_rate']['avg'] < 95:
                    recommendations.append({
                        'priority': 'HIGH',
                        'category': 'Capacity',
                        'issue': f'Punto de saturación identificado en {users} usuarios',
                        'description': f'La tasa de éxito cae por debajo del 95% con {users} usuarios concurrentes',
                        'recommendation': f'El sistema requiere escalado antes de alcanzar {users} usuarios',
                        'actions': [
                            f'Planificar escalado horizontal para soportar >{int(users * 0.8)} usuarios',
                            'Implementar auto-scaling basado en métricas',
                            'Considerar balanceador de carga',
                            'Revisar límites de recursos (CPU, memoria, conexiones)',
                        ],
                    })
                    break
        
        # Recomendación 4: Variabilidad en resultados
        for users, level in comparison_by_users.items():
            if level['success_rate']['stdev'] > 5:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'category': 'Stability',
                    'issue': f'Alta variabilidad en resultados con {users} usuarios',
                    'description': f'Desviación estándar de {level["success_rate"]["stdev"]:.1f}% en tasa de éxito',
                    'recommendation': 'Investigar causas de inconsistencia',
                    'actions': [
                        'Revisar condiciones de red durante pruebas',
                        'Verificar estabilidad de servicios externos',
                        'Analizar logs para patrones de errores intermitentes',
                        'Considerar implementar retry logic más robusto',
                    ],
                })
                break
        
        # Recomendación 5: Throughput
        if user_levels:
            max_users = max(user_levels)
            max_level = comparison_by_users[max_users]
            if max_level['throughput']['avg'] > 0:
                recommendations.append({
                    'priority': 'LOW',
                    'category': 'Optimization',
                    'issue': f'Throughput observado: {max_level["throughput"]["avg"]:.1f} req/s',
                    'description': f'El sistema maneja {max_level["throughput"]["avg"]:.1f} requests por segundo con {max_users} usuarios',
                    'recommendation': 'Evaluar si el throughput es suficiente para necesidades futuras',
                    'actions': [
                        'Comparar throughput observado con requisitos de negocio',
                        'Planificar capacidad para crecimiento esperado',
                        'Considerar optimizaciones adicionales si es necesario',
                    ],
                })
        
        return recommendations

    def generate_report(
        self,
        comparison: Dict,
        output_file: Optional[str] = None
    ) -> Path:
        """Genera y guarda un reporte de comparación"""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"scalability_comparison_{timestamp}.json"
        
        filepath = Path(output_file)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(comparison, f, indent=2, ensure_ascii=False)
        
        return filepath

    def print_summary(self, comparison: Dict):
        """Imprime un resumen de la comparación"""
        print("\n" + "="*70)
        print("RESUMEN DE COMPARACIÓN")
        print("="*70)
        
        metadata = comparison.get('metadata', {})
        print(f"\nReportes comparados: {metadata.get('total_reports', 0)}")
        print(f"Tipos: {', '.join(metadata.get('report_types', []))}")
        
        comp = comparison.get('comparison', {})
        if comp:
            print(f"\nComparación por Nivel de Usuarios:")
            print("-" * 70)
            for users in sorted(comp.keys()):
                level = comp[users]
                print(f"\n{users} usuarios:")
                print(f"  Tasa de éxito: {level['success_rate']['avg']:.2f}% "
                      f"(min: {level['success_rate']['min']:.2f}%, "
                      f"max: {level['success_rate']['max']:.2f}%)")
                if level['latency_p95']['avg'] > 0:
                    print(f"  Latencia p95: {level['latency_p95']['avg']:.2f}ms "
                          f"(min: {level['latency_p95']['min']:.2f}ms, "
                          f"max: {level['latency_p95']['max']:.2f}ms)")
                if level['throughput']['avg'] > 0:
                    print(f"  Throughput: {level['throughput']['avg']:.2f} req/s "
                          f"(min: {level['throughput']['min']:.2f}, "
                          f"max: {level['throughput']['max']:.2f})")
        
        recommendations = comparison.get('recommendations', [])
        if recommendations:
            print(f"\n{'='*70}")
            print("RECOMENDACIONES")
            print("="*70)
            
            for i, rec in enumerate(recommendations, 1):
                print(f"\n[{rec.get('priority', 'UNKNOWN')}] {rec.get('category', 'General')}")
                print(f"  Problema: {rec.get('issue', 'N/A')}")
                print(f"  Descripción: {rec.get('description', 'N/A')}")
                print(f"  Recomendación: {rec.get('recommendation', 'N/A')}")
                if rec.get('actions'):
                    print(f"  Acciones:")
                    for action in rec['actions']:
                        print(f"    - {action}")
        
        print("\n" + "="*70)


def main():
    parser = argparse.ArgumentParser(
        description='Análisis Comparativo de Resultados de Escalabilidad - Fase 7.4'
    )
    parser.add_argument(
        'reports',
        nargs='+',
        help='Rutas a los archivos de reporte JSON a comparar'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Archivo de salida para el reporte de comparación (default: auto-generado)'
    )
    
    args = parser.parse_args()
    
    comparator = ScalabilityResultsComparator()
    
    try:
        # Cargar reportes
        print(f"Cargando {len(args.reports)} reporte(s)...")
        reports = []
        for report_path in args.reports:
            try:
                report = comparator.load_report(report_path)
                reports.append(report)
                print(f"  ✓ Cargado: {report_path}")
            except Exception as e:
                print(f"  ✗ Error al cargar {report_path}: {e}", file=sys.stderr)
        
        if len(reports) < 2:
            print("Error: Se requieren al menos 2 reportes válidos para comparar", file=sys.stderr)
            sys.exit(1)
        
        # Comparar reportes
        print("\nComparando reportes...")
        comparison = comparator.compare_reports(reports)
        
        # Generar y guardar reporte
        output_path = comparator.generate_report(comparison, args.output)
        print(f"\n✓ Reporte de comparación guardado en: {output_path}")
        
        # Imprimir resumen
        comparator.print_summary(comparison)
        
    except Exception as e:
        print(f"\nError durante la comparación: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

