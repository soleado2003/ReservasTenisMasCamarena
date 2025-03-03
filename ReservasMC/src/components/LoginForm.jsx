import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin } from '../services/auth';
import { useUser } from '../context/UserContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authLogin({ email, password });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        await login(response.user);
        navigate('/');
      } else {
        setError('Error: Datos de inicio de sesión incorrectos');
      }
    } catch (error) {
      setError('Error al intentar iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Contraseña:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}

export default LoginForm;
