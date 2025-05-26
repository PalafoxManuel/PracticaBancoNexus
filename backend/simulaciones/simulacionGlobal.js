// simulaciones/simulacionGlobal.js
const operar    = require('./operacionSucursal');
const consultar = require('./consultaSucursal');

(async () => {
  const sucursales   = ['CDMX','GDL','MTY','PUE','QRO'];
  const numeroCuenta = '7185095077';

  const saldoInicial = await consultar('Inicial', numeroCuenta);
  console.log('🔵 Saldo inicial:', saldoInicial);

  const totalDep     = sucursales.length * 500;
  const totalRet     = sucursales.length * 300;
  const saldoEsperado = saldoInicial + totalDep - totalRet;
  console.log('🟡 Saldo esperado tras operaciones:', saldoEsperado);

  const ops = sucursales.flatMap(s => [
    operar(s, 'deposito', 500, numeroCuenta),
    operar(s, 'retiro',   300, numeroCuenta)
  ]);
  const resultados = await Promise.all(ops);
  console.log('✅ Resultados de operaciones:', resultados);

  const saldoFinal = await consultar('Final', numeroCuenta);
  console.log('🟢 Saldo final:', saldoFinal);
})();
