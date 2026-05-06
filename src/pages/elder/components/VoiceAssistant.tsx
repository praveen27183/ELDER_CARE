import { useEffect, useRef, useState } from "react";
import { Mic, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceAssistantProps {
  onCommand: (command: string) => void;
  language: "en" | "ta" | "hi";
}

export default function VoiceAssistant({ onCommand, language }: VoiceAssistantProps) {
  const recognitionRef = useRef<any>(null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const langMap = {
    en: "en-US",
    ta: "ta-IN",
    hi: "hi-IN",
  };

  /* =========================
     INIT + LANGUAGE SWITCH FIX
  ========================== */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Browser not supported (use Chrome)");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language];
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      processCommand(text);
    };

    recognition.onerror = (e: any) => {
      setError(e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  /* =========================
     SPEAK FUNCTION
  ========================== */
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = langMap[language];
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  /* =========================
     AI-LIKE INTENT DETECTION
  ========================== */
  const detectIntent = (text: string) => {
    const t = text.toLowerCase();

    const patterns = {
      medicines: [
        "medicine", "tablet", "pill", "doctor", "fever", "sick",
        "மருந்து", "டாக்டர்",
        "दवा", "डॉक्टर"
      ],
      groceries: [
        "grocery", "food", "vegetable", "milk", "buy",
        "மளிகை", "காய்கறி",
        "किराना", "सब्जी"
      ],
      transport: [
        "go", "ride", "car", "hospital", "travel",
        "போ", "வாகனம்",
        "जाना", "गाड़ी"
      ],
      househelp: [
        "clean", "house", "maid", "help", "wash",
        "சுத்தம்", "உதவி",
        "सफाई", "मदद"
      ],
      callsupport: [
        "call", "phone", "talk", "contact",
        "அழை", "பேச",
        "कॉल", "बात"
      ],
      sos: [
        "emergency", "danger", "help me", "urgent",
        "அவசரம்",
        "आपातकाल"
      ],
    };

    let best = "unknown";
    let score = 0;

    Object.entries(patterns).forEach(([intent, words]) => {
      let current = 0;

      words.forEach((w) => {
        if (t.includes(w)) current++;
      });

      if (current > score) {
        score = current;
        best = intent;
      }
    });

    return best;
  };

  /* =========================
     PROCESS COMMAND
  ========================== */
  const processCommand = (text: string) => {
    setTranscript(text);

    const intent = detectIntent(text);

    speak(`You said ${text}`);

    if (intent !== "unknown") {
      onCommand(intent);
    } else {
      speak("Sorry, I did not understand");
    }
  };

  /* =========================
     START LISTENING
  ========================== */
  const startListening = () => {
    try {
      if (!recognitionRef.current) return;

      setTranscript("");
      setError("");
      setIsListening(true);

      recognitionRef.current.start();
    } catch {
      setError("Microphone permission issue");
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <>
      {/* FLOAT BUTTON (FIXED ABOVE NAVBAR) */}
      <button
        onClick={startListening}
        className={`fixed bottom-28 left-6 z-[60] p-5 rounded-full text-white shadow-lg ${
          isListening ? "bg-red-600" : "bg-emerald-600"
        }`}
      >
        <Mic className="w-8 h-8" />
      </button>

      {/* FULL SCREEN LISTEN UI */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-[70] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setIsListening(false)}
              className="absolute top-6 right-6 text-white"
            >
              <X className="w-16 h-16" />
            </button>

            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="bg-emerald-500 p-10 rounded-full mb-6"
            >
              <Mic className="w-12 h-12 text-white" />
            </motion.div>

            <p className="text-white text-xl text-center">
              {transcript || "Listening..."}
            </p>

            {error && <p className="text-red-400 mt-4">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}