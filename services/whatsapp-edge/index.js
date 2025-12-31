const express = require('express');
const app = express();
const PORT = 3002;

// Almacenamiento en memoria de handoffs
const handoffs = new Map();

// TTL: 5 minutos en milisegundos
const TTL_MS = 5 * 60 * 1000;

// Endpoint GET /handoff/resolve
app.get('/handoff/resolve', (req, res) => {
  const { handoff_id } = req.query;
  
  // Verificar si el handoff_id existe
  if (!handoff_id) {
    console.log(`[EDGE] HANDOFF RESOLVED - Missing handoff_id`);
    return res.send('Invalid handoff link.');
  }
  
  const handoff = handoffs.get(handoff_id);
  
  // Caso: handoff no existe (primera vez que se resuelve)
  if (!handoff) {
    // Registrar el token cuando se resuelve por primera vez
    const now = Date.now();
    handoffs.set(handoff_id, {
      handoff_id: handoff_id,
      status: 'CREATED',
      created_at: now,
      expires_at: now + TTL_MS
    });
    console.log(`[EDGE] HANDOFF CREATED ${handoff_id}`);
    
    // Marcar como REDEEMED inmediatamente (primer uso válido)
    const createdHandoff = handoffs.get(handoff_id);
    createdHandoff.status = 'REDEEMED';
    console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id}`);
    console.log(`[EDGE] HANDOFF REDEEMED ${handoff_id}`);
    
    return res.send('Handoff resolved. WhatsApp would open here.');
  }
  
  // Verificar estado
  if (handoff.status === 'REDEEMED') {
    console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id} - Already redeemed`);
    return res.send('This link has already been used.');
  }
  
  if (handoff.status === 'EXPIRED') {
    console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id} - Already expired`);
    return res.send('This link has expired. Please start again.');
  }
  
  // Verificar TTL
  const now = Date.now();
  if (now > handoff.expires_at) {
    handoff.status = 'EXPIRED';
    console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id} - Expired`);
    console.log(`[EDGE] HANDOFF EXPIRED ${handoff_id}`);
    return res.send('This link has expired. Please start again.');
  }
  
  // Caso válido: estado CREATED y TTL válido
  if (handoff.status === 'CREATED') {
    // Marcar como REDEEMED al primer uso válido
    handoff.status = 'REDEEMED';
    console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id}`);
    console.log(`[EDGE] HANDOFF REDEEMED ${handoff_id}`);
    return res.send('Handoff resolved. WhatsApp would open here.');
  }
  
  // Caso por defecto (no debería llegar aquí)
  console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id} - Invalid state`);
  return res.send('Invalid handoff link.');
});

app.listen(PORT, () => {
  console.log(`[EDGE] WhatsApp Edge listening on port ${PORT}`);
});

