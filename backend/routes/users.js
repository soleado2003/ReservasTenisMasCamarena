const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, userController.getProfile);

// Actualizar perfil del usuario autenticado
router.put('/profile', authMiddleware, userController.updateProfile);

// Gestión de usuarios (solo admin)
router.get('/', authMiddleware, userController.getAllUsers);
router.put('/:email', authMiddleware, userController.updateUserByAdmin);
router.delete('/:email', authMiddleware, userController.deleteUserByAdmin);

module.exports = router;
