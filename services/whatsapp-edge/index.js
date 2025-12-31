const express = require('express');
const app = express();
const PORT = 3002;

// Endpoint GET /handoff/resolve
app.get('/handoff/resolve', (req, res) => {
  const { handoff_id } = req.query;
  
  // Log
  console.log(`[EDGE] HANDOFF RESOLVED ${handoff_id}`);
  
  // Responder texto simple
  res.send('Handoff resolved. WhatsApp would open here.');
});

app.listen(PORT, () => {
  console.log(`[EDGE] WhatsApp Edge listening on port ${PORT}`);
});

