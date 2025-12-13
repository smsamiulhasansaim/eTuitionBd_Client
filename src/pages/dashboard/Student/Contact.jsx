import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Loader2, Facebook, Youtube, Linkedin } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Custom X Logo Component (Matches Footer)
const XLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const Contact = () => {
  // State for Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // State for Loading Spinner
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Backend API Call (2 Seconds delay)
    setTimeout(() => {
      // Success Action
      toast.success("Thank you! We'll get back to you soon.", {
        duration: 4000,
        position: 'top-center',
        style: { background: '#10B981', color: '#fff' },
      });
      
      // Clear Form
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      {/* Toast Container for Notifications */}
      <Toaster />

      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- Page Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Get in <span className="text-emerald-600">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about finding a tutor or becoming one? We are here to help you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* --- LEFT COLUMN: Contact Info & Map --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  <MapPin size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Our Office</h3>
                <p className="text-gray-500 text-sm mt-2">Dhaka, Bangladesh</p>
              </div>

              {/* Phone */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Phone</h3>
                <p className="text-gray-500 text-sm mt-2">+880 17xx-xxxxxx</p>
              </div>

              {/* Email */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Email</h3>
                <p className="text-gray-500 text-sm mt-2">support@etuitionbd.com</p>
              </div>

              {/* Working Hours */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Working Hours</h3>
                <p className="text-gray-500 text-sm mt-2">Sat - Thu: 9AM - 8PM</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
              <div className="flex gap-4">
                 <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition-all">
                   <Facebook size={20} />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#FF0000] hover:text-white transition-all">
                   <Youtube size={20} />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all group">
                   <XLogo className="w-5 h-5" />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0077B5] hover:text-white transition-all">
                   <Linkedin size={20} />
                 </a>
              </div>
            </div>

            {/* Google Map (Bonus) */}
            <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 h-64">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233667.8223924372!2d90.27923775747219!3d23.780887456211758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1716301234567!5m2!1sen!2sbd" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
              ></iframe>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: Contact Form --- */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all 
                  ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} /> Send Message
                  </>
                )}
              </button>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;