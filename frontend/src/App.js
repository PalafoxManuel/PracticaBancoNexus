import React, { useState } from 'react';

function App() {
  const [cuenta, setCuenta] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const consultarCuenta = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/cuenta/${cuenta}`);
      if (!res.ok) throw new Error('Cuenta no encontrada o error en la conexión.');
      const data = await res.json();
      setDatos(data);
      setError(null);
    } catch (err) {
      setDatos(null);
      setError(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="text-primary">Banco Nexus</h1>
        <p className="text-muted">Consulta de saldo y movimientos</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Buscar cuenta</h5>
              <div className="input-group mb-3">
                <input
                  type="text"
                  value={cuenta}
                  onChange={(e) => setCuenta(e.target.value)}
                  className="form-control"
                  placeholder="Ingresa número de cuenta"
                />
                <button className="btn btn-primary" onClick={consultarCuenta}>
                  Consultar
                </button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {datos && (
                <div className="mt-4">
                  <h5 className="mb-2">Cliente: <strong>{datos.cliente}</strong></h5>
                  <p>Saldo actual: <span className="fw-bold text-success">${datos.saldo}</span></p>

                  <h6 className="mt-4">Transacciones</h6>
                  <ul className="list-group">
                  {datos.transacciones.map((t, idx) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                      <span>{t.tipo}</span>
                      <span className={t.tipo === 'depósito' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        {t.tipo === 'depósito' ? '+' : '-'}${t.monto}
                      </span>
                      <small className="text-muted">{t.fecha}</small>
                    </li>
                  ))}
                </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
