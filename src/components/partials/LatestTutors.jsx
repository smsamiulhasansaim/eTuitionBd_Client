import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, Star, ShieldCheck, Briefcase, Banknote, ArrowRight, User 
} from 'lucide-react';

// --- Custom Components ---

import ServerDown from '../../pages/common/ServerDown';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

// --- Loading Skeleton Component ---
const TutorSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse flex flex-col items-center">
    <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1/2 bg-gray-200 rounded mb-4"></div>
    <div className="w-full space-y-2 mb-6">
      <div className="h-3 w-full bg-gray-100 rounded"></div>
      <div className="h-3 w-full bg-gray-100 rounded"></div>
    </div>
    <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
  </div>
);

// --- Tutor Card Component ---
const TutorCard = ({ tutor, variants }) => {
  const primarySubject = tutor.preferredSubjects ? tutor.preferredSubjects.split(',')[0] : "All Subjects";
  const location = tutor.preferredLocations ? tutor.preferredLocations.split(',')[0] : "Online";

  return (
    <motion.div 
      variants={variants}
      className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 group text-center relative flex flex-col"
    >
      {/* Photo & Badge */}
      <div className="relative inline-block mb-4 mx-auto">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-50 p-1 mx-auto">
          <img 
            src={tutor.image || "https://via.placeholder.com/150?text=Tutor"} 
            alt={tutor.user?.name || "Tutor"} 
            className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Tutor"; }}
          />
        </div>
        <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm" title="Verified Tutor">
          <ShieldCheck className="text-emerald-500 fill-emerald-50" size={22} />
        </div>
      </div>

      {/* Basic Info */}
      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors truncate">
        {tutor.user?.name || "Tutor Name"}
      </h3>
      <p className="text-emerald-600 font-medium text-sm mb-3 truncate">
        {primarySubject}
      </p>

      {/* Rating Placeholder */}
      <div className="flex justify-center items-center gap-1 mb-5 bg-yellow-50 py-1 px-3 rounded-full mx-auto w-fit">
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-bold text-gray-700">5.0</span>
        <span className="text-xs text-gray-400">/ 5.0</span>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 mb-6 text-left bg-gray-50 p-3 rounded-lg text-sm flex-grow">
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin size={16} className="text-emerald-500 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Briefcase size={16} className="text-emerald-500 shrink-0" />
          <span className="truncate">{tutor.experience || "Fresh"} Exp.</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Banknote size={16} className="text-emerald-500 shrink-0" />
          <span className="font-semibold truncate">৳ {tutor.expectedSalary || "Negotiable"}</span>
        </div>
      </div>

      {/* Action Button */}
      <Link 
        to={`/profile/${tutor.slug}`} 
        className="block w-full py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm text-center"
      >
        View Profile
      </Link>
    </motion.div>
  );
};

// --- Main Component ---
const LatestTutors = () => {
  
  // --- Data Fetching (TanStack Query) ---
  const { 
    data: tutors = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['topTutors'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/profile/top-tutors`);
      return response.data.data || [];
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000, 
  });

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // --- Conditional Rendering ---
  if (isError) return <ServerDown />;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- SECTION TITLE --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Top Rated <span className="text-emerald-600">Tutors</span>
          </h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 max-w-xl mx-auto">
            Connect with our highest-paid and verified tutors to ensure the best results for your exams.
          </p>
        </div>

        {/* --- CONTENT AREA --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => <TutorSkeleton key={n} />)}
          </div>
        ) : tutors.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {tutors.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} variants={itemVariants} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
               <User className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-600">No tutors found</h3>
            <p className="text-gray-400 mt-2">We are onboarding new tutors. Please check back later.</p>
          </div>
        )}

        {/* --- BROWSE ALL BUTTON --- */}
        <div className="mt-14 text-center">
          <Link 
            to="/all-tutors" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold shadow-lg hover:bg-emerald-600 hover:shadow-emerald-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            Browse All Tutors <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default LatestTutors;