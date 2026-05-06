import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDuty } from '../context/DutyContext';
import { Power, AlertTriangle } from 'lucide-react';

interface DutyProtectionProps {
    children: React.ReactNode;
}

export default function DutyProtection({ children }: DutyProtectionProps) {
    const { isOnDuty, setIsOnDuty } = useDuty();
    const navigate = useNavigate();

    if (!isOnDuty) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Power className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Duty Must Be ON</h2>
                        <p className="text-slate-600 mb-6">
                            This feature is only available when you are on duty. Please turn your duty ON to access this page.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setIsOnDuty(true)}
                                className="w-full px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Power className="w-5 h-5" />
                                Turn ON Duty
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/volunteer')}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
