const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
  cuentaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta', required: true },
  sucursal:  { type: String, required: true },           // nueva propiedad
  fecha:     { type: Date,   default: Date.now },        // timestamp
  tipo:      { type: String, enum: ['deposito','retiro'], required: true },
  monto:     { type: Number, required: true }
});

module.exports = mongoose.model('Transaccion', transaccionSchema);
