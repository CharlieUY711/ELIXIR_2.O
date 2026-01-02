# Script para descargar las fotos de Unsplash
$basePath = $PSScriptRoot

Write-Host "Descargando fotos..." -ForegroundColor Cyan

# Luna
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Luna_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Luna_01012026_F02.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Luna_01012026_F03.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Luna_01012026_F04.jpg"

# Marcus
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Marcus_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Marcus_01012026_F02.jpg"

# Kai
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Kai_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Kai_01012026_F02.jpg"

# Sofia
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Sofia_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Sofia_01012026_F02.jpg"

# Alex
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Alex_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Alex_01012026_F02.jpg"

# Zara
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Zara_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Zara_01012026_F02.jpg"

# Maya
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Maya_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Maya_01012026_F02.jpg"

# Noah
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Noah_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Noah_01012026_F02.jpg"

# Elena
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Elena_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Elena_01012026_F02.jpg"

# Ryan
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Ryan_01012026_F01.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces" -OutFile "$basePath\Ryan_01012026_F02.jpg"

Write-Host "Descarga completada!" -ForegroundColor Green
