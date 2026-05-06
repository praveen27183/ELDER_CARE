import {
  ArrowLeft,
  Phone,
  AlertTriangle,
  Mic,
  MessageSquare,
  MapPin,
  Clock,
  Ticket,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* =========================
   TYPES
========================= */
type CallType = "support" | "emergency";
type TicketType = "issue" | "feedback" | "request";

/* =========================
   MAIN COMPONENT
========================= */
export default function Help() {
  const navigate = useNavigate();

  /* ---------- STATE ---------- */
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<CallType>("support");

  const [callLogs, setCallLogs] = useState<
    { number: string; time: string; type: CallType }[]
  >([]);

  const [tickets, setTickets] = useState<
    { id: number; type: TicketType; message: string; status: string }[]
  >([]);

  const [chat, setChat] = useState<
    { from: "user" | "bot"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");

  const recognitionRef = useRef<any>(null);

  /* ---------- LOAD PERSISTED DATA ---------- */
  useEffect(() => {
    const logs = localStorage.getItem("callLogs");
    const tks = localStorage.getItem("tickets");
    if (logs) setCallLogs(JSON.parse(logs));
    if (tks) setTickets(JSON.parse(tks));
  }, []);

  /* =========================
     CALL SYSTEM
  ========================== */
  const makeCall = () => {
    const number = callType === "emergency" ? "112" : "1800123456";

    const newLog = {
      number,
      type: callType,
      time: new Date().toLocaleString(),
    };

    const updated = [newLog, ...callLogs];
    setCallLogs(updated);
    localStorage.setItem("callLogs", JSON.stringify(updated));

    window.location.href = `tel:${number}`;
    setShowCallModal(false);
  };

  /* =========================
     VOICE CALL (BASIC)
  ========================== */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase();

      if (text.includes("emergency")) {
        setCallType("emergency");
        setShowCallModal(true);
      } else if (text.includes("call")) {
        setCallType("support");
        setShowCallModal(true);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const startVoice = () => {
    recognitionRef.current?.start();
  };

  /* =========================
     LOCATION (SOS)
  ========================== */
  const sendLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      alert("Location ready to share!");
      window.open(mapLink, "_blank");
    });
  };

  /* =========================
     CHATBOT (RULE-BASED)
  ========================== */
  const botReply = (msg: string) => {
    msg = msg.toLowerCase();

    if (msg.includes("medicine"))
      return "You can book medicines from home screen.";
    if (msg.includes("call"))
      return "Click Call Support or say 'call support'.";
    if (msg.includes("emergency"))
      return "Press Emergency button or say 'emergency'.";
    return "I’m here to help! Try asking about services.";
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg = { from: "user" as const, text: chatInput };
    const botMsg = {
      from: "bot" as const,
      text: botReply(chatInput),
    };

    setChat((prev) => [...prev, userMsg, botMsg]);
    setChatInput("");
  };

  /* =========================
     TICKET SYSTEM
  ========================== */
  const createTicket = () => {
    const msg = prompt("Describe your issue:");
    if (!msg) return;

    const newTicket = {
      id: Date.now(),
      type: "issue" as TicketType,
      message: msg,
      status: "Open",
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem("tickets", JSON.stringify(updated));
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="min-h-screen bg-slate-100 pb-10">

      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 bg-white shadow">
        <ArrowLeft onClick={() => navigate(-1)} />
        <h1 className="text-xl font-bold">Help Center</h1>
      </div>

      <div className="p-4 space-y-4">

        {/* CALL SUPPORT */}
        <button
          onClick={() => {
            setCallType("support");
            setShowCallModal(true);
          }}
          className="w-full bg-green-100 p-4 rounded-xl flex gap-3"
        >
          <Phone /> Call Support
        </button>

        {/* EMERGENCY */}
        <button
          onClick={() => {
            setCallType("emergency");
            setShowCallModal(true);
          }}
          className="w-full bg-red-100 p-4 rounded-xl flex gap-3"
        >
          <AlertTriangle /> Emergency Call
        </button>

        {/* VOICE */}
        <button
          onClick={startVoice}
          className="w-full bg-blue-100 p-4 rounded-xl flex gap-3"
        >
          <Mic /> Voice Call
        </button>

        {/* LOCATION */}
        <button
          onClick={sendLocation}
          className="w-full bg-yellow-100 p-4 rounded-xl flex gap-3"
        >
          <MapPin /> Send My Location
        </button>

        {/* TICKET */}
        <button
          onClick={createTicket}
          className="w-full bg-purple-100 p-4 rounded-xl flex gap-3"
        >
          <Ticket /> Create Support Ticket
        </button>

        {/* CHATBOT */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <MessageSquare /> AI Chat
          </h3>

          <div className="h-40 overflow-y-auto text-sm mb-2">
            {chat.map((c, i) => (
              <p key={i} className={c.from === "user" ? "text-right" : ""}>
                {c.text}
              </p>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <button onClick={sendChat}>
              <Send />
            </button>
          </div>
        </div>

        {/* CALL LOGS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold flex gap-2 items-center">
            <Clock /> Call Logs
          </h3>

          {callLogs.map((log, i) => (
            <p key={i} className="text-sm">
              {log.type} → {log.number} ({log.time})
            </p>
          ))}
        </div>

        {/* TICKETS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold">Support Tickets</h3>

          {tickets.map((t) => (
            <p key={t.id} className="text-sm">
              #{t.id} - {t.message} ({t.status})
            </p>
          ))}
        </div>
      </div>

      {/* CALL MODAL */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="mb-4 font-bold">
              {callType === "emergency"
                ? "Emergency Call"
                : "Call Support"}
            </h2>

            <div className="flex gap-3">
              <button onClick={() => setShowCallModal(false)}>
                Cancel
              </button>

              <button
                onClick={makeCall}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}