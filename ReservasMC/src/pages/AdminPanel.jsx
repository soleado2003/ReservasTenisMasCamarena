import { useState, useEffect } from 'react';
import { fetchWithToken } from '../services/api';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pistas, setPistas] = useState([]);
  const [reservas, setReservas] = useState([]);

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
      const data = await fetchWithToken(import.meta.env.VITE_API_URL + '/reservas');
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

  return (
    <div>
      <h1>Panel de Administración</h1>
      <div>
        <button onClick={() => setActiveTab('users')}>Usuarios</button>
        <button onClick={() => setActiveTab('pistas')}>Pistas</button>
        <button onClick={() => setActiveTab('reservas')}>Reservas</button>
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
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.email}>
                    <td>{user.email}</td>
                    <td>{user.nombre}</td>
                    <td>{user.admin ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Pista</th>
                  <th>Fecha</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(reserva => (
                  <tr key={reserva.id}>
                    <td>{reserva.id}</td>
                    <td>{reserva.user_email}</td>
                    <td>{reserva.pista_id}</td>
                    <td>{reserva.fecha}</td>
                    <td>{reserva.horaInicio}</td>
                    <td>{reserva.horaFin}</td>
                    <td>{reserva.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
