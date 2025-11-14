import React from 'react';

interface DescriptionModalProps {
  content: string;
  onClose: () => void;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({ content, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative"
        onClick={e => e.stopPropagation()} // Prevent click inside from closing modal
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Incident Description</h3>
        <p className="text-gray-600 whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">{content}</p>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default DescriptionModal;
