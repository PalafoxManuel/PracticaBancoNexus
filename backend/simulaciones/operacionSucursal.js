// simulaciones/operacionSucursal.js
const fetch = require('node-fetch');

/**
 * Ejecuta un depósito o retiro desde la sucursal indicada.
 * @param {string} sucursal 
 * @param {'deposito'|'retiro'} tipo 
 * @param {number} monto 
 * @param {string} numeroCuenta 
 * @returns saldo resultante
 */
async function operar(sucursal, tipo, monto, numeroCuenta = '7185095077') {
  const res = await fetch(`http://localhost:3000/api/cuenta/${tipo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numeroCuenta, sucursal, monto })
  });
  const data = await res.json();
  console.log(`Sucursal ${sucursal} – ${tipo}:`, data);
  return data.saldo;
}

module.exports = operar;

// Permitir ejecución por CLI también:
if (require.main === module) {
  const [sucursal, tipo, monto, numeroCuenta] = process.argv.slice(2);
  operar(sucursal, tipo, parseInt(monto), numeroCuenta);
}
