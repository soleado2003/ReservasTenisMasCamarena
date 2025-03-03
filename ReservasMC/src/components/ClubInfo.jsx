import { useEffect, useState } from 'react';
import { fetchWithToken } from '../services/api';

function ClubInfo() {
  const [club, setClub] = useState(null);

  useEffect(() => {
    // Consulta el endpoint público del club (no requiere token)
    fetch(import.meta.env.VITE_API_URL + '/club')
      .then(response => response.json())
      .then(data => setClub(data))
      .catch(error => console.error('Error al obtener el club:', error));
  }, []);

  if (!club) return <p>Cargando información del club...</p>;

  return (
    <div>
      <h2>{club.nombre}</h2>
      <p>{club.descripcion}</p>
      <p>Teléfono: {club.telefono}</p>
      <p>Dirección: {club.direccion}</p>
      <p>Ciudad: {club.ciudad}</p>
    </div>
  );
}

export default ClubInfo;
