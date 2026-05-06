import { useMemo, useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    MessageSquare, Phone, CheckCircle, Clock, Search, Filter, User, AlertTriangle, Download,
    Reply, AlertOctagon, Shield, X
} from 'lucide-react';

// --- Types ---
type Ticket = {
    id: string | number;
    user: string;
    role: 'Elder' | 'Volunteer'; // Who raised it
    type: 'App Issue' | 'Payment' | 'General' | 'Emergency';
    subject: string;
    description: string;
    status: 'Open' | 'Resolved' | 'Pending';
    priority: 'High' | 'Medium' | 'Low';
    time: string;
    avatarColor: string;
};

// --- Mock Data ---


export default function AdminHelpCenter() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | Ticket['status']>('All');
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<Ticket | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                // Fetch from issues endpoint to resolve the 404 and reuse existing issue data
                const res = await api.get('/issues');
                const fetched = res.data.map((i: any) => ({
                    id: i._id,
                    user: i.reportedBy || 'System',
                    role: 'Elder', // Defaulting role
                    type: i.type || 'General',
                    subject: `Report on ${i.volunteerName}`,
                    description: i.description,
                    status: i.status === 'Resolved' ? 'Resolved' : 'Open',
                    priority: i.severity === 'Critical' ? 'High' : (i.severity || 'Medium'),
                    time: i.date || 'Recently',
                    avatarColor: 'bg-indigo-100 text-indigo-700'
                }));
                setTickets(fetched);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    // Stats calculation
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'Open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
    const highPriority = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').length;

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tickets, searchTerm, statusFilter]);

    const handleResolve = async (id: string | number) => {
        try {
            await api.patch(`/issues/${id}/resolve`);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
        } catch (err) {
            console.error("Failed to resolve ticket", err);
            // Optimistic update for mock data fallback
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
        }
    };

    const handleSendReply = () => {
        if (!replyingTo || !replyText.trim()) return;

        // Send notification via local storage
        const existing = localStorage.getItem('elderNotifications');
        const notes = existing ? JSON.parse(existing) : [];
        
        notes.push({
            id: Date.now(),
            message: `Support Reply: ${replyText}`,
            type: 'general'
        });
        
        localStorage.setItem('elderNotifications', JSON.stringify(notes));
        
        setReplyingTo(null);
        setReplyText('');
        alert("Reply sent successfully!");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Help Center & Support</h1>
                    <p className="text-slate-500 text-sm">Manage support requests from elders and volunteers</p>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><MessageSquare className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Total Tickets</p>
                        <p className="text-xl font-bold text-slate-800">{totalTickets}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><AlertOctagon className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
                        <p className="text-xl font-bold text-slate-800">{openTickets}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Resolved</p>
                        <p className="text-xl font-bold text-slate-800">{resolvedTickets}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-rose-50 p-3 rounded-lg text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">High Priority</p>
                        <p className="text-xl font-bold text-slate-800">{highPriority}</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tickets by user, subject..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-slate-200 outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Pending">Pending</option>
                        </select>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Ticket List */}
                <div className="divide-y divide-slate-100">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(ticket => (
                            <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Avatar & User Info */}
                                    <div className="flex items-start gap-4 min-w-[200px]">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${ticket.avatarColor}`}>
                                            {ticket.user.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-sm">{ticket.user}</h4>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                {ticket.role === 'Elder' ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                                {ticket.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ticket Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border 
                                                ${ticket.type === 'Emergency' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    ticket.type === 'Payment' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {ticket.type}
                                            </span>
                                            <span className="text-slate-300 text-xs">•</span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {ticket.time}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 mb-1">{ticket.subject}</h3>
                                        <p className="text-sm text-slate-600 line-clamp-1">{ticket.description}</p>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col items-end gap-2 justify-between min-w-[140px]">
                                        <div className="flex items-center gap-2">
                                            {ticket.priority === 'High' && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                                    <AlertTriangle className="w-3 h-3" /> High Priority
                                                </span>
                                            )}
                                            <StatusBadge status={ticket.status} />
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {ticket.status !== 'Resolved' && (
                                                <button
                                                    onClick={() => handleResolve(ticket.id)}
                                                    className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Resolve
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setReplyingTo(ticket)}
                                                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                                            >
                                                <Reply className="w-3 h-3" /> Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-800 font-bold">No tickets found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Reply to {replyingTo.user}</h3>
                            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100">
                                <p className="font-semibold text-slate-800 mb-1">Original Message:</p>
                                <p>{replyingTo.description}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Reply</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
                                    rows={5}
                                    placeholder="Type your reply here. This will be sent as a notification to the elder..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    autoFocus
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
                            <button onClick={handleSendReply} className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-2">
                                <Reply className="w-4 h-4" /> Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: Ticket['status'] }) {
    const styles = {
        Open: "bg-amber-50 text-amber-700 border-amber-200",
        Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Pending: "bg-slate-100 text-slate-600 border-slate-200"
    };

    const icons = {
        Open: <AlertOctagon className="w-3 h-3" />,
        Resolved: <CheckCircle className="w-3 h-3" />,
        Pending: <Clock className="w-3 h-3" />
    };

    return (
        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
            {icons[status]} {status}
        </span>
    );
}
