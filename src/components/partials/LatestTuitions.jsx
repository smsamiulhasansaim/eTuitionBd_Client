import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Banknote, Clock, User, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

// --- Custom Components ---

import ServerDown from '../../pages/common/ServerDown';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

// --- Helper: Time Ago Formatter ---
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return "Just now";
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return "Just now";
};

// --- Loading Skeleton Component ---
const TuitionSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
      <div className="h-6 w-16 bg-emerald-100 rounded-full"></div>
    </div>
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3 mb-6">
      <div className="h-4 w-full bg-gray-100 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
    </div>
    <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
  </div>
);

// --- Tuition Card Component ---
const TuitionCard = ({ job, variants }) => (
  <motion.div 
    variants={variants}
    className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 relative group flex flex-col justify-between h-full"
  >
    {/* Status Badge */}
    <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
       <CheckCircle size={12} /> {job.status || "Approved"}
    </div>

    <div>
      {/* Details */}
      <div className="mb-4 pr-16">
        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1" title={job.subject}>
          {job.subject}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen size={14} className="text-emerald-500" />
          {job.class} {job.medium ? `(${job.medium})` : ''}
        </div>
      </div>

      {/* Meta Info */}
      <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 text-gray-600 text-sm">
          <MapPin size={16} className="text-emerald-500 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 text-sm">
          <Banknote size={16} className="text-emerald-500 shrink-0" />
          <span className="font-semibold text-gray-800">৳ {job.salary}/month</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
          <div className="flex items-center gap-1">
              <User size={12} /> {job.genderPreference === 'Male' ? 'Male Tutor' : job.genderPreference === 'Female' ? 'Female Tutor' : 'Any Gender'}
          </div>
          <div className="flex items-center gap-1">
              <Clock size={12} /> {formatTimeAgo(job.createdAt)}
          </div>
        </div>
      </div>
    </div>

    {/* Action Button */}
    <Link 
      to={`/tuition-details/${job.slug}`} 
      className="w-full block text-center py-2.5 rounded-lg border border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-600 hover:text-white transition-all duration-300"
    >
      View Details
    </Link>
  </motion.div>
);

// --- Main Component ---
const LatestTuitions = () => {
  
  // --- Data Fetching (TanStack Query) ---
  const { 
    data: tuitions = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['latestTuitions'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/tuitions/all`);
      // Return only the first 8 items
      return response.data.data.slice(0, 8);
    },
    // Cache for 5 minutes
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // --- Conditional Rendering ---
  if (isError) return <ServerDown />;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- SECTION TITLE --- */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Latest Tuition <span className="text-emerald-600">Jobs</span>
          </h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Browse the most recent tuition opportunities posted by students and parents.
          </p>
        </div>

        {/* --- CONTENT AREA --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => <TuitionSkeleton key={n} />)}
          </div>
        ) : tuitions.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {tuitions.map((job) => (
              <TuitionCard key={job._id} job={job} variants={cardVariants} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-600">No tuition posts available yet</h3>
            <p className="text-gray-400 mt-2">Check back later or post a request yourself!</p>
          </div>
        )}

        {/* VIEW ALL BUTTON */}
        <div className="mt-12 text-center">
          <Link 
            to="/all-tuitions" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            View All Tuitions <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default LatestTuitions;