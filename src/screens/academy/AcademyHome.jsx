import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ChevronRight, 
  Trophy, 
  BookOpen, 
  Clock, 
  Star,
  ShieldCheck,
  Zap,
  Award,
  Users
} from 'lucide-react';
import { academyLevels } from '../../data/academyData';
import { useLanguage } from '../../context/LanguageContext';

const AcademyHome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] p-8 md:p-12 text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #ff69b4 0%, #7C3AED 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
              <Award size={14} /> {t('academy.certificationTitle', 'HealthSakhi Certification')}
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              {t('academy.elevateYour', 'Elevate Your')} <br />
              <span className="text-rose-200">{t('academy.wellnessJourney', 'Wellness Journey')}</span>
            </h1>
            <p className="text-lg font-medium text-white/80 max-w-xl">
              {t('academy.heroDesc', 'Follow our structured learning path to become a certified wellness expert. From basic awareness to professional training.')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <button 
                onClick={() => navigate('/academy/my-courses')}
                className="px-8 py-4 bg-white text-[#7C3AED] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-transform"
              >
                {t('academy.learningPath', 'My Learning Path')}
              </button>
            </div>
          </div>
          <div className="hidden lg:block shrink-0">
             <div className="w-64 h-64 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 flex items-center justify-center relative rotate-3">
                <GraduationCap size={120} className="text-white drop-shadow-2xl" />
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#ff69b4]"
                >
                  <Trophy size={32} />
                </motion.div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Levels Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {academyLevels.map((level) => (
          <motion.div
            key={level.id}
            variants={itemVariants}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-rose-100 hover:shadow-xl transition-all overflow-hidden"
          >
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl -mr-16 -mt-16"
              style={{ background: level.color }}
            />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                  style={{ background: `${level.color}15` }}
                >
                  <GraduationCap size={32} style={{ color: level.color }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
                  {t('academy.levelPrefix', 'Level')} 0{level.id}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#15192c] mb-2">
                  {t('courses.' + level.title, level.title)}
                </h3>
                <p className="text-sm font-medium text-[#9A8A8E] leading-relaxed">
                  {t('courses.' + level.description, level.description)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('academy.availableCourses', 'Available Courses')}</p>
                <div className="grid grid-cols-1 gap-3">
                  {level.courses.map((course) => (
                    <div 
                      key={course.id}
                      onClick={() => navigate(`/academy/course/${course.id}`)}
                      className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100 hover:border-[#ff69b4] cursor-pointer transition-all group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#ff69b4] shadow-sm">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#15192c] group-hover/item:text-[#ff69b4] transition-colors">
                            {t('courses.' + course.title, course.title)}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-[#C4A0AC] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
                            <span className="flex items-center gap-1"><Star size={10} /> {course.lessons} {t('academy.lessons', 'Lessons')}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#C4A0AC] group-hover/item:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="w-full py-4 rounded-2xl border-2 border-rose-100 text-[#15192c] font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                style={{ borderColor: `${level.color}30` }}
              >
                {t('academy.enrollInLevel', 'Enroll in Level')} {level.id} <Zap size={14} style={{ color: level.color }} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-[#15192c] rounded-[3rem] p-10 md:p-16 text-white text-center space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff69b4]/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            {t('academy.joinChampions', 'Join Thousands of Wellness Champions')}
          </h2>
          <p className="text-white/60 font-medium">
            {t('academy.academyDesc', "HealthSakhi Academy is more than just courses. It's a community of women dedicated to health literacy and professional growth.")}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: t('academy.statLabelEnrolled', 'Enrolled Students'), value: '12,000+', icon: Users },
            { label: t('academy.statLabelCertified', 'Certified Experts'), value: '1,500+', icon: ShieldCheck },
            { label: t('academy.statLabelAvailable', 'Courses Available'), value: '45+', icon: BookOpen },
            { label: t('academy.statLabelRating', 'Avg. Rating'), value: '4.9/5', icon: Star },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-[#ff69b4]">
                <stat.icon size={24} />
              </div>
              <p className="text-2xl md:text-4xl font-black">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AcademyHome;
