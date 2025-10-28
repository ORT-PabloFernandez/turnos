# Sistema de Gestión de Turnos Médicos

## Descripción del Proyecto

Este es un sistema completo de gestión de turnos médicos desarrollado con **Next.js 15** y **React 19**. La aplicación permite a los pacientes reservar turnos con profesionales de la salud, gestionar sus citas y a los administradores supervisar la disponibilidad de horarios.

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Frontend**: Next.js 15.3.2 con React 19
- **Estilos**: TailwindCSS 4 + CSS personalizado
- **Iconos**: FontAwesome + React Icons
- **Estado Global**: React Context API
- **Routing**: Next.js App Router

### Estructura del Proyecto
```
src/app/
├── components/
│   └── layouts/          # Componentes de layout (NavBar, Footer, Logo)
├── context/
│   └── TurnosContext.js  # Estado global de la aplicación
├── horarios/             # Página de gestión de horarios
├── mis-turnos/           # Página de turnos del usuario
├── profesionales/        # Página de profesionales
├── turnos/               # Página de reserva de turnos
├── layout.js             # Layout principal
└── page.js               # Página de inicio
```

## Lógica de Negocio

### 1. Gestión de Profesionales
- **Datos**: Cada profesional tiene ID, nombre, especialidad, avatar y email
- **Funcionalidad**: Visualización de profesionales disponibles con sus especialidades
- **Componentes**: `ProfessionalCard.jsx`, `ProfessionalSelector.jsx`

### 2. Sistema de Horarios
- **Generación Automática**: Se generan horarios para los próximos 30 días laborables
- **Horarios**: Mañana (9:00-12:00) y tarde (14:00-17:00)
- **Estados**: Disponible/Ocupado
- **Filtros**: Por profesional, fecha y estado de disponibilidad

### 3. Reserva de Turnos (Flujo de 4 Pasos)
1. **Selección de Profesional**: Lista de profesionales con especialidades
2. **Selección de Fecha**: Calendario con días disponibles
3. **Selección de Horario**: Slots de tiempo disponibles para la fecha elegida
4. **Confirmación**: Resumen del turno y confirmación final

### 4. Gestión de Turnos del Usuario
- **Visualización**: Turnos próximos y historial
- **Estados**: Confirmado, Completado
- **Acciones**: Cancelación de turnos futuros
- **Validaciones**: Solo se pueden cancelar turnos futuros

### 5. Administración de Horarios
- **Dashboard**: Estadísticas de horarios totales, disponibles y ocupados
- **Filtros Avanzados**: Por profesional, fecha y estado
- **Visualización**: Agrupación por fecha con información del paciente

## Context API - Estado Global

### TurnosContext.js
Maneja todo el estado de la aplicación:

```javascript
// Estados principales
- profesionales: Array de profesionales
- horariosDisponibles: Array de slots de tiempo
- turnosReservados: Array de turnos confirmados
- usuarioActual: Datos del usuario logueado

// Funciones principales
- reservarTurno(): Reserva un horario específico
- cancelarTurno(): Cancela un turno y libera el horario
- obtenerTurnosPorProfesional(): Filtra turnos por profesional
- obtenerTurnosUsuario(): Obtiene turnos del usuario actual
- obtenerHorariosDisponiblesPorProfesional(): Filtra horarios disponibles
```

## Flujos de Usuario

### Flujo de Reserva
1. Usuario accede desde página principal o profesionales
2. Selecciona profesional (puede venir pre-seleccionado via URL)
3. Elige fecha en calendario interactivo
4. Selecciona horario disponible
5. Confirma la reserva
6. Recibe confirmación y el horario se marca como ocupado

### Flujo de Cancelación
1. Usuario accede a "Mis Turnos"
2. Ve turnos próximos y pasados
3. Hace clic en "Cancelar" en turno futuro
4. Confirma cancelación en modal
5. Turno se elimina y horario queda disponible nuevamente

### Flujo Administrativo
1. Acceso a "Horarios" para supervisión
2. Visualización de estadísticas generales
3. Aplicación de filtros por profesional/fecha/estado
4. Revisión de ocupación y datos de pacientes

## Características Técnicas

### Responsive Design
- Grid layouts adaptativos
- Componentes optimizados para móvil y desktop
- Uso de CSS Grid y Flexbox

### Gestión de Estados
- Context API para estado global
- useState para estados locales de componentes
- useEffect para efectos secundarios y generación de datos

### Validaciones y UX
- Validación de fechas (solo días laborables)
- Confirmaciones para acciones destructivas
- Mensajes de éxito/error
- Estados de carga y feedback visual

### Optimizaciones
- Lazy loading de imágenes con fallbacks
- Filtrado eficiente de datos
- Memoización implícita con React 19
- CSS modular por página

## Instalación y Configuración

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Notas de Desarrollo

### Datos de Prueba
- 3 profesionales predefinidos con especialidades diferentes
- Horarios generados automáticamente para 30 días
- Usuario demo para testing

### Extensibilidad
- Estructura modular permite agregar nuevas funcionalidades
- Context API facilita agregar nuevos estados globales
- Componentes reutilizables para diferentes vistas

### Consideraciones Futuras
- Integración con backend real
- Autenticación de usuarios
- Notificaciones por email/SMS
- Sincronización con calendarios externos
- Sistema de recordatorios automáticos
