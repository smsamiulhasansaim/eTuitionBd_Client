import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MdCheckCircle, 
  MdCancel, 
  MdVisibility, 
  MdPerson, 
  MdWork, 
  MdDateRange, 
  MdMessage,
  MdClose,
  MdRefresh,
  MdAttachMoney
} from 'react-icons/md';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ApplicationManagement = () => {
  const queryClient = useQueryClient();
  
  // --- Local UI States ---
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Shortlisted', 'Rejected'
  const [selectedApp, setSelectedApp] = useState(null); // For Modal

  // --- 1. Fetch Applications (Query) ---
  const fetchApplications = async () => {
    const res = await axios.get(`${API_URL}/api/applications/all`);
    // Assuming API returns { status: "success", data: [...] }
    return res.data.data; 
  };

  const { data: applications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });

  // --- 2. Update Status (Mutation) ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      return await axios.patch(`${API_URL}/api/applications/update-status/${id}`, { status: newStatus });
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch queries to update the list UI
      queryClient.invalidateQueries(['applications']);
      
      // Close modal if the updated item was selected
      if (selectedApp && selectedApp._id === variables.id) {
        setSelectedApp(null);
      }
    },
    onError: (error) => {
      console.error("Update failed:", error);
      alert("Failed to update status. Please try again.");
    }
  });

  // Wrapper for handling status change
  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  // --- 3. Filter Logic ---
  const filteredApps = applications.filter(app => 
    filter === 'All' ? true : app.status === filter
  );

  // Status Badge Style Helper
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Shortlisted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending
    }
  };

  // --- Render States ---
  if (isLoading) return <Loading />;
  if (isError) return <ServerDown />;

  return (
    <div className="space-y-6 animate-fade-in-up p-4 md:p-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Job Applications
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
              Total: {applications.length}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage incoming applications from tutors.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button 
            onClick={() => refetch()} 
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh Data"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* Filter Tabs */}
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex gap-1">
            {['All', 'Pending', 'Shortlisted', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`
                  px-4 py-2 text-xs font-bold rounded-lg transition-all
                  ${filter === tab 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Applied For</th>
                <th className="px-6 py-4">Expected Salary</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Tutor Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-lg shrink-0">
                          {app.tutorName?.charAt(0).toUpperCase() || <MdPerson />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{app.tutorName}</p>
                          <p className="text-xs text-gray-500">{app.experience || 'Exp not specified'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Job Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <MdWork className="text-indigo-400" size={14}/> 
                          {app.tuitionTitle}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 pl-5">
                          <MdDateRange size={12} /> {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-4">
                       <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                         {app.expectedSalary} BDT
                       </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                         {/* View Details */}
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <MdVisibility size={20} />
                        </button>

                        {/* Action Buttons (Only for Pending) */}
                        {app.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(app._id, 'Shortlisted')}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Shortlist"
                            >
                              <MdCheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(app._id, 'Rejected')}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <MdCancel size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    No applications found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-start">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-sm">
                    {selectedApp.tutorName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{selectedApp.tutorName}</h3>
                    <p className="text-gray-500 text-sm">{selectedApp.experience}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                 <MdClose size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Job & Salary Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <MdWork /> Applied For
                  </p>
                  <p className="text-sm font-semibold text-indigo-900 line-clamp-2">
                    {selectedApp.tuitionTitle}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <MdAttachMoney /> Asking Salary
                  </p>
                  <p className="text-sm font-semibold text-emerald-900">
                    {selectedApp.expectedSalary} BDT
                  </p>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                 <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-2">
                   <MdMessage /> Cover Letter / Note
                 </h4>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-600 italic leading-relaxed">
                   "{selectedApp.message}"
                 </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between pt-2">
                 <span className="text-sm text-gray-500">Current Status:</span>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(selectedApp.status)}`}>
                    {selectedApp.status}
                 </span>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            {selectedApp.status === 'Pending' && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => handleStatusChange(selectedApp._id, 'Rejected')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Processing...' : 'Reject'}
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedApp._id, 'Shortlisted')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Processing...' : 'Shortlist Tutor'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationManagement;