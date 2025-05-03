const db = require('../config/db');

exports.getUserReservas = async (req, res) => {
  try {
    const [reservas] = await db.query(
      `SELECT 
        r.id,
        r.pista_id,
        r.fecha,
        r.horaInicio,
        r.horaFin,
        r.precio
      FROM Reserva r
      WHERE r.user_email = ?
      ORDER BY r.fecha, r.horaInicio`,
      [req.user.email]
    ); // TODO: aqui hay que cambiarlo oara que haya un id en la tabla user

    res.json(reservas);
  } catch (error) {
    console.error('Error getting user reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
};

// controllers/reservaController.js
exports.createReserva = async (req, res) => {
  try {
    const { user_email, club_cif, pista_id, fecha, horaInicio, horaFin, precio } = req.body;
    const finalEmail = req.user.admin && user_email ? user_email : req.user.email;

    // 1) Carga de configuración
    const [cfgRows] = await db.query("SELECT * FROM AppConfig LIMIT 1");
    if (!cfgRows.length) return res.status(500).json({ message: 'Configuración no encontrada' });
    const cfg = cfgRows[0];

    // 2) Cálculo de slots solicitados
    const toMinutes = s => { const [h,m]=s.split(':').map(Number); return h*60+m; };
    const slots = (toMinutes(horaFin) - toMinutes(horaInicio)) / 30;

    // 3) Primera reserva del día: fuerza mínimo
    const [{ count: todayCount }] = await db.query(
      'SELECT COUNT(*) AS count FROM Reserva WHERE user_email = ? AND fecha = ?',
      [finalEmail, fecha]
    );
    if (todayCount === 0 && slots < cfg.min_slots_per_booking) {
      return res.status(400).json({
        message: `Para tu primera reserva del día debes reservar al menos ${cfg.min_slots_per_booking * 0.5} hora(s).`
      });
    }

    // 4) Validar slots individuales
    if (slots < cfg.min_slots_per_booking || slots > cfg.max_slots_per_booking) {
      return res.status(400).json({
        message: `Cada reserva debe ser de entre ${cfg.min_slots_per_booking * 0.5} y ${cfg.max_slots_per_booking * 0.5} hora(s).`
      });
    }

    // 5) Validar límite semanal de slots
    const bookingDate = new Date(fecha);
    const day = bookingDate.getUTCDay(), diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(bookingDate); monday.setUTCDate(bookingDate.getUTCDate() + diff);
    const sunday = new Date(monday); sunday.setUTCDate(monday.getUTCDate() + 6);
    const fmt = d => d.toISOString().slice(0,10);

    const [[{ total_slots }]] = await db.query(
      `SELECT 
         COALESCE(SUM((TIME_TO_SEC(horaFin)-TIME_TO_SEC(horaInicio))/1800),0) AS total_slots
       FROM Reserva
       WHERE user_email = ? 
         AND fecha BETWEEN ? AND ?`,
      [finalEmail, fmt(monday), fmt(sunday)]
    );
    if (total_slots + slots > cfg.weekly_slots_limit) {
      return res.status(400).json({
        message: `No puedes reservar más de ${cfg.weekly_slots_limit * 0.5} hora(s) por semana.`
      });
    }

    // 6) Insertar si pasa todas las validaciones
    await db.query(
      `INSERT INTO Reserva 
        (user_email, club_cif, pista_id, fecha, horaInicio, horaFin, precio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [finalEmail, club_cif, pista_id, fecha, horaInicio, horaFin, precio]
    );

    res.status(201).json({ message: 'Reserva creada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la reserva' });
  }
};


exports.getAllReservas = async (req, res) => {
  // Solo admin
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM Reserva';
    let params = [];

    // Si tenemos fechas de inicio y fin, añadimos el filtro
    if (start_date && end_date) {
      query += ' WHERE fecha BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    // Ordenamos por fecha y hora
    query += ' ORDER BY fecha, horaInicio';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
};

exports.updateReserva = async (req, res) => {
  // Solo admin
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const id = req.params.id;
    const { user_email,  pista_id, fecha, horaInicio, horaFin, precio } = req.body;
    await db.query(
      'UPDATE Reserva SET user_email = ?,  pista_id = ?, fecha = ?, horaInicio = ?, horaFin = ?, precio = ? WHERE id = ?',
      [user_email, pista_id, fecha, horaInicio, horaFin, precio, id]
    );
    res.json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la reserva' });
  }
};

exports.deleteReserva = async (req, res) => {
  try {
    const id = req.params.id;
    // First check if the reservation belongs to the user
    const [reserva] = await db.query('SELECT * FROM Reserva WHERE id = ?', [id]);
    
    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Allow deletion if user is admin or if the reservation belongs to the user
    if (!req.user.admin && reserva[0].user_email !== req.user.email) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    await db.query('DELETE FROM Reserva WHERE id = ?', [id]);
    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la reserva' });
  }
};

// Modifica getSchedule para incluir el id de la reserva
exports.getSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const [reservas] = await db.query(
      `SELECT 
        r.id,
        r.pista_id as court, 
        DATE_FORMAT(r.horaInicio, '%H:%i') as time,
        r.user_email
      FROM Reserva r 
      WHERE DATE(r.fecha) = ?`,
      [date]
    );
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener el horario:', error);
    res.status(500).json({ message: 'Error al obtener el horario' });
  }
};
