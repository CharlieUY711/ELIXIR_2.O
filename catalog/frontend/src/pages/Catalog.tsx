import React, { useState } from 'react';
import './Catalog.css';

type ModelState = 'idle' | 'loading' | 'error';

interface Model {
  id: string;
  alias: string;
  description: string;
  imageUrl: string;
}

const mockModels: Model[] = [
  {
    id: '1',
    alias: 'Modelo Alpha',
    description: 'Asistente conversacional especializado',
    imageUrl: 'https://via.placeholder.com/300x400/6366f1/ffffff?text=Modelo+Alpha'
  },
  {
    id: '2',
    alias: 'Modelo Beta',
    description: 'Experto en análisis y consultoría',
    imageUrl: 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Modelo+Beta'
  },
  {
    id: '3',
    alias: 'Modelo Gamma',
    description: 'Especialista en contenido creativo',
    imageUrl: 'https://via.placeholder.com/300x400/ec4899/ffffff?text=Modelo+Gamma'
  },
  {
    id: '4',
    alias: 'Modelo Delta',
    description: 'Asistente técnico y soporte',
    imageUrl: 'https://via.placeholder.com/300x400/14b8a6/ffffff?text=Modelo+Delta'
  },
  {
    id: '5',
    alias: 'Modelo Epsilon',
    description: 'Consultor estratégico y planificación',
    imageUrl: 'https://via.placeholder.com/300x400/f59e0b/ffffff?text=Modelo+Epsilon'
  },
  {
    id: '6',
    alias: 'Modelo Zeta',
    description: 'Especialista en investigación',
    imageUrl: 'https://via.placeholder.com/300x400/ef4444/ffffff?text=Modelo+Zeta'
  }
];

const Catalog: React.FC = () => {
  const [modelStates, setModelStates] = useState<Record<string, ModelState>>({});

  const handleChatClick = (modelId: string) => {
    setModelStates((prev: Record<string, ModelState>) => ({ ...prev, [modelId]: 'loading' }));
    
    setTimeout(() => {
      setModelStates((prev: Record<string, ModelState>) => ({ ...prev, [modelId]: 'idle' }));
    }, 2000);
  };

  const getModelState = (modelId: string): ModelState => {
    return modelStates[modelId] || 'idle';
  };

  return (
    <div className="catalog">
      <header className="catalog-header">
        <div className="catalog-logo">
          <span className="logo-wordmark">ELIXIR</span>
        </div>
      </header>

      <main className="catalog-main">
        <div className="catalog-grid">
          {mockModels.map((model) => {
            const state = getModelState(model.id);
            return (
              <div key={model.id} className="model-card">
                <div className="model-image-container">
                  <img 
                    src={model.imageUrl} 
                    alt={model.alias}
                    className="model-image"
                  />
                </div>
                <div className="model-info">
                  <h2 className="model-alias">{model.alias}</h2>
                  <p className="model-description">{model.description}</p>
                </div>
                <div className="model-actions">
                  {state === 'loading' && (
                    <div className="model-state-loading">
                      <div className="spinner"></div>
                      <span>Conectando...</span>
                    </div>
                  )}
                  {state === 'error' && (
                    <div className="model-state-error">
                      <span>Error de conexión</span>
                    </div>
                  )}
                  {state === 'idle' && (
                    <button
                      className="model-cta"
                      onClick={() => handleChatClick(model.id)}
                    >
                      Chatear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Catalog;
