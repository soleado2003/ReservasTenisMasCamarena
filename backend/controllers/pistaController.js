const db = require('../config/db');

exports.getPistas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Pista');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las pistas' });
  }
};

exports.createPista = async (req, res) => {
  // Solo admin
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const {  tipo, formato } = req.body;
    await db.query('INSERT INTO Pista ( tipo, formato) VALUES ( ?, ?)', [ tipo, formato]);
    res.status(201).json({ message: 'Pista creada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la pista' });
  }
};

exports.updatePista = async (req, res) => {
  // Solo admin
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const id = req.params.id;
    const { tipo, formato } = req.body;
    await db.query('UPDATE Pista SET tipo = ?, formato = ? WHERE id = ?', [tipo, formato, id]);
    res.json({ message: 'Pista actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la pista' });
  }
};

exports.deletePista = async (req, res) => {
  // Solo admin
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const id = req.params.id;
    await db.query('DELETE FROM Pista WHERE id = ?', [id]);
    res.json({ message: 'Pista eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la pista' });
  }
};
