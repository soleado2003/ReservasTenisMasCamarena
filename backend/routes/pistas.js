const express = require('express');
const router = express.Router();
const pistaController = require('../controllers/pistaController');
const authMiddleware = require('../middleware/authMiddleware');

// Listar todas las pistas
router.get('/', pistaController.getPistas);

// Crear nueva pista (solo admin)
router.post('/', authMiddleware, pistaController.createPista);

// Actualizar pista (solo admin)
router.put('/:id', authMiddleware, pistaController.updatePista);

// Eliminar pista (solo admin)
router.delete('/:id', authMiddleware, pistaController.deletePista);

module.exports = router;
