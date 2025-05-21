const mongoose = require('mongoose');
const clienteSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  apellido: { type: String, required: true },
  curp:     { type: String, required: true, unique: true }
});
module.exports = mongoose.model('Cliente', clienteSchema);