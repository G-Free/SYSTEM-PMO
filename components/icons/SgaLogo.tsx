import React from 'react';

export const SgaLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 120 100" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
    {/* Logomarca SGA - Símbolo Geométrico de Asa/Movimento */}
    {/* Parte Esquerda - Azul Institucional */}
    <path d="M10 90 L50 10 L80 10 L40 90 Z" fill="#2b6cb0" />
    
    {/* Parte Central - Teal/Ciano */}
    <path d="M50 90 L90 10 L115 10 L75 90 Z" fill="#319795" />
    
    {/* Acento Menor - Sombra/Detalhe */}
    <path d="M85 90 L105 50 L120 50 L100 90 Z" fill="#2d3748" opacity="0.4" />
  </svg>
);
