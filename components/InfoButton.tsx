import React, { useState } from 'react';
import { InfoIcon } from './Icons';

interface InfoButtonProps {
  text: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ text }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className="text-gray-400 hover:text-gray-600">
        <InfoIcon />
      </button>
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 animate-fade-in-fast">
          {text}
           <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default InfoButton;
