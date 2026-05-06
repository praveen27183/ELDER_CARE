import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  User,
  HelpCircle,
  CreditCard,
  Clock,
  ShieldCheck,
  Gift,
  Star,
  Ticket,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  PhoneCall,
  LogOut,
  X,
  Phone,
  Droplet,
  Sparkles,
  UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* ================================
     AUTH CHECK
  ================================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    api.setToken(token);

    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const profile = data.user;
        setUser({
          name: `${profile.firstName} ${profile.lastName}`,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          bloodGroup: profile.bloodGroup || "",
          familyContact: profile.familyContact || "",
          role: profile.role || "elder",
          skills: profile.skills || []
        });
      } catch (error: any) {
        console.error("Failed to fetch profile", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    };
    
    fetchProfile();
  }, [navigate]);

  /* ================================
     MENU
  ================================= */
  const menuItems = [
    { icon: <User className="w-6 h-6" />, label: t.familySupport || "Family Support", to: "/elder/family-support" },
    { icon: <HelpCircle className="w-6 h-6" />, label: t.helpCenter || "Help Center", to: "/elder/help" },
    { icon: <CreditCard className="w-6 h-6" />, label: t.payments || "Payments", to: "/elder/payment" },
    { icon: <Clock className="w-6 h-6" />, label: t.myBookings || "My Bookings", to: "/elder/bookings" },
    { icon: <ShieldCheck className="w-6 h-6" />, label: t.safetyToolkit || "Safety Toolkit", to: "/elder/safety" },
    
    { icon: <Star className="w-6 h-6" />, label: t.myRewards || "My Rewards", to: "/elder/rewards" },
    { icon: <Ticket className="w-6 h-6" />, label: t.membership || "Membership", to: "/elder/membership" },
  ];

  /* ================================
     USER STATE
  ================================= */
  const [user, setUser] = useState<any>({
    name: "",
    firstName: "",
    lastName: "",
    phone: "",
    bloodGroup: "",
    familyContact: "",
    role: "elder",
    skills: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState(user);
  const [savedMsg, setSavedMsg] = useState(false);

  const onMenuClick = (path: string) => navigate(path);

  useEffect(() => {
    setTempUser(user);
  }, [user]);

  const handleSave = async () => {
    try {
      const payload: any = {
        firstName: tempUser.firstName,
        lastName: tempUser.lastName,
        phone: tempUser.phone,
      };

      if (tempUser.role === "elder") {
        payload.bloodGroup = tempUser.bloodGroup;
        payload.familyContact = tempUser.familyContact;
      } else if (tempUser.role === "volunteer") {
        payload.skills = typeof tempUser.skills === 'string' 
          ? tempUser.skills.split(',').map((s: string) => s.trim()) 
          : tempUser.skills;
      }

      const { data } = await api.put("/auth/profile", payload);
      const updatedProfile = data.user;

      setUser({
        ...tempUser,
        name: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
        skills: updatedProfile.skills || []
      });
      setIsEditing(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile.");
    }
  };

  const handleCancel = () => setIsEditing(false);

  /* ================================
     LOGOUT
  ================================= */
  const handleLogout = () => {
    const confirmLogout = window.confirm(t.confirmLogout || "Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">

      {/* ===== HEADER (FIXED) ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 pb-24 rounded-b-[2.5rem] shadow-xl">
        <div className="max-w-2xl mx-auto px-6 pt-6 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <ChevronLeft />
            </button>

            <h1 className="text-xl md:text-2xl font-bold text-white">
              {t.profile || "Your Profile"}
            </h1>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => {
              setTempUser(user);
              setIsEditing(true);
            }}
            className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
          >
            {t.edit || "Edit"}
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-10">

        {/* SUCCESS MESSAGE */}
        {savedMsg && (
          <div className="mb-4 text-center bg-green-100 text-green-700 py-2 rounded-xl font-bold">
            {t.profileUpdated || "Profile Updated Successfully!"}
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl p-6 shadow mb-6 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.phone}</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {user.role === "elder" ? (
              <>
                <div className="bg-red-100 p-4 rounded-xl text-center">
                  <HeartPulse className="mx-auto mb-1 text-red-600" />
                  <p className="font-bold">{user.bloodGroup || "Not Set"}</p>
                </div>

                <div className="bg-blue-100 p-4 rounded-xl text-center">
                  <PhoneCall className="mx-auto mb-1 text-blue-600" />
                  <p className="font-bold">{user.familyContact || "Not Set"}</p>
                </div>
              </>
            ) : (
              <div className="col-span-2 bg-purple-100 p-4 rounded-xl text-center">
                <ShieldCheck className="mx-auto mb-1 text-purple-600" />
                <p className="font-bold">Skills: {user.skills?.length > 0 ? user.skills.join(', ') : "None added"}</p>
              </div>
            )}
          </div>
        </div>

        {/* MENU */}
        <div className="bg-white rounded-3xl shadow mb-6 overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => onMenuClick(item.to)}
              className="w-full flex justify-between items-center p-4 border-b last:border-none hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              <ChevronRight />
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="bg-white rounded-3xl shadow p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-100 text-red-600 py-4 rounded-xl font-bold hover:bg-red-200"
          >
            <LogOut />
            {t.logout || "Logout"}
          </button>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white p-8 rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={handleCancel}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <h2 className="text-2xl font-black text-slate-800 mb-6">{t.editProfile || "Edit Profile"}</h2>

              <div className="space-y-5 mb-8">
                {/* FIRST NAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.firstName || "First Name"}</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                      placeholder="Enter first name"
                      value={tempUser.firstName}
                      onChange={(e) => setTempUser({ ...tempUser, firstName: e.target.value })}
                    />
                  </div>
                </div>

                {/* LAST NAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.lastName || "Last Name"}</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                      placeholder="Enter last name"
                      value={tempUser.lastName}
                      onChange={(e) => setTempUser({ ...tempUser, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.phoneNum || "Phone Number"}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                      placeholder="Enter phone number"
                      value={tempUser.phone}
                      onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })}
                    />
                  </div>
                </div>

                {user.role === "elder" ? (
                  <>
                    {/* BLOOD GROUP */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.bloodGroup || "Blood Group"}</label>
                      <div className="relative">
                        <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                        <input
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                          placeholder="e.g. O+"
                          value={tempUser.bloodGroup}
                          onChange={(e) => setTempUser({ ...tempUser, bloodGroup: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* FAMILY CONTACT */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.emergencyContact || "Emergency Contact"}</label>
                      <div className="relative">
                        <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                          placeholder="Emergency phone number"
                          value={tempUser.familyContact}
                          onChange={(e) => setTempUser({ ...tempUser, familyContact: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Skills</label>
                    <div className="relative">
                      <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <input
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                        placeholder="e.g. Nursing, Cooking, Driving"
                        value={typeof tempUser.skills === 'string' ? tempUser.skills : tempUser.skills?.join(', ')}
                        onChange={(e) => setTempUser({ ...tempUser, skills: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  {t.cancel || "Cancel"}
                </button>

                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  {t.saveChanges || "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}