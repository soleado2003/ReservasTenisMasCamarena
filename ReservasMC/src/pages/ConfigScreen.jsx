import { useState, useEffect } from 'react';
import { fetchWithToken } from '../services/api';

function ConfigScreen() {
  const [config, setConfig] = useState({
       max_hours_day: 0,
       max_hours_week: 0,
       // nuevos parámetros de reservas
       daily_bookings_limit: 0,
       min_slots_per_booking: 0,
       max_slots_per_booking: 0,
       weekly_slots_limit: 0,
       // resto de configuraciones
       send_verification_email: false,
       registration_text: '',
       verification_email_text: '',
       notification_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getConfig = async () => {
    try {
      const data = await fetchWithToken(import.meta.env.VITE_API_URL + '/config');
      setConfig(data);
    } catch (err) {
      console.error('Error al obtener la configuración', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('Guardando configuración...');
      await fetchWithToken(import.meta.env.VITE_API_URL + '/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setMessage('Configuración actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar la configuración', err);
      setMessage('Error al actualizar la configuración');
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Opciones de la Aplicación</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* <div style={{ marginBottom: '15px' }}>
          <label>Horas máximas por día: </label>
          <input
            type="number"
            name="max_hours_day"
            value={config.max_hours_day}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Horas máximas por semana: </label>
          <input
            type="number"
            name="max_hours_week"
            value={config.max_hours_week}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div> */}
{/* Nuevos parámetros de reservas  */}
       <div style={{ marginBottom: '15px' }}>
         <label>Límite reservas por día: </label>
         <input
           type="number"
           name="daily_bookings_limit"
           value={config.daily_bookings_limit}
           onChange={handleChange}
           style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
         />
       </div>
       <div style={{ marginBottom: '15px' }}>
         <label>Slots mínimos por reserva: </label>
         <input
           type="number"
           name="min_slots_per_booking"
           value={config.min_slots_per_booking}
           onChange={handleChange}
           style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
       </div>
       <div style={{ marginBottom: '15px' }}>
         <label>Slots máximos por reserva: </label>
         <input
           type="number"
           name="max_slots_per_booking"
           value={config.max_slots_per_booking}
           onChange={handleChange}
           style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
         />
       </div>
       <div style={{ marginBottom: '15px' }}>
         <label>Slots máximos por semana: </label>
         <input
           type="number"
           name="weekly_slots_limit"
           value={config.weekly_slots_limit}
           onChange={handleChange}
           style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
         />
       </div>
{/* Nuevos parámetros de reservas  */}

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              name="send_verification_email"
              checked={config.send_verification_email}
              onChange={handleChange}
            />
            Enviar correo después de verificar el usuario
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Texto de registro:</label>
          <textarea
            name="registration_text"
            value={config.registration_text}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Texto del correo de verificación:</label>
          <textarea
            name="verification_email_text"
            value={config.verification_email_text}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Email para notificaciones:
          </label>
          <input
            type="email"
            name="notification_email"
            value={config.notification_email || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Guardar configuración
        </button>
      </form>
    </div>
  );
}

export default ConfigScreen;