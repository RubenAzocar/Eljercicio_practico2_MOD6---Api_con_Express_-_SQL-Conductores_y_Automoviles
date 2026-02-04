// ============================================
// IMPORTACIÓN DE DEPENDENCIAS
// ============================================

// dotenv: Permite cargar variables de entorno desde un archivo .env
// Documentación: https://www.npmjs.com/package/dotenv
const dotenv = require('dotenv');

// pg (node-postgres): Cliente para conectar con PostgreSQL
// Pool: Maneja múltiples conexiones a la base de datos de forma eficiente
// Documentación: https://node-postgres.com/
const { Pool } = require('pg');

// express: Framework minimalista para crear servidores web y APIs REST
// Documentación: https://expressjs.com/
const express = require('express');

// cors: Middleware que permite peticiones desde otros orígenes (Cross-Origin Resource Sharing)
// Necesario para que el frontend pueda comunicarse con la API
// Documentación: https://www.npmjs.com/package/cors
const cors = require('cors');

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================

// Carga las variables definidas en el archivo .env al objeto process.env
// Esto permite usar credenciales sin exponerlas en el código
dotenv.config();

// ============================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================

// Crea un pool de conexiones a PostgreSQL
// El pool lee automáticamente las variables PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
const pool = new Pool();

// Prueba inicial de conexión a la base de datos
// SELECT NOW() devuelve la fecha/hora actual del servidor PostgreSQL
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        // Si hay error de conexión, lo muestra en consola
        console.error('Error de conexión a la base de datos:', err);
    } else {
        // Si la conexión es exitosa, muestra la fecha/hora del servidor
        console.log('Conexión exitosa a PostgreSQL:', res.rows[0].now);
    }
});

// ============================================
// CONFIGURACIÓN DEL SERVIDOR EXPRESS
// ============================================

// Crea la instancia de la aplicación Express
const app = express();

// Define el puerto donde escuchará el servidor
const port = 3000;

// ============================================
// MIDDLEWARES
// ============================================

// Habilita CORS para permitir peticiones desde cualquier origen
// Esto es necesario para que el frontend pueda acceder a la API
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
// Esto permite acceder a HTML, CSS, JS e imágenes del frontend
app.use(express.static('public'));

// ============================================
// ENDPOINTS / RUTAS
// ============================================

// -----------------------------------------
// ENDPOINT RAÍZ: GET /
// Propósito: Verificar que la API está funcionando
// -----------------------------------------
app.get('/', (req, res) => {
    // res.send(): Envía una respuesta de texto simple
    res.send('¡API de Conductores y Automóviles funcionando!');
});

// -----------------------------------------
// ENDPOINT: GET /conductores
// Propósito: Obtener la lista completa de conductores
// Respuesta: Array JSON con todos los conductores
// -----------------------------------------
app.get('/conductores', (req, res) => {
    // Consulta SQL para obtener todos los registros de la tabla conductores
    pool.query('SELECT * FROM conductores', (err, result) => {
        if (err) {
            // Error 500: Internal Server Error - problema en el servidor
            return res.status(500).json({ error: 'Error al consultar conductores' });
        }
        // Código 200: OK - solicitud exitosa
        // result.rows contiene el array de registros devueltos por PostgreSQL
        res.status(200).json(result.rows);
    });
});

// -----------------------------------------
// ENDPOINT: GET /automoviles
// Propósito: Obtener la lista completa de automóviles
// Respuesta: Array JSON con todos los automóviles
// -----------------------------------------
app.get('/automoviles', (req, res) => {
    // Consulta SQL para obtener todos los registros de la tabla automoviles
    pool.query('SELECT * FROM automoviles', (err, result) => {
        if (err) {
            // Error 500: Internal Server Error - problema en el servidor
            return res.status(500).json({ error: 'Error al consultar automoviles' });
        }
        // Código 200: OK - solicitud exitosa
        res.status(200).json(result.rows);
    });
});

// -----------------------------------------
// ENDPOINT: GET /conductoressinauto?edad=<numero>
// Propósito: Obtener conductores sin automóvil y con edad mayor o igual al parámetro
// Parámetro: edad (query string) - número entero
// Respuesta: Array JSON con conductores filtrados
// -----------------------------------------
app.get('/conductoressinauto', (req, res) => {
    // req.query.edad: Obtiene el parámetro "edad" de la URL (ej: ?edad=30)
    const edad = req.query.edad;

    // parseInt(): Convierte el string a número entero
    // El segundo parámetro (10) indica base decimal
    const edadNum = parseInt(edad, 10);

    // Number.isNaN(): Verifica si el valor NO es un número válido
    if (Number.isNaN(edadNum)) {
        // Error 400: Bad Request - el cliente envió datos inválidos
        return res.status(400).json({ error: 'El parámetro edad es obligatorio y debe ser un número' });
    }

    // Consulta SQL con LEFT JOIN para encontrar conductores sin auto
    // LEFT JOIN: Incluye todos los conductores, aunque no tengan auto
    // WHERE a.nombre_conductor IS NULL: Filtra solo los que NO tienen auto
    // $1: Placeholder para el parámetro (evita SQL Injection)
    const sql = `
    SELECT c.*
    FROM conductores c
    LEFT JOIN automoviles a ON c.nombre = a.nombre_conductor
    WHERE a.nombre_conductor IS NULL
      AND c.edad >= $1
  `;

    // pool.query con parámetros: [edadNum] reemplaza $1 en la consulta
    pool.query(sql, [edadNum], (err, result) => {
        if (err) {
            // Error 500: Internal Server Error
            return res.status(500).json({ error: 'Error al consultar conductores sin auto' });
        }
        // Código 200: OK - responde con los datos filtrados
        res.status(200).json(result.rows);
    });
});

// -----------------------------------------
// ENDPOINT: GET /solitos
// Propósito: Obtener conductores sin auto Y autos sin conductor
// Respuesta: Array JSON con registros "huérfanos" de ambas tablas
// -----------------------------------------
app.get('/solitos', (req, res) => {
    // FULL OUTER JOIN: Combina ambas tablas incluyendo registros sin coincidencia
    // WHERE c.nombre IS NULL: Autos cuyo conductor no existe en la tabla conductores
    // OR a.nombre_conductor IS NULL: Conductores que no tienen auto
    const sql = `
    SELECT c.nombre, c.edad, a.marca, a.patente, a.nombre_conductor
    FROM conductores c
    FULL OUTER JOIN automoviles a ON c.nombre = a.nombre_conductor
    WHERE c.nombre IS NULL OR a.nombre_conductor IS NULL
  `;

    pool.query(sql, (err, result) => {
        if (err) {
            // Error 500: Internal Server Error
            return res.status(500).json({ error: 'Error al consultar solitos' });
        }
        // Código 200: OK - responde con los registros huérfanos
        res.status(200).json(result.rows);
    });
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================

// app.listen(): Inicia el servidor en el puerto especificado
// El callback se ejecuta cuando el servidor está listo
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// -----------------------------------------
// ENDPOINT: GET /auto
// Propósito: Buscar auto por patente exacta o por inicio de patente
// Parámetros (query string):
//   - patente: búsqueda exacta
//   - iniciopatente: búsqueda por inicio (LIKE)
// -----------------------------------------
app.get('/auto', (req, res) => {
    // Aquí irá la logica
    const patente = req.query.patente; //ej: ?patente=HXJH55
    const iniciopatente = req.query.iniciopatente; //ej: ?iniciopatente=H
    // PASO 3: Validar que al menos un parámetro exista
    // Si ambos son undefined, null o vacíos, respondemos con error 400
    if (!patente && !iniciopatente) {
        // return: Detiene la ejecución aquí y envía la respuesta
        // 400 Bad Request: El cliente no envió los datos necesarios
        return res.status(400).json({
            error: 'Debe proporcionar el parámetro "patente" o "iniciopatente"'
        });
    }
    // PASO 4: Determinar qué consulta ejecutar según el parámetro recibido
    // Usamos let porque el valor cambiará según la condición
    let sql;
    let params;

    if (patente) {
        // CASO 1: Búsqueda exacta por patente completa
        // Operador = : coincidencia exacta
        sql = `
      SELECT a.*, c.edad
      FROM automoviles a
      LEFT JOIN conductores c ON a.nombre_conductor = c.nombre
      WHERE a.patente = $1
    `;
        params = [patente]; // El valor reemplaza a $1
    } else if (iniciopatente) {
        // CASO 2: Búsqueda por inicio de patente
        // Operador LIKE con % : coincidencia parcial
        // El % significa "cualquier cantidad de caracteres después"
        sql = `
      SELECT a.*, c.edad
      FROM automoviles a
      LEFT JOIN conductores c ON a.nombre_conductor = c.nombre
      WHERE a.patente LIKE $1
    `;
        // Concatenamos el % al valor para que LIKE funcione correctamente
        params = [iniciopatente + '%']; // Ej: 'H' se convierte en 'H%'
    }
    // PASO 5: Ejecutar la consulta SQL
    // pool.query recibe: consulta SQL, array de parámetros, función callback
    pool.query(sql, params, (err, result) => {
        // 5.1: Manejar error de base de datos
        if (err) {
            // Error 500: Problema interno del servidor
            console.error('Error en la consulta:', err); // Log para debugging
            return res.status(500).json({ error: 'Error al buscar automóvil' });
        }

        // 5.2: Verificar si se encontraron resultados
        if (result.rows.length === 0) {
            // Error 404: No se encontró el recurso solicitado
            return res.status(404).json({
                mensaje: 'No se encontraron automóviles con los criterios especificados'
            });
        }

        // 5.3: Responder con los datos encontrados
        // Código 200: Solicitud exitosa
        res.status(200).json(result.rows);
    });
});
