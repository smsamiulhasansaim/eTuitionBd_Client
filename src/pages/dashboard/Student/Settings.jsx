import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  User, Mail, Phone, MapPin, Lock, Camera, 
  Save, Eye, EyeOff, Loader2 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local State ---
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    image: ''
  });

  const [securityData, setSecurityData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // --- 1. User Authentication Check & Token Retrieval ---
  const { user, authConfig, isUserValid } = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return { user: null, authConfig: {}, isUserValid: false };
    }
    
    const userData = JSON.parse(userStr);
    const authToken = userData.token || userData.jwtToken || localStorage.getItem("jwtToken"); 

    const config = {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : undefined,
      },
    };

    return { 
        user: userData, 
        authConfig: config,
        isUserValid: !!userData.email && !!authToken
    };
  }, []);

  // --- Redirect if not logged in (Side Effect) ---
  useEffect(() => {
    if (!isUserValid) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUserValid, navigate]);


  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: profileData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!isUserValid) return null;
      
      const emailQuery = user.email ? `?email=${user.email}` : '';

      const response = await axios.get(`${API_URL}/api/users/profile${emailQuery}`, authConfig);
      return response.data.data;
    },
    enabled: isUserValid,
    retry: 1
  });

  // --- 3. Sync Data to Form ---
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        image: profileData.image || ''
      });
    }
  }, [profileData]);

  // --- 4. Mutations ---
  
  // Mutation A: Update Profile Info
  const profileMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, email: user.email }; 
      
      const response = await axios.put(`${API_URL}/api/users/profile`, payload, authConfig);
      return response.data;
    },
    onSuccess: () => {
      // Update Local Storage for immediate UI reflection in Navbar/Sidebar
      const currentUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...currentUser, name: formData.name }));
      
      queryClient.invalidateQueries(['userProfile']);
    }
  });

  // Mutation B: Change Password
  const passwordMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { 
        email: user.email, 
        currentPassword: data.current,
        newPassword: data.new
      };

      const response = await axios.put(`${API_URL}/api/users/change-password`, payload, authConfig);
      return response.data;
    },
    onSuccess: () => {
        setSecurityData({ current: '', new: '', confirm: '' });
    }
  });

  // --- 5. Handlers ---

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e) => {
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Error', 'Image size must be less than 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isUserValid) return;

    try {
      // Step 1: Update Profile
      await profileMutation.mutateAsync(formData);

      // Step 2: Change Password (Conditional)
      if (securityData.current || securityData.new || securityData.confirm) {
        if (!securityData.current || !securityData.new || !securityData.confirm) {
            Swal.fire('Warning', 'To change password, all password fields (Current, New, Confirm) must be filled.', 'warning');
            return;
        }
        if (securityData.new !== securityData.confirm) {
          Swal.fire('Error', 'New password and confirm password do not match!', 'error');
          return;
        }
        await passwordMutation.mutateAsync(securityData);
      }

      // Success Feedback
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your settings have been saved successfully.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Something went wrong.',
      });
    }
  };

  // --- 6. Render Logic ---

  if (isLoading) return <Loading />;

  if (!user || isError) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  const isSaving = profileMutation.isPending || passwordMutation.isPending;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 pt-24 md:pt-32 pb-12">
      <div className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500 text-sm">Update your profile details and security settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* --- LEFT COLUMN: PROFILE IMAGE & BIO --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              
              {/* Profile Image Logic */}
              {formData.image ? (
                <img 
                  src={formData.image} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-emerald-50 shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-emerald-50 shadow-md">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Camera Icon Overlay */}
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera size={24} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 truncate">{formData.name || 'User Name'}</h2>
            <p className="text-sm text-gray-500 mb-4 truncate">{formData.email}</p>
            
            <div className="flex justify-center">
               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                 Verified Account
               </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <label className="block text-sm font-semibold text-gray-700 mb-2">About Me</label>
             <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none transition-all"
                placeholder="Write a short bio about yourself..."
             />
          </div>
        </motion.div>

        {/* --- RIGHT COLUMN: DETAILS FORM --- */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Personal Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <User className="text-emerald-600" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative opacity-75">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    readOnly 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Form */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Lock className="text-orange-600" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Security & Password</h3>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Password</label>
                <input 
                  type="password" 
                  name="current" 
                  value={securityData.current} 
                  onChange={handleSecurityChange} 
                  placeholder="••••••••" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="new" 
                      value={securityData.new} 
                      onChange={handleSecurityChange} 
                      placeholder="New password" 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" 
                    />
                     <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirm" 
                    value={securityData.confirm} 
                    onChange={handleSecurityChange} 
                    placeholder="Confirm password" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
             <button 
              type="submit" 
              disabled={isSaving} 
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default Settings;