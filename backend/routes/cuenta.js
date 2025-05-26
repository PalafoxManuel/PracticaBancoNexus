// backend/routes/cuenta.js
const { Router }   = require('express');
const Cuenta       = require('../modelos/cuenta');
const Transaccion  = require('../modelos/transaccion');

const router = Router();

/**
 * GET /api/cuenta/:numeroCuenta
 * Devuelve datos de la cuenta, cliente asociado (populate)
 * y su historial de movimientos.
 */
router.get('/:numeroCuenta', async (req, res) => {
  try {
    // 1) Buscar la cuenta y poblar el cliente
    const cuenta = await Cuenta
      .findOne({ numeroCuenta: req.params.numeroCuenta })
      .populate('clienteId', 'nombre apellido curp');  // <–– aquí

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Construye la cadena de nombre completo:
    const nombreCompleto = `${cuenta.clienteId.nombre} ${cuenta.clienteId.apellido}`;
    const movimientos = await Transaccion
      .find({ cuentaId: cuenta._id })
      .sort({ fecha: -1 })
      .select('tipo monto fecha sucursal');

    return res.json({
      cliente:      nombreCompleto,            // ahora un string
      curp:         cuenta.clienteId.curp, // si lo necesitas por separado
      numeroCuenta: cuenta.numeroCuenta,
      saldo:        cuenta.saldo,
      movimientos
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * POST /api/cuenta/deposito
 * Body: { numeroCuenta, sucursal, monto }
 * Registra un depósito y actualiza saldo.
 */
router.post('/deposito', async (req, res) => {
  try {
    const { numeroCuenta, sucursal, monto } = req.body;
    const cuenta = await Cuenta.findOne({ numeroCuenta });
    if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
    if (monto <= 0) return res.status(400).json({ error: 'Monto debe ser mayor que cero' });

    await Transaccion.create({ cuentaId: cuenta._id, sucursal, tipo: 'deposito', monto });
    cuenta.saldo += monto;
    await cuenta.save();

    return res.json({ mensaje: 'Depósito exitoso', saldo: cuenta.saldo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * POST /api/cuenta/retiro
 * Body: { numeroCuenta, sucursal, monto }
 * Registra un retiro y actualiza saldo si hay fondos.
 */
router.post('/retiro', async (req, res) => {
  try {
    const { numeroCuenta, sucursal, monto } = req.body;
    const cuenta = await Cuenta.findOne({ numeroCuenta });
    if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
    if (monto <= 0) return res.status(400).json({ error: 'Monto debe ser mayor que cero' });
    if (cuenta.saldo < monto) return res.status(400).json({ error: 'Saldo insuficiente' });

    await Transaccion.create({ cuentaId: cuenta._id, sucursal, tipo: 'retiro', monto });
    cuenta.saldo -= monto;
    await cuenta.save();

    return res.json({ mensaje: 'Retiro exitoso', saldo: cuenta.saldo });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const mensajes = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: mensajes.join(', ') });
    }
    return res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
