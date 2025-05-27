import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, StopCircle } from 'lucide-react';

interface TranslationButtonProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

interface DoctorDetails {
  name: string;
  designation: string;
  department: string;
}

const TranslationButton: React.FC<TranslationButtonProps> = ({ onLoginClick, onSignupClick }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails>({
    name: '',
    designation: '',
    department: ''
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioUrl(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'doctor_recording.wav', { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Save the audio file
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('doctorDetails', JSON.stringify(doctorDetails));
        
        fetch('http://localhost:5000/save-recording', {
          method: 'POST',
          body: formData
        });

        setHasRecording(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleStartTranslation = () => {
    // Open both translator and analyzer interfaces
    window.location.href ='http://localhost:5000'; // Translator interface
    window.open('http://localhost:5001', '_blank'); // MedVoice LLM interface
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDoctorDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <motion.div
      className="mt-10 flex flex-col items-center w-full max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      <div className="w-full p-6 mb-6 bg-dark-500 rounded-lg border border-gray-600">
        <p className="text-white text-lg">
          Please speak clearly into the microphone stating your:
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>Full Name</li>
            <li>Medical Designation</li>
            <li>Department</li>
          </ul>
        </p>
      </div>

      {audioUrl && (
        <div className="w-full mb-6">
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <motion.button
        className={`bg-gradient-to-r ${isRecording ? 'from-red-600 to-red-700' : 'from-primary-600 to-secondary-600'} text-white px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-2 shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300 mb-4`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
      >
        <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        {isRecording ? <StopCircle className="w-5 h-5 ml-2" /> : <Mic className="w-5 h-5 ml-2" />}
      </motion.button>

      {hasRecording && (
        <motion.button
          className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-2 shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartTranslation}
        >
          <span>Start Translation</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default TranslationButton;
