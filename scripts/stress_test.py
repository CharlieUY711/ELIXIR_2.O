#!/usr/bin/env python3
"""
Script de Pruebas de Estrés - Fase 7.4
Ejecuta pruebas de estrés extremas para verificar la estabilidad del sistema
bajo condiciones extremas y encontrar los límites del sistema.
"""

import json
import time
import sys
import argparse
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
import statistics
import subprocess
import threading


class StressTest:
    """Ejecuta pruebas de estrés extremas para encontrar límites del sistema"""

    def __init__(self, output_dir: str = "stress_test_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.results: List[Dict] = []
        self.monitoring_active = False
        self.monitoring_process = None

    async def make_request(
        self,
        session: aiohttp.ClientSession,
        url: str,
        method: str = 'GET',
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict:
        """Realiza una request HTTP y mide el tiempo de respuesta"""
        start_time = time.time()
        status_code = None
        error = None
        
        try:
            async with session.request(
                method=method,
                url=url,
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=60)  # Timeout más largo para estrés
            ) as response:
                status_code = response.status
                response_text = await response.text()
                elapsed = time.time() - start_time
                
                return {
                    'success': 200 <= status_code < 300,
                    'status_code': status_code,
                    'response_time_ms': elapsed * 1000,
                    'response_size_bytes': len(response_text.encode('utf-8')),
                    'error': None,
                    'timestamp': datetime.now().isoformat(),
                }
        except asyncio.TimeoutError:
            elapsed = time.time() - start_time
            return {
                'success': False,
                'status_code': None,
                'response_time_ms': elapsed * 1000,
                'response_size_bytes': 0,
                'error': 'timeout',
                'timestamp': datetime.now().isoformat(),
            }
        except Exception as e:
            elapsed = time.time() - start_time
            return {
                'success': False,
                'status_code': None,
                'response_time_ms': elapsed * 1000,
                'response_size_bytes': 0,
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
            }

    async def stress_test_scenario(
        self,
        scenario_name: str,
        url: str,
        num_users: int,
        duration_seconds: int,
        requests_per_second: float,
        method: str = 'GET',
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict:
        """
        Ejecuta un escenario de estrés con carga sostenida
        
        Args:
            scenario_name: Nombre del escenario
            url: URL del endpoint a probar
            num_users: Número de usuarios concurrentes
            duration_seconds: Duración del test en segundos
            requests_per_second: Tasa objetivo de requests por segundo
            method: Método HTTP
            data: Datos para POST/PUT
            headers: Headers HTTP
        """
        print(f"\n{'='*70}")
        print(f"ESCENARIO DE ESTRÉS: {scenario_name}")
        print(f"{'='*70}")
        print(f"Usuarios concurrentes: {num_users}")
        print(f"Duración: {duration_seconds} segundos")
        print(f"Tasa objetivo: {requests_per_second:.2f} req/s")
        print(f"Total estimado: ~{int(requests_per_second * duration_seconds)} requests")
        print()
        
        all_results = []
        start_time = time.time()
        request_count = 0
        last_report_time = start_time
        
        async def user_worker(user_id: int, session: aiohttp.ClientSession):
            """Worker que ejecuta requests continuamente"""
            nonlocal request_count
            user_results = []
            end_time = start_time + duration_seconds
            
            while time.time() < end_time:
                result = await self.make_request(session, url, method, data, headers)
                result['user_id'] = user_id
                result['request_id'] = request_count
                user_results.append(result)
                request_count += 1
                
                # Controlar tasa de requests
                if requests_per_second > 0:
                    delay = 1.0 / requests_per_second
                    await asyncio.sleep(delay)
                else:
                    # Sin límite, máximo throughput
                    await asyncio.sleep(0)
            
            return user_results
        
        # Crear sesiones y workers
        tasks = []
        async with aiohttp.ClientSession() as session:
            for user_id in range(num_users):
                task = asyncio.create_task(user_worker(user_id, session))
                tasks.append(task)
            
            # Reporte periódico durante la ejecución
            async def reporter():
                while time.time() < start_time + duration_seconds:
                    await asyncio.sleep(5)  # Reportar cada 5 segundos
                    elapsed = time.time() - start_time
                    current_rps = request_count / elapsed if elapsed > 0 else 0
                    print(f"  [{elapsed:.1f}s] Requests: {request_count} | RPS: {current_rps:.2f} | "
                          f"Exitosos: {sum(1 for r in all_results if r.get('success'))} | "
                          f"Fallidos: {sum(1 for r in all_results if not r.get('success'))}")
            
            reporter_task = asyncio.create_task(reporter())
            
            # Esperar a que todos los workers terminen
            user_results_list = await asyncio.gather(*tasks)
            reporter_task.cancel()
            
            # Consolidar resultados
            for user_results in user_results_list:
                all_results.extend(user_results)
        
        elapsed = time.time() - start_time
        
        return {
            'scenario_name': scenario_name,
            'scenario_config': {
                'num_users': num_users,
                'duration_seconds': duration_seconds,
                'target_rps': requests_per_second,
                'actual_duration_seconds': elapsed,
            },
            'results': all_results,
        }

    def calculate_statistics(self, results: List[Dict]) -> Dict:
        """Calcula estadísticas detalladas de los resultados"""
        if not results:
            return {}
        
        response_times = [r['response_time_ms'] for r in results]
        successes = [r for r in results if r.get('success', False)]
        errors = [r for r in results if not r.get('success', False)]
        
        status_codes = {}
        for r in results:
            code = r.get('status_code')
            if code:
                status_codes[code] = status_codes.get(code, 0) + 1
        
        error_types = {}
        for r in errors:
            error = r.get('error', 'unknown')
            error_types[error] = error_types.get(error, 0) + 1
        
        # Análisis temporal: degradación de rendimiento
        if len(results) > 10:
            # Dividir en cuartiles temporales
            quarter_size = len(results) // 4
            q1_times = response_times[:quarter_size]
            q2_times = response_times[quarter_size:quarter_size*2]
            q3_times = response_times[quarter_size*2:quarter_size*3]
            q4_times = response_times[quarter_size*3:]
            
            temporal_degradation = {
                'q1_avg_ms': statistics.mean(q1_times) if q1_times else 0,
                'q2_avg_ms': statistics.mean(q2_times) if q2_times else 0,
                'q3_avg_ms': statistics.mean(q3_times) if q3_times else 0,
                'q4_avg_ms': statistics.mean(q4_times) if q4_times else 0,
            }
        else:
            temporal_degradation = {}
        
        if response_times:
            sorted_times = sorted(response_times)
            n = len(sorted_times)
            p50_idx = int(n * 0.5)
            p95_idx = int(n * 0.95)
            p99_idx = int(n * 0.99)
            p999_idx = int(n * 0.999) if n > 1000 else n - 1
            
            return {
                'total_requests': len(results),
                'successful_requests': len(successes),
                'failed_requests': len(errors),
                'success_rate': len(successes) / len(results) * 100 if results else 0,
                'response_time': {
                    'min_ms': min(response_times),
                    'max_ms': max(response_times),
                    'avg_ms': statistics.mean(response_times),
                    'median_ms': statistics.median(response_times),
                    'p50_ms': sorted_times[p50_idx] if p50_idx < n else sorted_times[-1],
                    'p95_ms': sorted_times[p95_idx] if p95_idx < n else sorted_times[-1],
                    'p99_ms': sorted_times[p99_idx] if p99_idx < n else sorted_times[-1],
                    'p999_ms': sorted_times[p999_idx] if p999_idx < n else sorted_times[-1],
                    'stdev_ms': statistics.stdev(response_times) if len(response_times) > 1 else 0,
                },
                'throughput': {
                    'requests_per_second': len(results) / max(1, sum(r['response_time_ms'] for r in results) / 1000),
                    'successful_per_second': len(successes) / max(1, sum(r['response_time_ms'] for r in results) / 1000),
                },
                'status_codes': status_codes,
                'error_types': error_types,
                'temporal_degradation': temporal_degradation,
            }
        else:
            return {
                'total_requests': 0,
                'successful_requests': 0,
                'failed_requests': 0,
                'success_rate': 0,
            }

    async def run_stress_test(
        self,
        scenario_name: str,
        url: str,
        num_users: int,
        duration_seconds: int,
        requests_per_second: float = 0,  # 0 = máximo throughput
        method: str = 'GET',
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        monitor_resources: bool = False
    ) -> Dict:
        """Ejecuta una prueba de estrés completa"""
        
        # Iniciar monitoreo de recursos si se solicita
        if monitor_resources:
            self.start_monitoring(duration_seconds + 10)
        
        try:
            scenario_result = await self.stress_test_scenario(
                scenario_name=scenario_name,
                url=url,
                num_users=num_users,
                duration_seconds=duration_seconds,
                requests_per_second=requests_per_second,
                method=method,
                data=data,
                headers=headers
            )
            
            statistics = self.calculate_statistics(scenario_result['results'])
            
            result = {
                'scenario_name': scenario_name,
                'timestamp': datetime.now().isoformat(),
                'scenario_config': scenario_result['scenario_config'],
                'statistics': statistics,
            }
            
            self.results.append(result)
            
            # Imprimir resumen
            print(f"\n{'='*70}")
            print(f"RESULTADOS DEL ESCENARIO: {scenario_name}")
            print(f"{'='*70}")
            print(f"Total de requests: {statistics.get('total_requests', 0)}")
            print(f"Requests exitosos: {statistics.get('successful_requests', 0)}")
            print(f"Requests fallidos: {statistics.get('failed_requests', 0)}")
            print(f"Tasa de éxito: {statistics.get('success_rate', 0):.2f}%")
            
            if 'response_time' in statistics:
                rt = statistics['response_time']
                print(f"\nLatencia:")
                print(f"  Promedio: {rt.get('avg_ms', 0):.2f} ms")
                print(f"  Mediana: {rt.get('median_ms', 0):.2f} ms")
                print(f"  p50: {rt.get('p50_ms', 0):.2f} ms")
                print(f"  p95: {rt.get('p95_ms', 0):.2f} ms")
                print(f"  p99: {rt.get('p99_ms', 0):.2f} ms")
                if 'p999_ms' in rt:
                    print(f"  p99.9: {rt.get('p999_ms', 0):.2f} ms")
            
            if 'throughput' in statistics:
                print(f"\nThroughput:")
                print(f"  Total: {statistics['throughput'].get('requests_per_second', 0):.2f} req/s")
                print(f"  Exitosos: {statistics['throughput'].get('successful_per_second', 0):.2f} req/s")
            
            if 'temporal_degradation' in statistics and statistics['temporal_degradation']:
                td = statistics['temporal_degradation']
                print(f"\nDegradación Temporal:")
                print(f"  Q1 (inicio): {td.get('q1_avg_ms', 0):.2f} ms")
                print(f"  Q2: {td.get('q2_avg_ms', 0):.2f} ms")
                print(f"  Q3: {td.get('q3_avg_ms', 0):.2f} ms")
                print(f"  Q4 (final): {td.get('q4_avg_ms', 0):.2f} ms")
                degradation = ((td.get('q4_avg_ms', 0) - td.get('q1_avg_ms', 0)) / 
                              max(1, td.get('q1_avg_ms', 1))) * 100
                print(f"  Degradación: {degradation:.1f}%")
            
            if statistics.get('error_types'):
                print(f"\nTipos de Errores:")
                for error_type, count in statistics['error_types'].items():
                    print(f"  {error_type}: {count}")
            
            print(f"{'='*70}\n")
            
            return result
            
        finally:
            if monitor_resources:
                self.stop_monitoring()

    def start_monitoring(self, duration_seconds: int):
        """Inicia monitoreo de recursos en paralelo"""
        try:
            # Intentar ejecutar el script de monitoreo
            self.monitoring_process = subprocess.Popen(
                [
                    sys.executable,
                    'scripts/scalability_monitoring.py',
                    '--duration', str(duration_seconds),
                    '--interval', '5',
                    '--output-dir', str(self.output_dir / 'monitoring'),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.monitoring_active = True
            print(f"Monitoreo de recursos iniciado (PID: {self.monitoring_process.pid})")
        except Exception as e:
            print(f"Advertencia: No se pudo iniciar el monitoreo: {e}")

    def stop_monitoring(self):
        """Detiene el monitoreo de recursos"""
        if self.monitoring_process:
            try:
                self.monitoring_process.terminate()
                self.monitoring_process.wait(timeout=10)
                print("Monitoreo de recursos detenido")
            except Exception as e:
                print(f"Advertencia: Error al detener monitoreo: {e}")
            finally:
                self.monitoring_active = False
                self.monitoring_process = None

    def generate_report(self) -> Dict:
        """Genera reporte completo de todas las pruebas de estrés"""
        return {
            'metadata': {
                'report_type': 'stress_test',
                'phase': '7.4',
                'generated_at': datetime.now().isoformat(),
                'total_scenarios': len(self.results),
            },
            'scenarios': self.results,
        }

    def save_report(self, report: Dict, filename: Optional[str] = None) -> Path:
        """Guarda el reporte en un archivo JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"stress_test_{timestamp}.json"
        
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\nReporte guardado en: {filepath}")
        return filepath


async def main():
    parser = argparse.ArgumentParser(
        description='Pruebas de Estrés - Fase 7.4'
    )
    parser.add_argument(
        '--url',
        type=str,
        required=True,
        help='URL del endpoint a probar'
    )
    parser.add_argument(
        '--scenario',
        type=str,
        choices=['sustained', 'spike', 'gradual', 'burst', 'custom'],
        default='sustained',
        help='Tipo de escenario de estrés'
    )
    parser.add_argument(
        '--users',
        type=int,
        default=None,
        help='Número de usuarios concurrentes (requerido para custom)'
    )
    parser.add_argument(
        '--duration',
        type=int,
        default=300,
        help='Duración del test en segundos (default: 300)'
    )
    parser.add_argument(
        '--rps',
        type=float,
        default=0,
        help='Tasa objetivo de requests por segundo (0 = máximo throughput)'
    )
    parser.add_argument(
        '--method',
        type=str,
        default='GET',
        choices=['GET', 'POST', 'PUT', 'DELETE'],
        help='Método HTTP (default: GET)'
    )
    parser.add_argument(
        '--monitor',
        action='store_true',
        help='Monitorear recursos del sistema durante la prueba'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='stress_test_reports',
        help='Directorio para guardar reportes (default: stress_test_reports)'
    )
    parser.add_argument(
        '--output-file',
        type=str,
        default=None,
        help='Nombre del archivo de salida (default: auto-generado)'
    )
    
    args = parser.parse_args()
    
    # Definir escenarios predefinidos
    scenarios = {
        'sustained': {
            'num_users': 500,
            'duration_seconds': 600,  # 10 minutos
            'requests_per_second': 0,  # Máximo throughput
        },
        'spike': {
            'num_users': 1000,
            'duration_seconds': 60,  # 1 minuto de pico
            'requests_per_second': 0,
        },
        'gradual': {
            'num_users': 100,
            'duration_seconds': 900,  # 15 minutos
            'requests_per_second': 0,
        },
        'burst': {
            'num_users': 2000,
            'duration_seconds': 30,  # 30 segundos de ráfaga
            'requests_per_second': 0,
        },
    }
    
    tester = StressTest(output_dir=args.output_dir)
    
    try:
        if args.scenario == 'custom':
            if args.users is None:
                print("Error: --users es requerido para escenario custom", file=sys.stderr)
                sys.exit(1)
            scenario_config = {
                'num_users': args.users,
                'duration_seconds': args.duration,
                'requests_per_second': args.rps,
            }
        else:
            scenario_config = scenarios[args.scenario]
            if args.duration:
                scenario_config['duration_seconds'] = args.duration
            if args.rps:
                scenario_config['requests_per_second'] = args.rps
        
        result = await tester.run_stress_test(
            scenario_name=args.scenario,
            url=args.url,
            num_users=scenario_config['num_users'],
            duration_seconds=scenario_config['duration_seconds'],
            requests_per_second=scenario_config['requests_per_second'],
            method=args.method,
            monitor_resources=args.monitor
        )
        
        report = tester.generate_report()
        filepath = tester.save_report(report, args.output_file)
        
        print(f"\n✓ Prueba de estrés completada exitosamente")
        print(f"  Reporte guardado en: {filepath}")
        
    except KeyboardInterrupt:
        print("\n\nPrueba de estrés interrumpida por el usuario")
        if tester.results:
            print("Generando reporte con datos recopilados hasta ahora...")
            report = tester.generate_report()
            filepath = tester.save_report(report, args.output_file)
            print(f"\nReporte parcial guardado en: {filepath}")
        tester.stop_monitoring()
    except Exception as e:
        print(f"\nError durante la prueba de estrés: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        tester.stop_monitoring()
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())

