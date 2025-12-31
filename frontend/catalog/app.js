const CHAT_ORCHESTRATOR_URL = 'http://localhost:3001';

// Model ID fijo (fake)
const MODEL_ID = 'model_stub_001';

document.getElementById('chatButton').addEventListener('click', async () => {
  console.log('[CATALOG] Iniciando flujo de chat...');
  
  try {
    // Paso 1: POST /chat/init
    console.log('[CATALOG] Llamando POST /chat/init con model_id:', MODEL_ID);
    const initResponse = await fetch(`${CHAT_ORCHESTRATOR_URL}/chat/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_id: MODEL_ID,
        source: 'catalog'
      })
    });
    
    const initData = await initResponse.json();
    console.log('[CATALOG] Respuesta /chat/init:', initData);
    
    if (!initData.session_id) {
      throw new Error('No se recibió session_id');
    }
    
    // Paso 2: POST /handoff/create
    console.log('[CATALOG] Llamando POST /handoff/create con session_id:', initData.session_id);
    const handoffResponse = await fetch(`${CHAT_ORCHESTRATOR_URL}/handoff/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: initData.session_id,
        user_ref: 'user_stub_001',
        model_ref: MODEL_ID
      })
    });
    
    const handoffData = await handoffResponse.json();
    console.log('[CATALOG] Respuesta /handoff/create:', handoffData);
    
    if (!handoffData.handoff_url) {
      throw new Error('No se recibió handoff_url');
    }
    
    // Paso 3: Redirigir al handoff_url
    console.log('[CATALOG] Redirigiendo a:', handoffData.handoff_url);
    window.location.href = handoffData.handoff_url;
    
  } catch (error) {
    console.error('[CATALOG] Error en el flujo:', error);
    alert('Error: ' + error.message);
  }
});

