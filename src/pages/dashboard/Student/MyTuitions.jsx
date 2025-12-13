import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  MapPin, DollarSign, Calendar, Users, 
  Trash2, Search, Briefcase, Filter, Plus 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const MyTuitions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');

  // --- 1. User Authentication Check ---
  const user = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return null;
    }
    return JSON.parse(storedUser);
  }, [navigate]);

  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: tuitions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['myTuitions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await axios.get(`${API_URL}/api/tuitions/my-tuitions?email=${user.email}`);
      return response.data.data; 
    },
    enabled: !!user?.email, // Only fetch if user exists
  });

  // --- 3. Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/api/tuitions/delete/${id}`);
    },
    onSuccess: () => {
      // Refresh the list immediately
      queryClient.invalidateQueries(['myTuitions']);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Your tuition post has been removed.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (err) => {
      Swal.fire('Error', 'Failed to delete the post.', 'error');
      console.error(err);
    }
  });

  // --- 4. Handle Delete Action ---
  const handleDeleteClick = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // --- 5. Optimized Filter Logic ---
  const filteredTuitions = useMemo(() => {
    if (filter === 'All') return tuitions;
    return tuitions.filter(item => item.status === filter);
  }, [tuitions, filter]);

  // --- Helper: Status Styles ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // --- 6. Conditional Rendering ---
  
  if (isLoading) return <Loading />;

  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Tuitions</h1>
          <p className="text-gray-500 mt-1">
            Manage your posts. You can hire tutors once your post is <span className="font-bold text-emerald-600">Approved</span>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Filter Tabs */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
            {['All', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                  filter === status 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <Link 
            to="/post-tuition"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Post New
          </Link>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {filteredTuitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredTuitions.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 mt-4 group-hover:text-emerald-600 transition-colors line-clamp-1" title={item.subject}>
                        {item.subject}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">{item.class} • {item.medium}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                         <MapPin size={16} />
                      </div>
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                         <DollarSign size={16} />
                      </div>
                      <span className="font-bold text-gray-800">৳{item.salary}</span> <span className="text-xs text-gray-400">/ month</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                       <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                         <Briefcase size={16} />
                       </div>
                       <span>{item.daysPerWeek}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions) */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  {item.status === 'approved' ? (
                    <Link 
                      to={`/dashboard/applied-tutors`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 text-sm"
                    >
                      <Users size={18} /> View Applicants
                    </Link>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        disabled
                      >
                         <Users size={18} /> Approval Pending
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteClick(item._id)}
                        disabled={deleteMutation.isPending}
                        className="p-3 bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
                        title="Delete Post"
                      >
                        {deleteMutation.isPending ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // --- EMPTY STATE ---
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 text-center"
        >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <Search className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Tuitions Found</h3>
            <p className="text-gray-500 mt-2 max-w-sm">
              {filter === 'All' 
                ? "You haven't posted any tuitions yet. Create one to find the perfect tutor!" 
                : `No tuition posts found with status "${filter}".`}
            </p>
            {filter === 'All' && (
              <Link to="/post-tuition" className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                Post Your First Tuition
              </Link>
            )}
        </motion.div>
      )}
    </div>
  );
};

export default MyTuitions;