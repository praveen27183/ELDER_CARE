import { useLanguage } from "../../context/LanguageContext";
import ServiceGrid from "./components/ServiceGrid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bell, Sparkles, User, Clock, Package, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeafletMap from "../../components/shared/LeafletMap";
import RequestService from "../../services/RequestService";
import VoiceAssistant from "./components/VoiceAssistant";
import { getCurrentLocation, DEFAULT_LOCATION } from "../volunteer/algorithms/PriorityScoring";


// Local helper to format address from location
const formatLocationAddress = (location: { latitude: number; longitude: number }) => {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
};

// Service request creation functions
const createServiceRequest = async (taskType: string, urgent: boolean = false) => {
    try {
        const location = await getCurrentLocation();
        const address = formatLocationAddress(location);

        const request = RequestService.addRequest({
            elderName: 'Elder User',
            taskType,
            location: address,
            coordinates: location,
            urgent,
            message: `Request for ${taskType} from Elder App`
        });

        // Show notification
        const notification = {
            id: Date.now(),
            message: `${taskType} request sent successfully!`,
            type: 'success' as const
        };

        return request;
    } catch (error) {
        console.error('Failed to create request:', error);
        throw error;
    }
};

export default function ElderHome() {
    const { language, setLanguage, t } = useLanguage();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [showTerms, setShowTerms] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [volunteer, setVolunteer] = useState<any | null>(null);
    const [elderLocation, setElderLocation] = useState(DEFAULT_LOCATION);
    const [showMap, setShowMap] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [activeItems, setActiveItems] = useState<string[]>([]);
    const [activeService, setActiveService] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
    const [mockVolunteers, setMockVolunteers] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showArrivalToast, setShowArrivalToast] = useState(false);
    const navigate = useNavigate();

    // Initialize mock volunteers around user
    useEffect(() => {
        if (elderLocation) {
            setMockVolunteers([
                { id: 'mv1', position: [elderLocation.latitude + 0.004, elderLocation.longitude + 0.003], type: 'volunteer', name: 'Sarah Wilson' },
                { id: 'mv2', position: [elderLocation.latitude - 0.005, elderLocation.longitude - 0.004], type: 'volunteer', name: 'Mike Ross' },
                { id: 'mv3', position: [elderLocation.latitude + 0.002, elderLocation.longitude - 0.006], type: 'volunteer', name: 'Priya Sharma' }
            ]);
        }
    }, [elderLocation]);

    const notifications = [
        { id: 1, title: "Volunteer Nearby", message: "John is currently 5 mins away from your location.", time: "2 mins ago" },
        { id: 2, title: "Medicine Reminder", message: "Time for your afternoon blood pressure medicine.", time: "1 hour ago" },
        { id: 3, title: "Community Event", message: "Join the evening tea session at the community center.", time: "3 hours ago" }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Get elder's current location
    useEffect(() => {
        const getLocation = async () => {
            try {
                const location = await getCurrentLocation();
                setElderLocation(location);
            } catch (error) {
                console.error('Failed to get location:', error);
                // Keep default location if geolocation fails
            }
        };

        getLocation();
    }, []);



    // Trigger SOS handler
    const handleSOS = async () => {
        try {
            const request = await createServiceRequest('Emergency SOS - Fall Detected', true);

            alert("SOS ALERT SENT! Volunteers will be notified immediately.");
        } catch (error) {
            console.error('Failed to send SOS:', error);
            alert("Failed to send SOS. Please try again.");
        }
    };

    // Shake Detection Logic - DISABLED
    // useEffect(() => {
    //     let lastX = 0, lastY = 0, lastZ = 0;
    //     let lastTime = 0;
    //     const threshold = 15;
    //     let motionCheckInterval: NodeJS.Timeout | null = null;

    //     const handleMotion = (event: DeviceMotionEvent) => {
    //         const current = event.accelerationIncludingGreenishty;
    //         if (!current) return;

    //         const { x, y, z } = current;
    //         const currentTime = Date.now();

    //         if ((currentTime - lastTime) > 100) {
    //             const diffTime = currentTime - lastTime;
    //             lastTime = currentTime;

    //             const speed = Math.abs((x || 0) + (y || 0) + (z || 0) - lastX - lastY - lastZ) / diffTime * 10000;

    //             if (speed > threshold) {
    //                 handleSOS();
    //             }

    //             lastX = x || 0;
    //             lastY = y || 0;
    //             lastZ = z || 0;
    //         }
    //     };

    //     // Throttle motion events to improve performance
    //     const throttledHandleMotion = (event: Event) => {
    //         if (motionCheckInterval) return;
    //         motionCheckInterval = setTimeout(() => {
    //             handleMotion(event as DeviceMotionEvent);
    //             motionCheckInterval = null;
    //         }, 50);
    //     };

    //     if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
    //         // iOS permission handling
    //     }

    //     window.addEventListener('devicemotion', throttledHandleMotion);
    //     return () => {
    //         window.removeEventListener('devicemotion', throttledHandleMotion);
    //         if (motionCheckInterval) clearTimeout(motionCheckInterval);
    //     };
    // }, []);



    const handleCommand = (cmd: string) => {
        if (cmd === "medicines") setSelectedService("Medicines");
        if (cmd === "groceries") setSelectedService("Groceries");
        if (cmd === "transport") setSelectedService("Transport");
        if (cmd === "househelp") setSelectedService("House Help");
        if (cmd === "callsupport") setSelectedService("Call Support");
        if (cmd === "sos") handleSOS();
    };


    const handleItemSelection = (item: string) => {
        setSelectedItems(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    const proceedToTerms = () => {
        if (selectedItems.length > 0) {
            setShowItems(false);
            setShowTerms(true);
        } else {
            alert(t.selectAtLeastOne);
        }
    };

    const confirmBooking = async () => {
        if (!selectedService) return;

        try {
            // Create the service request
            await createServiceRequest(selectedService);

            // Start searching simulation
            setIsSearching(true);
            setActiveItems(selectedItems);
            setActiveService(selectedService);
            setShowMap(true); // Ensure map is shown in background

            // Reset booking states early
            setSelectedService(null);
            setShowTerms(false);
            setShowItems(false);
            setSelectedItems([]);

            // Simulate finding a volunteer after 3 seconds
            setTimeout(() => {
                setIsSearching(false);
                const randomVol = mockVolunteers[Math.floor(Math.random() * mockVolunteers.length)] || { name: 'John Doe' };
                setVolunteer({ name: randomVol.name, eta: 2 }); // Set to 2 for quick demo
                setShowTracking(true);
            }, 4000);

        } catch (error) {
            console.error('Failed to book service:', error);
            alert('Failed to book service. Please try again.');
        }
    };



    // Decrement ETA timer while tracking
    useEffect(() => {
        if (!showTracking || !volunteer) return;
        
        if (volunteer.eta === 0) {
            setShowArrivalToast(true);
            return;
        }

        const timer = setInterval(() => {
            setVolunteer(prev => {
                if (!prev) return prev;
                if (prev.eta <= 0) {
                    setShowArrivalToast(true);
                    return prev;
                }
                return { ...prev, eta: prev.eta - 1 };
            });
        }, 5000); // Speed up to 5 seconds for demo purposes

        return () => clearInterval(timer);
    }, [showTracking, volunteer?.eta]);

    return (

        <div className="min-h-screen bg-slate-100 flex flex-col pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
                        <h1 className="text-2xl font-bold text-slate-800">{t.welcome} {user?.firstName || 'Elder'}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-all relative"
                            >
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top sm:origin-top-right">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">{t.notifications}</h3>
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{notifications.length} {t.new}</span>
                                    </div>
                                    <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800">{n.title}</p>
                                                        <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                                                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 text-sm font-bold text-blue-600 hover:bg-slate-50 transition-colors">
                                        {t.viewAll}
                                    </button>
                                </div>
                            )}
                        </div>

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-slate-100 border-none rounded-lg p-2 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="en">English</option>
                            <option value="ta">தமிழ்</option>
                            <option value="hi">हिंदी</option>
                        </select>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
                <div className={`grid gap-8 ${showMap ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {/* Nearby Support Map Section - Only show when service is clicked */}
                    {showMap && (
                        <section className="lg:col-span-1 bg-white rounded-[2.5rem] p-4 md:p-6 shadow-xl border border-slate-200 h-fit sticky lg:top-28">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-100 rounded-xl">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <h2 className="text-xl font-bold text-slate-800">{t.nearbySupport}</h2>
                                        <p className="text-sm text-slate-500">{t.nearbyMessage}</p>
                                    </div>
                                    <div className="sm:hidden">
                                        <h2 className="text-lg font-bold text-slate-800">{t.nearbySupport}</h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] sm:text-xs font-medium text-green-600 uppercase tracking-wider">Live</span>
                                    <button
                                        onClick={() => setShowMap(false)}
                                        className="ml-2 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-slate-100 rounded-[2rem] overflow-hidden shadow-inner relative border border-slate-100">
                                <LeafletMap 
                                    center={[elderLocation.latitude, elderLocation.longitude]}
                                    zoom={14}
                                    height="100%"
                                    markers={[
                                        {
                                            id: 'elder',
                                            position: [elderLocation.latitude, elderLocation.longitude],
                                            type: 'elder',
                                            name: 'Your Location'
                                        },
                                        ...(volunteer ? [{
                                            id: 'volunteer',
                                            position: [elderLocation.latitude + 0.005, elderLocation.longitude + 0.005],
                                            type: 'volunteer' as const,
                                            name: volunteer.name
                                        }] : mockVolunteers.map(mv => ({
                                            id: mv.id,
                                            position: mv.position,
                                            type: 'volunteer' as const,
                                            name: mv.name
                                        })))
                                    ]}
                                />

                                {/* Floating arrival message overlay */}
                                <AnimatePresence>
                                    {volunteer && (
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 20, opacity: 0 }}
                                            className="absolute bottom-6 left-6 right-6 z-[1000]"
                                        >
                                            <div className="bg-emerald-600/90 backdrop-blur-md text-white p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(5,150,105,0.4)] flex items-center gap-4 border border-white/20">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center relative">
                                                    <div className="absolute inset-0 bg-white rounded-2xl animate-ping opacity-20" />
                                                    <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none mb-1">Fast Arrival</p>
                                                    <h4 className="text-sm sm:text-base font-black tracking-tight">
                                                        {volunteer.name} is <span className="text-emerald-300">arriving in {volunteer.eta} min</span>
                                                    </h4>
                                                </div>
                                                <div className="hidden sm:block px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Live Status</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Volunteer Status & Items Detail Section */}
                            <AnimatePresence>
                                {volunteer && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="mt-6 space-y-4"
                                    >
                                        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-md">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Volunteer Traveling</span>
                                                </div>
                                                <div className="px-3 py-1 bg-white rounded-full border border-emerald-100 shadow-sm">
                                                    <span className="text-xs font-black text-emerald-700">
                                                        {volunteer.eta > 0 ? `${volunteer.eta} MINS` : 'ARRIVED'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border-2 border-emerald-100 overflow-hidden">
                                                        {volunteer.image ? (
                                                            <img src={volunteer.image} alt={volunteer.name} className="w-full h-full object-crop" />
                                                        ) : (
                                                            <User className="w-8 h-8 text-emerald-600" />
                                                        )}
                                                    </div>
                                                    {volunteer.verified && (
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                            <Sparkles className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xl font-black text-slate-800 leading-tight">{volunteer.name}</h4>
                                                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                            <span className="text-[10px] font-black text-slate-700">{volunteer.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                                                        {volunteer.specialty || "Verified Volunteer"} • {volunteer.reviews} Reviews
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <span>Starting Point</span>
                                                    <span>Your Home</span>
                                                </div>
                                                <div className="h-2 bg-white rounded-full overflow-hidden border border-emerald-50 p-0.5">
                                                    <motion.div 
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: `${Math.max(0, 100 - (volunteer.eta / 12 * 100))}%` }}
                                                        className="h-full bg-emerald-500 rounded-full"
                                                    />
                                                </div>
                                            </div>

                                            {/* Status Action */}
                                            <div className="mt-6">
                                                <button
                                                    onClick={() => {
                                                        setShowTracking(false);
                                                        setVolunteer(null);
                                                        setActiveItems([]);
                                                        setActiveService(null);
                                                    }}
                                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                                                >
                                                    {t.statusCompleted || "Service Completed"}
                                                </button>
                                            </div>
                                        </div>

                                        {activeItems.length > 0 && (
                                            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Package className="w-4 h-4 text-emerald-600" />
                                                    <span className="text-sm font-bold text-slate-800 tracking-tight">Bringing Details</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeItems.map((item, idx) => (
                                                        <span key={idx} className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-emerald-700 border border-emerald-100 shadow-sm">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="mt-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-center">
                                                    Items for {activeService}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    )}

                    <div className={`${showMap ? 'lg:col-span-2' : 'max-w-5xl mx-auto w-full'}`}>
                        <ServiceGrid 
                            onServiceClick={(service) => {
                                setShowMap(true);
                                setSelectedService(service.name);
                            }}
                        />
                    </div>
                </div>
            </main>


            {/* Enhanced Booking Popup */}
            <AnimatePresence>
                {selectedService && !showItems && !showTerms && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[9999]">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100"
                        >
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-emerald-600" />
                            </div>

                            <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
                                {t.bookService}<br/>
                                <span className="text-emerald-600">{selectedService}</span>
                            </h2>
                            
                            <p className="text-slate-500 mb-8 font-medium px-4">
                                {t.nearbyVolunteer}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmBooking}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-bold transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
                                >
                                    {t.acceptBook}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setSelectedService(null);
                                        setSelectedItems([]);
                                    }}
                                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-lg font-bold transition-all active:scale-[0.98]"
                                >
                                    {t.cancel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Terms and Conditions Modal */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border-2 border-gray-100 max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            {t.terms} - {selectedService}
                        </h2>

                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                            <h3 className="font-bold text-lg mb-2 text-emerald-800">{t.selectedItems}</h3>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                {selectedItems.map(item => (
                                    <li key={item} className="text-emerald-700">{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-left mb-6 space-y-4 text-gray-600">
                            <div>
                                <h3 className="font-bold text-lg mb-2">{t.whatIncluded}</h3>
                                {selectedService === "Medicines" && (
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Medicine delivery from nearby pharmacy</li>
                                        <li>Prescription verification</li>
                                        <li>Emergency medication requests</li>
                                        <li>Payment assistance available</li>
                                    </ul>
                                )}
                                {selectedService === "Groceries" && (
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Fresh grocery delivery</li>
                                        <li>Vegetables and fruits</li>
                                        <li>Dairy and bread products</li>
                                        <li>Special dietary requests</li>
                                    </ul>
                                )}
                                {selectedService === "Transport" && (
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Safe transportation to medical appointments</li>
                                        <li>Wheelchair accessible vehicles</li>
                                        <li>Trained volunteer drivers</li>
                                        <li>GPS-tracked rides</li>
                                    </ul>
                                )}
                                {selectedService === "House Help" && (
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Light house cleaning</li>
                                        <li>Minor repairs and maintenance</li>
                                        <li>Companion services</li>
                                        <li>Lawn and garden care</li>
                                    </ul>
                                )}
                                {selectedService === "Call Support" && (
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>24/7 phone support</li>
                                        <li>Emergency coordination</li>
                                        <li>Family notification service</li>
                                        <li>Medical emergency assistance</li>
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-2">{t.importantInfo}</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>{t.volunteerBackground}</li>
                                    <li>{t.serviceHours}</li>
                                    <li>{t.emergencyPriority}</li>
                                    <li>{t.noCost}</li>
                                    <li>{t.photoVerification}</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-2">{t.yourResponsibilities}</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>{t.clearInstructions}</li>
                                    <li>{t.beAvailable}</li>
                                    <li>{t.paymentReady}</li>
                                    <li>{t.treatWithRespect}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowTerms(false);
                                    setShowItems(true);
                                }}
                                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl text-xl font-bold text-gray-700 transition-colors"
                            >
                                {t.back} to {t.selectItems}
                            </button>
                            <button
                                onClick={confirmBooking}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xl font-bold transition-colors shadow-lg"
                            >
                                {t.acceptBook}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal (shows MockMap) */}
            {showTracking && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border-2 border-gray-100 h-[70vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{t.volunteerTracking}</h2>
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-600">Volunteer: <span className="font-bold">{volunteer?.name}</span></div>
                                <div className="text-sm text-gray-600">{t.eta}: <span className="font-bold">{volunteer && volunteer.eta > 0 ? `${volunteer.eta} min` : t.arrived}</span></div>
                                <button
                                    onClick={() => setShowTracking(false)}
                                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                                >
                                    {t.cancel}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 rounded-lg overflow-hidden">
                            <LeafletMap
                                center={[elderLocation.latitude, elderLocation.longitude]}
                                zoom={15}
                                markers={[
                                    {
                                        id: 'elder',
                                        position: [elderLocation.latitude, elderLocation.longitude],
                                        type: 'elder',
                                        name: 'You'
                                    },
                                    {
                                        id: 'volunteer',
                                        position: [elderLocation.latitude + 0.005, elderLocation.longitude + 0.005],
                                        type: 'volunteer',
                                        name: volunteer?.name || 'Volunteer'
                                    }
                                ]}
                                height="100%"
                            />
                        </div>


                    </div>
                </div>
            )}

            {/* Volunteer Arrival Toast/Overlay */}
            <AnimatePresence>
                {showArrivalToast && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-32 left-6 right-6 z-[11000] flex justify-center"
                    >
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.2)] border-4 border-emerald-500 w-full max-w-sm relative overflow-hidden">
                            {/* Animated Background Confetti/Sparkles effect placeholder */}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-20 h-20 text-emerald-500 rotate-12" />
                            </div>

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">
                                        {volunteer?.name} {t.arrived || "has Arrived!"}
                                    </h3>
                                    <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mt-1">
                                        Help is at your door
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowArrivalToast(false)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                                <button 
                                    onClick={() => window.location.href = "tel:1234567890"} // Placeholder
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                                >
                                    Contact
                                </button>
                                <button 
                                    onClick={() => setShowArrivalToast(false)}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all"
                                >
                                    Confirm Arrival
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Finding Volunteer Overlay */}
            <AnimatePresence>
                {isSearching && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[10000]"
                    >
                        <div className="text-center p-8 max-w-sm">
                            <div className="relative mb-8">
                                {/* Pulsing rings */}
                                <motion.div 
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-emerald-500/20 rounded-full scale-[2.5]"
                                />
                                <motion.div 
                                    animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                    className="absolute inset-0 bg-emerald-500/10 rounded-full scale-[3.5]"
                                />
                                
                                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-emerald-50">
                                    <Search className="w-10 h-10 text-emerald-600 animate-bounce" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Finding Volunteer</h2>
                            <p className="text-emerald-100/70 font-medium mb-8">
                                Connecting you with the best nearby support for {activeService}...
                            </p>

                            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                <span className="text-sm font-bold text-white uppercase tracking-widest">Searching in your area</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <VoiceAssistant onCommand={handleCommand} language={language} />
        </div>
    );
}


