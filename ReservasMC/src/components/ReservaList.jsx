import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../services/api';
import { format, isAfter } from 'date-fns'; // Añadir isAfter
import '../styles/ReservaList.css';

function ReservaList() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const data = await fetchWithToken(import.meta.env.VITE_API_URL + '/reservas/user');
      
      // Ordena las reservas por fecha y luego por hora de inicio
      const sortedReservas = data.sort((a, b) => {
        // Se crea una fecha completa combinando 'fecha' y 'horaInicio'
        const dateA = new Date(`${a.fecha}T${a.horaInicio || '00:00'}`);
        const dateB = new Date(`${b.fecha}T${b.horaInicio || '00:00'}`);
        return dateA - dateB;
      });
      
      setReservas(sortedReservas);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      if (error.message.includes('No token found') || error.message.includes('Token inválido')) {
        navigate('/login');
      } else {
        setError('Error al cargar las reservas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (reservaId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      try {
        await fetchWithToken(`${import.meta.env.VITE_API_URL}/reservas/${reservaId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fetchReservas();
      } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        alert('Error al cancelar la reserva');
      }
    }
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

  useEffect(() => {
    fetchReservas();
  }, [navigate]);

  if (loading) return <p>Cargando reservas...</p>;
  if (error) return <p>{error}</p>;
  if (reservas.length === 0) return <p>No tienes reservas.</p>;

  return (
    <div className="reservas-list">
      <h3>Tus Reservas</h3>
      <table>
        <thead>
          <tr>
            <th>Pista</th>
            <th>Fecha</th>
            <th>Hora Inicio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva, index) => (
            <tr key={reserva.id || `${reserva.pista_id || 'n/a'}-${reserva.horaInicio || 'n/a'}-${index}`}>
              <td>Pista {reserva.pista_id}</td>
              <td>
                {reserva.fecha ? (() => {
                  const dateObj = new Date(reserva.fecha);
                  return isNaN(dateObj.getTime())
                    ? 'Fecha inválida'
                    : format(dateObj, 'dd/MM/yyyy');
                })() : 'No disponible'}
              </td>
              <td>{reserva.horaInicio ? reserva.horaInicio.slice(0, 5) : 'No disponible'}</td>
              <td>
                {isFutureReservation(reserva.fecha, reserva.horaInicio) ? (
                  <button 
                    onClick={() => handleCancelarReserva(reserva.id)}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
                ) : (
                  <span className="anterior">Anterior</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservaList;
