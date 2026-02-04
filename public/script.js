// ============================================
// CONFIGURACIÓN
// ============================================

// URL base de la API
const API_URL = 'http://localhost:3000';

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Muestra el estado de carga
function mostrarCargando() {
    document.getElementById('resultsContainer').innerHTML = `
        <div class="loading">
            <div class="loading-spinner">⚙️</div>
            <p style="margin-top: 15px;">Consultando registros...</p>
        </div>
    `;
}

// Muestra un mensaje de error
function mostrarError(mensaje) {
    document.getElementById('resultsContainer').innerHTML = `
        <div class="error-message">
            ⚠️ ${mensaje}
        </div>
    `;
    document.getElementById('resultsCount').textContent = '0 registros';
}

// Muestra mensaje cuando no hay resultados
function mostrarVacio() {
    document.getElementById('resultsContainer').innerHTML = `
        <div class="empty-message">
            <div class="icon">🔍</div>
            <p>No se encontraron registros con los criterios especificados</p>
        </div>
    `;
    document.getElementById('resultsCount').textContent = '0 registros';
}

// Actualiza el título y contador de resultados
function actualizarHeader(titulo, cantidad) {
    document.getElementById('resultsTitulo').textContent = titulo;
    document.getElementById('resultsCount').textContent = `${cantidad} registro${cantidad !== 1 ? 's' : ''}`;
}

// ============================================
// RENDERIZADO DE TARJETAS
// ============================================

// Renderiza tarjetas de conductores
function renderizarConductores(conductores) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = conductores.map(conductor => `
        <div class="card">
            <div class="card-icon">👤</div>
            <h3>${conductor.nombre}</h3>
            <div class="card-info">
                <p>
                    <span class="card-label">Edad:</span>
                    <span class="card-value">${conductor.edad} años</span>
                </p>
            </div>
        </div>
    `).join('');
}

// Renderiza tarjetas de automóviles
function renderizarAutomoviles(automoviles) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = automoviles.map(auto => `
        <div class="card">
            <div class="card-icon">🚗</div>
            <h3>${auto.marca}</h3>
            <div class="card-info">
                <p>
                    <span class="card-label">Patente:</span>
                    <span class="card-value">${auto.patente}</span>
                </p>
                <p>
                    <span class="card-label">Conductor:</span>
                    <span class="card-value">${auto.nombre_conductor}</span>
                </p>
                ${auto.edad ? `
                <p>
                    <span class="card-label">Edad:</span>
                    <span class="card-value">${auto.edad} años</span>
                </p>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Renderiza tarjetas de "solitos" (conductores sin auto y autos sin conductor)
function renderizarSolitos(registros) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = registros.map(registro => {
        // Si tiene nombre pero no patente = conductor sin auto
        if (registro.nombre && !registro.patente) {
            return `
                <div class="card">
                    <div class="card-icon">👤❌🚗</div>
                    <h3>${registro.nombre}</h3>
                    <div class="card-info">
                        <p>
                            <span class="card-label">Edad:</span>
                            <span class="card-value">${registro.edad} años</span>
                        </p>
                        <p>
                            <span class="card-label">Estado:</span>
                            <span class="card-value" style="color: #B22234;">Sin automóvil</span>
                        </p>
                    </div>
                </div>
            `;
        }
        // Si tiene patente pero no nombre = auto sin conductor registrado
        else {
            return `
                <div class="card">
                    <div class="card-icon">🚗❌👤</div>
                    <h3>${registro.marca || 'Auto sin marca'}</h3>
                    <div class="card-info">
                        <p>
                            <span class="card-label">Patente:</span>
                            <span class="card-value">${registro.patente}</span>
                        </p>
                        <p>
                            <span class="card-label">Conductor asignado:</span>
                            <span class="card-value">${registro.nombre_conductor}</span>
                        </p>
                        <p>
                            <span class="card-label">Estado:</span>
                            <span class="card-value" style="color: #B22234;">Conductor no registrado</span>
                        </p>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// ============================================
// FUNCIONES DE CONSUMO DE API (fetch)
// ============================================

// Cargar todos los conductores
async function cargarConductores() {
    mostrarCargando();
    try {
        const response = await fetch(`${API_URL}/conductores`);
        if (!response.ok) throw new Error('Error al obtener conductores');
        const data = await response.json();

        if (data.length === 0) {
            mostrarVacio();
            return;
        }

        actualizarHeader('Conductores', data.length);
        renderizarConductores(data);
    } catch (error) {
        mostrarError('No se pudieron cargar los conductores. ¿Está el servidor activo?');
        console.error(error);
    }
}

// Cargar todos los automóviles
async function cargarAutomoviles() {
    mostrarCargando();
    try {
        const response = await fetch(`${API_URL}/automoviles`);
        if (!response.ok) throw new Error('Error al obtener automóviles');
        const data = await response.json();

        if (data.length === 0) {
            mostrarVacio();
            return;
        }

        actualizarHeader('Automóviles', data.length);
        renderizarAutomoviles(data);
    } catch (error) {
        mostrarError('No se pudieron cargar los automóviles. ¿Está el servidor activo?');
        console.error(error);
    }
}

// Cargar conductores sin auto y autos sin conductor
async function cargarSolitos() {
    mostrarCargando();
    try {
        const response = await fetch(`${API_URL}/solitos`);
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();

        if (data.length === 0) {
            mostrarVacio();
            return;
        }

        actualizarHeader('Sin Pareja (Conductores sin auto / Autos sin conductor)', data.length);
        renderizarSolitos(data);
    } catch (error) {
        mostrarError('No se pudieron cargar los datos. ¿Está el servidor activo?');
        console.error(error);
    }
}

// Buscar conductores sin auto por edad mínima
async function buscarPorEdad() {
    const edad = document.getElementById('edadInput').value;

    if (!edad || edad < 1) {
        mostrarError('Por favor, ingresa una edad válida');
        return;
    }

    mostrarCargando();
    try {
        const response = await fetch(`${API_URL}/conductoressinauto?edad=${edad}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la búsqueda');
        }
        const data = await response.json();

        if (data.length === 0) {
            mostrarVacio();
            actualizarHeader(`Conductores sin auto (edad ≥ ${edad})`, 0);
            return;
        }

        actualizarHeader(`Conductores sin auto (edad ≥ ${edad})`, data.length);
        renderizarConductores(data);
    } catch (error) {
        mostrarError(error.message);
        console.error(error);
    }
}

// Buscar automóvil por patente exacta
async function buscarPorPatente() {
    const patente = document.getElementById('patenteInput').value.trim().toUpperCase();

    if (!patente) {
        mostrarError('Por favor, ingresa una patente');
        return;
    }

    mostrarCargando();
    try {
        const response = await fetch(`${API_URL}/auto?patente=${patente}`);
        if (response.status === 404) {
            mostrarVacio();
            actualizarHeader(`Búsqueda: "${patente}"`, 0);
            return;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la búsqueda');
        }
        const data = await response.json();

        actualizarHeader(`Resultado para patente: "${patente}"`, data.length);
        renderizarAutomoviles(data);
    } catch (error) {
        mostrarError(error.message);
        console.error(error);
    }
}

// Buscar automóviles por inicio de patente
async function buscarPorInicioPatente() {
    const inicio = document.getElementById('inicioPatenteInput').value.trim().toUpperCase();

    if (!inicio) {
        mostrarError('Por favor, ingresa el inicio de la patente');
        return;
    }

    mostrarCargando();
    try {
        const response = await fetch(`${API_URL}/auto?iniciopatente=${inicio}`);
        if (response.status === 404) {
            mostrarVacio();
            actualizarHeader(`Patentes que inician con: "${inicio}"`, 0);
            return;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la búsqueda');
        }
        const data = await response.json();

        actualizarHeader(`Patentes que inician con: "${inicio}"`, data.length);
        renderizarAutomoviles(data);
    } catch (error) {
        mostrarError(error.message);
        console.error(error);
    }
}

// ============================================
// EVENTOS DE TECLADO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('edadInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarPorEdad();
    });

    document.getElementById('patenteInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarPorPatente();
    });

    document.getElementById('inicioPatenteInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarPorInicioPatente();
    });
});
