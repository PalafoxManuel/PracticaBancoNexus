const mongoose = require('mongoose');
const cuentaSchema = new mongoose.Schema({
  numeroCuenta: { type: String, required: true, unique: true },
  saldo:         { type: Number, default: 0 },
  clienteId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true }
});
module.exports = mongoose.model('Cuenta', cuentaSchema);