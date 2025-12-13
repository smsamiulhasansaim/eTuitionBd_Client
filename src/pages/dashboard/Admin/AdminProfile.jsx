import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MdCameraAlt, MdPerson, MdEmail, MdPhone, MdLocationOn, 
  MdLock, MdSave, MdVisibility, MdVisibilityOff, MdCheckCircle 
} from 'react-icons/md';

// Import Custom Components (Updated Paths)
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// API Configuration
// Ensure VITE_API_URL is set in your .env file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminProfile = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // --- Local UI States ---
  const [showPassword, setShowPassword] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // State for Form Inputs
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    location: "",
    bio: "",
    img: "" 
  });

  // State for Password Management
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // --- 1. Fetch Admin Profile Logic ---
  const fetchProfile = async () => {
    // Retrieve user identity from LocalStorage
    const storedUser = JSON.parse(localStorage.getItem("user")); 
    const email = storedUser?.email;

    // If no email found in local storage, treat as unauthorized
    if (!email) throw new Error("Unauthorized"); 

    const res = await axios.get(`${API_URL}/api/users/profile?email=${email}`);
    return res.data.data;
  };

  // React Query Hook for Data Fetching
  const { data: profileData, isLoading, isError, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: fetchProfile,
    retry: 1, // Retry once before failing
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // --- 2. Sync Server Data to Local State ---
  useEffect(() => {
    if (profileData) {
      setAdminForm({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        role: profileData.role || "Admin",
        location: profileData.address || "", // Mapping DB 'address' to UI 'location'
        bio: profileData.bio || "",
        img: profileData.image || ""
      });
    }
  }, [profileData]);

  // --- 3. Mutation: Update Profile ---
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const payload = {
        ...updatedData,
        address: updatedData.location, // Mapping UI 'location' back to DB 'address'
        image: updatedData.img
      };
      return await axios.put(`${API_URL}/api/users/profile`, payload);
    },
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries(['adminProfile']); // Refresh data from server
      
      // Update LocalStorage to keep UI consistent instantly (Optional but recommended)
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if(currentUser) {
        localStorage.setItem("user", JSON.stringify({ 
          ...currentUser, 
          name: adminForm.name, 
          image: adminForm.img 
        }));
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: (err) => {
      console.error("Update failed:", err);
      alert("Failed to update profile. Please try again.");
    }
  });

  // --- 4. Mutation: Change Password ---
  const changePasswordMutation = useMutation({
    mutationFn: async (passData) => {
      return await axios.put(`${API_URL}/api/users/change-password`, {
        email: adminForm.email,
        currentPassword: passData.current,
        newPassword: passData.new
      });
    },
    onSuccess: () => {
      alert("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to change password");
    }
  });

  // --- Event Handlers ---
  const handleProfileChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Convert uploaded image to Base64 for preview and upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminForm({ ...adminForm, img: reader.result }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(adminForm);
  };

  const handlePasswordUpdate = () => {
    if (passwords.new !== passwords.confirm) {
      return alert("New password and confirm password do not match!");
    }
    if (!passwords.current || !passwords.new) {
      return alert("Please fill all password fields.");
    }
    changePasswordMutation.mutate(passwords);
  };

  // --- Render States ---
  
  // 1. Loading State
  if (isLoading) return <Loading />;

  // 2. Error Handling
  if (isError) {
    // Check specific HTTP status codes for Unauthorized access (401/403)
    if (error.response?.status === 401 || error.response?.status === 403 || error.message === "Unauthorized") {
      return <Unauthorized />;
    }
    // Default fallback for other errors (Server Down/Network Error/500)
    return <ServerDown />;
  }

  // --- Main UI Component ---
  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
        <p className="text-sm text-gray-500">Manage your personal information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
             
             {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
             
             {/* Profile Image Section */}
             <div className="relative mt-8 mb-4 group">
               <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                 {adminForm.img ? (
                   <img src={adminForm.img} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <MdPerson className="text-gray-400 text-6xl" />
                 )}
               </div>
               
               {/* Image Upload Trigger */}
               <button 
                 onClick={() => fileInputRef.current.click()}
                 className="absolute bottom-1 right-1 p-2 bg-white rounded-full text-indigo-600 shadow-md hover:bg-indigo-50 transition-colors border border-gray-100"
                 title="Change Photo"
               >
                 <MdCameraAlt size={18} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 className="hidden" 
                 accept="image/*"
               />
             </div>

             <h3 className="text-xl font-bold text-gray-800">{adminForm.name}</h3>
             <p className="text-sm text-indigo-600 font-medium mb-4 uppercase">{adminForm.role}</p>
             
             {/* Contact Details */}
             <div className="w-full space-y-3 pt-4 border-t border-gray-50">
               <div className="flex items-center gap-3 text-sm text-gray-600">
                 <MdEmail className="text-gray-400" /> {adminForm.email}
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                 <MdPhone className="text-gray-400" /> {adminForm.phone || "N/A"}
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                 <MdLocationOn className="text-gray-400" /> {adminForm.location || "N/A"}
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MdPerson className="text-indigo-500" /> Personal Information
            </h3>
            
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={adminForm.name} 
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={adminForm.phone} 
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Read Only)</label>
                  <input 
                    type="email" 
                    value={adminForm.email} 
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 outline-none text-sm cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location / Address</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={adminForm.location} 
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / About</label>
                  <textarea 
                    name="bio" 
                    rows="3"
                    value={adminForm.bio} 
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium resize-none" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg
                    ${isSaved ? 'bg-green-500 shadow-green-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
                    ${updateProfileMutation.isPending ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {updateProfileMutation.isPending ? "Saving..." : 
                    (isSaved ? <><MdCheckCircle size={18} /> Saved Changes</> : <><MdSave size={18} /> Save Information</>)
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Security Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MdLock className="text-orange-500" /> Security & Password
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <button 
                   type="button" 
                   onClick={() => setShowPassword(!showPassword)}
                   className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                 >
                   {showPassword ? <MdVisibilityOff /> : <MdVisibility />} 
                   {showPassword ? "Hide Passwords" : "Show Passwords"}
                 </button>

                 <button 
                  onClick={handlePasswordUpdate}
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gray-800 text-white hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-70">
                   {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                 </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;