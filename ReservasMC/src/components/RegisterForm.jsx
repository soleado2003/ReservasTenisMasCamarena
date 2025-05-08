import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import '../styles/RegisterForm.css'; // Crearemos este archivo

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numero, setNumero] = useState('');
  const [puerta, setPuerta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await register({
        email,
        nombre,
        apellidos,
        telefono,
        direccion,
        numero,
        puerta,
        descripcion,
        password
      });
      
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
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e)=> setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Nombre:</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e)=> setNombre(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Apellidos:</label>
            <input 
              type="text" 
              value={apellidos} 
              onChange={(e)=> setApellidos(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Teléfono:</label>
            <input 
              type="tel"
              pattern="[0-9]*" 
              value={telefono} 
              onChange={(e)=> setTelefono(e.target.value)} 
            />
          </div>

          <div className="form-group full-width">
            <label>Dirección:</label>
            <input 
              type="text" 
              value={direccion} 
              onChange={(e)=> setDireccion(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Número:</label>
            <input 
              type="number" 
              value={numero} 
              onChange={(e)=> setNumero(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Puerta:</label>
            <input 
              type="text" 
              value={puerta} 
              onChange={(e)=> setPuerta(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e)=> setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña:</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e)=> setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
        </div>

        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterForm;
