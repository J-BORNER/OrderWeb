const API_URL = 'https://orderweb-cj5b.onrender.com';

let currentClient = null;

// Función para mostrar mensajes estilo PRO
function showMessage(message, type = 'info') {
    // Eliminar mensajes existentes
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type} bounce`;
    messageEl.innerHTML = `
        ${message}
        <div class="particles">
            ${Array.from({ length: 8 }, (_, i) =>
        `<div class="particle" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s;"></div>`
    ).join('')}
        </div>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(messageEl);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 5000);
}

// Mostrar mensaje de bienvenida al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    showMessage('🚀 Bienvenido al Sistema de Órdenes', 'info');
});

// Registro de cliente
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cliente = {
        nombre: document.getElementById('reg-nombre').value,
        email: document.getElementById('reg-email').value,
        telefono: document.getElementById('reg-telefono').value
    };

    // Validación básica
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
        showMessage('❌ Todos los campos son requeridos', 'error');
        return;
    }

    try {
        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Registrando...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_URL}/clientes/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('🎉 ¡Cliente registrado exitosamente!', 'success');
            document.getElementById('register-form').reset();
        } else {
            showMessage(`❌ ${result.error}`, 'error');
        }
    } catch (error) {
        showMessage('🔌 Error de conexión con el servidor', 'error');
        console.error('Error:', error);
    } finally {
        // Restaurar botón
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registrar';
        submitBtn.disabled = false;
    }
});

// Login de cliente
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const credentials = {
        email: document.getElementById('login-email').value,
        telefono: document.getElementById('login-telefono').value
    };

    // Validación básica
    if (!credentials.email || !credentials.telefono) {
        showMessage('❌ Email y teléfono son requeridos', 'error');
        return;
    }

    try {
        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Ingresando...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_URL}/clientes/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();

        if (result.success) {
            currentClient = result.cliente;
            showMessage(`👋 ¡Bienvenido ${result.cliente.nombre}!`, 'success');
            showMainSection();
            loadOrders();
        } else {
            showMessage('🔐 Credenciales incorrectas', 'error');
        }
    } catch (error) {
        showMessage('🔌 Error de conexión con el servidor', 'error');
        console.error('Error:', error);
    } finally {
        // Restaurar botón
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Ingresar';
        submitBtn.disabled = false;
    }
});

// Crear nueva orden
document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const orden = {
        cliente_id: currentClient.id,
        platillo_nombre: document.getElementById('platillo-nombre').value,
        notes: document.getElementById('platillo-notes').value
    };

    // Validación básica
    if (!orden.platillo_nombre) {
        showMessage('❌ El nombre del platillo es requerido', 'error');
        return;
    }

    try {
        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Creando orden...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_URL}/ordenes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orden)
        });

        if (response.ok) {
            showMessage('🍕 ¡Orden creada exitosamente!', 'success');
            document.getElementById('order-form').reset();
            loadOrders();
        } else {
            const errorData = await response.json();
            showMessage(`❌ ${errorData.error || 'Error al crear orden'}`, 'error');
        }
    } catch (error) {
        showMessage('🔌 Error de conexión con el servidor', 'error');
        console.error('Error:', error);
    } finally {
        // Restaurar botón
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Crear Orden';
        submitBtn.disabled = false;
    }
});

// Cargar órdenes del cliente
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/ordenes/${currentClient.id}`);

        if (!response.ok) {
            throw new Error('Error al cargar órdenes');
        }

        const orders = await response.json();

        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="order-item" style="text-align: center; color: #666;">
                    <p>📝 No tienes órdenes aún</p>
                    <p><small>Crea tu primera orden arriba</small></p>
                </div>
            `;
            return;
        }

        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <p><strong>Platillo:</strong> ${order.platillo_nombre}</p>
                <p><strong>Notas:</strong> ${order.notes || 'Ninguna'}</p>
                <p><strong>Estado:</strong> <span class="estado" data-estado="${order.estado}">${getEstadoText(order.estado)}</span></p>
                <p><strong>Fecha:</strong> ${new Date(order.creado).toLocaleString()}</p>
                ${order.estado !== 'delivered' ?
                    `<button class="estado-btn" onclick="updateOrderStatus(${order.id}, '${getNextStatus(order.estado)}')">
                        Avanzar Estado
                    </button>` :
                    `<button class="estado-btn" style="background: linear-gradient(135deg, #27ae60, #2ecc71);" disabled>
                        ✅ Entregado
                    </button>`
                }
            `;
            ordersList.appendChild(orderElement);
        });

        // Actualizar badge de órdenes
        updateOrdersBadge(orders.length);

    } catch (error) {
        console.error('Error cargando órdenes:', error);
        showMessage('❌ Error al cargar las órdenes', 'error');
    }
}

// Actualizar estado de orden
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/ordenes/${orderId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: newStatus })
        });

        if (response.ok) {
            showMessage('🔄 Estado actualizado correctamente', 'success');
            loadOrders();
        } else {
            const errorData = await response.json();
            showMessage(`❌ ${errorData.error || 'Error actualizando estado'}`, 'error');
        }
    } catch (error) {
        showMessage('🔌 Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Funciones auxiliares
function getEstadoText(estado) {
    const estados = {
        'pending': '⏳ Pendiente',
        'preparing': '👨‍🍳 En preparación',
        'delivered': '✅ Entregado'
    };
    return estados[estado] || estado;
}

function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'preparing',
        'preparing': 'delivered'
    };
    return statusFlow[currentStatus];
}

function showMainSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    document.getElementById('client-name').textContent = currentClient.nombre;

    // Agregar badge al título si no existe
    const ordersTitle = document.querySelector('#main-section .card h3');
    if (ordersTitle && !ordersTitle.querySelector('.order-badge')) {
        const badge = document.createElement('span');
        badge.className = 'order-badge';
        badge.id = 'orders-badge';
        badge.textContent = '0';
        ordersTitle.appendChild(badge);
    }
}

function updateOrdersBadge(count) {
    const badge = document.getElementById('orders-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function logout() {
    currentClient = null;
    document.getElementById('main-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    showMessage('👋 Sesión cerrada correctamente', 'info');
}

// Efectos adicionales para mejorar la UX
document.addEventListener('DOMContentLoaded', function () {
    // Agregar efectos de hover a todos los botones
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // Agregar efectos a los inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateY(-2px)';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Auto-focus en el primer input del login
    const loginEmail = document.getElementById('login-email');
    if (loginEmail) {
        setTimeout(() => {
            loginEmail.focus();
        }, 1000);
    }
});

// Función para limpiar todos los formularios
function clearAllForms() {
    document.getElementById('register-form').reset();
    document.getElementById('login-form').reset();
    if (document.getElementById('order-form')) {
        document.getElementById('order-form').reset();
    }
}

// Manejar errores no capturados
window.addEventListener('error', function (e) {
    console.error('Error global:', e.error);
    showMessage('⚠️ Ocurrió un error inesperado', 'error');
});

// Confirmar antes de recargar si hay datos
window.addEventListener('beforeunload', function (e) {
    if (currentClient) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Se perderán los datos no guardados.';
    }
});

// ===== TOGGLE MODO CLARO/OSCURO =====
// Toggle Theme Functionality
function initThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.title = 'Cambiar tema';
    themeToggle.onclick = toggleTheme;

    document.querySelector('.container').appendChild(themeToggle);

    // Check for saved theme or prefer color scheme
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' ? '🌙' : '☀️';
    }
}

// Initialize theme when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
});