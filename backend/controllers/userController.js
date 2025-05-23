const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const [rows] = await db.query('SELECT email, nombre, apellidos, telefono, direccion, numero, puerta, admin, verificado, id_ext, fecha_registro FROM `User` WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { nombre, descripcion,   password } = req.body;
    
    let query = 'UPDATE `User` SET nombre = ?, descripcion = ?';
    let params = [nombre, descripcion];
    
    // Si se envía una nueva contraseña, la hasheamos
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    query += ' WHERE email = ?';
    params.push(email);
    
    await db.query(query, params);
    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

exports.getAllUsers = async (req, res) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const [rows] = await db.query(
      `
      SELECT 
        email,
        nombre,
        apellidos,
        telefono,
        direccion,
        numero,
        puerta,
        admin,
        verificado,
        id_ext,
        fecha_registro
      FROM User
      ORDER BY verificado ASC, nombre ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const email = req.params.email;
    const {
      nombre,
      apellidos,
      telefono,
      direccion,
      numero,
      puerta,
      verificado,
      id_ext
    } = req.body;
    await db.query(`
      UPDATE User 
      SET nombre = ?,
          apellidos = ?,
          telefono = ?,
          direccion = ?,
          numero = ?,
          puerta = ?,
          verificado = ?,
          id_ext = ?
      WHERE email = ?`,
      [nombre, apellidos, telefono, direccion, numero, puerta, verificado, id_ext, email]
    );
    console.log('Usuario actualizado:', email);
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  // Solo admin
  if (!req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const email = req.params.email;
    await db.query('DELETE FROM `User` WHERE email = ?', [email]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};
