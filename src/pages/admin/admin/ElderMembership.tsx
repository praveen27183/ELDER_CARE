import React, { useState, useEffect } from 'react';
import { 
    Crown, Search, Filter, Mail, Phone, Calendar, 
    ChevronRight, CheckCircle, XCircle, AlertCircle, Clock, CreditCard
} from 'lucide-react';
import api from '../../../services/api';

interface MembershipData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    membership: {
        plan: 'Free' | 'Monthly' | '6 Months';
        status: 'active' | 'expired' | 'none';
        startDate?: string;
        expiryDate?: string;
    };
    createdAt: string;
}

export default function ElderMembership() {
    const [members, setMembers] = useState<MembershipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'All' | 'Free' | 'Monthly' | '6 Months'>('All');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/elders/all');
                // Filter only elders and handle potential missing data
                const elders = res.data || [];
                setMembers(elders);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch members", err);
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(m => {
        const matchesSearch = (m.firstName + ' ' + m.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
                             m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || m.membership?.plan === filter;
        return matchesSearch && matchesFilter;
    });

    const getPlanStyles = (plan: string) => {
        switch (plan) {
            case '6 Months':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Monthly':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'expired':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Crown className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                        Elder Membership Control
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Manage Subscriptions & Revenue</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                            <p className="text-lg font-black text-slate-900 leading-none mt-1">₹48,250</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Premium', count: members.filter(m => m.membership?.status === 'active').length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Monthly Plans', count: members.filter(m => m.membership?.plan === 'Monthly').length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: '6-Month Plans', count: members.filter(m => m.membership?.plan === '6 Months').length, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Pending Expiry', count: members.filter(m => m.membership?.status === 'expired').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                {/* Table Filters */}
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                        {['All', 'Free', 'Monthly', '6 Months'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filter === f 
                                    ? 'bg-slate-900 text-white shadow-lg' 
                                    : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-100'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Elder Member</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p className="text-sm font-bold text-slate-400">Loading Members Database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">
                                        No members found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                    {member.firstName[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-sm leading-tight">{member.firstName} {member.lastName}</h4>
                                                    <p className="text-xs font-bold text-slate-400">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getPlanStyles(member.membership?.plan || 'Free')}`}>
                                                {member.membership?.plan === '6 Months' && <Crown className="w-3 h-3 fill-indigo-600" />}
                                                {member.membership?.plan || 'Free'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(member.membership?.status || 'none')}
                                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                                                    {member.membership?.status || 'none'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-300" />
                                                {member.membership?.expiryDate ? new Date(member.membership.expiryDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-xl transition-all group-hover:-translate-x-2">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
