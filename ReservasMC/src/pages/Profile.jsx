import React from 'react';
import { useUser } from '../context/UserContext';
import ReservaList from '../components/ReservaList';
import '../styles/Profile.css';

function Profile() {
  const { user } = useUser();

  return (
    <div className="profile">
      <h3>Perfil de Usuario</h3>
      <div>
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      
      <ReservaList />
    </div>
  );
}

export default Profile;
