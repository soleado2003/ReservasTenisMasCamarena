import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Reservas from './pages/Reservas';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { UserProvider, useUser } from './context/UserContext';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function PrivateRoute({ children }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            {/* Rutas específicas primero */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/reservas" element={<PrivateRoute><Reservas /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Ruta home */}
            <Route path="/" element={<Home />} />
            
            {/* Ruta catch-all siempre al final */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}

export default App;
