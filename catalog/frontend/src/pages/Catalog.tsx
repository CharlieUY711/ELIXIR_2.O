import React, { useState, useRef } from 'react';
import './Catalog.css';

interface Model {
  id: string;
  alias: string;
  status: string;
  imageUrl: string;
  videos?: string[];
  publicData?: string;
}

const mockModels: Model[] = [
  {
    id: '1',
    alias: 'Luna',
    status: 'En línea',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=faces',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    publicData: 'Modelo profesional con 5 años de experiencia. Especializada en fotografía de moda y retratos artísticos. Disponible para sesiones creativas y comerciales.'
  },
  {
    id: '2',
    alias: 'Marcus',
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    ],
    publicData: 'Fotógrafo y modelo con experiencia en proyectos editoriales. Trabajo colaborativo y profesional.'
  },
  {
    id: '3',
    alias: 'Kai',
    status: 'Reciente',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ],
    publicData: 'Nuevo en la plataforma. Modelo emergente con gran potencial y versatilidad.'
  },
  {
    id: '4',
    alias: 'Sofia',
    status: 'En línea',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ],
    publicData: 'Modelo con amplia experiencia en publicidad y moda. Especializada en contenido de alta calidad y profesionalismo.'
  },
  {
    id: '5',
    alias: 'Alex',
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=faces',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    ],
    publicData: 'Modelo profesional versátil. Experiencia en múltiples estilos y proyectos creativos. Siempre comprometido con la excelencia.'
  },
  {
    id: '6',
    alias: 'Zara',
    status: 'Reciente',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces',
    publicData: 'Modelo creativa con enfoque en arte y expresión personal. Disponible para proyectos únicos e innovadores.'
  }
];

const Catalog: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [wasExpandedBeforeVideo, setWasExpandedBeforeVideo] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const expandedVideoRef = useRef<HTMLVideoElement>(null);

  const handleCardClick = (model: Model) => {
    setSelectedModel(model);
    setCurrentVideo(null);
    setIsPlaying(false);
    setShowVideoControls(false);
    setShowInfo(false);
    setIsExpanded(false);
  };

  const closeExpanded = () => {
    setExpandedImage(null);
  };

  const closeExpandedVideo = () => {
    setExpandedVideo(null);
    if (expandedVideoRef.current) {
      expandedVideoRef.current.pause();
    }
  };

  const handleCloseDetail = () => {
    setSelectedModel(null);
    setCurrentVideo(null);
    setIsPlaying(false);
    setShowVideoControls(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoClick = (videoUrl: string) => {
    setWasExpandedBeforeVideo(isExpanded);
    setCurrentVideo(videoUrl);
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  const handleBackToImage = () => {
    setCurrentVideo(null);
    setIsPlaying(false);
    setShowVideoControls(false);
    setIsExpanded(wasExpandedBeforeVideo);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10
      );
    }
  };

  // Función para ocultar sobreimpresos en tarjetas centrales excepto la primera
  const shouldShowBadges = (index: number): boolean => {
    return index === 0 && !currentVideo;
  };

  // Vista de 4 columnas (modo focus)
  if (selectedModel) {
    const otherModels = mockModels.filter(m => m.id !== selectedModel.id);
    
    return (
      <>
        <div className="catalog">
          <header className="catalog-header">
            <div className="catalog-logo">
              <span className="logo-wordmark">ELIXIR</span>
            </div>
            <button className="close-detail-btn" onClick={handleCloseDetail}>
              ✕
            </button>
          </header>

          <main className="catalog-main">
            <div className="catalog-layout">
            {/* Columna lateral izquierda */}
            <div className="catalog-lateral catalog-left">
              {otherModels.map((model) => (
                <div 
                  key={`left-${model.id}`}
                  className="model-card model-card-side"
                  style={{ backgroundImage: `url(${model.imageUrl})` }}
                  onClick={() => handleCardClick(model)}
                >
                  <div className="model-overlay model-overlay-dark"></div>
                  <div className="model-content">
                    <div className="model-badges">
                      <span className="model-badge-name">{model.alias}</span>
                      <span className="model-badge-status">{model.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Grid central 2x3 */}
            <div className="catalog-center">
              {Array(6).fill(null).map((_, index) => {
                const gridClasses = [
                  'focus-card focus-card-c1-r1',
                  'focus-card focus-card-c2-r1',
                  'focus-card focus-card-c1-r2',
                  'focus-card focus-card-c2-r2',
                  'focus-card focus-card-c1-r3',
                  'focus-card focus-card-c2-r3'
                ];
                
                // Clase para tarjeta expandida (las demás tarjetas conviven con la expandida)
                const expandedClass = isExpanded && index === 0 ? 'focus-card-expanded' : gridClasses[index];
                
                return (
                  <div key={index} className={expandedClass}>
                    <div 
                      className="model-card model-card-main"
                      style={!currentVideo || index !== 0 ? { backgroundImage: `url(${selectedModel.imageUrl})` } : {}}
                      onMouseEnter={() => {
                        if (currentVideo && index === 0) {
                          setShowVideoControls(true);
                        }
                      }}
                      onMouseLeave={() => {
                        if (currentVideo && index === 0) {
                          setShowVideoControls(false);
                        }
                      }}
                      onDoubleClick={(e) => {
                        if (index === 0 && !currentVideo) {
                          e.stopPropagation();
                          if (selectedModel) {
                            setExpandedImage(selectedModel.imageUrl);
                          }
                        }
                      }}
                    >
                      {index === 0 && selectedModel.publicData && (
                        <button 
                          className="info-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInfo(!showInfo);
                          }}
                          title="Información"
                        >
                          i
                        </button>
                      )}
                      {currentVideo && index === 0 && (
                        <>
                          <video 
                            ref={videoRef}
                            className="model-video-player"
                            src={currentVideo}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (currentVideo) {
                                setExpandedVideo(currentVideo);
                              }
                            }}
                            loop
                          />
                          {showVideoControls && (
                            <button 
                              className="video-back-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBackToImage();
                              }}
                              title="Volver a la imagen"
                            >
                              ←
                            </button>
                          )}
                        </>
                      )}
                      {showInfo && index === 0 && (
                        <>
                          <button 
                            className="info-close-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInfo(false);
                            }}
                            title="Cerrar información"
                          >
                            ✕
                          </button>
                          <div className="info-overlay" onClick={(e) => {
                            e.stopPropagation();
                            setShowInfo(false);
                          }}>
                            <div className="info-content" onClick={(e) => e.stopPropagation()}>
                              <p className="info-text">{selectedModel.publicData}</p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="model-overlay"></div>
                      <div className="model-content">
                        {shouldShowBadges(index) && (
                          <div className="model-badges">
                            <span className="model-badge-name">{selectedModel.alias}</span>
                            {selectedModel.videos && selectedModel.videos.length > 0 && (
                              <div className="model-video-players">
                                {Array(5).fill(null).map((_, videoIndex) => {
                                  const hasVideo = videoIndex < (selectedModel.videos?.length || 0);
                                  const isActive = hasVideo;
                                  return (
                                    <button
                                      key={videoIndex}
                                      className={`video-play-triangle ${isActive ? 'active' : 'inactive'}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (hasVideo && selectedModel.videos) {
                                          handleVideoClick(selectedModel.videos[videoIndex]);
                                        }
                                      }}
                                      title={hasVideo ? `Reproducir video ${videoIndex + 1}` : ''}
                                    >
                                      ▶
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            <span className="model-badge-status">{selectedModel.status}</span>
                          </div>
                        )}
                        {currentVideo && index === 0 && showVideoControls && (
                          <div className="model-badges">
                            <span className="model-badge-name">{selectedModel.alias}</span>
                            <div className="model-video-controls">
                              <button
                                className="video-control-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRewind();
                                }}
                                title="Retroceder 10s"
                              >
                                ⏪
                              </button>
                              <button
                                className="video-control-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPause();
                                }}
                                title={isPlaying ? "Pausar" : "Reproducir"}
                              >
                                {isPlaying ? '⏸' : '▶'}
                              </button>
                              <button
                                className="video-control-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStop();
                                }}
                                title="Detener"
                              >
                                ⏹
                              </button>
                              <button
                                className="video-control-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleForward();
                                }}
                                title="Avanzar 10s"
                              >
                                ⏩
                              </button>
                            </div>
                            <span className="model-badge-status">{selectedModel.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Columna lateral derecha */}
            <div className="catalog-lateral catalog-right">
              {otherModels.map((model) => (
                <div 
                  key={`right-${model.id}`}
                  className="model-card model-card-side"
                  style={{ backgroundImage: `url(${model.imageUrl})` }}
                  onClick={() => handleCardClick(model)}
                >
                  <div className="model-overlay model-overlay-dark"></div>
                  <div className="model-content">
                    <div className="model-badges">
                      <span className="model-badge-name">{model.alias}</span>
                      <span className="model-badge-status">{model.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      {expandedImage && (
        <div className="image-overlay" onClick={closeExpanded}>
          <button 
            className="overlay-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              closeExpanded();
            }}
            title="Cerrar"
          >
            ←
          </button>
          <img src={expandedImage} alt="Expanded" />
        </div>
      )}
      {expandedVideo && (
        <div className="image-overlay" onClick={closeExpandedVideo}>
          <button 
            className="overlay-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              closeExpandedVideo();
            }}
            title="Cerrar"
          >
            ←
          </button>
          <video 
            ref={expandedVideoRef}
            src={expandedVideo}
            className="expanded-video"
            controls
            autoPlay
            loop
          />
        </div>
      )}
    </>
    );
  }

  // Vista normal de 3 columnas
  return (
    <>
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
                  onClick={() => handleCardClick(model)}
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
      {expandedImage && (
        <div className="image-overlay" onClick={closeExpanded}>
          <button 
            className="overlay-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              closeExpanded();
            }}
            title="Cerrar"
          >
            ←
          </button>
          <img src={expandedImage} alt="Expanded" />
        </div>
      )}
      {expandedVideo && (
        <div className="image-overlay" onClick={closeExpandedVideo}>
          <button 
            className="overlay-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              closeExpandedVideo();
            }}
            title="Cerrar"
          >
            ←
          </button>
          <video 
            ref={expandedVideoRef}
            src={expandedVideo}
            className="expanded-video"
            controls
            autoPlay
            loop
          />
        </div>
      )}
    </>
  );
};

export default Catalog;
