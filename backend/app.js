const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Importación de rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clubRoutes = require('./routes/clubs');
const pistaRoutes = require('./routes/pistas');
const reservaRoutes = require('./routes/reservas');

// Uso de rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/club', clubRoutes);
app.use('/api/pistas', pistaRoutes);
app.use('/api/reservas', reservaRoutes);

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await require('./config/db').query('SELECT 1+1 AS solution');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con la BD' });
  }
});