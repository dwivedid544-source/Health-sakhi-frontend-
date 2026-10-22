import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Play, 
  CheckCircle2, 
  Star, 
  Users, 
  Share2, 
  Heart,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import { courseContent } from '../../data/academyData';
import { useLanguage } from '../../context/LanguageContext';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const course = courseContent[id] || courseContent[101]; // Fallback to 101

  const handleEnroll = () => {
    setIsEnrolled(true);
    // Future: API call to enroll
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-0">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#C4A0AC] hover:text-[#ff69b4] transition-colors font-bold text-xs uppercase tracking-widest mb-8"
      >
        <ArrowLeft size={18} /> {t('academy.backToAcademy', 'Back to Academy')}
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1.5 bg-[#ff69b4]/10 text-[#ff69b4] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#ff69b4]/20">
                {t('academy.courseLabel', 'Course')}
              </span>
              <span className="px-4 py-1.5 bg-rose-50 text-[#9b59b6] rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                {t('academy.wellnessLevelPrefix', 'Wellness Level')} 1
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-[#15192c] leading-tight">
              {t('courses.' + course.title, course.title)}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-[#C4A0AC]">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-[#15192c]">{course.rating}</span> ({course.reviews} {t('academy.reviews', 'reviews')})
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} /> 1.2k {t('academy.studentsEnrolled', 'Students Enrolled')}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} /> {course.syllabus.reduce((acc, curr) => acc + parseInt(curr.duration), 0)} {t('academy.minsTotal', 'mins total')}
              </div>
            </div>
          </div>

          <div className="relative aspect-video rounded-[3rem] overflow-hidden group shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200" 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#ff69b4] shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                <Play size={32} className="ml-1" />
              </motion.button>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
               <span className="text-xs font-black uppercase tracking-widest">{t('academy.watchTrailer', 'Watch Intro Trailer')}</span>
               <Share2 size={20} className="cursor-pointer hover:text-[#ff69b4] transition-all" />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black text-[#15192c]">{t('academy.aboutCourse', 'About this course')}</h3>
            <p className="text-lg font-medium text-[#9A8A8E] leading-relaxed">
              {t('courses.' + course.description, course.description)}
            </p>
            <p className="text-base text-[#9A8A8E] leading-relaxed opacity-80">
              {t('courses.' + course.longDescription, course.longDescription)}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black text-[#15192c]">{t('academy.curriculum', 'Course Curriculum')}</h3>
            <div className="space-y-3">
              {course.syllabus.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-6 bg-white border border-rose-100 rounded-3xl hover:border-[#ff69b4] transition-all group cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4] font-black text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-[#15192c] group-hover:text-[#ff69b4] transition-colors">
                        {t('curriculum.' + item.title, item.title)}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{item.duration}</p>
                    </div>
                  </div>
                  {isEnrolled ? (
                    <Play size={18} className="text-[#ff69b4]" />
                  ) : (
                    <Lock size={18} className="text-[#C4A0AC]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96">
          <div className="sticky top-40 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 border border-rose-100 shadow-xl shadow-rose-100/20 space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4A0AC]">{t('academy.enrollmentFee', 'Enrollment Fee')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#15192c]">{t('academy.freePrice', 'Free')}</span>
                  <span className="text-sm font-medium text-[#C4A0AC] line-through">₹2,999</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-[#15192c]">
                  <CheckCircle2 size={18} className="text-green-500" /> {t('academy.lifetimeAccess', 'Lifetime Access')}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-[#15192c]">
                  <CheckCircle2 size={18} className="text-green-500" /> {t('academy.certCompletion', 'Certificate of Completion')}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-[#15192c]">
                  <CheckCircle2 size={18} className="text-green-500" /> {t('academy.expertQa', 'Expert Q&A Access')}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-[#15192c]">
                  <CheckCircle2 size={18} className="text-green-500" /> {t('academy.downloadableResources', 'Downloadable Resources')}
                </div>
              </div>

              {!isEnrolled ? (
                <button 
                  onClick={handleEnroll}
                  className="w-full py-5 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-100 hover:scale-105 transition-all"
                >
                  {t('academy.enrollNow', 'Enroll Now')}
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/academy/my-courses')}
                  className="w-full py-5 bg-[#15192c] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all"
                >
                  {t('academy.goToMyCourses', 'Go to My Courses')}
                </button>
              )}

              <p className="text-[10px] text-center font-bold text-[#C4A0AC] uppercase tracking-widest">
                {t('academy.trustedBy', 'Trusted by 5,000+ Wellness Learners')}
              </p>
            </div>

            <div className="bg-[#15192c] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff69b4]/20 rounded-full blur-2xl" />
              <h4 className="text-lg font-black mb-4 relative z-10">{t('academy.meetInstructor', 'Meet your Instructor')}</h4>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20">
                  <img src="https://ui-avatars.com/api/?name=Ananya+Rao&background=ff69b4&color=fff&bold=true" alt="Instructor" />
                </div>
                <div>
                  <p className="font-bold">{course.instructor}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('academy.wellnessSpecialist', 'Wellness Specialist')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
