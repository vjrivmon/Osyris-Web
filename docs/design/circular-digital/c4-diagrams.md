# Diagramas C4 — Circular Digital

> Arquitectura del sistema Osyris-Web con la feature Circular Digital integrada.  
> Formato: Mermaid. Nivel C4: Context, Container, Component.

**Fecha:** 2026-02-01  
**Estado:** Draft  

---

## 1. Diagrama de Contexto (C4 Level 1)

Muestra cómo Osyris-Web interactúa con usuarios y sistemas externos.

```mermaid
C4Context
    title Sistema Osyris-Web — Contexto

    Person(padre, "Padre/Tutor", "Rellena circulares, gestiona perfil de salud de sus educandos")
    Person(admin, "Coordinador/Admin", "Crea actividades, gestiona circulares, consulta estados")

    System(osyris, "Osyris-Web", "Plataforma de gestión scout. Next.js + Express + PostgreSQL")

    System_Ext(gdrive, "Google Drive", "Almacenamiento de PDFs firmados y documentos")
    System_Ext(email, "Servicio Email", "Envío de notificaciones y recordatorios (Nodemailer/SMTP)")
    System_Ext(browser, "Navegador Web", "Canvas API para firma digital táctil")

    Rel(padre, osyris, "Confirma datos, firma circular", "HTTPS")
    Rel(admin, osyris, "Crea actividades, consulta estado", "HTTPS")
    Rel(osyris, gdrive, "Sube PDFs firmados", "Google Drive API v3")
    Rel(osyris, email, "Envía notificaciones", "SMTP")
    Rel(padre, browser, "Firma con dedo/stylus", "Canvas API")
```

---

## 2. Diagrama de Contenedores (C4 Level 2)

Muestra los contenedores técnicos del sistema y cómo se comunican.

```mermaid
C4Container
    title Osyris-Web — Contenedores

    Person(padre, "Padre/Tutor")
    Person(admin, "Admin")

    Container_Boundary(osyris, "Osyris-Web") {
        Container(frontend, "Frontend", "Next.js 15, React 19", "SPA con SSR. Wizard de circular digital, firma canvas, dashboard admin")
        Container(api, "API Backend", "Express.js, Node.js", "REST API. Lógica de negocio, generación PDF, gestión de circulares")
        Container(db, "Base de Datos", "PostgreSQL", "Datos de usuarios, educandos, perfiles de salud, circulares, firmas")
        Container(worker, "Worker de PDF", "Node.js (mismo proceso o cola)", "Genera PDFs con pdf-lib, sube a Drive")
    }

    System_Ext(gdrive, "Google Drive", "Almacenamiento documentos")
    System_Ext(smtp, "SMTP Server", "Envío emails")

    Rel(padre, frontend, "Usa", "HTTPS/Browser")
    Rel(admin, frontend, "Usa", "HTTPS/Browser")
    Rel(frontend, api, "API calls", "REST/JSON")
    Rel(api, db, "Lee/Escribe", "pg driver")
    Rel(api, worker, "Encola generación PDF", "async/in-process")
    Rel(worker, gdrive, "Sube PDF", "Google Drive API v3")
    Rel(api, smtp, "Envía emails", "Nodemailer")
```

---

## 3. Diagrama de Componentes — Frontend (C4 Level 3)

```mermaid
C4Component
    title Frontend (Next.js) — Componentes Circular Digital

    Container_Boundary(frontend, "Frontend Next.js") {
        Component(wizard, "CircularDigitalWizard", "React Component", "Wizard multi-paso: revisar datos → confirmar → firmar → enviar")
        Component(perfil, "PerfilSaludForm", "React Component", "CRUD del perfil de salud del educando")
        Component(firma, "FirmaDigitalCanvas", "React Component", "Canvas táctil con signature_pad para firma manuscrita")
        Component(dashboard, "CircularStatusDashboard", "React Component", "Vista admin: estado de circulares por actividad")
        Component(inscripcion, "InscripcionWizard", "React Component (existente)", "Wizard de inscripción a campamento — se integra con CircularDigitalWizard")
        Component(hooks, "Custom Hooks", "React Hooks", "usePerfilSalud, useCircular, useFirmaDigital, useCircularStatus")
        Component(store, "Estado Global", "React Context / Zustand", "Estado del wizard, datos pre-rellenados, firma temporal")
    }

    Container(api, "API Backend", "Express.js")

    Rel(wizard, perfil, "Renderiza paso de datos médicos")
    Rel(wizard, firma, "Renderiza paso de firma")
    Rel(inscripcion, wizard, "Integra como sub-wizard")
    Rel(wizard, hooks, "Usa hooks para API calls")
    Rel(dashboard, hooks, "Usa useCircularStatus")
    Rel(hooks, api, "REST API calls", "fetch/axios")
    Rel(wizard, store, "Lee/escribe estado")
```

---

## 4. Diagrama de Componentes — Backend API (C4 Level 3)

```mermaid
C4Component
    title API Backend (Express.js) — Componentes Circular Digital

    Container_Boundary(api, "API Backend Express.js") {
        Component(perfilCtrl, "PerfilSaludController", "Express Router", "CRUD perfil de salud y contactos emergencia")
        Component(circularCtrl, "CircularController", "Express Router", "Crear circular, confirmar datos, enviar firma")
        Component(adminCtrl, "CircularAdminController", "Express Router", "Dashboard admin, enviar recordatorios, descarga masiva")
        Component(pdfService, "PDFGeneratorService", "Service", "Genera PDF con pdf-lib usando plantilla + datos + firma")
        Component(driveService, "GoogleDriveService", "Service (existente)", "Sube archivos a Drive, retorna file ID")
        Component(emailService, "EmailService", "Service (existente)", "Envía notificaciones via Nodemailer")
        Component(authMiddleware, "AuthMiddleware", "Middleware (existente)", "Verifica JWT, roles, permisos")
        Component(perfilRepo, "PerfilSaludRepository", "Repository", "Queries SQL para perfil_salud, contactos_emergencia")
        Component(circularRepo, "CircularRepository", "Repository", "Queries SQL para circulares, respuestas, plantillas")
    }

    Container(db, "PostgreSQL")
    System_Ext(gdrive, "Google Drive")
    System_Ext(smtp, "SMTP")

    Rel(circularCtrl, pdfService, "Genera PDF")
    Rel(pdfService, driveService, "Sube PDF a Drive")
    Rel(circularCtrl, emailService, "Envía confirmación")
    Rel(adminCtrl, emailService, "Envía recordatorios")
    Rel(perfilCtrl, perfilRepo, "CRUD datos")
    Rel(circularCtrl, circularRepo, "Lee/escribe circulares")
    Rel(circularCtrl, perfilRepo, "Lee perfil para pre-llenado")
    Rel(perfilRepo, db, "SQL queries")
    Rel(circularRepo, db, "SQL queries")
    Rel(driveService, gdrive, "Google API")
    Rel(emailService, smtp, "SMTP")
```

---

## 5. Diagrama de Despliegue

```mermaid
graph TB
    subgraph "Cliente"
        Browser["Navegador Web<br/>(Chrome/Safari/Firefox)"]
    end

    subgraph "Servidor (VPS/Cloud)"
        NextJS["Next.js 15<br/>SSR + Static<br/>Puerto 3000"]
        Express["Express.js API<br/>Puerto 4000"]
        PG["PostgreSQL<br/>Puerto 5432"]
    end

    subgraph "Servicios Externos"
        Drive["Google Drive API v3"]
        SMTP["Servidor SMTP"]
    end

    Browser -->|HTTPS| NextJS
    NextJS -->|REST API| Express
    Express -->|pg| PG
    Express -->|Google API| Drive
    Express -->|Nodemailer| SMTP
```

---

## 6. Flujo de Datos — Vista General

```mermaid
flowchart LR
    A[Padre abre circular] --> B[Frontend carga perfil de salud]
    B --> C[Datos pre-rellenados en formulario]
    C --> D{¿Datos correctos?}
    D -->|Sí| E[Padre firma en canvas]
    D -->|No| F[Padre modifica datos]
    F --> C
    E --> G[Frontend envía datos + firma a API]
    G --> H[API valida y persiste]
    H --> I[API genera PDF con pdf-lib]
    I --> J[API sube PDF a Google Drive]
    J --> K[API actualiza BD con drive_id]
    K --> L[API envía email de confirmación]
    L --> M[Padre recibe confirmación]
```
