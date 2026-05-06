import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDuty } from './context/DutyContext';
import { MapPin, Navigation, Phone, CheckCircle, AlertTriangle, Star, Award, TrendingUp, List } from 'lucide-react';
import NotificationPopup from './components/NotificationPopup';
import RequestService from '../../services/RequestService';
import type { ServiceRequest } from '../../services/RequestService';
import { 
    processAndRankRequests, 
    getCurrentLocation,
    watchLocation
} from './algorithms/PriorityScoring';
import type { 
    VolunteerProfile, 
    PriorityRequest
} from './algorithms/PriorityScoring';
import { getEmergencyChecklist } from './algorithms/EmergencyChecklist';
import type { ChecklistItem } from './algorithms/EmergencyChecklist';
import { openEnhancedNavigation } from './algorithms/SmartNavigation';
import type { NavigationLocation } from './algorithms/SmartNavigation';
import LeafletMap from "../../components/shared/LeafletMap";
import { motion } from 'framer-motion';

export default function VolunteerDashboard() {
    const navigate = useNavigate();
    const { isOnDuty, setIsOnDuty } = useDuty();
    const [activeTab, setActiveTab] = useState<'feed' | 'active'>('feed');
    const [activeTask, setActiveTask] = useState<any>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<any>(null);
    const [processedRequests, setProcessedRequests] = useState<PriorityRequest[]>([]);
    const [showChecklist, setShowChecklist] = useState(false);
    const [currentChecklist, setCurrentChecklist] = useState<ChecklistItem[]>([]);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [volunteerLocation, setVolunteerLocation] = useState({ latitude: 13.0827, longitude: 80.2707 });
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [statsUpdateTrigger]);
    const getVolunteerProfile = (): VolunteerProfile => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                
                // Check if it's the test user
                if (user.email === 'volunteer@test.com') {
                    // Use mock data for test user
                    return {
                        volunteer_id: 'volunteer_001',
                        skills: ['first aid', 'medicine delivery', 'companion care', 'emergency response', 'grocery shopping', 'household help', 'medical escort', 'mobility assistance', 'tech support'],
                        trust_score: 0.85,
                        availability_status: 1,
                        location: volunteerLocation
                    };
                } else {
                    // Use real signup data
                    return {
                        volunteer_id: user.id || 'volunteer_custom',
                        skills: user.skills || [],
                        trust_score: 0.75, // Default trust score for new users
                        availability_status: 1,
                        location: volunteerLocation
                    };
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
        
        // Fallback to mock data
        return {
            volunteer_id: 'volunteer_001',
            skills: ['first aid', 'medicine delivery', 'companion care', 'emergency response', 'grocery shopping', 'household help', 'medical escort', 'mobility assistance', 'tech support'],
            trust_score: 0.85,
            availability_status: 1,
            location: volunteerLocation
        };
    };

    const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>(getVolunteerProfile());

    // Load stored requests and listen for new ones
    useEffect(() => {
        // Load existing requests from storage
        RequestService.loadStoredRequests();
        
        // Subscribe to new requests
        const unsubscribe = RequestService.subscribe((requests: ServiceRequest[]) => {
            const pendingRequests = requests.filter(req => req.status === 'pending');
            
            // Process and rank new requests based on proximity and urgency
            try {
                const processed = processAndRankRequests(
                    pendingRequests.map(req => ({
                        id: req.id,
                        elderId: req.elderId,
                        taskType: req.taskType,
                        title: req.taskType,
                        location: req.location,
                        coordinates: req.coordinates,
                        distance: 0, // Will be calculated by algorithm based on proximity
                        earnings: (req as any).urgent ? 'Volunteer' : '₹50',
                        urgent: (req as any).urgent,
                        elderName: req.elderName,
                        required_skills: ['general assistance'], // All requests available (no skill filtering)
                        emergency_features: {
                            fall_detected: (req as any).emergency_severity === 'HIGH',
                            heart_rate_change: (req as any).urgent ? 30 : 5,
                            inactivity_duration: (req as any).urgent ? 20 : 60,
                            panic_text_score: (req as any).urgent ? 0.8 : 0.2,
                            response_delay: (req as any).urgent ? 3 : 15
                        },
                        message: req.message
                    })),
                    volunteerProfile,
                    5 // 5km radius for proximity-based requests
                );
                setProcessedRequests(processed);
                setLoading(false);
                setError(null);
            } catch (error) {
                console.error('Error processing requests:', error);
                setError('Failed to load requests');
                setLoading(false);
            }
        });
        
        return unsubscribe;
    }, [volunteerProfile]);

    // Dynamic stats loading
    const stats = useMemo(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const userStats = user.stats || {};
                return [
                    { label: 'Tasks Completed', value: userStats.tasksCompleted?.toString() || '0', icon: CheckCircle, color: 'text-green-600' },
                    { label: 'People Helped', value: userStats.peopleHelped?.toString() || '0', icon: Star, color: 'text-blue-600' },
                    { label: 'Total Earnings', value: `₹${userStats.totalEarnings?.toString() || '0'}`, icon: Award, color: 'text-emerald-600' },
                    { label: 'Success Rate', value: userStats.tasksCompleted > 0 ? '100%' : 'N/A', icon: TrendingUp, color: 'text-purple-600' }
                ];
            }
        } catch (error) {
            console.error('Error loading volunteer stats:', error);
        }
        return [
            { label: 'Tasks Completed', value: '0', icon: CheckCircle, color: 'text-green-600' },
            { label: 'People Helped', value: '0', icon: Star, color: 'text-blue-600' },
            { label: 'Total Earnings', value: '₹0', icon: Award, color: 'text-emerald-600' },
            { label: 'Success Rate', value: 'N/A', icon: TrendingUp, color: 'text-purple-600' }
        ];
    }, [statsUpdateTrigger]);

    // Real-time location tracking
    useEffect(() => {
        // Get initial location
        getCurrentLocation()
            .then((location) => {
                setVolunteerLocation(location);
                setVolunteerProfile(prev => ({ ...prev, location }));
                setLocationError(null);
                setIsTrackingLocation(true);
                
                // Start watching location for real-time updates
                const stopWatching = watchLocation((newLocation) => {
                    setVolunteerLocation(newLocation);
                    setVolunteerProfile(prev => ({ ...prev, location: newLocation }));
                });

                return () => {
                    stopWatching();
                    setIsTrackingLocation(false);
                };
            })
            .catch((error) => {
                console.error('Error getting location:', error);
                setLocationError('Unable to get your location. Using default location.');
                setIsTrackingLocation(false);
            });
    }, []);

    const handleAccept = (task: PriorityRequest) => {
        try {
            // Accept the request in RequestService
            const success = RequestService.acceptRequest(
                task.id.toString(), 
                volunteerProfile.volunteer_id,
                user?.firstName || `Volunteer ${volunteerProfile.volunteer_id}`
            );
            
            // Proceed even if already accepted (e.g. from notification)
            setActiveTask(task);
            setActiveTab('active');
            setStatsUpdateTrigger(prev => prev + 1);
            
            // Generate emergency checklist
            const checklist = getEmergencyChecklist(task.taskType, (task as any).emergency_severity || 'MEDIUM');
            setCurrentChecklist(checklist.items || []);
            
            // Automatically turn ON duty if it's off
            if (!isOnDuty) {
                setIsOnDuty(true);
            }

            // Prepare navigation data for the map
            const navigationData = {
                taskId: task.id,
                elderName: task.elderName,
                taskType: task.taskType,
                to: {
                    latitude: (task as any).coordinates?.latitude || 13.0827,
                    longitude: (task as any).coordinates?.longitude || 80.2707,
                    address: task.location
                },
                distance: task.distance || 0,
                eta: 10 // Mock ETA
            };
            sessionStorage.setItem('navigationData', JSON.stringify(navigationData));

            // Redirect to map for tracking
            setTimeout(() => {
                navigate('/volunteer/map');
            }, 500);

            if (!success) {
                console.warn('Task was already accepted, proceeding to navigation.');
            }
        } catch (error) {
            console.error('Error accepting task:', error);
            // Fallback behavior
            setActiveTask(task);
            setActiveTab('active');
        }
    };

    const handleNavigate = (task: PriorityRequest) => {
        try {
            if ((task as any).coordinates) {
                const destination: NavigationLocation = {
                    latitude: (task as any).coordinates.latitude,
                    longitude: (task as any).coordinates.longitude,
                    address: task.location
                };
                
                // Use enhanced navigation with current location as starting point
                openEnhancedNavigation(volunteerLocation, destination, {
                    mode: 'driving',
                    avoid_tolls: false
                });
            }
            navigate('/volunteer/map');
        } catch (error) {
            console.error('Error navigating:', error);
        }
    };

    const handleCompleteTask = () => {
        // Update volunteer stats in localStorage
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const currentStats = user.stats || {
                    tasksCompleted: 0,
                    peopleHelped: 0,
                    totalEarnings: 0,
                    completedTasks: []
                };
                
                // Update stats
                currentStats.tasksCompleted += 1;
                currentStats.peopleHelped += 1;
                
                // Add earnings based on task type
                const taskEarnings = activeTask?.taskType?.includes('Emergency') ? 100 : 
                                   activeTask?.taskType?.includes('Medicine') ? 50 :
                                   activeTask?.taskType?.includes('Grocery') ? 40 : 30;
                currentStats.totalEarnings += taskEarnings;
                
                // Add to completed tasks history
                currentStats.completedTasks.push({
                    id: Date.now(),
                    taskType: activeTask?.taskType,
                    location: activeTask?.location,
                    earnings: taskEarnings,
                    completedAt: new Date().toISOString()
                });
                
                user.stats = currentStats;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Trigger re-render to update stats display
                setStatsUpdateTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error updating volunteer stats:', error);
        }
        
        setActiveTask(null);
        setActiveTab('feed');
        setShowChecklist(false);
        setCurrentChecklist([]);
    };

    const toggleChecklistItem = (itemId: string) => {
        setCurrentChecklist(prev => 
            prev.map(item => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
            )
        );
    };

    // Notification system with 10-second intervals
    useEffect(() => {
        const showRandomNotification = () => {
            try {
                if (processedRequests.length > 0) {
                    const randomTask = processedRequests[Math.floor(Math.random() * processedRequests.length)];
                    setCurrentNotification({
                        elderName: randomTask.elderName || 'Unknown',
                        taskType: randomTask.taskType || 'Service Request',
                        taskId: randomTask.id,
                        location: randomTask.location || 'Unknown Location',
                        urgent: (randomTask as any).emergency_severity === 'HIGH',
                        message: randomTask.message || 'No additional message provided',
                        emergency_severity: (randomTask as any).emergency_severity || 'LOW'
                    });
                    setShowNotification(true);
                }
            } catch (error) {
                console.error('Error showing notification:', error);
            }
        };

        // Show first notification after 2 seconds
        const initialTimer = setTimeout(showRandomNotification, 2000);
        
        // Then show notifications every 10 seconds
        const interval = setInterval(showRandomNotification, 10000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [processedRequests]);

    const closeNotification = () => {
        setShowNotification(false);
        setCurrentNotification(null);
    };

return (
    <>
        {loading ? (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-slate-600">Loading volunteer dashboard...</p>
                </div>
            </div>
        ) : error ? (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Dashboard Error</h2>
                        <p className="text-slate-600">{error}</p>
                        <div className="flex flex-col space-y-2">
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Reload Page
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/';
                                }}
                                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <>
                <div className="space-y-6 max-w-full overflow-hidden">
                {/* Location Warning Alert */}
                {locationError && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800">Simulation Mode Active</p>
                                <p className="text-xs font-medium text-slate-500">Location permission denied. Using default coordinates (Chennai Central).</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setLocationError(null)}
                            className="text-[10px] font-black text-amber-700 uppercase tracking-widest hover:underline"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}

                {/* Volunteer Profile Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-5">
                                <div>
                                    <div className="w-full h-full rounded-xl bg-white/10 flex items-center justify-center text-white text-2xl font-black">
                                        {(() => {
                                            try {
                                                const userData = localStorage.getItem('user');
                                                if (userData) {
                                                    const user = JSON.parse(userData);
                                                    return (user.firstName?.[0] || user.email?.[0] || 'V').toUpperCase();
                                                }
                                            } catch (e) { return 'V'; }
                                            return 'V';
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {(() => {
                                                try {
                                                    const userData = localStorage.getItem('user');
                                                    if (userData) {
                                                        const user = JSON.parse(userData);
                                                        return user.email === 'volunteer@test.com' ? 'Reenish' : (user.firstName || 'Volunteer');
                                                    }
                                                } catch (e) { return 'Volunteer'; }
                                                return 'Volunteer';
                                            })()}
                                        </h2>
                                        <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                                            <Award className="w-3 h-3" />
                                            {volunteerProfile.trust_score >= 0.8 ? 'Gold' : 'Silver'} Trust
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${isTrackingLocation ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                                {isTrackingLocation ? 'Live Tracking' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                            📍 {volunteerLocation.latitude.toFixed(4)}, {volunteerLocation.longitude.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider for mobile */}
                            <div className="h-px w-full bg-slate-100 md:hidden" />

                            {/* Skills & Performance */}
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Expertise</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(showAllSkills ? volunteerProfile.skills : volunteerProfile.skills.slice(0, 3)).map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] rounded-lg font-black uppercase tracking-tight border border-blue-100">
                                                {skill}
                                            </span>
                                        ))}
                                        {volunteerProfile.skills.length > 3 && (
                                            <button 
                                                onClick={() => setShowAllSkills(!showAllSkills)}
                                                className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-lg font-black uppercase tracking-tight hover:bg-slate-200 transition-all"
                                            >
                                                {showAllSkills ? 'Less' : `+${volunteerProfile.skills.length - 3}`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reliability Score</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {Math.round(volunteerProfile.trust_score * 100)}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            </div>
                            {React.createElement(stat.icon, { className: `w-8 h-8 ${stat.color}` })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Management */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800">Task Management</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === 'feed' 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Available Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === 'active' 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Active Task
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'feed' ? (
                        <div className="space-y-4">
                            {/* Critical Request Queue */}
                            {processedRequests.filter(r => r.emergency_severity === 'HIGH').length > 0 && (
                                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-black text-red-600 text-sm uppercase tracking-widest flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 animate-pulse" />
                                            Critical Request Queue
                                        </h3>
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full animate-pulse">
                                            Action Required
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {processedRequests
                                            .filter(r => r.emergency_severity === 'HIGH')
                                            .map((task) => (
                                                <div key={task.id} className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl shadow-lg shadow-red-100/50 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
                                                        <AlertTriangle className="w-20 h-20" />
                                                    </div>
                                                    <div className="flex justify-between items-start relative z-10">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Urgent</span>
                                                                <span className="text-[10px] font-bold text-red-500 bg-white px-2 py-0.5 rounded-md border border-red-100 uppercase tracking-tighter">
                                                                    Pending: {Math.floor((Date.now() - (task as any).timestamp) / 60000) || 1}m
                                                                </span>
                                                            </div>
                                                            <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{task.taskType}</h4>
                                                            <p className="text-sm font-bold text-red-700/80 mb-3 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" /> {task.location}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                                                                <span>Elder: {task.elderName}</span>
                                                                <span>ID: {(task as any).elderId?.slice(-6) || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAccept(task)}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-red-200 transition-all active:scale-95 whitespace-nowrap"
                                                        >
                                                            RESPOND NOW
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-700">Service Radius Map</h3>
                                <span className="text-xs text-slate-500">Showing requests within 5km</span>
                            </div>
                            
                            <div className="w-full max-w-full overflow-hidden rounded-xl">
                                <LeafletMap 
                                    center={[volunteerLocation.latitude, volunteerLocation.longitude] as [number, number]}
                                    zoom={13}
                                    height="300px"
                                    markers={[
                                        {
                                            id: 'volunteer-me',
                                            position: [volunteerLocation.latitude, volunteerLocation.longitude] as [number, number],
                                            type: 'volunteer',
                                            name: 'You'
                                        },
                                        ...processedRequests
                                            .filter((r: any) => r.coordinates)
                                            .map((r: any) => ({
                                                id: `req-${r.id}`,
                                                position: [r.coordinates.latitude, r.coordinates.longitude] as [number, number],
                                                type: 'elder' as const,
                                                name: r.elderName
                                            }))
                                    ]}
                                />
                            </div>

                            <h3 className="font-semibold text-slate-700 mt-6 text-sm flex items-center gap-2">
                                <List className="w-4 h-4" />
                                Available Requests (Priority Ranked)
                            </h3>
                            {processedRequests && processedRequests.length > 0 ? (
                                processedRequests.map((task) => (
                                <div key={task.id} className={`bg-slate-50 p-4 rounded-lg border-l-4 ${
                                    task.emergency_severity === 'HIGH' ? 'border-red-500' : 
                                    (task as any).emergency_severity === 'MEDIUM' ? 'border-amber-500' : 'border-blue-500'
                                }`}>
                                    {/* Priority Score and Trust Level */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                                Score: {task.priority_score}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                task.emergency_severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                (task as any).emergency_severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {task.emergency_severity}
                                            </span>
                                            {(task as any).distress_level === 'Panic' && (
                                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                                    PANIC
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-emerald-600">{task.earnings}</span>
                                    </div>

                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            {(task as any).emergency_severity === 'HIGH' && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
                                            {task.taskType}
                                        </h4>
                                    </div>

                                    <div className="text-sm text-slate-500 space-y-1 mb-4">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {task.location}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Navigation className="w-4 h-4" />
                                            {task.distance.toFixed(1)} km away • ETA: {task.estimated_arrival_time} min
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Skill Match: {Math.round(task.skill_match_score * 100)}%
                                        </p>
                                        {task.message && (
                                            <p className="bg-slate-100 p-2 rounded text-slate-700 italic">
                                                "{task.message}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-medium text-sm">Ignore</button>
                                        <button
                                            onClick={() => handleAccept(task)}
                                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                (task as any).emergency_severity === 'HIGH' 
                                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            }`}
                                        >
                                            {(task as any).emergency_severity === 'HIGH' ? 'EMERGENCY ACCEPT' : 'Accept Request'}
                                        </button>
                                    </div>
                                </div>
                        ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-500">No requests available at the moment.</p>
                                    <p className="text-sm text-slate-400 mt-2">Check back soon for new service requests.</p>
                                </div>
                            )}
                        </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="bg-slate-50 p-4 rounded-lg mb-4">
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{activeTask?.taskType}</h3>
                            <p className="text-slate-500 text-sm mb-4">{activeTask?.location}</p>

                            <div className="flex gap-4 mb-4">
                                <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg flex items-center justify-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Call Elder
                                </button>
                                <button 
                                    onClick={() => handleNavigate(activeTask!)}
                                    className="flex-1 bg-amber-50 text-amber-600 py-2 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Navigate
                                </button>
                            </div>

                            {/* Emergency Checklist */}
                            {showChecklist && currentChecklist.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-600" />
                                        Emergency Checklist
                                    </h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {currentChecklist.map((item) => (
                                            <div 
                                                key={item.id}
                                                className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                                                    item.completed 
                                                        ? 'bg-green-50 border-green-200' 
                                                        : 'bg-slate-50 border-slate-200'
                                                }`}
                                                onClick={() => toggleChecklistItem(item.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={item.completed}
                                                    onChange={() => toggleChecklistItem(item.id)}
                                                    className="w-4 h-4"
                                                />
                                                <span className={`flex-1 text-sm ${
                                                    item.completed ? 'text-slate-500 line-through' : 'text-slate-700'
                                                }`}>
                                                    {item.item}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                    item.priority === 'important' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {item.priority}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-white rounded-lg border border-slate-200 p-6">
                            <h4 className="font-semibold text-slate-800 mb-4">Task Progress</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Status</span>
                                    <span className="font-medium text-emerald-600">In Progress</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Started</span>
                                    <span className="font-medium text-slate-800">Just now</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Estimated Time</span>
                                    <span className="font-medium text-slate-800">{activeTask?.estimated_arrival_time} min</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => activeTask && handleNavigate(activeTask)}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-5 h-5" />
                                    Live Map Navigation
                                </button>
                            <button
                                onClick={handleCompleteTask}
                                disabled={!currentChecklist.every(item => item.completed)}
                                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${
                                    currentChecklist.every(item => item.completed)
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {currentChecklist.every(item => item.completed) ? 'Mark as Completed' : 'Finish Checklist First'}
                            </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    
    {/* Notification Popup */}
    <NotificationPopup
        isVisible={showNotification}
        onClose={closeNotification}
        onAccept={(id) => {
            const task = processedRequests.find(r => r.id.toString() === id);
            if (task) {
                handleAccept(task);
            }
        }}
        elderName={currentNotification?.elderName || 'Unknown'}
        taskType={currentNotification?.taskType || 'Service Request'}
        taskId={currentNotification?.taskId}
        location={currentNotification?.location}
        urgent={currentNotification?.urgent}
        message={currentNotification?.message}
        emergency_severity={currentNotification?.emergency_severity}
    />
        </>
        )}
    </>
);
}
