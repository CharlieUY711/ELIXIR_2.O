# Elixir Platform (Catálogo + Chat + Elixir)

## Visión General del Proyecto

Elixir Platform es una plataforma modular compuesta por tres módulos principales que trabajan de forma integrada para proporcionar una experiencia completa al usuario a través de WhatsApp como interfaz principal.

## Arquitectura Modular

```
/
├── catalog/          # Módulo de Catálogo (Frontend Web)
│   └── frontend/
├── chat/             # Módulo de Chat/WhatsApp Gateway (Backend)
│   └── gateway/
├── elixir/           # Módulo Financiero (Backend)
│   └── core/
├── docs/             # Documentación del proyecto
└── scripts/          # Scripts de utilidad
```

## Separación de Responsabilidades

### Catálogo: Atracción Visual
- Interfaz web frontend para exploración y visualización
- Enfoque en experiencia visual e interactiva
- Mucha imagen, poco texto
- Presentación atractiva del contenido

### Chat: Operación y Ruteo
- Gateway de WhatsApp para comunicación
- Ruteo de mensajes y operaciones
- Interfaz principal de interacción con usuarios
- Gestión de conversaciones y flujos

### Elixir: Infraestructura Financiera
- Sistema financiero interno
- Gestión de saldo y transacciones
- **Elixir NO gestiona servicios, gestiona saldo**
- Procesamiento de operaciones financieras

## Principios Rectores

### 1. WhatsApp como Interfaz
- WhatsApp es la interfaz principal de interacción con los usuarios
- La experiencia debe estar optimizada para este canal
- Integración nativa con WhatsApp Business API

### 2. BOT Invisible
- El sistema debe funcionar de manera transparente
- La experiencia debe sentirse natural, no robótica
- Interacciones fluidas y contextuales

### 3. Elixir: Gestión de Saldo
- **Elixir NO gestiona servicios, gestiona saldo**
- Su responsabilidad es exclusivamente financiera
- Manejo de transacciones, pagos y balance
- No debe asumir responsabilidades de otros módulos

### 4. Mucha Imagen, Poco Texto
- Priorizar contenido visual sobre texto
- Interfaz rica en imágenes y elementos gráficos
- Comunicación concisa y efectiva
- Experiencia visual atractiva

## Estrategia de Ramas Git

### Ramas Principales

- **`main`**: Rama estable, contiene código en producción
  - Solo se actualiza mediante merge desde `develop` o hotfixes
  - Protegida, requiere revisión antes de merge

- **`develop`**: Rama de integración, contiene código en desarrollo
  - Rama base para nuevas features
  - Se actualiza frecuentemente con merges desde `feature/*`

### Ramas de Desarrollo

- **`feature/*`**: Ramas para desarrollo de nuevas funcionalidades
  - Nomenclatura: `feature/nombre-descriptivo`
  - Se crean desde `develop`
  - Se mergean de vuelta a `develop` cuando están completas

### Flujo de Trabajo

```
main (estable)
  ↑
  |
develop (integración)
  ↑
  |
feature/* (desarrollo)
```

## Estado Actual del Proyecto

**Fase Actual**: Preparación estructural y disciplina Git

- ✅ Repositorio Git inicializado
- ✅ Estructura de carpetas creada
- ✅ Documentación base preparada
- ⏳ Pendiente: Definición de modelo de datos
- ⏳ Pendiente: Implementación de lógica de negocio
- ⏳ Pendiente: Desarrollo de APIs
- ⏳ Pendiente: Construcción de interfaces

## Documentación Adicional

- Ver README de cada módulo para detalles específicos:
  - [`catalog/README.md`](catalog/README.md)
  - [`chat/README.md`](chat/README.md)
  - [`elixir/README.md`](elixir/README.md)
- Documentación general: [`docs/README.md`](docs/README.md)
