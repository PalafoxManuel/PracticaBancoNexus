// backend/routes/status.js
const express = require('express');
const router = express.Router();

// Cada cliente que se conecte se guarda aquí
const clients = [];

// SSE endpoint
router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  // Añadimos este res a la lista de clientes
  clients.push(res);

  // Cuando el cliente cierra, lo removemos
  req.on('close', () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

// Helper para emitir a todos los clientes conectados
function broadcast(data) {
  for (const res of clients) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

// Exportamos el broadcast para usarlo abajo
module.exports = { router, broadcast };