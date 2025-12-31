const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 👉 CORS (solo para el catálogo)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]
}));

app.use(express.json());

// Endpoint POST /chat/init
app.post('/chat/init', (req, res) => {
  const { model_id, source } = req.body;

  const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[CHAT] INIT session ${session_id}`);

  res.json({
    session_id,
    status: 'INIT'
  });
});

// Endpoint POST /handoff/create
app.post('/handoff/create', (req, res) => {
  const { session_id, user_ref, model_ref } = req.body;

  const handoff_id = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const handoff_url = `http://localhost:3002/handoff/resolve?handoff_id=${handoff_id}`;
  const expires_at = new Date(Date.now() + 3600000).toISOString();

  console.log(`[CHAT] HANDOFF CREATED for session ${session_id}`);

  res.json({
    handoff_url,
    expires_at
  });
});

app.listen(PORT, () => {
  console.log(`[CHAT] Orchestrator listening on port ${PORT}`);
});
