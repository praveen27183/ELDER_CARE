import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DutyProtection from './components/DutyProtection';
import LeafletMap, { type MapMarker } from '../../components/shared/LeafletMap';
import { getCurrentLocation, watchLocation } from './algorithms/PriorityScoring';
import RequestService from '../../services/RequestService';
import type { ServiceRequest } from '../../services/RequestService';
import { processAndRankRequests } from './algorithms/PriorityScoring';
import type { VolunteerProfile } from './algorithms/PriorityScoring';

export default function VolunteerMap() {
    const navigate = useNavigate();
    const [navigationLocation, setNavigationLocation] = useState<string>('');
    const [volunteerLocation, setVolunteerLocation] = useState({ latitude: 13.0827, longitude: 80.2707 });
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [priorityMarkers, setPriorityMarkers] = useState<any[]>([]);
    const [navigationData, setNavigationData] = useState<any>(null);
    const [rawRequests, setRawRequests] = useState<ServiceRequest[]>([]);

    // Memoized volunteer profile
    const volunteerProfile: VolunteerProfile = useMemo(() => ({
        volunteer_id: 'volunteer_001',
        skills: ['first aid', 'medicine delivery', 'companion care', 'emergency response', 'grocery shopping', 'household help', 'medical escort', 'mobility assistance', 'tech support'],
        trust_score: 0.85,
        availability_status: 1,
        location: volunteerLocation
    }), [volunteerLocation]);

    useEffect(() => {
        // Load navigation data from sessionStorage
        const storedNavigationData = sessionStorage.getItem('navigationData');
        if (storedNavigationData) {
            try {
                const navData = JSON.parse(storedNavigationData);
                setNavigationLocation(navData.to.address);
                setNavigationData(navData);
            } catch (error) {
                console.error('Error parsing navigation data:', error);
            }
            sessionStorage.removeItem('navigationData');
        }

        // Subscribe to live requests
        RequestService.loadStoredRequests();
        const unsubscribe = RequestService.subscribe((requests) => {
            // Only show pending or currently active requests on the map
            setRawRequests(requests.filter(req => req.status === 'pending' || req.status === 'accepted'));
        });

        return unsubscribe;
    }, []);

    // Process requests using priority algorithm
    useEffect(() => {
        if (rawRequests.length === 0) {
            setPriorityMarkers([]);
            return;
        }

        try {
            const processed = processAndRankRequests(
                rawRequests.map(req => ({
                    id: req.id,
                    taskType: req.taskType,
                    title: req.taskType,
                    location: req.location,
                    coordinates: req.coordinates,
                    distance: 0,
                    earnings: req.urgent ? 'Volunteer' : '₹50',
                    urgent: req.urgent,
                    elderName: req.elderName,
                    required_skills: ['general assistance'],
                    emergency_severity: req.emergency_severity || (req.urgent ? 'HIGH' : 'LOW')
                })),
                volunteerProfile,
                10 // 10km radius for map view
            );
            
            const markers = processed.map((request) => ({
                id: request.id,
                location: request.location,
                elderName: request.elderName,
                taskType: request.taskType,
                urgent: request.urgent,
                priorityScore: request.priorityScore,
                emergency_severity: request.emergency_severity,
                distance: request.distance,
                eta: request.eta,
                coordinates: request.coordinates
            }));
            setPriorityMarkers(markers);
        } catch (error) {
            console.error('Error processing map requests:', error);
        }
    }, [rawRequests, volunteerProfile]);

    // Real-time location tracking
    useEffect(() => {
        // Get initial location
        getCurrentLocation()
            .then((location) => {
                setVolunteerLocation(location);
                setLocationError(null);
                setIsTrackingLocation(true);
                
                // Start watching location for real-time updates
                const stopWatching = watchLocation((newLocation) => {
                    setVolunteerLocation(newLocation);
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

        // Cleanup on unmount
        return () => {
            // Cleanup will be handled by the stopWatching function
        };
    }, []);

    return (
        <DutyProtection>
            <div className="relative h-[calc(100vh-64px)] -m-6 overflow-hidden">
                {/* Map Component - Full Screen */}
                <LeafletMap 
                    center={navigationData 
                        ? [navigationData.to.latitude, navigationData.to.longitude] 
                        : [volunteerLocation.latitude, volunteerLocation.longitude]
                    }
                    zoom={navigationData ? 16 : 15}
                    route={navigationData ? [
                        [volunteerLocation.latitude, volunteerLocation.longitude],
                        [navigationData.to.latitude, navigationData.to.longitude]
                    ] : undefined}
                    markers={[
                        {
                            id: 'volunteer-me',
                            position: [volunteerLocation.latitude, volunteerLocation.longitude],
                            type: 'volunteer',
                            name: 'You'
                        },
                        ...priorityMarkers.map(m => ({
                            id: m.id,
                            position: [m.coordinates.latitude, m.coordinates.longitude] as [number, number],
                            type: 'elder' as const,
                            name: m.elderName
                        }))
                    ]}
                    onMarkerClick={(marker) => {
                        if (marker.type === 'elder') {
                            navigate('/volunteer/requests');
                        }
                    }}
                    height="100%"
                />

                {/* Floating Top Header Overlay */}
                <div className="absolute top-6 left-6 right-6 z-[1000] pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                {navigationData 
                                    ? <div className="flex flex-col">
                                        <span className="text-blue-600 text-[10px] uppercase tracking-[0.2em] font-black mb-0.5">Active Mission</span>
                                        <span>{navigationData.taskType} for {navigationData.elderName}</span>
                                      </div>
                                    : 'Service Area Map'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                    isTrackingLocation ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                }`} />
                                <span className="text-xs font-medium text-slate-600">
                                    {navigationData ? `Heading to ${navigationData.to.address}` : (isTrackingLocation ? 'Live GPS Tracking Active' : 'Location Unknown')}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/volunteer/requests')}
                                className="px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl text-blue-700 text-sm font-bold pointer-events-auto hover:bg-blue-600/20 transition-colors"
                            >
                                {priorityMarkers.length} Active Requests
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Navigation Status Overlay (Bottom) */}
                {navigationData && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-6 pointer-events-none">
                        <div className="bg-slate-900/90 backdrop-blur-lg border border-slate-700 shadow-2xl rounded-3xl p-6 pointer-events-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl shadow-lg shadow-amber-500/20">
                                        {navigationData.elderName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Heading to {navigationData.elderName}</p>
                                        <p className="text-white font-black text-lg leading-tight">{navigationData.taskType}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">{navigationData.eta}<span className="text-sm font-normal text-slate-400 ml-1">min</span></p>
                                    <p className="text-xs text-slate-400">Estimated Arrival</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">Distance</span>
                                    <span className="text-white font-bold ml-auto">
                                        {navigationData.distance >= 1000 
                                            ? `${(navigationData.distance / 1000).toFixed(1)}km` 
                                            : `${Math.round(navigationData.distance)}m`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pl-4 border-l border-slate-700/50">
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">Speed</span>
                                    <span className="text-white font-bold ml-auto">20km/h</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    if (navigationData?.taskId) {
                                        RequestService.updateRequestStatus(navigationData.taskId.toString(), 'pending');
                                    }
                                    setNavigationData(null);
                                    sessionStorage.removeItem('navigationData');
                                    navigate('/volunteer');
                                }}
                                className="w-full mt-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-sm font-bold rounded-xl transition-all border border-red-600/20"
                            >
                                Cancel Navigation
                            </button>
                        </div>
                    </div>
                )}

                {/* Floating Tracking Error / Status */}
                {locationError && (
                    <div className="absolute top-28 left-6 right-6 z-[1000] pointer-events-none">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl shadow-lg inline-block pointer-events-auto">
                            <p className="text-xs font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {locationError}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DutyProtection>
    );
}
