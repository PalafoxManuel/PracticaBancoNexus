const express = require('express');
const router = express.Router();
const Cuenta = require('../modelos/cuenta');
const Cliente = require('../modelos/cliente');
const Transaccion = require('../modelos/transaccion');

// GET /api/cuenta/:numeroCuenta
router.get('/:numeroCuenta', async (req, res) => {
  try {
    const cuenta = await Cuenta.findOne({ numeroCuenta: req.params.numeroCuenta });
    if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });

    const cliente = await Cliente.findById(cuenta.clienteId);
    const transacciones = await Transaccion.find({ cuentaId: cuenta._id });

    res.json({
      cliente: `${cliente.nombre} ${cliente.apellido}`,
      saldo: cuenta.saldo,
      transacciones: transacciones.map(t => ({
        tipo: t.tipo,
        monto: t.monto,
        fecha: t.fecha.toISOString().split('T')[0]
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
