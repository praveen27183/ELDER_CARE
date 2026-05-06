import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Lock, Mail, Phone, ArrowRight, Shield, Heart, Users, 
    CheckCircle2, AlertCircle, ChevronLeft, Eye, EyeOff 
} from 'lucide-react';
import api from '../../services/api';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'elder' | 'volunteer' | 'admin'>('elder');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        age: '',
        skills: [] as string[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skill = e.target.value;
        const checked = e.target.checked;
        
        if (checked) {
            setFormData({ ...formData, skills: [...formData.skills, skill] });
        } else {
            setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin 
                ? { email: formData.email, password: formData.password }
                : { ...formData, role };

            const response = await api.post(endpoint, payload);

            if (response.data.token) {
                api.setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Navigate based on role
                const userRole = response.data.user.role;
                if (userRole === 'admin') navigate('/admin');
                else if (userRole === 'volunteer') navigate('/volunteer');
                else navigate('/elder');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden relative z-10"
            >
                {/* Left Side - Visual/Info */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600/20 to-transparent border-r border-white/5">
                    <div className="mb-12">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mb-6 group transition-all duration-500 shadow-xl overflow-hidden">
                            <img src="logo.png" alt="logo" className="w-16 h-16 object-cover scale-125 group-hover:scale-150 transition-transform duration-500" />
                        </div>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Connecting Hearts,<br />Empowering Lives.
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md">
                            The most trusted platform for elderly care and community support. Join thousands of users making a difference today.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { icon: Heart, text: "Compassionate Care for Elders", color: "text-pink-400" },
                            { icon: Users, text: "Verified Community Volunteers", color: "text-emerald-400" },
                            { icon: CheckCircle2, text: "24/7 Safety Monitoring", color: "text-blue-400" }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="flex items-center gap-4 text-slate-300"
                            >
                                <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="max-w-[400px] mx-auto w-full">
                        {/* Logo for mobile views */}
                        <div className="lg:hidden mb-8 flex justify-center">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
                                <img src="logo.png" alt="logo" className="w-16 h-16 object-cover scale-125" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <AnimatePresence mode='wait'>
                                <motion.h2 
                                    key={isLogin ? 'login' : 'register'}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-3xl font-bold text-white mb-2"
                                >
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </motion.h2>
                            </AnimatePresence>
                            <p className="text-slate-400">
                                {isLogin ? 'Please enter your details to sign in' : 'Start your journey with us today'}
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">First Name</label>
                                        <div className="relative group">
                                            <input 
                                                required
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Last Name</label>
                                        <input 
                                            required
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input 
                                            required
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                            placeholder="name@example.com"
                                        />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input 
                                            required
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            autoComplete="current-password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-4 pt-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Select Your Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'elder', label: 'Elder', icon: Heart },
                                            { id: 'volunteer', label: 'Volunteer', icon: Users }
                                        ].map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setRole(r.id as any)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all ${
                                                    role === r.id 
                                                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                                }`}
                                            >
                                                <r.icon className="w-4 h-4" />
                                                <span className="font-medium">{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isLogin && role === 'volunteer' && (
                                <div className="space-y-3 pt-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Select Your Skills</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            'first aid', 'medicine delivery', 'companion care', 'emergency response',
                                            'grocery shopping', 'household help', 'medical escort', 'mobility assistance', 'tech support'
                                        ].map((skill) => (
                                            <label key={skill} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="skills"
                                                    value={skill}
                                                    checked={formData.skills?.includes(skill) || false}
                                                    onChange={handleSkillChange}
                                                    className="w-4 h-4 text-blue-600 bg-white/5 border-white/10 rounded focus:ring-blue-500/50"
                                                />
                                                <span className="text-sm text-slate-300 capitalize">{skill}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button 
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="ml-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                                >
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer / Copyright */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 text-sm">
                &copy; 2026 ElderEase. Built for community.
            </div>
        </div>
    );
};

export default LoginPage;
