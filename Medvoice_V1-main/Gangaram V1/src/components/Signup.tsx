import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    id: '',
    hospital: '',
    email: '',
    mobile: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoiceRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (Object.values(formData).some(value => !value)) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Mobile validation (assuming 10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    console.log('Proceeding to voice registration with:', formData);
    // Here you would typically handle the voice registration process
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 flex items-center justify-center p-4">
      <motion.div
        className="bg-dark-500 p-8 rounded-2xl shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-3xl font-bold text-white mb-6 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Sign Up for Vera Voice
        </motion.h1>
        
        <form onSubmit={handleVoiceRegistration} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-600 text-white focus:outline-none focus:border-primary-500"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-gray-300 mb-2">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-600 text-white focus:outline-none focus:border-primary-500"
              placeholder="Enter your department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="id" className="block text-gray-300 mb-2">ID</label>
            <input
              type="text"
              id="id"
              name="id"
              className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-600 text-white focus:outline-none focus:border-primary-500"
              placeholder="Enter your ID"
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="hospital" className="block text-gray-300 mb-2">Hospital</label>
            <input
              type="text"
              id="hospital"
              name="hospital"
              className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-600 text-white focus:outline-none focus:border-primary-500"
              placeholder="Enter your hospital"
              value={formData.hospital}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-600 text-white focus:outline-none focus:border-primary-500"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-gray-300 mb-2">Mobile</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-600 text-white focus:outline-none focus:border-primary-500"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-bold text-lg mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Voice Registration
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;