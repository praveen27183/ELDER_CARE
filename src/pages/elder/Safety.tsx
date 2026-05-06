import { ArrowLeft, ShieldAlert, Bell, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Safety() {
  const navigate = useNavigate();

  const [liveShare, setLiveShare] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [alarmOn, setAlarmOn] = useState(false);

  /* =========================
     SAFETY TIMER
  ========================== */
  useEffect(() => {
    let interval: any;

    if (timerActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (seconds === 0 && timerActive) {
      triggerSOS();
      setTimerActive(false);
      setSeconds(30);
    }

    return () => clearInterval(interval);
  }, [timerActive, seconds]);

  /* =========================
     SOS
  ========================== */
  const triggerSOS = () => {
    alert("🚨 Emergency Alert Triggered!");
  };

  /* =========================
     ALARM SOUND
  ========================== */
  const toggleAlarm = () => {
    setAlarmOn(!alarmOn);

    if (!alarmOn) {
      const audio = new Audio(
        "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
      );
      audio.loop = true;
      audio.play();

      setTimeout(() => {
        audio.pause();
        setAlarmOn(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">

      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 bg-white shadow">
        <ArrowLeft onClick={() => navigate(-1)} />
        <h1 className="text-2xl font-bold">Safety Toolkit</h1>
      </div>

      <div className="p-4 space-y-4">

        {/* STATUS CARD */}
        <div className="bg-green-100 p-4 rounded-xl">
          <p className="font-semibold text-green-700">
            ✅ You are currently safe
          </p>
        </div>

        {/* LIVE LOCATION */}
        <div className="bg-white p-5 rounded-xl flex justify-between items-center shadow">
          <div className="flex gap-2 items-center">
            <MapPin />
            <span>Live Location Sharing</span>
          </div>

          <input
            type="checkbox"
            checked={liveShare}
            onChange={() => setLiveShare(!liveShare)}
          />
        </div>

        {/* SAFETY TIMER */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Safety Timer</h2>

          <p className="text-sm text-gray-500 mb-3">
            If not cancelled, emergency alert will be sent.
          </p>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">{seconds}s</span>

            {!timerActive ? (
              <button
                onClick={() => setTimerActive(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Start
              </button>
            ) : (
              <button
                onClick={() => {
                  setTimerActive(false);
                  setSeconds(30);
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* FALL DETECTION (SIMULATION) */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Fall Detection</h2>
          <p className="text-sm text-gray-500 mb-3">
            Simulate a fall alert
          </p>

          <button
            onClick={triggerSOS}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Simulate Fall
          </button>
        </div>

        {/* LOUD ALARM */}
        <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell />
            <span>Loud Alarm</span>
          </div>

          <button
            onClick={toggleAlarm}
            className={`px-4 py-2 rounded ${
              alarmOn ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            {alarmOn ? "Stop" : "Play"}
          </button>
        </div>

        {/* SOS BUTTON */}
        <button
          onClick={triggerSOS}
          className="w-full bg-red-600 text-white p-5 rounded-xl text-xl font-bold"
        >
          🚨 Send SOS
        </button>

      </div>
    </div>
  );
}