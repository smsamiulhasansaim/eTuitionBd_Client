import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, Filter, Trash2, AlertCircle, Clock, MapPin, 
  RefreshCw, CheckCircle, Info, Layers, X, DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const MyApplications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local UI State ---
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. User Authentication Check ---
  const { user, token } = useMemo(() => {
    const userStr = localStorage.getItem('user');
    const tokenStr = localStorage.getItem('token');
    
    if (!userStr || !tokenStr) {
      navigate('/login'); 
      return { user: null, token: null };
    }
    
    return { user: JSON.parse(userStr), token: tokenStr };
  }, [navigate]);
  
  const authHeaders = useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: applications = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['myApplications', user?.email], 
    queryFn: async () => {
      if (!user?.email || !token) return [];
      
      const response = await axios.get(
        `${API_URL}/api/applications/my-applications`, 
        { headers: authHeaders }
      );
      
      return response.data.data;
    },
    enabled: !!user?.email && !!token,
    onError: (err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  });

  // --- 3. Withdraw Mutation ---
  const withdrawMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/api/applications/withdraw/${id}`, { headers: authHeaders });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myApplications']);
      Swal.fire(
        'Withdrawn!',
        'Your application has been removed.',
        'success'
      );
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to withdraw application.';
      Swal.fire('Error', msg, 'error');
    }
  });

  // --- 4. Handlers ---
  
  const handleWithdraw = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will need to re-apply if you withdraw.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#10B981',
      confirmButtonText: 'Yes, Withdraw',
      cancelButtonText: 'No, Keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        withdrawMutation.mutate(id);
      }
    });
  };

  const showRejectReason = (reason, byWho) => {
    Swal.fire({
      title: '<span class="text-xl font-bold text-gray-700">Application Rejected 😔</span>',
      html: `
        <div class="text-left mt-2">
          <p class="text-gray-600 mb-4 text-sm leading-relaxed font-sans">
            Your application did not meet the required criteria this time.
          </p>
          
          <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
            <p class="text-xs font-bold text-red-500 uppercase mb-1">
              Reason from ${byWho || 'System'}:
            </p>
            <p class="text-gray-700 italic font-medium">"${reason}"</p>
          </div>

          <p class="text-emerald-600 font-semibold text-center text-sm border-t border-gray-100 pt-4">
            "Keep refining your profile! Success is just around the corner." ✨
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Okay, I understand',
      confirmButtonColor: '#10B981',
      buttonsStyling: true,
      customClass: { popup: 'rounded-xl shadow-xl' }
    });
  };

  // --- 5. Filtering Logic (Memoized) ---
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
      const matchesSearch = app.tuitionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, filterStatus, searchTerm]);

  // --- 6. Helpers ---
  const getStatusBadge = (status) => {
    const commonClass = "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border";
    switch (status) {
      case 'Hired':
        return (
          <span className={`${commonClass} bg-green-100 text-green-700 border-green-200`}>
            <CheckCircle size={12} /> Hired
          </span>
        );
      case 'Shortlisted':
        return <span className={`${commonClass} bg-emerald-100 text-emerald-700 border-emerald-200`}>Shortlisted</span>;
      case 'Pending':
        return <span className={`${commonClass} bg-amber-100 text-amber-700 border-amber-200`}><Clock size={12} /> Pending</span>;
      case 'Rejected':
        return (
          <span className={`${commonClass} bg-red-100 text-red-700 border-red-200`}>
            <X size={12} /> Rejected 
          </span>
        );
      default:
        return <span className={`${commonClass} bg-gray-100 text-gray-600 border-gray-200`}>{status}</span>;
    }
  };

  // --- 7. Conditional Rendering ---
  if (!user || !token) return <Unauthorized />;
  if (isLoading) return <Loading />;

  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-4 md:p-8 pt-24 min-h-screen flex flex-col">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-emerald-600" size={24} /> My Applications
            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-600">{applications.length}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-emerald-600">{user?.name}</span>. Track your job applications here.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
           <button 
             onClick={() => refetch()}
             className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
             title="Refresh List"
           >
             <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
           </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none cursor-pointer w-full sm:w-40"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-grow">
        {filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Applied For</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">My Offer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filteredApps.map((app) => (
                    <motion.tr 
                      key={app._id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      
                      {/* Tuition Info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 line-clamp-1" title={app.tuitionTitle}>{app.tuitionTitle}</div>
                        <Link to={`/tuition-details/${app.tuitionId}`} className="text-xs text-gray-500 mt-1 flex items-center gap-1 hover:text-emerald-600 hover:underline w-fit">
                           <MapPin size={12} /> View Details
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="px-6 py-4 font-medium text-emerald-600">
                        <div className="flex items-center gap-1">
                           <DollarSign size={14} /> ৳ {app.expectedSalary}
                        </div>
                      </td>

                      {/* Status with Rejection Reason Logic */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                              {getStatusBadge(app.status)}
                              
                              {/* Rejection Info Button */}
                              {app.status === 'Rejected' && app.rejectionReason && (
                                <button 
                                  onClick={() => showRejectReason(app.rejectionReason, app.rejectedBy)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-full transition-colors border border-red-100"
                                  title="View Rejection Reason"
                                >
                                  <Info size={14} />
                                </button>
                              )}
                          </div>

                          {/* Rejected By Label */}
                          {app.status === 'Rejected' && (
                            <span className="text-[10px] text-gray-400 ml-1">
                              by {app.rejectedBy || 'System'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Withdraw Button (Only if Pending) */}
                          {app.status === 'Pending' ? (
                            <button 
                              onClick={() => handleWithdraw(app._id)}
                              disabled={withdrawMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Withdraw Application"
                            >
                              <Trash2 size={14} /> Withdraw
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Action Locked</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          /* --- Empty State --- */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <AlertCircle className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No applications found!</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              You haven't applied to any tuitions yet or no applications match your filter.
            </p>
            <Link 
              to="/all-tuitions" 
              className="mt-6 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Find New Tuitions
            </Link>
          </div>
        )}
      </div>

      {/* --- Credit Section --- */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center text-center">
        <p className="text-gray-400 text-xs flex items-center gap-1">
          Developed & Designed with <span className="text-red-400 fill-red-400">♥</span> by 
          <span className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors">
            S M Samiul Hasan
          </span>
        </p>
        <p className="text-[10px] text-gray-300 mt-1">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </div>

    </div>
  );
};

export default MyApplications;