const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Endpoint POST /chat/init
app.post('/chat/init', (req, res) => {
  const { model_id, source } = req.body;
  
  // Generar session_id fake
  const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log
  console.log(`[CHAT] INIT session ${session_id}`);
  
  // Responder según contrato catalog_to_chat.json
  res.json({
    session_id,
    status: 'INIT'
  });
});

// Endpoint POST /handoff/create
app.post('/handoff/create', (req, res) => {
  const { session_id, user_ref, model_ref } = req.body;
  
  // Generar handoff_url fake apuntando a whatsapp-edge
  const handoff_id = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const handoff_url = `http://localhost:3002/handoff/resolve?handoff_id=${handoff_id}`;
  
  // Generar expires_at (1 hora desde ahora)
  const expires_at = new Date(Date.now() + 3600000).toISOString();
  
  // Log
  console.log(`[CHAT] HANDOFF CREATED for session ${session_id}`);
  
  // Responder según contrato chat_to_whatsapp_handoff.json
  res.json({
    handoff_url,
    expires_at
  });
});

app.listen(PORT, () => {
  console.log(`[CHAT] Orchestrator listening on port ${PORT}`);
});

