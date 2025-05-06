import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { format, isAfter } from 'date-fns'; // Añadir isAfter
import { es } from 'date-fns/locale';
import { fetchWithToken } from '../services/api';
import '../styles/Schedule.css';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useUser();
  const navigate = useNavigate();

  const timeSlots = [
    '08:00', '08:30',
    '09:00', '09:30',
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
    '13:00', '13:30',
    '14:00', '14:30',
    '15:00', '15:30',
    '16:00', '16:30',
    '17:00', '17:30',
    '18:00', '18:30',
    '19:00', '19:30',
    '20:00', '20:30',
    '21:00', '21:30'
  ];
  
  const courts = ['Pista 1', 'Pista 2', 'Pista 3'];

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const fetchSchedule = async (date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const url = `${import.meta.env.VITE_API_URL}/reservas/schedule?date=${formattedDate}`;
      const response = await fetch(url); // Usar fetch en lugar de fetchWithToken
      const data = await response.json();
      setSchedule(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setLoading(false);
    }
  };

  const handleReservar = async (court, time) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const courtNumber = parseInt(court.replace('Pista ', ''), 10);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const data = await fetchWithToken(`${import.meta.env.VITE_API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pista_id: courtNumber,
          fecha: formattedDate,
          horaInicio: time,
          precio: 4
        })
      });

      await fetchSchedule(selectedDate); // Wait for the schedule to update
      alert(data.message || 'Reserva creada con éxito');
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      const errorMessage = error.message ? ` ${error.message}` : '';
      alert(`Error al realizar la reserva. Por favor, inténtelo de nuevo.${errorMessage}`);
    }
  };

  const handleCancelarReserva = async (reservaId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      try {
        await fetchWithToken(`${import.meta.env.VITE_API_URL}/reservas/${reservaId}`, {
          method: 'DELETE'
        });
        fetchSchedule(selectedDate);
      } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        alert('Error al cancelar la reserva');
      }
    }
  };

  const handleDateChange = (event) => {
    const [year, month, day] = event.target.value.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  };

  const isFutureReservation = (fecha, horaInicio) => {
    const now = new Date();
    // Crear una fecha a partir de la fecha y hora de la reserva
    const dateObj = new Date(fecha); // Esto manejará el formato ISO
    // Extraer solo la fecha
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // getMonth() ya devuelve 0-11
    const day = dateObj.getDate();
    
    // Extraer horas y minutos de horaInicio
    const [hours, minutes] = horaInicio.split(':');
    
    // Crear la fecha final de la reserva
    const reservationDate = new Date(year, month, day, hours, minutes);
    return isAfter(reservationDate, now);
  };

  const canMakeReservation = (date, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const reservationDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    return isAfter(reservationDate, now);
  };

  if (loading) return <div>Cargando horarios...</div>;

  return (
    <div className="schedule">
      <div className="schedule-header">
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
        <h3>{format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            {courts.map(court => (
              <th key={court}>{court}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td>{time}</td>
              {courts.map(court => {
                const courtNumber = parseInt(court.replace('Pista ', ''), 10);
                // Buscar si hay una reserva en ese slot (el backend ya filtra por fecha)
                const booking = schedule.find(
                  b => Number(b.court) === courtNumber && b.time === time
                );

                return (
                  <td 
                    key={`${court}-${time}`}
                    className={booking ? 'booked' : 'available'}
                  >
                    {booking ? (
                      user && booking.user_email === user.email ? (
                        // Es la reserva hecha por el usuario logueado
                        isFutureReservation(selectedDate, time) ? (
                          <button 
                            onClick={() => handleCancelarReserva(booking.id)}
                            className="btn-cancelar"
                          >
                            Cancelar
                          </button>
                        ) : (
                          //reservado por mi pero ya ha pasado
                          <span className="anterior">Reservado</span>
                        )
                      ) : (
                        // Reservado por otro
                        <span className="ocupado">Ocupado</span>
                      )
                    ) : (
                      // Slot libre
                      canMakeReservation(selectedDate, time) ? (
                        <button 
                          onClick={() => handleReservar(court, time)}
                          className="btn-reservar"
                        >
                          Reservar
                        </button>
                      ) : (
                        <span className="anterior">Libre</span>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Schedule;