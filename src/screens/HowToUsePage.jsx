import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  UserPlus, 
  Search, 
  Calendar, 
  MessageCircle, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Video
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HowToUsePage = () => {
    const steps = [
        {
            id: 1,
            title: 'Create Your Profile',
            desc: 'Sign up in seconds. Tell us about your wellness goals, concerns, and preferences to personalize your experience.',
            icon: UserPlus,
            color: 'bg-rose-50 text-[#ff69b4]'
        },
        {
            id: 2,
            title: 'Explore the Library',
            desc: 'Access hundreds of modules on PCOD, mental health, and grooming. Watch AI-powered videos or read interactive books.',
            icon: Search,
            color: 'bg-purple-50 text-[#9C7BB8]'
        },
        {
            id: 3,
            title: 'Book a Session',
            desc: 'Connect with expert advisors for 1-on-1 consultations. Choose a time that works for you and start healing.',
            icon: Calendar,
            color: 'bg-blue-50 text-[#79A7C1]'
        },
        {
            id: 4,
            title: 'Chat with AI Sakhi',
            desc: 'Have a quick question? Our AI Sakhi is available 24/7 to provide gentle guidance and emotional support.',
            icon: MessageCircle,
            color: 'bg-emerald-50 text-[#79C1A7]'
        }
    ];

    const faqs = [
        { q: 'Is my data safe?', a: 'Absolutely. We use bank-grade encryption to ensure your personal health data remains private and secure.' },
        { q: 'Can I cancel my subscription?', a: 'Yes, you can manage or cancel your Sakhi Premium subscription anytime from your profile settings.' },
        { q: 'How do I join a booked session?', a: 'Simply go to your "Sessions" tab in the dashboard and click "Join Now" at the scheduled time.' }
    ];

    return (
        <div className="w-full bg-[#FFF7F8] min-h-screen font-sans">
            {/* Header / Hero */}
            <section className="relative py-12 overflow-hidden hero-gradient">
                <div className="w-full px-4 sm:px-[6%] lg:px-[10%] relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md rounded-full mb-6 border border-white/20"
                    >
                        <span className="text-[9px] font-black text-[#D17B88] uppercase tracking-[0.2em]">Platform Guide</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black text-[#15192c] mb-6 tracking-tight leading-tight"
                    >
                        Mastering Your <br />
                        <span className="text-[#ff69b4]">Wellness Portal</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base text-[#6B5E63] max-w-lg mx-auto font-medium opacity-80 mb-8 leading-relaxed"
                    >
                        Learn how to navigate Health Sakhi, access content, and connect with experts in just a few minutes.
                    </motion.p>
                </div>
            </section>

            {/* Video Feature */}
            <section className="pb-16 pt-4">
                <div className="w-full px-4 sm:px-[6%] lg:px-[10%]">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative w-full max-w-[650px] mx-auto rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] group bg-white p-3 sm:p-4"
                    >
                        <div className="aspect-video bg-black rounded-[1.5rem] overflow-hidden relative border border-rose-50 shadow-inner">
                            <video 
                                controls 
                                playsInline
                                className="w-full h-full object-cover"
                                poster="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=2000"
                            >
                                <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Steps Grid */}
            <section className="py-16 bg-white">
                <div className="w-full px-4 sm:px-[6%] lg:px-[10%]">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-black text-[#15192c] mb-3 tracking-tight">Simple roadmap</h2>
                         <p className="text-sm text-[#6B5E63] font-medium opacity-70">Follow these easy steps to get started.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={step.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-[2rem] bg-[#FFF7F8] border border-rose-50 hover:shadow-lg transition-all hover:-translate-y-1 group"
                            >
                                <div className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform`}>
                                    <step.icon size={20} />
                                </div>
                                <h3 className="text-lg font-black text-[#15192c] mb-2 tracking-[0.01em]">{step.title}</h3>
                                <p className="text-xs font-semibold text-[#6B5E63] leading-relaxed opacity-80">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* In-Depth Features */}
            <section className="py-24 bg-[#FFF7F8]/50">
                <div className="w-full px-4 sm:px-[6%] lg:px-[10%]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <div className="inline-block px-4 py-1.5 bg-[#F3EAFC] rounded-full">
                                <span className="text-[10px] font-black text-[#9079C1] uppercase tracking-[0.2em]">Member Benefits</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-[#15192c] leading-tight">
                                Personalized wellness <br />
                                at your <span className="text-[#9C7BB8]">fingertips.</span>
                            </h2>
                            
                            <div className="space-y-6">
                                {[
                                    { t: "Unified Dashboard", d: "View your appointments, progress, and daily tips in one place." },
                                    { t: "Smart Content Search", d: "Filter by category, expert, or mood to find exactly what you need." },
                                    { t: "Wellness Points", d: "Earn badges and rewards as you complete healing modules." }
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 bg-[#9C7BB8] rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                                            <CheckCircle size={14} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#15192c] text-lg">{f.t}</p>
                                            <p className="text-[#6B5E63] font-medium opacity-75">{f.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff69b4]/20 to-purple-500/20 blur-[100px] -z-10"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=2000" 
                                alt="Dashboard Preview" 
                                className="rounded-[3rem] shadow-2xl border-b-[12px] border-white"
                            />
                            <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-rose-50 hidden sm:block">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#C4A0AC] uppercase tracking-widest">Trust Store</p>
                                        <p className="text-lg font-black text-[#15192c]">100% Secure</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-white">
                <div className="w-full px-4 sm:px-[6%] lg:px-[10%]">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-[#15192c] mb-2 tracking-tight">Quick Answers</h2>
                            <p className="text-xs text-[#6B5E63] font-medium opacity-70">Common software questions.</p>
                        </div>
                        
                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <details key={idx} className="group bg-[#FFF7F8] rounded-[1.5rem] border border-rose-50 overflow-hidden">
                                    <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                                        <span className="text-base font-black text-[#15192c]">{faq.q}</span>
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-rose-300 group-open:rotate-180 transition-transform">
                                            <ArrowRight size={14} />
                                        </div>
                                    </summary>
                                    <div className="px-6 pb-6 text-sm text-[#6B5E63] font-medium leading-relaxed">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16">
                <div className="w-full px-4 sm:px-[6%] lg:px-[10%]">
                    <div className="bg-[#120911] rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff69b4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">Ready to begin?</h2>
                        <Link 
                            to="/login"
                            onClick={() => localStorage.removeItem('hs_member_plan')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#120911] rounded-xl font-black text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Get Started Now <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowToUsePage;
