# Plataforma Modular - Catálogo, Chat y Elixir

## Visión General del Proyecto

Esta plataforma modular está compuesta por tres módulos principales que trabajan de forma integrada:

1. **Catálogo de Modelos** - Frontend web para exploración y visualización de modelos
2. **Chat / WhatsApp Gateway** - Backend para comunicación en tiempo real
3. **Elixir** - Módulo financiero interno con integración Nectar

Cada módulo es independiente pero se integra con los demás para proporcionar una experiencia completa al usuario.

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

### Principios de la Arquitectura

- **Modularidad**: Cada módulo es independiente y puede desarrollarse por separado
- **Separación de responsabilidades**: Cada módulo tiene un propósito específico y claro
- **Integración mediante APIs**: Los módulos se comunican a través de interfaces bien definidas
- **Escalabilidad**: La arquitectura permite escalar cada módulo de forma independiente

## Principios Rectores

### 1. Orden de Trabajo

El desarrollo sigue un orden estricto para mantener la disciplina y evitar implementaciones prematuras:

1. **Modelo de Datos** → Definir primero la estructura de datos y relaciones
2. **Backend** → Implementar lógica de negocio y APIs
3. **Frontend** → Construir interfaces de usuario que consuman las APIs

### 2. Disciplina Git

- **Commits atómicos**: Cada commit representa un cambio lógico y completo
- **Mensajes descriptivos**: Usar convenciones de commits (chore, feat, fix, etc.)
- **Ramas organizadas**: Seguir estrategia de ramas definida

### 3. Documentación

- Cada módulo debe tener su README explicando su rol y responsabilidades
- Documentar decisiones arquitectónicas importantes
- Mantener documentación actualizada

### 4. Preparación antes de Implementación

- **NO implementar lógica de negocio** hasta tener el modelo de datos definido
- **NO crear endpoints** hasta tener el modelo de datos
- **NO construir UI** hasta tener APIs funcionales
- **NO agregar dependencias** innecesarias

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
  - Ejemplo: `feature/catalog-search`, `feature/whatsapp-integration`
  - Se crean desde `develop`
  - Se mergean de vuelta a `develop` cuando están completas

- **`hotfix/*`**: Ramas para correcciones urgentes en producción
  - Nomenclatura: `hotfix/descripcion-bug`
  - Se crean desde `main`
  - Se mergean a `main` y `develop`

### Flujo de Trabajo

```
main (estable)
  ↑
  | (hotfixes)
  |
develop (integración)
  ↑
  | (features)
  |
feature/* (desarrollo)
```

### Convenciones de Commits

Usar formato convencional:

- `chore:` - Cambios en configuración, estructura, herramientas
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `style:` - Cambios de formato (no afectan funcionalidad)

Ejemplo: `feat(catalog): add search functionality`

## Estado Actual del Proyecto

**Fase Actual**: Preparación estructural y disciplina Git

- ✅ Repositorio Git inicializado
- ✅ Estructura de carpetas creada
- ✅ Documentación base preparada
- ✅ .gitignore configurado
- ⏳ Pendiente: Definición de modelo de datos
- ⏳ Pendiente: Implementación de lógica de negocio
- ⏳ Pendiente: Desarrollo de APIs
- ⏳ Pendiente: Construcción de interfaces

## Próximos Pasos

1. Definir modelo de datos (documento de definiciones clave)
2. Implementar backend de cada módulo
3. Desarrollar APIs de integración
4. Construir frontend del catálogo
5. Integrar módulos

## Documentación Adicional

- Ver README de cada módulo para detalles específicos:
  - [`catalog/README.md`](catalog/README.md)
  - [`chat/README.md`](chat/README.md)
  - [`elixir/README.md`](elixir/README.md)
- Documento madre: [`docs/Definiciones_Clave_Plataforma.md`](docs/Definiciones_Clave_Plataforma.md) (pendiente)

