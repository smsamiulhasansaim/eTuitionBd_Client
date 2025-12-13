import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MdCheckCircle, 
  MdCancel, 
  MdVisibility, 
  MdClose,
  MdLocationOn,
  MdSubject,
  MdRefresh,
  MdPerson,
  MdEmail,
  MdTag,
  MdWc
} from 'react-icons/md';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TuitionManagement = () => {
  const queryClient = useQueryClient();

  // --- Local UI States ---
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [viewData, setViewData] = useState(null); // For Details Modal
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  // --- 1. Fetch Tuitions (Query) ---
  const fetchTuitions = async () => {
    // Optional: Add Auth Token Logic if needed
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.email) throw new Error("Unauthorized");

    const res = await axios.get(`${API_URL}/api/tuitions/admin/all`);
    // Ensure we return an array
    return Array.isArray(res.data.data) ? res.data.data : [];
  };

  const { data: tuitions = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tuitions'],
    queryFn: fetchTuitions,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // Cache for 2 mins
  });

  // --- 2. Update Status (Mutation) ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus, reason }) => {
      return await axios.patch(`${API_URL}/api/tuitions/update/${id}`, { 
        status: newStatus,
        rejectReason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tuitions']); // Refetch data
      // Close Modals
      if (rejectModal.open) {
        setRejectModal({ open: false, id: null });
        setRejectReason("");
      }
      if (viewData) {
        setViewData(null);
      }
    },
    onError: (err) => {
      console.error("Update failed:", err);
      alert("Failed to update status. Please try again.");
    }
  });

  // Wrapper Handler
  const handleStatusUpdate = (id, newStatus, reason = "") => {
    updateStatusMutation.mutate({ id, newStatus, reason });
  };

  const handleRejectConfirm = () => {
    if (rejectModal.id) {
      handleStatusUpdate(rejectModal.id, "rejected", rejectReason);
    }
  };

  // --- 3. Filter Logic ---
  const filteredTuitions = tuitions.filter(item => 
    filter === 'All' ? true : item.status === filter.toLowerCase()
  );

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // pending
    }
  };

  // --- Render States ---
  if (isLoading) return <Loading />;

  if (isError) {
    if (error.response?.status === 401 || error.response?.status === 403 || error.message === "Unauthorized") {
      return <Unauthorized />;
    }
    return <ServerDown />;
  }

  // --- Main UI ---
  return (
    <div className="space-y-6 animate-fade-in-up p-4">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Tuition Management
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
              Total: {tuitions.length}
            </span>
          </h2>
          <p className="text-sm text-gray-500">Manage student tuition posts</p>
        </div>

        <div className="flex gap-2">
            <button 
              onClick={() => refetch()} 
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-all" 
              title="Refresh Data"
            >
                <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            {/* Filter Tabs */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-1">
            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`
                    px-4 py-2 text-xs font-bold rounded-lg transition-all
                    ${filter === tab 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                `}
                >
                {tab}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Tuition Info (Slug)</th>
                <th className="px-6 py-4">Posted By</th>
                <th className="px-6 py-4">Salary & Location</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTuitions.length > 0 ? (
                filteredTuitions.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Tuition Info & Slug */}
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm truncate" title={item.subject}>
                          {item.subject}
                        </span>
                        <span className="text-[10px] text-indigo-500 font-mono bg-indigo-50 px-1 py-0.5 rounded w-fit mt-1 truncate max-w-full">
                           #{item.slug}
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{item.class}</span>
                            <span>({item.medium})</span>
                        </div>
                      </div>
                    </td>

                    {/* Posted By (Student Info) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                           <MdPerson size={14} className="text-gray-400"/>
                           {item.studentName || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                           <MdEmail size={12} className="text-gray-400"/>
                           {item.studentEmail || 'No Email'}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Salary & Location */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-indigo-600">{item.salary} BDT</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1" title={item.location}>
                             <MdLocationOn size={12}/> 
                             {item.location?.length > 20 ? item.location.substring(0, 20) + '...' : item.location}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewData(item)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <MdVisibility size={20} />
                        </button>

                        {/* Approved থাকলেও রিজেক্ট অপশন রাখা ভালো, কিন্তু সাধারণ ফ্লো তে Pending এর জন্যই অ্যাকশন বাটন থাকে */}
                        {item.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(item._id, "approved")}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <MdCheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => {
                                setRejectModal({ open: true, id: item._id });
                                setRejectReason("");
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <MdCancel size={20} />
                            </button>
                          </>
                        )}
                        
                        {/* যদি Approved হয় তবুও রিজেক্ট করতে চান তাহলে এই অপশন রাখতে পারেন */}
                         {item.status === 'approved' && (
                            <button 
                              onClick={() => {
                                setRejectModal({ open: true, id: item._id });
                                setRejectReason("");
                              }}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject / Remove"
                            >
                              <MdCancel size={20} />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No tuitions found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. View Details Modal */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewData(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
              <div>
                 <h3 className="text-lg font-bold text-gray-800">{viewData.subject}</h3>
                 <p className="text-xs text-indigo-500 font-mono mt-1 flex items-center gap-1">
                    <MdTag /> {viewData.slug}
                 </p>
              </div>
              <button onClick={() => setViewData(null)} className="text-gray-400 hover:text-red-500">
                <MdClose size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Status & Date */}
              <div className="flex gap-2">
                 <span className={`text-xs px-2 py-1 rounded font-bold border capitalize ${getStatusBadge(viewData.status)}`}>{viewData.status}</span>
                 <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-bold border border-gray-200">
                      Posted: {new Date(viewData.createdAt).toLocaleString()}
                 </span>
              </div>

              {/* Student Info Card */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                 <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Student Information</h4>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                        {viewData.studentName ? viewData.studentName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">{viewData.studentName}</p>
                        <p className="text-xs text-gray-500">{viewData.studentEmail}</p>
                    </div>
                 </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500 text-xs uppercase font-bold">Class / Grade</p>
                  <p className="font-semibold text-gray-800">{viewData.class} {viewData.semester ? `(${viewData.semester})` : ''}</p>
                </div>
                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500 text-xs uppercase font-bold">Salary</p>
                  <p className="font-semibold text-emerald-600">{viewData.salary} BDT</p>
                </div>
                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500 text-xs uppercase font-bold">Medium</p>
                  <p className="font-semibold text-gray-800">{viewData.medium}</p>
                </div>
                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500 text-xs uppercase font-bold">Schedule</p>
                  <p className="font-semibold text-gray-800">{viewData.daysPerWeek}</p>
                  <p className="text-xs text-gray-500">{viewData.time}</p>
                </div>
              </div>

              {/* Requirements & Extra Info */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MdLocationOn className="mt-0.5 text-indigo-500 shrink-0" size={18} />
                  <span>{viewData.location}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                   <MdWc className="mt-0.5 text-indigo-500 shrink-0" size={18} />
                   <span>Preference: <span className="font-semibold text-gray-800">{viewData.genderPreference || 'Any'}</span></span>
                </div>
                
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MdSubject className="mt-0.5 text-indigo-500 shrink-0" size={18} />
                  <div className="space-y-1 w-full">
                     <p className="font-medium text-gray-700">Requirements:</p>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600 italic text-xs leading-relaxed">
                        {viewData.requirements || 'No additional requirements'}
                     </div>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {viewData.status === 'rejected' && viewData.rejectReason && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                  <p className="text-xs font-bold text-red-800 uppercase mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{viewData.rejectReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                {viewData.status === 'pending' && (
                    <>
                        <button 
                            onClick={() => {
                                setRejectModal({ open: true, id: viewData._id });
                                setViewData(null);
                            }}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={() => {
                                handleStatusUpdate(viewData._id, 'approved');
                                // The modal closes automatically via mutation success, 
                                // but we can close immediately for better UX
                                setViewData(null); 
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Approve Now
                        </button>
                    </>
                )}
                <button 
                    onClick={() => setViewData(null)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reject Reason Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-scale-up">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Reject Tuition Post</h3>
              <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejection (Optional).</p>
              
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                rows="3"
                placeholder="Ex: Incomplete information / Salary too low..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>

              <div className="flex gap-3 mt-6 justify-end">
                <button 
                  onClick={() => setRejectModal({ open: false, id: null })}
                  className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRejectConfirm}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-70"
                >
                  {updateStatusMutation.isPending ? "Processing..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TuitionManagement;