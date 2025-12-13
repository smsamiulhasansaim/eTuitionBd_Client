import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Youtube, Linkedin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom X (Twitter) Logo Component
const XLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const Footer = () => {
  // --- 1. User Authentication Check ---
  // Using useMemo to read from localStorage once during render.
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  // --- 2. Determine Dashboard Link ---
  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case 'admin': return "/admin/dashboard";
      case 'tutor': return "/tutor-dashboard";
      default: return "/student-dashboard";
    }
  };

  // --- 3. Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-emerald-900">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- MAIN GRID --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          
          {/* COLUMN 1: About */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-900/50">
                e
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                eTuition<span className="text-emerald-500">BD</span>
              </h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Bangladesh’s most trusted online tuition platform connecting students with verified tutors. We ensure quality education at your doorstep.
            </p>
          </motion.div>

          {/* COLUMN 2: Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-emerald-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'All Tuitions', path: '/all-tuitions' },
                { name: 'Tutors', path: '/all-tutors' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact Us', path: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="group flex items-center hover:text-emerald-400 transition-colors duration-300">
                    <ChevronRight size={16} className="text-emerald-600 mr-2 transition-transform group-hover:translate-x-1" />
                    {item.name}
                  </Link>
                </li>
              ))}
              
              {/* Dynamic Dashboard Link */}
              {user && (
                 <li>
                  <Link to={getDashboardLink()} className="group flex items-center hover:text-emerald-400 transition-colors duration-300">
                    <ChevronRight size={16} className="text-emerald-600 mr-2 transition-transform group-hover:translate-x-1" />
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>

          {/* COLUMN 3: Contact Info */}
          <motion.div variants={itemVariants}>
             <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Contact Info
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-emerald-600 rounded-full"></span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-900/30 p-2 rounded-lg text-emerald-500 mt-1 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium">Address</h4>
                  <p className="text-sm text-gray-400">Rangpur, Bangladesh</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                 <div className="bg-emerald-900/30 p-2 rounded-lg text-emerald-500 mt-1 shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium">Phone</h4>
                  <a href="tel:+8801700000000" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    +880 1866969660
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="bg-emerald-900/30 p-2 rounded-lg text-emerald-500 mt-1 shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium">Email</h4>
                  <a href="mailto:support@etuitionbd.com" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    support@etuitionbd.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* COLUMN 4: Social Media */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Follow Us
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-emerald-600 rounded-full"></span>
            </h3>
            <p className="text-sm mb-6 text-gray-400">Join our social community for updates and news.</p>
            
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-gray-700 hover:border-transparent">
                <Facebook size={20} />
              </a>
              
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-gray-700 hover:border-transparent">
                <Youtube size={20} />
              </a>

              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-gray-700 hover:border-transparent group">
                <XLogo className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>

              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-gray-700 hover:border-transparent">
                <Linkedin size={20} />
              </a>
            </div>
          </motion.div>

        </motion.div>

        {/* --- COPYRIGHT --- */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} eTuitionBD. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2 md:mt-0 flex items-center gap-1">
            Developed by 
            <a 
              href="https://github.com/SamiulHasan1998" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-500 font-medium hover:underline hover:text-emerald-400 transition-colors"
            >
              S M Samiul Hasan
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;