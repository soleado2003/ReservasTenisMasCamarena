// controllers/configController.js
exports.getConfig = async (req, res) => {
  console.log("dami","aqui")
  try {
    const [rows] = await db.query("SELECT * FROM AppConfig LIMIT 1");
    if (!rows.length) return res.status(404).json({ message: 'Configuración no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la configuración' });
  }
};

exports.updateConfig = async (req, res) => {

  try {
    const {
      max_hours_day,     // tu campo original
      max_hours_week,    // tu campo original
      daily_bookings_limit,
      min_slots_per_booking,
      max_slots_per_booking,
      weekly_slots_limit,
      send_verification_email,
      registration_text,
      verification_email_text
    } = req.body;


    const [rows] = await db.query("SELECT * FROM AppConfig LIMIT 1");
    if (!rows.length) {
      // insert
      await db.query(
        `INSERT INTO AppConfig 
          (max_hours_day, max_hours_week,
           daily_bookings_limit, min_slots_per_booking, max_slots_per_booking, weekly_slots_limit,
           send_verification_email, registration_text, verification_email_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          max_hours_day, max_hours_week,
          daily_bookings_limit, min_slots_per_booking, max_slots_per_booking, weekly_slots_limit,
          send_verification_email, registration_text, verification_email_text
        ]
      );
    } else {
      // update
      await db.query(
        `UPDATE AppConfig SET
           max_hours_day         = ?,
           max_hours_week        = ?,
           daily_bookings_limit  = ?,
           min_slots_per_booking = ?,
           max_slots_per_booking = ?,
           weekly_slots_limit    = ?,
           send_verification_email = ?,
           registration_text       = ?,
           verification_email_text = ?
         WHERE id = ?`,
        [
          max_hours_day, max_hours_week,
          daily_bookings_limit, min_slots_per_booking, max_slots_per_booking, weekly_slots_limit,
          send_verification_email, registration_text, verification_email_text,
          rows[0].id
        ]
      );
    }
    res.json({ message: 'Configuración actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la configuración' });
  }
};
