const db = require('../config/db');

exports.getClub = async (req, res) => {
  try {
    // Se asume que existe un único registro de club
    const [rows] = await db.query('SELECT * FROM Club LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Club no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el club' });
  }
};

exports.updateClub = async (req, res) => {
  // Solo admin debe poder actualizar
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const { cif, nombre, telefono, direccion, descripcion, ciudad, altitud, latitud, horario_id } = req.body;
    await db.query(
      'UPDATE Club SET nombre = ?, telefono = ?, direccion = ?, descripcion = ?, ciudad = ?, altitud = ?, latitud = ?, horario_id = ? WHERE cif = ?',
      [nombre, telefono, direccion, descripcion, ciudad, altitud, latitud, horario_id, cif]
    );
    res.json({ message: 'Club actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el club' });
  }
};
