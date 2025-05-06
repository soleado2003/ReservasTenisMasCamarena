//esta pantalla ya no se usa, pero la dejamos por si acaso. 
// Ahora para reservar se pincha en un slot libre. (pantalla Schedule.jsx))
import { useState, useEffect } from 'react';
import { fetchWithToken } from '../services/api';
import { format } from 'date-fns';

function ReservaForm({ onReservaCreada }) {
  const [pistas, setPistas] = useState([]);
  const [pistaId, setPistaId] = useState('');
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd')); // Hoy por defecto
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  // Fijamos el precio a 4€ de forma predeterminada y no modificable
  const [precio] = useState('4');

  // Crear array de slots de tiempo de 30 minutos
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    timeSlots.push(`${hourStr}:00`);
    if (hour < 20) {
      timeSlots.push(`${hourStr}:30`);
    }
  }

  // Calcular hora fin automáticamente (1 hora después)
  useEffect(() => {
    if (horaInicio) {
      const [hours, minutes] = horaInicio.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setHours(date.getHours() + 1);
      
      const newHoraFin = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      setHoraFin(newHoraFin);
    }
  }, [horaInicio]);

  useEffect(() => {
    // Obtener lista de pistas para llenar el select
    fetch(import.meta.env.VITE_API_URL + '/pistas')
      .then(res => res.json())
      .then(data => setPistas(data))
      .catch(error => console.error('Error al obtener pistas:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithToken(
        `${import.meta.env.VITE_API_URL}/reservas`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            pista_id: pistaId,
            fecha,
            horaInicio,
            horaFin,
            precio
          })
        }
      );
      alert('Reserva creada con éxito3');
      if (onReservaCreada) onReservaCreada();
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('Error al crear reserva');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Pista:</label>
        <select value={pistaId} onChange={(e) => setPistaId(e.target.value)} required>
          <option value="">Selecciona una pista</option>
          {pistas.map(pista => (
            <option key={pista.id} value={pista.id}>
              {pista.tipo} - {pista.formato}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Fecha:</label>
        <input 
          type="date" 
          value={fecha} 
          onChange={(e) => setFecha(e.target.value)} 
          required 
        />
        {/* Mostrar el día completo según la fecha seleccionada */}
        {fecha && (
          <p>
            {format(new Date(fecha), "EEEE d 'de' MMMM 'de' yyyy")}
          </p>
        )}
      </div>
      <div>
        <label>Hora de Inicio:</label>
        <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required>
          <option value="">Selecciona hora de inicio</option>
          {timeSlots.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Hora de Fin:</label>
        <input type="time" value={horaFin} disabled required />
      </div>
      <div>
        <label>Precio:</label>
        {/* Mostramos el precio fijo y deshabilitado */}
        <input type="number" value={precio} disabled />
      </div>
      <button type="submit">Reservar</button>
    </form>
  );
}

export default ReservaForm;
