# 🚗 API Conductores y Automóviles

API REST para gestionar conductores y vehículos, con frontend integrado.

## 📋 Descripción

Sistema que permite consultar conductores, automóviles y realizar búsquedas avanzadas mediante una interfaz web estilo retro años 50.

## 🛠️ Tecnologías

- **Backend:** Node.js, Express.js
- **Base de datos:** PostgreSQL
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)

## 📁 Estructura del Proyecto

```
├── index.js              # Servidor Express y endpoints
├── .env                  # Variables de entorno
├── package.json          # Dependencias
├── database/
│   └── actividad2.sql    # Script SQL
└── public/
    ├── index.html        # Interfaz web
    ├── styles.css        # Estilos
    └── script.js         # Lógica frontend
```

## ⚙️ Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear archivo `.env`:
   ```
   PGHOST=localhost
   PGUSER=postgres
   PGPASSWORD=tu_password
   PGDATABASE=conductores_db
   PGPORT=5432
   ```
4. Crear la base de datos e importar el script SQL

## 🚀 Uso

```bash
node index.js
```
Abrir en navegador: `http://localhost:3000`

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/conductores` | Lista todos los conductores |
| GET | `/automoviles` | Lista todos los automóviles |
| GET | `/conductoressinauto?edad=N` | Conductores sin auto (edad ≥ N) |
| GET | `/solitos` | Registros huérfanos (FULL OUTER JOIN) |
| GET | `/auto?patente=X` | Búsqueda exacta por patente |
| GET | `/auto?iniciopatente=X` | Búsqueda por inicio de patente |

## 👨‍💻 Autor

**Rubén** - Módulo 6 | Talento Digital 2026
# Eljercicio_practico2_MOD6---Api_con_Express_-_SQL-Conductores_y_Automoviles
