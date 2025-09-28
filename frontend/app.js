const API_URL = 'https://orderweb-cj5b.onrender.com'; // Cambiar por tu URL de Render

let currentClient = null;

// Registro de cliente
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cliente = {
        nombre: document.getElementById('reg-nombre').value,
        email: document.getElementById('reg-email').value,
        telefono: document.getElementById('reg-telefono').value
    };
    
    try {
        const response = await fetch(`${API_URL}/clientes/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Cliente registrado exitosamente');
            document.getElementById('register-form').reset();
        } else {
            alert(result.error);
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

// Login de cliente
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const credentials = {
        email: document.getElementById('login-email').value,
        telefono: document.getElementById('login-telefono').value
    };
    
    try {
        const response = await fetch(`${API_URL}/clientes/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentClient = result.cliente;
            showMainSection();
            loadOrders();
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        alert('Error de conexión');
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
    
    try {
        const response = await fetch(`${API_URL}/ordenes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orden)
        });
        
        if (response.ok) {
            document.getElementById('order-form').reset();
            loadOrders();
        } else {
            alert('Error al crear orden');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

// Cargar órdenes del cliente
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/ordenes/${currentClient.id}`);
        const orders = await response.json();
        
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <p><strong>Platillo:</strong> ${order.platillo_nombre}</p>
                <p><strong>Notas:</strong> ${order.notes || 'Ninguna'}</p>
                <p><strong>Estado:</strong> <span class="estado">${getEstadoText(order.estado)}</span></p>
                <p><strong>Fecha:</strong> ${new Date(order.creado).toLocaleString()}</p>
                ${order.estado !== 'delivered' ? 
                    `<button class="estado-btn" onclick="updateOrderStatus(${order.id}, '${getNextStatus(order.estado)}')">
                        Avanzar Estado
                    </button>` : ''
                }
            `;
            ordersList.appendChild(orderElement);
        });
    } catch (error) {
        console.error('Error cargando órdenes:', error);
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
            loadOrders();
        }
    } catch (error) {
        alert('Error actualizando estado');
    }
}

// Funciones auxiliares
function getEstadoText(estado) {
    const estados = {
        'pending': 'Pendiente',
        'preparing': 'En preparación',
        'delivered': 'Entregado'
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
}

function logout() {
    currentClient = null;
    document.getElementById('main-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
}