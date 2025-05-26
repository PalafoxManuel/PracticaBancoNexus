// simulaciones/consultaSucursal.js
const fetch = require('node-fetch');

/**
 * Consulta el saldo de la cuenta desde la “sucursal” indicada.
 * @param {string} sucursal 
 * @param {string} numeroCuenta 
 * @returns saldo actual
 */
async function consultar(sucursal, numeroCuenta = '7185095077') {
  const res = await fetch(`http://localhost:3000/api/cuenta/${numeroCuenta}`);
  const { saldo } = await res.json();
  console.log(`Sucursal ${sucursal} – Saldo actual:`, saldo);
  return saldo;
}

module.exports = consultar;

// Ejecución CLI opcional:
if (require.main === module) {
  const [sucursal, numeroCuenta] = process.argv.slice(2);
  consultar(sucursal, numeroCuenta);
}
