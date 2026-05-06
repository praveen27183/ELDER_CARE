import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, ClipboardList, LifeBuoy, LogOut, Bell, 
    User, AlertTriangle, Clock, ChevronRight, CheckCircle, Info
} from 'lucide-react';
import api from '../../../../services/api';

export default function AdminLayout() {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setAdminUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage");
            }
        }

        const fetchData = async () => {
            try {
                const [issuesRes, volunteersRes] = await Promise.all([
                    api.get('/issues'),
                    api.get('/volunteers')
                ]);

                const allIssues = issuesRes.data || [];
                const allVolunteers = volunteersRes.data || [];

                const newNotifications: any[] = [];

                // 1. Add help requests (open issues)
                allIssues.filter((i: any) => i.status === 'Open').forEach((issue: any) => {
                    newNotifications.push({
                        id: `issue-${issue._id}`,
                        type: 'help',
                        title: 'Help Requested',
                        message: `${issue.volunteerName} reported a ${issue.type.toLowerCase()} issue`,
                        time: new Date(issue.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        icon: AlertTriangle,
                        color: 'text-red-500',
                        bg: 'bg-red-50',
                        link: '/admin/volunteers'
                    });
                });

                // 2. Add profile update requests
                allVolunteers.filter((v: any) => v.pendingUpdate).forEach((vol: any) => {
                    newNotifications.push({
                        id: `update-${vol._id}`,
                        type: 'update',
                        title: 'Profile Update',
                        message: `${vol.name} requested to change details`,
                        time: 'Just now',
                        icon: User,
                        color: 'text-purple-500',
                        bg: 'bg-purple-50',
                        link: '/admin/volunteers'
                    });
                });

                // Sort by ID or time (here just reverse for recent)
                setNotifications(newNotifications.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch notification data", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Check every 30 seconds

        // Click outside to close notifications
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center gap-3">
                    
                       
                        <div className="p-8 border-b border-slate-800 flex flex-col items-center text-center">
                    <div className="h-28 w-28 mb-4 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
                        <img src="/logo.png" alt="Logo" className="h-full w-full object-cover scale-150" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">ElderEase</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Central</p>
                </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-white text-slate-900 shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/jobs"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-white text-slate-900 shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`
                        }
                    >
                        <ClipboardList className="w-5 h-5" />
                        Job Assignment
                    </NavLink>
                    <NavLink
                        to="/admin/volunteers"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-white text-slate-900 shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`
                        }
                    >
                        <Users className="w-5 h-5" />
                        Volunteers
                    </NavLink>
                    <NavLink
                        to="/admin/membership"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-white text-slate-900 shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`
                        }
                    >
                        <User className="w-5 h-5" />
                        Elder Membership
                    </NavLink>
                    <NavLink
                        to="/admin/support"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-white text-slate-900 shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`
                        }
                    >
                        <LifeBuoy className="w-5 h-5" />
                        Help Center
                    </NavLink>
                    
                </nav>
                    

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-all duration-300 font-bold text-sm group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        Logout System
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Command Overview</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                className={`p-3 rounded-2xl transition-all duration-300 relative group ${showNotifications ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell className={`w-5 h-5 ${notifications.length > 0 && !showNotifications ? 'animate-bounce' : ''}`} />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
                                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                        <h3 className="font-black text-slate-900 text-lg">Notifications</h3>
                                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{notifications.length} New</span>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-400 font-bold text-sm">System clear. No alerts.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {notifications.map((notif) => (
                                                    <button 
                                                        key={notif.id}
                                                        onClick={() => {
                                                            navigate(notif.link);
                                                            setShowNotifications(false);
                                                        }}
                                                        className="w-full p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors text-left group"
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl ${notif.bg} ${notif.color} flex items-center justify-center shrink-0 shadow-inner`}>
                                                            <notif.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="font-black text-slate-800 text-sm">{notif.title}</h4>
                                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {notif.time}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-500 truncate leading-relaxed">{notif.message}</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors mt-1" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => navigate('/admin/volunteers')}
                                        className="w-full p-4 bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors border-t border-slate-100"
                                    >
                                        View Command Center
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-4 border-l border-slate-200 pl-6 ml-2">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
                                    {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin Authority'}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                        Operational
                                    </p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl border-4 border-white ring-1 ring-slate-100">
                                {adminUser?.firstName?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
