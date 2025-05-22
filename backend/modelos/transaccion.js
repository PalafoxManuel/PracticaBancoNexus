const mongoose = require('mongoose');
const transaccionSchema = new mongoose.Schema({
  cuentaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta', required: true },
  fecha:    { type: Date, default: Date.now },
  tipo:     { type: String, enum: ['depósito','retiro'], required: true },
  monto:    { type: Number, required: true }
});
module.exports = mongoose.model('Transaccion', transaccionSchema);