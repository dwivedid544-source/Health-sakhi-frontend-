import React, { useState } from 'react';
import { Bookmark, MessageSquare, Sparkles, SkipBack, SkipForward, Play, Pause, Maximize, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VideoScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-health-gray font-medium hover:text-health-dark transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Library
      </button>

      {/* Video Player Section */}
      <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl group">
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
          alt="Video Thumbnail"
          className="w-full h-full object-cover opacity-60"
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 bg-health-green text-white rounded-full flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110 active:scale-95"
          >
            {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
        </div>

        {/* Video Controls Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
          <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer overflow-hidden">
            <div className="w-1/3 h-full bg-health-green"></div>
          </div>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-6">
              <button className="hover:text-health-green"><SkipBack size={24} fill="currentColor" /></button>
              <button className="hover:text-health-green"><SkipForward size={24} fill="currentColor" /></button>
              <span className="text-sm font-mono">04:12 / 12:45</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:text-health-green"><Settings size={20} /></button>
              <button className="hover:text-health-green"><Maximize size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-health-green/10 text-health-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Session 01</span>
              <span className="text-health-gray text-sm">• 12:45 mins</span>
              <span className="text-health-gray text-sm">• 4.8 ★ (1.2k reviews)</span>
            </div>
            <h1 className="text-3xl font-bold text-health-dark mb-4 leading-tight">Hormonal Balance: The Natural Way</h1>
            <p className="text-health-gray leading-relaxed">
              In this session, we explore the science of hormonal fluctuations and how diet, and lifestyle changes can help you maintain balance throughout your cycle.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="btn-secondary py-2 border-black/10 text-health-dark hover:bg-black/5">
              <Bookmark size={18} />
              Save for Later
            </button>
            <button className="btn-secondary py-2 border-black/10 text-health-dark hover:bg-black/5">
              <Sparkles size={18} />
              Ask AI about this
            </button>
          </div>
        </div>

        {/* Side Panel (Notes/Chat) */}
        <div className="w-full md:w-80 space-y-4">
          <div className="flex border-b border-black/5">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'notes' ? 'border-health-green text-health-green' : 'border-transparent text-health-gray'}`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'chat' ? 'border-health-green text-health-green' : 'border-transparent text-health-gray'}`}
            >
              Sakhi Chat
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 min-h-[300px] border border-black/5 shadow-sm">
            {activeTab === 'notes' ? (
              <div className="space-y-4">
                <p className="text-xs text-health-gray italic">Add your personal notes at specific timestamps</p>
                <div className="space-y-3">
                  <div className="p-3 bg-health-soft rounded-xl">
                    <span className="text-[10px] font-bold text-health-green">02:15</span>
                    <p className="text-sm text-health-dark mt-1">Found the part about Cortisol very interesting.</p>
                  </div>
                </div>
                <textarea
                  placeholder="Type a new note..."
                  className="w-full h-24 p-4 rounded-xl bg-health-soft/50 border-none outline-none text-sm resize-none focus:ring-2 focus:ring-health-green/20"
                ></textarea>
                <button className="btn-primary w-full py-3 text-sm">Save Note</button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 mb-4">
                  <div className="bg-health-green/5 p-3 rounded-2xl rounded-tl-none mr-8">
                    <p className="text-xs text-health-dark">Hello  ! I'm your AI Sakhi. Need clarification on anything in the video?</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask Sakhi..."
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-health-soft/50 border-none outline-none text-sm"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-health-green text-white rounded-lg flex items-center justify-center">
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoScreen;
