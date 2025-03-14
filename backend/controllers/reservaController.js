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

exports.createReserva = async (req, res) => {
  try {
    // Verificar si el usuario está verificado
    const [userRows] = await db.query('SELECT verificado FROM `User` WHERE email = ?', [req.user.email]);
    if (userRows.length === 0 || !userRows[0].verificado) {
      return res.status(422).json({   
        message: 'No puedes reservar pistas hasta que el administrador verifique tu información.' 
      });
    }
    const user_email = req.user.email;
    const { pista_id, fecha, horaInicio, horaFin, precio } = req.body;

    // Validaciones
    if (!pista_id || !fecha || !horaInicio || !horaFin || !precio) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos',
        received: { pista_id, fecha, horaInicio, horaFin, precio }
      });
    }

    // Verificar disponibilidad
    const [existingReserva] = await db.query(
      'SELECT * FROM Reserva WHERE pista_id = ? AND fecha = ? AND horaInicio = ?',
      [pista_id, fecha, horaInicio]
    );

    if (existingReserva.length > 0) {
      return res.status(409).json({ message: 'La pista ya está reservada para ese horario' });
    }

    // Crear la reserva
    await db.query(
      'INSERT INTO Reserva (user_email, pista_id, fecha, horaInicio, horaFin, precio) VALUES (?, ?, ?, ?, ?, ?)',
      [user_email, pista_id, fecha, horaInicio, horaFin, precio]
    );

    res.status(201).json({ message: 'Reserva creada exitosamente' });
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
