import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Clock, Calendar, User,
  PlusCircle, Search
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  sender: 'doctor' | 'patient';
  content: string;
  time: string;
}

interface Patient {
  id: number;
  name: string;
  status: 'Active' | 'Waiting' | 'Scheduled';
  time: string;
}

export default function DoctorPatientDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'doctor',
      content: 'Hello Aarohi, how are you feeling today?',
      time: '9:00 AM'
    },
    {
      id: 2,
      sender: 'patient',
      content: 'Hi Doctor, my back pain has been bothering me a lot lately.',
      time: '9:01 AM'
    },
    {
      id: 3,
      sender: 'doctor',
      content: 'I understand. Have you been doing the prescribed exercises?',
      time: '9:02 AM'
    },
    {
      id: 4,
      sender: 'patient',
      content: 'Yes, but I find it difficult to maintain proper posture during work.',
      time: '9:03 AM'
    }
  ]);
  const [recording, setRecording] = useState(false);

  const handleStartRecording = () => {
    setRecording(true);
  };

  const handleTerminateSession = () => {
    setRecording(false);
  };

  const patients: Patient[] = [
    { id: 1, name: 'Aarohi Sharma', status: 'Active', time: '9:00 AM' },
{ id: 2, name: 'Rahul Mehta', status: 'Waiting', time: '9:30 AM' },
{ id: 3, name: 'Priya Verma', status: 'Scheduled', time: '10:00 AM' },
{ id: 4, name: 'Arjun Reddy', status: 'Scheduled', time: '10:30 AM' },
{ id: 5, name: 'Sneha Iyer', status: 'Scheduled', time: '11:00 AM' },

  ];
  

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <div className="flex flex-1">
        {/* Sidebar */}
        <motion.div
          className="w-full md:w-3/12 bg-white border-r border-gray-200 flex flex-col"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Patient List Section */}
          <div className="p-4 border-b border-gray-200 bg-white flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">Patient List</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-8 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {patients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500">{patient.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    {
                      'Active': 'bg-green-100 text-green-800',
                      'Waiting': 'bg-yellow-100 text-yellow-800',
                      'Scheduled': 'bg-blue-100 text-blue-800'
                    }[patient.status]}`}
                  >
                    {patient.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Patient */}
          <div className="p-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-full py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-md shadow hover:shadow-lg transition-all"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Patient
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          className="w-full md:w-9/12 flex flex-col bg-gray-50"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow">
                  <User className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Aarohi Sharma</p>
                  <p className="text-sm text-gray-500">Last visit: April 15, 2025</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartRecording}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md shadow hover:shadow-lg transition-all"
              >
                🎙️ Start Session
              </motion.button>
            </div>
          </div>

          {/* Patient Information and Chat Section */}
          <div className="flex-1 flex p-6 space-x-6">
            {/* Patient Information */}
            <div className="w-1/2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Overview</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Name</span>
                        <span className="text-gray-800 font-medium">Aarohi Sharma</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Age</span>
                        <span className="text-gray-800 font-medium">28 years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Gender</span>
                        <span className="text-gray-800 font-medium">Female</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Blood Group</span>
                        <span className="text-gray-800 font-medium">O+</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Medical History</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Allergies</span>
                        <span className="text-gray-800 font-medium">Penicillin, Peanuts</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Chronic Conditions</span>
                        <span className="text-gray-800 font-medium">Asthma, Hypertension</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Past Surgeries</span>
                        <span className="text-gray-800 font-medium">Appendectomy (2020)</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="w-1/2 bg-white rounded-xl shadow-sm p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Conversation History</h3>
              <div className="flex-1 overflow-y-auto px-2 space-y-4">
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {message.sender === 'patient' && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl ${message.sender === 'doctor'
                          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`text-[10px] mt-1 ${message.sender === 'doctor' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {message.time}
                        </p>
                      </div>
                      {message.sender === 'doctor' && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4.8 21.6V19.2C4.8 17.2 6.4 15.6 8.4 15.6H15.6C17.6 15.6 19.2 17.2 19.2 19.2V21.6" />
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" />
                            <path d="M9 9H15" />
                            <path d="M12 6V12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 bg-white flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTerminateSession}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md shadow hover:shadow-lg transition-all"
            >
              Terminate Session
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/prescription')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow hover:shadow-lg transition-all"
            >
              Prescription
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
