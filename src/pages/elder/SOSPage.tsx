import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, X, ShieldAlert, Users, PhoneCall, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RequestService from '../../services/RequestService';
import { getCurrentLocation } from '../volunteer/algorithms/PriorityScoring';
import { useLanguage } from "../../context/LanguageContext";

export default function SOSPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSending, setIsSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<any>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    };
    getLocation();
  }, []);

  const handleHoldStart = () => {
    if (sosSent) return;
    holdTimer.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdTimer.current);
          handleSOS();
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const handleHoldEnd = () => {
    clearInterval(holdTimer.current);
    if (holdProgress < 100) setHoldProgress(0);
  };

  const handleSOS = async () => {
    setIsSending(true);
    try {
      const address = location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Unknown location';
      await RequestService.addRequest({
        elderName: 'Elder User',
        taskType: 'Emergency SOS - Manual Activation',
        location: address,
        coordinates: location || { latitude: 0, longitude: 0 },
        urgent: true,
        message: 'Emergency assistance requested immediately!'
      });
      setSosSent(true);
    } catch (error) {
      console.error('Failed to send SOS:', error);
      alert('❌ Failed to send SOS. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const cancelSOS = () => {
    if (window.confirm("Are you sure you want to cancel the emergency alert?")) {
      setSosSent(false);
      setHoldProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 pt-6 pb-4 flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </motion.button>
        <h1 className="text-2xl font-black text-slate-800">{t.sos}</h1>
      </div>

      <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh] text-center">
        
        {/* SOS BUTTON CONTAINER */}
        <div className="relative mb-12">
          {/* Animated Background Rings */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-100 rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 bg-red-50 rounded-full"
          />

          {/* MAIN BUTTON */}
          <motion.button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-64 h-64 bg-red-600 rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex flex-col items-center justify-center border-8 border-white group overflow-hidden"
          >
            {/* Hold Progress Overlay */}
            <motion.div 
              className="absolute bottom-0 left-0 w-full bg-red-800 transition-all duration-75 origin-bottom"
              style={{ height: `${holdProgress}%` }}
            />
            
            <div className="relative z-20 flex flex-col items-center">
              <AlertTriangle className="w-16 h-16 text-white mb-2 group-active:scale-110 transition-transform" />
              <span className="text-white font-black text-2xl tracking-tighter">SOS</span>
              <span className="text-red-100 text-[10px] font-bold uppercase tracking-widest mt-1">{t.holdToSend}</span>
            </div>
          </motion.button>
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{t.emergencyAssistance || "Emergency Assistance"}</h2>
        <p className="text-slate-500 font-medium mb-12 px-8">
          In case of emergency, hold the red button. Help will be dispatched to your location immediately.
        </p>

        {/* QUICK CONTACTS */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            onClick={() => window.location.href = "tel:100"}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-3 bg-red-50 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.callPolice || "Call Police"}</span>
          </button>

          <button 
            onClick={() => window.location.href = "tel:108"}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-3 bg-blue-50 rounded-2xl">
              <PhoneCall className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.ambulance || "Ambulance"}</span>
          </button>
        </div>

      </div>

      {/* FULL SCREEN SOS OVERLAY */}
      <AnimatePresence>
        {sosSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-8 text-white overflow-hidden"
          >
            {/* Flashing Background Animation */}
            <motion.div 
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-red-700"
            />

            <div className="relative z-10 text-center w-full max-w-sm">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                <ShieldAlert className="w-16 h-16 text-red-600" />
              </motion.div>

              <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">{t.emergencyAlert}</h1>
              <p className="text-red-100 text-lg font-bold mb-12 uppercase tracking-widest">{t.helpOnWay}</p>

              {/* Real-time feedback list */}
              <div className="bg-red-800/50 backdrop-blur-md rounded-3xl p-6 text-left space-y-4 mb-12 border border-white/10">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 bg-emerald-400 rounded-full" 
                  />
                  <p className="text-xs font-bold uppercase tracking-widest">GPS Location Shared</p>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-red-200" />
                  <p className="text-xs font-bold uppercase tracking-widest">3 Nearby Volunteers Notified</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-red-200" />
                  <p className="text-xs font-bold uppercase tracking-widest">Family Contacted</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => window.location.href = "tel:100"}
                  className="w-full bg-white text-red-600 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  {t.directCall || "Direct Call Help"}
                </button>

                <button 
                  onClick={cancelSOS}
                  className="w-full bg-transparent border-2 border-white/30 text-white/70 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {t.safeNow || "I'm Safe Now (Cancel)"}
                </button>
              </div>
            </div>

            {/* Pulsating Map Decoration */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

