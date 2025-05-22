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
    <div className="container mt-5">
      <h2>Consulta de Cuenta - Banco Nexus</h2>
      <div className="mb-3">
        <label>Número de cuenta:</label>
        <input
          type="text"
          value={cuenta}
          onChange={(e) => setCuenta(e.target.value)}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary" onClick={consultarCuenta}>Consultar</button>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {datos && (
        <div className="mt-4">
          <h4>Nombre del Cliente: {datos.cliente}</h4>
          <p>Saldo actual: ${datos.saldo}</p>
          <h5>Transacciones:</h5>
          <ul className="list-group">
            {datos.transacciones.map((t, idx) => (
              <li className="list-group-item" key={idx}>
                {t.tipo}: ${t.monto} - {t.fecha}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
