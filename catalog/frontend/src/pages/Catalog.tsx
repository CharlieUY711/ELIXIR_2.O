import React from 'react';
import './Catalog.css';

interface Model {
  id: string;
  alias: string;
  status: string;
  imageUrl: string;
}

const mockModels: Model[] = [
  {
    id: '1',
    alias: 'Luna',
    status: 'En línea',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces'
  },
  {
    id: '2',
    alias: 'Marcus',
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces'
  },
  {
    id: '3',
    alias: 'Kai',
    status: 'Reciente',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces'
  },
  {
    id: '4',
    alias: 'Sofia',
    status: 'En línea',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces'
  },
  {
    id: '5',
    alias: 'Alex',
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=faces'
  },
  {
    id: '6',
    alias: 'Zara',
    status: 'Reciente',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces'
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
                    <span className="model-badge-status">{model.status}</span>
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
