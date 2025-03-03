import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await register({ email, nombre, password, descripcion });
      if (response.message) {
        alert(response.message);
        navigate('/login');
      } else {
        alert('Error en el registro');
      }
    } catch (error) {
      console.error('Error en el registro', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={(e)=> setNombre(e.target.value)} required />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea value={descripcion} onChange={(e)=> setDescripcion(e.target.value)}></textarea>
      </div>
      <div>
        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e)=> setPassword(e.target.value)} required />
      </div>
      <div>
        <label>Confirmar Contraseña:</label>
        <input type="password" value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} required />
      </div>
      <button type="submit">Registrarse</button>
    </form>
  );
}

export default RegisterForm;
