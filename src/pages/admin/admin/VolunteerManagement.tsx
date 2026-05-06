import { useMemo, useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Search, MapPin, Phone, Star, Filter, Shield,
    CheckCircle, Clock, AlertTriangle, User, Grid, List, X, Mail, Calendar,
    FileText, ChevronRight, UserPlus, AlertOctagon, XCircle, CheckSquare, Users, Edit
} from 'lucide-react';

// --- Types ---
type Volunteer = {
    id: string | number;
    name: string;
    role: string; // e.g., "Senior Caregiver"
    phone: string;
    email: string;
    service: string;
    status: 'Available' | 'Busy' | 'Offline';
    location: string;
    workingAt: string;
    rating: number;
    tasksCompleted: number;
    verified: 'Verified' | 'Pending';
    skills: string[];
    joinedDate: string;
    lastSeen: string;
    avatarColor: string;
    bio: string;
    documents: { name: string; status: 'Verified' | 'Pending' }[];
    pendingUpdate?: {
        name?: string;
        phone?: string;
        location?: string;
        email?: string;
    };
};

type Issue = {
    id: string | number;
    volunteerName: string;
    volunteerId: string | number;
    type: 'Behavior' | 'Missed Task' | 'Policy Violation' | 'Other';
    severity: 'Low' | 'Medium' | 'Critical';
    description: string;
    reportedBy: string;
    date: string;
    status: 'Open' | 'Resolved';
};

// --- Components ---

export default function VolunteerManagement() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'volunteers' | 'approvals' | 'issues' | 'profileUpdates'>('volunteers');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Available' | 'Busy' | 'Offline' | 'Pending'>('All');

    // ... (rest of the functions will be added in the next step)
    
    // State for fetched data
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [volRes, issuesRes] = await Promise.all([
                    api.get('/volunteers'),
                    api.get('/issues')
                ]);
                
                // Map MongoDB _id to id for compatibility with existing components
                const mappedVolunteers = volRes.data.map((v: any) => ({ ...v, id: v._id }));
                const mappedIssues = issuesRes.data.map((i: any) => ({ ...i, id: i._id }));
                
                setVolunteers(mappedVolunteers);
                setIssues(mappedIssues);
            } catch (error) {
                console.error("Error fetching volunteer data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate stats dynamic
    const totalVolunteers = volunteers.length;
    const activeNow = volunteers.filter(v => v.status === 'Available').length;
    const pendingVerification = volunteers.filter(v => v.verified === 'Pending').length;
    const openIssues = issues.filter(i => i.status === 'Open').length;

    const filteredVolunteers = useMemo(() => {
        return volunteers.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.location.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = filterStatus === 'All' 
                || (filterStatus === 'Pending' ? v.verified === 'Pending' : v.status === filterStatus);
            
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, volunteers, filterStatus]);

    const handleResolveIssue = async (id: string | number) => {
        try {
            await api.patch(`/issues/${id}/resolve`);
            setIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: 'Resolved' } : issue));
        } catch (error) {
            console.error("Error resolving issue:", error);
        }
    };

    const handleApproveVolunteer = async (id: string | number) => {
        try {
            await api.patch(`/volunteers/${id}`, { verified: 'Verified', status: 'Available' });
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, verified: 'Verified', status: 'Available' } : v));
            setSelectedVolunteer(null);
        } catch (error) {
            console.error("Error approving volunteer:", error);
        }
    };

    const handleApproveProfileUpdate = async (id: string | number) => {
        try {
            const res = await api.patch(`/volunteers/${id}/approve-update`);
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, ...res.data, pendingUpdate: null } : v));
        } catch (error) {
            console.error("Error approving profile update:", error);
        }
    };

    const handleRejectProfileUpdate = async (id: string | number) => {
        try {
            await api.patch(`/volunteers/${id}/reject-update`);
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, pendingUpdate: null } : v));
        } catch (error) {
            console.error("Error rejecting profile update:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    const pendingProfileUpdatesCount = volunteers.filter(v => v.pendingUpdate).length;

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Volunteer Management</h1>
                    <p className="text-slate-500 text-sm">Manage your fleet, approvals, and reports</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Volunteer
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Total</p>
                        <p className="text-xl font-bold text-slate-800">{totalVolunteers}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
                        <p className="text-xl font-bold text-slate-800">{activeNow}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><Shield className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
                        <p className="text-xl font-bold text-slate-800">{pendingVerification}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><Edit className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Updates</p>
                        <p className="text-xl font-bold text-slate-800">{pendingProfileUpdatesCount}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-lg text-red-600"><AlertOctagon className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Issues</p>
                        <p className="text-xl font-bold text-slate-800">{openIssues}</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('volunteers')}
                        className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'volunteers' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Active Volunteers
                        {activeTab === 'volunteers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'approvals' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pending Approvals
                        {pendingVerification > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full">{pendingVerification}</span>}
                        {activeTab === 'approvals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('profileUpdates')}
                        className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'profileUpdates' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Profile Updates
                        {pendingProfileUpdatesCount > 0 && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">{pendingProfileUpdatesCount}</span>}
                        {activeTab === 'profileUpdates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('issues')}
                        className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'issues' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Reported Issues
                        {openIssues > 0 && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full">{openIssues}</span>}
                        {activeTab === 'issues' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full"></div>}
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: ACTIVE VOLUNTEERS */}
            {activeTab === 'volunteers' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search volunteers by name, skill, or location..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-slate-200 outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => {
                                    const nextMap: any = { 'All': 'Available', 'Available': 'Busy', 'Busy': 'Offline', 'Offline': 'Pending', 'Pending': 'All' };
                                    setFilterStatus(nextMap[filterStatus]);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${filterStatus !== 'All' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'}`}>
                                <Filter className="w-4 h-4" /> 
                                {filterStatus === 'All' ? 'Filter' : filterStatus}
                            </button>
                        </div>
                    </div>

                    {/* Volunteer List/Grid View */}
                    {/* Reusing existing logic but wrapped */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredVolunteers.map(volunteer => (
                                <VolunteerCard key={volunteer.id} data={volunteer} onClick={() => setSelectedVolunteer(volunteer)} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <VolunteerTable data={filteredVolunteers} onClick={setSelectedVolunteer} />
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: PENDING APPROVALS */}
            {activeTab === 'approvals' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {pendingVerification === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
                            <p className="text-slate-500 text-sm max-w-sm text-center mt-2">
                                There are no volunteers waiting for document verification.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <VolunteerTable 
                                data={volunteers.filter(v => v.verified === 'Pending')} 
                                onClick={setSelectedVolunteer} 
                            />
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: PROFILE UPDATES */}
            {activeTab === 'profileUpdates' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {pendingProfileUpdatesCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No Pending Updates</h3>
                            <p className="text-slate-500 text-sm max-w-sm text-center mt-2">
                                All volunteer profile update requests have been processed.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {volunteers.filter(v => v.pendingUpdate).map(volunteer => (
                                <div key={volunteer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg ${volunteer.avatarColor}`}>
                                                {volunteer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{volunteer.name}</h3>
                                                <p className="text-slate-500 text-sm font-medium">{volunteer.role} • {volunteer.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            <button 
                                                onClick={() => handleRejectProfileUpdate(volunteer.id)}
                                                className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button 
                                                onClick={() => handleApproveProfileUpdate(volunteer.id)}
                                                className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-100 transition-all active:scale-95"
                                            >
                                                Approve Changes
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Profile</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Name:</span>
                                                    <span className="font-bold text-slate-700">{volunteer.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Phone:</span>
                                                    <span className="font-bold text-slate-700">{volunteer.phone}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Location:</span>
                                                    <span className="font-bold text-slate-700">{volunteer.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">Requested Changes</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Name:</span>
                                                    <span className={`font-bold ${volunteer.pendingUpdate?.name !== volunteer.name ? 'text-purple-700' : 'text-slate-700'}`}>
                                                        {volunteer.pendingUpdate?.name || volunteer.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Phone:</span>
                                                    <span className={`font-bold ${volunteer.pendingUpdate?.phone !== volunteer.phone ? 'text-purple-700' : 'text-slate-700'}`}>
                                                        {volunteer.pendingUpdate?.phone || volunteer.phone}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Location:</span>
                                                    <span className={`font-bold ${volunteer.pendingUpdate?.location !== volunteer.location ? 'text-purple-700' : 'text-slate-700'}`}>
                                                        {volunteer.pendingUpdate?.location || volunteer.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: REPORTED ISSUES */}
            {activeTab === 'issues' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {issues.map(issue => (
                        <div key={issue.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                                    ${issue.severity === 'Critical' ? 'bg-red-50 text-red-600' :
                                        issue.severity === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <AlertOctagon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800">{issue.type}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border 
                                            ${issue.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' :
                                                issue.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {issue.severity}
                                        </span>
                                        {issue.status === 'Resolved' && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                <CheckCircle className="w-3 h-3" /> Resolved
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-sm mb-2">{issue.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> Reported by {issue.reportedBy}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {issue.date}</span>
                                        <span className="font-medium text-slate-600">Volunteer: {issue.volunteerName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:self-center self-end">
                                {issue.status === 'Open' ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                const vol = volunteers.find(v => v.id === issue.volunteerId || v.name === issue.volunteerName);
                                                if (vol) window.location.href = `mailto:${vol.email}`;
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1">
                                            Contact
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    const vol = volunteers.find(v => v.id === issue.volunteerId || v.name === issue.volunteerName);
                                                    if (vol) {
                                                        await api.patch(`/volunteers/${vol.id}`, { status: 'Offline' });
                                                        setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, status: 'Offline' } : v));
                                                    }
                                                    await handleResolveIssue(issue.id);
                                                } catch (err) {
                                                    console.error(err);
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> Suspend
                                        </button>
                                        <button
                                            onClick={() => handleResolveIssue(issue.id)}
                                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm"
                                        >
                                            <CheckSquare className="w-3 h-3" /> Resolve
                                        </button>
                                    </>
                                ) : (
                                    <button disabled className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">
                                        Action Taken
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Modals */}
            {selectedVolunteer && (
                <VolunteerDetailsModal 
                    volunteer={selectedVolunteer} 
                    onClose={() => setSelectedVolunteer(null)} 
                    onApprove={handleApproveVolunteer}
                />
            )}

            {isAddModalOpen && (
                <AddVolunteerModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSuccess={(newVol) => {
                        setVolunteers(prev => [newVol, ...prev]);
                        setIsAddModalOpen(false);
                    }}
                />
            )}

        </div>
    );
}

// --- Sub-Components ---


function VolunteerCard({ data, onClick }: { data: Volunteer; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group flex flex-col overflow-hidden"
        >
            <div className="p-5 flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${data.avatarColor}`}>
                    {data.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{data.name}</h3>
                            <p className="text-sm text-slate-500 truncate">{data.role}</p>
                        </div>
                        {data.verified === 'Verified' && <Shield className="w-4 h-4 text-emerald-500 fill-emerald-100" />}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={data.status} />
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {data.rating}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{data.location}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {data.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="text-[10px] uppercase font-semibold px-2 py-1 rounded border border-slate-200 text-slate-500">
                            {skill}
                        </span>
                    ))}
                    {data.skills.length > 3 && <span className="text-[10px] text-slate-400 py-1">+{data.skills.length - 3}</span>}
                </div>
            </div>

            <div className="mt-auto px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs text-slate-500">
                    Working at <span className="font-medium text-slate-700">{data.workingAt}</span>
                </span>
                <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 group/btn">
                    Details <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>
    );
}

function VolunteerTable({ data, onClick }: { data: Volunteer[]; onClick: (v: Volunteer) => void }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Volunteer</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Location</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Rating</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Joined</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((volunteer) => (
                            <tr key={volunteer.id} onClick={() => onClick(volunteer)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${volunteer.avatarColor}`}>
                                            {volunteer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-800">{volunteer.name}</h3>
                                            <p className="text-xs text-slate-500">{volunteer.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={volunteer.status} /></td>
                                <td className="px-6 py-4 text-sm text-slate-600">{volunteer.location}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {volunteer.rating}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{volunteer.joinedDate}</td>
                                <td className="px-6 py-4">
                                    <button className="text-slate-400 group-hover:text-emerald-600 transition-colors p-1 rounded hover:bg-emerald-50">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        Available: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Busy: "bg-amber-100 text-amber-700 border-amber-200",
        Offline: "bg-slate-100 text-slate-600 border-slate-200"
    };

    const icons: any = {
        Available: <CheckCircle className="w-3 h-3" />,
        Busy: <Clock className="w-3 h-3" />,
        Offline: <AlertTriangle className="w-3 h-3" />
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {icons[status]} {status}
        </span>
    );
}

function VolunteerDetailsModal({ volunteer, onClose, onApprove }: { volunteer: Volunteer; onClose: () => void; onApprove: (id: string | number) => void }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-end sm:justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-teal-700">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-12 left-8 flex items-end">
                        <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold ${volunteer.avatarColor}`}>
                            {volunteer.name.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-6 px-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-slate-800">{volunteer.name}</h2>
                                {volunteer.verified === 'Verified' && <Shield className="w-5 h-5 text-emerald-500 fill-emerald-100" />}
                            </div>
                            <p className="text-slate-500 font-medium">{volunteer.role} • {volunteer.location}</p>
                        </div>
                        <div className="flex gap-2">
                            <a href={`tel:${volunteer.phone}`} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                                <Phone className="w-5 h-5" />
                            </a>
                            <a href={`mailto:${volunteer.email}`} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Rating</p>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                <span className="text-xl font-bold text-slate-800">{volunteer.rating}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Tasks Completed</p>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span className="text-xl font-bold text-slate-800">{volunteer.tasksCompleted}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</p>
                            <StatusBadge status={volunteer.status} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{volunteer.bio}</p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Skills & Services</h3>
                                <div className="flex flex-wrap gap-2">
                                    {volunteer.skills.map(skill => (
                                        <span key={skill} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-sm text-slate-600 shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Documents</h3>
                                <ul className="space-y-2">
                                    {volunteer.documents.map((doc, idx) => (
                                        <li key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{doc.name}</span>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${doc.status === 'Verified' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                                {doc.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium">Close</button>
                    {volunteer.verified === 'Pending' ? (
                        <button onClick={() => onApprove(volunteer.id)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow-sm flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Approve Volunteer
                        </button>
                    ) : (
                        <button onClick={() => window.location.href = '/admin/jobs'} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm">Assign Task</button>
                    )}
                </div>
            </div>
        </div>
    );
}

function AddVolunteerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (v: Volunteer) => void }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'General Volunteer',
        location: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const fullName = `${formData.firstName} ${formData.lastName}`;
            
            // Generate some defaults for fields not in the simple form
            const newVolunteer = {
                name: fullName,
                role: formData.role,
                phone: formData.phone,
                email: formData.email,
                location: formData.location,
                status: 'Available',
                service: formData.role === 'Driver' ? 'Transport' : 'General',
                workingAt: 'Individual',
                rating: 5.0,
                tasksCompleted: 0,
                verified: 'Pending',
                skills: [formData.role],
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                lastSeen: 'Just now',
                avatarColor: 'bg-slate-100 text-slate-700',
                bio: `New volunteer joined from ${formData.location}`,
                documents: []
            };

            const response = await api.post('/volunteers', newVolunteer);
            onSuccess({ ...response.data, id: response.data._id });
        } catch (error) {
            console.error("Error adding volunteer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Add New Volunteer</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">First Name</label>
                            <input 
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                placeholder="John" 
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Last Name</label>
                            <input 
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                placeholder="Doe" 
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Email Address</label>
                        <input 
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="john@example.com" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                        <input 
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="+91 98765 43210" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Role / Designation</label>
                        <select 
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option>General Volunteer</option>
                            <option>Medical Assistant</option>
                            <option>Driver</option>
                            <option>Caregiver</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Location</label>
                        <input 
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="e.g. Anna Nagar" 
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm shadow-sm flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : 'Save Volunteer'}
                    </button>
                </div>
            </div>
        </div>
    )
}
