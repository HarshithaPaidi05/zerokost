import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Hero from './components/Hero';
import Features from './components/Features';
import SystemChecks from './components/SystemChecks';
import TranslationButton from './components/TranslationButton';
import Login from './components/Login';
import Signup from './components/Signup';
import DoctorPatientDashboard from './components/DoctorPatientDashboard';
import PrescriptionDashboard from './components/prescription';

const AppContent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'checks' | 'ready'>('welcome');

  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSignupClick = useCallback(() => {
    navigate('/signup');
  }, [navigate]);
  
  const handleWelcomeComplete = useCallback(() => {
    setStep('checks');
  }, []);
  
  const handleAllChecksComplete = useCallback(() => {
    setStep('ready');
  }, []);
  
  const handleStartTranslation = useCallback(() => {
    console.log('Starting translation...');
    alert('Translation interface would open here. This feature is coming soon!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 text-white flex flex-col">
      <motion.header 
        className="py-4 px-6 flex justify-between items-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-2xl font-bold text-primary-500"
          whileHover={{ scale: 1.05 }}
        >
          ZEROKOST HEALTHCARE 
        </motion.div>
        <div className="flex gap-3">
          <motion.button
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center space-x-2 shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </motion.button>
          <motion.button
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center space-x-2 shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
          >
            Login
          </motion.button>
        </div>
      </motion.header>
      
      <main className="flex-1 flex flex-col">
        {step === 'welcome' && (
          <>
            <div className="flex items-center justify-center p-4">
              <Hero onWelcomeComplete={handleWelcomeComplete} />
            </div>
            <Features />
          </>
        )}
        
        {step === 'checks' && (
          <div className="flex items-center justify-center p-4">
            <SystemChecks onAllChecksComplete={handleAllChecksComplete} />
          </div>
        )}
        
        {step === 'ready' && (
          <>
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                All Systems Ready
              </motion.h2>
              <motion.p 
                className="text-gray-300 text-xl max-w-2xl mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Your system is fully configured for optimal translation experience.
              </motion.p>
            </motion.div>
            
            <TranslationButton onClick={handleStartTranslation} onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
          </>
        )}
      </main>
      
      <motion.footer 
        className="py-4 px-6 text-center text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Vera AI Voice Translator &copy; 2025
      </motion.footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;