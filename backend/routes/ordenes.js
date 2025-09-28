const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// POST /ordenes
router.post('/', async (req, res) => {
  const { cliente_id, platillo_nombre, notes } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO ordenes (cliente_id, platillo_nombre, notes) VALUES ($1, $2, $3) RETURNING *',
      [cliente_id, platillo_nombre, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
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
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /ordenes/:id/estado
router.put('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE ordenes SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;