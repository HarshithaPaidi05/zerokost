import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import welcomeSound from '../assets/sounds/welcome.mp3';
import companyLogo from '../assets/zerokost.png';

interface HeroProps {
  onWelcomeComplete: () => void;
}

interface LanguageBubbleProps {
  language: string;
  speakers: number;
  position: { x: number; y: number };
  size: number;
  type: 'domestic' | 'international';
}

const languages = [
  { name: 'English', speakers: 1200, type: 'international' },
  { name: 'Española', speakers: 800, type: 'international' },
  { name: 'Français', speakers: 1500, type: 'international' },
  { name: 'हिंदी', speakers: 900, type: 'domestic' },
  { name: 'عربي', speakers: 700, type: 'international' },
  { name: 'ಕನ್ನಡ', speakers: 600, type: 'domestic' },
  { name: 'मराठी', speakers: 500, type: 'domestic' },
  { name: 'தமிழ்', speakers: 400, type: 'domestic' },
  { name: 'తెలుగు', speakers: 300, type: 'domestic' },
  { name: 'हरियाणवी', speakers: 200, type: 'domestic' },
];

const LanguageBubble: React.FC<LanguageBubbleProps> = ({ language, speakers, position, size, type }) => {
  const randomDuration = Math.random() * 10 + 20;
  const randomDelay = Math.random() * 2;

  return (
    <motion.div
      className="absolute rounded-full flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        background: type === 'domestic' 
          ? `linear-gradient(135deg, rgba(34, 197, 94, ${Math.random() * 0.3 + 0.1}) 0%, rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1}) 100%)`
          : `linear-gradient(135deg, rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1}) 0%, rgba(168, 85, 247, ${Math.random() * 0.3 + 0.1}) 100%)`,
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      initial={{ x: position.x + 100, y: position.y + 200, opacity: 0 }}
      animate={{
        x: [position.x + 100, position.x - 100, position.x],
        y: [position.y + 200, position.y - 100, position.y],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'easeInOut',
      }}
    >
      <div className="text-center text-white/80">
        <div className="text-xs font-medium">{language}</div>
        <div className="text-[10px] opacity-60">{speakers}+</div>
      </div>
    </motion.div>
  );
};

const Hero: React.FC<HeroProps> = ({ onWelcomeComplete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [bubbles, setBubbles] = useState<Array<LanguageBubbleProps>>([]);

  useEffect(() => {
    const generateBubbles = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const minSize = Math.min(viewportWidth, viewportHeight) * 0.08; // 8% of smallest viewport dimension
      const maxSize = Math.min(viewportWidth, viewportHeight) * 0.15; // 15% of smallest viewport dimension
      
      // Create more bubbles by duplicating languages
      const extendedLanguages = [...languages, ...languages];
      const newBubbles = extendedLanguages.map((lang) => {
        const size = Math.random() * (maxSize - minSize) + minSize;
        const maxOffset = Math.min(viewportWidth, viewportHeight) * 0.2; // 20% of smallest viewport dimension
        
        return {
          language: lang.name,
          speakers: lang.speakers,
          position: {
            x: (Math.random() - 0.5) * (viewportWidth * 0.8), // 80% of viewport width
            y: (Math.random() - 0.5) * (viewportHeight * 0.8), // 80% of viewport height
          },
          size,
          type: lang.type,
        };
      });
      setBubbles(newBubbles);
    };

    generateBubbles();
    window.addEventListener('resize', generateBubbles);
    return () => window.removeEventListener('resize', generateBubbles);
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setUserInteracted(true);
      window.removeEventListener('click', handleClick);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!userInteracted) return;

    const audio = new Audio(welcomeSound);
    audioRef.current = audio;

    const playWelcome = async () => {
      try {
        audio.addEventListener('ended', onWelcomeComplete);
        await audio.play();
      } catch (error) {
        console.error('Failed to play welcome audio:', error);
        alert('Unable to play welcome message. Please ensure your audio is enabled.');
        onWelcomeComplete();
      }
    };

    const timeoutId = setTimeout(playWelcome, 1000);
    return () => {
      clearTimeout(timeoutId);
      audio.removeEventListener('ended', onWelcomeComplete);
      audio.pause();
    };
  }, [userInteracted, onWelcomeComplete]);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-[80vh] w-full relative overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {bubbles.map((bubble, index) => (
        <LanguageBubble key={index} {...bubble} />
      ))}
      
      <motion.div
        className="w-24 h-24 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-full flex items-center justify-center mb-8 relative z-10"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <motion.div
          className="w-16 h-16 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full flex items-center justify-center relative"
          animate={{ 
            y: [0, -8, 0],
            boxShadow: [
              "0 0 0 0 rgba(99, 102, 241, 0.4)",
              "0 0 0 20px rgba(99, 102, 241, 0)"
            ]
          }}
          transition={{ 
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <Mic className="w-8 h-8 text-primary-500 relative z-10" />
        </motion.div>
      </motion.div>
      
      <motion.h1 
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        AI Powered Healthcare Voice Assist
      </motion.h1>
      
      <motion.p 
        className="text-lg md:text-xl text-center max-w-2xl text-gray-300 mb-8 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}      >
        Experience seamless multilingual healthcare communication with our advanced voice translation system.
      </motion.p>

      {!userInteracted && (
        <motion.button
          onClick={() => setUserInteracted(true)}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold shadow-lg hover:shadow-primary-500/20 relative z-10"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Click to Start
        </motion.button>
      )}

      <motion.div 
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 mt-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
      >
        <a 
          href="https://www.zerokost.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <img src={companyLogo} alt="Zerokost Healthcare Logo" className="w-40 h-40 object-contain" />
        </a>
        <span className="text-3xl bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-bold">ZEROKOST HEALTHCARE PVT LTD</span>
      </motion.div>
    </motion.div>
  );
};

export default Hero;
