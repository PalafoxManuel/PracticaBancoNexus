// simulacionSucursales.js

// No necesitas node-fetch en Node 18+
// const fetch = require('node-fetch');

const sucursales = ['CDMX','GDL','MTY','PUE','QRO'];
const numero = '7185095077'; // cuenta de prueba

async function getSaldo() {
  const res = await fetch(`http://localhost:3000/api/cuenta/${numero}`);
  const data = await res.json();
  return data.saldo; // ajusta según la propiedad que devuelva tu API
}

async function operar(sucursal, tipo, monto) {
  const res = await fetch(`http://localhost:3000/api/cuenta/${tipo}`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ numeroCuenta: numero, sucursal, monto })
  });
  return res.json();
}

(async () => {
  // 1. Saldo inicial
  const saldoInicial = await getSaldo();
  console.log('🔵 Saldo inicial:', saldoInicial);

  // 2. Calcular saldo esperado
  const totalDepositos = sucursales.length * 500;
  const totalRetiros   = sucursales.length * 300;
  const saldoEsperado  = saldoInicial + totalDepositos - totalRetiros;
  console.log('🟡 Saldo esperado tras operaciones:', saldoEsperado);

  // 3. Ejecutar operaciones concurrentes
  const ops = [];
  for (const s of sucursales) {
    ops.push(operar(s, 'deposito', 500));
    ops.push(operar(s, 'retiro',   300));
  }
  const resultados = await Promise.all(ops);
  console.log('✅ Resultados de operaciones:', resultados);

  // 4. Saldo final
  const saldoFinal = await getSaldo();
  console.log('🟢 Saldo final:', saldoFinal);
})();
