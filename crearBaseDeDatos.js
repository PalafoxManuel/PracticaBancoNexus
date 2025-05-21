// crearBaseDeDatos.js
const mongoose    = require('mongoose');
const Cliente     = require('./modelos/cliente');
const Cuenta      = require('./modelos/cuenta');
const Transaccion = require('./modelos/transaccion');

async function main() {
  // 1) Conectar a Atlas
  await mongoose.connect(
    'mongodb+srv://mapa21:4xZCBhGzArUOo5hG@practicadistribuida.e5qazpg.mongodb.net/PracticaDistribuida?retryWrites=true&w=majority'
  );

  // 2) Limpiar colecciones existentes
  await Promise.all([
    Cliente.deleteMany(),
    Cuenta.deleteMany(),
    Transaccion.deleteMany()
  ]);

  // 3) Insertar datos de ejemplo: CLIENTES
  const clientesData = [
    { nombre: 'Ana',   apellido: 'García',   curp: 'GARG900101HDFLLA01' },
    { nombre: 'Luis',  apellido: 'Martínez', curp: 'MALA920202MDFTRR02' },
    { nombre: 'María', apellido: 'Pérez',    curp: 'PEPM930303MDFLLL03' },
    { nombre: 'Juan',  apellido: 'Ramírez',  curp: 'RAMA940404HDFABC04' },
    { nombre: 'Lucía', apellido: 'Flores',   curp: 'FLOR950505MDFXYZ05' }
    // …hasta 10–15 registros
  ];
  const clientes = await Cliente.insertMany(clientesData);

  // 4) Crear 1–2 CUENTAS por cliente
  const cuentasData = clientes.flatMap(c => [
    {
      numeroCuenta: `${Math.floor(1e9 + Math.random() * 9e9)}`,
      saldo:        Math.floor(1000 + Math.random() * 9000),
      clienteId:    c._id
    },
    {
      numeroCuenta: `${Math.floor(1e9 + Math.random() * 9e9)}`,
      saldo:        Math.floor(1000 + Math.random() * 9000),
      clienteId:    c._id
    }
  ]);
  const cuentas = await Cuenta.insertMany(cuentasData);

  // 5) Generar 2 TRANSACCIONES por cuenta
  const transaccionesData = cuentas.flatMap(cta => [
    {
      cuentaId: cta._id,
      fecha:    new Date(),
      tipo:     'depósito',
      monto:    Math.floor(100 + Math.random() * 900)
    },
    {
      cuentaId: cta._id,
      fecha:    new Date(),
      tipo:     'retiro',
      monto:    Math.floor(50 + Math.random() * 450)
    }
  ]);
  await Transaccion.insertMany(transaccionesData);

  console.log('✅ Base de datos inicializada con datos simulados.');

  // 6) Desconectar
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
