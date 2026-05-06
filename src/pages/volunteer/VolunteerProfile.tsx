import { useState, useEffect } from 'react';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Award, 
    Clock, 
    Edit,
    Zap,
    Moon,
    AlertTriangle,
    Target,
    Star,
    DollarSign,
    CheckCircle2,
    Calendar,
    ChevronRight,
    Camera
} from 'lucide-react';
import api from '../../services/api';
import DutyProtection from './components/DutyProtection';
import profileImg from './profile.png';

export default function VolunteerProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    });
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        joinDate: '',
        totalTasks: 0,
        totalEarnings: 0,
        rating: 'N/A',
        verificationStatus: 'verified'
    });

    const [volunteerId, setVolunteerId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) api.setToken(token);
                
                const { data } = await api.get('/auth/me');
                const user = data.user;
                const stats = user.stats || {};

                // Fetch volunteer document to check for pending updates
                let volData: any = null;
                try {
                    const volRes = await api.get(`/volunteers/by-email/${user.email}`);
                    volData = volRes.data;
                    setVolunteerId(volData._id);
                    if (volData.pendingUpdate) {
                        setPendingChanges(volData.pendingUpdate);
                    }
                } catch (err) {
                    console.error('Error fetching volunteer data:', err);
                }
                
                const userDataForProfile = {
                    name: volData?.name || `${user.firstName} ${user.lastName}` || 'Volunteer',
                    email: user.email || '',
                    phone: volData?.phone || user.phone || '',
                    location: volData?.location || user.address?.city || user.location || 'Chennai, India',
                    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    totalTasks: volData?.tasksCompleted || stats.tasksCompleted || 0,
                    totalEarnings: stats.totalEarnings || 0,
                    rating: volData?.rating || (stats.tasksCompleted > 0 ? '4.8' : 'N/A'),
                    verificationStatus: (volData?.verified === 'Verified' || user.isVerified) ? 'verified' : 'pending'
                };
                
                setProfileData(userDataForProfile);
                setEditFormData({
                    name: userDataForProfile.name,
                    email: userDataForProfile.email,
                    phone: userDataForProfile.phone,
                    location: userDataForProfile.location
                });
            } catch (error) {
                console.error('Error loading user profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const achievements = [
        {
            title: 'Quick Responder',
            description: 'Completed 10+ tasks within 30 minutes',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            earned: profileData.totalTasks >= 10
        },
        {
            title: 'Night Owl',
            description: 'Completed 5+ tasks after 10 PM',
            icon: Moon,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            earned: profileData.totalTasks >= 5
        },
        {
            title: 'Emergency Hero',
            description: 'Responded to 5+ emergency requests',
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            earned: profileData.totalTasks >= 5
        },
        {
            title: 'Centurion',
            description: 'Complete 100 total tasks',
            icon: Target,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            earned: profileData.totalTasks >= 100
        }
    ];

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            location: profileData.location
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            if (volunteerId) {
                await api.patch(`/volunteers/${volunteerId}/update-request`, editFormData);
                setPendingChanges(editFormData);
                setIsEditing(false);
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 5000);
            }
        } catch (error) {
            console.error('Error submitting update request:', error);
            alert('Failed to submit update request. Please try again.');
        }
    };

    return (
        <DutyProtection>
            <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Status Messages */}
                <div className="space-y-3">
                    {pendingChanges && (
                        <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-lg shadow-amber-200 border border-amber-400 flex items-center justify-between animate-in zoom-in-95">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <Clock className="w-6 h-6 animate-spin-slow" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Changes Pending Approval</h3>
                                    <p className="text-amber-50 text-sm font-bold opacity-90 uppercase tracking-tighter">Admin Review Required</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {showSuccessMessage && (
                        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg shadow-emerald-200 border border-emerald-500 flex items-center gap-4 animate-in slide-in-from-top-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg">Submission Successful!</h3>
                                <p className="text-emerald-50 text-sm font-bold opacity-90">Updates sent to administration for verification.</p>
                            </div>
                            <button onClick={() => setShowSuccessMessage(false)} className="opacity-60 hover:opacity-100 font-black text-xl">×</button>
                        </div>
                    )}
                </div>

                {/* Profile Hero Section */}
                <div className="relative bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                    <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        {!isEditing && (
                            <button 
                                onClick={handleEditClick}
                                className="absolute top-6 right-6 px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-2xl font-black flex items-center gap-2 hover:bg-white/30 transition-all active:scale-95 border border-white/30"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                    
                    <div className="px-4 md:px-8 pb-8">
                        <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.2rem] md:rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-slate-400 border border-slate-100 overflow-hidden">
                                    <img 
                                        src={profileImg} 
                                        alt={profileData.name}
                                        className="w-full h-full rounded-[1.8rem] md:rounded-[2rem] object-cover"
                                        onError={(e) => {
                                            // Fallback to initials if image fails
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const initials = document.createElement('div');
                                                initials.className = "w-full h-full rounded-[1.8rem] md:rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-3xl md:text-5xl font-black";
                                                initials.innerText = profileData.name.split(' ').map(n => n[0]).join('');
                                                parent.appendChild(initials);
                                            }
                                        }}
                                    />
                                </div>
                                <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-8 h-8 md:w-10 md:h-10 bg-blue-600 text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border-2 md:border-4 border-white hover:bg-blue-700 transition-colors">
                                    <Camera className="w-4 h-4 md:w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex-1 mb-2">
                                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{profileData.name}</h2>
                                    {profileData.verificationStatus === 'verified' && (
                                        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                            <Award className="w-3 h-3" />
                                            Verified
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    {profileData.location}
                                </p>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-black text-slate-800 mb-2">Update Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editFormData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={editFormData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={editFormData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Location</label>
                                        <input
                                            type="text"
                                            value={editFormData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="City, Region"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-slate-200">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-10 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 active:scale-[0.98] transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{profileData.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Phone className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phone</p>
                                        <p className="text-sm font-bold text-slate-700">{profileData.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Joined</p>
                                        <p className="text-sm font-bold text-slate-700">{profileData.joinDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Rating</p>
                                        <p className="text-sm font-bold text-slate-700">{profileData.rating}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                <Award className="w-7 h-7 text-blue-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                                <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                                    <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                                    Top 5%
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-black mb-1">{profileData.totalTasks}</p>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Missions Completed</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                <DollarSign className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Wallet Balance</p>
                                <p className="text-sm font-bold text-white opacity-80">Available now</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-black mb-1">₹{profileData.totalEarnings.toLocaleString()}</p>
                            <p className="text-emerald-100 font-bold uppercase text-[10px] tracking-widest">Lifetime Total Rewards</p>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-slate-200 border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">Elite Badges</h2>
                            <p className="text-slate-500 font-bold text-sm">Recognizing your dedicated service to elders</p>
                        </div>
                        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-100 border border-amber-200">
                            <Award className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {achievements.map((achievement, index) => (
                            <div 
                                key={index} 
                                className={`group p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                                    achievement.earned 
                                        ? `${achievement.bg} border-transparent shadow-xl hover:scale-[1.02]` 
                                        : 'bg-white border-slate-100 grayscale'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg ${achievement.color} border border-slate-50`}>
                                        <achievement.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black text-slate-800 text-lg">{achievement.title}</h3>
                                            {achievement.earned && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 leading-snug mt-1">{achievement.description}</p>
                                        
                                        {!achievement.earned && (
                                            <div className="mt-4">
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full bg-slate-300 transition-all duration-1000`}
                                                        style={{ width: `${Math.min((profileData.totalTasks / 100) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest text-right">In Progress</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DutyProtection>
    );
}
