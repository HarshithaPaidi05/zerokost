import React from 'react';
import { motion } from 'framer-motion';
import { Code, Cloud, Smartphone, Palette, Database, Shield } from 'lucide-react';

const featureData = [
  {
    icon: Code,
    title: 'Core Functional Requirements',
    description: 'Advanced AI-powered voice translation, real-time processing, multi-language support, and accurate speech recognition capabilities.',
  },
  {
    icon: Cloud,
    title: 'Live Speech Translation',
    description: 'Real-time translation of doctor-patient conversations, enabling seamless communication across language barriers in medical settings.'
  },
  {
    icon: Smartphone,
    title: 'Speaker Identification',
    description: 'Accurately identifies and distinguishes between different speakers during medical consultations, maintaining context in multi-party conversations.',
  },
  {
    icon: Palette,
    title: 'Conversation Summarization',
    description: 'Automatically generates concise summaries of medical consultations, highlighting key diagnoses, treatments, and follow-up instructions.'
  },
  {
    icon: Database,
    title: 'Video Transcription',
    description: 'Transcribes and translates medical educational videos, making healthcare information accessible across language barriers.',
    premium: true
  },
  {
    icon: Shield,
    title: 'Message to Paramedic',
    description: 'Instant translation of emergency communications between patients and paramedics, ensuring critical medical information is accurately conveyed.'
  },
  {
    icon: Cloud,
    title: 'Multilingual Download',
    description: 'Download consultation transcripts and medical reports in multiple languages for better record-keeping and patient understanding.'
  },
  {
    icon: Shield,
    title: 'Web Login Access',
    description: 'Secure access to medical translation services with role-based authentication for healthcare providers and patients.'
  },
  {
    icon: Database,
    title: 'Cloud Backup',
    description: 'Automatic backup of medical translations and consultation records with encrypted storage for data security and compliance.'
  },
  {
    icon: Palette,
    title: 'Admin Dashboard',
    description: 'Comprehensive dashboard for healthcare administrators to manage users, monitor translation usage, and generate analytics reports.',
    premium: true
  },
  {
    icon: Smartphone,
    title: 'Chatbot Assistance',
    description: 'AI-powered chatbot providing instant support for common medical queries and appointment scheduling in multiple languages.'
  },
  {
    icon: Code,
    title: 'Sentiment Analysis',
    description: 'Advanced analysis of patient-doctor interactions to ensure effective communication and improve healthcare delivery quality.',
    premium: true
  }
];

const Features: React.FC = () => {
  return (
    <motion.section
      className="py-16 px-4 md:px-8 bg-dark-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Core Functionalities
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {featureData.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-dark-300 to-dark-200 rounded-xl p-6 shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  feature.premium
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20'
                }`}
              >
                <feature.icon
                  className={`w-6 h-6 ${
                    feature.premium ? 'text-yellow-100' : 'text-primary-500'
                  }`}
                />
              </div>
              <div className="ml-4 flex items-center gap-2">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                {feature.premium && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                    className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-full font-semibold"
                  >
                    Premium
                  </motion.span>
                )}
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Features;
