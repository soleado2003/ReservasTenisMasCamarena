import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav >
      <ul >
        <li>
          <Link to="/">
            <img src={`${import.meta.env.BASE_URL}assets/logotenis2.svg`} height="15px" alt="logo" />  Pistas
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to={user.admin ? "/admin" : "/profile"}>{user.nombre}</Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="logout-btn"
                title="Cerrar Sesión"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
