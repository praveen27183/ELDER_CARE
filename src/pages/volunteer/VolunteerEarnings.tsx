import { TrendingUp, DollarSign, Award, Target, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function VolunteerEarnings() {
    const [earningsData, setEarningsData] = useState<any[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [bonusEarned, setBonusEarned] = useState(0);

    useEffect(() => {
        // Load earnings data from localStorage
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const stats = user.stats || {};
                const tasks = stats.completedTasks || [];
                
                // Group tasks by month for earnings data
                const monthlyData = tasks.reduce((acc: any, task: any) => {
                    const date = new Date(task.completedAt);
                    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    
                    if (!acc[monthKey]) {
                        acc[monthKey] = {
                            month: monthKey,
                            tasks: 0,
                            earnings: 0,
                            bonus: 0,
                            total: 0
                        };
                    }
                    
                    acc[monthKey].tasks += 1;
                    acc[monthKey].earnings += task.earnings || 0;
                    acc[monthKey].total += task.earnings || 0;
                    
                    return acc;
                }, {});
                
                const monthlyArray = Object.values(monthlyData);
                setEarningsData(monthlyArray);
                
                // Create transactions from completed tasks
                const transactions = tasks.map((task: any) => ({
                    id: task.id,
                    type: 'task',
                    description: task.taskType,
                    amount: task.earnings || 0,
                    date: new Date(task.completedAt).toISOString().split('T')[0],
                    status: 'completed'
                }));
                
                setRecentTransactions(transactions);
                setTotalEarnings(stats.totalEarnings || 0);
                setTotalTasks(stats.tasksCompleted || 0);
                setBonusEarned(0); // No bonus system implemented yet
            }
        } catch (error) {
            console.error('Error loading volunteer earnings:', error);
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <p className="text-sm text-slate-500 mb-1">Tasks Completed</p>
                            <p className="text-2xl font-bold text-slate-800">{totalTasks}</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Avg per Task</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {totalTasks > 0 ? `₹${Math.round(totalEarnings / totalTasks)}` : 'N/A'}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Bonus Earned</p>
                            <p className="text-2xl font-bold text-slate-800">₹{bonusEarned}</p>
                        </div>
                        <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly Breakdown</h2>
                
                {earningsData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Month</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tasks</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Base Earnings</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Bonus</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earningsData.map((month, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="py-3 px-4 text-sm text-slate-800">{month.month}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{month.tasks}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">₹{month.earnings}</td>
                                        <td className="py-3 px-4 text-sm text-emerald-600">₹{month.bonus}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-slate-800">₹{month.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No earnings data yet</h3>
                        <p className="text-slate-500">Complete tasks to start earning and see your monthly breakdown here!</p>
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h2>
                
                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                        transaction.type === 'task' ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{transaction.description}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {transaction.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-medium ${
                                        transaction.amount > 0 ? 'text-emerald-600' : 'text-slate-600'
                                    }`}>
                                        {transaction.amount > 0 ? `+₹${transaction.amount}` : 'Volunteer'}
                                    </p>
                                    <p className="text-xs text-slate-500">{transaction.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No transactions yet</h3>
                        <p className="text-slate-500">Your transaction history will appear here once you start completing tasks!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
