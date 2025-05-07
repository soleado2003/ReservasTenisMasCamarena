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
        r.precio,
        r.pagada,
        r.fecha_creacion
      FROM Reserva r
      WHERE r.user_email = ?
      AND r.fecha_cancelacion IS NULL
      ORDER BY r.fecha, r.horaInicio`,
      [req.user.email]
    );
    res.json(reservas);
  } catch (error) {
    console.error('Error getting user reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
};

exports.createReserva = async (req, res) => {
  try {
    const { user_email, pista_id, fecha, horaInicio, horaFin, precio } = req.body;
    const finalEmail = req.user.admin && user_email ? user_email : req.user.email; //esta linea es para si el usuario es un admin, se puede pasar el email del usuario que hace la reserva, sino se usa el del token

    // 0 Verificar si el usuario está verificado
    const [userRows] = await db.query('SELECT verificado FROM `User` WHERE email = ?', [finalEmail]);
    if (userRows.length === 0 || !userRows[0].verificado) {
      return res.status(422).json({
        message: 'No puedes reservar pistas hasta que el administrador verifique tu informaciónde registro.'
      });
    }

    // 1) Carga de configuración
    const [cfgRows] = await db.query("SELECT * FROM AppConfig LIMIT 1");
    if (!cfgRows.length) return res.status(500).json({ message: 'Configuración no encontrada' });
    const cfg = cfgRows[0];

    // Validaciones
    if (!pista_id || !fecha || !horaInicio || !precio) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        received: { pista_id, fecha, horaInicio, precio }
      });
    }

    // Verificar disponibilidad
    const [existingReserva] = await db.query(
      'SELECT * FROM Reserva WHERE pista_id = ? AND fecha = ? AND horaInicio = ? AND fecha_cancelacion IS NULL',
      [pista_id, fecha, horaInicio]
    );

    if (existingReserva.length > 0) {
      return res.status(409).json({ message: 'La pista ya está reservada para ese horario' });
    }

    // 2) Validar maximo de slots seguidos
    const [existingReservasToday] = await db.query(
      `SELECT 
         COUNT(*) AS count
       FROM Reserva
       WHERE user_email = ? 
         AND fecha = ?
         AND fecha_cancelacion IS NULL`,
      [finalEmail, fecha]
    );

    if (existingReservasToday[0].count >= cfg.max_slots_per_booking) {
       return res.status(400).json({
        message: `No puedes reservar más de ${cfg.max_slots_per_booking * 0.5} hora(s) el mismo dia.`
      });
    }

    // 3) Validar límite semanal de slots
    const bookingDate = new Date(fecha);
    const day = bookingDate.getUTCDay(), diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(bookingDate); monday.setUTCDate(bookingDate.getUTCDate() + diff);
    const sunday = new Date(bookingDate); sunday.setUTCDate(monday.getUTCDate() + 6);
    const fmt = d => d.toISOString().slice(0,10);
    const [existingReservasWeek] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM Reserva 
       WHERE user_email = ? 
         AND fecha BETWEEN ? AND ?
         AND fecha_cancelacion IS NULL`,
      [finalEmail, fmt(monday), fmt(sunday)]
    );

    if (existingReservasWeek[0].count >= cfg.weekly_slots_limit) {
       return res.status(400).json({
        message: `Ya has reservado ${existingReservasWeek[0].count*0.5} horas esta semana. No puedes reservar más de ${cfg.weekly_slots_limit * 0.5} hora(s) por semana.`
      });
    }

    // Crear la reserva
    await db.query(
      'INSERT INTO Reserva (user_email, pista_id, fecha, horaInicio, horaFin, precio) VALUES (?, ?, ?, ?, ?, ?)',
      [finalEmail, pista_id, fecha, horaInicio, horaFin, precio]
    );
      
    res.status(201).json({ message: `Reserva creada correctamente. Has reservado ${(existingReservasWeek[0].count+1) * 0.5} horas esta semana de un máximo de ${cfg.weekly_slots_limit * 0.5} horas.`});
  } catch (error) {
    console.error('Error en createReserva:', error);
    res.status(500).json({
      message: 'Error al crear la reserva',
      error: error.message
    });
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

exports.deleteReserva = async (req, res) => { //Este ya no se usa, se usa el de cancelar reserva
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

// Modificar la consulta en getSchedule
exports.getSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const [reservas] = await db.query(
      `SELECT 
        r.id,
        r.pista_id as court, 
        DATE_FORMAT(r.horaInicio, '%H:%i') as time,
        r.user_email,
        r.tipo_reserva,
        r.texto_reserva,
        r.pagada
      FROM Reserva r 
      WHERE DATE(r.fecha) = ? 
      AND r.fecha_cancelacion IS NULL`,
      [date]
    );
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener el horario:', error);
    res.status(500).json({ message: 'Error al obtener el horario' });
  }
};

// Añadir método para cancelar reserva
exports.cancelReserva = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE Reserva 
       SET fecha_cancelacion = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );
    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
    res.status(500).json({ message: 'Error al cancelar la reserva' });
  }
};

// Añadir método para marcar como pagada
exports.marcarPagada = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE Reserva 
       SET pagada = TRUE 
       WHERE id = ?`,
      [id]
    );
    res.json({ message: 'Reserva marcada como pagada' });
  } catch (error) {
    console.error('Error al marcar la reserva como pagada:', error);
    res.status(500).json({ message: 'Error al marcar la reserva como pagada' });
  }
};
