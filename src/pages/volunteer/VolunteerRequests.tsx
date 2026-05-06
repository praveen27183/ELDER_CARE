import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Navigation } from 'lucide-react';

import DutyProtection from './components/DutyProtection';

import {
    processAndRankRequests
} from './algorithms/PriorityScoring';

import type {
    VolunteerProfile,
    PriorityRequest
} from './algorithms/PriorityScoring';

import RequestService from '../../services/RequestService';

import type {
    ServiceRequest
} from '../../services/RequestService';

import {
    getEmergencyChecklist
} from './algorithms/EmergencyChecklist';

import type {
    ChecklistItem
} from './algorithms/EmergencyChecklist';

import {
    openSmartNavigation
} from './algorithms/SmartNavigation';

import type {
    NavigationLocation
} from './algorithms/SmartNavigation';

export default function VolunteerRequests() {
    const navigate = useNavigate();

    const [processedRequests, setProcessedRequests] = useState<PriorityRequest[]>([]);
    const [showChecklist, setShowChecklist] = useState(false);
    const [currentChecklist, setCurrentChecklist] = useState<ChecklistItem[]>([]);
    const [activeTask, setActiveTask] = useState<PriorityRequest | null>(null);

    // VOLUNTEER PROFILE
    const volunteerProfile: VolunteerProfile = useMemo(() => ({
        volunteer_id: 'volunteer_001',

        skills: [
            'first aid',
            'medicine delivery',
            'companion care',
            'emergency response',
            'grocery shopping',
            'household help',
            'medical escort',
            'mobility assistance',
            'tech support'
        ],

        trust_score: 0.85,

        availability_status: 1,

        location: {
            latitude: 13.0827,
            longitude: 80.2707
        }
    }), []);

    // LOAD REQUESTS
    useEffect(() => {
        RequestService.loadStoredRequests();

        const unsubscribe = RequestService.subscribe(
            (requests: ServiceRequest[]) => {

                const pendingRequests = requests.filter(
                    (req) => req.status === 'pending'
                );

                try {
                    const processed = processAndRankRequests(
                        pendingRequests.map((req) => ({
                            id: Number(req.id),

                            taskType: req.taskType || 'General Help',

                            title: req.taskType || 'Service Request',

                            location: req.location || 'Unknown Location',

                            coordinates: req.coordinates,

                            distance: 0,

                            earnings: req.urgent ? 'Volunteer' : '₹50',

                            urgent: req.urgent || false,

                            elderName: req.elderName || 'Unknown',

                            required_skills: ['general assistance'],

                            emergency_features: {
                                fall_detected:
                                    req.emergency_severity === 'HIGH',

                                heart_rate_change:
                                    req.urgent ? 30 : 5,

                                inactivity_duration:
                                    req.urgent ? 20 : 60,

                                panic_text_score:
                                    req.urgent ? 0.8 : 0.2,

                                response_delay:
                                    req.urgent ? 3 : 15
                            },

                            message: req.message || ''
                        })),
                        volunteerProfile,
                        5
                    );

                    setProcessedRequests(processed);

                } catch (error) {
                    console.error(
                        'Error processing requests:',
                        error
                    );
                }
            }
        );

        return unsubscribe;

    }, [volunteerProfile]);

    // ACCEPT TASK
    const handleAccept = async (
        task: PriorityRequest
    ) => {

        if (!task) return;

        try {

            const success = RequestService.acceptRequest(
                String(task.id),
                volunteerProfile.volunteer_id,
                `Volunteer ${volunteerProfile.volunteer_id}`
            );

            setActiveTask(task);

            // CHECKLIST
            const checklist = getEmergencyChecklist(
                task.taskType || 'General Help',
                task.emergency_severity || 'MEDIUM'
            );

            setCurrentChecklist(
                checklist?.items || []
            );

            setShowChecklist(true);

            if (!success) {
                console.warn(
                    'Request already accepted.'
                );
            }

        } catch (error) {

            console.error(
                'handleAccept Error:',
                error
            );

            setShowChecklist(true);
        }
    };

    // NAVIGATION
    const handleNavigate = (
        task: PriorityRequest
    ) => {

        if (!task) return;

        try {

            const navigationLocation: NavigationLocation = {

                latitude:
                    task.coordinates?.latitude ||
                    volunteerProfile.location.latitude,

                longitude:
                    task.coordinates?.longitude ||
                    volunteerProfile.location.longitude,

                address:
                    task.location ||
                    'Unknown Location'
            };

            openSmartNavigation(
                navigationLocation
            );

            navigate('/volunteer/map');

        } catch (error) {

            console.error(
                'Navigation Error:',
                error
            );
        }
    };

    // TOGGLE CHECKLIST
    const toggleChecklistItem = (
        itemId: string
    ) => {

        if (!itemId) return;

        setCurrentChecklist((prev) =>
            prev.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        completed: !item.completed
                    }
                    : item
            )
        );
    };

    // CLOSE CHECKLIST
    const closeChecklist = () => {

        try {

            if (activeTask?.coordinates) {

                const navigationData = {
                    to: {
                        address:
                            activeTask.location ||
                            'Unknown',

                        latitude:
                            activeTask.coordinates.latitude,

                        longitude:
                            activeTask.coordinates.longitude
                    },

                    from: {
                        address: 'Your Location',

                        latitude:
                            volunteerProfile.location.latitude,

                        longitude:
                            volunteerProfile.location.longitude
                    },

                    distance:
                        (activeTask.distance || 0) * 1000,

                    eta:
                        activeTask.estimated_arrival_time ||
                        activeTask.eta ||
                        0,

                    elderName:
                        activeTask.elderName ||
                        'Unknown',

                    taskType:
                        activeTask.taskType ||
                        'Service'
                };

                sessionStorage.setItem(
                    'navigationData',
                    JSON.stringify(navigationData)
                );

                navigate('/volunteer/map');
            }

        } catch (error) {

            console.error(
                'closeChecklist Error:',
                error
            );

        } finally {

            setShowChecklist(false);
            setCurrentChecklist([]);
            setActiveTask(null);
        }
    };

    return (
        <DutyProtection>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">

                <div className="max-w-6xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Service Requests
                            </h1>

                            <p className="text-slate-500 font-medium mt-1">
                                Manage and respond to elder requests
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">

                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Navigation className="w-5 h-5 text-blue-600" />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Current Location
                                </p>

                                <p className="text-sm font-bold text-slate-700 mt-1">
                                    Chennai, India
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* REQUESTS */}
                    <div className="space-y-6">

                        {processedRequests.length === 0 ? (

                            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 py-20 text-center shadow-xl">

                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <Clock className="w-10 h-10 text-slate-300" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-800">
                                    No requests available
                                </h3>

                            </div>

                        ) : (

                            processedRequests.map(
                                (request, index) => (

                                    <div
                                        key={request.id}
                                        className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100"
                                    >

                                        <div className="flex justify-between gap-4">

                                            <div>

                                                <div className="flex items-center gap-2 mb-3">

                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">
                                                        #{index + 1} Priority
                                                    </span>

                                                    {request.urgent && (
                                                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
                                                            Urgent
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-black text-slate-800">
                                                    {request.elderName}
                                                </h3>

                                                <p className="text-slate-600 font-semibold">
                                                    {request.taskType}
                                                </p>

                                                <div className="flex items-center gap-2 mt-2 text-slate-500">

                                                    <MapPin className="w-4 h-4" />

                                                    <span>
                                                        {request.location}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">

                                                <p className="text-sm text-slate-400">
                                                    ETA
                                                </p>

                                                <p className="font-black text-lg">
                                                    {request.eta}m
                                                </p>
                                            </div>
                                        </div>

                                        {/* BUTTONS */}
                                        <div className="flex flex-col sm:flex-row gap-3 mt-6">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAccept(request)
                                                }
                                                disabled={!request}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all"
                                            >
                                                Accept Task
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleNavigate(request)
                                                }
                                                disabled={!request}
                                                className="flex-1 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <Navigation className="w-5 h-5" />

                                                Live Navigation
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>

                {/* CHECKLIST MODAL */}
                {showChecklist && activeTask && (

                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

                        <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8">

                            <div className="flex justify-between items-center mb-6">

                                <h2 className="text-2xl font-black">
                                    Emergency Checklist
                                </h2>

                                <button
                                    onClick={closeChecklist}
                                    className="text-2xl font-black"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">

                                {currentChecklist.map((item) => (

                                    <div
                                        key={item.id}
                                        onClick={() =>
                                            toggleChecklistItem(item.id)
                                        }
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                            item.completed
                                                ? 'bg-green-50 border-green-300'
                                                : 'bg-white border-slate-200'
                                        }`}
                                    >

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`w-6 h-6 rounded-md border-2 ${
                                                    item.completed
                                                        ? 'bg-green-500 border-green-500'
                                                        : 'border-slate-300'
                                                }`}
                                            />

                                            <p className="font-bold">
                                                {item.item}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={closeChecklist}
                                disabled={!currentChecklist.every(item => item.completed)}
                                className={`w-full mt-8 py-4 rounded-2xl font-black text-lg transition-all ${
                                    currentChecklist.every(item => item.completed)
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {currentChecklist.every(item => item.completed) ? 'Complete Protocol' : 'Complete All Steps to Proceed'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DutyProtection>
    );
}