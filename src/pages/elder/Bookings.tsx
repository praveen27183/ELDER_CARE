import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Search, Filter, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Phone, MessageCircle, Star, ChevronRight, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import LeafletMap from "../../components/shared/LeafletMap";
import { getCurrentLocation } from "../volunteer/algorithms/PriorityScoring";

interface Booking {
  id: number;
  service: string;
  serviceType: "medicine" | "grocery" | "transport" | "home" | "call";
  date: string;
  time: string;
  status: "Completed" | "Pending" | "Cancelled" | "In Progress";
  volunteerName?: string;
  volunteerPhone?: string;
  volunteerRating?: number;
  notes?: string;
  urgent?: boolean;
  estimatedDuration?: string;
  cost?: number;
}

const initialBookings: Booking[] = [
  {
    id: 1,
    service: "Medicine Delivery",
    serviceType: "medicine",
    date: "20 Feb 2026",
    time: "10:30 AM",
    status: "Completed",
    volunteerName: "Raj Kumar",
    volunteerPhone: "+91 98765 43210",
    volunteerRating: 4.8,
    notes: "Delivered blood pressure medication",
    cost: 50,
    estimatedDuration: "30 mins"
  },
  {
    id: 2,
    service: "House Help",
    serviceType: "home",
    date: "22 Feb 2026",
    time: "2:00 PM",
    status: "Pending",
    urgent: true,
    notes: "Need help with cleaning and organizing",
    estimatedDuration: "2 hours",
    cost: 200
  },
  {
    id: 3,
    service: "Grocery Shopping",
    serviceType: "grocery",
    date: "18 Feb 2026",
    time: "11:00 AM",
    status: "In Progress",
    volunteerName: "Priya Sharma",
    volunteerPhone: "+91 87654 32109",
    notes: "Weekly vegetables and fruits",
    cost: 150,
    estimatedDuration: "1 hour"
  }
];

export const BookingManager = {
  createBooking: (service: string, serviceType: Booking["serviceType"], details: Partial<Booking> = {}) => {
    const saved = localStorage.getItem("bookings");
    const currentBookings = saved ? JSON.parse(saved) : initialBookings;
    
    const newBooking: Booking = {
      id: Date.now(),
      service,
      serviceType,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: "Pending",
      ...details
    };
    
    const updated = [newBooking, ...currentBookings];
    localStorage.setItem("bookings", JSON.stringify(updated));
    return newBooking;
  }
};

export default function Bookings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Completed" | "Pending" | "Cancelled" | "In Progress">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 12.9716, longitude: 77.5946 });

  useEffect(() => {
    const saved = localStorage.getItem("bookings");
    if (saved) {
      setBookings(JSON.parse(saved));
    } else {
      setBookings(initialBookings);
      localStorage.setItem("bookings", JSON.stringify(initialBookings));
    }

    // Fetch user location for tracking
    const fetchLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        setUserLocation(loc);
      } catch (e) {
        console.error("Location error:", e);
      }
    };
    fetchLocation();
  }, []);

  const handleBookAgain = (oldBooking: Booking) => {
    const newBooking = BookingManager.createBooking(oldBooking.service, oldBooking.serviceType, {
      notes: oldBooking.notes,
      cost: oldBooking.cost,
      estimatedDuration: oldBooking.estimatedDuration,
      status: "In Progress", // Make it active immediately for tracking
      volunteerName: "Anita Sharma", // Mock volunteer
      volunteerPhone: "+91 99999 88888"
    });

    const saved = localStorage.getItem("bookings");
    if (saved) setBookings(JSON.parse(saved));
    
    setTrackingBooking(newBooking);
    setShowSuccess(t.bookAgain + " Successful!");
  };

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));
  };

  const cancelBooking = (id: number) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updated = bookings.map((b) => b.id === id ? { ...b, status: "Cancelled" as const } : b);
      saveBookings(updated);
      setShowSuccess("Booking Cancelled Successfully");
      setTimeout(() => setShowSuccess(null), 2000);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleMessage = (phone?: string) => {
    if (phone) window.location.href = `sms:${phone}`;
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.volunteerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      completed: bookings.filter(b => b.status === "Completed").length,
      pending: bookings.filter(b => b.status === "Pending").length,
      inProgress: bookings.filter(b => b.status === "In Progress").length,
    };
  }, [bookings]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending": return t.statusPending;
      case "In Progress": return t.statusInProgress;
      case "Completed": return t.statusCompleted;
      case "Cancelled": return t.statusCancelled;
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </motion.button>
          <h1 className="text-2xl font-black text-slate-800">{t.bookings}</h1>
        </div>

        {/* STATS */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { label: 'All', count: stats.total, color: 'bg-slate-800 text-white' },
            { label: 'Pending', count: stats.pending, color: 'bg-amber-100 text-amber-700' },
            { label: 'In Progress', count: stats.inProgress, color: 'bg-blue-100 text-blue-700' },
            { label: 'Completed', count: stats.completed, color: 'bg-emerald-100 text-emerald-700' }
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setStatusFilter(s.label === 'All' ? 'all' : s.label as any)}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                (statusFilter === 'all' && s.label === 'All') || statusFilter === s.label
                ? s.color + " shadow-lg ring-2 ring-offset-2 ring-slate-100"
                : "bg-white text-slate-500 border border-slate-100"
              }`}
            >
              <span className="text-xs font-black uppercase tracking-widest">
                {s.label === 'All' ? t.all : getStatusLabel(s.label)}
              </span>
              <span className="text-lg font-black">{s.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        
        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchBookings || "Find a service..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all font-semibold shadow-sm"
          />
        </div>

        {/* LIST */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={booking.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                  booking.status === 'Completed' ? 'bg-emerald-500' :
                  booking.status === 'Pending' ? 'bg-amber-500' :
                  booking.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                      {booking.serviceType === 'medicine' ? '💊' : 
                       booking.serviceType === 'grocery' ? '🛒' :
                       booking.serviceType === 'transport' ? '🚗' : '🏠'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800">{booking.service}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{booking.date} • {booking.time}</p>
                    </div>
                  </div>
                  {booking.urgent && (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">Urgent</div>
                  )}
                </div>

                {booking.notes && (
                  <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border-l-4 border-slate-200">
                    "{booking.notes}"
                  </p>
                )}

                {/* Volunteer Section */}
                {booking.volunteerName && (
                  <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Volunteer</p>
                        <p className="font-black text-slate-800 text-sm">{booking.volunteerName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCall(booking.volunteerPhone)}
                        className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200"
                      >
                        <Phone className="w-4 h-4" />
                      </motion.button>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMessage(booking.volunteerPhone)}
                        className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-3">
                  {booking.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => cancelBooking(booking.id)}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={() => setShowSuccess("Modification Request Sent")}
                        className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                      >
                        {t.modify}
                      </button>
                    </>
                  )}
                  {booking.status === 'In Progress' && (
                    <button 
                      onClick={() => setTrackingBooking(booking)}
                      className="w-full py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      {t.track}
                    </button>
                  )}
                  {booking.status === 'Completed' && (
                    <button 
                      onClick={() => handleBookAgain(booking)}
                      className="w-full py-4 rounded-2xl bg-slate-800 text-white text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                    >
                      {t.bookAgain}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {booking.status === 'Cancelled' && (
                    <div className="w-full py-3 text-center text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
                      Booking Void
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-400">No Bookings Found</h3>
          </div>
        )}
      </div>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">{showSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRACKING MODAL */}
      <AnimatePresence>
        {trackingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 shadow-2xl relative overflow-hidden h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-slate-800">{t.track}</h2>
                <button 
                  onClick={() => setTrackingBooking(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Map View */}
              <div className="flex-1 bg-slate-100 rounded-3xl overflow-hidden relative border border-slate-100 mb-6 min-h-[300px]">
                <LeafletMap 
                  center={[userLocation.latitude, userLocation.longitude]}
                  zoom={15}
                  height="100%"
                  markers={[
                    {
                      id: 'elder',
                      position: [userLocation.latitude, userLocation.longitude],
                      type: 'elder',
                      name: 'You'
                    },
                    {
                      id: 'volunteer',
                      position: [userLocation.latitude + 0.005, userLocation.longitude + 0.005], // Mocking volunteer coming from 500m away
                      type: 'volunteer',
                      name: trackingBooking.volunteerName || 'Volunteer'
                    }
                  ]}
                />
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Coming From North-East</p>
                    <p className="font-black text-slate-800 text-lg">{trackingBooking.volunteerName}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-sm font-bold text-slate-600">On the way to your location</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Arriving in 5 mins</p>
                  </div>
                </div>

                <button
                  onClick={() => setTrackingBooking(null)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}