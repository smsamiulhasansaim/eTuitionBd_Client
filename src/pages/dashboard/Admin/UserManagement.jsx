import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MdSearch, 
  MdDeleteOutline, 
  MdBlock, 
  MdCheckCircleOutline,
  MdWarning,
  MdHistory,
  MdClose,
  MdRefresh,
  MdTimeline
} from 'react-icons/md';

// Import Custom Components
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManagement = () => {
  const queryClient = useQueryClient();

  // --- Local UI States ---
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Log Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedUserForLog, setSelectedUserForLog] = useState(null);
  const [userLogs, setUserLogs] = useState([]); 

  // --- 1. Fetch Users (Query) ---
  const fetchUsers = async () => {
    // Optional: Add Auth Token Logic
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.email) throw new Error("Unauthorized");

    const response = await axios.get(`${API_URL}/api/users`);
    
    // Formatting data before returning
    return response.data.data.map(user => ({
      ...user,
      status: user.status || 'Active',
      joinDate: new Date(user.createdAt).toLocaleDateString("en-US", {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    }));
  };

  const { data: users = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  // --- 2. Action: Block/Unblock (Mutation) ---
  const statusMutation = useMutation({
    mutationFn: async (userId) => {
      return await axios.put(`${API_URL}/api/users/${userId}/status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refetch data
    },
    onError: (err) => {
      console.error("Status update failed", err);
      alert("Failed to update status.");
    }
  });

  const toggleStatus = (user) => {
    statusMutation.mutate(user._id);
  };

  // --- 3. Action: Delete (Mutation) ---
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      return await axios.delete(`${API_URL}/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refetch data
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      console.error("Delete failed", err);
      alert("Failed to delete user.");
    }
  });

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id);
    }
  };

  // --- 4. Action: View Logs (Mock Data) ---
  const handleViewLogs = (user) => {
    setSelectedUserForLog(user);
    // TODO: Connect to backend API for real logs in future
    const mockLogs = [
      { id: 1, action: "Account Created", time: user.joinDate, type: "success" },
      { id: 2, action: "Logged in via Google", time: "Today, 10:30 AM", type: "info" },
      { id: 3, action: "Updated Profile Picture", time: "Yesterday, 4:15 PM", type: "info" },
      ...(user.status === 'Blocked' ? [{ id: 4, action: "Account Blocked by Admin", time: "Just Now", type: "warning" }] : [])
    ];
    setUserLogs(mockLogs);
    setShowLogModal(true);
  };

  // --- Filter Logic ---
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render States ---
  if (isLoading) return <Loading />;

  if (isError) {
    if (error.response?.status === 401 || error.response?.status === 403 || error.message === "Unauthorized") {
      return <Unauthorized />;
    }
    return <ServerDown />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up space-y-6">
      
      {/* --- Cute Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-lg shadow-indigo-100/50 border border-white">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage your students & tutors happily ✨
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-72">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Search lovely users..." 
              className="w-full pl-12 pr-4 py-3 bg-indigo-50/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all text-sm font-medium text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => refetch()} 
            className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm hover:shadow-md hover:scale-105 transition-all border border-indigo-50"
            title="Refresh List"
          >
            <MdRefresh size={24} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- Card Style Table --- */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-gray-50 to-white text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Joined Date</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors group">
                    {/* User Profile */}
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm
                          ${user.role === 'tutor' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}
                        `}>
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">
                      <span className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border
                        ${user.role === 'tutor' 
                          ? 'bg-purple-50 text-purple-600 border-purple-100' 
                          : 'bg-blue-50 text-blue-600 border-blue-100'}
                      `}>
                        {user.role?.toUpperCase()}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {user.joinDate}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4 text-center">
                       <button 
                         onClick={() => toggleStatus(user)}
                         disabled={statusMutation.isPending}
                         className={`
                           relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm disabled:opacity-50
                           ${user.status === 'Active' 
                             ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                             : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}
                         `}
                       >
                         {user.status === 'Active' ? <MdCheckCircleOutline size={14}/> : <MdBlock size={14}/>}
                         {user.status}
                       </button>
                    </td>

                    {/* Actions: Log & Delete */}
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* History Button (Cute) */}
                        <button 
                          onClick={() => handleViewLogs(user)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all text-xs font-bold"
                          title="View Activity Log"
                        >
                          <MdHistory size={16} />
                          Log
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={() => confirmDelete(user)}
                          className="p-2 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:shadow-md transition-all"
                          title="Delete User"
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <MdSearch size={30} className="opacity-50"/>
                       </div>
                       <p className="text-sm font-medium">No users found 🍃</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Activity Log Modal (Cute) --- */}
      {showLogModal && selectedUserForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-white/50">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
              <button 
                onClick={() => setShowLogModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
              >
                <MdClose size={20}/>
              </button>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                    {selectedUserForLog.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-lg font-bold">{selectedUserForLog.name}</h3>
                   <p className="text-indigo-100 text-xs opacity-90">{selectedUserForLog.role} • {selectedUserForLog.email}</p>
                 </div>
              </div>
            </div>

            {/* Modal Body: Timeline */}
            <div className="p-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-100">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-5">
                <MdTimeline className="text-indigo-500"/> Activity History
              </h4>
              
              <div className="space-y-6 relative pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                {userLogs.map((log) => (
                  <div key={log.id} className="relative flex gap-4 items-start group">
                    {/* Dot */}
                    <div className={`
                      relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 mt-1
                      ${log.type === 'success' ? 'bg-emerald-400' : 
                        log.type === 'warning' ? 'bg-orange-400' : 'bg-indigo-400'}
                    `}></div>
                    
                    {/* Content Card */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:bg-indigo-50/50 transition-colors">
                      <p className="text-xs text-gray-800 font-semibold">{log.action}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal (Consistent Cute Style) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-white/50">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-sm">
                <MdWarning size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Do you really want to remove <strong>{userToDelete?.name}</strong>? <br/>
                This process cannot be undone! 😢
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  disabled={deleteMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all disabled:opacity-70"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;