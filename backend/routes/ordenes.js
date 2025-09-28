const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// POST /ordenes
router.post('/', async (req, res) => {
  const { cliente_id, platillo_nombre, notes } = req.body;
  
  // Validar campos requeridos
  if (!cliente_id || !platillo_nombre) {
    return res.status(400).json({ 
      error: 'Los campos cliente_id y platillo_nombre son requeridos' 
    });
  }
  
  try {
    console.log('Intentando crear orden:', { cliente_id, platillo_nombre, notes });
    
    const result = await pool.query(
      'INSERT INTO ordenes (cliente_id, platillo_nombre, notes) VALUES ($1, $2, $3) RETURNING *',
      [cliente_id, platillo_nombre, notes || null]
    );
    
    console.log('Orden creada exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando orden:', error);
    
    // Verificar si el cliente existe
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'El cliente no existe' });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor al crear la orden',
      details: error.message 
    });
  }
});

// GET /ordenes/:clienteId
router.get('/:clienteId', async (req, res) => {
  const { clienteId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM ordenes WHERE cliente_id = $1 ORDER BY creado DESC',
      [clienteId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /ordenes/:id/estado
router.put('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  // Validar estado
  const estadosValidos = ['pending', 'preparing', 'delivered'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado inválido. Use: pending, preparing o delivered' 
    });
  }
  
  try {
    const result = await pool.query(
      'UPDATE ordenes SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;