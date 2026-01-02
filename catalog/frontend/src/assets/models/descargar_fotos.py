#!/usr/bin/env python3
import urllib.request
import os
from pathlib import Path

# Directorio donde se guardarán las fotos
output_dir = Path(__file__).parent

# Lista de fotos a descargar: (nombre_archivo, url)
fotos = [
    # Luna
    ("Luna_01012026_F01.jpg", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces"),
    ("Luna_01012026_F02.jpg", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces"),
    ("Luna_01012026_F03.jpg", "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=faces"),
    ("Luna_01012026_F04.jpg", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces"),
    # Marcus
    ("Marcus_01012026_F01.jpg", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"),
    ("Marcus_01012026_F02.jpg", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces"),
    # Kai
    ("Kai_01012026_F01.jpg", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces"),
    ("Kai_01012026_F02.jpg", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces"),
    # Sofia
    ("Sofia_01012026_F01.jpg", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces"),
    ("Sofia_01012026_F02.jpg", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces"),
    # Alex
    ("Alex_01012026_F01.jpg", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=faces"),
    ("Alex_01012026_F02.jpg", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"),
    # Zara
    ("Zara_01012026_F01.jpg", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces"),
    ("Zara_01012026_F02.jpg", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces"),
    # Maya
    ("Maya_01012026_F01.jpg", "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=faces"),
    ("Maya_01012026_F02.jpg", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces"),
    # Noah
    ("Noah_01012026_F01.jpg", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces"),
    ("Noah_01012026_F02.jpg", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"),
    # Elena
    ("Elena_01012026_F01.jpg", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces"),
    ("Elena_01012026_F02.jpg", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces"),
    # Ryan
    ("Ryan_01012026_F01.jpg", "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=600&fit=crop&crop=faces"),
    ("Ryan_01012026_F02.jpg", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces"),
]

print("=" * 50)
print("DESCARGANDO FOTOS DEL CATÁLOGO")
print("=" * 50)
print(f"Directorio: {output_dir}")
print(f"Total de fotos: {len(fotos)}")
print()

descargadas = 0
errores = 0

for nombre, url in fotos:
    try:
        file_path = output_dir / nombre
        print(f"Descargando: {nombre}...", end=" ")
        urllib.request.urlretrieve(url, file_path)
        print("✓")
        descargadas += 1
    except Exception as e:
        print(f"✗ Error: {e}")
        errores += 1

print()
print("=" * 50)
print(f"DESCARGA COMPLETADA")
print(f"✓ Descargadas: {descargadas}")
print(f"✗ Errores: {errores}")
print("=" * 50)

