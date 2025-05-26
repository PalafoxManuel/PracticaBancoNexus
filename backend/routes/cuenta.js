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

    // 2) Traer historial de transacciones
    const movimientos = await Transaccion
      .find({ cuentaId: cuenta._id })
      .sort({ fecha: -1 })
      .select('tipo monto fecha sucursal');

    // 3) Responder con toda la información
    return res.json({
      cliente: {
        id:       cuenta.clienteId._id,
        nombre:   cuenta.clienteId.nombre,
        apellido: cuenta.clienteId.apellido,
        curp:     cuenta.clienteId.curp
      },
      cuenta: {
        numero: cuenta.numeroCuenta,
        saldo:  cuenta.saldo
      },
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
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
