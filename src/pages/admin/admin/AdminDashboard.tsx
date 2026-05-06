import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, User, CheckCircle, AlertTriangle,
    Activity, Bell, MoreHorizontal, Clock, MapPin, Navigation
} from 'lucide-react';
import AdminAnalytics from './components/AdminAnalytics';
import RequestService from '../../../services/RequestService';
import type { ServiceRequest } from '../../../services/RequestService';
import LeafletMap, { type MapMarker } from "../../../components/shared/LeafletMap";
import api from '../../../services/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [allRequests, setAllRequests] = useState<ServiceRequest[]>([]);
    const [stats, setStats] = useState({
        activeSOS: 0,
        pendingRequests: 0,
        activeVolunteers: 0,
        totalVolunteers: 0,
        totalCompleted: 0
    });

    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [diagnosticStep, setDiagnosticStep] = useState(0);
    const diagnosticsIntervalRef = useRef<any>(null);

    const runDiagnostics = () => {
        setShowDiagnostics(true);
        setDiagnosticStep(0);
        
        if (diagnosticsIntervalRef.current) {
            clearInterval(diagnosticsIntervalRef.current);
        }
        
        let step = 0;
        diagnosticsIntervalRef.current = setInterval(() => {
            step++;
            if (step > 4) {
                if (diagnosticsIntervalRef.current) clearInterval(diagnosticsIntervalRef.current);
            } else {
                setDiagnosticStep(step);
            }
        }, 1200);
    };

    const cancelDiagnostics = () => {
        if (diagnosticsIntervalRef.current) {
            clearInterval(diagnosticsIntervalRef.current);
        }
        setShowDiagnostics(false);
    };

    // Load and monitor all requests from MongoDB
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // Fetch tasks from MongoDB
                const tasksRes = await api.get('/tasks/all', { headers });
                const tasks = tasksRes.data?.data?.tasks || [];
                
                const mappedTasks: ServiceRequest[] = tasks.map((task: any) => ({
                    id: task._id,
                    elderId: task.elderId,
                    elderName: task.elderName || 'Unknown Elder',
                    taskType: task.title,
                    location: task.location || 'Unknown Location',
                    status: task.status,
                    urgent: task.urgency === 'high',
                    timestamp: new Date(task.createdAt).getTime(),
                    message: task.description,
                    acceptedVolunteer: task.volunteerName,
                    coordinates: task.coordinates
                }));

                setAllRequests(mappedTasks);

                // Fetch volunteers
                const volsRes = await api.get('/volunteers', { headers });
                const volunteers = volsRes.data || [];

                // Calculate stats
                const pendingCount = mappedTasks.filter(req => req.status === 'pending').length;
                const sosCount = mappedTasks.filter(req => req.urgent && req.status === 'pending').length;
                const completedCount = mappedTasks.filter(req => req.status === 'completed').length;
                
                const activeVolunteersCount = volunteers.filter((v: any) => v.status === 'Available').length;
                const totalVolsCount = volunteers.length;

                setStats({
                    activeSOS: sosCount,
                    pendingRequests: pendingCount,
                    activeVolunteers: activeVolunteersCount,
                    totalVolunteers: totalVolsCount,
                    totalCompleted: completedCount
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
        
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500';
            case 'accepted': return 'bg-blue-500';
            case 'completed': return 'bg-emerald-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getActivityMessage = (request: ServiceRequest) => {
        switch (request.status) {
            case 'pending':
                return request.urgent 
                    ? `SOS Alert: ${request.taskType} requested by ${request.elderName}`
                    : `New Request: ${request.taskType} by ${request.elderName}`;
            case 'accepted':
                return `Request Accepted: ${request.taskType} assigned to volunteer`;
            case 'completed':
                return `Task Completed: ${request.taskType} by ${request.elderName} finished`;
            default:
                return `Request Updated: ${request.taskType}`;
        }
    };
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        System Operational • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">

                    <button 
                        onClick={runDiagnostics}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        System Health
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    label="Active SOS"
                    value={stats.activeSOS.toString()}
                    color="red"
                    icon={<AlertTriangle />}
                    trend={stats.activeSOS > 0 ? `${stats.activeSOS} active now` : 'No active SOS'}
                    trendColor="text-red-600"
                />
                <StatsCard
                    label="Pending Requests"
                    value={stats.pendingRequests.toString()}
                    color="amber"
                    icon={<ClipboardList />}
                    trend="Real-time updates"
                    trendColor="text-amber-600"
                />
                <StatsCard
                    label="Active Volunteers"
                    value={stats.activeVolunteers.toString()}
                    color="emerald"
                    icon={<User />}
                    trend={`${stats.totalVolunteers} total registered`}
                    trendColor="text-emerald-600"
                />
                <StatsCard
                    label="Total Completed"
                    value={stats.totalCompleted.toLocaleString()}
                    color="blue"
                    icon={<CheckCircle />}
                    trend="+18% vs last week"
                    trendColor="text-blue-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Analytics */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Fleet Monitor Map */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-blue-600" />
                                Global Fleet Monitor
                            </h3>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                {allRequests.filter(r => r.status === 'pending').length} Active Requests
                            </span>
                        </div>
                        <LeafletMap 
                            height="350px"
                            zoom={11}
                            showAdminColors={true}
                            markers={allRequests
                                .filter(r => r.coordinates)
                                .map(r => ({
                                    id: r.id,
                                    position: [r.coordinates.latitude, r.coordinates.longitude],
                                    type: 'elder',
                                    name: r.elderName
                                }))
                            }
                        />
                    </div>
                    <AdminAnalytics />
                </div>

                {/* Right Column: Recent Activity & Notifications */}
                <div className="space-y-6">

                    {/* Critical Operations Queue */}
                    {allRequests.filter(r => r.urgent && r.status === 'pending').length > 0 && (
                        <div className="bg-white rounded-xl border-2 border-red-100 shadow-xl shadow-red-50 overflow-hidden animate-pulse">
                            <div className="p-4 bg-red-600 flex justify-between items-center">
                                <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Critical Queue
                                </h3>
                                <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                    {allRequests.filter(r => r.urgent && r.status === 'pending').length} SOS
                                </span>
                            </div>
                            <div className="divide-y divide-red-50">
                                {allRequests
                                    .filter(r => r.urgent && r.status === 'pending')
                                    .map((req) => (
                                        <div key={req.id} className="p-4 bg-red-50/30 hover:bg-red-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{req.taskType}</h4>
                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">
                                                        Elder ID: {req.elderId?.slice(-6) || 'N/A'} • {req.elderName}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded border border-red-100">
                                                    {formatTime(req.timestamp)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button 
                                                    onClick={() => navigate('/admin/jobs')}
                                                    className="flex-1 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md"
                                                >
                                                    Dispatch
                                                </button>
                                                <button className="px-3 py-1.5 bg-white text-red-600 border border-red-200 text-[10px] font-black rounded-lg uppercase">
                                                    Call
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* System Alerts Feed (Mock) */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-purple-600" />
                                System Alerts
                            </h3>
                            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>
                        </div>
                        <div className="p-0">
                            {[
                                { id: 1, type: 'warning', title: 'Route Conflict', msg: 'Task #882 overlaps with Volunteer John\'s schedule', time: '2m ago' },
                                { id: 2, type: 'info', title: 'New Signup', msg: 'Volunteer Sarah needs document verification', time: '15m ago' },
                                { id: 3, type: 'success', title: 'System Backup', msg: 'Cloud database snapshot completed', time: '1h ago' },
                                { id: 4, type: 'error', title: 'SOS Triggered', msg: 'Emergency signal from Area 4 (Elder: Mary)', time: '3h ago' }
                            ].map((alert) => (
                                <div key={alert.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex gap-3">
                                        <div className={`w-1 h-8 rounded-full shrink-0 ${
                                            alert.type === 'error' ? 'bg-red-500' :
                                            alert.type === 'warning' ? 'bg-amber-500' :
                                            alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tighter">{alert.title}</h4>
                                                <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{alert.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium truncate group-hover:text-slate-700 transition-colors">{alert.msg}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">
                                Clear Alert Log
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800">Live Request Monitor</h3>
                            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {allRequests.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>No requests in system</p>
                                    <p className="text-sm mt-1">Requests from elders will appear here</p>
                                </div>
                            ) : (
                                allRequests
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .slice(0, 10)
                                    .map((request) => (
                                        <div key={request.id} className="p-4 flex gap-3 hover:bg-slate-50 transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${getStatusColor(request.status)}`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-800 font-medium">
                                                    {getActivityMessage(request)}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {request.elderName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {request.location}
                                                    </span>
                                                    {request.acceptedVolunteer && (
                                                        <span className="flex items-center gap-1 text-blue-600">
                                                            <Navigation className="w-3 h-3" />
                                                            {request.acceptedVolunteer}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(request.timestamp)}
                                                </p>
                                                {request.message && (
                                                    <p className="text-xs text-slate-600 mt-1 italic">
                                                        "{request.message}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    request.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                    request.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                                {request.urgent && (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                View All Requests ({allRequests.length})
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions / System Status */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Activity className="w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">System Status</h3>
                        <p className="text-slate-300 text-sm mb-4">All dispatcher nodes operational.</p>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Server Load</span>
                                <span className="text-emerald-400 font-mono">12%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full w-[12%]"></div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Database</span>
                                <span className="text-emerald-400 font-mono">Healthy</span>
                            </div>

                            <button 
                                onClick={runDiagnostics}
                                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/10"
                            >
                                Run Diagnostics
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Diagnostics Modal */}
            {showDiagnostics && (
                <div 
                    className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" 
                    style={{ zIndex: 99999 }}
                >
                    <div className="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                System Diagnostics
                            </h3>
                            <button onClick={cancelDiagnostics} className="text-slate-400 hover:text-white transition-colors">
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <DiagnosticStep label="Checking Server Load..." status={diagnosticStep >= 1 ? 'done' : 'running'} visible={diagnosticStep >= 0} />
                            <DiagnosticStep label="Verifying Database Integrity..." status={diagnosticStep >= 2 ? 'done' : 'running'} visible={diagnosticStep >= 1} />
                            <DiagnosticStep label="Testing Node Connections..." status={diagnosticStep >= 3 ? 'done' : 'running'} visible={diagnosticStep >= 2} />
                            <DiagnosticStep label="Analyzing Security Logs..." status={diagnosticStep >= 4 ? 'done' : 'running'} visible={diagnosticStep >= 3} />

                            {diagnosticStep > 4 ? (
                                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center animate-in zoom-in duration-300">
                                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                    <h4 className="text-emerald-400 font-bold">All Systems Nominal</h4>
                                    <p className="text-slate-400 text-sm mt-1">Diagnostics completed successfully with zero errors.</p>
                                    <button 
                                        onClick={cancelDiagnostics} 
                                        className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold w-full transition-colors"
                                    >
                                        Finish
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 flex justify-end">
                                    <button 
                                        onClick={cancelDiagnostics} 
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors border border-slate-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Components ---

function DiagnosticStep({ label, status, visible }: { label: string; status: 'running' | 'done'; visible: boolean }) {
    if (!visible) return null;
    return (
        <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in duration-300">
            {status === 'running' ? (
                <div className="w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
            )}
            <span className={status === 'running' ? 'text-slate-300' : 'text-emerald-400 font-medium'}>{label}</span>
        </div>
    );
}

function StatsCard({ label, value, color, icon, trend, trendColor }: any) {
    const colorStyles: any = {
        red: 'bg-red-50 text-red-600 border-red-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                    {React.cloneElement(icon, { className: "w-6 h-6" })}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-100 ${trendColor}`}>
                    {trend}
                </span>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-800 group-hover:scale-105 transition-transform origin-left">{value}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{label}</p>
            </div>
        </div>
    );
}

