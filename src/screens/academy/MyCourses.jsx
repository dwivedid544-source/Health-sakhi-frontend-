import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Award, 
  Clock, 
  ChevronRight, 
  Trophy,
  ArrowRight,
  BookOpen,
  PlusCircle
} from 'lucide-react';
import { myCourses } from '../../data/academyData';
import { useLanguage } from '../../context/LanguageContext';

const MyCourses = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="space-y-4 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-[#15192c]">
          {t('academy.learningPath', 'My Learning Path')}
        </h1>
        <p className="text-sm font-medium text-[#9A8A8E]">
          {t('academy.trackProgressDesc', 'Track your progress and achieve your certifications.')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[3rem] p-8 border border-rose-100 shadow-sm space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl relative">
                <Trophy size={40} className="text-[#ff69b4]" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#15192c] rounded-full flex items-center justify-center text-white border-2 border-white">
                  <span className="text-xs font-black">L1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#15192c]">
                  {t('academy.levelPrefix', 'Level')} 1: {t('academy.active', 'Active')}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
                  {t('courses.Level 1: Wellness Awareness', 'Wellness Awareness')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
                 <span>{t('academy.pathProgress', 'Path Progress')}</span>
                 <span>45%</span>
               </div>
               <div className="h-3 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '45%' }}
                   className="h-full bg-[#ff69b4] rounded-full"
                 />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50/50 rounded-2xl text-center">
                 <p className="text-2xl font-black text-[#ff69b4]">2</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                   {t('academy.coursesLabel', 'Courses')}
                 </p>
              </div>
              <div className="p-4 bg-rose-50/50 rounded-2xl text-center">
                 <p className="text-2xl font-black text-[#15192c]">1</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                   {t('academy.certifiedLabel', 'Certified')}
                 </p>
              </div>
            </div>
          </div>

          <div className="bg-[#15192c] rounded-[2.5rem] p-8 text-white">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Award size={24} className="text-[#ff69b4]" />
                </div>
                <div>
                   <h4 className="font-black">{t('academy.nextMilestone', 'Next Milestone')}</h4>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest">
                     {t('academy.wellnessProfessional', 'Wellness Professional')}
                   </p>
                </div>
             </div>
             <p className="text-sm font-medium text-white/60 mb-6 italic">
               {t('academy.milestoneQuote', '"Sakhi, completing Level 1 will unlock your first professional badge!"')}
             </p>
             <button 
               onClick={() => navigate('/academy')}
               className="w-full py-4 bg-[#ff69b4] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
             >
                {t('academy.exploreMore', 'Explore More')}
             </button>
          </div>
        </div>

        {/* Course List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-black text-[#15192c]">{t('academy.enrolledCourses', 'Enrolled Courses')}</h3>
             <button onClick={() => navigate('/academy')} className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:underline">
               {t('academy.viewAll', 'View All')}
             </button>
          </div>

          <div className="space-y-4">
            {myCourses.map((course) => (
              <motion.div 
                key={course.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-rose-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group"
              >
                <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden relative shrink-0">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20" />
                    {course.status === 'completed' ? (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                         <Award size={16} />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                            <Play size={20} fill="white" />
                         </div>
                      </div>
                    )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-black text-[#15192c] group-hover:text-[#ff69b4] transition-colors cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}`)}>
                          {t('courses.' + course.title, course.title)}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] flex items-center gap-2">
                           <Clock size={12} /> {t('academy.lastAccessed', 'Last accessed')} {t('time.' + course.lastAccessed, course.lastAccessed)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        course.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-[#ff69b4]/10 text-[#ff69b4] border-[#ff69b4]/20'
                      }`}>
                        {t('status.' + course.status, course.status)}
                      </span>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
                        <span>{t('academy.progressLabel', 'Progress')}</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
                        <div 
                          className="h-full bg-[#ff69b4] rounded-full transition-all duration-1000" 
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                   </div>

                   <div className="flex flex-col gap-1 pt-2">
                     <div className="flex flex-wrap gap-4">
                        {course.status === 'completed' ? (
                          course.quizPassed === false ? (
                            <button 
                              onClick={() => navigate(`/academy/quiz/${course.id}`)}
                              className="flex items-center gap-2 px-6 py-3 bg-[#ff69b4] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all shadow-lg"
                            >
                               {t('academy.takeQuiz', 'Take Quiz')} <ArrowRight size={12} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/academy/certificate/${course.id}`)}
                              className="flex items-center gap-2 px-6 py-3 bg-[#15192c] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all shadow-lg"
                            >
                               {t('academy.viewCertificate', 'View Certificate')} <Award size={12} />
                            </button>
                          )
                        ) : (
                          <button 
                            onClick={() => navigate(`/academy/course/${course.id}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#ff69b4] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all shadow-lg"
                          >
                             {t('academy.continueLearning', 'Continue Learning')} <ArrowRight size={12} />
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/academy/course/${course.id}`)}
                          className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-[#15192c] rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-100 transition-all"
                        >
                           {t('academy.courseInfo', 'Course Info')} <BookOpen size={12} />
                        </button>
                     </div>
                     {course.status === 'completed' && course.quizPassed === false && (
                       <p className="text-xs text-gray-400 mt-1">
                         {t('academy.completeQuizTip', 'Complete the quiz to unlock your certificate')}
                       </p>
                     )}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-8 rounded-[3rem] bg-rose-50/50 border-2 border-dashed border-rose-200 flex flex-col items-center text-center space-y-4">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#C4A0AC]">
                <PlusCircle size={32} />
             </div>
             <div>
                <h4 className="font-black text-[#15192c]">{t('academy.findNextCourse', 'Find your next course')}</h4>
                <p className="text-xs text-[#9A8A8E] font-medium">{t('academy.findNextCourseDesc', 'Add more skills to your wellness profile.')}</p>
             </div>
             <button 
               onClick={() => navigate('/academy')}
               className="px-8 py-3 bg-white border border-rose-200 rounded-xl font-black uppercase tracking-widest text-[9px] hover:border-[#ff69b4] hover:text-[#ff69b4] transition-all"
             >
                {t('academy.browseAcademy', 'Browse Academy')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
