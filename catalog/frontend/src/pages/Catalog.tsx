import React from 'react';
import './Catalog.css';

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
            return (
              <div 
                key={model.id} 
                className="model-card"
                style={{ backgroundImage: `url(${model.imageUrl})` }}
              >
                <div className="model-overlay"></div>
                
                <div className="model-content">
                  <div className="model-badges">
                    <span className="model-badge-name">{model.alias}</span>
                    <span className="model-badge-status">Disponible</span>
                  </div>
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
