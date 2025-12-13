import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Users, MapPin, Calendar, BookOpen, 
  MessageCircle, Edit3, Save, 
  CheckCircle, DollarSign, X 
} from 'lucide-react';

// --- Custom Components ---
import Loading from '../../../components/common/Loading';
import ServerDown from '../../common/ServerDown';
import Unauthorized from '../../common/Unauthorized';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL;

export default function TutorOngoingTuitions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local UI State ---
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tutorNoteInput, setTutorNoteInput] = useState('');

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
    data: students = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['tutorStudents', user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await axios.get(`${API_URL}/api/ongoing-tuitions/tutor/students?tutorId=${user._id}`);
      return response.data.data;
    },
    enabled: !!user?._id, // Only run if user ID exists
  });

  // --- 3. Mutation: Save Tutor Note ---
  const saveNoteMutation = useMutation({
    mutationFn: async ({ id, note }) => {
      await axios.patch(`${API_URL}/api/ongoing-tuitions/${id}/tutor-note`, { note });
    },
    onSuccess: () => {
      // Refresh the list to show updated note
      queryClient.invalidateQueries(['tutorStudents']);
      
      // Close modal
      setShowNoteModal(false);
      
      // Show Toast
      Swal.fire({
        icon: 'success',
        title: 'Feedback Saved',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    },
    onError: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to save note. Please try again.', 'error');
    }
  });

  // --- 4. Handlers ---
  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setTutorNoteInput(student.tutorNote || '');
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (!selectedStudent) return;
    saveNoteMutation.mutate({ 
      id: selectedStudent._id, 
      note: tutorNoteInput 
    });
  };

  const formatStatus = (status) => {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // --- 5. Conditional Rendering ---
  if (isLoading) return <Loading />;

  if (isError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return <Unauthorized />;
    return <ServerDown />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8 pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header --- */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Classroom</h1>
            <p className="text-gray-500 mt-1">Manage your active students & feedback</p>
          </div>
          <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 animate-fade-in-up">
            <Users className="text-emerald-600 w-5 h-5" />
            <span className="font-bold text-gray-700">{students.length} Active Students</span>
          </div>
        </div>

        {/* --- Student List Grid --- */}
        {students.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm"
          >
            <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl text-gray-600 font-semibold">No active students found</h3>
            <p className="text-gray-400 mt-2">When students hire you and pay, they will appear here.</p>
            <button 
                onClick={() => queryClient.invalidateQueries(['tutorStudents'])} 
                className="mt-6 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
            >
                Refresh List
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {students.map((student) => (
                <motion.div 
                  key={student._id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {student.studentName || student.studentEmail?.split('@')[0]}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                         <BookOpen size={14} className="text-emerald-500"/>
                         <span>{student.subject} ({student.class})</span>
                      </div>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-100">
                      {formatStatus(student.status)}
                    </div>
                  </div>

                  {/* Details Pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm flex items-center gap-1 border border-gray-100">
                      <MapPin size={14}/> {student.location || 'Online'}
                    </span>
                    <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm flex items-center gap-1 border border-gray-100">
                      <Calendar size={14}/> {student.daysPerWeek || '3'} Days/Week
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm flex items-center gap-1 font-semibold border border-blue-100">
                      <DollarSign size={14}/> Paid: ৳{student.amount}
                    </span>
                  </div>

                  {/* Communication Section */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MessageCircle size={16} className="text-purple-500"/> Communication Hub
                      </h4>
                      <button 
                        onClick={() => handleOpenModal(student)}
                        className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-full hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors flex items-center gap-1 font-medium shadow-sm"
                      >
                        <Edit3 size={12}/> View & Reply
                      </button>
                    </div>

                    {/* Preview of Notes */}
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2 items-start">
                          <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 border border-yellow-200">STUDENT</span>
                          <p className="text-gray-500 line-clamp-1 italic">
                            "{student.studentNote || 'No notes shared yet...'}"
                          </p>
                      </div>
                      <div className="flex gap-2 items-start">
                          <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 border border-purple-200">YOU</span>
                          <p className="text-gray-600 line-clamp-1 font-medium">
                            {student.tutorNote ? `"${student.tutorNote}"` : "Click 'View & Reply' to add feedback..."}
                          </p>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- FEEDBACK MODAL --- */}
      <AnimatePresence>
        {showNoteModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            {/* Backdrop Click to Close */}
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0"
               onClick={() => setShowNoteModal(false)}
            />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative z-10"
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Feedback & Notes</h3>
                  <p className="text-sm text-gray-500">For <span className="font-semibold text-emerald-600">{selectedStudent.studentName}</span></p>
                </div>
                <button 
                  onClick={() => setShowNoteModal(false)} 
                  className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition shadow-sm"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* Student's Note (Read Only) */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Student's Diary / Note
                </label>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-gray-700 text-sm italic min-h-[60px] max-h-[150px] overflow-y-auto">
                  {selectedStudent.studentNote || "No notes shared by student yet."}
                </div>
              </div>

              {/* Tutor's Feedback (Editable) */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1">
                  Your Feedback <Edit3 size={12}/>
                </label>
                <textarea
                  value={tutorNoteInput}
                  onChange={(e) => setTutorNoteInput(e.target.value)}
                  placeholder="Write feedback, homework, or instructions for the student..."
                  className="w-full h-32 p-4 bg-purple-50 rounded-xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none resize-none text-gray-800 text-sm transition-all"
                ></textarea>
              </div>

              <button
                onClick={handleSaveNote}
                disabled={saveNoteMutation.isPending}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saveNoteMutation.isPending ? (
                   <>Saving...</>
                ) : (
                   <> <Save size={18} /> Save Feedback </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}