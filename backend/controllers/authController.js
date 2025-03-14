const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.register = async (req, res) => {
  try {
    // Añade los nuevos campos a la desestructuración
    const {
      email,
      nombre,
      apellidos,
      telefono,
      direccion,
      numero,
      puerta,
      password,
      descripcion
    } = req.body;

    // Comprueba campos obligatorios
    if (!email || !nombre || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    
    // Verificar si el usuario ya existe
    const [existingUser] = await db.query('SELECT * FROM `User` WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insertar el usuario con verificado en false por defecto
    await db.query(
      `INSERT INTO \`User\` (
        email, nombre, apellidos, telefono, direccion, numero, puerta, password, descripcion, verificado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        nombre,
        apellidos || '',
        telefono || '',
        direccion || '',
        numero || 0,
        puerta || '',
        hashedPassword,
        descripcion || '',
        false
      ]
    );
    
    // Consultar el mensaje de registro desde la tabla AppConfig
    const [configRows] = await db.query('SELECT registration_text FROM AppConfig LIMIT 1');
    const registrationText = (configRows.length > 0 && configRows[0].registration_text) 
      ? configRows[0].registration_text 
      : 'Usuario registrado exitosamente';
    
    res.status(201).json({ message: registrationText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el registro del usuario' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    
    const [users] = await db.query('SELECT * FROM `User` WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Crear token JWT
    const token = jwt.sign({ email: user.email, admin: user.admin }, config.jwtSecret, { expiresIn: '1d' });
    
    // Create a user object without sensitive information
    const userResponse = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      descripcion: user.descripcion,
      admin: user.admin
    };
    
    // Return both token and user data
    res.status(200).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
};
