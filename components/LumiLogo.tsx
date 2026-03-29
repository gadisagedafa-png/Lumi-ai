
import React from 'react';

interface LumiLogoProps {
  className?: string;
  variant?: 'color' | 'white';
}

const LumiLogo: React.FC<LumiLogoProps> = ({ className = "h-10 w-auto", variant = 'color' }) => {
  const gradientId = "lumi-brand-gradient";
  const strokeColor = variant === 'white' ? '#FFFFFF' : `url(#${gradientId})`;

  return (
    <svg 
      viewBox="0 0 160 55" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} overflow-visible select-none`}
      aria-label="LUMI Logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4D6D" /> {/* Bright Pink */}
          <stop offset="50%" stopColor="#A855F7" /> {/* Purple */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* Blue */}
        </linearGradient>
        <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g filter={variant === 'white' ? '' : "url(#glow-soft)"}>
        {/* L */}
        <path 
          d="M20 12 V40 A 6 6 0 0 0 26 46 H40" 
          stroke={strokeColor} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* U */}
        <path 
          d="M55 16 V34 A 12 12 0 0 0 79 34 V16" 
          stroke={strokeColor} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* M */}
        <path 
          d="M94 46 V16 L109 36 L124 16 V46" 
          stroke={strokeColor} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* I - Moved closer to M (x=139) for better legibility */}
        <path 
          d="M139 24 V46" 
          stroke={strokeColor} 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
      </g>
      
      {/* Animated Star/Sparkle above I - Centered at x=139 */}
      <g style={{ transformOrigin: '139px 9px', animation: 'spin-slow 4s linear infinite' }}>
          <path 
            d="M139 2 L141.5 7 L146 9 L141.5 11 L139 16 L136.5 11 L132 9 L136.5 7 Z" 
            fill={variant === 'white' ? '#FFFFFF' : '#FBBF24'} 
          />
      </g>
      
      <style>
        {`
          @keyframes spin-slow { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
          }
        `}
      </style>
    </svg>
  );
};

export default LumiLogo;
