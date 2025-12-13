import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, ShieldCheck, School, BookOpen, Clock, 
  MessageCircle, Share2, Heart, CheckCircle, 
  Briefcase, AlertCircle, Lock
} from 'lucide-react';

// --- Custom Components ---
import ServerDown from '../../common/ServerDown';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

// --- Loading Skeleton (Local Component) ---
const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto p-4 animate-pulse pt-28">
    <div className="h-40 bg-gray-200 rounded-t-2xl"></div>
    <div className="flex flex-col md:flex-row gap-6 px-6 -mt-12">
      <div className="w-28 h-28 bg-gray-300 rounded-full border-4 border-white"></div>
      <div className="pt-14 space-y-3 w-full">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="col-span-2 space-y-6">
        <div className="h-32 bg-gray-100 rounded-xl"></div>
        <div className="h-32 bg-gray-100 rounded-xl"></div>
      </div>
      <div className="h-64 bg-gray-100 rounded-xl"></div>
    </div>
  </div>
);

const ViewProfile = () => {
  const { slug } = useParams(); 

  // --- Data Fetching (TanStack Query) ---
  const { 
    data: tutor, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['tutorProfile', slug],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/profile/${slug}`);
      return response.data.data;
    },
    retry: 1, // Do not retry indefinitely on 404s
    enabled: !!slug,
  });

  // --- 1. Loading State ---
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // --- 2. Error Handling ---
  if (isError) {
    // If it's a 404 Not Found, show specific UI
    if (error.response?.status === 404) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 text-center bg-gray-50">
          <div className="bg-red-50 p-6 rounded-full mb-4">
            <AlertCircle size={48} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-500 mt-2">The tutor profile you are looking for does not exist.</p>
        </div>
      );
    }
    // For other errors (500, Network), show ServerDown
    return <ServerDown />;
  }

  // --- 3. Data Preparation ---
  // Ensure we have a theme color fallback
  const themeColor = tutor?.themeColor || '#10b981';

  // Helper to split comma-separated strings safely
  const parseList = (str) => str ? str.split(',').map(s => s.trim()) : [];

  return (
    <div className="bg-gray-50 min-h-screen pt-20 md:pt-24 pb-12 animate-fade-in-up">
      
      {/* --- HERO / HEADER SECTION --- */}
      <div className="bg-white shadow-sm pb-6 relative z-10">
        
        {/* Cover Photo */}
        <div 
          className="w-full bg-gray-200 relative overflow-hidden"
          style={{ 
            height: 'clamp(150px, 25vw, 250px)', 
            backgroundColor: themeColor 
          }}
        >
          {tutor.coverPhoto && (
            <img 
              src={tutor.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-5 relative">
            
            {/* Profile Picture */}
            <div className="-mt-14 md:-mt-16 flex-shrink-0 mx-auto md:mx-0 z-20">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[5px] border-white shadow-lg overflow-hidden bg-white relative group">
                <img 
                  src={tutor.image || "https://via.placeholder.com/150?text=Profile"} 
                  alt={tutor.user?.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md" title="Verified Tutor">
                  <ShieldCheck className="text-emerald-500 fill-emerald-50" size={22} />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="pt-2 md:pt-4 text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
                    {tutor.user?.name}
                  </h1>
                  <p className="font-medium text-gray-600" style={{ color: themeColor }}>
                    {tutor.title || "Professional Tutor"}
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={15} /> {tutor.address || "Online"}</span>
                    <span className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                      <Star size={14} className="fill-yellow-600" /> New
                    </span>
                    <span className="flex items-center gap-1"><Clock size={15} /> Joined Recently</span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex gap-3 mx-auto md:mx-0 mt-3 md:mt-0">
                  <button className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" title="Share Profile">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors" title="Add to Favorites">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="container mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (DETAILS) --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About / Bio */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-3 border-l-4 pl-3" style={{ borderColor: themeColor }}>About Me</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base text-justify">
                {tutor.bio || "This tutor has not added a bio yet."}
              </p>
            </motion.div>

             {/* Experience & Methodology */}
             <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-5 border-l-4 pl-3" style={{ borderColor: themeColor }}>Experience & Methodology</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Briefcase size={16} style={{ color: themeColor }}/> Experience
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {tutor.experience || "No specific experience details provided."}
                    </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <BookOpen size={16} style={{ color: themeColor }}/> Teaching Style
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {tutor.methodology || "No specific methodology described."}
                    </p>
                </div>
              </div>
            </motion.div>

            {/* Education */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-5 border-l-4 pl-3" style={{ borderColor: themeColor }}>Education</h2>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                  <School size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{tutor.institution || "Institution Name"}</h3>
                  <p className="text-gray-600 text-sm font-medium">{tutor.department || "Department / Group"}</p>
                  
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded">Year: {tutor.year || "N/A"}</span>
                    {tutor.result && <span className="bg-gray-100 px-2 py-1 rounded">CGPA/GPA: {tutor.result}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN (SIDEBAR) --- */}
          <div className="space-y-6">
            
            {/* 1. HIRE CARD */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border p-6 sticky top-24 z-20"
              style={{ borderColor: `${themeColor}40` }} 
            >
              <div className="text-center mb-6">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-bold">Salary Expectation</p>
                <h3 className="text-3xl font-extrabold" style={{ color: themeColor }}>৳ {tutor.expectedSalary || "Negotiable"}</h3>
                <p className="text-xs text-gray-400">per month</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 mb-6">
                 <button 
                    className="w-full py-3.5 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 transform active:scale-95"
                    style={{ backgroundColor: themeColor }}
                    onClick={() => console.log('Hire functionality to be implemented')}
                 >
                   <MessageCircle size={18} /> Chat to Hire
                 </button>
                 <button className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-lg transition-all hover:border-gray-300 hover:bg-gray-50">
                   Request Demo Class
                 </button>
              </div>

              {/* Verified & Availability */}
              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="flex items-center gap-2 text-xs uppercase font-bold text-gray-400">Verified</span>
                   <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Yes</span>
                </div>
                <div className="flex justify-between pt-1">
                   <span className="flex items-center gap-2 text-xs uppercase font-bold text-gray-400">Availability</span>
                   <span className="font-bold text-gray-800 text-right">{tutor.availability || "Flexible"}</span>
                </div>
              </div>
            </motion.div>

            {/* 2. SUBJECTS & CLASSES */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
               className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wide">
                    <BookOpen size={16} style={{ color: themeColor }}/> Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                    {parseList(tutor.preferredSubjects).length > 0 ? (
                      parseList(tutor.preferredSubjects).map((sub, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Not specified</span>
                    )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wide">
                    <School size={16} style={{ color: themeColor }}/> Classes
                </h3>
                <div className="flex flex-wrap gap-2">
                    {parseList(tutor.preferredClasses).length > 0 ? (
                      parseList(tutor.preferredClasses).map((cls, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-md text-xs font-bold">
                            {cls}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Not specified</span>
                    )}
                </div>
              </div>
            </motion.div>
            
            {/* 3. PRIVACY NOTICE */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-blue-50 rounded-xl border border-blue-100 p-5 text-center"
            >
                <div className="mx-auto w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <Lock size={20} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">Contact Info Hidden</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    To protect your safety and payment security, please communicate only through our platform.
                </p>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;