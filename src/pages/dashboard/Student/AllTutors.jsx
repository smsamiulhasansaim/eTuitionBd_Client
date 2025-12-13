import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Search, MapPin, Star, ShieldCheck, Filter, ChevronLeft, ChevronRight, 
  X, Briefcase, Banknote, User
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Constants ---
const ITEMS_PER_PAGE = 8;
const API_URL = import.meta.env.VITE_API_URL;

const AllTutors = () => {
  // --- Local UI State ---
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- Filter State ---
  const [filters, setFilters] = useState({
    subject: "",
    location: "",
  });

  // --- 1. Data Fetching (TanStack Query) ---
  const { 
    data: allTutors = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/profile/all`);
      // Assuming API returns { success: true, data: [...] }
      return response.data.data || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // --- 2. Optimized Filtering Logic (useMemo) ---
  const filteredTutors = useMemo(() => {
    return allTutors.filter(tutor => {
      const name = tutor.user?.name?.toLowerCase() || "";
      const subjects = tutor.preferredSubjects?.toLowerCase() || "";
      const address = tutor.address?.toLowerCase() || "";
      const search = searchQuery.toLowerCase();

      // Search Matching
      const matchesSearch = name.includes(search) || subjects.includes(search);

      // Filter Matching
      const matchesSubject = filters.subject 
        ? subjects.includes(filters.subject.toLowerCase()) 
        : true;
        
      const matchesLocation = filters.location 
        ? address.includes(filters.location.toLowerCase()) 
        : true;

      return matchesSearch && matchesSubject && matchesLocation;
    });
  }, [allTutors, searchQuery, filters]);

  // --- 3. Pagination Logic ---
  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
  const currentTutors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTutors.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredTutors]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // --- Handlers ---
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ subject: "", location: "" });
    setSearchQuery("");
    
    // User Feedback
    Swal.fire({
      icon: 'success',
      title: 'Filters Cleared',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  // --- 4. Conditional Rendering ---

  // Loading State
  if (isLoading) return <Loading />;

  // Error State
  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-32 pb-12 px-4 md:px-8">
      <div className="container mx-auto">
        
        {/* --- PAGE TITLE --- */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Find Your Perfect <span className="text-emerald-600">Tutor</span>
          </h1>
          <p className="text-gray-500 mt-2">Browse top-rated tutors near you for any subject.</p>
        </div>

        {/* --- SEARCH & FILTER BAR (Sticky) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-24 z-30">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Name or Subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Mobile Filter Trigger */}
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
            >
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* --- SIDEBAR FILTERS (Desktop) --- */}
          <div className="hidden md:block w-64 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-44">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Filter size={18} /> Filters</h3>
              <button onClick={clearFilters} className="text-xs text-emerald-600 font-bold hover:underline">Reset</button>
            </div>
            
            <div className="space-y-6">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Math"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={filters.subject} 
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                />
              </div>
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mirpur"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={filters.location} 
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- MOBILE FILTER DRAWER --- */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden" 
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  className="absolute right-0 top-0 h-full w-4/5 bg-white p-6 shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                   <div className="flex justify-between items-center mb-8">
                     <h3 className="font-bold text-xl">Filters</h3>
                     <button onClick={() => setIsMobileFilterOpen(false)}><X /></button>
                   </div>
                   
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input 
                          className="w-full p-3 border border-gray-200 rounded-lg" 
                          placeholder="e.g. English"
                          value={filters.subject} 
                          onChange={(e) => handleFilterChange('subject', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input 
                          className="w-full p-3 border border-gray-200 rounded-lg" 
                          placeholder="e.g. Dhanmondi"
                          value={filters.location} 
                          onChange={(e) => handleFilterChange('location', e.target.value)} 
                        />
                      </div>
                   </div>

                   <button 
                     onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }} 
                     className="w-full py-3 bg-gray-100 rounded-lg mt-8 font-medium text-gray-700"
                   >
                     Reset Filters
                   </button>
                   <button 
                     onClick={() => setIsMobileFilterOpen(false)} 
                     className="w-full py-3 bg-emerald-600 text-white rounded-lg mt-4 font-bold"
                   >
                     Show Results
                   </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- MAIN CONTENT GRID --- */}
          <div className="flex-1 w-full">
            {currentTutors.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentTutors.map((tutor) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={tutor._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 p-5 flex flex-col items-center text-center transition-all duration-300 group relative overflow-hidden"
                    style={{ borderTop: `4px solid ${tutor.themeColor || '#10b981'}` }}
                  >
                    {/* PROFILE PHOTO */}
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 group-hover:border-emerald-50 transition-colors">
                        <img 
                          src={tutor.image || "https://via.placeholder.com/150"} 
                          alt={tutor.user?.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Tutor"; }} 
                        />
                      </div>
                      {/* Verified Badge */}
                      <div className="absolute bottom-1 right-0 bg-white rounded-full p-1 shadow-sm" title="Verified Tutor">
                        <ShieldCheck size={20} className="text-emerald-500 fill-emerald-50" />
                      </div>
                    </div>

                    {/* TUTOR INFO */}
                    <h3 className="font-bold text-gray-800 text-lg mb-1 truncate w-full">{tutor.user?.name || "Tutor Name"}</h3>
                    <p className="text-sm font-medium mb-3 truncate w-full" style={{ color: tutor.themeColor || '#10b981' }}>
                      {tutor.title || "Private Tutor"}
                    </p>
                    
                    {/* Placeholder Rating */}
                    <div className="flex items-center gap-1 mb-4 bg-yellow-50 px-2 py-0.5 rounded-full">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">5.0</span>
                    </div>

                    {/* DETAILS BADGES */}
                    <div className="w-full space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg flex-grow">
                      <div className="flex items-center gap-2">
                         <Briefcase size={14} style={{ color: tutor.themeColor || '#10b981' }}/> 
                         <span className="truncate">{tutor.preferredSubjects || "All Subjects"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: tutor.themeColor || '#10b981' }}/> 
                        <span className="truncate">{tutor.address || "Online"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Banknote size={14} style={{ color: tutor.themeColor || '#10b981' }}/> 
                         <span className="font-semibold text-gray-700">৳ {tutor.expectedSalary || "Negotiable"}</span>
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <Link 
                      to={`/profile/${tutor.slug}`} 
                      className="w-full py-2.5 rounded-lg border font-semibold transition-all duration-300 block"
                      style={{ 
                        borderColor: tutor.themeColor || '#10b981', 
                        color: tutor.themeColor || '#10b981' 
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = tutor.themeColor || '#10b981';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = tutor.themeColor || '#10b981';
                      }}
                    >
                      View Profile
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // --- NO TUTORS FOUND UI ---
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-600">No tutors found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
                <button 
                  onClick={clearFilters} 
                  className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* --- PAGINATION CONTROLS --- */}
            {filteredTutors.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20}/>
                </button>
                
                <span className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg font-bold shadow-lg shadow-emerald-200">
                  {currentPage}
                </span>
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTutors;