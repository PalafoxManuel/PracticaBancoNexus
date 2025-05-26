import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [cuenta, setCuenta] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState(null);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sucursal, setSucursal] = useState('');
  const [errores, setErrores] = useState({ monto: '', sucursal: '' });


  const consultarCuenta = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/cuenta/${cuenta}`);
      if (!res.ok) throw new Error('Cuenta no encontrada o error en la conexión.');
      const data = await res.json();
      setDatos(data);
      console.log(data);
      setError(null);
    } catch (err) {
      setDatos(null);
      setError(err.message);
    }
  };

  const realizarOperacion = async () => {
    setErrores({});
    setMensaje(null);
    setError(null);

    const erroresLocal = {};

    if (!sucursal) erroresLocal.sucursal = 'Debes seleccionar una sucursal.';
    if (!monto || parseFloat(monto) <= 0) erroresLocal.monto = 'El monto debe ser mayor a 0.';

    if (Object.keys(erroresLocal).length > 0) {
      setErrores(erroresLocal);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/cuenta/${tipo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroCuenta: cuenta,
          sucursal: sucursal,
          monto: parseFloat(monto)
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Error en la operación');

      setMensaje(result.mensaje);
      consultarCuenta();
      setMostrarModal(false);
      setMonto('');
      setTipo(null);
      setSucursal('');
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };





  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="text-primary">Banco Nexus</h1>
        <p className="text-muted">Consulta de saldo y operaciones</p>
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
              {datos && (
                <div className="mt-4">
                  {datos && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Cliente: <strong>{datos.cliente}</strong></h5>

                        <button className="btn btn-secondary btn-sm" onClick={() => setMostrarModal(true)}>
                          Realizar transacción
                        </button>
                      </div>
                      <p>Saldo actual: <span className="fw-bold text-success">${datos.saldo}</span></p>
                    </>
                  )}
                  <div className="row">
                    <h6 className="mt-4 col-3">Transacciones</h6>
                    <h6 className="mt-4 col-3">Monto</h6>
                    <h6 className="mt-4 col-3">Sucursal</h6>
                    <h6 className="mt-4 col-3">Transacciones</h6>
                  </div>
                  <ul className="list-group">
                    {datos.movimientos.map((t, idx) => (
                      <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                        <span>{t.tipo}</span>
                        <span className={t.tipo === 'deposito' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {t.tipo === 'deposito' ? '+' : '-'}${t.monto}
                        </span>
                        <span>{t.sucursal}</span>
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

      {/* Modal */}
      {mostrarModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Realizar transacción</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {mensaje && <div className="alert alert-success">{mensaje}</div>}
                {!tipo ? (
                  <>
                    <p>¿Qué tipo de transacción deseas realizar?</p>
                    <div className="d-flex justify-content-around">
                      <button className="btn btn-success" onClick={() => setTipo('deposito')}>Depositar</button>
                      <button className="btn btn-danger" onClick={() => setTipo('retiro')}>Retirar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{tipo === 'deposito' ? 'Depósito' : 'Retiro'} seleccionado</p>

                    <div className="mb-3">
                      <label className="form-label">Sucursal</label>
                      <select
                        className={`form-select ${errores.sucursal ? 'is-invalid' : ''}`}
                        onChange={(e) => setSucursal(e.target.value)}
                        value={sucursal}
                      >
                        <option value="" disabled>Selecciona una sucursal</option>
                        <option value="CDMX">CDMX</option>
                        <option value="GDL">Guadalajara</option>
                        <option value="MTY">Monterrey</option>
                        <option value="QRO">Querétaro</option>
                      </select>
                      {errores.sucursal && <div className="invalid-feedback">{errores.sucursal}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Monto</label>
                      <input
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        onKeyDown={(e) => {
                          const invalidChars = ['-', '+', 'e', 'E'];
                          if (invalidChars.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`form-control ${errores.monto ? 'is-invalid' : ''}`}
                        placeholder="Ingresa el monto"
                        min={0}
                      />
                      {errores.monto && <div className="invalid-feedback">{errores.monto}</div>}
                    </div>



                    <div className="d-flex justify-content-between">
                      <button className="btn btn-secondary" onClick={() => {
                        setTipo(null);
                        setMonto('');
                      }}>Atrás</button>
                      <button className="btn btn-primary" onClick={realizarOperacion}>Aceptar</button>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => {
                  setMostrarModal(false);
                  setTipo(null);
                  setMonto('');
                }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;
