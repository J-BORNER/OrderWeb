# Sistema de Órdenes - Restaurante

## Instalación
1. Clonar repositorio
2. npm install
3. Configurar variables de entorno
4. Ejecutar script database.sql

## Despliegue
- Backend: Render Web Service
- Base de datos: Render PostgreSQL
- Frontend: Servido desde el mismo backend

## Endpoints
- POST /clientes/registrar
- POST /clientes/login  
- POST /ordenes
- GET /ordenes/:clienteId
- PUT /ordenes/:id/estado