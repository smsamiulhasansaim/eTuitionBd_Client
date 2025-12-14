import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  User, Mail, Phone, MapPin, GraduationCap, BookOpen, 
  DollarSign, Clock, Edit2, Save, Camera, Briefcase, 
  Palette, Image as ImageIcon, Loader 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

// --- Custom Hooks ---
const useAuth = (navigate) => {
  const { user, userId, token } = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return { user: null, userId: null, token: null };
    }
    const parsedUser = JSON.parse(userStr);
    
    const id = parsedUser?._id || parsedUser?.id;
    
    return {
        user: parsedUser, 
        userId: id ? id.toString() : null,
        token: parsedUser?.token 
    };
  }, [navigate]);

  return { user, userId, token };
};

const useAxiosInterceptors = (token, navigate) => {
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
          (config) => {
            if (token && !config.headers.Authorization) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          (error) => Promise.reject(error)
        );
    
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    if (error.response.status === 401 || error.response.status === 403) {
                        console.error("Authentication Error: Session Expired/Unauthorized.");
                        navigate("/login");
                    } else if (error.response.status === 500) {
                         console.error("Server Side Error 500:", error.response.data || "Unknown 500 error.");
                    }
                } else if (error.message.includes("Network Error")) {
                     console.error("Network Error: Backend may be down.");
                }
                return Promise.reject(error);
            }
        );
    
        return () => {
          axios.interceptors.request.eject(requestInterceptor);
          axios.interceptors.response.eject(responseInterceptor);
        };
      }, [token, navigate]);
}

// --- Main Component ---
const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '', email: '', title: '', phone: '', address: '', bio: '',
    institution: '', department: '', year: '', result: '',
    experience: '', methodology: '', preferredSubjects: '',
    preferredClasses: '', preferredLocations: '', expectedSalary: '',
    availability: '', image: '', coverPhoto: '', themeColor: '#10b981'
  });

  const { user, userId, token } = useAuth(navigate);
  useAxiosInterceptors(token, navigate);

  const { 
    data: fetchedProfile, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['tutorProfile', userId],
    queryFn: async () => {
      if (!userId || !token) { 
        return Promise.reject(new Error("Authentication token is missing."));
      }
      
      const response = await axios.get(`${API_URL}/api/profile/my-profile`); 
      return response.data;
    },
    enabled: !!userId && !!token,
    retry: 1, 
  });

  // Sync Data to Local State (Includes fix for phone/image persistence)
  useEffect(() => {
    if (fetchedProfile?.success && fetchedProfile.data) {
      const backendData = fetchedProfile.data;
      setProfile(prev => ({
        ...prev,
        ...backendData,
        // FIX: Ensure name, email, phone, and image are prioritized from the populated user object
        name: backendData.user?.name || prev.name,
        email: backendData.user?.email || prev.email,
        phone: backendData.user?.phone || backendData.phone || prev.phone,
        image: backendData.user?.image || backendData.image || prev.image,
        // End FIX
        themeColor: backendData.themeColor || '#10b981'
      }));
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [fetchedProfile, user]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      if (!token) throw new Error("Authentication failed. Please log in again.");
      
      const response = await axios.put(`${API_URL}/api/profile/update`, updatedData); 
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(['tutorProfile']);
        setIsEditing(false);
        Swal.fire({
          title: 'Updated!',
          text: 'Your professional CV has been updated.',
          icon: 'success',
          confirmButtonColor: profile.themeColor
        });
      } else {
        throw new Error(data.message);
      }
    },
    onError: (err) => {
      console.error("Update Error:", err);
      Swal.fire('Error', err.message || 'Something went wrong while saving!', 'error');
    }
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        Swal.fire('File too large', 'Please upload an image smaller than 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!profile.name || !profile.phone) {
      Swal.fire('Missing Information', 'Name and Phone number are required!', 'warning');
      return;
    }
    updateMutation.mutate(profile);
  };

  if (isLoading) return <Loading />;
  
  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403 || error.message?.includes("Authentication token is missing")) return <Unauthorized />;
    
    if (status !== 404) return <ServerDown />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans text-gray-700 animate-fade-in-up pt-24 md:pt-32 px-4">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Professional CV</h1>
          <p className="text-sm text-gray-500">Manage your tutor profile and preferences.</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={updateMutation.isPending}
          style={{ 
            backgroundColor: isEditing ? profile.themeColor : 'white', 
            borderColor: profile.themeColor, 
            color: isEditing ? 'white' : profile.themeColor 
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-sm border disabled:opacity-70`}
        >
          {updateMutation.isPending ? (
            <Loader className="animate-spin" size={18} /> 
          ) : isEditing ? (
            <><Save size={18} /> Save Changes</>
          ) : (
            <><Edit2 size={18} /> Edit CV</>
          )}
        </button>
      </div>

      {/* --- MAIN CONTAINER --- */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* === COVER PHOTO SECTION === */}
        <div 
          className="relative h-48 md:h-64 bg-gray-200 transition-all duration-500"
          style={{ 
            backgroundImage: profile.coverPhoto ? `url(${profile.coverPhoto})` : 'none',
            backgroundColor: profile.themeColor, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {isEditing && (
            <div className="absolute top-4 right-4 flex gap-3 bg-white/80 p-2 rounded-full backdrop-blur-sm shadow-md">
              <div className="relative group flex items-center gap-2 px-2 cursor-pointer">
                <Palette size={18} className="text-gray-700" />
                <input 
                  type="color" 
                  name="themeColor" 
                  value={profile.themeColor} 
                  onChange={handleChange}
                  className="w-6 h-6 p-0 border-0 rounded-full cursor-pointer overflow-hidden shadow-sm"
                  title="Choose Theme Color"
                />
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <label className="cursor-pointer hover:text-blue-600 transition flex items-center gap-2 px-2" title="Upload Cover Photo">
                <ImageIcon size={18} />
                <span className="text-xs font-bold hidden sm:inline">Cover</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'coverPhoto')} />
              </label>
            </div>
          )}
        </div>

        {/* === PROFILE INFO HEADER === */}
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row gap-6">
            
            <div className="-mt-16 md:-mt-20 shrink-0 flex flex-col items-center z-10">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden group">
                <img 
                  src={profile.image || "https://via.placeholder.com/150?text=Profile"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                    <Camera className="text-white mb-1" size={28} />
                    <span className="text-white text-xs font-medium">Change Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} />
                  </label>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-2 flex-grow space-y-2 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-2 max-w-md">
                  <input 
                    type="text" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleChange} 
                    placeholder="Your Full Name" 
                    className="text-3xl font-bold w-full border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent placeholder-gray-300" 
                  />
                  <input 
                    type="text" 
                    name="title" 
                    value={profile.title} 
                    onChange={handleChange} 
                    placeholder="Your Designation (e.g. Senior Math Tutor)" 
                    className="text-lg text-gray-500 font-medium w-full border-b border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent" 
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name || "Your Name Here"}</h1>
                  <p className="text-lg font-medium" style={{ color: profile.themeColor }}>{profile.title || "Tutor Designation"}</p>
                </>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mt-3">
                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <MapPin size={14} style={{ color: profile.themeColor }} /> 
                  {isEditing ? <input name="address" value={profile.address} onChange={handleChange} placeholder="Address" className="bg-transparent focus:outline-none w-32" /> : (profile.address || "Location N/A")}
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <Phone size={14} style={{ color: profile.themeColor }} /> 
                  {isEditing ? <input name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" className="bg-transparent focus:outline-none w-32" /> : (profile.phone || "Phone N/A")}
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <Mail size={14} style={{ color: profile.themeColor }} /> 
                  <span className="truncate max-w-[150px]">{profile.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* === MAIN CONTENT GRID === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            
            {/* --- LEFT COLUMN --- */}
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: profile.themeColor }}>
                  <User size={20} /> About Me
                </h3>
                {isEditing ? (
                  <textarea 
                    name="bio" 
                    rows="5" 
                    value={profile.bio} 
                    onChange={handleChange} 
                    placeholder="Write a short professional bio..." 
                    className="w-full p-3 rounded-lg border focus:ring-2 outline-none resize-none text-sm" 
                    style={{ '--tw-ring-color': profile.themeColor }}
                  ></textarea>
                ) : (
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line text-justify">{profile.bio || "No bio added yet."}</p>
                )}
              </div>

              <div className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white">
                <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2" style={{ color: profile.themeColor }}>
                  <Briefcase size={20} /> Teaching Info
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Subjects</label>
                    {isEditing ? (
                      <input name="preferredSubjects" value={profile.preferredSubjects} onChange={handleChange} className="w-full border p-2 rounded text-sm mt-1 focus:outline-none focus:border-blue-500" placeholder="e.g. Math, Physics" />
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.preferredSubjects ? profile.preferredSubjects.split(',').map((sub, i) => (
                          <span key={i} className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">{sub.trim()}</span>
                        )) : <span className="text-sm text-gray-500">Not set</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Classes</label>
                    {isEditing ? (
                      <input name="preferredClasses" value={profile.preferredClasses} onChange={handleChange} className="w-full border p-2 rounded text-sm mt-1 focus:outline-none focus:border-blue-500" placeholder="e.g. Class 9-10" />
                    ) : (
                      <p className="font-medium text-gray-800 mt-1">{profile.preferredClasses || "Not set"}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block">Expected Salary</label>
                        {isEditing ? (
                          <input name="expectedSalary" value={profile.expectedSalary} onChange={handleChange} className="w-full border p-1 rounded text-sm mt-1" placeholder="5000" />
                        ) : (
                          <div className="flex items-center gap-1 mt-1 font-bold text-gray-800">
                             <DollarSign size={14} className="text-green-600" /> {profile.expectedSalary || "Negotiable"}
                          </div>
                        )}
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block">Availability</label>
                        {isEditing ? (
                          <input name="availability" value={profile.availability} onChange={handleChange} className="w-full border p-1 rounded text-sm mt-1" placeholder="3 days/week" />
                        ) : (
                          <div className="flex items-center gap-1 mt-1 font-medium text-gray-800">
                             <Clock size={14} className="text-blue-600" /> {profile.availability || "N/A"}
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: profile.themeColor }}>
                  <GraduationCap size={24} /> Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition bg-gray-50/50">
                     <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Institution</label>
                     {isEditing ? <input name="institution" value={profile.institution} onChange={handleChange} placeholder="University Name" className="w-full p-2 bg-white border rounded focus:outline-none" /> : <p className="font-bold text-lg text-gray-800">{profile.institution || "---"}</p>}
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition bg-gray-50/50">
                     <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Department</label>
                     {isEditing ? <input name="department" value={profile.department} onChange={handleChange} placeholder="Subject Name" className="w-full p-2 bg-white border rounded focus:outline-none" /> : <p className="font-bold text-lg text-gray-800">{profile.department || "---"}</p>}
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition bg-gray-50/50">
                     <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Year / Semester</label>
                     {isEditing ? <input name="year" value={profile.year} onChange={handleChange} placeholder="e.g. 4th Year" className="w-full p-2 bg-white border rounded focus:outline-none" /> : <p className="text-gray-700 font-medium">{profile.year || "---"}</p>}
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition bg-gray-50/50">
                     <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Result / CGPA</label>
                     {isEditing ? <input name="result" value={profile.result} onChange={handleChange} placeholder="e.g. 3.75" className="w-full p-2 bg-white border rounded focus:outline-none" /> : <p className="text-gray-700 font-medium">{profile.result || "---"}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2 border-b pb-2" style={{ color: profile.themeColor }}>
                  <BookOpen size={24} /> Experience & Skills
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="font-bold text-gray-700 block mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span> Teaching Experience
                    </label>
                    {isEditing ? (
                      <textarea name="experience" rows="3" value={profile.experience} onChange={handleChange} placeholder="Describe your past tutoring experience..." className="w-full border p-3 rounded-lg text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': profile.themeColor }}></textarea>
                    ) : (
                      <div className="bg-blue-50/50 p-4 rounded-lg border-l-4" style={{ borderColor: profile.themeColor }}>
                        <p className="text-gray-700 text-sm leading-relaxed">{profile.experience || "No experience details added."}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span> Teaching Methodology
                    </label>
                    {isEditing ? (
                      <textarea name="methodology" rows="3" value={profile.methodology} onChange={handleChange} placeholder="How do you teach?..." className="w-full border p-3 rounded-lg text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': profile.themeColor }}></textarea>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                        <p className="text-gray-600 text-sm leading-relaxed">{profile.methodology || "No methodology described."}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;