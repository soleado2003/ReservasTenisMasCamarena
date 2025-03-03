const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener información del club (público)
router.get('/', clubController.getClub);

// Actualizar información del club (solo admin)
router.put('/', authMiddleware, clubController.updateClub);

module.exports = router;
