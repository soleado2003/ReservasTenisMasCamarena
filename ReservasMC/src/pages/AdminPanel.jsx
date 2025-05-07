import { useState, useEffect } from 'react';
import { fetchWithToken } from '../services/api';
import ConfigScreen from './ConfigScreen';
import ReservaMasiva from '../components/ReservaMasiva'; // Add this import

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      setReservas(data);
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
        body: JSON.stringify(editingUser)
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

  return (
    <div>
      <h1>Panel de Administración</h1>
      <div>
        <button onClick={() => { setActiveTab('users'); setEditingUser(null); }}>Usuarios</button>
        <button onClick={() => { setActiveTab('pistas'); setEditingUser(null); }}>Pistas</button>
        <button onClick={() => { setActiveTab('reservas'); setEditingUser(null); }}>Reservas</button>
        <button onClick={() => setActiveTab('config')}>Opciones</button>
        <button onClick={() => setActiveTab('reservaMasiva')}>Reserva Masiva</button>
      </div>
      <div>
        {activeTab === 'users' && (
          <div>
            <h2>Usuarios</h2>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Admin</th>
                  <th>Verificado</th>
                  <th>Id_ext</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .sort((a, b) => {
                    // Primero ordenar por verificación (no verificados primero)
                    if (a.verificado !== b.verificado) {
                      return a.verificado ? 1 : -1;
                    }
                    // Si tienen el mismo estado de verificación, ordenar por nombre
                    return a.nombre.localeCompare(b.nombre);
                  })
                  .map(user => (
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
                      <td>{user.admin ? 'Sí' : 'No'}</td>
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
                    <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                    <textarea
                      name="descripcion"
                      value={editingUser.descripcion || ''}
                      onChange={handleChange}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    ></textarea>
                  </div>

                  <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flex: '0 0 48%' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Admin:</label>
                      <select
                        name="admin"
                        value={editingUser.admin ? '1' : '0'}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, admin: e.target.value === '1' })
                        }
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      >
                        <option value="0">No</option>
                        <option value="1">Sí</option>
                      </select>
                    </div>
                    <div style={{ flex: '0 0 48%' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Verificado:</label>
                      <select
                        name="verificado"
                        value={editingUser.verificado ? '1' : '0'}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, verificado: e.target.value === '1' })
                        }
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      >
                        <option value="0">No</option>
                        <option value="1">Sí</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Id_ext:</label>
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

            {Object.entries(groupedReservas).map(([userEmail, reservas]) => (
              <div key={userEmail} style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  borderBottom: '2px solid #007BFF', 
                  paddingBottom: '10px',
                  marginBottom: '15px' 
                }}>
                  Usuario: {userEmail}
                  <span style={{ float: 'right' }}>
                    Total reservas: {reservas.length} - 
                    Importe total: {reservas.reduce((sum, r) => sum + parseFloat(r.precio || 0), 0)}€
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
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
