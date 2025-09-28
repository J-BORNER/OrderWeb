const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clientesRoutes = require('./routes/clientes');
const ordenesRoutes = require('./routes/ordenes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz para verificar funcionamiento
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Restaurante funcionando correctamente',
    endpoints: {
      clientes: {
        registrar: 'POST /clientes/registrar',
        login: 'POST /clientes/login'
      },
      ordenes: {
        crear: 'POST /ordenes',
        listar: 'GET /ordenes/:clienteId',
        actualizar: 'PUT /ordenes/:id/estado'
      }
    }
  });
});

// Rutas de la API
app.use('/clientes', clientesRoutes);
app.use('/ordenes', ordenesRoutes);

// ✅ CORREGIDO: Manejar rutas no encontradas (sin '*')
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});