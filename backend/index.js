// backend/index.js
require('dotenv').config();       // 1) Carga variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 0) Registrar modelos antes de todo
require('./modelos/cliente');
require('./modelos/cuenta');
require('./modelos/transaccion');

const cuentaRouter = require('./routes/cuenta');

const app = express();

// 2) Middlewares
app.use(cors());
app.use(express.json());

// 3) Conexión a MongoDB
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// —— Aquí engancha tus listeners —— 
mongoose.connection.on('error', err => console.error('Mongo error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongo disconnected'));
mongoose.connection.on('reconnected', () => console.log('Mongo reconnected'));

// 4) Rutas
//   - GET    /api/cuenta/historial/:numeroCuenta
//   - POST   /api/cuenta/deposito
//   - POST   /api/cuenta/retiro
app.use('/api/cuenta', cuentaRouter);

// 5) Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
