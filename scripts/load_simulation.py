#!/usr/bin/env python3
"""
Script de Simulación de Cargas de Trabajo - Fase 7.1
Simula diferentes escenarios de carga para evaluar la capacidad del sistema.
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
from concurrent.futures import ThreadPoolExecutor
import threading
import statistics


class LoadSimulator:
    """Simulador de cargas de trabajo para evaluación de escalabilidad"""

    def __init__(self, output_dir: str = "load_simulation_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.results: List[Dict] = []

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
                timeout=aiohttp.ClientTimeout(total=30)
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
                }
        except asyncio.TimeoutError:
            elapsed = time.time() - start_time
            return {
                'success': False,
                'status_code': None,
                'response_time_ms': elapsed * 1000,
                'response_size_bytes': 0,
                'error': 'timeout',
            }
        except Exception as e:
            elapsed = time.time() - start_time
            return {
                'success': False,
                'status_code': None,
                'response_time_ms': elapsed * 1000,
                'response_size_bytes': 0,
                'error': str(e),
            }

    async def simulate_concurrent_users(
        self,
        url: str,
        num_users: int,
        requests_per_user: int,
        ramp_up_seconds: int = 10,
        method: str = 'GET',
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict:
        """
        Simula múltiples usuarios concurrentes haciendo requests
        
        Args:
            url: URL del endpoint a probar
            num_users: Número de usuarios concurrentes
            requests_per_user: Número de requests por usuario
            ramp_up_seconds: Tiempo para alcanzar todos los usuarios (ramp-up)
            method: Método HTTP
            data: Datos para POST/PUT
            headers: Headers HTTP
        """
        print(f"Simulando {num_users} usuarios concurrentes...")
        print(f"  - Requests por usuario: {requests_per_user}")
        print(f"  - Ramp-up: {ramp_up_seconds} segundos")
        
        all_results = []
        start_time = time.time()
        
        async def user_simulation(user_id: int):
            """Simula un usuario haciendo requests"""
            user_results = []
            async with aiohttp.ClientSession() as session:
                for i in range(requests_per_user):
                    result = await self.make_request(session, url, method, data, headers)
                    result['user_id'] = user_id
                    result['request_id'] = i
                    user_results.append(result)
                    # Pequeña pausa entre requests del mismo usuario
                    await asyncio.sleep(0.1)
            return user_results
        
        # Ramp-up: iniciar usuarios gradualmente
        ramp_up_delay = ramp_up_seconds / num_users if num_users > 0 else 0
        
        tasks = []
        for user_id in range(num_users):
            # Crear tarea con delay para ramp-up
            task = asyncio.create_task(user_simulation(user_id))
            tasks.append(task)
            if user_id < num_users - 1:  # No esperar después del último usuario
                await asyncio.sleep(ramp_up_delay)
        
        # Esperar a que todos los usuarios terminen
        user_results_list = await asyncio.gather(*tasks)
        
        # Consolidar resultados
        for user_results in user_results_list:
            all_results.extend(user_results)
        
        elapsed = time.time() - start_time
        
        return {
            'scenario': {
                'num_users': num_users,
                'requests_per_user': requests_per_user,
                'total_requests': num_users * requests_per_user,
                'ramp_up_seconds': ramp_up_seconds,
                'duration_seconds': elapsed,
            },
            'results': all_results,
        }

    def calculate_statistics(self, results: List[Dict]) -> Dict:
        """Calcula estadísticas de los resultados"""
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
        
        if response_times:
            sorted_times = sorted(response_times)
            n = len(sorted_times)
            p50_idx = int(n * 0.5)
            p95_idx = int(n * 0.95)
            p99_idx = int(n * 0.99)
            
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
                    'stdev_ms': statistics.stdev(response_times) if len(response_times) > 1 else 0,
                },
                'throughput': {
                    'requests_per_second': len(results) / max(1, sum(r['response_time_ms'] for r in results) / 1000),
                },
                'status_codes': status_codes,
                'error_types': error_types,
            }
        else:
            return {
                'total_requests': 0,
                'successful_requests': 0,
                'failed_requests': 0,
                'success_rate': 0,
            }

    async def run_scenario(
        self,
        scenario_name: str,
        url: str,
        num_users: int,
        requests_per_user: int,
        ramp_up_seconds: int = 10,
        method: str = 'GET',
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict:
        """Ejecuta un escenario de carga completo"""
        print(f"\n{'='*60}")
        print(f"ESCENARIO: {scenario_name}")
        print(f"{'='*60}")
        
        scenario_result = await self.simulate_concurrent_users(
            url=url,
            num_users=num_users,
            requests_per_user=requests_per_user,
            ramp_up_seconds=ramp_up_seconds,
            method=method,
            data=data,
            headers=headers
        )
        
        statistics = self.calculate_statistics(scenario_result['results'])
        
        result = {
            'scenario_name': scenario_name,
            'timestamp': datetime.now().isoformat(),
            'scenario': scenario_result['scenario'],
            'statistics': statistics,
            'raw_results': scenario_result['results'],  # Opcional: puede ser muy grande
        }
        
        self.results.append(result)
        
        # Imprimir resumen
        print(f"\nResultados del escenario '{scenario_name}':")
        print(f"  Total de requests: {statistics.get('total_requests', 0)}")
        print(f"  Requests exitosos: {statistics.get('successful_requests', 0)}")
        print(f"  Requests fallidos: {statistics.get('failed_requests', 0)}")
        print(f"  Tasa de éxito: {statistics.get('success_rate', 0):.2f}%")
        
        if 'response_time' in statistics:
            rt = statistics['response_time']
            print(f"  Latencia:")
            print(f"    Promedio: {rt.get('avg_ms', 0):.2f} ms")
            print(f"    p50: {rt.get('p50_ms', 0):.2f} ms")
            print(f"    p95: {rt.get('p95_ms', 0):.2f} ms")
            print(f"    p99: {rt.get('p99_ms', 0):.2f} ms")
        
        if 'throughput' in statistics:
            print(f"  Throughput: {statistics['throughput'].get('requests_per_second', 0):.2f} req/s")
        
        return result

    def generate_report(self) -> Dict:
        """Genera reporte completo de todos los escenarios"""
        return {
            'metadata': {
                'report_type': 'load_simulation',
                'phase': '7.1',
                'generated_at': datetime.now().isoformat(),
                'total_scenarios': len(self.results),
            },
            'scenarios': self.results,
        }

    def save_report(self, report: Dict, filename: Optional[str] = None, include_raw: bool = False) -> Path:
        """Guarda el reporte en un archivo JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"load_simulation_{timestamp}.json"
        
        # Remover resultados raw si no se solicitan (pueden ser muy grandes)
        if not include_raw:
            for scenario in report.get('scenarios', []):
                if 'raw_results' in scenario:
                    del scenario['raw_results']
        
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\nReporte guardado en: {filepath}")
        return filepath


async def main():
    parser = argparse.ArgumentParser(
        description='Simulación de cargas de trabajo - Fase 7.1'
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
        choices=['normal', 'medium', 'high', 'extreme', 'custom'],
        default='normal',
        help='Escenario de carga a ejecutar'
    )
    parser.add_argument(
        '--users',
        type=int,
        default=None,
        help='Número de usuarios concurrentes (para escenario custom)'
    )
    parser.add_argument(
        '--requests-per-user',
        type=int,
        default=None,
        help='Número de requests por usuario (para escenario custom)'
    )
    parser.add_argument(
        '--ramp-up',
        type=int,
        default=10,
        help='Tiempo de ramp-up en segundos (default: 10)'
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
        default='load_simulation_reports',
        help='Directorio para guardar reportes (default: load_simulation_reports)'
    )
    parser.add_argument(
        '--output-file',
        type=str,
        default=None,
        help='Nombre del archivo de salida (default: auto-generado)'
    )
    parser.add_argument(
        '--include-raw',
        action='store_true',
        help='Incluir resultados raw en el reporte (puede ser muy grande)'
    )
    
    args = parser.parse_args()
    
    # Definir escenarios predefinidos
    scenarios = {
        'normal': {
            'num_users': 10,
            'requests_per_user': 10,
        },
        'medium': {
            'num_users': 50,
            'requests_per_user': 20,
        },
        'high': {
            'num_users': 200,
            'requests_per_user': 50,
        },
        'extreme': {
            'num_users': 1000,
            'requests_per_user': 100,
        },
    }
    
    simulator = LoadSimulator(output_dir=args.output_dir)
    
    try:
        if args.scenario == 'custom':
            if args.users is None or args.requests_per_user is None:
                print("Error: --users y --requests-per-user son requeridos para escenario custom", file=sys.stderr)
                sys.exit(1)
            scenario_config = {
                'num_users': args.users,
                'requests_per_user': args.requests_per_user,
            }
        else:
            scenario_config = scenarios[args.scenario]
        
        result = await simulator.run_scenario(
            scenario_name=args.scenario,
            url=args.url,
            num_users=scenario_config['num_users'],
            requests_per_user=scenario_config['requests_per_user'],
            ramp_up_seconds=args.ramp_up,
            method=args.method,
        )
        
        report = simulator.generate_report()
        filepath = simulator.save_report(report, args.output_file, args.include_raw)
        
        print(f"\n✓ Simulación completada exitosamente")
        print(f"  Reporte guardado en: {filepath}")
        
    except KeyboardInterrupt:
        print("\n\nSimulación interrumpida por el usuario")
        if simulator.results:
            print("Generando reporte con datos recopilados hasta ahora...")
            report = simulator.generate_report()
            filepath = simulator.save_report(report, args.output_file, args.include_raw)
            print(f"\nReporte parcial guardado en: {filepath}")
    except Exception as e:
        print(f"\nError durante la simulación: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())

