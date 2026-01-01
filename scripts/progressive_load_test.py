#!/usr/bin/env python3
"""
Script de Pruebas de Carga Progresiva - Fase 7.4
Ejecuta una serie de pruebas de carga incrementales para identificar
puntos de saturación y límites del sistema.
"""

import json
import time
import sys
import argparse
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
import subprocess
import os


class ProgressiveLoadTest:
    """Orquesta pruebas de carga progresivas para identificar límites"""

    def __init__(self, output_dir: str = "progressive_load_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.results: List[Dict] = []
        self.baseline_metrics: Optional[Dict] = None

    def collect_baseline(self, duration_seconds: int = 60) -> Dict:
        """Recopila métricas baseline antes de las pruebas"""
        print("\n" + "="*70)
        print("RECOPILANDO MÉTRICAS BASELINE")
        print("="*70)
        print(f"Monitoreando sistema durante {duration_seconds} segundos...")
        
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    'scripts/scalability_monitoring.py',
                    '--duration', str(duration_seconds),
                    '--interval', '5',
                    '--output-dir', str(self.output_dir / 'baseline'),
                ],
                capture_output=True,
                text=True,
                timeout=duration_seconds + 10
            )
            
            # Buscar el archivo de reporte generado
            baseline_dir = self.output_dir / 'baseline'
            if baseline_dir.exists():
                report_files = list(baseline_dir.glob('scalability_monitoring_*.json'))
                if report_files:
                    with open(report_files[-1], 'r', encoding='utf-8') as f:
                        baseline_data = json.load(f)
                        self.baseline_metrics = baseline_data.get('summary', {})
                        print("✓ Baseline recopilado exitosamente")
                        return self.baseline_metrics
            
            print("⚠ No se pudo recopilar baseline completo")
            return {}
            
        except Exception as e:
            print(f"⚠ Error al recopilar baseline: {e}")
            return {}

    def run_load_test(
        self,
        test_name: str,
        url: str,
        num_users: int,
        requests_per_user: int,
        ramp_up_seconds: int = 10,
        method: str = 'GET',
        wait_between_tests: int = 30
    ) -> Dict:
        """Ejecuta una prueba de carga individual"""
        print(f"\n{'='*70}")
        print(f"PRUEBA: {test_name}")
        print(f"{'='*70}")
        print(f"Usuarios: {num_users} | Requests por usuario: {requests_per_user}")
        print(f"Total estimado: {num_users * requests_per_user} requests")
        
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    'scripts/load_simulation.py',
                    '--url', url,
                    '--scenario', 'custom',
                    '--users', str(num_users),
                    '--requests-per-user', str(requests_per_user),
                    '--ramp-up', str(ramp_up_seconds),
                    '--method', method,
                    '--output-dir', str(self.output_dir / 'load_tests'),
                ],
                capture_output=True,
                text=True,
                timeout=3600  # 1 hora máximo
            )
            
            # Buscar el archivo de reporte generado
            load_tests_dir = self.output_dir / 'load_tests'
            if load_tests_dir.exists():
                report_files = list(load_tests_dir.glob('load_simulation_*.json'))
                if report_files:
                    with open(report_files[-1], 'r', encoding='utf-8') as f:
                        test_data = json.load(f)
                        
                        # Extraer resultados del primer escenario
                        if test_data.get('scenarios'):
                            scenario = test_data['scenarios'][0]
                            result_data = {
                                'test_name': test_name,
                                'timestamp': datetime.now().isoformat(),
                                'config': {
                                    'num_users': num_users,
                                    'requests_per_user': requests_per_user,
                                    'total_requests': num_users * requests_per_user,
                                },
                                'statistics': scenario.get('statistics', {}),
                            }
                            
                            print(f"✓ Prueba completada")
                            stats = result_data['statistics']
                            if stats:
                                print(f"  Éxito: {stats.get('success_rate', 0):.2f}%")
                                if 'response_time' in stats:
                                    print(f"  Latencia p95: {stats['response_time'].get('p95_ms', 0):.2f} ms")
                            
                            return result_data
            
            print("⚠ No se pudo obtener resultados de la prueba")
            return {}
            
        except subprocess.TimeoutExpired:
            print("⚠ Prueba excedió el tiempo límite")
            return {}
        except Exception as e:
            print(f"⚠ Error en la prueba: {e}")
            return {}

    def run_stress_test(
        self,
        test_name: str,
        url: str,
        num_users: int,
        duration_seconds: int,
        requests_per_second: float = 0,
        method: str = 'GET',
        wait_between_tests: int = 60
    ) -> Dict:
        """Ejecuta una prueba de estrés individual"""
        print(f"\n{'='*70}")
        print(f"PRUEBA DE ESTRÉS: {test_name}")
        print(f"{'='*70}")
        print(f"Usuarios: {num_users} | Duración: {duration_seconds}s")
        
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    'scripts/stress_test.py',
                    '--url', url,
                    '--scenario', 'custom',
                    '--users', str(num_users),
                    '--duration', str(duration_seconds),
                    '--rps', str(requests_per_second),
                    '--method', method,
                    '--output-dir', str(self.output_dir / 'stress_tests'),
                ],
                capture_output=True,
                text=True,
                timeout=duration_seconds + 300  # Duración + margen
            )
            
            # Buscar el archivo de reporte generado
            stress_tests_dir = self.output_dir / 'stress_tests'
            if stress_tests_dir.exists():
                report_files = list(stress_tests_dir.glob('stress_test_*.json'))
                if report_files:
                    with open(report_files[-1], 'r', encoding='utf-8') as f:
                        test_data = json.load(f)
                        
                        # Extraer resultados del primer escenario
                        if test_data.get('scenarios'):
                            scenario = test_data['scenarios'][0]
                            result_data = {
                                'test_name': test_name,
                                'test_type': 'stress',
                                'timestamp': datetime.now().isoformat(),
                                'config': scenario.get('scenario_config', {}),
                                'statistics': scenario.get('statistics', {}),
                            }
                            
                            print(f"✓ Prueba de estrés completada")
                            stats = result_data['statistics']
                            if stats:
                                print(f"  Éxito: {stats.get('success_rate', 0):.2f}%")
                                if 'throughput' in stats:
                                    print(f"  Throughput: {stats['throughput'].get('requests_per_second', 0):.2f} req/s")
                            
                            return result_data
            
            print("⚠ No se pudo obtener resultados de la prueba de estrés")
            return {}
            
        except subprocess.TimeoutExpired:
            print("⚠ Prueba de estrés excedió el tiempo límite")
            return {}
        except Exception as e:
            print(f"⚠ Error en la prueba de estrés: {e}")
            return {}

    def run_progressive_sequence(
        self,
        url: str,
        sequence_type: str = 'load',
        start_users: int = 10,
        max_users: int = 1000,
        multiplier: float = 1.5,
        requests_per_user: int = 20,
        stress_duration: int = 60,
        stop_on_degradation: bool = True,
        degradation_threshold: float = 0.20,  # 20% de degradación
        method: str = 'GET'
    ) -> List[Dict]:
        """
        Ejecuta una secuencia progresiva de pruebas
        
        Args:
            url: URL del endpoint a probar
            sequence_type: 'load' o 'stress'
            start_users: Número inicial de usuarios
            max_users: Número máximo de usuarios
            multiplier: Factor de incremento entre pruebas
            requests_per_user: Requests por usuario (para load tests)
            stress_duration: Duración en segundos (para stress tests)
            stop_on_degradation: Detener si se detecta degradación significativa
            degradation_threshold: Umbral de degradación para detener (0.20 = 20%)
            method: Método HTTP
        """
        print("\n" + "="*70)
        print("INICIANDO SECUENCIA PROGRESIVA DE PRUEBAS")
        print("="*70)
        print(f"Tipo: {sequence_type}")
        print(f"Rango: {start_users} - {max_users} usuarios")
        print(f"Multiplicador: {multiplier}x")
        print()
        
        sequence_results = []
        current_users = start_users
        previous_success_rate = 100.0
        previous_latency_p95 = 0
        
        test_number = 1
        
        while current_users <= max_users:
            test_name = f"Test-{test_number:02d}-{current_users}users"
            
            if sequence_type == 'load':
                result = self.run_load_test(
                    test_name=test_name,
                    url=url,
                    num_users=current_users,
                    requests_per_user=requests_per_user,
                    method=method
                )
            else:  # stress
                result = self.run_stress_test(
                    test_name=test_name,
                    url=url,
                    num_users=current_users,
                    duration_seconds=stress_duration,
                    method=method
                )
            
            if result and result.get('statistics'):
                stats = result['statistics']
                current_success_rate = stats.get('success_rate', 0)
                current_latency_p95 = 0
                
                if 'response_time' in stats:
                    current_latency_p95 = stats['response_time'].get('p95_ms', 0)
                
                # Verificar degradación
                if stop_on_degradation and test_number > 1:
                    success_degradation = previous_success_rate - current_success_rate
                    latency_increase = 0
                    
                    if previous_latency_p95 > 0 and current_latency_p95 > 0:
                        latency_increase = (current_latency_p95 - previous_latency_p95) / previous_latency_p95
                    
                    if success_degradation > degradation_threshold * 100:
                        print(f"\n⚠ Degradación detectada: Tasa de éxito cayó {success_degradation:.1f}%")
                        print(f"  Deteniendo secuencia progresiva")
                        break
                    
                    if latency_increase > degradation_threshold:
                        print(f"\n⚠ Degradación detectada: Latencia aumentó {latency_increase*100:.1f}%")
                        print(f"  Deteniendo secuencia progresiva")
                        break
                
                sequence_results.append(result)
                previous_success_rate = current_success_rate
                previous_latency_p95 = current_latency_p95
                
                # Esperar entre pruebas para estabilizar el sistema
                if current_users < max_users:
                    wait_time = 30 if sequence_type == 'load' else 60
                    print(f"\nEsperando {wait_time} segundos antes de la siguiente prueba...")
                    time.sleep(wait_time)
            else:
                print(f"⚠ Prueba falló o no produjo resultados válidos")
                if stop_on_degradation:
                    print(f"  Deteniendo secuencia progresiva")
                    break
            
            # Incrementar usuarios para la siguiente prueba
            current_users = int(current_users * multiplier)
            test_number += 1
        
        return sequence_results

    def analyze_results(self, results: List[Dict]) -> Dict:
        """Analiza los resultados de la secuencia progresiva"""
        if not results:
            return {}
        
        analysis = {
            'total_tests': len(results),
            'saturation_point': None,
            'max_sustainable_users': None,
            'performance_trends': {},
        }
        
        # Encontrar punto de saturación
        for i, result in enumerate(results):
            stats = result.get('statistics', {})
            success_rate = stats.get('success_rate', 100)
            
            if success_rate < 95.0:  # Considerar saturado si éxito < 95%
                analysis['saturation_point'] = {
                    'test_index': i,
                    'test_name': result.get('test_name', 'unknown'),
                    'users': result.get('config', {}).get('num_users', 0),
                    'success_rate': success_rate,
                }
                break
        
        # Encontrar máximo sostenible (último test con éxito > 99%)
        for result in reversed(results):
            stats = result.get('statistics', {})
            success_rate = stats.get('success_rate', 100)
            
            if success_rate >= 99.0:
                analysis['max_sustainable_users'] = {
                    'test_name': result.get('test_name', 'unknown'),
                    'users': result.get('config', {}).get('num_users', 0),
                    'success_rate': success_rate,
                }
                break
        
        # Calcular tendencias de rendimiento
        if len(results) > 1:
            latencies = []
            success_rates = []
            throughputs = []
            
            for result in results:
                stats = result.get('statistics', {})
                if 'response_time' in stats:
                    latencies.append(stats['response_time'].get('p95_ms', 0))
                success_rates.append(stats.get('success_rate', 100))
                if 'throughput' in stats:
                    throughputs.append(stats['throughput'].get('requests_per_second', 0))
            
            analysis['performance_trends'] = {
                'latency_trend': 'increasing' if latencies[-1] > latencies[0] else 'stable' if abs(latencies[-1] - latencies[0]) < 10 else 'decreasing',
                'success_rate_trend': 'decreasing' if success_rates[-1] < success_rates[0] else 'stable',
                'throughput_trend': 'increasing' if throughputs and throughputs[-1] > throughputs[0] else 'stable' if not throughputs or abs(throughputs[-1] - throughputs[0]) < 5 else 'decreasing',
            }
        
        return analysis

    def generate_report(self, results: List[Dict], analysis: Dict) -> Dict:
        """Genera reporte completo de la secuencia progresiva"""
        return {
            'metadata': {
                'report_type': 'progressive_load_test',
                'phase': '7.4',
                'generated_at': datetime.now().isoformat(),
                'total_tests': len(results),
            },
            'baseline': self.baseline_metrics,
            'analysis': analysis,
            'test_results': results,
        }

    def save_report(self, report: Dict, filename: Optional[str] = None) -> Path:
        """Guarda el reporte en un archivo JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"progressive_load_test_{timestamp}.json"
        
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\nReporte guardado en: {filepath}")
        return filepath

    def print_summary(self, analysis: Dict):
        """Imprime un resumen del análisis"""
        print("\n" + "="*70)
        print("RESUMEN DE ANÁLISIS")
        print("="*70)
        
        if analysis.get('max_sustainable_users'):
            max_sust = analysis['max_sustainable_users']
            print(f"\nMáximo Sostenible:")
            print(f"  Usuarios: {max_sust.get('users', 0)}")
            print(f"  Tasa de éxito: {max_sust.get('success_rate', 0):.2f}%")
        
        if analysis.get('saturation_point'):
            sat_point = analysis['saturation_point']
            print(f"\nPunto de Saturación:")
            print(f"  Test: {sat_point.get('test_name', 'unknown')}")
            print(f"  Usuarios: {sat_point.get('users', 0)}")
            print(f"  Tasa de éxito: {sat_point.get('success_rate', 0):.2f}%")
        
        if analysis.get('performance_trends'):
            trends = analysis['performance_trends']
            print(f"\nTendencias de Rendimiento:")
            print(f"  Latencia: {trends.get('latency_trend', 'unknown')}")
            print(f"  Tasa de éxito: {trends.get('success_rate_trend', 'unknown')}")
            print(f"  Throughput: {trends.get('throughput_trend', 'unknown')}")
        
        print("="*70)


def main():
    parser = argparse.ArgumentParser(
        description='Pruebas de Carga Progresiva - Fase 7.4'
    )
    parser.add_argument(
        '--url',
        type=str,
        required=True,
        help='URL del endpoint a probar'
    )
    parser.add_argument(
        '--type',
        type=str,
        choices=['load', 'stress'],
        default='load',
        help='Tipo de pruebas: load (carga incremental) o stress (estrés sostenido)'
    )
    parser.add_argument(
        '--start-users',
        type=int,
        default=10,
        help='Número inicial de usuarios (default: 10)'
    )
    parser.add_argument(
        '--max-users',
        type=int,
        default=1000,
        help='Número máximo de usuarios (default: 1000)'
    )
    parser.add_argument(
        '--multiplier',
        type=float,
        default=1.5,
        help='Factor de incremento entre pruebas (default: 1.5)'
    )
    parser.add_argument(
        '--requests-per-user',
        type=int,
        default=20,
        help='Requests por usuario para load tests (default: 20)'
    )
    parser.add_argument(
        '--stress-duration',
        type=int,
        default=60,
        help='Duración en segundos para stress tests (default: 60)'
    )
    parser.add_argument(
        '--baseline',
        action='store_true',
        help='Recopilar métricas baseline antes de las pruebas'
    )
    parser.add_argument(
        '--stop-on-degradation',
        action='store_true',
        default=True,
        help='Detener secuencia si se detecta degradación (default: True)'
    )
    parser.add_argument(
        '--method',
        type=str,
        default='GET',
        choices=['GET', 'POST', 'PUT', 'DELETE'],
        help='Método HTTP (default: GET)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='progressive_load_reports',
        help='Directorio para guardar reportes (default: progressive_load_reports)'
    )
    parser.add_argument(
        '--output-file',
        type=str,
        default=None,
        help='Nombre del archivo de salida (default: auto-generado)'
    )
    
    args = parser.parse_args()
    
    tester = ProgressiveLoadTest(output_dir=args.output_dir)
    
    try:
        # Recopilar baseline si se solicita
        if args.baseline:
            tester.collect_baseline(duration_seconds=60)
        
        # Ejecutar secuencia progresiva
        results = tester.run_progressive_sequence(
            url=args.url,
            sequence_type=args.type,
            start_users=args.start_users,
            max_users=args.max_users,
            multiplier=args.multiplier,
            requests_per_user=args.requests_per_user,
            stress_duration=args.stress_duration,
            stop_on_degradation=args.stop_on_degradation,
            method=args.method
        )
        
        # Analizar resultados
        analysis = tester.analyze_results(results)
        
        # Generar y guardar reporte
        report = tester.generate_report(results, analysis)
        filepath = tester.save_report(report, args.output_file)
        
        # Imprimir resumen
        tester.print_summary(analysis)
        
        print(f"\n✓ Secuencia progresiva completada exitosamente")
        print(f"  Reporte guardado en: {filepath}")
        
    except KeyboardInterrupt:
        print("\n\nSecuencia progresiva interrumpida por el usuario")
        if tester.results:
            print("Generando reporte con datos recopilados hasta ahora...")
            analysis = tester.analyze_results(tester.results)
            report = tester.generate_report(tester.results, analysis)
            filepath = tester.save_report(report, args.output_file)
            tester.print_summary(analysis)
            print(f"\nReporte parcial guardado en: {filepath}")
    except Exception as e:
        print(f"\nError durante la secuencia progresiva: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

