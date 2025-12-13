import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Zap, Eye, Headphones, Users } from 'lucide-react';
const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      title: "Verified Tutors",
      description: "All tutors are background-checked and verified to ensure safety and quality education.",
      icon: <ShieldCheck size={28} />,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      id: 2,
      title: "Secure Payment",
      description: "100% safe payment via Stripe. Pay securely only after you have hired your preferred tutor.",
      icon: <CreditCard size={28} />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 3,
      title: "Fast Hiring",
      description: "Get tutor applications within hours of posting. Save time with our quick matching system.",
      icon: <Zap size={28} />,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: 4,
      title: "Transparent Process",
      description: "No hidden fees. You have full control over hiring, negotiation, and payment terms.",
      icon: <Eye size={28} />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: 5,
      title: "24/7 Support",
      description: "Our dedicated support team is always here to help you with any queries or issues.",
      icon: <Headphones size={28} />,
      color: "bg-pink-100 text-pink-600"
    },
    {
      id: 6,
      title: "Trusted by Thousands",
      description: "Join 10,000+ students and parents who found their perfect tutor through eTuitionBD.",
      icon: <Users size={28} />,
      color: "bg-teal-100 text-teal-600"
    }
  ];

  // --- 12. FRAMER MOTION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    // --- 11. LIGHT BACKGROUND ---
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- 1. SECTION TITLE --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose <span className="text-emerald-600">eTuitionBD?</span>
          </h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            We provide a safe, secure, and efficient platform to connect students with the best tutors in Bangladesh.
          </p>
        </div>

        {/* --- 10. GRID LAYOUT --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              variants={cardVariants}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2 group"
            >
              {/* --- 3. ICON (LARGE & COLORFUL) --- */}
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${feature.color} transition-transform group-hover:scale-110`}>
                {feature.icon}
              </div>

              {/* --- 3. TITLE & DESCRIPTION --- */}
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default WhyChooseUs;