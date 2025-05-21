import { useState, useEffect } from 'react';
import { fetchWithToken } from '../services/api';
import ConfigScreen from './ConfigScreen';
import ReservaMasiva from '../components/ReservaMasiva';
import ReservaList from '../components/ReservaList';

const SECTORES = [
  'ADRIANA', 'ARBOLEDA', 'C.P I', 'C.P II', 'C.P.III', 
  'ESM.I', 'ESM.II', 'ESM.IV', 'ESM.V', 'ESM.VI', 'ESM.VII',
  'FUENTES', 'J.C.I', 'J.C.II', 'J.C.III', 'LOS ALTOS',
  'MONTEBELLO', 'OASIS', 'PARCELAS', 
  'SECTOR A', 'SECTOR B', 'SECTOR C', 'SECTOR D',
  'SECTOR E', 'SECTOR F', 'SECTOR G', 'SECTOR H', 'SECTOR J',
  'VILLAS I', 'VILLAS II', 'VILLAS III'
];

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const today = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy en formato YYYY-MM-DD
  const [startDate, setStartDate] = useState(today); // Inicializar con la fecha de hoy
  const [endDate, setEndDate] = useState(today); // Inicializar con la fecha de hoy
  const [sortConfig, setSortConfig] = useState({ key: 'verificado', direction: 'asc' });

  const fetchUsers = async () => {
    try {
      const data = await fetchWithToken(import.meta.env.VITE_API_URL + '/users');
      setUsers(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchPistas = async () => {
    try {
      const data = await fetchWithToken(import.meta.env.VITE_API_URL + '/pistas');
      setPistas(data);
    } catch (error) {
      console.error('Error al obtener pistas:', error);
    }
  };

  const fetchReservas = async () => {
    try {
      let url = import.meta.env.VITE_API_URL + '/reservas';
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }
      const data = await fetchWithToken(url);

      // Filtrar reservas excluyendo las canceladas (fechaCancelacion definida)
      const filteredReservas = data.filter(reserva => {
        const user = users.find(u => u.email === reserva.user_email);
        return user && !user.admin && (!reserva.fecha_cancelacion || reserva.fecha_cancelacion === null);
      });

      setReservas(filteredReservas);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'pistas') {
      fetchPistas();
    } else if (activeTab === 'reservas') {
      fetchReservas();
    }
  }, [activeTab]);

  const handleVerifyUser = async (user) => {
    if (user.verificado) return;
    // Solicitar al administrador que ingrese el valor para id_ext si desea verificar
    const id_ext = prompt("Ingrese el id_ext para verificar el usuario:");
    if (id_ext === null) return; // Se canceló la acción

    const updatedUser = { 
      nombre: user.nombre, 
      descripcion: user.descripcion, 
      admin: user.admin,
      verificado: true, // Marcar como verificado
      id_ext: id_ext
    };
    try {
      await fetchWithToken(`${import.meta.env.VITE_API_URL}/users/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      fetchUsers();
    } catch (error) {
      console.error('Error al verificar usuario', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleSaveUser = async () => {
    try {
      await fetchWithToken(`${import.meta.env.VITE_API_URL}/users/${editingUser.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editingUser.nombre,
          apellidos: editingUser.apellidos,
          telefono: editingUser.telefono,
          direccion: editingUser.direccion,
          numero: editingUser.numero,
          puerta: editingUser.puerta,
          verificado: editingUser.verificado,
          id_ext: editingUser.id_ext,
          relacion: editingUser.relacion,
          forma_pago: editingUser.forma_pago
        })
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar cambios del usuario', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Convertir `id_ext` a número para ordenación numérica
    if (sortConfig.key === 'id_ext') {
      aValue = aValue ? parseInt(aValue, 10) : 0;
      bValue = bValue ? parseInt(bValue, 10) : 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const groupedReservas = reservas.reduce((groups, reserva) => {
    const key = reserva.user_email;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(reserva);
    return groups;
  }, {});

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5); // Toma solo HH:mm
  };

  const handleTogglePagada = async (reservaId, pagada) => {
    try {
      await fetchWithToken(`${import.meta.env.VITE_API_URL}/reservas/${reservaId}/pagar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagada })
      });
      
      // Actualiza la lista de reservas
      await fetchReservas();
    } catch (error) {
      console.error('Error al actualizar el estado de pago:', error);
      alert('Error al actualizar el estado de pago');
    }
  };

  return (
    <div>
      <h1>Panel de Administración</h1>
      <div>
        <button onClick={() => { setActiveTab('users'); setEditingUser(null); }}>Usuarios</button>
        <button onClick={() => { setActiveTab('pistas'); setEditingUser(null); }}>Pistas</button>
        <button onClick={() => { setActiveTab('reservas'); setEditingUser(null); }}>Reservas</button>
        <button onClick={() => setActiveTab('misReservas')}>Mis Reservas</button>
        <button onClick={() => setActiveTab('config')}>Opciones</button>
        <button onClick={() => setActiveTab('reservaMasiva')}>Reserva Masiva</button>
      </div>

      <div>
        {activeTab === 'misReservas' && (
          <div>
            <h2>Mis Reservas</h2>
            <ReservaList />
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>Usuarios</h2>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
                  <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>Nombre</th>
                  <th onClick={() => handleSort('verificado')} style={{ cursor: 'pointer' }}>Verificado</th>
                  <th onClick={() => handleSort('id_ext')} style={{ cursor: 'pointer' }}>Id_ext</th>
                  <th onClick={() => handleSort('fecha_registro')} style={{ cursor: 'pointer' }}>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(user => (
                  <tr 
                    key={user.email} 
                    onClick={() => handleEditUser(user)} 
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: user.verificado ? 'inherit' : '#fff3cd'
                    }}
                  >
                    <td>{user.email}</td>
                    <td>{user.nombre}</td>
                    <td>{user.verificado ? 'Sí' : 'No'}</td>
                    <td>{user.id_ext || '-'}</td>
                    <td>{formatDate(user.fecha_registro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editingUser && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  height: '100vh',
                  width: '100vw',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                  padding: '20px',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '30px',
                    width: '400px',
                    maxWidth: '100%',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                    Editar usuario: {editingUser.email}
                  </h3>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
                    <input
                      type="text"
                      name="nombre"
                      value={editingUser.nombre}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Apellidos:</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={editingUser.apellidos || ''}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono:</label>
                    <input
                      type="text"
                      name="telefono"
                      value={editingUser.telefono || ''}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Sector:</label>
                    <select
                      name="direccion"
                      value={editingUser.direccion || ''}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    >
                      <option value="">Seleccione un sector</option>
                      {SECTORES.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Dirección:</label>
                    <input
                      type="text"
                      name="direccion"
                      value={editingUser.direccion || ''}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                    <div style={{ flex: '1' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Número:</label>
                      <input
                        type="text"
                        name="numero"
                        value={editingUser.numero || ''}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </div>
                    <div style={{ flex: '1' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Puerta:</label>
                      <input
                        type="text"
                        name="puerta"
                        value={editingUser.puerta || ''}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nsocio:</label>
                    <input
                      type="text"
                      name="id_ext"
                      value={editingUser.id_ext || ''}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Relación:</label>
                    <select
                      name="relacion"
                      value={editingUser.relacion || 'Titular'}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    >
                      <option value="Titular">Titular</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Inquilino">Inquilino</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Forma de Pago:</label>
                    <select
                      name="forma_pago"
                      value={editingUser.forma_pago || 'Pago en Oficina (Efectivo o tarjeta)'}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    >
                      <option value="Pago en Oficina (Efectivo o tarjeta)">Pago en Oficina (Efectivo o tarjeta)</option>
                      <option value="Recibo mensual (Domiciliacion)">Recibo mensual (Domiciliacion)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      onClick={handleSaveUser}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        backgroundColor: '#007BFF',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        border: 'none',
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
        )}
        {activeTab === 'pistas' && (
          <div>
            <h2>Pistas</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Formato</th>
                </tr>
              </thead>
              <tbody>
                {pistas.map(pista => (
                  <tr key={pista.id}>
                    <td>{pista.id}</td>
                    <td>{pista.tipo}</td>
                    <td>{pista.formato}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'reservas' && (
          <div>
            <h2>Reservas</h2>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div>
                  <label style={{ marginRight: '8px' }}>Desde:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div>
                  <label style={{ marginRight: '8px' }}>Hasta:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <button
                  onClick={fetchReservas}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Buscar Reservas
                </button>
              </div>
            </div>

            {Object.entries(groupedReservas).map(([userEmail, reservas]) => {
              // Encontrar el usuario correspondiente para obtener el id_ext
              const usuario = users.find(u => u.email === userEmail);
              const id_ext = usuario ? usuario.id_ext : '-';

              return (
                <div key={userEmail} style={{ marginBottom: '30px' }}>
                  <h3 style={{ 
                    borderBottom: '2px solid #007BFF', 
                    paddingBottom: '10px',
                    marginBottom: '15px' 
                  }}>
                    <span style={{ marginRight: '10px' }}>
                      Socio: {id_ext}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.8em' }}>
                      {userEmail}
                    </span>
                    <span style={{ float: 'right' }}>
                      Reservas: {reservas.length} - 
                      Importe: {reservas.reduce((sum, r) => sum + parseFloat(r.precio || 0), 0)}€
                    </span>
                  </h3>
                  <table style={{ width: '100%', marginBottom: '20px' }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Pista</th>
                        <th>Fecha</th>
                        <th>Inicio</th>
                        <th>Precio</th>
                        <th>Pagada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.map(reserva => (
                        <tr key={reserva.id}>
                          <td>{reserva.id}</td>
                          <td>{reserva.pista_id}</td>
                          <td>{formatDate(reserva.fecha)}</td>
                          <td>{formatTime(reserva.horaInicio)}</td>
                          <td>{reserva.precio}€</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={reserva.pagada || false}
                              onChange={(e) => {
                                e.stopPropagation(); // Evitar que se propague el evento al tr
                                handleTogglePagada(reserva.id, !reserva.pagada);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {selectedReserva && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  height: '100vh',
                  width: '100vw',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                  padding: '20px',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '30px',
                    width: '400px',
                    maxWidth: '100%',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                    Reserva ID: {selectedReserva.id}
                  </h3>
                  <p>Pista: {selectedReserva.pista_id}</p>
                  <p>Fecha: {formatDate(selectedReserva.fecha)}</p>
                  <p>Inicio: {formatTime(selectedReserva.horaInicio)}</p>
                  <p>Precio: {selectedReserva.precio}€</p>
                  <p>Pagada: {selectedReserva.pagada ? 'Sí' : 'No'}</p>
                  <button
                    onClick={() =>
                      handleTogglePagada(selectedReserva.id, !selectedReserva.pagada)
                    }
                    style={{
                      padding: '10px 20px',
                      borderRadius: '4px',
                      backgroundColor: '#007BFF',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: '10px',
                      width: '100%'
                    }}
                  >
                    {selectedReserva.pagada ? 'Desmarcar como pagada' : 'Marcar como pagada'}
                  </button>
                  <button
                    onClick={() => setSelectedReserva(null)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '4px',
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'config' && (
          <ConfigScreen />
        )}
        {activeTab === 'reservaMasiva' && (
          <div>
            <h2>Reserva Masiva</h2>
            <ReservaMasiva />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
