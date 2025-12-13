import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  BookOpen, Calendar, Clock, CheckCircle, 
  Edit3, Save, Smile, Star, Heart, Coffee 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

const OngoingTuitions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local UI State ---
  // We only keep state for the Note Modal as it requires user input
  const [noteModal, setNoteModal] = useState({ isOpen: false, tuitionId: null, note: '' });

  // --- 1. User Authentication Check ---
  const user = useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return null;
    }
    return JSON.parse(userStr);
  }, [navigate]);

  // --- 2. Data Fetching (TanStack Query) ---
  const { 
    data: tuitions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['ongoingTuitions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await axios.get(`${API_URL}/api/ongoing-tuitions/student/ongoing?studentEmail=${user.email}`);
      
      // Map API response to handle 'studentNote' consistency
      return response.data.data.map(t => ({
        ...t, 
        myNote: t.studentNote || '' 
      }));
    },
    enabled: !!user?.email,
  });

  // --- 3. Mutation: Save Note ---
  const saveNoteMutation = useMutation({
    mutationFn: async ({ id, note }) => {
      await axios.patch(`${API_URL}/api/ongoing-tuitions/${id}/student-note`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ongoingTuitions']);
      setNoteModal({ isOpen: false, tuitionId: null, note: '' });
      
      Swal.fire({
        icon: 'success',
        title: 'Note Saved',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    },
    onError: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to save note.', 'error');
    }
  });

  // --- 4. Mutation: Complete Tuition ---
  const completeMutation = useMutation({
    mutationFn: async (id) => {
      await axios.put(`${API_URL}/api/ongoing-tuitions/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ongoingTuitions']);
      Swal.fire({
        title: 'Course Completed! 🎉',
        text: 'Great job on finishing this tuition!',
        icon: 'success',
        confirmButtonColor: '#10B981'
      });
    },
    onError: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  });

  // --- 5. Handlers ---
  
  const handleCompleteClick = (id, subject) => {
    Swal.fire({
      title: 'All Done?',
      text: `Mark "${subject}" as finished?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Completed! 🎓',
      cancelButtonText: 'Not yet'
    }).then((result) => {
      if (result.isConfirmed) {
        completeMutation.mutate(id);
      }
    });
  };

  const openNoteModal = (tuition) => {
    setNoteModal({
      isOpen: true,
      tuitionId: tuition._id,
      note: tuition.myNote || ''
    });
  };

  const handleSaveNote = () => {
    if (noteModal.tuitionId) {
      saveNoteMutation.mutate({ 
        id: noteModal.tuitionId, 
        note: noteModal.note 
      });
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
    <div className="min-h-screen bg-[#FFF8F0] py-12 px-4 font-sans pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <h1 className="relative text-4xl md:text-6xl font-black text-gray-800 mb-4 tracking-tight">
            My Study <span className="text-orange-500 inline-block transform rotate-2">Zone</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
            Keep track of your learning journey & daily notes! 🌟
          </p>
          
          <div className="mt-8 inline-flex items-center bg-white px-6 py-3 rounded-full shadow-lg border-2 border-orange-100 transform hover:scale-105 transition-transform cursor-default">
            <Heart className="w-6 h-6 text-pink-500 mr-2 fill-current" />
            <span className="text-gray-700 font-bold text-lg">
              {tuitions.length} Active Classes
            </span>
          </div>
        </div>

        {/* Content Area */}
        {tuitions.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-[2rem] p-10 text-center shadow-xl border-4 border-dashed border-gray-200">
            <Coffee className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Classes Yet!</h3>
            <p className="text-gray-500 mb-8">Time to start learning something new?</p>
            <button
              onClick={() => navigate('/all-tuitions')}
              className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:bg-orange-600 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              Find a Tutor 🚀
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tuitions.map((tuition, index) => (
              <div
                key={tuition._id}
                className="group relative bg-white rounded-[2rem] shadow-lg border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Class Badge */}
                <div className={`absolute top-5 right-5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border tracking-wide uppercase ${
                  index % 2 === 0 
                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                    : 'bg-pink-50 text-pink-600 border-pink-100'
                }`}>
                  {tuition.class ? tuition.class : 'General'}
                </div>

                {/* Card Header */}
                <div className="p-8 pb-4 pt-10"> 
                  <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm font-bold mb-3">
                    {tuition.subject || 'Tuition'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-1">
                    {tuition.tutorName}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">Your Instructor</p>
                </div>

                {/* Info Pills */}
                <div className="px-8 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {tuition.daysPerWeek || 3} Days/Week
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      Since: {new Date(tuition.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Fee Display */}
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl border border-green-100">
                    <span className="text-green-700 font-medium text-sm">Monthly Fee</span>
                    <span className="text-green-800 font-black text-xl">৳ {tuition.amount}</span>
                  </div>
                </div>

                {/* Note Preview Section */}
                <div className="px-8 py-4 flex-grow">
                  <div 
                    onClick={() => openNoteModal(tuition)}
                    className="cursor-pointer bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-100 rounded-2xl p-4 transition-colors relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-800 font-bold text-sm flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-500 text-yellow-500" />
                        Class Diary
                      </span>
                      <Edit3 className="w-4 h-4 text-yellow-600" />
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {tuition.myNote ? tuition.myNote : "Tap to add notes about your progress..."}
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 pt-0 mt-auto">
                  <button
                    onClick={() => handleCompleteClick(tuition._id, tuition.subject)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-gray-200"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Course</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NOTE MODAL (Kept custom design as per original UI) */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 transform scale-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-800">Class Diary</h3>
                <p className="text-gray-500 text-sm">Private notes for this course</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>

            <textarea
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              placeholder="Write your homework, important dates, or learning goals here..."
              className="w-full h-48 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none resize-none text-gray-700 leading-relaxed mb-6"
            ></textarea>

            <div className="flex space-x-3">
              <button
                onClick={() => setNoteModal({ isOpen: false, tuitionId: null, note: '' })}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSaveNote}
                disabled={saveNoteMutation.isPending}
                className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saveNoteMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OngoingTuitions;