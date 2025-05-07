import { useState } from 'react';
import { fetchWithToken } from '../services/api';

function ReservaMasiva() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [diasSemana, setDiasSemana] = useState([]);
  const [tipoReserva, setTipoReserva] = useState('escuela');
  const [textoReserva, setTextoReserva] = useState('Escuela');
  const [pista, setPista] = useState(1);

  // Array of valid time slots (30-minute intervals)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30'
  ];

  const diasSemanaOptions = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 0, nombre: 'Domingo' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithToken(`${import.meta.env.VITE_API_URL}/reservas/masiva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio,
          fechaFin,
          diasSemana,
          tipoReserva,
          textoReserva,
          horaInicio,
          horaFin,  // Add this line
          pista_id: pista
        })
      });

      alert('Reservas creadas correctamente');
    } catch (error) {
      console.error('Error al crear reservas:', error);
      alert('Error al crear las reservas');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Contenedor único para fechas, horas, pista y días */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '20px',
          padding: '15px'
        }}>
          {/* Grid de fechas y horas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto auto',
            columnGap: '30px',
            rowGap: '15px',
            marginBottom: '15px'
          }}>
            {/* Columna izquierda: Desde */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Fecha desde:
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  height: '36px' // Altura fija para igualar con el select
                }}
              />
            </div>

            {/* Columna derecha: Hasta */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Fecha hasta:
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  height: '36px' // Altura fija para igualar con el select
                }}
              />
            </div>

            {/* Hora desde */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Hora desde:
              </label>
              <select
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  height: '36px' // Altura fija para igualar con el input date
                }}
              >
                <option value="">Seleccione hora</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            {/* Hora hasta */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Hora hasta:
              </label>
              <select
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  height: '36px' // Altura fija para igualar con el input date
                }}
              >
                <option value="">Seleccione hora</option>
                {timeSlots.filter(slot => slot > horaInicio).map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pista */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Pista:
            </label>
            <select
              value={pista}
              onChange={(e) => setPista(Number(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                height: '36px'
              }}
            >
              <option value={1}>Pista 1</option>
              <option value={2}>Pista 2</option>
              <option value={3}>Pista 3</option>
            </select>
          </div>

          {/* Días de la semana */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Días de la semana:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {diasSemanaOptions.map(dia => (
                <label key={dia.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={diasSemana.includes(dia.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDiasSemana([...diasSemana, dia.id]);
                      } else {
                        setDiasSemana(diasSemana.filter(d => d !== dia.id));
                      }
                    }}
                    style={{ marginRight: '5px' }}
                  />
                  {dia.nombre}
                </label>
              ))}
            </div>
          </div>

          {/* Tipo de Reserva y Texto */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Tipo de Reserva:
              </label>
              <select
                value={tipoReserva}
                onChange={(e) => setTipoReserva(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  height: '36px'
                }}
              >
                <option value="escuela">Escuela</option>
                <option value="admin">Administración</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Texto a mostrar:
              </label>
              <input
                type="text"
                value={textoReserva}
                onChange={(e) => setTextoReserva(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  height: '36px'
                }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Crear Reservas
        </button>
      </form>
    </div>
  );
}

export default ReservaMasiva;