const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// POST /clientes/registrar
router.post('/registrar', async (req, res) => {
  const { nombre, email, telefono } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, telefono]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
});

// POST /clientes/login
router.post('/login', async (req, res) => {
  const { email, telefono } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE email = $1 AND telefono = $2',
      [email, telefono]
    );
    
    if (result.rows.length > 0) {
      res.json({ success: true, cliente: result.rows[0] });
    } else {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;