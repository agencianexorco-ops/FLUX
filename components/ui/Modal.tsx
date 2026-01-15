
import React from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300" 
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s forwards' }}
    >
      <div
        className="bg-white/90 dark:bg-dark-secondary/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg w-full max-w-lg m-4 transform transition-all duration-300"
        style={{ animation: 'scaleIn 0.3s forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-800 dark:hover:text-white">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;
