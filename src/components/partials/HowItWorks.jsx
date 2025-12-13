import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, ShieldCheck, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  // --- 1. User Authentication Check ---
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  // --- 2. Determine Dashboard Route ---
  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case 'admin': return "/admin/dashboard";
      case 'tutor': return "/tutor-dashboard";
      default: return "/student-dashboard";
    }
  };

  // --- 3. Step Configuration ---
  const steps = [
    {
      id: 1,
      title: "Post a Tuition Job",
      description: "Create a tuition post with subject, class, location & budget. It's completely free to post!",
      icon: <FileText size={32} />,
      badge: "Step 01"
    },
    {
      id: 2,
      title: "Receive Applications",
      description: "Verified tutors apply with their qualifications & expected salary. Compare profiles easily.",
      icon: <Users size={32} />,
      badge: "Step 02"
    },
    {
      id: 3,
      title: "Hire & Pay Securely",
      description: "Review applications, select the best tutor, hire instantly & pay securely via Stripe.",
      icon: <ShieldCheck size={32} />,
      badge: "Step 03"
    }
  ];

  // --- 4. Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="py-24 bg-emerald-50/50"> 
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- SECTION TITLE --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How eTuition<span className="text-emerald-600">BD</span> Works
          </h2>
          <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 text-lg">
            Get started with your perfect tutor in 3 easy steps
          </p>
        </div>

        {/* --- STEPS GRID --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={step.id} 
              variants={itemVariants}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector Arrow (Desktop Only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-8 z-0">
                  <ArrowRight className="text-emerald-200 w-full h-full opacity-50 transform translate-x-8" />
                </div>
              )}

              {/* Step Icon */}
              <div className="relative z-10 mb-6 transition-transform duration-300 group-hover:scale-110">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-100 text-emerald-600 group-hover:border-emerald-500 group-hover:text-emerald-700 transition-colors">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white">
                  {step.badge}
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* --- CALL TO ACTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          {user ? (
            // Logged In View
            <>
              <p className="text-gray-600 mb-4 font-medium">
                Welcome back, <span className="text-emerald-600 font-bold">{user.name}</span>! Ready to continue?
              </p>
              <Link 
                to={getDashboardLink()} 
                className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <LayoutDashboard size={18} /> Go to Dashboard
              </Link>
            </>
          ) : (
            // Guest View
            <>
              <p className="text-gray-600 mb-4">Ready to find the best tutor?</p>
              <Link 
                to="/register" 
                className="inline-block px-8 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200 transition-all transform hover:-translate-y-1"
              >
                Get Started Now
              </Link>
            </>
          )}
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;