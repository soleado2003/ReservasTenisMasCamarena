const db = require('../config/db');

exports.getConfig = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM AppConfig LIMIT 1");
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la configuración' });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { max_hours_day, max_hours_week, send_verification_email, registration_text, verification_email_text } = req.body;
    const [rows] = await db.query("SELECT * FROM AppConfig LIMIT 1");
    if (rows.length === 0) {
      await db.query(
        `INSERT INTO AppConfig (max_hours_day, max_hours_week, send_verification_email, registration_text, verification_email_text)
        VALUES (?, ?, ?, ?, ?)`,
        [max_hours_day, max_hours_week, send_verification_email, registration_text, verification_email_text]
      );
    } else {
      await db.query(
        `UPDATE AppConfig SET max_hours_day = ?, max_hours_week = ?, send_verification_email = ?, registration_text = ?, verification_email_text = ?
         WHERE id = ?`,
        [max_hours_day, max_hours_week, send_verification_email, registration_text, verification_email_text, rows[0].id]
      );
    }
    res.json({ message: 'Configuración actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la configuración' });
  }
};