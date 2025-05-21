import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import '../styles/RegisterForm.css';
import facturaExample from '../assets/ejemplofactura.jpg';

const SECTORES = [
  'ADRIANA', 'ARBOLEDA', 'C.P I', 'C.P II', 'C.P.III', 
  'ESM.I', 'ESM.II', 'ESM.IV', 'ESM.V', 'ESM.VI', 'ESM.VII',
  'FUENTES', 'J.C.I', 'J.C.II', 'J.C.III', 'LOS ALTOS',
  'MONTEBELLO', 'OASIS', 'PARCELAS', 
  'SECTOR A', 'SECTOR B', 'SECTOR C', 'SECTOR D',
  'SECTOR E', 'SECTOR F', 'SECTOR G', 'SECTOR H', 'SECTOR J',
  'VILLAS I', 'VILLAS II', 'VILLAS III'
];

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
  const [idExt, setIdExt] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [relacion, setRelacion] = useState('Titular');
  const [formaPago, setFormaPago] = useState('Recibo mensual (Domiciliacion)');

  const navigate = useNavigate();

  const handleIdExtChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d{0,4}$/).test(value)) {
      setIdExt(value);
    }
  };

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
        password,
        id_ext: idExt || null,
        relacion,
        forma_pago: formaPago
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
            <label>Nº de Socio (opcional):</label>
            <div className="input-with-info">
              <input 
                type="text"
                value={idExt}
                onChange={handleIdExtChange}
                placeholder="0000"
                maxLength="4"
                pattern="\d{0,4}"
                className="form-control numero-socio"
                style={{ fontFamily: 'monospace', letterSpacing: '0.25em' }}
              />
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowInfoModal(true);
                }}
                className="info-link"
              >
                + info
              </a>
            </div>
            <small className="form-text text-muted">4 dígitos</small>

            {showInfoModal && (
              <div 
                className="modal-overlay"
                onClick={() => setShowInfoModal(false)}  // Simplified click handler
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Información del Número de Socio</h3>
                    <button 
                      onClick={() => setShowInfoModal(false)}
                      className="close-button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>Este número se encuentra en las liquidaciones de gastos e ingresos que se envían trimestralmente.</p>
                    <p>Puede encontrarlo en la esquina superior derecha de su factura, como se muestra en la imagen:</p>
                    <img src={facturaExample} alt="Ejemplo de ubicación del número de socio en la factura" />
                  </div>
                </div>
              </div>
            )}
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

          <div className="form-group">
            <label htmlFor="direccion">Sector:</label>
            <select
              id="direccion"
              name="direccion"
              value={direccion}
              onChange={(e)=> setDireccion(e.target.value)}
              required
              className="form-control"
            >
              <option value="">Seleccione un sector</option>
              {SECTORES.map(sector => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
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

          <div className="form-group">
            <label>Relación:</label>
            <select
              value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              required
              className="form-control"
            >
              <option value="Titular">Titular</option>
              <option value="Familiar">Familiar</option>
              <option value="Inquilino">Inquilino</option>
            </select>
          </div>

          <div className="form-group">
            <label>Forma de Pago Predeterminada:</label>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              required
              className="form-control"
            >
              <option value="Recibo mensual (Domiciliacion)">Recibo mensual (Domiciliacion)</option>
              <option value="Pago en Oficina (Efectivo o tarjeta)">Pago en Oficina (Efectivo o tarjeta)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterForm;
