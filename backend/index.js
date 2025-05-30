// backend/index.js
require('dotenv').config();       // 1) Carga variables de entorno
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

// 0) Registrar modelos antes de todo
require('./modelos/cliente');
require('./modelos/cuenta');
require('./modelos/transaccion');

// Importamos el router SSE y la función de broadcast
const { router: statusRouter, broadcast } = require('./routes/status');
const cuentaRouter = require('./routes/cuenta');

const app = express();

// 1) Middlewares
app.use(cors());
app.use(express.json());

// 2) Rutas
// SSE status
app.use('/status', statusRouter);

// API de cuenta
app.use('/api/cuenta', cuentaRouter);

// 3) Conexión a MongoDB
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// 4) Listeners de estado de conexión
mongoose.connection.on('error', err => {
  console.error('Mongo error:', err);
  broadcast({ status: 'error' });
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongo disconnected');
  broadcast({ status: 'disconnected' });
});
mongoose.connection.on('reconnected', () => {
  console.log('Mongo reconnected');
  broadcast({ status: 'reconnected' });
});

// 5) Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
