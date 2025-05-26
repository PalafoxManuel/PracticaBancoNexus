// backend/index.js
require('dotenv').config();       // 1) Carga variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// 4) Rutas
//   - GET    /api/cuenta/historial/:numeroCuenta
//   - POST   /api/cuenta/deposito
//   - POST   /api/cuenta/retiro
app.use('/api/cuenta', cuentaRouter);

// 5) Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
