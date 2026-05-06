import { CheckCircle, Clock, DollarSign, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function VolunteerHistory() {
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [avgRating, setAvgRating] = useState('N/A');

    useEffect(() => {
        // Load completed tasks from localStorage
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const stats = user.stats || {};
                const tasks = stats.completedTasks || [];
                
                setCompletedTasks(tasks);
                setTotalEarnings(stats.totalEarnings || 0);
                
                // Calculate average rating (mock data for now)
                if (tasks.length > 0) {
                    setAvgRating('4.8'); // Mock rating
                } else {
                    setAvgRating('N/A');
                }
            }
        } catch (error) {
            console.error('Error loading volunteer history:', error);
        }
    }, []);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-slate-300'}`}>
                ★
            </span>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Total Tasks</p>
                            <p className="text-2xl font-bold text-slate-800">{completedTasks.length}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Total Earnings</p>
                            <p className="text-2xl font-bold text-slate-800">₹{totalEarnings}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Avg Rating</p>
                            <p className="text-2xl font-bold text-slate-800">4.8</p>
                        </div>
                        <span className="text-2xl text-yellow-500">★</span>
                    </div>
                </div>
            </div>

            {/* Task History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Task History</h2>
                
                {completedTasks.length > 0 ? (
                    <div className="space-y-4">
                        {completedTasks.map((task) => (
                            <div key={task.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800">{task.taskType}</h3>
                                    <span className="font-bold text-emerald-600">₹{task.earnings}</span>
                                </div>

                                <div className="text-sm text-slate-500 space-y-1 mb-3">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {task.location}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(task.completedAt).toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Completed
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">Rating:</span>
                                        {renderStars(5)} {/* Mock 5-star rating */}
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No tasks completed yet</h3>
                        <p className="text-slate-500 mb-4">Start accepting tasks to build your volunteer history and earn rewards!</p>
                        <button 
                            onClick={() => window.location.href = '/volunteer/dashboard'}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Browse Available Tasks
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
