import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register'); // Asumiendo que tienes una ruta para registro
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <LoginForm />
      <p>
        ¿No tienes cuenta?{' '}
        <button onClick={handleRegister}>Regístrate aquí</button>
      </p>
    </div>
  );
}

export default Login;
