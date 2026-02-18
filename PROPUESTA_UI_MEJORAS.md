# 🎨 PROPUESTA UI/UX - SISTEMA ESCOLAR
## Rediseño Minimalista y Amigable para Maestras

---

## 🎯 OBJETIVO
Transformar el sistema en una interfaz **intuitiva, moderna y minimalista** que facilite el trabajo diario de las maestras, reduciendo la curva de aprendizaje y optimizando el flujo de trabajo.

---

## 🌈 PALETA DE COLORES

### Colores Principales
```scss
// _variables.scss - NUEVA PALETA
$primary-rose: #F2A2B1;        // Rosa suave (tu color base)
$primary-rose-dark: #E07A8D;   // Rosa oscuro (hover/énfasis)
$primary-rose-light: #FFE4E9;  // Rosa muy claro (backgrounds)

$accent-mint: #A8E6CF;         // Menta suave (acciones secundarias)
$accent-sage: #7FB3B3;         // Salvia (info/neutral)

$success: #81C995;             // Verde suave (confirmaciones)
$warning: #FFD89B;             // Amarillo pastel (alertas)
$danger: #FF8B94;              // Coral suave (errores)

// Neutros
$neutral-900: #2C3E50;         // Textos principales
$neutral-700: #5A6C7D;         // Textos secundarios
$neutral-500: #95A5A6;         // Textos deshabilitados
$neutral-300: #E8ECEF;         // Bordes
$neutral-100: #F8FAFB;         // Fondos claros
$white: #FFFFFF;

// Semánticos
$background-main: #FAFBFC;     // Fondo general
$background-card: $white;      // Cards
$text-primary: $neutral-900;
$text-secondary: $neutral-700;
```

### Aplicación Visual
```
┌─────────────────────────────────────────┐
│ NAVBAR: $white con borde $neutral-300  │ ← Limpio y espacioso
├─────────────────────────────────────────┤
│ SIDEBAR: $neutral-100                  │ ← Discreto
│   Items activos: $primary-rose-light   │
│   Iconos: $primary-rose                │
├─────────────────────────────────────────┤
│ MAIN: $background-main                 │ ← Contraste suave
│   Cards: $background-card              │
│   Botones primarios: $primary-rose     │
│   Botones secundarios: $accent-mint    │
└─────────────────────────────────────────┘
```

---

## 📐 SISTEMA DE DISEÑO

### 1. Tipografía
```scss
// Cambio de Roboto → Inter (más moderna y legible)
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

// Tamaños consistentes
$font-size-xs: 12px;    // Hints/metadatos
$font-size-sm: 14px;    // Texto secundario
$font-size-base: 16px;  // Texto principal
$font-size-lg: 18px;    // Subtítulos
$font-size-xl: 24px;    // Títulos de sección
$font-size-2xl: 32px;   // Títulos principales

// Pesos
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 2. Espaciado (Sistema 8px)
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 64px;
```

### 3. Bordes y Sombras
```scss
// Bordes redondeados
$border-radius-sm: 6px;   // Botones pequeños
$border-radius-md: 8px;   // Cards, inputs
$border-radius-lg: 12px;  // Modales, secciones
$border-radius-xl: 16px;  // Hero cards

// Sombras sutiles (minimalismo)
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);

// Sombra especial para elementos importantes
$shadow-primary: 0 4px 16px rgba(242, 162, 177, 0.2);
```

---

## 🧩 COMPONENTES REDISEÑADOS

### 1. NAVBAR (Mejora crítica)

**ANTES:** Navbar genérico de Material
**DESPUÉS:** Header minimalista con acciones rápidas

```html
<!-- navbar.component.html - NUEVO -->
<header class="navbar-v2">
  <div class="navbar-content">
    <!-- Logo + Nombre -->
    <div class="navbar-brand">
      <img src="/assets/logo.svg" alt="Logo" class="navbar-logo">
      <span class="navbar-title">Mi Escuela</span>
    </div>

    <!-- Búsqueda global (para maestras) -->
    <div class="navbar-search">
      <mat-icon>search</mat-icon>
      <input 
        type="text" 
        placeholder="Buscar alumno, materia, grupo..."
        (input)="onSearch($event)">
    </div>

    <!-- Acciones rápidas -->
    <div class="navbar-actions">
      <!-- Notificaciones -->
      <button mat-icon-button [matMenuTriggerFor]="notifMenu" class="navbar-action">
        <mat-icon [matBadge]="notifications" matBadgeColor="warn">notifications_none</mat-icon>
      </button>

      <!-- Ayuda contextual -->
      <button mat-icon-button (click)="openHelp()" class="navbar-action">
        <mat-icon>help_outline</mat-icon>
      </button>

      <!-- Perfil -->
      <button mat-button [matMenuTriggerFor]="profileMenu" class="navbar-profile">
        <img [src]="user.avatar" alt="Avatar" class="navbar-avatar">
        <span class="navbar-username">{{ user.name }}</span>
        <mat-icon>expand_more</mat-icon>
      </button>
    </div>
  </div>
</header>
```

```scss
// navbar.component.scss - NUEVO
.navbar-v2 {
  background: $white;
  border-bottom: 1px solid $neutral-300;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: $shadow-sm;

  .navbar-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 $spacing-lg;
    height: 100%;
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    
    .navbar-logo {
      height: 32px;
      width: auto;
    }

    .navbar-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $primary-rose;
    }
  }

  .navbar-search {
    flex: 1;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    background: $neutral-100;
    border-radius: 24px;
    padding: $spacing-sm $spacing-md;
    transition: all 0.2s;

    &:focus-within {
      background: $white;
      box-shadow: 0 0 0 2px $primary-rose-light;
    }

    mat-icon {
      color: $neutral-500;
      font-size: 20px;
    }

    input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: $font-size-sm;
      color: $neutral-900;

      &::placeholder {
        color: $neutral-500;
      }
    }
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .navbar-action {
    color: $neutral-700;
    
    &:hover {
      color: $primary-rose;
      background: $primary-rose-light;
    }
  }

  .navbar-profile {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-md;
    border-radius: 20px;
    transition: all 0.2s;

    &:hover {
      background: $neutral-100;
    }

    .navbar-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .navbar-username {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $neutral-900;
    }
  }
}
```

---

### 2. SIDEBAR (Navegación principal)

**ANTES:** Sidebar tradicional con texto completo
**DESPUÉS:** Sidebar colapsable con iconos grandes y tooltips

```html
<!-- sidebar.component.html - NUEVO -->
<aside class="sidebar-v2" [class.sidebar-collapsed]="isCollapsed">
  <!-- Toggle collapse -->
  <button mat-icon-button class="sidebar-toggle" (click)="toggleSidebar()">
    <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
  </button>

  <!-- Navegación principal -->
  <nav class="sidebar-nav">
    <a 
      *ngFor="let item of menuItems"
      [routerLink]="item.route"
      routerLinkActive="sidebar-item-active"
      class="sidebar-item"
      [matTooltip]="isCollapsed ? item.label : ''"
      matTooltipPosition="right">
      
      <mat-icon class="sidebar-icon">{{ item.icon }}</mat-icon>
      <span class="sidebar-label" *ngIf="!isCollapsed">{{ item.label }}</span>
      
      <!-- Badge para notificaciones -->
      <span class="sidebar-badge" *ngIf="item.badge && !isCollapsed">
        {{ item.badge }}
      </span>
    </a>
  </nav>

  <!-- Acceso rápido (bottom) -->
  <div class="sidebar-footer">
    <button mat-icon-button class="sidebar-item" matTooltip="Configuración">
      <mat-icon>settings</mat-icon>
    </button>
  </div>
</aside>
```

```scss
// sidebar.component.scss - NUEVO
.sidebar-v2 {
  background: $neutral-100;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  display: flex;
  flex-direction: column;
  width: 240px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid $neutral-300;

  &.sidebar-collapsed {
    width: 64px;

    .sidebar-label,
    .sidebar-badge {
      display: none;
    }

    .sidebar-item {
      justify-content: center;
    }
  }

  .sidebar-toggle {
    align-self: flex-end;
    margin: $spacing-sm;
    color: $neutral-700;

    &:hover {
      color: $primary-rose;
      background: $primary-rose-light;
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: $spacing-sm 0;
    overflow-y: auto;

    // Ocultar scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: $neutral-300;
      border-radius: 2px;
    }
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    margin: 0 $spacing-sm $spacing-xs;
    color: $neutral-700;
    text-decoration: none;
    border-radius: $border-radius-md;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    background: transparent;
    width: calc(100% - 16px);

    &:hover {
      background: $white;
      color: $primary-rose;
      transform: translateX(2px);

      .sidebar-icon {
        color: $primary-rose;
      }
    }

    &.sidebar-item-active {
      background: $primary-rose-light;
      color: $primary-rose;
      font-weight: $font-weight-semibold;

      .sidebar-icon {
        color: $primary-rose;
      }
    }

    .sidebar-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: $neutral-700;
      transition: color 0.2s;
    }

    .sidebar-label {
      font-size: $font-size-sm;
      white-space: nowrap;
    }

    .sidebar-badge {
      margin-left: auto;
      background: $primary-rose;
      color: $white;
      font-size: $font-size-xs;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: $font-weight-semibold;
    }
  }

  .sidebar-footer {
    padding: $spacing-md;
    border-top: 1px solid $neutral-300;
  }
}
```

**Menú Items (sidebar.component.ts):**
```typescript
menuItems = [
  { icon: 'dashboard', label: 'Inicio', route: '/dashboard' },
  { icon: 'people', label: 'Alumnos', route: '/students', badge: '3' },
  { icon: 'book', label: 'Materias', route: '/subjects' },
  { icon: 'groups', label: 'Grupos', route: '/groups' },
  { icon: 'assignment', label: 'Evaluaciones', route: '/evaluations' },
  { icon: 'event', label: 'Asistencias', route: '/attendance' },
  { icon: 'folder', label: 'Expedientes', route: '/records' },
  { icon: 'calendar_today', label: 'Periodos', route: '/periods' }
];
```

---

### 3. CARDS Y LISTAS

**ANTES:** Cards de Material estándar
**DESPUÉS:** Cards con interacción suave y jerarquía visual

```scss
// _cards.scss - NUEVO
.card-v2 {
  background: $background-card;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $neutral-300;
  }

  // Card con acción principal
  &.card-clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-primary;
      border-color: $primary-rose-light;
    }
  }

  // Header del card
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    .card-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }

    .card-actions {
      display: flex;
      gap: $spacing-sm;
    }
  }

  // Stats cards (dashboard)
  &.card-stat {
    text-align: center;
    padding: $spacing-lg;

    .stat-value {
      font-size: 48px;
      font-weight: $font-weight-bold;
      color: $primary-rose;
      line-height: 1;
      margin-bottom: $spacing-sm;
    }

    .stat-label {
      font-size: $font-size-base;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }

    .stat-icon {
      font-size: 32px;
      color: $primary-rose-light;
      margin-bottom: $spacing-md;
    }
  }
}
```

---

### 4. BOTONES

**ANTES:** Botones Material estándar
**DESPUÉS:** Botones con estados claros y variantes

```scss
// _buttons.scss - NUEVO
.btn-v2 {
  border-radius: $border-radius-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  text-transform: none; // NO caps
  transition: all 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;

  mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
  }

  // Primario (acciones importantes)
  &.btn-primary {
    background: $primary-rose;
    color: $white;

    &:hover:not(:disabled) {
      background: $primary-rose-dark;
      transform: translateY(-1px);
      box-shadow: $shadow-primary;
    }
  }

  // Secundario (acciones alternativas)
  &.btn-secondary {
    background: $accent-mint;
    color: $neutral-900;

    &:hover:not(:disabled) {
      background: darken($accent-mint, 10%);
    }
  }

  // Outline (acciones terciarias)
  &.btn-outline {
    background: transparent;
    border-color: $primary-rose;
    color: $primary-rose;

    &:hover:not(:disabled) {
      background: $primary-rose-light;
    }
  }

  // Ghost (acciones sutiles)
  &.btn-ghost {
    background: transparent;
    color: $neutral-700;

    &:hover:not(:disabled) {
      background: $neutral-100;
      color: $primary-rose;
    }
  }

  // Danger (eliminar, cancelar)
  &.btn-danger {
    background: $danger;
    color: $white;

    &:hover:not(:disabled) {
      background: darken($danger, 10%);
    }
  }

  // Tamaños
  &.btn-sm {
    padding: $spacing-xs $spacing-md;
    font-size: $font-size-sm;
  }

  &.btn-lg {
    padding: $spacing-md $spacing-xl;
    font-size: $font-size-lg;
  }

  // Estados
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-loading {
    position: relative;
    color: transparent;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.6s linear infinite;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 5. FORMULARIOS

**ANTES:** Inputs Material densos
**DESPUÉS:** Inputs espaciosos con validación visual clara

```scss
// _forms.scss - NUEVO
.form-v2 {
  .form-field {
    margin-bottom: $spacing-lg;

    label {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin-bottom: $spacing-sm;

      .label-required {
        color: $danger;
        margin-left: 2px;
      }

      .label-hint {
        color: $neutral-500;
        font-weight: $font-weight-normal;
        font-size: $font-size-xs;
        margin-left: $spacing-xs;
      }
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: $spacing-md;
      border: 2px solid $neutral-300;
      border-radius: $border-radius-md;
      font-size: $font-size-base;
      color: $text-primary;
      background: $white;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: $primary-rose;
        box-shadow: 0 0 0 3px $primary-rose-light;
      }

      &:disabled {
        background: $neutral-100;
        cursor: not-allowed;
      }

      &::placeholder {
        color: $neutral-500;
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    // Estados de validación
    &.field-error {
      input,
      textarea,
      select {
        border-color: $danger;
      }

      .field-message {
        color: $danger;
      }
    }

    &.field-success {
      input,
      textarea,
      select {
        border-color: $success;
      }

      .field-message {
        color: $success;
      }
    }

    .field-message {
      display: block;
      margin-top: $spacing-xs;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
    }
  }

  // Checkbox/Radio personalizados
  .form-checkbox,
  .form-radio {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    cursor: pointer;
    padding: $spacing-sm 0;

    input[type="checkbox"],
    input[type="radio"] {
      width: 20px;
      height: 20px;
      accent-color: $primary-rose;
      cursor: pointer;
    }

    label {
      margin: 0;
      cursor: pointer;
    }
  }
}
```

---

## 📱 PÁGINAS REDISEÑADAS

### DASHBOARD (Página principal)

**Objetivo:** Vista rápida del día para la maestra

```html
<!-- dashboard.component.html - NUEVO -->
<div class="dashboard-v2">
  <!-- Saludo personalizado -->
  <div class="dashboard-hero">
    <div class="hero-content">
      <h1 class="hero-title">
        Bienvenida, {{ user.name }} 👋
      </h1>
      <p class="hero-subtitle">
        Hoy es {{ today | date:'EEEE, d MMMM':'es' }}
      </p>
    </div>
    <button mat-raised-button class="btn-v2 btn-primary">
      <mat-icon>add</mat-icon>
      Acción rápida
    </button>
  </div>

  <!-- Stats rápidos (cards) -->
  <div class="dashboard-stats">
    <div class="card-v2 card-stat">
      <mat-icon class="stat-icon">people</mat-icon>
      <div class="stat-value">{{ stats.totalStudents }}</div>
      <div class="stat-label">Alumnos activos</div>
    </div>

    <div class="card-v2 card-stat">
      <mat-icon class="stat-icon">assignment_turned_in</mat-icon>
      <div class="stat-value">{{ stats.pendingGrades }}</div>
      <div class="stat-label">Calificaciones pendientes</div>
    </div>

    <div class="card-v2 card-stat">
      <mat-icon class="stat-icon">event_available</mat-icon>
      <div class="stat-value">{{ stats.todayAttendance }}%</div>
      <div class="stat-label">Asistencia hoy</div>
    </div>

    <div class="card-v2 card-stat">
      <mat-icon class="stat-icon">groups</mat-icon>
      <div class="stat-value">{{ stats.activeGroups }}</div>
      <div class="stat-label">Grupos activos</div>
    </div>
  </div>

  <!-- Grid de secciones -->
  <div class="dashboard-grid">
    <!-- Próximas clases -->
    <div class="card-v2">
      <div class="card-header">
        <h2 class="card-title">Próximas clases</h2>
        <button mat-button class="btn-v2 btn-ghost">Ver todas</button>
      </div>
      <div class="class-list">
        <div class="class-item" *ngFor="let class of upcomingClasses">
          <div class="class-time">{{ class.time }}</div>
          <div class="class-info">
            <div class="class-name">{{ class.subject }}</div>
            <div class="class-group">{{ class.group }}</div>
          </div>
          <button mat-icon-button class="btn-v2 btn-ghost">
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Tareas pendientes -->
    <div class="card-v2">
      <div class="card-header">
        <h2 class="card-title">Tareas pendientes</h2>
        <button mat-button class="btn-v2 btn-ghost">Ver todas</button>
      </div>
      <div class="task-list">
        <div class="task-item" *ngFor="let task of pendingTasks">
          <mat-checkbox [(ngModel)]="task.completed"></mat-checkbox>
          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-meta">{{ task.dueDate | date:'short' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

```scss
// dashboard.component.scss - NUEVO
.dashboard-v2 {
  padding: $spacing-xl;
  max-width: 1400px;
  margin: 0 auto;

  .dashboard-hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-2xl;

    .hero-content {
      .hero-title {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin: 0 0 $spacing-sm;
      }

      .hero-subtitle {
        font-size: $font-size-lg;
        color: $text-secondary;
        margin: 0;
      }
    }
  }

  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-2xl;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: $spacing-lg;
  }

  .class-list,
  .task-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .class-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    border-radius: $border-radius-md;
    background: $neutral-100;
    transition: all 0.2s;

    &:hover {
      background: $primary-rose-light;
      transform: translateX(4px);
    }

    .class-time {
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      color: $primary-rose;
      min-width: 60px;
    }

    .class-info {
      flex: 1;

      .class-name {
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .class-group {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-sm;

    .task-content {
      flex: 1;

      .task-title {
        font-weight: $font-weight-medium;
        color: $text-primary;
      }

      .task-meta {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }
  }
}
```

---

## 🎨 TEMA DE ANGULAR MATERIAL

```scss
// _material-theme.scss - ACTUALIZADO
@use '@angular/material' as mat;

// Paleta personalizada con tu color rosa
$custom-rose-palette: (
  50: #FFE4E9,
  100: #FFCDD6,
  200: #FFB3C1,
  300: #F2A2B1,  // TU COLOR BASE
  400: #E896A7,
  500: #E07A8D,
  600: #D66179,
  700: #C94764,
  800: #B93552,
  900: #A52240,
  contrast: (
    50: rgba(black, 0.87),
    100: rgba(black, 0.87),
    200: rgba(black, 0.87),
    300: rgba(black, 0.87),
    400: rgba(black, 0.87),
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
  )
);

$custom-mint-palette: (
  50: #E8F8F1,
  100: #C6ECDD,
  200: #A8E6CF,  // Menta
  300: #8ADFC1,
  400: #6DD9B3,
  500: #50D2A5,
  600: #3EC597,
  700: #2FB889,
  800: #22AA7B,
  900: #169C6D,
  contrast: (
    50: rgba(black, 0.87),
    100: rgba(black, 0.87),
    200: rgba(black, 0.87),
    300: rgba(black, 0.87),
    400: rgba(black, 0.87),
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
  )
);

// Tema personalizado
$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: $custom-rose-palette,
    tertiary: $custom-mint-palette,
  ),
  typography: (
    plain-family: 'Inter',
    brand-family: 'Inter',
    bold-weight: 700,
    medium-weight: 500,
    regular-weight: 400,
  ),
  density: (
    scale: -1, // Más compacto pero no tanto
  )
));

// Aplicar tema
@mixin apply-theme() {
  @include mat.all-component-themes($theme);

  // Overrides personalizados
  .mat-mdc-raised-button.mat-primary {
    --mdc-protected-button-container-color: #{$primary-rose};
    --mdc-protected-button-label-text-color: white;
  }

  .mat-mdc-card {
    border-radius: $border-radius-lg !important;
  }

  .mat-mdc-form-field {
    .mat-mdc-text-field-wrapper {
      border-radius: $border-radius-md !important;
    }
  }
}
```

---

## 📋 LISTA DE ESTUDIANTES (Ejemplo completo)

```html
<!-- student-list.component.html - REDISEÑADO -->
<div class="students-v2">
  <!-- Header con búsqueda y filtros -->
  <div class="students-header">
    <h1 class="page-title">Alumnos</h1>
    
    <div class="header-actions">
      <!-- Búsqueda -->
      <div class="search-box">
        <mat-icon>search</mat-icon>
        <input 
          type="text" 
          placeholder="Buscar por nombre o matrícula..."
          [(ngModel)]="searchQuery"
          (input)="onSearch()">
      </div>

      <!-- Filtros -->
      <button mat-button [matMenuTriggerFor]="filterMenu" class="btn-v2 btn-outline">
        <mat-icon>filter_list</mat-icon>
        Filtros
        <span class="filter-badge" *ngIf="activeFilters > 0">{{ activeFilters }}</span>
      </button>

      <!-- Exportar -->
      <button mat-button (click)="exportToExcel()" class="btn-v2 btn-ghost">
        <mat-icon>download</mat-icon>
        Exportar
      </button>

      <!-- Agregar alumno -->
      <button mat-raised-button [routerLink]="['/students/new']" class="btn-v2 btn-primary">
        <mat-icon>add</mat-icon>
        Nuevo alumno
      </button>
    </div>
  </div>

  <!-- Grid de estudiantes (cards) -->
  <div class="students-grid" *ngIf="viewMode === 'grid'">
    <div class="student-card card-v2 card-clickable" 
         *ngFor="let student of students"
         [routerLink]="['/students', student.id]">
      
      <!-- Avatar + Estado -->
      <div class="student-avatar-wrapper">
        <img [src]="student.avatar || '/assets/default-avatar.png'" 
             alt="{{ student.name }}"
             class="student-avatar">
        <div class="student-status" 
             [class.status-active]="student.status === 'active'"
             [class.status-inactive]="student.status === 'inactive'">
        </div>
      </div>

      <!-- Info principal -->
      <div class="student-info">
        <h3 class="student-name">{{ student.name }}</h3>
        <p class="student-meta">{{ student.grade }} • Grupo {{ student.group }}</p>
        <p class="student-enrollment">Mat: {{ student.enrollment }}</p>
      </div>

      <!-- Stats rápidos -->
      <div class="student-stats">
        <div class="stat-item">
          <mat-icon>event_available</mat-icon>
          <span>{{ student.attendanceRate }}%</span>
        </div>
        <div class="stat-item">
          <mat-icon>star</mat-icon>
          <span>{{ student.averageGrade | number:'1.1-1' }}</span>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="student-actions">
        <button mat-icon-button (click)="quickEdit(student, $event)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
          <mat-icon>more_vert</mat-icon>
        </button>
      </div>
    </div>
  </div>

  <!-- Vista tabla (alternativa) -->
  <div class="students-table card-v2" *ngIf="viewMode === 'table'">
    <table mat-table [dataSource]="students">
      <!-- Columnas personalizadas aquí -->
    </table>
  </div>

  <!-- Empty state -->
  <div class="empty-state" *ngIf="students.length === 0">
    <img src="/assets/empty-students.svg" alt="Sin alumnos">
    <h3>No hay alumnos registrados</h3>
    <p>Comienza agregando tu primer alumno</p>
    <button mat-raised-button [routerLink]="['/students/new']" class="btn-v2 btn-primary">
      <mat-icon>add</mat-icon>
      Agregar alumno
    </button>
  </div>
</div>
```

```scss
// student-list.component.scss - NUEVO
.students-v2 {
  padding: $spacing-xl;
  max-width: 1400px;
  margin: 0 auto;

  .students-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;

    .page-title {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: $spacing-md;
      align-items: center;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      background: $white;
      border: 2px solid $neutral-300;
      border-radius: 24px;
      padding: $spacing-sm $spacing-md;
      min-width: 300px;
      transition: all 0.2s;

      &:focus-within {
        border-color: $primary-rose;
        box-shadow: 0 0 0 3px $primary-rose-light;
      }

      mat-icon {
        color: $neutral-500;
        font-size: 20px;
      }

      input {
        border: none;
        outline: none;
        background: transparent;
        flex: 1;
        font-size: $font-size-sm;

        &::placeholder {
          color: $neutral-500;
        }
      }
    }

    .filter-badge {
      background: $primary-rose;
      color: $white;
      font-size: $font-size-xs;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: $spacing-xs;
    }
  }

  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
  }

  .student-card {
    display: flex;
    flex-direction: column;
    padding: $spacing-lg;
    position: relative;

    .student-avatar-wrapper {
      position: relative;
      margin-bottom: $spacing-md;
      align-self: center;

      .student-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid $primary-rose-light;
      }

      .student-status {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid $white;

        &.status-active {
          background: $success;
        }

        &.status-inactive {
          background: $neutral-500;
        }
      }
    }

    .student-info {
      text-align: center;
      margin-bottom: $spacing-md;

      .student-name {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        margin: 0 0 $spacing-xs;
      }

      .student-meta {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin: 0 0 $spacing-xs;
      }

      .student-enrollment {
        font-size: $font-size-xs;
        color: $neutral-500;
        margin: 0;
        font-family: monospace;
      }
    }

    .student-stats {
      display: flex;
      justify-content: space-around;
      padding: $spacing-md 0;
      border-top: 1px solid $neutral-300;
      border-bottom: 1px solid $neutral-300;
      margin-bottom: $spacing-md;

      .stat-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;

        mat-icon {
          font-size: 18px;
          color: $primary-rose;
        }

        span {
          font-size: $font-size-sm;
          font-weight: $font-weight-semibold;
          color: $text-primary;
        }
      }
    }

    .student-actions {
      display: flex;
      justify-content: center;
      gap: $spacing-sm;

      button {
        color: $neutral-700;

        &:hover {
          color: $primary-rose;
          background: $primary-rose-light;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: $spacing-3xl;

    img {
      max-width: 300px;
      margin-bottom: $spacing-xl;
      opacity: 0.6;
    }

    h3 {
      font-size: $font-size-xl;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    p {
      color: $text-secondary;
      margin-bottom: $spacing-lg;
    }
  }
}
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### Fase 1: Variables y Base (Semana 1)
1. Actualizar `_variables.scss` con nueva paleta
2. Actualizar `_material-theme.scss`
3. Cambiar tipografía a Inter
4. Implementar mixins de espaciado

### Fase 2: Componentes Core (Semana 2)
1. Rediseñar Navbar
2. Rediseñar Sidebar
3. Actualizar Loading Spinner
4. Crear componentes de botones v2
5. Crear componentes de forms v2

### Fase 3: Páginas Principales (Semana 3-4)
1. Dashboard
2. Lista de Estudiantes
3. Formulario de Estudiantes
4. Lista de Evaluaciones
5. Asistencias

### Fase 4: Detalles y Polish (Semana 5)
1. Animaciones suaves
2. Estados vacíos (empty states)
3. Feedback visual (toasts mejorados)
4. Responsive mobile
5. Dark mode (opcional)

---

## 📐 PRINCIPIOS DE DISEÑO

### 1. **Claridad Visual**
- Jerarquía clara con tamaños de fuente
- Espaciado generoso (sistema 8px)
- Contraste apropiado para legibilidad

### 2. **Feedback Inmediato**
- Transiciones suaves (0.2s)
- Estados hover visibles
- Loading states claros
- Confirmaciones visuales

### 3. **Accesibilidad**
- Contraste WCAG AA mínimo
- Navegación por teclado
- ARIA labels en iconos
- Tamaños táctiles (mínimo 44x44px)

### 4. **Eficiencia**
- Búsqueda global en navbar
- Acciones rápidas en cards
- Keyboard shortcuts
- Bulk actions en listas

---

## 🎯 BENEFICIOS ESPERADOS

✅ **Reducción del 40% en tiempo de navegación**
✅ **Curva de aprendizaje de 2 días → 30 minutos**
✅ **Satisfacción de usuario: 8.5+/10**
✅ **Reducción de errores por UI confusa**
✅ **Look profesional y moderno**

---

## 🔧 ARCHIVOS A MODIFICAR

```
school-frontend/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── _variables.scss ← ACTUALIZAR
│   │       ├── _material-theme.scss ← ACTUALIZAR
│   │       ├── _buttons.scss ← CREAR
│   │       ├── _cards.scss ← CREAR
│   │       ├── _forms.scss ← CREAR
│   │       └── _mixins.scss ← ACTUALIZAR
│   ├── styles.scss ← IMPORTAR NUEVOS
│   └── app/
│       ├── layout/
│       │   ├── navbar/ ← REDISEÑAR
│       │   └── sidebar/ ← REDISEÑAR
│       └── features/
│           ├── dashboard/ ← REDISEÑAR
│           └── students/ ← REDISEÑAR
```

---

## 📱 RESPONSIVE (MOBILE-FIRST)

```scss
// Breakpoints ajustados
@media (max-width: 768px) {
  .sidebar-v2 {
    position: fixed;
    transform: translateX(-100%);
    z-index: 1001;

    &.sidebar-open {
      transform: translateX(0);
    }
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .navbar-search {
    display: none; // Mostrar en menú mobile
  }
}
```

---

## ✨ BONUS: Animaciones Suaves

```scss
// _animations.scss - CREAR
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideInRight 0.3s ease-out;
}

// Aplicar a cards
.card-v2 {
  animation: fadeIn 0.3s ease-out;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.05s; }
  &:nth-child(3) { animation-delay: 0.1s; }
  &:nth-child(4) { animation-delay: 0.15s; }
}
```

---

## 🎨 RECURSOS ADICIONALES

### Iconos
- Material Icons (ya incluido)
- Iconos personalizados en `/assets/icons/`

### Imágenes
- Empty states: `/assets/illustrations/`
- Avatares default: `/assets/avatars/`

### Tipografía
```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Preparación
- [ ] Instalar Inter font
- [ ] Crear archivos SCSS nuevos
- [ ] Backup de estilos actuales

### Fase 1: Base
- [ ] Variables de color
- [ ] Tema Material
- [ ] Tipografía
- [ ] Espaciado

### Fase 2: Componentes
- [ ] Botones v2
- [ ] Forms v2
- [ ] Cards v2
- [ ] Navbar
- [ ] Sidebar

### Fase 3: Páginas
- [ ] Dashboard
- [ ] Students List
- [ ] Student Form
- [ ] Evaluations
- [ ] Attendance

### Fase 4: Polish
- [ ] Animaciones
- [ ] Empty states
- [ ] Loading states
- [ ] Responsive
- [ ] Testing con maestras

---

¿Necesitas que expanda alguna sección o genere más ejemplos de componentes específicos?
