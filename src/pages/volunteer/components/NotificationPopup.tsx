import React, { useState, useEffect } from 'react';
import { X, Bell, User, AlertTriangle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept?: (taskId: string) => void;
  elderName: string;
  taskType: string;
  taskId?: string | number;
  location?: string;
  urgent?: boolean;
  message?: string;
  emergency_severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function NotificationPopup({
  isVisible,
  onClose,
  onAccept,
  elderName,
  taskType,
  taskId,
  location,
  urgent,
  message,
  emergency_severity,
}: NotificationPopupProps) {
  const [playSound, setPlaySound] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const navigate = useNavigate();

  // Reset state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setShowFullDetails(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Play notification sound using Web Audio API
      const playNotificationSound = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const now = audioContext.currentTime;
          const oscillator1 = audioContext.createOscillator();
          const oscillator2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator1.frequency.value = 800;
          oscillator2.frequency.value = 1200;
          oscillator1.type = 'sine';
          oscillator2.type = 'sine';

          gainNode.gain.value = 0;
          oscillator1.start(now);
          oscillator2.start(now);

          const ringDuration = 0.8;
          const ringInterval = 0.1;
          let elapsed = 0;

          const ringPattern = () => {
            if (elapsed < ringDuration) {
              gainNode.gain.value = 0.15;
              setTimeout(() => {
                gainNode.gain.value = 0;
                elapsed += ringInterval;
                if (elapsed < ringDuration) {
                  setTimeout(ringPattern, ringInterval * 1000);
                }
              }, ringInterval * 500);
            }
          };

          ringPattern();
          setTimeout(() => {
            oscillator1.stop();
            oscillator2.stop();
          }, ringDuration * 1000);

          setPlaySound(true);
        } catch (error) {
          console.log('Error playing notification sound:', error);
        }
      };

      playNotificationSound();

      // Repeat sound every 20 seconds
      const soundInterval = setInterval(playNotificationSound, 20000);

      return () => clearInterval(soundInterval);
    }
  }, [isVisible]);

  const handleViewDetails = () => {
    setShowFullDetails(true);
  };

  const handleAccept = () => {
    if (onAccept && taskId) {
      onAccept(taskId.toString());
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-500 max-w-lg w-full mx-4 ${
          showFullDetails ? 'scale-100 opacity-100' : 'scale-95 opacity-100'
        }`}
      >
        {/* Header with Icon */}
        <div className={`p-6 flex items-center justify-between ${urgent ? 'bg-red-500' : 'bg-blue-600'} text-white`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {urgent ? 'EMERGENCY ALERT' : 'NEW REQUEST'}
              </h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                {emergency_severity} PRIORITY
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-8">
          {!showFullDetails ? (
            <>
              {/* Simple View */}
              <div className="flex items-start gap-5 mb-8">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black ${
                    urgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  } shadow-inner`}
                >
                  {elderName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-slate-800 leading-tight mb-1">{elderName}</h4>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-tight mb-2">
                    Needs assistance with:
                  </p>
                  <div
                    className={`inline-block px-4 py-2 rounded-xl font-black text-lg ${
                      urgent
                        ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    }`}
                  >
                    {taskType}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200 active:scale-95"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleViewDetails}
                  className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-200"
                >
                  View Details
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Full Detailed View */}
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Request Information
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-slate-700 font-bold text-sm">
                        {location || 'Chennai, Tamil Nadu'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                        <AlertTriangle className={`w-4 h-4 ${urgent ? 'text-red-600' : 'text-amber-600'}`} />
                      </div>
                      <p className="text-slate-700 font-bold text-sm">
                        Severity:{' '}
                        <span className={urgent ? 'text-red-600' : 'text-amber-600'}>
                          {emergency_severity}
                        </span>
                      </p>
                    </div>
                  </div>

                  {message && (
                    <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm italic text-slate-600 text-sm">
                      "{message}"
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black transition-all hover:bg-red-100 active:scale-95 border border-red-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    className={`px-6 py-4 ${
                      urgent ? 'bg-red-600' : 'bg-emerald-600'
                    } text-white rounded-2xl font-black transition-all hover:opacity-90 active:scale-95 shadow-xl ${
                      urgent ? 'shadow-red-200' : 'shadow-emerald-200'
                    }`}
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sound Indicator */}
        {playSound && !showFullDetails && (
          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping opacity-50" />
        )}
      </div>
    </div>
  );
}