import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Search, MapPin, BookOpen, DollarSign, Clock, Filter, 
  X, CheckCircle, Briefcase, User, Mail, Phone 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const BrowseTuitions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local UI State ---
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  // Application Form State
  const [applyForm, setApplyForm] = useState({
    expectedSalary: '',
    message: '',
    experience: ''
  });

  // --- 1. User Authentication Check ---
  const user = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  // --- 2. Data Fetching (Parallel Queries) ---

  // Query A: Fetch All Approved Tuitions
  const { 
    data: tuitions = [], 
    isLoading: loadingTuitions, 
    isError: isTuitionError 
  } = useQuery({
    queryKey: ['browseTuitions'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/tuitions/all`);
      // Filter only approved tuitions on the client side (or backend if supported)
      return response.data.data.filter(item => item.status === 'approved');
    },
    refetchOnWindowFocus: false,
  });

  // Query B: Fetch User's Existing Applications (To check what they already applied to)
  const { data: myApplications = [] } = useQuery({
    queryKey: ['myApplications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      // Assuming backend supports filtering by tutorEmail or returning all for user
      const response = await axios.get(`${API_URL}/api/applications/my-applications?tutorName=${encodeURIComponent(user.name)}`);
      return response.data.data;
    },
    enabled: !!user, // Only fetch if user is logged in
  });

  // Computed: List of Tuition IDs the user has already applied for
  const appliedTuitionIds = useMemo(() => {
    return myApplications.map(app => 
      typeof app.tuitionId === 'object' ? app.tuitionId._id : app.tuitionId
    );
  }, [myApplications]);

  // --- 3. Optimized Filtering (useMemo) ---
  const filteredTuitions = useMemo(() => {
    let result = tuitions;

    if (searchText) {
      const lowerText = searchText.toLowerCase();
      result = result.filter(item => 
        item.subject?.toLowerCase().includes(lowerText) || 
        item.requirements?.toLowerCase().includes(lowerText)
      );
    }

    if (locationFilter) {
      result = result.filter(item => item.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (classFilter) {
      result = result.filter(item => item.class === classFilter);
    }

    return result;
  }, [searchText, locationFilter, classFilter, tuitions]);

  const uniqueClasses = useMemo(() => [...new Set(tuitions.map(item => item.class))], [tuitions]);

  // --- 4. Apply Mutation ---
  const applyMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${API_URL}/api/applications/apply`, payload);
      return response.data;
    },
    onSuccess: () => {
      // 1. Refresh "My Applications" list so the UI updates "Apply Now" -> "Applied"
      queryClient.invalidateQueries(['myApplications']);
      
      // 2. Show Success Feedback
      Swal.fire({
        icon: 'success',
        title: 'Application Sent!',
        text: 'The student will review your application shortly.',
        timer: 2000,
        showConfirmButton: false
      });

      // 3. Reset Modal
      setSelectedJob(null);
      setApplyForm({ expectedSalary: '', message: '', experience: '' });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to submit application.";
      Swal.fire('Error', msg, 'error');
    }
  });

  // --- 5. Handlers ---
  const handleApplyClick = (job) => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: "You must login to apply for tuitions.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login Now'
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }
    
    if (appliedTuitionIds.includes(job._id)) {
      Swal.fire('Already Applied', 'You have already applied for this tuition.', 'info');
      return;
    }

    setSelectedJob(job);
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!selectedJob || !user) return;

    const payload = {
      tuitionId: selectedJob._id,
      tuitionTitle: `${selectedJob.subject} for ${selectedJob.class}`,
      tutorName: user.name,
      tutorEmail: user.email,
      tutorPhone: user.phone || "Not Provided",
      expectedSalary: applyForm.expectedSalary,
      message: applyForm.message,
      experience: applyForm.experience
    };

    applyMutation.mutate(payload);
  };

  // --- 6. Render Logic ---
  if (loadingTuitions) return <Loading />;
  if (isTuitionError) return <ServerDown />;

  return (
    <div className="space-y-6 animate-fade-in-up relative p-4 md:p-8 pt-24 min-h-screen bg-gray-50">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
             <h2 className="text-2xl font-bold text-gray-800">Browse Available Tuitions</h2>
             <p className="text-sm text-gray-500">Find and apply to the best tuition jobs near you.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by subject..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Location Filter */}
            <div className="relative w-full lg:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Location (e.g. Uttara)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Class Filter */}
            <div className="relative w-full lg:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select 
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- TUITIONS GRID --- */}
        {filteredTuitions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-600">No tuitions found</h3>
            <p className="text-gray-400">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTuitions.map((job) => {
              const isApplied = appliedTuitionIds.includes(job._id);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job._id} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg mb-2 uppercase tracking-wide">
                          {job.medium}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-emerald-700 transition-colors">
                          {job.subject}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{job.class}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100 shrink-0">
                        <Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{job.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <DollarSign size={18} className="text-emerald-500 shrink-0" />
                        <span className="font-bold text-gray-800">{job.salary} BDT</span>
                        <span className="text-xs text-gray-400">/ Month</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Briefcase size={18} className="text-emerald-500 shrink-0" />
                        <span>{job.daysPerWeek}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => !isApplied && handleApplyClick(job)}
                    disabled={isApplied}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200
                      ${isApplied 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100" 
                        : "border-2 border-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                      }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle size={18} /> Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- APPLY MODAL --- */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Apply for Tuition</h3>
                  <p className="text-sm text-emerald-600 font-medium mt-0.5">{selectedJob.subject} - {selectedJob.class}</p>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)} 
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmitApplication} className="space-y-5">
                  
                  {/* Auto-filled User Info */}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-2">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Applicant Details</p>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User size={16} className="text-emerald-500"/> 
                        <span className="font-semibold">{user?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={16} className="text-emerald-500"/> 
                        <span>{user?.email}</span>
                      </div>
                      {user?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone size={16} className="text-emerald-500"/> 
                          <span>{user?.phone}</span>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Salary</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                        <input 
                          type="number" 
                          required
                          placeholder="5000"
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={applyForm.expectedSalary}
                          onChange={(e) => setApplyForm({...applyForm, expectedSalary: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2 Years"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={applyForm.experience}
                        onChange={(e) => setApplyForm({...applyForm, experience: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Note / Why hire you?</label>
                    <textarea 
                      rows="4"
                      required
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                      placeholder="Briefly describe your qualifications and teaching style..."
                      value={applyForm.message}
                      onChange={(e) => setApplyForm({...applyForm, message: e.target.value})}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={applyMutation.isPending}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {applyMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowseTuitions;