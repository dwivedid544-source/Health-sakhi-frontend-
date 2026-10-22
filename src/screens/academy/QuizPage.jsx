import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Timer,
  Info,
  ArrowRight
} from 'lucide-react';
import { quizData } from '../../data/academyData';
import { useLanguage } from '../../context/LanguageContext';

const QuizPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const quiz = quizData[id] || quizData[101];
  const questions = quiz.questions;

  const handleNext = () => {
    if (selectedOption === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const passed = score >= questions.length * 0.7;
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-12 px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[3rem] p-12 shadow-2xl border border-rose-100 space-y-8"
        >
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
             {passed ? <Award size={48} className="text-[#ff69b4]" /> : <XCircle size={48} className="text-red-400" />}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#15192c]">
              {passed ? t('academy.passedQuizTitle', 'Congratulations, Sakhi!') : t('academy.failedQuizTitle', 'Not quite there yet')}
            </h2>
            <p className="text-sm font-medium text-[#9A8A8E]">
              {passed ? t('academy.passedQuizDesc', 'You have successfully passed the assessment.') : t('academy.failedQuizDesc', 'We recommend reviewing the course material and trying again.')}
            </p>
          </div>

          <div className="flex justify-center gap-12 pt-4">
             <div className="text-center">
                <p className="text-4xl font-black text-[#15192c]">{score}/{questions.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('academy.yourScore', 'Your Score')}</p>
             </div>
             <div className="text-center">
                <p className="text-4xl font-black text-[#ff69b4]">{Math.round((score/questions.length)*100)}%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('academy.percentage', 'Percentage')}</p>
             </div>
          </div>

          <div className="space-y-4 pt-8">
            {passed ? (
              <button 
                onClick={() => navigate(`/academy/certificate/${id}`)}
                className="w-full py-5 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all"
              >
                {t('academy.claimCertificate', 'Claim Your Certificate')}
              </button>
            ) : (
              <button 
                onClick={() => {
                   setCurrentQuestion(0);
                   setSelectedOption(null);
                   setScore(0);
                   setShowResults(false);
                }}
                className="w-full py-5 bg-[#15192c] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all"
              >
                {t('academy.retakeQuiz', 'Retake Quiz')}
              </button>
            )}
            <button 
              onClick={() => navigate('/academy/my-courses')}
              className="w-full py-5 bg-rose-50 text-[#15192c] rounded-2xl font-black uppercase tracking-widest text-xs border border-rose-100 hover:bg-rose-100 transition-all"
            >
              {t('academy.backToCourses', 'Back to Courses')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-12">
         <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#15192c]">{t('quiz.' + quiz.title, quiz.title)}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('academy.level1Assessment', 'Level 1 Certification Assessment')}</p>
         </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-[#15192c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
            <Timer size={14} className="text-[#ff69b4]" /> 09:45
         </div>
      </div>

      <div className="mb-8 space-y-2">
         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
            <span>{t('academy.questionPrefix', 'Question')} {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(((currentQuestion)/questions.length)*100)}% {t('academy.completeStatus', 'Complete')}</span>
         </div>
         <div className="h-2 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${((currentQuestion)/questions.length)*100}%` }}
               className="h-full bg-[#ff69b4] rounded-full"
            />
         </div>
      </div>

      <motion.div 
        key={currentQuestion}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="bg-white rounded-[3rem] p-8 md:p-12 border border-rose-100 shadow-sm space-y-10"
      >
        <h3 className="text-xl md:text-2xl font-black text-[#15192c] leading-tight">
           {t('quiz.' + questions[currentQuestion].question, questions[currentQuestion].question)}
        </h3>

        <div className="space-y-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                selectedOption === index 
                  ? 'border-[#ff69b4] bg-[#ff69b4]/5' 
                  : 'border-rose-50 bg-rose-50/20 hover:border-rose-200'
              }`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                   selectedOption === index ? 'bg-[#ff69b4] text-white' : 'bg-white text-[#C4A0AC] shadow-sm'
                 }`}>
                    {String.fromCharCode(65 + index)}
                 </div>
                 <span className={`font-bold ${selectedOption === index ? 'text-[#ff69b4]' : 'text-[#15192c]'}`}>
                   {t('quiz.' + option, option)}
                 </span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedOption === index ? 'border-[#ff69b4]' : 'border-[#C4A0AC]/30'
              }`}>
                 {selectedOption === index && <div className="w-3 h-3 bg-[#ff69b4] rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-6 border-t border-rose-50">
           <button 
             disabled={currentQuestion === 0}
             onClick={() => setCurrentQuestion(currentQuestion - 1)}
             className="flex items-center gap-2 px-8 py-4 text-[#C4A0AC] font-black uppercase tracking-widest text-[10px] hover:text-[#15192c] disabled:opacity-30"
           >
              <ChevronLeft size={18} /> {t('academy.previous', 'Previous')}
           </button>
           <button 
             disabled={selectedOption === null}
             onClick={handleNext}
             className="flex items-center gap-2 px-10 py-4 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-100 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
           >
              {currentQuestion === questions.length - 1 ? t('academy.finishQuiz', 'Finish Assessment') : t('academy.nextQuestion', 'Next Question')} <ChevronRight size={18} />
           </button>
        </div>
      </motion.div>

      <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
         <Info size={20} className="text-amber-500 shrink-0" />
         <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
            <span className="font-bold">{t('academy.protip', 'Pro-tip:')}</span> {t('academy.quizTipDesc', 'Make sure to read each option carefully. There might be subtle differences. You need 70% to pass and unlock your certificate.')}
         </p>
      </div>
    </div>
  );
};

export default QuizPage;
