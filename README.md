Sistema de gestión de expedientes e indicios para la Dirección de Investigación Criminalística. Por: Jose Victor Castellanos Pérez



Requisitos:

Docker Desktop 20.10 o superior

Puertos 80, 3000 y 1433 disponibles



Instalación:

Clonar el repositorio:

git clone https://github.com/JvCas10/Sistema-de-gestion-de-evidencias.git



Comandos de Docker:

Levantar el sistema:

docker-compose up -d --build



Detener el sistema:

docker-compose down



Acceso:

Frontend: http://localhost

Backend: http://localhost:3000

Base de datos: localhost:1433



Credenciales:

Administrador

Email: admin@dicri.gob.gt

Contraseña: password123



Coordinador

Email: jcastellanos@dicri.gob.gt

Contraseña: password123



Técnico

Email: vperez@dicri.gob.gt

Contraseña: password123



Arquitectura:

El sistema está construido con React para el frontend, Node.js con Express para el backend, y SQL Server para la base de datos. Toda la lógica de datos se maneja mediante procedimientos almacenados.



Documentación:

Manual Técnico: https://drive.google.com/file/d/1p2rnFgcrTksjJ9cETu7qB8UdrfLC6Oif/view?usp=sharing

Presentación: https://drive.google.com/file/d/1-QG7eQe3C8a1qykNNSLTBuyDKGhPZgUK/view?usp=sharing



Pruebas:

El backend incluye pruebas unitarias con Jest. Para ejecutarlas:



cd backend

npm test

