import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '/public/logo.png';
import { 
    LayoutDashboard, 
    Map, 
    ClipboardList, 
    History, 
    Coins, 
    AlertTriangle,
    User,
    LifeBuoy,
    LogOut,
    Power,
    Menu,
    X
} from 'lucide-react';
import { useDuty } from '../context/DutyContext';

export default function VolunteerLayout() {
    const navigate = useNavigate();
    const { isOnDuty, setIsOnDuty } = useDuty();
    const [volunteerName, setVolunteerName] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Load user data from localStorage or use mock data for test user
    useEffect(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                
                // Check if it's the test user
                if (user.email === 'volunteer@test.com') {
                    // Use mock data for test user
                    setVolunteerName('Reenish');
                } else {
                    // Use real signup data
                    const fullName = user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email.split('@')[0];
                    setVolunteerName(fullName);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setVolunteerName('Volunteer');
        }
    }, []);

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const topNavItems = [
        {
            to: '/volunteer',
            icon: LayoutDashboard,
            label: 'Dashboard',
            requiresDuty: true
        },
        {
            to: '/volunteer/map',
            icon: Map,
            label: 'Map',
            requiresDuty: true
        },
        {
            to: '/volunteer/requests',
            icon: ClipboardList,
            label: 'Requests',
            requiresDuty: true
        },
        {
            to: '/volunteer/history',
            icon: History,
            label: 'Task History',
            requiresDuty: false
        },
        {
            to: '/volunteer/earnings',
            icon: Coins,
            label: 'Rewards / Earnings',
            requiresDuty: false
        },
        {
            to: '/volunteer/emergency',
            icon: AlertTriangle,
            label: 'Emergency',
            requiresDuty: true
        }
    ];

    const bottomNavItems = [
        {
            to: '/volunteer/profile',
            icon: User,
            label: 'Profile'
        },
        {
            to: '/volunteer/support',
            icon: LifeBuoy,
            label: 'Help & Support'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-8 border-b border-slate-800 flex flex-col items-center text-center">
                    <div className="h-28 w-28 mb-4 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
                        <img src={logo} alt="Logo" className="h-full w-full object-cover scale-150" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">ElderAssist</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Volunteer Portal</p>
                </div>

                {/* Top Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {topNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/volunteer'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Navigation */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                    {bottomNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-700">Volunteer Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Profile Avatar */}
                        <button
                            onClick={() => navigate('/volunteer/profile')}
                            className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-amber-600 transition-colors"
                            title="Go to Profile"
                        >
                            {getInitials(volunteerName)}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden p-6">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[10000] md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Mobile Sidebar */}
                    <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col overflow-y-auto">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex-shrink-0">
                                    <img src="/logo.png" alt="Logo" className="h-full w-full object-cover scale-150" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-white leading-tight tracking-tight">ElderAssist</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volunteer Portal</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Mobile Top Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {topNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/volunteer'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Mobile Bottom Navigation */}
                        <div className="p-4 border-t border-slate-800 space-y-2">
                            {bottomNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            ))}
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg w-full transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
