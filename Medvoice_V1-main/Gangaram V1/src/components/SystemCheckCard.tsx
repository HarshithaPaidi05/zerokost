import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Speaker, Volume2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { SystemCheckType } from '../types';

interface SystemCheckCardProps {
  type: SystemCheckType;
  status: 'idle' | 'checking' | 'success' | 'error';
  onClick: () => void;
  disabled?: boolean;
}

const SystemCheckCard: React.FC<SystemCheckCardProps> = ({ 
  type, 
  status, 
  onClick,
  disabled = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'microphone':
        return <Mic className="w-6 h-6" />;
      case 'speaker':
        return <Speaker className="w-6 h-6" />;
      case 'volume':
        return <Volume2 className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'microphone':
        return 'Microphone Check';
      case 'speaker':
        return 'Speaker Check';
      case 'volume':
        return 'Volume Check';
      default:
        return 'Unknown Check';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'microphone':
        return status === 'idle' 
          ? 'Verify microphone access' 
          : status === 'checking'
            ? 'Requesting microphone access...'
            : status === 'success'
              ? 'Microphone access granted'
              : 'Unable to access microphone';
      case 'speaker':
        return status === 'idle' 
          ? 'Verify speaker functionality' 
          : status === 'checking'
            ? 'Playing test sound...'
            : status === 'success'
              ? 'Speaker is working properly'
              : 'Speaker test failed';
      case 'volume':
        return status === 'idle' 
          ? 'Verify volume level' 
          : status === 'checking'
            ? 'Checking volume level...'
            : status === 'success'
              ? 'Volume level is optimal'
              : 'Volume level is too low';
      default:
        return 'Unknown check';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 className="w-5 h-5 text-primary-500" />
          </motion.div>
        );
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'idle':
        return 'border-gray-700';
      case 'checking':
        return 'border-primary-500';
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-700';
    }
  };

  return (
    <motion.div
      className={`p-6 rounded-xl border ${getBorderColor()} bg-dark-500 relative overflow-hidden cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.02, boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.3)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-dark-400 rounded-lg text-primary-500">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{getTitle()}</h3>
            <p className="text-gray-400 text-sm">{getDescription()}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
};

export default SystemCheckCard;