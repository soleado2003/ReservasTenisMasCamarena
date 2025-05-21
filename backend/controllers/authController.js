const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { sendEmail } = require('../services/emailService'); // Asegúrate de tener este servicio
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const {
      email,
      nombre,
      apellidos,
      telefono,
      direccion,
      numero,
      puerta,
      descripcion,
      password,
      id_ext,
      relacion = 'Titular', // Valor por defecto
      forma_pago = 'Pago en Oficina (Efectivo o tarjeta)' // Valor por defecto
    } = req.body;

    // Comprueba campos obligatorios
    if (!email || !nombre || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await db.query('SELECT * FROM `User` WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario incluyendo los nuevos campos
    await db.query(
      `INSERT INTO \`User\` (
        email, nombre, apellidos, telefono, direccion, numero, puerta, password, descripcion, verificado, id_ext, relacion, forma_pago
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        false,
        id_ext || null,
        relacion,
        forma_pago
      ]
    );
    
    // Consultar el mensaje de registro desde la tabla AppConfig
    const [configRows] = await db.query('SELECT registration_text FROM AppConfig LIMIT 1');
    const registrationText = (configRows.length > 0 && configRows[0].registration_text) 
      ? configRows[0].registration_text 
      : 'Usuario registrado exitosamente';
    
    // Get notification email from config
    const [configRowsEmail] = await db.query('SELECT notification_email FROM AppConfig LIMIT 1');
    const notificationEmail = configRowsEmail[0]?.notification_email;

    if (notificationEmail) {
      try {
        // Send notification email
        await sendEmail({
          to: notificationEmail,
          subject: 'Nuevo usuario registrado',
          text: `Un nuevo usuario se ha registrado en el sistema:
                 Email: ${email}
                 Nombre: ${nombre}
                 Fecha: ${new Date().toLocaleString()}`
        });
      } catch (emailError) {
        // Log the error but don't stop the registration process
        console.error('Error sending notification email:', emailError);
      }
    }

    res.status(201).json({ message: registrationText });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
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
    const token = jwt.sign({ email: user.email, admin: user.admin }, config.jwtSecret, { expiresIn: '1y' });
    
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const [user] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'No existe un usuario con ese email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token in database
    await db.query(
      'UPDATE User SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, resetTokenExpiry, email]
    );

    // Construir URL absoluta usando el origin del frontend si está disponible
    let baseUrl = req.headers.origin;
    if (!baseUrl) {
      // Fallback por si la petición viene de Postman o similar
      baseUrl = 'http://localhost:5173';
    }
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Send reset email with better formatting
    await sendEmail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px; 
                      display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
          <p style="color: #666; font-size: 14px;">Si no has solicitado cambiar tu contraseña, puedes ignorar este correo.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="color: #999; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        </div>
      `
    });

    res.json({ message: 'Se ha enviado un email con las instrucciones' });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const [users] = await db.query(
      'SELECT * FROM User WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        message: 'El enlace para restablecer la contraseña es inválido o ha expirado' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await db.query(
      'UPDATE User SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
      [hashedPassword, users[0].email]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};
