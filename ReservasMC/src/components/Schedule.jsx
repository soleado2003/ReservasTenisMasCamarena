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

  // Añadir estos estados nuevos
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempReservation, setTempReservation] = useState(null);
  // Add new state for payment status
  const [isPaid, setIsPaid] = useState(false);

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

  // Añadir esta función para cargar usuarios
  const fetchUsers = async () => {
    try {
      const data = await fetchWithToken(`${import.meta.env.VITE_API_URL}/users`);
      
      // Filter only verified users and sort by name
      const verifiedUsers = data
        .filter(user => user.verificado)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setUsers(verifiedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error al cargar la lista de usuarios');
    }
  };

  // Modificar la función handleReservar
  const handleReservar = async (court, time) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const courtNumber = parseInt(court.replace('Pista ', ''), 10);
    
    if (user.admin) {
      // Si es admin, guardar los datos de la reserva temporalmente y mostrar el modal
      setTempReservation({
        courtNumber,
        time,
        date: selectedDate
      });
      await fetchUsers(); // Cargar la lista de usuarios
      setShowUserModal(true);
    } else {
      // Si no es admin, proceder con la reserva normal
      createReservation(courtNumber, time, user.email);
    }
  };

  // Añadir esta función para crear la reserva
  const createReservation = async (courtNumber, time, userEmail) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const data = await fetchWithToken(`${import.meta.env.VITE_API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pista_id: courtNumber,
          fecha: formattedDate,
          horaInicio: time,
          precio: 4,
          user_email: userEmail,
          pagada: isPaid // Add the payment status
        })
      });

      await fetchSchedule(selectedDate);
      alert(data.message || 'Reserva creada con éxito');
      setShowUserModal(false);
      setTempReservation(null);
      setSelectedUser(null);
      setIsPaid(false); // Reset payment status
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      alert('Error al realizar la reserva');
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
                        <span className="ocupado">{booking.texto_reserva || 'Ocupado'}</span>
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

      {showUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3>Seleccionar usuario para la reserva</h3>
            <div style={{ marginBottom: '15px' }}>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '15px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Seleccione un usuario</option>
                {users
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map(user => (
                    <option key={user.email} value={user.email}>
                      {user.nombre} ({user.email})
                    </option>
                ))}
              </select>
            </div>
            
            <div style={{ 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type="checkbox"
                id="pagada"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="pagada">Marcar como pagada</label>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  if (selectedUser && tempReservation) {
                    createReservation(
                      tempReservation.courtNumber,
                      tempReservation.time,
                      selectedUser
                    );
                  }
                }}
                disabled={!selectedUser}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedUser ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedUser ? 'pointer' : 'not-allowed'
                }}
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setTempReservation(null);
                  setSelectedUser(null);
                  setIsPaid(false); // Reset payment status when closing
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;