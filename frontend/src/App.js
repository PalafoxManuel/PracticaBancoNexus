import { useState, useEffect, useCallback } from 'react';
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

  // esto es nuevo
  const [isLoading, setIsLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Estado de conexión vivo
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // para los mensajes del back
  useEffect(() => {
    const evt = new EventSource('http://localhost:3000/status/events');
    evt.onmessage = e => {
      const { status } = JSON.parse(e.data);
      if (status === 'disconnected') {
        setConnectionStatus('reconnecting');
      } else if (status === 'reconnected') {
        setConnectionStatus('connected');
      }
    };
    return () => evt.close();
  }, []);

  const consultarCuenta = useCallback(async () => {
    setError(null);
    setMensaje(null);
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/cuenta/${cuenta}`);
      if (!res.ok) throw new Error('Cuenta no encontrada o error en la conexión.');
      const data = await res.json();
      setDatos(data);
      //aqui se desactiva y activan los mensajes
      setIsReconnecting(false);
    } catch (err) {
      setIsReconnecting(true);
      setError(null);
      setTimeout(consultarCuenta, 1000);
    } finally {
      setIsLoading(false);
    }
  }, [cuenta]);

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
      setIsLoading(true);
      const res = await fetch(`http://localhost:3000/api/cuenta/${tipo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroCuenta: cuenta,
          sucursal,
          monto: parseFloat(monto)
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error en la operación');
      setMensaje(result.mensaje);
      await consultarCuenta();
      setMostrarModal(false);
      setMonto('');
      setTipo(null);
      setSucursal('');
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5 position-relative">
      {/* Banner de reconexión */}
      {connectionStatus === 'reconnecting' && (
        <div className="alert alert-warning text-center position-fixed w-100" style={{ top: 0, zIndex: 1100 }}>
          Reconectando a la base de datos…
        </div>
      )}

      {/* Spinner */}
      {isLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
          style={{ zIndex: 1050 }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>{isReconnecting ? 'Conexion Perdida... Reconectando' : 'Cargando...'}</div>
          </div>
        </div>
      )}

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
                  onChange={e => setCuenta(e.target.value)}
                  className="form-control"
                  placeholder="Ingresa número de cuenta"
                  disabled={isLoading}
                />
                <button
                  className="btn btn-primary"
                  onClick={consultarCuenta}
                  disabled={isLoading || !cuenta}
                >
                  Consultar
                </button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {mensaje && <div className="alert alert-success">{mensaje}</div>}

              {datos && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">
                      Cliente: <strong>{datos.cliente}</strong>
                    </h5>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setMostrarModal(true)}
                      disabled={isLoading}
                    >
                      Realizar transacción
                    </button>
                  </div>
                  <p>
                    Saldo actual: <span className="fw-bold text-success">${datos.saldo}</span>
                  </p>
                  <div className="row">
                    <h6 className="mt-4 col-3">Transacción</h6>
                    <h6 className="mt-4 col-3">Monto</h6>
                    <h6 className="mt-4 col-3">Sucursal</h6>
                    <h6 className="mt-4 col-3">Fecha</h6>
                  </div>
                  <ul className="list-group">
                    {datos.movimientos.map((t, idx) => (
                      <li
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>{t.tipo}</span>
                        <span
                          className={
                            t.tipo === 'deposito'
                              ? 'text-success fw-bold'
                              : 'text-danger fw-bold'
                          }
                        >
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

      {/* Modal de transacción */}
      {mostrarModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Realizar transacción</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarModal(false)}
                />
              </div>
              <div className="modal-body">
                {!tipo ? (
                  <>
                    <p>¿Qué tipo de transacción deseas realizar?</p>
                    <div className="d-flex justify-content-around">
                      <button
                        className="btn btn-success"
                        onClick={() => setTipo('deposito')}
                      >
                        Depositar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => setTipo('retiro')}
                      >
                        Retirar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      {tipo === 'deposito' ? 'Depósito' : 'Retiro'} seleccionado
                    </p>
                    <div className="mb-3">
                      <label className="form-label">Sucursal</label>
                      <select
                        className={`form-select ${errores.sucursal ? 'is-invalid' : ''}`}
                        onChange={e => setSucursal(e.target.value)}
                        value={sucursal}
                        disabled={isLoading}
                      >
                        <option value="" disabled>
                          Selecciona una sucursal
                        </option>
                        <option value="CDMX">CDMX</option>
                        <option value="GDL">Guadalajara</option>
                        <option value="MTY">Monterrey</option>
                        <option value="QRO">Querétaro</option>
                      </select>
                      {errores.sucursal && (
                        <div className="invalid-feedback">{errores.sucursal}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Monto</label>
                      <input
                        type="number"
                        value={monto}
                        onChange={e => setMonto(e.target.value)}
                        onKeyDown={e => {
                          const skip = ['-', '+', 'e', 'E'];
                          if (skip.includes(e.key)) e.preventDefault();
                        }}
                        className={`form-control ${errores.monto ? 'is-invalid' : ''}`}
                        placeholder="Ingresa el monto"
                        min={0}
                        disabled={isLoading}
                      />
                      {errores.monto && (
                        <div className="invalid-feedback">{errores.monto}</div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setTipo(null);
                          setMonto('');
                        }}
                        disabled={isLoading}
                      >
                        Atrás
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={realizarOperacion}
                        disabled={isLoading}
                      >
                        Aceptar
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setMostrarModal(false);
                    setTipo(null);
                    setMonto('');
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
