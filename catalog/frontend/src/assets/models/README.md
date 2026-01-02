# Carpeta de Imágenes del Catálogo

Esta carpeta contiene las imágenes de los modelos del catálogo.

## Formato de Nombres de Archivo

Las imágenes deben seguir esta convención de nombres:

```
<NombreModelo>_<Fecha>_FXX.ext
```

### Ejemplos válidos:
- `Mia_01012026_F01.jpg`
- `Mia_01012026_F02.jpg`
- `Mia_01012026_F03.png`
- `Luna_31012026_F01.webp`
- `Luna_31012026_F02.jpg`
- `Sofia_15022026_F01.png`

### Formato:
- **NombreModelo**: Nombre del modelo (debe coincidir con el `alias` en el código)
- **Fecha**: Formato YYYYMMDD (año, mes, día)
- **FXX**: Número de frame (F01, F02, F03, etc.)
- **ext**: Extensión del archivo (jpg, jpeg, png, webp)

## Cómo Agregar Fotos

1. Coloca las imágenes en esta carpeta con el formato de nombre correcto
2. El catálogo las cargará automáticamente al iniciar
3. Las imágenes se filtrarán por el nombre del modelo seleccionado

## Notas

- Solo se mostrarán imágenes que coincidan con el alias del modelo
- Las imágenes se ordenan automáticamente por número de frame (F01, F02, etc.)
- Formatos soportados: jpg, jpeg, png, webp

