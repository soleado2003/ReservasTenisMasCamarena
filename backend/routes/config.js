const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');

// Solo administradores pueden acceder
router.get('/', authMiddleware, (req, res, next) => {
  if (!req.user.admin) return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, configController.getConfig);

router.put('/', authMiddleware, (req, res, next) => {
  if (!req.user.admin) return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, configController.updateConfig);

module.exports = router;