import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SystemCheckCard from './SystemCheckCard';
import { SystemCheckStatus, SystemCheckType } from '../types';
import testaudio from '../assets/sounds/test-sound.mp3';

interface SystemChecksProps {
  onAllChecksComplete: () => void;
}

const SystemChecks: React.FC<SystemChecksProps> = ({ onAllChecksComplete }) => {
  const [status, setStatus] = useState<SystemCheckStatus>({
    microphone: 'idle',
    speaker: 'idle',
    volume: 'idle'
  });

  const isAllComplete = Object.values(status).every(s => s === 'success');

  React.useEffect(() => {
    if (isAllComplete) {
      onAllChecksComplete();
    }
  }, [isAllComplete, onAllChecksComplete]);

  const handleMicrophoneCheck = async () => {
    setStatus(prev => ({ ...prev, microphone: 'checking' }));
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus(prev => ({ ...prev, microphone: 'success' }));
    } catch (error) {
      console.error('Microphone check failed:', error);
      setStatus(prev => ({ ...prev, microphone: 'error' }));
    }
  };

  const handleSpeakerCheck = () => {
    setStatus(prev => ({ ...prev, speaker: 'checking' }));
    
    try {
      const testAudio = new Audio(testaudio);
      // Add event listeners before playing
      testAudio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setStatus(prev => ({ ...prev, speaker: 'error' }));
        alert('Failed to play test sound. Please check your audio settings.');
      });

      testAudio.addEventListener('ended', () => {
        const heard = window.confirm('Did you hear the test sound? Click OK if you heard it, Cancel if you did not.');
        if (heard) {
          setStatus(prev => ({ ...prev, speaker: 'success' }));
        } else {
          setStatus(prev => ({ ...prev, speaker: 'error' }));
          alert('Please check your speaker settings and volume, then try again.');
        }
      });
      
      // Start playing with a small delay to ensure listeners are set up
      setTimeout(() => {
        testAudio.play().catch(error => {
          console.error('Speaker check failed:', error);
          setStatus(prev => ({ ...prev, speaker: 'error' }));
          alert('Failed to play test sound. Please ensure audio playback is enabled.');
        });
      }, 1000);
    } catch (error) {
      console.error('Speaker check failed:', error);
      setStatus(prev => ({ ...prev, speaker: 'error' }));
      alert('An error occurred during the speaker check. Please try again.');
    }
  };

  const handleVolumeCheck = () => {
    setStatus(prev => ({ ...prev, volume: 'checking' }));
    
    setTimeout(() => {
      const isVolumeHigh = window.confirm('Is your volume set to an optimal level? Click OK if yes, Cancel if no.');
      if (isVolumeHigh) {
        setStatus(prev => ({ ...prev, volume: 'success' }));
      } else {
        setStatus(prev => ({ ...prev, volume: 'error' }));
        alert('Please increase your volume to an optimal level and try again.');
      }
    }, 500);
  };

  const getCheckHandler = (type: SystemCheckType) => {
    switch (type) {
      case 'microphone':
        return handleMicrophoneCheck;
      case 'speaker':
        return handleSpeakerCheck;
      case 'volume':
        return handleVolumeCheck;
    }
  };

  const isCheckDisabled = (type: SystemCheckType): boolean => {
    if (type === 'microphone') return false;
    if (type === 'speaker') return status.microphone !== 'success';
    if (type === 'volume') return status.speaker !== 'success';
    return false;
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
          System Check
        </h2>
        <p className="text-gray-400">Let's ensure everything is working properly</p>
      </motion.div>

      <div className="grid gap-6">
        {(['microphone', 'speaker', 'volume'] as SystemCheckType[]).map((type, index) => (
          <motion.div
            key={type}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <SystemCheckCard
              type={type}
              status={status[type]}
              onClick={getCheckHandler(type)}
              disabled={isCheckDisabled(type)}
            />
          </motion.div>
        ))}
      </div>

      {isAllComplete && (
        <motion.div
          className="mt-8 text-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="inline-block p-4 rounded-full bg-green-500/20 text-green-500 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              ✓
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-green-500">All Checks Complete!</h3>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SystemChecks;