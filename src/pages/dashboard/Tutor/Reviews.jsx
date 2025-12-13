import React from 'react';
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  MoreVertical, 
  User 
} from 'lucide-react';

const Reviews = () => {
  // ১. ডামি ডাটা - রিভিউ লিস্ট
  const reviews = [
    {
      id: 1,
      studentName: 'Arafat Rahman',
      studentImage: 'https://via.placeholder.com/150',
      subject: 'Higher Math',
      rating: 5,
      date: '12 Dec, 2025',
      comment: 'স্যার খুব যত্ন সহকারে পড়ান। বিশেষ করে জ্যামিতির পার্টগুলো খুব সহজে বুঝিয়ে দিয়েছেন।',
      likes: 12
    },
    {
      id: 2,
      studentName: 'Nusrat Jahan',
      studentImage: 'https://via.placeholder.com/150',
      subject: 'English Spoken',
      rating: 4,
      date: '10 Nov, 2025',
      comment: 'খুব ভালো টিউটর। তবে সময়ানুবর্তীতার দিকে আরেকটু নজর দিলে ভালো হয়।',
      likes: 5
    },
    {
      id: 3,
      studentName: 'Karim Ullah',
      studentImage: null, // ছবি না থাকলে ডিফল্ট আইকন দেখাবে
      subject: 'Class 8 General Science',
      rating: 5,
      date: '05 Oct, 2025',
      comment: 'আমার ছেলের রেজাল্ট স্যারের কাছে পড়ার পর অনেক ভালো হয়েছে। ধন্যবাদ!',
      likes: 8
    }
  ];

  // ২. রেটিং স্ট্যাটিস্টিকস
  const ratingStats = {
    average: 4.8,
    total: 15,
    breakdown: [
      { stars: 5, count: 12, percent: 80 },
      { stars: 4, count: 2, percent: 13 },
      { stars: 3, count: 1, percent: 7 },
      { stars: 2, count: 0, percent: 0 },
      { stars: 1, count: 0, percent: 0 },
    ]
  };

  // স্টার রেন্ডারিং হেল্পার ফাংশন
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
      />
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* --- হেডার --- */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h1>
        <p className="text-sm text-gray-500 mt-1">
          আপনার স্টুডেন্ট এবং অভিভাবকদের দেওয়া মতামতগুলো এখানে দেখুন।
        </p>
      </div>

      {/* --- ওভারভিউ সেকশন (রেটিং সামারি) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ১. এভারেজ রেটিং কার্ড */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h2 className="text-5xl font-bold text-gray-800">{ratingStats.average}</h2>
          <div className="flex gap-1 my-3">
             {renderStars(5)} {/* ৫ স্টার ফিক্সড দেখাচ্ছে জাস্ট ডিজাইনের জন্য */}
          </div>
          <p className="text-gray-500 font-medium">Based on {ratingStats.total} Reviews</p>
        </div>

        {/* ২. রেটিং ব্রেকডাউন (প্রোগ্রেস বার) */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="font-bold text-gray-800 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {ratingStats.breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-12 flex items-center gap-1">
                  {item.stars} <Star size={12} className="text-gray-400" />
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- রিভিউ লিস্ট সেকশন --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Reviews ({reviews.length})</h3>
          <select className="text-sm border-gray-200 rounded-lg focus:ring-emerald-500 border p-2 bg-gray-50">
            <option>Newest First</option>
            <option>Highest Rated</option>
            <option>Lowest Rated</option>
          </select>
        </div>

        <div className="divide-y divide-gray-50">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start">
                  
                  <div className="flex gap-4">
                    {/* স্টুডেন্ট ইমেজ বা আইকন */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.studentImage ? (
                        <img src={review.studentImage} alt={review.studentName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-gray-400" size={24} />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800">{review.studentName}</h4>
                      <p className="text-xs text-emerald-600 font-medium mb-1">{review.subject}</p>
                      
                      {/* স্টার এবং ডেট */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>

                      {/* কমেন্ট বডি */}
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 inline-block max-w-2xl">
                        "{review.comment}"
                      </p>

                      {/* অ্যাকশন বাটনস */}
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-emerald-600 transition-colors">
                          <ThumbsUp size={14} /> Helpful ({review.likes})
                        </button>
                        <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
                          <MessageCircle size={14} /> Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* অপশন মেনু */}
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews found yet.</p>
            </div>
          )}
        </div>
        
        {/* লোড মোর বাটন (অপশনাল) */}
        <div className="p-4 border-t border-gray-50 text-center">
          <button className="text-sm font-medium text-emerald-600 hover:underline">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;