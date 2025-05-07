const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener reservas del usuario autenticado
router.get('/user', authMiddleware, reservaController.getUserReservas);

// Crear nueva reserva (usuario)
router.post('/', authMiddleware, reservaController.createReserva);
router.post('/masiva', authMiddleware, reservaController.createMasiva);

// Gestión de reservas (solo admin)
router.get('/', authMiddleware, reservaController.getAllReservas);
router.put('/:id', authMiddleware, reservaController.updateReserva);
router.delete('/:id', authMiddleware, reservaController.cancelReserva);
router.put('/:id/cancel', authMiddleware, reservaController.cancelReserva);
router.put('/:id/pagar', authMiddleware, reservaController.marcarPagada);

// Obtener el horario (público)
router.get('/schedule', reservaController.getSchedule);

module.exports = router;
