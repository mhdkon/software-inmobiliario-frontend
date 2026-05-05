Plataforma web moderna y responsive para la gestión y visualización de propiedades inmobiliarias. Permite a usuarios crear anuncios, buscar propiedades con filtros avanzados y mantener una lista de favoritos.
Características Principales
Autenticación y Seguridad

    Login y registro de usuarios
    Autenticación con JWT tokens
    Control de acceso basado en roles (Admin/Usuario)
    Logout con confirmación de seguridad
    Persistencia de sesión

Gestión de Propiedades

    Crear nuevas propiedades
    Editar propiedades existentes
    Eliminar propiedades
    Galería de imágenes con carrusel interactivo
    Compresión automática de imágenes (hasta 1MB)
    Máximo 10 imágenes por propiedad
    Vista detallada con mapa integrado

Búsqueda y Filtros

    Filtrar por provincia y ciudad
    Filtrar por tipo de propiedad
    Filtrar por rango de precio
    Filtrar por número de habitaciones y baños
    Filtrar por estado (Ocupado/REO)
    Paginación (6 propiedades por página)
    Contador de resultados

Sistema de Favoritos

    Agregar/Remover propiedades de favoritos
    Indicador visual de favoritos
    Persistencia en backend

Panel Administrativo

    Gestión de usuarios
    Eliminar usuarios
    Visualización de todas las propiedades

Tecnologías Utilizadas
Frontend

    React 18+
    Vite (bundler)
    React Hot Toast (notificaciones)
    Leaflet (mapas)
    browser-image-compression (optimización de imágenes)
    Fetch API (peticiones HTTP)

Backend

    Node.js
    Express
    JWT (autenticación)
    Cloudinary (almacenamiento de imágenes)

Requisitos Previos

    Node.js 16+ instalado
    npm o yarn
    Backend API ejecutándose
