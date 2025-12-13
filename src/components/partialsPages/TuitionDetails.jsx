import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { 
  MapPin, Banknote, Calendar, User, Clock, CheckCircle, 
  GraduationCap, Edit, Trash2, Layers, AlertCircle, Share2, Info
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../common/Loading';
import ServerDown from '../../pages/common/ServerDown';


// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const TuitionDetails = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. User Context ---
  const currentUser = useMemo(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: tuition, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['tuitionDetails', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await axios.get(`${API_URL}/api/tuitions/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
    retry: 1
  });

  // --- 3. Mutation: Delete Tuition ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/api/tuitions/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['browseTuitions']);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The tuition post has been removed successfully.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/all-tuitions');
      });
    },
    onError: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to delete the post.', 'error');
    }
  });

  // --- 4. Handlers ---
  const handleDelete = () => {
    if (!tuition?._id) return;

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
        deleteMutation.mutate(tuition._id);
      }
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      icon: 'success',
      title: 'Link Copied!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500
    });
  };

  // --- 5. Render Logic ---
  
  if (isLoading) return <Loading />;
  
  if (isError) {
    if (error.response?.status === 404) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center pt-24 text-center px-4 bg-gray-50">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Oops! Tuition Not Found</h2>
            <p className="text-gray-500 mt-2">The post you are looking for might have been removed or does not exist.</p>
            <button onClick={() => navigate('/all-tuitions')} className="mt-6 px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium">
                Browse All Tuitions
            </button>
        </div>
      );
    }
    return <ServerDown />;
  }

  if (!tuition) return null; // Should be handled by loading/error states but acts as a safeguard

  // Check Ownership
  const isOwner = currentUser?.email === tuition.studentEmail; 
  const postedDate = new Date(tuition.createdAt).toLocaleDateString("en-US", {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-32 pb-12 px-4 md:px-8">
      <div className="container mx-auto max-w-5xl">
        
        {/* --- HEADER SECTION --- */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {tuition.subject} Tutor Needed
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-500 text-sm md:text-base font-medium">
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                  <GraduationCap size={16}/> {tuition.class}
                </span>
                <span className="hidden md:inline text-gray-300">•</span>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  <Layers size={16}/> {tuition.medium}
                </span>
                <span className="hidden md:inline text-gray-300">•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin size={16} className="text-red-500"/> {tuition.location}
                </span>
              </div>
            </div>
            
            {/* Action & Status Badges */}
            <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare} 
                  className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors shadow-sm" 
                  title="Copy Link"
                >
                    <Share2 size={18} />
                </button>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    tuition.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    tuition.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                    'bg-red-50 text-red-600 border-red-100'
                }`}>
                    {tuition.status}
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: DETAILS --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Info Grid */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0"><Banknote size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Salary</p>
                    <p className="font-bold text-gray-800 text-lg">৳ {tuition.salary} / month</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0"><Calendar size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Weekly Days</p>
                    <p className="font-bold text-gray-800 text-lg">{tuition.daysPerWeek}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shrink-0"><User size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Preferred Tutor</p>
                    <p className="font-bold text-gray-800 text-lg">{tuition.genderPreference}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shrink-0"><Clock size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Preferred Time</p>
                    <p className="font-bold text-gray-800 text-lg">{tuition.time || "Negotiable"}</p>
                  </div>
                </div>

              </div>

              {/* Requirements */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-emerald-500"/> Requirements & Details
                </h3>
                <div className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100 whitespace-pre-line">
                  {tuition.requirements || "No specific requirements mentioned. Please apply to discuss further."}
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Posted By Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
              
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Posted By</h3>
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl font-bold mb-3 border-4 border-white shadow-sm ring-1 ring-gray-100">
                {tuition.studentName?.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-gray-800 truncate px-2">
                {tuition.studentName}
              </h3>
              <div className="flex justify-center items-center gap-2 text-gray-400 text-xs mt-2 font-medium bg-gray-50 py-1 px-3 rounded-full inline-block mx-auto">
                <Clock size={12} /> Posted on {postedDate}
              </div>
            </div>

            {/* --- ACTION & INFO SECTION --- */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-28">
              
              {/* Important Note (Bilingual Support) */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold">
                    <Info size={20} /> 
                    <span>গুরুত্বপূর্ণ নোট</span>
                </div>
                <div className="text-sm text-gray-700 space-y-3 font-medium">
                    <p className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                        <span>
                            <span className="font-bold text-gray-900">শিক্ষক:</span> আবেদনের জন্য আপনার <Link to="/tutor-dashboard" className="text-blue-600 hover:underline font-bold">ড্যাশবোর্ড</Link> ব্যবহার করুন।
                        </span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                        <span>
                            <span className="font-bold text-gray-900">শিক্ষার্থী:</span> নতুন পোস্ট করতে <Link to="/post-tuition" className="text-emerald-600 hover:underline font-bold">এখানে ক্লিক করুন</Link>।
                        </span>
                    </p>
                </div>
              </div>

              {/* Owner Actions (Visible only to the creator) */}
              {isOwner && (
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg text-center mb-2 font-bold border border-emerald-100 flex items-center justify-center gap-2">
                     <CheckCircle size={14}/> This is your post
                  </div>
                  
                  {/* Edit (Placeholder functionality) */}
                  <button 
                    onClick={() => Swal.fire('Coming Soon', 'Edit functionality is under development.', 'info')}
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2 transition-colors hover:border-gray-300"
                  >
                    <Edit size={18} /> Edit Post
                  </button>
                  
                  {/* Delete */}
                  <button 
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="w-full py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 flex justify-center items-center gap-2 transition-colors border border-red-100 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : <><Trash2 size={18} /> Delete Post</>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TuitionDetails;